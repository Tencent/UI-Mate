#!/usr/bin/env python3
"""In-process harness facade.

``HarnessSession`` runs one mini-osworld episode from another program: request
dict -> ExperimentConfig -> agent/env/runner -> EpisodeResult. ``env`` and
``agent`` can be injected, so the episode loop only ever talks to
``EnvProtocol`` / ``AgentProtocol`` and ``DesktopEnv`` is imported only when the
session has to build one itself.

    from core.session import HarnessSession
    session = HarnessSession.from_request(request, env=my_env)
    result = session.run()
"""
from __future__ import annotations

import logging
import os
from typing import Any, Dict

from core.config import ExperimentConfig
from core.registry import create_agent
from core.runners import EpisodeResult, create_runner

logger = logging.getLogger("core.session")

_DEFAULT_RESULT_BASE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "results", "harness",
)

_CONN_ENV_OPENAI = {"url": "OPENAI_BASE_URL", "api_key": "OPENAI_API_KEY"}


def build_config(input: Dict[str, Any]) -> "tuple[ExperimentConfig, Dict[str, Any]]":
    """Turn a request dict into ``(ExperimentConfig, task_config)``.

    ``input`` has four blocks -- task / model / environment / run -- and the
    keys below are the whole schema. Side effect: the model connection settings
    are exported to the env vars the chosen agent reads, so callers never
    hard-code env-var names.
    """
    task = dict(input.get("task") or {})
    model = dict(input.get("model") or {})
    env = dict(input.get("environment") or {})
    run = dict(input.get("run") or {})

    task.setdefault("domain", "unknown")

    for field, env_name in _CONN_ENV_OPENAI.items():
        if model.get(field) is not None:
            os.environ[env_name] = str(model[field])

    observation_type = model.get("observation_type", "screenshot")
    config = ExperimentConfig.from_dict({
        "environment": {
            "provider_name": env.get("provider_name", "docker"),
            "region": env.get("region", "us-east-1"),
            "headless": env.get("headless", True),
            "screen_width": env.get("screen_width", 1920),
            "screen_height": env.get("screen_height", 1080),
            "client_password": env.get("client_password", "password"),
            "enable_proxy": env.get("enable_proxy", False),
            "force_proxy": env.get("force_proxy", False),
            "cache_dir": env.get("cache_dir", "cache"),
        },
        "agent": {
            "name": model.get("agent", "ui_mate"),
            "model": model.get("name", "UI_Mate"),
            "action_space": model.get("action_space", "pyautogui"),
            "observation_type": observation_type,
            "max_tokens": model.get("max_tokens", 4096),
            "temperature": model.get("temperature", 1.0),
            "top_p": model.get("top_p", 0.95),
            "max_trajectory_length": model.get("max_trajectory_length", 3),
            "extra": dict(model.get("extra") or {}),  # agent-private kwargs
        },
        "run": {
            "mode": run.get("mode", "test"),  # "test" scores, "rollout" skips it
            "max_steps": run.get("max_steps", 100),
            "sleep_after_execution": run.get("sleep_after_execution", 5.0),
            "env_ready_wait": run.get("env_ready_wait", 60.0),
            "settle_wait": run.get("settle_wait", 30.0),
            "record_video": run.get("record_video", False),
            "result_dir": run.get("result_dir") or os.path.join(
                _DEFAULT_RESULT_BASE, str(task.get("id", "task")),
            ),
        },
    })
    return config, task


class HarnessSession:
    """One episode. ``config`` is editable until the first ``run()``, because
    env / agent are only built on demand."""

    def __init__(
        self,
        config: ExperimentConfig,
        task_config: Dict[str, Any],
        *,
        env: Any = None,
        agent: Any = None,
    ):
        self.config = config
        self.task = task_config
        self._env = env
        self._agent = agent
        # An injected env belongs to the caller; only close what we built.
        self._owns_env = env is None

    @classmethod
    def from_request(
        cls, input: Dict[str, Any], *, env: Any = None, agent: Any = None,
    ) -> "HarnessSession":
        config, task = build_config(input)
        return cls(config, task, env=env, agent=agent)

    @property
    def env(self) -> Any:
        if self._env is None:
            self._env = self._build_env()
        return self._env

    @property
    def agent(self) -> Any:
        if self._agent is None:
            a, e, r = self.config.agent, self.config.environment, self.config.run
            self._agent = create_agent(
                name=a.name, model=a.model, action_space=a.action_space,
                observation_type=a.observation_type, max_tokens=a.max_tokens,
                temperature=a.temperature, top_p=a.top_p,
                max_trajectory_length=a.max_trajectory_length,
                client_password=e.client_password, max_steps=r.max_steps,
                screen_size=(e.screen_width, e.screen_height), **a.extra,
            )
        return self._agent

    @property
    def result_dir(self) -> str:
        """Artifact directory; ``trajectory[i]["screenshot_file"]`` is relative to it."""
        c = self.config
        return os.path.join(
            c.run.result_dir, c.agent.action_space, c.agent.observation_type,
            c.agent.model, self.task.get("domain", "unknown"),
            str(self.task.get("id", "task")),
        )

    def _build_env(self) -> Any:
        e, a = self.config.environment, self.config.agent

        # Provider modules read their credentials at import time, so the .env
        # has to be loaded before DesktopEnv pulls them in.
        try:
            from dotenv import load_dotenv

            load_dotenv()
        except ImportError:
            pass

        if e.enable_proxy:
            proxy_host = os.environ.get("OSWORLD_PROXY_HOST")
            proxy_port = os.environ.get("OSWORLD_PROXY_PORT")
            if not proxy_host or not proxy_port:
                raise ValueError(
                    "OSWORLD_PROXY_HOST and OSWORLD_PROXY_PORT are required when "
                    "environment.enable_proxy is enabled"
                )
            from desktop_env.proxy_pool import get_global_proxy_pool

            pool = get_global_proxy_pool()
            if not pool.proxies:
                pool.add_proxy(host=proxy_host, port=int(proxy_port), protocol="http")

        from core.env_factory import build_desktop_env  # lazy: [env] extra

        return build_desktop_env(
            path_to_vm=e.path_to_vm, action_space=a.action_space,
            provider_name=e.provider_name, region=e.region,
            snapshot_name=e.snapshot_name, os_type=e.os_type,
            screen_size=(e.screen_width, e.screen_height), headless=e.headless,
            enable_proxy=e.enable_proxy, client_password=e.client_password,
            cache_dir=e.cache_dir, force_proxy=e.force_proxy,
        )

    def run(self) -> EpisodeResult:
        """Run the episode. Never raises: a failure comes back as
        ``success=False`` with ``error`` set, which callers must check to tell
        "the agent got it wrong" (score 0) from "the episode did not run".

        ``result.trajectory`` has one record per executed action, so no step
        callback is needed; richer instrumentation belongs in the injected
        agent / env, which see every observation and action anyway.
        """
        os.makedirs(self.result_dir, exist_ok=True)
        runner = create_runner(self.config.run.mode, self.config.run)
        try:
            return runner.run_episode(self.agent, self.env, self.task, self.result_dir)
        except Exception as exc:  # noqa: BLE001
            logger.exception("episode failed")
            return EpisodeResult(
                task_id=str(self.task.get("id", "task")),
                domain=str(self.task.get("domain", "unknown")),
                score=0.0, steps=0, success=False, error=str(exc),
            )

    def close(self) -> None:
        if self._owns_env and self._env is not None:
            try:
                self._env.close()
            except Exception:  # noqa: BLE001
                pass
            self._env = None
