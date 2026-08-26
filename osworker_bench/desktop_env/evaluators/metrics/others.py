from __future__ import annotations

import logging
import os
import os.path
import zipfile
from typing import List, Dict
from typing import Union, TypeVar

import lxml.html
from lxml.html import HtmlElement
from mutagen.easyid3 import EasyID3

from .general import diff_text_file
from .utils import _match_value_to_rule

logger = logging.getLogger("desktopenv.metric.others")


def process_epub(filename: str, base_dir: str | None = None) -> List[str]:
    """Extract and normalise epub contents for comparison.

    Args:
        filename: Path to the ``.epub`` file.
        base_dir: Directory to extract into.  When *None* (default), extracts
            to ``filename + ".dir"`` (next to the epub file).
    """
    file_list: List[str] = []

    if base_dir is None:
        base_dir = filename + ".dir"
    os.makedirs(base_dir, exist_ok=True)

    try:
        with zipfile.ZipFile(filename, "r") as z_f:
            # Get list of all files in the zip archive
            zip_file_list = z_f.namelist()
            
            # Process toc.ncx if it exists
            if "toc.ncx" in zip_file_list:
                with z_f.open("toc.ncx") as in_f \
                        , open(os.path.join(base_dir, "toc.ncx"), "w") as out_f:
                    contents: str = in_f.read().decode()
                    contents = contents.splitlines()
                    for l in contents:
                        if "navPoint" not in l:
                            out_f.write(l + "\n")
                file_list.append(os.path.join(base_dir, "toc.ncx"))
            else:
                logger.debug("toc.ncx not found in epub file: %s", filename)
            
            # Process content.opf if it exists
            if "content.opf" in zip_file_list:
                with z_f.open("content.opf") as in_f \
                        , open(os.path.join(base_dir, "content.opf"), "w") as out_f:
                    contents: str = in_f.read().decode()
                    contents = contents.splitlines()
                    for l in contents:
                        if "dc:identifier" not in l:
                            out_f.write(l + "\n")
                file_list.append(os.path.join(base_dir, "content.opf"))
            else:
                logger.debug("content.opf not found in epub file: %s", filename)
            for f_n in z_f.namelist():
                if f_n.endswith(".html"):
                    with z_f.open(f_n) as in_f \
                            , open(os.path.join(base_dir, f_n), "w") as out_f:
                        html: HtmlElement = lxml.html.fromstring(
                            ''.join(filter(lambda ch: ch != "\n" and ch != "\r"
                                           , in_f.read().decode()
                                           )
                                    ).encode()
                        )
                        out_f.write(lxml.html.tostring(html, pretty_print=True, encoding="unicode"))
                    file_list.append(os.path.join(base_dir, f_n))
        logger.debug("%s: %s", filename, file_list)
        return list(sorted(file_list))
    except zipfile.BadZipFile:
        return []


def _list_epub_dir(base_dir: str) -> List[str]:
    """List processed epub contents already present in *base_dir*.

    Returns a sorted list of file paths (same format as ``process_epub``),
    or an empty list if the directory does not look like a valid processed
    epub (i.e. contains no ``.ncx``, ``.opf``, or ``.html`` files).
    """
    if not os.path.isdir(base_dir):
        return []
    files = []
    for fn in os.listdir(base_dir):
        fp = os.path.join(base_dir, fn)
        if os.path.isfile(fp) and fn.endswith((".ncx", ".opf", ".html")):
            files.append(fp)
    return list(sorted(files))


def compare_epub(result: str, expected: str) -> float:
    """Compare two epub files.

    Gold extraction strategy (keeps cache_dir read-only):
      1. If a ``.epub.dir`` folder already exists next to ``expected`` (inside
         cache_dir from a previous run) **and** contains processed files,
         reuse it directly without re-writing.
      2. Otherwise, extract into an ``.epub.dir`` folder under the same parent
         directory as ``result`` (inside eval_cache_dir) so that cache_dir is
         never written to.
    """
    if result is None:
        return 0.

    # --- result (pred): always extract next to pred file (eval_cache_dir) ---
    result_files: List[str] = process_epub(result)

    # --- expected (gold): prefer cache_dir read-only, fallback to eval_cache_dir ---
    gold_dir_in_cache = expected + ".dir"
    # Try to reuse an existing, complete extraction in cache_dir (read-only).
    expected_files = _list_epub_dir(gold_dir_in_cache)
    if not expected_files:
        # Not present or incomplete – extract to eval_cache_dir instead.
        gold_basename = os.path.basename(expected) + ".dir"
        gold_dir_in_eval = os.path.join(os.path.dirname(result), gold_basename)
        expected_files = process_epub(expected, base_dir=gold_dir_in_eval)

    metric: float = 0.
    for f1, f2 in zip(result_files, expected_files):
        current_metric: float = diff_text_file(f1, f2)
        logger.debug("%s vs %s: %f", f1, f2, current_metric)
        metric += current_metric
    if len(result_files) > 0:
        metric /= len(result_files)
    return metric


V = TypeVar("Value")


def check_mp3_meta(result: str, meta: Dict[str, Dict[str, Union[str, V]]]) -> bool:
    # checks using _match_value_to_rule
    if result is None:
        return 0.

    id3_dict = EasyID3(result)
    metric: bool = True
    for k, r in meta.items():
        value = id3_dict.get(k, "")
        if isinstance(value, list):
            value: str = ",".join(value)
        logger.debug("%s.%s: %s", result, k, value)
        metric = metric and _match_value_to_rule(value, r)
    return float(metric)
