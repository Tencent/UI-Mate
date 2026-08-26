"""OpenAI-compatible HTTP transport (vLLM, SGLang, the API)."""
from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import openai
from requests.exceptions import SSLError

from core.llm.protocol import GenParams, GenResult

logger = logging.getLogger("desktopenv.llm")

DEFAULT_BASE_URL = "http://127.0.0.1:8000/v1"
DEFAULT_API_KEY = "dummy"
DEFAULT_CONNECT_TIMEOUT = 10.0
DEFAULT_READ_TIMEOUT = 120.0
DEFAULT_MAX_RETRIES = 2

# Transient failures: unreachable, overloaded, or the server failed a request
# that is worth sending again. Anything else is a bug in the request and
# retrying it just spends the budget.
RETRYABLE = tuple(
    error
    for error in (
        SSLError,
        getattr(openai, "APIConnectionError", None),
        getattr(openai, "APITimeoutError", None),
        getattr(openai, "RateLimitError", None),
        getattr(openai, "InternalServerError", None),
        # Recorded as-is: 400 means the request itself is invalid, so
        # resending it unchanged can only fail again. Dropping this should
        # turn test_a_bad_request_is_also_retried red.
        getattr(openai, "BadRequestError", None),
    )
    if isinstance(error, type)
)


def extract_content_text(content: Any) -> str:
    """Flatten content that may be a string, a list of blocks, or None."""
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, dict):
                if "text" in part:
                    parts.append(part.get("text", ""))
            else:
                text = getattr(part, "text", None)
                if text:
                    parts.append(text)
        return "".join(parts)
    return str(content)


@dataclass(frozen=True)
class OpenAIClient:
    """None fields fall back to the environment, read per call."""

    base_url: Optional[str] = None
    api_key: Optional[str] = None
    timeout: Optional[float] = None
    max_retries: Optional[int] = None

    def generate(self, messages: List[Dict], params: GenParams) -> GenResult:
        client = self._connect()
        request = self._request(messages, params)
        attempts = self._attempts()

        last_error: Optional[Exception] = None
        for attempt in range(1, attempts + 1):
            try:
                response = client.chat.completions.create(**request)
                return GenResult(extract_content_text(response.choices[0].message.content))
            except RETRYABLE as error:
                last_error = error
                logger.warning("chat completion failed, attempt %d/%d: %s", attempt, attempts, error)
                time.sleep(min(5.0 * attempt, 30.0))

        # Empty rather than raise; the runner parses "" into FAIL.
        logger.error(
            "chat completion gave up after %d attempts, returning an empty reply "
            "(-> FAIL action). Last error: %s",
            attempts,
            last_error,
        )
        return GenResult("")

    def _connect(self):
        base_url = self.base_url or os.environ.get("OPENAI_BASE_URL", DEFAULT_BASE_URL)
        api_key = self.api_key or os.environ.get("OPENAI_API_KEY", DEFAULT_API_KEY)
        timeout = self.timeout if self.timeout is not None else self._timeout()
        try:
            return openai.OpenAI(base_url=base_url, api_key=api_key, timeout=timeout)
        except TypeError:
            # Older SDKs reject `timeout`.
            return openai.OpenAI(base_url=base_url, api_key=api_key)

    @staticmethod
    def _timeout() -> float:
        # Connect + read as one deadline.
        split = float(os.environ.get("OSWORLD_HTTP_CONNECT_TIMEOUT", DEFAULT_CONNECT_TIMEOUT)) + float(
            os.environ.get("OSWORLD_HTTP_READ_TIMEOUT", DEFAULT_READ_TIMEOUT)
        )
        return float(os.environ.get("OSWORLD_OPENAI_TIMEOUT", split))

    def _attempts(self) -> int:
        if self.max_retries is not None:
            return self.max_retries
        return int(os.environ.get("OSWORLD_MAX_RETRY_TIMES", DEFAULT_MAX_RETRIES))

    @staticmethod
    def _request(messages: List[Dict], params: GenParams) -> Dict[str, Any]:
        request: Dict[str, Any] = {
            "model": params.model,
            "messages": messages,
            "max_tokens": params.max_tokens,
            "temperature": params.temperature,
            "top_p": params.top_p,
        }
        if params.enable_thinking is not None:
            request["extra_body"] = {"chat_template_kwargs": {"enable_thinking": params.enable_thinking}}
        return request
