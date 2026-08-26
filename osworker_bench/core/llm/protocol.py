"""Transport contract: ``messages`` in, ``GenResult`` out."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Mapping, Optional, Protocol


@dataclass(frozen=True)
class GenParams:
    """Sampling settings the agent has already resolved."""

    model: str
    max_tokens: int
    temperature: float = 0.0
    top_p: float = 0.9
    # None leaves the server's chat template unchanged.
    enable_thinking: Optional[bool] = None


@dataclass(frozen=True)
class GenResult:
    """Reply text, plus optional backend-specific ``meta``."""

    text: str
    meta: Mapping[str, Any] = field(default_factory=dict)


class LLMClient(Protocol):
    def generate(self, messages: List[Dict], params: GenParams) -> GenResult: ...
