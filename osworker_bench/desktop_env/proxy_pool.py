"""Proxy-pool support shared by the Docker desktop environment."""

from __future__ import annotations

import json
import logging
import os
import time
from dataclasses import dataclass
from threading import Lock
from typing import List, Optional

logger = logging.getLogger("desktopenv.proxy_pool")


@dataclass
class ProxyInfo:
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    protocol: str = "http"
    failed_count: int = 0
    last_used: float = 0
    is_active: bool = True


class ProxyPool:
    def __init__(self, config_file: Optional[str] = None):
        self.proxies: List[ProxyInfo] = []
        self.current_index = 0
        self.lock = Lock()
        self.max_failures = 3
        self.cooldown_time = 300
        if config_file:
            self.load_proxies_from_file(config_file)

    def load_proxies_from_file(self, config_file: str) -> None:
        if not os.path.isfile(config_file):
            logger.warning("Proxy config %s not found; using an empty pool", config_file)
            return
        with open(config_file, encoding="utf-8") as handle:
            for config in json.load(handle):
                self.proxies.append(
                    ProxyInfo(
                        host=config["host"],
                        port=int(config["port"]),
                        username=config.get("username"),
                        password=config.get("password"),
                        protocol=config.get("protocol", "http"),
                    )
                )

    def add_proxy(
        self,
        host: str,
        port: int,
        username: Optional[str] = None,
        password: Optional[str] = None,
        protocol: str = "http",
    ) -> None:
        with self.lock:
            self.proxies.append(
                ProxyInfo(host, int(port), username, password, protocol)
            )

    def get_next_proxy(self) -> Optional[ProxyInfo]:
        with self.lock:
            active = [proxy for proxy in self.proxies if self._is_available(proxy)]
            if not active:
                return None
            proxy = active[self.current_index % len(active)]
            self.current_index += 1
            proxy.last_used = time.time()
            return proxy

    def _is_available(self, proxy: ProxyInfo) -> bool:
        if not proxy.is_active:
            return False
        if proxy.failed_count < self.max_failures:
            return True
        if time.time() - proxy.last_used < self.cooldown_time:
            return False
        proxy.failed_count = 0
        return True

    def mark_proxy_failed(self, proxy: ProxyInfo) -> None:
        with self.lock:
            proxy.failed_count += 1

    def mark_proxy_success(self, proxy: ProxyInfo) -> None:
        with self.lock:
            proxy.failed_count = 0


_proxy_pool: Optional[ProxyPool] = None


def get_global_proxy_pool() -> ProxyPool:
    global _proxy_pool
    if _proxy_pool is None:
        _proxy_pool = ProxyPool()
    return _proxy_pool


def init_proxy_pool(config_file: Optional[str] = None) -> ProxyPool:
    global _proxy_pool
    _proxy_pool = ProxyPool(config_file)
    return _proxy_pool
