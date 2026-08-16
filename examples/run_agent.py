#!/usr/bin/env python3
"""Run UI-Mate against a live endpoint and plot what it decided to click.

Two modes, both driven by real OSWorld recordings bundled under ``resources/``.

Single-step (default) walks a handful of screenshots from different tasks,
resetting between each, so every prediction is that task's opening move::

    python examples/run_agent.py --base-url http://127.0.0.1:8000/v1

Replay walks one whole episode without resetting, which is what exercises the
behaviour that only shows up over time: the growing ``Previous actions`` list,
past replies fed back as history, and the collapsing of older screenshots once
more than ``images_to_keep`` have piled up::

    python examples/run_agent.py --replay --base-url http://127.0.0.1:8000/v1

During a replay each step's recorded reply is pushed back into history in place
of the model's own, so predictions are conditioned on what really happened
rather than on a prefix the model invented. ``--free-run`` keeps its own
replies instead, showing how the episode drifts.

Annotated screenshots land in ``--output-dir`` with the predicted positions
marked.
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Dict, List, NamedTuple, Sequence, Tuple, Union

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from agents.ui_mate_agent import (  # noqa: E402
    COLLAPSED_SCREENSHOT_TEXT,
    DEFAULT_API_KEY,
    DEFAULT_BASE_URL,
    DEFAULT_MODEL,
    UIMateAgent,
)

SINGLE_STEP_DIR = REPO_ROOT / "resources" / "example_single_step"
SINGLE_STEP_MANIFEST = SINGLE_STEP_DIR / "examples.json"
TRAJECTORY_DIR = REPO_ROOT / "resources" / "example_trajectory"
TRAJECTORY_MANIFEST = TRAJECTORY_DIR / "trajectory.json"

RULE = "=" * 78


# ---------------------------------------------------------------------------
# Plotting predicted positions
# ---------------------------------------------------------------------------
# pyautogui calls that land on a screen position.
_POINT_CALL = re.compile(
    r"pyautogui\.(click|rightClick|middleClick|doubleClick|tripleClick|moveTo|dragTo)"
    r"\(\s*(-?\d+)\s*,\s*(-?\d+)",
)

_LABELS = {
    "click": "left click",
    "rightClick": "right click",
    "middleClick": "middle click",
    "doubleClick": "double click",
    "tripleClick": "triple click",
    "moveTo": "move",
    "dragTo": "drag",
}

MARKER_COLOR = (229, 57, 53)
LABEL_TEXT_COLOR = (255, 255, 255)


class Point(NamedTuple):
    """One on-screen position predicted by the agent."""

    kind: str
    x: int
    y: int

    @property
    def label(self) -> str:
        return _LABELS.get(self.kind, self.kind)


def extract_points(actions: Union[str, Sequence[str]]) -> List[Point]:
    """Pull every screen position out of the agent's pyautogui output.

    ``predict`` already scales coordinates to the screenshot's own pixel size,
    so the numbers can be plotted as they come. Keyboard-only steps and the
    ``WAIT`` / ``DONE`` / ``FAIL`` control tokens yield nothing.
    """
    if isinstance(actions, str):
        actions = [actions]
    points: List[Point] = []
    for action in actions:
        if not isinstance(action, str):
            continue
        for kind, x, y in _POINT_CALL.findall(action):
            points.append(Point(kind, int(x), int(y)))
    return points


def draw_points(
    image: Union[str, Image.Image],
    points: Sequence[Point],
    radius: int = 26,
    width: int = 4,
) -> Image.Image:
    """Return a copy of the screenshot with each predicted position marked."""
    base = Image.open(image) if isinstance(image, str) else image
    canvas = base.convert("RGB").copy()
    draw = ImageDraw.Draw(canvas)
    font = _load_font(size=max(14, radius))

    for index, point in enumerate(points, 1):
        x, y = point.x, point.y
        draw.ellipse(
            [x - radius, y - radius, x + radius, y + radius],
            outline=MARKER_COLOR,
            width=width,
        )
        draw.line([x - radius, y, x + radius, y], fill=MARKER_COLOR, width=max(1, width // 2))
        draw.line([x, y - radius, x, y + radius], fill=MARKER_COLOR, width=max(1, width // 2))
        label = f"{index}. {point.label} ({x}, {y})"
        _draw_label(draw, label, point, radius, font, canvas.size)

    return canvas


def _draw_label(draw, text: str, point: Point, radius: int, font, bounds) -> None:
    """Place the caption beside the marker, folding it inside the screenshot.

    Targets on a window's right edge or title bar are common, so a caption that
    always ran up and to the right would be clipped away on exactly the cases
    worth inspecting.
    """
    max_x, max_y = bounds
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    text_w, text_h = right - left, bottom - top

    x = point.x + radius + 6
    if x + text_w + 6 > max_x:
        x = point.x - radius - 6 - text_w
    x = max(x, 6)

    y = min(max(point.y - radius, 6), max_y - text_h - 6)

    draw.rectangle([x - 6, y - 4, x + text_w + 6, y + text_h + 4], fill=MARKER_COLOR)
    draw.text((x - left, y - top), text, fill=LABEL_TEXT_COLOR, font=font)


def _load_font(size: int):
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow < 10.1 cannot scale the bitmap default font
        return ImageFont.load_default()


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------
def check_endpoint(agent: UIMateAgent) -> None:
    """Fail early and loudly.

    ``call_llm`` turns an unreachable endpoint into an empty response and a FAIL
    action, which would otherwise look like a bad prediction rather than a
    missing server.
    """
    import openai

    client = openai.OpenAI(base_url=agent.base_url, api_key=agent.api_key, timeout=agent.request_timeout)
    try:
        served = [m.id for m in client.models.list().data]
    except Exception as exc:  # noqa: BLE001 - surface whatever the client raised
        raise SystemExit(
            f"cannot reach {agent.base_url}: {exc}\n"
            "Start a server for the checkpoint first, e.g.\n"
            "  vllm serve <checkpoint> --served-model-name UI_Mate --port 8000"
        ) from exc
    if served and agent.model not in served:
        raise SystemExit(
            f"{agent.base_url} does not serve {agent.model!r}; it offers {served}.\n"
            "Pass --model with one of those names."
        )


def build_agent(args: argparse.Namespace) -> UIMateAgent:
    overrides = {}
    if args.temperature is not None:
        overrides["temperature"] = args.temperature
    if args.max_tokens is not None:
        overrides["max_tokens"] = args.max_tokens
    if args.images_to_keep is not None:
        overrides["images_to_keep"] = args.images_to_keep

    agent = UIMateAgent(model=args.model, base_url=args.base_url, api_key=args.api_key, **overrides)
    check_endpoint(agent)
    return agent


def oneline(action: str, limit: int = 88) -> str:
    """Actions that expand into many pyautogui calls still belong on one row.

    Typing a URL becomes one ``press`` per character, so the tail is elided
    rather than allowed to bury the rest of the step.
    """
    calls = action.splitlines()
    text = " | ".join(calls)
    if len(text) <= limit:
        return text
    return f"{text[:limit].rstrip()}... ({len(calls)} calls)"


# ---------------------------------------------------------------------------
# Single-step mode
# ---------------------------------------------------------------------------
def load_examples(args: argparse.Namespace) -> List[Dict[str, str]]:
    if args.image:
        if not args.instruction:
            raise SystemExit("--image requires --instruction")
        path = Path(args.image)
        if not path.is_file():
            raise SystemExit(f"screenshot not found: {path}")
        return [{"image": str(path), "app": path.stem, "instruction": args.instruction}]

    if not SINGLE_STEP_MANIFEST.is_file():
        raise SystemExit(f"example manifest not found: {SINGLE_STEP_MANIFEST}")
    examples = json.loads(SINGLE_STEP_MANIFEST.read_text(encoding="utf-8"))["examples"]
    for example in examples:
        example["image"] = str(SINGLE_STEP_DIR / example["image"])
    if args.only:
        examples = [e for e in examples if e["app"] == args.only]
        if not examples:
            raise SystemExit(f"no bundled example for app {args.only!r}")
    if args.instruction:
        for example in examples:
            example["instruction"] = args.instruction
    return examples


def run_single_step(args: argparse.Namespace, output_dir: Path) -> int:
    examples = load_examples(args)
    agent = build_agent(args)
    print(f"Endpoint {agent.base_url} serving {agent.model}, {len(examples)} example(s) to run.\n")

    summary = []
    for index, example in enumerate(examples, 1):
        print(RULE)
        print(f"[{index}/{len(examples)}] {example['app']}")
        print(f"Instruction: {example['instruction']}")
        print(RULE)

        agent.reset()
        screenshot = Path(example["image"]).read_bytes()
        response, actions = agent.predict(example["instruction"], {"screenshot": screenshot})

        print("\n--- raw model response ---")
        print(response.strip() if response else "(empty)")
        print("\n--- parsed actions ---")
        for action in actions:
            print(action)

        points = extract_points(actions)
        out_path = output_dir / f"{index:02d}_{example['app']}.png"
        draw_points(example["image"], points).save(out_path)
        print(f"\nMarked {len(points)} position(s) -> {out_path}\n")

        summary.append((example["app"], len(points), out_path))

    print(RULE)
    print("Summary")
    for app, count, out_path in summary:
        print(f"  {app:<16} {count} position(s)  {out_path}")
    return 0


# ---------------------------------------------------------------------------
# Replay mode
# ---------------------------------------------------------------------------
def summarize_payload(messages: List[Dict]) -> Tuple[int, int]:
    """Count the screenshots still attached, and those replaced by a placeholder."""
    live = collapsed = 0
    for message in messages:
        for part in message.get("content", []):
            if part.get("type") == "image_url":
                live += 1
            elif part.get("type") == "text" and COLLAPSED_SCREENSHOT_TEXT in part.get("text", ""):
                collapsed += 1
    return live, collapsed


def run_replay(args: argparse.Namespace, output_dir: Path) -> int:
    if not TRAJECTORY_MANIFEST.is_file():
        raise SystemExit(f"trajectory manifest not found: {TRAJECTORY_MANIFEST}")
    traj = json.loads(TRAJECTORY_MANIFEST.read_text(encoding="utf-8"))
    steps = traj["steps"][: args.steps] if args.steps else traj["steps"]

    agent = build_agent(args)
    agent.reset()

    # predict() builds the payload internally; wrapping the call is the only way
    # to see how history actually reached the model.
    sent: Dict[str, List[Dict]] = {}
    inner_call_llm = agent.call_llm

    def capture(payload, model=None):
        sent["messages"] = payload["messages"]
        return inner_call_llm(payload, model)

    agent.call_llm = capture

    print(f"Task: {traj['instruction']}")
    print(f"Replaying {len(steps)} frames, keeping {agent.images_to_keep} screenshots before collapsing.")
    print("History is " + ("the model's own replies (free run)." if args.free_run else "the recorded episode."))

    rows = []
    for index, step in enumerate(steps):
        frame = TRAJECTORY_DIR / step["image"]
        response, actions = agent.predict(traj["instruction"], {"screenshot": frame.read_bytes()})
        live, collapsed = summarize_payload(sent["messages"])

        predicted = "\n".join(actions)
        recorded = step["recorded_action"]
        print("\n" + RULE)
        print(f"step {index}  |  {len(sent['messages'])} messages, {live} screenshot(s) live, {collapsed} collapsed")
        print(RULE)
        if args.show_response:
            print(response.strip() if response else "(empty)")
            print()
        print(f"  predicted: {oneline(predicted)}")
        print(f"  recorded : {oneline(recorded)}")

        points = extract_points(actions)
        draw_points(str(frame), points).save(output_dir / f"step_{index:02d}.png")

        rows.append((index, live, collapsed, predicted, recorded))

        if not args.free_run:
            agent.responses[-1] = step["recorded_response"]

    matches = sum(1 for _, _, _, predicted, recorded in rows if predicted == recorded)
    print("\n" + RULE)
    print("Summary")
    print(f"{'step':>4}  {'live':>4}  {'collapsed':>9}  {'match':>5}  predicted action")
    for index, live, collapsed, predicted, recorded in rows:
        match = "yes" if predicted == recorded else "no"
        print(f"{index:>4}  {live:>4}  {collapsed:>9}  {match:>5}  {oneline(predicted, 48)}")
    print(f"\n{matches}/{len(rows)} steps reproduced the recorded action.")
    print(f"Annotated frames written to {output_dir}")
    return 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--replay",
        action="store_true",
        help="Replay one whole episode instead of independent screenshots",
    )

    endpoint = parser.add_argument_group("endpoint")
    endpoint.add_argument("--base-url", default=DEFAULT_BASE_URL, help="OpenAI-compatible endpoint serving UI-Mate")
    endpoint.add_argument("--api-key", default=DEFAULT_API_KEY, help="API key; vLLM deployments usually ignore it")
    endpoint.add_argument("--model", default=DEFAULT_MODEL, help="Model name to request from the endpoint")
    endpoint.add_argument("--temperature", type=float, help="Override the sampling temperature")
    endpoint.add_argument("--max-tokens", type=int, help="Override the generation length cap")

    output = parser.add_argument_group("output")
    output.add_argument(
        "--output-dir",
        help="Where to write annotated screenshots (default: outputs/, outputs/replay/ when replaying)",
    )
    output.add_argument(
        "--show-response",
        action="store_true",
        help="Print each full reply while replaying; single-step always does",
    )
    output.add_argument("--verbose", action="store_true", help="Show the agent's own log output")

    single = parser.add_argument_group("single-step mode")
    single.add_argument("--only", metavar="APP", help="Run a single bundled example, matched on its app name")
    single.add_argument("--image", help="Run one screenshot of your own instead of the bundled examples")
    single.add_argument("--instruction", help="Task instruction; required together with --image")

    replay = parser.add_argument_group("replay mode")
    replay.add_argument("--steps", type=int, help="Stop after this many frames instead of replaying the whole episode")
    replay.add_argument("--images-to-keep", type=int, help="Override how many screenshots survive before collapsing")
    replay.add_argument(
        "--free-run",
        action="store_true",
        help="Keep the model's own replies as history instead of the recorded ones",
    )

    return parser.parse_args()


def main() -> int:
    args = parse_args()
    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )

    default_dir = REPO_ROOT / "outputs" / "replay" if args.replay else REPO_ROOT / "outputs"
    output_dir = Path(args.output_dir) if args.output_dir else default_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    return run_replay(args, output_dir) if args.replay else run_single_step(args, output_dir)


if __name__ == "__main__":
    raise SystemExit(main())
