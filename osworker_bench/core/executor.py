"""
Execution Strategies

Handles sequential and parallel execution of tasks.
Replaces inconsistent parallelization across scripts.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from multiprocessing import Process, Manager, current_process
from types import SimpleNamespace
from typing import Any, Callable, Dict, List, Optional, TYPE_CHECKING
import json
import logging
import os
import re
import signal
import sys
import time

from core.config import ExperimentConfig
from core.runners import BaseRunner, EpisodeResult

try:
    from lib_results_logger import log_task_completion, log_task_error
except ImportError:
    log_task_completion = None
    log_task_error = None

if TYPE_CHECKING:
    from desktop_env.desktop_env import DesktopEnv

logger = logging.getLogger("desktopenv.executor")


@dataclass
class Task:
    """A single task to execute."""
    domain: str
    example_id: str
    config_path: str


def resolve_task_config_path(config_path: str) -> str:
    """Resolve legacy <task_id>.json paths to <task_id>/task.json when needed."""
    if os.path.exists(config_path):
        return config_path

    root, ext = os.path.splitext(config_path)
    if ext == ".json":
        task_json = os.path.join(root, "task.json")
        if os.path.exists(task_json):
            return task_json

    return config_path


def load_task_config(config_path: str) -> tuple[Dict[str, Any], str]:
    resolved_path = resolve_task_config_path(config_path)
    with open(resolved_path, "r", encoding="utf-8") as f:
        task_config = json.load(f)

    if isinstance(task_config, dict) and task_config.get("legacy_stub"):
        task_path = task_config.get("task_path")
        if not isinstance(task_path, str) or not task_path:
            raise ValueError(f"Legacy task stub missing task_path: {resolved_path}")
        resolved_path = os.path.abspath(os.path.join(os.path.dirname(resolved_path), task_path))
        with open(resolved_path, "r", encoding="utf-8") as f:
            task_config = json.load(f)

    if not isinstance(task_config, dict):
        raise ValueError(f"Task config must be a JSON object: {resolved_path}")

    task_config["_task_config_path"] = os.path.abspath(resolved_path)
    return task_config, resolved_path


class ExecutionStrategy(ABC):
    """Abstract base class for execution strategies."""

    @abstractmethod
    def execute(
        self,
        tasks: List[Task],
        config: ExperimentConfig,
        runner_factory: Callable[[], BaseRunner],
        agent_factory: Callable[[], Any],
        env_factory: Callable[[], "DesktopEnv"],
    ) -> List[EpisodeResult]:
        """
        Execute tasks and return results.

        Args:
            tasks: List of tasks to execute
            config: Experiment configuration
            runner_factory: Factory function for creating runners
            agent_factory: Factory function for creating agents
            env_factory: Factory function for creating environments

        Returns:
            List of episode results
        """
        pass


class SequentialExecutor(ExecutionStrategy):
    """Execute tasks sequentially in a single process."""

    def execute(
        self,
        tasks: List[Task],
        config: ExperimentConfig,
        runner_factory: Callable[[], BaseRunner],
        agent_factory: Callable[[], Any],
        env_factory: Callable[[], "DesktopEnv"],
    ) -> List[EpisodeResult]:
        """Execute tasks one by one."""
        results = []
        env = None
        agent = None

        try:
            logger.info("Creating environment...")
            env = env_factory()
            if agent_factory is not None:
                logger.info("Creating agent...")
                agent = agent_factory()
            else:
                logger.info("No agent factory provided (eval_only mode), skipping agent creation")
            logger.info("Creating runner...")
            runner = runner_factory()

            for i, task in enumerate(tasks):
                logger.info(f"Running task {i + 1}/{len(tasks)}: {task.domain}/{task.example_id}")
                result = self._run_task(task, config, runner, agent, env)
                results.append(result)
                logger.info(f"Task {task.example_id} completed with score: {result.score}")

        except KeyboardInterrupt:
            logger.info("Interrupted by user")
        except Exception as e:
            logger.error(f"Executor error: {e}")
            import traceback
            logger.error(traceback.format_exc())
        finally:
            if env:
                try:
                    logger.info("Closing environment...")
                    env.close()
                except Exception as e:
                    logger.error(f"Error closing environment: {e}")

        return results

    def _run_task(
        self,
        task: Task,
        config: ExperimentConfig,
        runner: BaseRunner,
        agent: Any,
        env: "DesktopEnv",
    ) -> EpisodeResult:
        """Run a single task."""
        # Load task config
        task_config, _ = load_task_config(task.config_path)

        # Add domain to task_config if not present
        if "domain" not in task_config:
            task_config["domain"] = task.domain

        # Build result directory
        result_dir = os.path.join(
            config.run.result_dir,
            config.agent.action_space,
            config.agent.observation_type,
            config.agent.model,
            task.domain,
            task.example_id,
        )
        os.makedirs(result_dir, exist_ok=True)

        result = runner.run_episode(agent, env, task_config, result_dir)

        # Log to summary/results.json (align with run_single_example_evocua)
        if log_task_completion is not None and log_task_error is not None:
            args = SimpleNamespace(result_dir=config.run.result_dir)
            if result.error:
                log_task_error(task_config, result.error, result_dir, args)
            else:
                log_task_completion(task_config, result.score, result_dir, args)

        return result


class MultiProcessExecutor(ExecutionStrategy):
    """Execute tasks in parallel using multiple processes."""

    def __init__(self, num_workers: int = 1, restart_on_death: bool = True):
        """
        Initialize the executor.

        Args:
            num_workers: Number of worker processes
            restart_on_death: Whether to restart workers that die
        """
        self.num_workers = num_workers
        self.restart_on_death = restart_on_death
        self._processes: List[Process] = []
        self._is_terminating = False

    def execute(
        self,
        tasks: List[Task],
        config: ExperimentConfig,
        runner_factory: Callable[[], BaseRunner],
        agent_factory: Callable[[], Any],
        env_factory: Callable[[], "DesktopEnv"],
    ) -> List[EpisodeResult]:
        """Execute tasks in parallel."""
        with Manager() as manager:
            task_queue = manager.Queue()
            results_list = manager.list()

            # Populate task queue
            for task in tasks:
                task_queue.put(task)

            logger.info(f"Starting {self.num_workers} worker processes for {len(tasks)} tasks")

            # Start worker processes
            for i in range(self.num_workers):
                p = Process(
                    target=self._worker,
                    args=(
                        task_queue,
                        results_list,
                        config,
                        runner_factory,
                        agent_factory,
                        env_factory,
                    ),
                    name=f"Worker-{i + 1}",
                )
                p.daemon = True
                p.start()
                self._processes.append(p)
                logger.info(f"Started process {p.name} with PID {p.pid}")

            # Monitor and restart workers
            try:
                self._monitor_workers(
                    task_queue,
                    results_list,
                    config,
                    runner_factory,
                    agent_factory,
                    env_factory,
                )
            except KeyboardInterrupt:
                logger.info("Interrupted, shutting down workers...")
                self._shutdown()

            return list(results_list)

    def _worker(
        self,
        task_queue,
        results_list,
        config: ExperimentConfig,
        runner_factory: Callable,
        agent_factory: Callable,
        env_factory: Callable,
    ):
        """Worker process main function."""
        env = None
        process_name = current_process().name

        # Setup signal handler for graceful shutdown
        def signal_handler(signum, frame):
            logger.info(f"[{process_name}] Received signal {signum}, shutting down...")
            if env:
                try:
                    env.close()
                except Exception:
                    pass
            sys.exit(0)

        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)

        try:
            # Stagger env creation to reduce lock contention when many workers start at once
            # (e.g. 50 workers competing for docker_port_allocation.lck)
            if "Restart" not in process_name:
                match = re.search(r"\d+", process_name)
                worker_idx = int(match.group()) if match else 1
                stagger_sec = min((worker_idx - 1) * 0.5, 30)
                if stagger_sec > 0:
                    logger.info(f"[{process_name}] Staggering env creation by {stagger_sec:.1f}s")
                    time.sleep(stagger_sec)
            logger.info(f"[{process_name}] Creating environment...")
            env = env_factory()
            if agent_factory is not None:
                logger.info(f"[{process_name}] Creating agent...")
                agent = agent_factory()
            else:
                agent = None
                logger.info(f"[{process_name}] No agent factory (eval_only mode)")
            logger.info(f"[{process_name}] Creating runner...")
            runner = runner_factory()

            while True:
                try:
                    # Get next task with timeout
                    task = task_queue.get(timeout=5)
                except Exception:
                    # Queue empty or timeout
                    if task_queue.empty():
                        logger.info(f"[{process_name}] Queue empty, exiting")
                        break
                    continue

                try:
                    logger.info(f"[{process_name}] Running task: {task.domain}/{task.example_id}")
                    result = self._run_task(task, config, runner, agent, env)
                    results_list.append(result)
                    logger.info(
                        f"[{process_name}] Task {task.example_id} completed with score: {result.score}"
                    )
                except Exception as e:
                    logger.error(f"[{process_name}] Task {task.domain}/{task.example_id} failed: {e}")
                    import traceback
                    logger.error(traceback.format_exc())
                    # Add failed result
                    results_list.append(
                        EpisodeResult(
                            task_id=task.example_id,
                            domain=task.domain,
                            score=0.0,
                            steps=0,
                            success=False,
                            error=str(e),
                        )
                    )

        except Exception as e:
            logger.error(f"[{process_name}] Worker error: {e}")
            import traceback
            logger.error(traceback.format_exc())
        finally:
            if env:
                try:
                    logger.info(f"[{process_name}] Closing environment...")
                    env.close()
                except Exception as e:
                    logger.error(f"[{process_name}] Error closing environment: {e}")

    def _run_task(
        self,
        task: Task,
        config: ExperimentConfig,
        runner: BaseRunner,
        agent: Any,
        env: "DesktopEnv",
    ) -> EpisodeResult:
        """Run a single task."""
        # Load task config
        task_config, _ = load_task_config(task.config_path)

        # Add domain to task_config if not present
        if "domain" not in task_config:
            task_config["domain"] = task.domain

        # Build result directory
        result_dir = os.path.join(
            config.run.result_dir,
            config.agent.action_space,
            config.agent.observation_type,
            config.agent.model,
            task.domain,
            task.example_id,
        )
        os.makedirs(result_dir, exist_ok=True)

        result = runner.run_episode(agent, env, task_config, result_dir)

        # Log to summary/results.json (align with run_single_example_evocua)
        if log_task_completion is not None and log_task_error is not None:
            args = SimpleNamespace(result_dir=config.run.result_dir)
            if result.error:
                log_task_error(task_config, result.error, result_dir, args)
            else:
                log_task_completion(task_config, result.score, result_dir, args)

        return result

    def _monitor_workers(
        self,
        task_queue,
        results_list,
        config: ExperimentConfig,
        runner_factory: Callable,
        agent_factory: Callable,
        env_factory: Callable,
    ):
        """Monitor workers and restart dead ones."""
        # After the queue is drained we give every still-running worker a
        # generous per-worker timeout before forcefully terminating it.
        PER_WORKER_FINISH_TIMEOUT = 7200  # seconds (120 min) extend or shorten if needed

        while True:
            alive_count = 0

            for idx, p in enumerate(self._processes):
                if not p.is_alive():
                    if self.restart_on_death and not task_queue.empty():
                        logger.warning(f"Process {p.name} died, restarting...")
                        new_p = Process(
                            target=self._worker,
                            args=(
                                task_queue,
                                results_list,
                                config,
                                runner_factory,
                                agent_factory,
                                env_factory,
                            ),
                            name=f"Worker-Restart-{idx + 1}",
                        )
                        new_p.daemon = True
                        new_p.start()
                        self._processes[idx] = new_p
                        logger.info(f"Restarted process {new_p.name} with PID {new_p.pid}")
                else:
                    alive_count += 1

            if alive_count == 0:
                if task_queue.empty():
                    logger.info("All tasks completed, all workers exited.")
                else:
                    logger.error("All processes died, exiting")
                break

            # Queue drained but workers still running their last task.
            # Wait for each worker individually with a generous timeout.
            if task_queue.empty():
                logger.info(
                    "All tasks distributed, waiting for %d workers to finish "
                    "(timeout %ds per worker)...", alive_count, PER_WORKER_FINISH_TIMEOUT,
                )
                for p in self._processes:
                    if p.is_alive():
                        p.join(timeout=PER_WORKER_FINISH_TIMEOUT)
                        if p.is_alive():
                            logger.warning(
                                f"Process {p.name} didn't finish in "
                                f"{PER_WORKER_FINISH_TIMEOUT}s, terminating"
                            )
                            p.terminate()
                break

            time.sleep(5)

    def _shutdown(self):
        """Graceful shutdown of all workers."""
        self._is_terminating = True

        # Send SIGTERM to all processes
        for p in self._processes:
            if p.is_alive():
                try:
                    p.terminate()
                except Exception as e:
                    logger.error(f"Error terminating {p.name}: {e}")

        # Wait briefly for graceful shutdown
        time.sleep(2)

        # Force kill any remaining processes
        for p in self._processes:
            if p.is_alive():
                try:
                    os.kill(p.pid, signal.SIGKILL)
                except Exception as e:
                    logger.error(f"Error killing {p.name}: {e}")


def create_executor(config: ExperimentConfig) -> ExecutionStrategy:
    """
    Factory function to create executor based on config.

    Args:
        config: Experiment configuration

    Returns:
        Appropriate executor instance
    """
    if config.run.num_envs == 1:
        logger.info("Using sequential executor (num_envs=1)")
        return SequentialExecutor()
    else:
        logger.info(f"Using multi-process executor (num_envs={config.run.num_envs})")
        return MultiProcessExecutor(num_workers=config.run.num_envs)
