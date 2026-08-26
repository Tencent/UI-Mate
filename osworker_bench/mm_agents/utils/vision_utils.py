"""Image resizing helpers used by UI-Mate."""

import math


def _round_by_factor(number: float, factor: int) -> int:
    return round(number / factor) * factor


def _ceil_by_factor(number: float, factor: int) -> int:
    return math.ceil(number / factor) * factor


def _floor_by_factor(number: float, factor: int) -> int:
    return math.floor(number / factor) * factor


def smart_resize(
    height: int,
    width: int,
    factor: int = 28,
    min_pixels: int = 56 * 56,
    max_pixels: int = 14 * 14 * 4 * 1280,
    max_long_side: int = 8192,
) -> tuple[int, int]:
    """Resize dimensions while preserving aspect ratio and token limits."""
    if height < 2 or width < 2:
        raise ValueError(f"height and width must be at least 2, got {height}x{width}")
    if max(height, width) / min(height, width) > 200:
        raise ValueError(f"aspect ratio is too large: {height}x{width}")

    if max(height, width) > max_long_side:
        scale = max(height, width) / max_long_side
        height, width = int(height / scale), int(width / scale)

    resized_height = _round_by_factor(height, factor)
    resized_width = _round_by_factor(width, factor)
    if resized_height * resized_width > max_pixels:
        scale = math.sqrt((height * width) / max_pixels)
        resized_height = _floor_by_factor(height / scale, factor)
        resized_width = _floor_by_factor(width / scale, factor)
    elif resized_height * resized_width < min_pixels:
        scale = math.sqrt(min_pixels / (height * width))
        resized_height = _ceil_by_factor(height * scale, factor)
        resized_width = _ceil_by_factor(width * scale, factor)
    return resized_height, resized_width
