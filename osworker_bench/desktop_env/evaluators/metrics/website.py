import logging
from typing import Any

logger = logging.getLogger("desktopenv.metrics.website")


def check_website_localStorage_evaluation(result: Any) -> float:
    """
    Metric that handles float evaluation results for dense reward support.

    This metric is designed to work with localStorage-based evaluations where
    the evaluation logic (JavaScript) returns a float value (0.0-1.0) for dense
    reward, or a boolean for binary reward (backward compatible).

    Args:
        result (Any): The result from get_website_localStorage_evaluation getter.
                     Can be:
                     - float/int: Direct score (0.0-1.0)
                     - bool: True -> 1.0, False -> 0.0
                     - dict: Error case with {"result": float, "error_type": str}

    Returns:
        float: The evaluation score (0.0-1.0).
               Returns 0.0 if any error occurs or result is invalid.

    Notes:
        - Supports dense reward (float values between 0.0 and 1.0)
        - Backward compatible with boolean results
        - Handles error dict format from getter
    """
    logger.info(f"[WEBSITE_METRIC] Evaluating result: {result} (type: {type(result).__name__})")

    # Handle None
    if result is None:
        logger.warning("[WEBSITE_METRIC] Result is None, returning 0.0")
        return 0.0

    # Handle error dict format (e.g., {"result": 0.0, "error_type": "chrome_connection_error"})
    if isinstance(result, dict):
        logger.info(f"[WEBSITE_METRIC] Result is dict, extracting 'result' field")
        result = result.get("result", 0.0)

    # Handle float/int directly (dense reward)
    if isinstance(result, (int, float)):
        score = max(0.0, min(1.0, float(result)))  # Clamp to [0, 1]
        logger.info(f"[WEBSITE_METRIC] Final score (dense): {score}")
        return score

    # Handle boolean (backward compatible)
    if isinstance(result, bool):
        score = 1.0 if result else 0.0
        logger.info(f"[WEBSITE_METRIC] Final score (bool): {score}")
        return score

    # Unknown type
    logger.warning(f"[WEBSITE_METRIC] Unexpected result type: {type(result)}, returning 0.0")
    return 0.0
