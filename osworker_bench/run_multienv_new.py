#!/usr/bin/env python3
"""
OSWorld Universal Evaluation Runner

A single entrypoint for running any agent on OSWorld tasks.
Replaces all model-specific scripts in other_models/.

Usage:
    # Using config file
    python run_multienv_new.py --config configs/osworker_benchmark/ui_mate.yaml

    # Using command line args
    python run_multienv_new.py --agent ui_mate --model tencent/UI-Mate-27B --mode test --num_envs 4

    # Using the UI-Mate benchmark config
    python run_multienv_new.py --config configs/osworker_benchmark/ui_mate.yaml --mode data_collection
"""

from __future__ import annotations

import json
import logging
import os
import signal
import sys
import time
from typing import Dict, List, Any

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.config import (
    ExperimentConfig,
    build_argparser,
    parse_config,
)
from core.runners import create_runner, BaseRunner
from core.executor import create_executor, Task
from core.registry import create_agent, get_registered_agents
from core.utils import setup_logging, get_unfinished_tasks, get_current_results
# Environment construction is centralized in the factory.
from core.env_factory import build_desktop_env

# Load environment variables from .env file
if os.path.exists(".env"):
    from dotenv import load_dotenv
    load_dotenv()

logger = logging.getLogger("desktopenv.main")


def build_task_list(
    test_all_meta: Dict[str, List[str]],
    config: ExperimentConfig,
) -> List[Task]:
    """
    Convert task metadata to Task objects.

    Args:
        test_all_meta: Dict mapping domain -> list of example IDs
        config: Experiment configuration

    Returns:
        List of Task objects
    """
    tasks = []
    for domain, example_ids in test_all_meta.items():
        for example_id in example_ids:
            config_path = os.path.join(
                config.run.test_config_base_dir,
                f"examples/{domain}/{example_id}.json",
            )
            tasks.append(Task(domain=domain, example_id=example_id, config_path=config_path))
    return tasks


def create_env_factory(config: ExperimentConfig):
    """
    Create factory function for DesktopEnv.

    Args:
        config: Experiment configuration

    Returns:
        Factory function that creates DesktopEnv instances
    """
    def factory():
        env_cfg = config.environment
        agent_cfg = config.agent

        return build_desktop_env(
            path_to_vm=env_cfg.path_to_vm,
            action_space=agent_cfg.action_space,
            provider_name=env_cfg.provider_name,
            region=env_cfg.region,
            snapshot_name=env_cfg.snapshot_name,
            screen_size=(env_cfg.screen_width, env_cfg.screen_height),
            headless=env_cfg.headless,
            os_type=env_cfg.os_type,
            enable_proxy=env_cfg.enable_proxy,
            client_password=env_cfg.client_password,
            cache_dir=env_cfg.cache_dir,
            force_proxy=env_cfg.force_proxy,
        )

    return factory


def create_agent_factory(config: ExperimentConfig):
    """
    Create factory function for agent.

    Args:
        config: Experiment configuration

    Returns:
        Factory function that creates agent instances
    """
    def factory():
        agent_cfg = config.agent
        env_cfg = config.environment
        run_cfg = config.run
        # Base kwargs for all agents
        kwargs = {
            "name": agent_cfg.name,
            "model": agent_cfg.model,
            "action_space": agent_cfg.action_space,
            "observation_type": agent_cfg.observation_type,
            "max_tokens": agent_cfg.max_tokens,
            "temperature": agent_cfg.temperature,
            "top_p": agent_cfg.top_p,
            "max_trajectory_length": agent_cfg.max_trajectory_length,
            "client_password": env_cfg.client_password,
            "max_steps": run_cfg.max_steps,
            "screen_size": (env_cfg.screen_width, env_cfg.screen_height),
            **agent_cfg.extra,
        }
        return create_agent(**kwargs)

    return factory


def create_runner_factory(config: ExperimentConfig):
    """
    Create factory function for runner.

    Args:
        config: Experiment configuration

    Returns:
        Factory function that creates runner instances
    """
    def factory():
        runner = create_runner(config.run.mode, config.run)
        # Lazy import so runs without guidance never load workflow.
        if config.agent.extra.get("enable_demo_in_the_loop"):
            from workflow import create_workflow_hook
            runner.add_hook(create_workflow_hook(config))
        return runner

    return factory


def main():
    """Main entry point."""
    # Build argument parser
    parser = build_argparser()

    # Parse arguments
    args = parser.parse_args()

    # Build config from args
    config = parse_config(args)
    # Setup logging — store logs alongside results in summary dir
    log_dir = os.path.join(config.run.result_dir, "summary")
    os.makedirs(log_dir, exist_ok=True)
    setup_logging(config.run.log_level, log_dir=log_dir)

    logger.info("=" * 60)
    logger.info("OSWorld Universal Evaluation Runner")
    logger.info("=" * 60)
    # Setup signal handlers for graceful shutdown
    is_terminating = False

    def signal_handler(signum, frame):
        nonlocal is_terminating
        if is_terminating:
            return
        is_terminating = True
        logger.info(f"Received signal {signum}, shutting down...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        if config.environment.enable_proxy:
            proxy_host = os.environ.get("OSWORLD_PROXY_HOST")
            proxy_port = os.environ.get("OSWORLD_PROXY_PORT")
            if not proxy_host or not proxy_port:
                raise ValueError(
                    "OSWORLD_PROXY_HOST and OSWORLD_PROXY_PORT are required when "
                    "environment.enable_proxy is enabled"
                )
            from desktop_env.proxy_pool import get_global_proxy_pool
            proxy_pool = get_global_proxy_pool()
            proxy_pool.add_proxy(
                host=proxy_host,
                port=int(proxy_port),
                protocol="http"
            )
            logger.info("Proxy pool initialized from OSWORLD_PROXY_HOST/OSWORLD_PROXY_PORT")

        # Log configuration
        logger.info(f"Agent: {config.agent.name}")
        logger.info(f"Model: {config.agent.model}")
        logger.info(f"Action Space: {config.agent.action_space}")
        logger.info(f"Observation Type: {config.agent.observation_type}")
        logger.info(f"Mode: {config.run.mode}")
        logger.info(f"Provider: {config.environment.provider_name}")
        logger.info(f"Num Envs: {config.run.num_envs}")
        logger.info(f"Max Steps: {config.run.max_steps}")
        logger.info(f"Result Dir: {config.run.result_dir}")

        # Save config
        config_save_dir = os.path.join(
            config.run.result_dir,
            config.agent.action_space,
            config.agent.observation_type,
            config.agent.model,
        )
        os.makedirs(config_save_dir, exist_ok=True)
        config.save_json(os.path.join(config_save_dir, "config.json"))

        # Load task metadata
        logger.info(f"Loading tasks from: {config.run.test_all_meta_path}")
        with open(config.run.test_all_meta_path, "r", encoding="utf-8") as f:
            test_all_meta = json.load(f)

        # Filter by domain if specified (supports comma-separated list, e.g. "chrome,vlc,os")
        if config.run.domain != "all":
            domains = [d.strip() for d in config.run.domain.split(",")]
            missing = [d for d in domains if d not in test_all_meta]
            if missing:
                logger.warning(f"Domains not found in test metadata: {missing}")
                logger.info(f"Available domains: {list(test_all_meta.keys())}")
            filtered = {d: test_all_meta[d] for d in domains if d in test_all_meta}
            if not filtered:
                logger.error(f"None of the specified domains found: {domains}")
                sys.exit(1)
            test_all_meta = filtered

        # Get unfinished tasks
        test_all_meta = get_unfinished_tasks(
            config.agent.action_space,
            config.agent.model,
            config.agent.observation_type,
            config.run.result_dir,
            test_all_meta,
        )

        # Log remaining tasks
        total_tasks = sum(len(examples) for examples in test_all_meta.values())
        logger.info(f"Tasks remaining: {total_tasks}")
        for domain, examples in sorted(test_all_meta.items()):
            if examples:
                logger.info(f"  {domain}: {len(examples)}")

        # Show current results
        get_current_results(
            config.agent.action_space,
            config.agent.model,
            config.agent.observation_type,
            config.run.result_dir,
        )

        if total_tasks == 0:
            logger.info("No tasks to run. All tasks completed!")
            return

        # Create task list
        tasks = build_task_list(test_all_meta, config)

        # Create factories
        env_factory = create_env_factory(config)
        runner_factory = create_runner_factory(config)

        # eval_only mode doesn't need an agent — skip costly LLM init
        if config.run.mode == "eval_only":
            logger.info("eval_only mode: skipping agent creation")
            agent_factory = None
        else:
            agent_factory = create_agent_factory(config)

        # Create and run executor
        logger.info("Starting execution...")
        executor = create_executor(config)
        results = executor.execute(
            tasks=tasks,
            config=config,
            runner_factory=runner_factory,
            agent_factory=agent_factory,
            env_factory=env_factory,
        )

        # Summarize results
        logger.info("=" * 60)
        logger.info("Execution Complete")
        logger.info("=" * 60)

        if results:
            scores = [r.score for r in results]
            avg_score = sum(scores) / len(scores) if scores else 0
            success_count = sum(1 for r in results if r.success)
            success_rate = success_count / len(results) * 100 if results else 0

            logger.info(f"Tasks Completed: {len(results)}")
            logger.info(f"Average Score: {avg_score:.4f}")
            logger.info(f"Success Rate: {success_rate:.2f}% ({success_count}/{len(results)})")

            # Per-domain breakdown
            domain_results: Dict[str, List[float]] = {}
            for r in results:
                if r.domain not in domain_results:
                    domain_results[r.domain] = []
                domain_results[r.domain].append(r.score)

            if len(domain_results) > 1:
                logger.info("Per-domain results:")
                for domain, scores in sorted(domain_results.items()):
                    domain_rate = sum(scores) / len(scores) * 100
                    logger.info(f"  {domain}: {domain_rate:.2f}% ({len(scores)} tasks)")

            # Log any errors
            errors = [r for r in results if r.error]
            if errors:
                logger.warning(f"Tasks with errors: {len(errors)}")
                for r in errors[:5]:  # Show first 5 errors
                    logger.warning(f"  {r.domain}/{r.task_id}: {r.error}")
                if len(errors) > 5:
                    logger.warning(f"  ... and {len(errors) - 5} more")

        logger.info("=" * 60)

    except KeyboardInterrupt:
        logger.info("Interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    main()
