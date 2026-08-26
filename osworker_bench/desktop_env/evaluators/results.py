"""Shared, dependency-free data types produced by evaluation.

These live here — at a leaf of the evaluators dependency graph — rather than
in ``desktop_env.py`` (the producer) or ``artifacts.py`` (the consumer) so
that both can depend on them without importing each other. The module has no
business dependencies (only ``dataclasses`` + ``typing``), so it can never
participate in an import cycle.

- ``DesktopEnv._evaluate_core`` builds these while scoring a task.
- ``artifacts.save_evaluator_artifacts`` consumes them when dumping artifacts.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class MetricRecord:
    """One metric's inputs and score, captured during evaluation.

    Purely a data carrier for offline artifact dumping. Producing these
    records has no side effects, so ``DesktopEnv._evaluate_core`` stays a
    pure scoring routine and all persistence is handled elsewhere.
    """
    idx: int
    func_name: Any = None
    result_getter_config: Any = None
    expected_getter_config: Any = None
    options: Any = None
    result_state: Any = None
    expected_state: Any = None
    metric_score: Any = None

    def as_dict(self) -> Dict[str, Any]:
        return {
            "func_name": self.func_name,
            "result_getter_config": self.result_getter_config,
            "expected_getter_config": self.expected_getter_config,
            "options": self.options,
            "result_state": self.result_state,
            "expected_state": self.expected_state,
            "metric_score": self.metric_score,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any], idx: int = 0) -> "MetricRecord":
        """Build from a legacy dict payload (inverse of ``as_dict``).

        ``idx`` is used only if the dict does not carry its own ``idx`` key,
        so older callers that stored records without an index still work.
        """
        return cls(
            idx=data.get("idx", idx),
            func_name=data.get("func_name"),
            result_getter_config=data.get("result_getter_config"),
            expected_getter_config=data.get("expected_getter_config"),
            options=data.get("options"),
            result_state=data.get("result_state"),
            expected_state=data.get("expected_state"),
            metric_score=data.get("metric_score"),
        )


@dataclass
class EvalResult:
    """Structured return of ``DesktopEnv._evaluate_core``.

    Separates *what the score is* from *how it was computed*, so the scoring
    logic never has to know about artifact persistence.
    """
    score: float
    records: List[MetricRecord] = field(default_factory=list)
    error: Optional[str] = None
