"""
Runner Classes

Template method pattern for different run modes.
Replaces the 8 duplicated run_single_example_* functions.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, TYPE_CHECKING
import datetime
import json
import logging
import os
import time

from core.protocols import AgentProtocol, AgentResponse
from core.config import RunConfig
from desktop_env.exceptions import ScreenshotUnavailableError, SetupFailedError

logger = logging.getLogger("desktopenv.runner")

if TYPE_CHECKING:
    from desktop_env.desktop_env import DesktopEnv

# Maximum number of full-environment restarts when the VM screenshot
# service becomes persistently unreachable during an episode.
MAX_ENV_RESTART_RETRIES = 2


@dataclass
class EpisodeResult:
    """Result of running a single episode."""
    task_id: str
    domain: str
    score: float
    steps: int
    success: bool
    trajectory: List[Dict[str, Any]] = field(default_factory=list)
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class RunnerHook:
    """Per-experiment control flow that must not become a runner subclass nor live
    inside an agent, hence composed rather than inherited.

    ``on_before_step`` / ``on_after_predict`` may return a replacement, which is how an
    experiment steers the model while the agent stays a read-only consumer. Dispatch is
    after the runner's own callbacks (observe, never preempt) and every method is a
    no-op, so hookless runs are untouched.
    """

    def on_episode_start(self, agent, env, task_config, result_dir) -> None:
        pass

    def on_before_step(self, step_idx, instruction, obs, env, result_dir):
        """Return a (possibly modified) obs; returning None leaves it unchanged."""
        return obs

    def on_after_predict(self, step_idx, instruction, obs, response):
        """Return a (possibly modified) response, after predict but BEFORE the
        actions are executed; returning None leaves it unchanged."""
        return response


class BaseRunner(ABC):
    """
    Abstract base class for all runners.

    Uses the template method pattern - subclasses override hooks,
    not the main run_episode method.
    """

    def __init__(self, config: RunConfig):
        """
        Initialize the runner.

        Args:
            config: Run configuration
        """
        self.config = config
        self._logger = logging.getLogger("desktopenv.runner")
        self._ext_hooks: List["RunnerHook"] = []

    def add_hook(self, hook: "RunnerHook") -> None:
        self._ext_hooks.append(hook)

    def run_episode(
        self,
        agent: AgentProtocol,
        env: "DesktopEnv",
        task_config: Dict[str, Any],
        result_dir: str,
    ) -> EpisodeResult:
        """
        Run a single episode.

        This is the main entry point. It implements the template method
        pattern - subclasses should override hooks, not this method.

        Args:
            agent: Agent to use
            env: Desktop environment
            task_config: Task configuration dict
            result_dir: Directory to save results

        Returns:
            EpisodeResult with score, trajectory, etc.
        """
        example_id = task_config.get("id", "unknown")
        domain = task_config.get("domain", "unknown")
        instruction = task_config.get("instruction", "")

        # Setup logging for this episode
        os.makedirs(result_dir, exist_ok=True)
        episode_logger = self._setup_episode_logger(example_id, result_dir)

        # ---- Outer retry loop: restart the whole episode when the VM
        #      screenshot service becomes persistently unreachable. ----
        for env_restart_attempt in range(MAX_ENV_RESTART_RETRIES + 1):
            # Initialize / re-initialize trajectory recording
            trajectory: List[Dict[str, Any]] = []
            step_idx = 0
            done = False
            recording_started = False

            try:
                # Tell env where to write VM evaluation files so getters
                # don't pollute the gold-standard cache directory.  This
                # must be set before reset(): reset() runs task setup, and
                # CUA-Gym initial_setup.py captures stdout/stderr into
                # env.eval_cache_dir.  Setting it after reset() causes setup
                # artifacts to be written to the previous task's result dir
                # when an env instance is reused across tasks.
                env.eval_result_dir = result_dir

                # Reset environment
                logger.info(f"Resetting environment for task {example_id}")
                env.reset(task_config=task_config)

                # Reset agent
                self._reset_agent(agent, episode_logger, env)

                # Wait for environment to be ready
                time.sleep(self.config.env_ready_wait)

                # Get initial observation
                obs = env._get_obs()

                # Save initial screenshot as step 0 (before any action)
                if obs.get("screenshot"):
                    step0_timestamp = datetime.datetime.now().strftime("%Y%m%d@%H%M%S%f")
                    step0_file = os.path.join(result_dir, f"step_0_{step0_timestamp}.png")
                    with open(step0_file, "wb") as f:
                        f.write(obs["screenshot"])

                # Pre-episode hook
                self._on_episode_start(agent, env, task_config, result_dir)
                for hook in self._ext_hooks:
                    hook.on_episode_start(agent, env, task_config, result_dir)

                # Start recording if enabled
                if self.config.record_video:
                    try:
                        recording_started = env.controller.start_recording()
                    except Exception as e:
                        logger.warning(f"Failed to start recording: {e}")
                        recording_started = False

                # Save task instruction
                self._save_instruction(instruction, result_dir)

                # Main episode loop
                while not done and step_idx < self.config.max_steps:
                    # Pre-step hook
                    obs = self._on_before_step(step_idx, obs, env, result_dir)
                    for hook in self._ext_hooks:
                        patched = hook.on_before_step(step_idx, instruction, obs, env, result_dir)
                        if patched is not None:
                            obs = patched

                    # Get agent prediction
                    response = self._get_prediction(agent, instruction, obs, step_idx)

                    # Last point where a hook can still change what the env will do.
                    for hook in self._ext_hooks:
                        patched = hook.on_after_predict(step_idx, instruction, obs, response)
                        if patched is not None:
                            response = patched

                    # Handle empty or error-like actions (align with e.g. run_single_example_evocua)
                    # Detect empty/error-sentinel actions. Anchor the error check to the
                    # START of the action string (matching OSWorld's canonical lib_run_single
                    # heuristic) instead of a substring match: a substring "error" check
                    # false-positives on legitimate action code (e.g. typing an Excel
                    # `=IFERROR(...)` formula) and would wrongly abort the episode.
                    # Adapter predict() already converts agent exceptions into actions=[];
                    # must check emptiness *before* indexing.
                    if not response.actions:
                        empty_or_error = True
                    else:
                        _a0 = str(response.actions[0]).strip().lower()
                        empty_or_error = (
                            len(response.actions) == 1
                            and (
                                _a0 == ""
                                or _a0.startswith("error")
                                or _a0.startswith("<error>")
                            )
                            and response.actions[0] not in ("FAIL", "DONE")
                        )
                    if empty_or_error:
                        if getattr(self.config, "empty_actions_break", False):
                            logger.warning(
                                f"Step {step_idx + 1}: No valid actions (empty/error), breaking episode"
                            )
                            break
                        logger.warning(f"Step {step_idx + 1}: Agent returned no actions")
                        step_idx += 1
                        continue

                    # Execute actions
                    for action in response.actions:
                        action_timestamp = datetime.datetime.now().strftime("%Y%m%d@%H%M%S%f")

                        logger.info(f"Step {step_idx + 1}: {action}")

                        # Execute the action
                        obs, reward, done, info = env.step(
                            action, self.config.sleep_after_execution
                        )

                        # Record step
                        step_record = self._record_step(
                            step_idx,
                            action_timestamp,
                            action,
                            response,
                            reward,
                            done,
                            info,
                            obs,
                            result_dir,
                        )
                        trajectory.append(step_record)

                        # Post-step hook
                        self._on_after_step(step_idx, step_record, agent, env, result_dir)

                        if done:
                            logger.info("Episode done (environment signaled)")
                            break

                    step_idx += 1

                # Wait for environment to settle
                time.sleep(self.config.settle_wait)

                # Evaluate – getters write VM result files into
                # eval_result_dir/cache/ (set after reset above).
                score = self._evaluate(env)

                # Check if evaluator config was invalid (task ran but evaluation was skipped)
                evaluator_error = None
                if not getattr(env, '_evaluator_valid', True):
                    evaluator_error = getattr(env, '_evaluator_error', 'unknown evaluator config error')
                    logger.warning(
                        "Task %s: evaluator config invalid, evaluation skipped. Error: %s",
                        example_id, evaluator_error,
                    )

                # Post-episode hook
                self._on_episode_end(agent, env, score, trajectory, result_dir)

                # Save result
                self._save_result(score, result_dir)

                # End recording
                if self.config.record_video and recording_started:
                    try:
                        env.controller.end_recording(
                            os.path.join(result_dir, "recording.mp4")
                        )
                    except Exception as e:
                        logger.warning(f"Failed to end recording: {e}")

                return EpisodeResult(
                    task_id=example_id,
                    domain=domain,
                    score=score,
                    steps=step_idx,
                    success=score > 0,
                    trajectory=trajectory,
                    error=evaluator_error,
                )

            except (ScreenshotUnavailableError, SetupFailedError) as sue:
                # ---- VM environment is unhealthy (screenshot service dead
                #      or setup failed): restart the whole environment. ----
                remaining = MAX_ENV_RESTART_RETRIES - env_restart_attempt
                logger.error(
                    "Environment unavailable (type=%s) at step %d: %s. "
                    "Environment restart attempts remaining: %d",
                    type(sue).__name__, step_idx, sue, remaining,
                )

                # End recording before restart (best-effort)
                if self.config.record_video and recording_started:
                    try:
                        env.controller.end_recording(
                            os.path.join(result_dir, "recording.mp4")
                        )
                    except Exception:
                        pass

                if remaining > 0:
                    logger.info(
                        "Forcing environment revert and restarting episode "
                        "for task %s (attempt %d/%d)...",
                        example_id,
                        env_restart_attempt + 2,
                        MAX_ENV_RESTART_RETRIES + 1,
                    )
                    # Force the environment to consider itself "used" so
                    # that the next reset() will trigger a full
                    # revert_to_snapshot + _start_emulator cycle.
                    env.is_environment_used = True
                    continue  # -> next iteration of the outer for-loop

                # All restart attempts exhausted — return an error
                # result *without* writing result.txt so the task is
                # considered unfinished and will be retried on the next run.
                logger.error(
                    "All %d environment restart attempts exhausted for "
                    "task %s. Returning error (no result.txt written).",
                    MAX_ENV_RESTART_RETRIES + 1, example_id,
                )
                return EpisodeResult(
                    task_id=example_id,
                    domain=domain,
                    score=0.0,
                    steps=step_idx,
                    success=False,
                    trajectory=trajectory,
                    error=f"Environment unavailable after {MAX_ENV_RESTART_RETRIES + 1} "
                          f"environment restarts: {sue}",
                )

            except Exception as e:
                logger.error(f"Episode failed: {e}")
                import traceback

                logger.error(traceback.format_exc())

                # Try to end recording on error
                if self.config.record_video and recording_started:
                    try:
                        env.controller.end_recording(
                            os.path.join(result_dir, "recording.mp4")
                        )
                    except Exception:
                        pass

                return EpisodeResult(
                    task_id=example_id,
                    domain=domain,
                    score=0.0,
                    steps=step_idx,
                    success=False,
                    trajectory=trajectory,
                    error=str(e),
                )

    # ============== Hooks for subclasses ==============

    def _reset_agent(
        self, agent: AgentProtocol, logger: logging.Logger, env: "DesktopEnv"
    ) -> None:
        """
        Reset the agent. Override for custom reset logic.

        Args:
            agent: Agent to reset
            logger: Episode logger
            env: Desktop environment
        """
        try:
            agent.reset(logger, vm_ip=env.vm_ip)
        except TypeError:
            try:
                agent.reset(logger)
            except TypeError:
                agent.reset()

    def _get_prediction(
        self,
        agent: AgentProtocol,
        instruction: str,
        obs: Dict,
        step_idx: int,
    ) -> AgentResponse:
        """
        Get prediction from agent. Override for custom prediction logic.

        Args:
            agent: Agent to get prediction from
            instruction: Task instruction
            obs: Current observation
            step_idx: Current step index

        Returns:
            AgentResponse with actions
        """
        return agent.predict(instruction, obs)

    def _evaluate(self, env: "DesktopEnv") -> float:
        """
        Evaluate the episode. Override to disable/customize evaluation.

        Args:
            env: Desktop environment

        Returns:
            Score (0.0 to 1.0)
        """
        return env.evaluate()

    def _on_episode_start(
        self,
        agent: AgentProtocol,
        env: "DesktopEnv",
        task_config: Dict,
        result_dir: str,
    ) -> None:
        """Hook called at episode start."""
        pass

    def _on_before_step(
        self, step_idx: int, obs: Dict, env: "DesktopEnv", result_dir: str
    ) -> Dict:
        """
        Hook called before each step. Can modify observation.

        Args:
            step_idx: Current step index
            obs: Current observation
            env: Desktop environment
            result_dir: Result directory

        Returns:
            Observation (possibly modified)
        """
        return obs

    def _on_after_step(
        self,
        step_idx: int,
        step_record: Dict,
        agent: AgentProtocol,
        env: "DesktopEnv",
        result_dir: str,
    ) -> None:
        """Hook called after each step."""
        pass

    def _on_episode_end(
        self,
        agent: AgentProtocol,
        env: "DesktopEnv",
        score: float,
        trajectory: List[Dict],
        result_dir: str,
    ) -> None:
        """Hook called at episode end."""
        pass

    # ============== Utility methods ==============

    def _setup_episode_logger(
        self, example_id: str, result_dir: str
    ) -> logging.Logger:
        """Setup logger for this episode."""
        episode_logger = logging.getLogger(f"desktopenv.episode.{example_id}")
        episode_logger.setLevel(logging.DEBUG)

        # Remove existing handlers
        for handler in episode_logger.handlers[:]:
            episode_logger.removeHandler(handler)

        handler = logging.FileHandler(
            os.path.join(result_dir, "runtime.log"), encoding="utf-8"
        )
        handler.setFormatter(
            logging.Formatter("[%(asctime)s %(levelname)s] %(message)s")
        )
        episode_logger.addHandler(handler)
        return episode_logger

    def _save_instruction(self, instruction: str, result_dir: str) -> None:
        """Save task instruction."""
        with open(os.path.join(result_dir, "task_instruction.txt"), "w") as f:
            f.write(instruction)

    def _record_step(
        self,
        step_idx: int,
        timestamp: str,
        action: Any,
        response: AgentResponse,
        reward: float,
        done: bool,
        info: Dict,
        obs: Dict,
        result_dir: str,
    ) -> Dict:
        """
        Record a step to disk and return the record.

        Args:
            step_idx: Step index
            timestamp: Action timestamp
            action: Action taken
            response: Agent response
            reward: Reward received
            done: Whether episode is done
            info: Additional info from environment
            obs: New observation
            result_dir: Result directory

        Returns:
            Step record dict
        """
        # Save screenshot
        screenshot_file = f"step_{step_idx + 1}_{timestamp}.png"
        if obs.get("screenshot"):
            with open(os.path.join(result_dir, screenshot_file), "wb") as f:
                f.write(obs["screenshot"])

        # Build record (align with e.g. run_single_example_evocua: response, metadata)
        record = {
            "step_num": step_idx + 1,
            "action_timestamp": timestamp,
            "action": str(action) if not isinstance(action, (dict, list)) else action,
            "reward": reward,
            "done": done,
            "info": info,
            "screenshot_file": screenshot_file,
        }

        # Add response info if available (response is from _get_prediction for this step)
        if response.thought:
            record["thought"] = response.thought
        if response.raw_response is not None:
            try:
                json.dumps(response.raw_response)
                raw = response.raw_response
            except (TypeError, ValueError):
                raw = str(response.raw_response)
            record["raw_response"] = record["response"] = raw  # "response" for evocua-style compatibility
        if response.metadata:
            record["metadata"] = response.metadata

        # Save to trajectory file
        with open(os.path.join(result_dir, "traj.jsonl"), "a") as f:
            f.write(json.dumps(record))
            f.write("\n")

        return record

    def _save_result(self, score: float, result_dir: str) -> None:
        """Save evaluation result."""
        with open(os.path.join(result_dir, "result.txt"), "w", encoding="utf-8") as f:
            f.write(f"{score}\n")


class TestRunner(BaseRunner):
    """
    Runner for evaluation/testing with full metrics.

    This is the default runner that runs evaluation after each episode.
    """

    def _on_episode_end(self, agent, env, score, trajectory, result_dir):
        """Log completion for potential aggregation."""
        logger.info(f"Episode completed with score: {score}")


class RolloutRunner(BaseRunner):
    """
    Runner for deployment/rollout without evaluation.

    Skips evaluation step for faster execution.
    """

    def _evaluate(self, env) -> float:
        """Skip evaluation in rollout mode."""
        logger.info("Rollout mode: skipping evaluation")
        return 0.0

    def _save_result(self, score: float, result_dir: str) -> None:
        """Save a placeholder result in rollout mode."""
        with open(os.path.join(result_dir, "result.txt"), "w", encoding="utf-8") as f:
            f.write("0.0\n")

    def _on_before_step(self, step_idx: int, obs: Dict, env, result_dir: str) -> Dict:
        """Save observation before action for training data."""
        if self.config.collect_pre_action_obs:
            timestamp = datetime.datetime.now().strftime("%Y%m%d@%H%M%S%f")
            data_dir = result_dir

            # Save pre-action screenshot
            if obs.get("screenshot"):
                obs_before_path = os.path.join(
                    data_dir, f"obs_before_step_{step_idx + 1}_{timestamp}.png"
                )
                with open(obs_before_path, "wb") as f:
                    f.write(obs["screenshot"])

            # Save pre-action accessibility tree
            if obs.get("accessibility_tree"):
                a11y_path = os.path.join(
                    data_dir, f"a11y_before_step_{step_idx + 1}_{timestamp}.txt"
                )
                with open(a11y_path, "w") as f:
                    f.write(obs["accessibility_tree"])

        return obs

class DataCollectionRunner(BaseRunner):
    """
    Runner for collecting training data.

    Saves additional data needed for training (e.g., pre-action observations).
    """

    def _on_episode_start(self, agent, env, task_config, result_dir):
        """Setup data collection directory on agent."""
        data_dir = os.path.join(result_dir, "training_data")
        os.makedirs(data_dir, exist_ok=True)

        # Set data_collection_dir on agent if it supports it
        if hasattr(agent, "data_collection_dir"):
            agent.data_collection_dir = data_dir

    def _on_before_step(self, step_idx: int, obs: Dict, env, result_dir: str) -> Dict:
        """Save observation before action for training data."""
        if self.config.collect_pre_action_obs:
            timestamp = datetime.datetime.now().strftime("%Y%m%d@%H%M%S%f")
            data_dir = os.path.join(result_dir, "training_data")

            # Save pre-action screenshot
            if obs.get("screenshot"):
                obs_before_path = os.path.join(
                    data_dir, f"obs_before_step_{step_idx + 1}_{timestamp}.png"
                )
                with open(obs_before_path, "wb") as f:
                    f.write(obs["screenshot"])

            # Save pre-action accessibility tree
            if obs.get("accessibility_tree"):
                a11y_path = os.path.join(
                    data_dir, f"a11y_before_step_{step_idx + 1}_{timestamp}.txt"
                )
                with open(a11y_path, "w") as f:
                    f.write(obs["accessibility_tree"])

        return obs

    def _record_step(
        self, step_idx, timestamp, action, response, reward, done, info, obs, result_dir
    ):
        """Extended recording for data collection."""
        record = super()._record_step(
            step_idx, timestamp, action, response, reward, done, info, obs, result_dir
        )

        # Add extra metadata for training
        if response.metadata:
            record["metadata"] = response.metadata

        # Save to training data format
        training_data_dir = os.path.join(result_dir, "training_data")
        os.makedirs(training_data_dir, exist_ok=True)

        with open(os.path.join(training_data_dir, "steps.jsonl"), "a") as f:
            f.write(json.dumps(record))
            f.write("\n")

        return record


class EvalOnlyRunner(BaseRunner):
    """
    Runner that only executes setup + evaluate, skipping agent interaction.

    Useful for verifying that:
    - Task setup (config) executes correctly
    - Evaluator configs are valid (getter + metric)
    - Cache files are downloaded / generated properly
    - Gold-standard expected values resolve without errors

    Since no agent acts, the score should normally be 0 (task not done).
    A non-zero score likely indicates an evaluator bug where the initial
    state already satisfies the success condition.
    """

    def run_episode(self, agent, env, task_config, result_dir) -> EpisodeResult:
        """Run setup + evaluate only, no agent loop."""
        example_id = task_config.get("id", "unknown")
        domain = task_config.get("domain", "unknown")
        instruction = task_config.get("instruction", "")

        os.makedirs(result_dir, exist_ok=True)
        episode_logger = self._setup_episode_logger(example_id, result_dir)

        try:
            # Tell env where to write VM evaluation/setup files.  This must
            # happen before reset(), because reset() executes task setup.
            env.eval_result_dir = result_dir

            # ---- Setup ----
            logger.info(f"[eval_only] Resetting environment for task {example_id}")
            env.reset(task_config=task_config)

            time.sleep(self.config.env_ready_wait)

            # Save initial screenshot
            obs = env._get_obs()
            if obs.get("screenshot"):
                step0_timestamp = datetime.datetime.now().strftime("%Y%m%d@%H%M%S%f")
                step0_file = os.path.join(result_dir, f"step_0_{step0_timestamp}.png")
                with open(step0_file, "wb") as f:
                    f.write(obs["screenshot"])

            # Save instruction
            self._save_instruction(instruction, result_dir)

            # ---- Evaluate ----
            logger.info(f"[eval_only] Running evaluation for task {example_id}")
            time.sleep(self.config.settle_wait)
            score = self._evaluate(env)

            # Check evaluator validity
            evaluator_error = None
            if not getattr(env, '_evaluator_valid', True):
                evaluator_error = getattr(env, '_evaluator_error', 'unknown evaluator config error')
                logger.warning(
                    "[eval_only] Task %s: evaluator config invalid. Error: %s",
                    example_id, evaluator_error,
                )

            self._save_result(score, result_dir)

            # A non-zero score without any agent action is suspicious
            if score > 0:
                logger.warning(
                    "[eval_only] Task %s scored %.2f WITHOUT agent actions! "
                    "This may indicate an evaluator bug (initial state already "
                    "satisfies the success condition).",
                    example_id, score,
                )

            logger.info(f"[eval_only] Task {example_id} done — score={score}")

            return EpisodeResult(
                task_id=example_id,
                domain=domain,
                score=score,
                steps=0,
                success=score > 0,
                trajectory=[],
                error=evaluator_error,
                metadata={"mode": "eval_only"},
            )

        except Exception as e:
            logger.error(f"[eval_only] Task {example_id} failed: {e}")
            import traceback
            logger.error(traceback.format_exc())

            return EpisodeResult(
                task_id=example_id,
                domain=domain,
                score=0.0,
                steps=0,
                success=False,
                trajectory=[],
                error=str(e),
                metadata={"mode": "eval_only"},
            )


class HumanRunner(BaseRunner):
    """
    Runner for human evaluation mode.

    Sets up environment but doesn't run agent actions.
    Used for evaluating human performance on tasks.
    """

    def run_episode(self, agent, env, task_config, result_dir) -> EpisodeResult:
        """Simplified episode for human evaluation."""
        example_id = task_config.get("id", "unknown")
        domain = task_config.get("domain", "unknown")
        instruction = task_config.get("instruction", "")

        os.makedirs(result_dir, exist_ok=True)
        episode_logger = self._setup_episode_logger(example_id, result_dir)

        try:
            # Set before reset(), since reset() may execute setup scripts that
            # write CUA-Gym stdout/stderr captures into env.eval_cache_dir.
            env.eval_result_dir = result_dir

            # Reset environment
            env.reset(task_config=task_config)
            time.sleep(self.config.env_ready_wait)

            # Get and save initial state
            obs = env._get_obs()
            if obs.get("screenshot"):
                with open(os.path.join(result_dir, "initial_state.png"), "wb") as f:
                    f.write(obs["screenshot"])

            # Save instruction
            self._save_instruction(instruction, result_dir)

            with open(os.path.join(result_dir, "traj.jsonl"), "a") as f:
                f.write(
                    json.dumps(
                        {"instruction": instruction, "initial_state": "initial_state.png"}
                    )
                )
                f.write("\n")

            # Wait for human to complete task, then evaluate
            # In practice, this would be called after human interaction
            score = env.evaluate()
            self._save_result(score, result_dir)

            return EpisodeResult(
                task_id=example_id,
                domain=domain,
                score=score,
                steps=0,
                success=score > 0,
                trajectory=[],
            )

        except Exception as e:
            logger.error(f"Human evaluation failed: {e}")
            return EpisodeResult(
                task_id=example_id,
                domain=domain,
                score=0.0,
                steps=0,
                success=False,
                trajectory=[],
                error=str(e),
            )


# Factory function
def create_runner(mode: str, config: RunConfig) -> BaseRunner:
    """
    Factory function to create appropriate runner.

    Args:
        mode: Run mode ("test", "rollout", "data_collection", "human", "eval_only")
        config: Run configuration

    Returns:
        Appropriate runner instance

    Raises:
        ValueError: If mode is unknown
    """
    runners = {
        "test": TestRunner,
        "rollout": RolloutRunner,
        "data_collection": DataCollectionRunner,
        "human": HumanRunner,
        "eval_only": EvalOnlyRunner,
    }

    runner_cls = runners.get(mode)
    if runner_cls is None:
        raise ValueError(f"Unknown runner mode: {mode}. Available: {list(runners.keys())}")

    return runner_cls(config)
