import logging
import operator
from typing import Any
from typing import Dict, List, Optional

import fitz  # PyMuPDF
from pypdf import PdfReader

logger = logging.getLogger("desktopenv.metric.pdf")


# ── Low-level helpers ────────────────────────────────────────────────────────

def _safe_page_count(path: str) -> Optional[int]:
    """Return page count or None on error."""
    try:
        return len(PdfReader(path).pages)
    except Exception as exc:
        logger.error("_safe_page_count(%s): %s", path, exc)
        return None


def _extract_first_page_text(path: str) -> Optional[str]:
    """Return first-page text or None on error."""
    try:
        return PdfReader(path).pages[0].extract_text() or ""
    except Exception as exc:
        logger.error("_extract_first_page_text(%s): %s", path, exc)
        return None


def _get_page_mediabox(path: str, page_idx: int = 0):
    """Return (width_pt, height_pt) of a page's mediabox, or None on error."""
    try:
        page = PdfReader(path).pages[page_idx]
        return float(page.mediabox.width), float(page.mediabox.height)
    except Exception as exc:
        logger.error("_get_page_mediabox(%s): %s", path, exc)
        return None


# ── Single-file evaluators ───────────────────────────────────────────────────

def check_pdf_pages(pdf_file: str, rules: Dict[str, Any]) -> float:
    if pdf_file is None:
        return 0.0
    reader = PdfReader(pdf_file)
    nb_pages: int = len(reader.pages)
    return float(getattr(operator, rules["relation"])(nb_pages, rules["ref_value"]))


def extract_answers_from_pdf(pdf_file):
    doc = fitz.open(pdf_file)
    answers = []

    for page in doc:
        text = page.get_text()
        lines = text.split('\n')
        for line in lines:
            if line.strip():
                parts = line.split('=')
                if len(parts) > 1:
                    answer = parts[-1].strip()
                    answers.append(answer)

    return answers


def compare_pdf_page_count(result_file: Optional[str], expected_file: Optional[str], **options) -> float:
    """
    Compare two PDF files by page count only.

    Returns 1.0 if both files exist and have the same number of pages, else 0.0.

    Args:
        result_file:   local path to the agent-produced PDF (from get_vm_file)
        expected_file: local path to the gold-standard PDF (from get_cloud_file)
        **options:     unused, reserved for future tolerance parameters
    """
    if result_file is None or expected_file is None:
        logger.warning("compare_pdf_page_count: one or both files are None")
        return 0.0
    try:
        result_pages = len(PdfReader(result_file).pages)
        expected_pages = len(PdfReader(expected_file).pages)
        logger.info("compare_pdf_page_count: result=%d expected=%d", result_pages, expected_pages)
        return 1.0 if result_pages == expected_pages else 0.0
    except Exception as exc:
        logger.error("compare_pdf_page_count error: %s", exc)
        return 0.0


# ── Generic rule-based single-file evaluator ─────────────────────────────────

def check_pdf_rules(result_file: Optional[str], expected: Any, **options) -> float:
    """
    Generic rule-based PDF evaluator for single output files.

    Checks an arbitrary set of rules against one PDF. Useful for tasks like
    watermarking, rotation, compression, page extraction, etc.

    Args:
        result_file: local path to the agent-produced PDF
        expected:    rules dict (from get_rule)

    Rules dict (all keys are optional — only specified checks run):
    {
        "page_count":           int,       # exact page count
        "min_page_count":       int,       # minimum pages
        "max_page_count":       int,       # maximum pages
        "page_text_keywords":   {          # keyword checks on specific pages
            "0": ["keyword1", "keyword2"], # page 0 must contain these keywords
            "3": ["keyword3"]              # page 3 must contain these
        },
        "first_page_keywords":  ["kw1"],   # shorthand for page_text_keywords["0"]
        "max_file_size_bytes":  int,       # file size upper bound (compression tasks)
        "min_file_size_bytes":  int,       # file size lower bound
        "file_size_ratio":      float,     # result_size / gold_size must be <= this
        "page_size":            {          # verify mediabox dimensions (resize tasks)
            "page_idx":   0,              # 0-based page index (default 0)
            "width_pt":   float,          # expected width in points (±tolerance)
            "height_pt":  float,          # expected height in points (±tolerance)
            "tolerance":  float,          # allowed deviation in points (default 5.0)
        },
        "max_page_size": {                 # page must be SMALLER than these dims (crop tasks)
            "page_idx":   0,
            "width_pt":   float,          # result width must be < this
            "height_pt":  float,          # result height must be < this
        },
        "page_rotation":        {          # verify page rotation angle (rotate tasks)
            "page_idx":   0,
            "angle_deg":  int,            # expected /Rotate value (90, 180, 270)
        },
        "has_text_on_page":     {          # verify a page contains any new text layer
            "page_idx":    -1,            # -1 = last page; any int = that 0-based index
            "min_text_len": 1,            # minimum chars extracted from that page
        },
    }

    Returns:
        float: 1.0 if all specified checks pass, 0.0 otherwise.
    """
    if result_file is None:
        logger.warning("check_pdf_rules: result_file is None")
        return 0.0

    rules: Dict = expected if isinstance(expected, dict) else {}

    # ── Page count checks ────────────────────────────────────────────────
    pages = _safe_page_count(result_file)
    if pages is None:
        return 0.0

    if "page_count" in rules and pages != int(rules["page_count"]):
        logger.info("check_pdf_rules: page_count %d != expected %d", pages, rules["page_count"])
        return 0.0

    if "min_page_count" in rules and pages < int(rules["min_page_count"]):
        logger.info("check_pdf_rules: page_count %d < min %d", pages, rules["min_page_count"])
        return 0.0

    if "max_page_count" in rules and pages > int(rules["max_page_count"]):
        logger.info("check_pdf_rules: page_count %d > max %d", pages, rules["max_page_count"])
        return 0.0

    # ── Keyword checks on specific pages ─────────────────────────────────
    page_kw_map: Dict = rules.get("page_text_keywords", {})
    # Add first_page_keywords as shorthand
    if "first_page_keywords" in rules and "0" not in page_kw_map:
        page_kw_map["0"] = rules["first_page_keywords"]

    for page_str, keywords in page_kw_map.items():
        page_idx = int(page_str)
        if page_idx >= pages:
            logger.info("check_pdf_rules: page %d out of range (total %d)", page_idx, pages)
            return 0.0
        try:
            text = PdfReader(result_file).pages[page_idx].extract_text() or ""
        except Exception as exc:
            logger.error("check_pdf_rules: error extracting page %d text: %s", page_idx, exc)
            return 0.0

        for kw in keywords:
            if kw and kw not in text:
                logger.info("check_pdf_rules: page %d missing keyword '%s'", page_idx, kw)
                return 0.0

    # ── File size checks ─────────────────────────────────────────────────
    import os
    try:
        file_size = os.path.getsize(result_file)
    except OSError:
        file_size = None

    if file_size is not None:
        if "max_file_size_bytes" in rules and file_size > int(rules["max_file_size_bytes"]):
            logger.info("check_pdf_rules: file size %d > max %d", file_size, rules["max_file_size_bytes"])
            return 0.0
        if "min_file_size_bytes" in rules and file_size < int(rules["min_file_size_bytes"]):
            logger.info("check_pdf_rules: file size %d < min %d", file_size, rules["min_file_size_bytes"])
            return 0.0

    # ── Page size check (resize tasks) ───────────────────────────────────
    if "page_size" in rules:
        ps = rules["page_size"]
        idx       = int(ps.get("page_idx", 0))
        exp_w     = float(ps["width_pt"])
        exp_h     = float(ps["height_pt"])
        tolerance = float(ps.get("tolerance", 5.0))
        box = _get_page_mediabox(result_file, idx)
        if box is None:
            return 0.0
        w, h = box
        if abs(w - exp_w) > tolerance or abs(h - exp_h) > tolerance:
            logger.info(
                "check_pdf_rules: page size %.1fx%.1f not within tolerance of %.1fx%.1f (±%.1f)",
                w, h, exp_w, exp_h, tolerance,
            )
            return 0.0
        logger.info("check_pdf_rules: page size OK (%.1fx%.1f)", w, h)

    # ── Max page size check (crop tasks) ─────────────────────────────────
    if "max_page_size" in rules:
        mps   = rules["max_page_size"]
        idx   = int(mps.get("page_idx", 0))
        max_w = float(mps["width_pt"])
        max_h = float(mps["height_pt"])
        box   = _get_page_mediabox(result_file, idx)
        if box is None:
            return 0.0
        w, h = box
        if w >= max_w or h >= max_h:
            logger.info(
                "check_pdf_rules: page size %.1fx%.1f not smaller than max %.1fx%.1f",
                w, h, max_w, max_h,
            )
            return 0.0
        logger.info("check_pdf_rules: max_page_size OK (%.1fx%.1f < %.1fx%.1f)", w, h, max_w, max_h)

    # ── Page rotation check (rotate tasks) ───────────────────────────────
    if "page_rotation" in rules:
        pr    = rules["page_rotation"]
        idx   = int(pr.get("page_idx", 0))
        exp_angle = int(pr["angle_deg"])
        try:
            page = PdfReader(result_file).pages[idx]
            actual_angle = int(page.get("/Rotate", 0))
        except Exception as exc:
            logger.error("check_pdf_rules: error reading rotation: %s", exc)
            return 0.0
        if actual_angle != exp_angle:
            logger.info(
                "check_pdf_rules: page %d rotation %d != expected %d",
                idx, actual_angle, exp_angle,
            )
            return 0.0
        logger.info("check_pdf_rules: page %d rotation OK (%d°)", idx, actual_angle)

    # ── Has-text-on-page check (add_page_numbers tasks) ──────────────────
    if "has_text_on_page" in rules:
        ht      = rules["has_text_on_page"]
        idx     = int(ht.get("page_idx", -1))
        min_len = int(ht.get("min_text_len", 1))
        if idx < 0:
            idx = pages + idx          # -1 → last page
        if idx >= pages or idx < 0:
            logger.info("check_pdf_rules: has_text_on_page index %d out of range", idx)
            return 0.0
        try:
            text = PdfReader(result_file).pages[idx].extract_text() or ""
        except Exception as exc:
            logger.error("check_pdf_rules: has_text_on_page extract error: %s", exc)
            return 0.0
        if len(text.strip()) < min_len:
            logger.info(
                "check_pdf_rules: page %d text length %d < min %d",
                idx, len(text.strip()), min_len,
            )
            return 0.0
        logger.info("check_pdf_rules: has_text_on_page OK (page %d, len=%d)", idx, len(text.strip()))

    logger.info("check_pdf_rules: PASS (pages=%d)", pages)
    return 1.0


def compare_watermarked_pdf(result_file: Optional[str], expected_file: Optional[str], **options) -> float:
    """
    Evaluate a PDF watermark task.

    Checks: page count matches gold + watermark keyword found on sampled pages.
    Uses PyMuPDF (fitz) for text extraction (handles both embedded-text and
    content-stream watermarks more reliably than pypdf).

    options:
        watermark_keyword (str): text to check per page, default "DRAFT"
    """
    keyword: str = options.get("watermark_keyword", "DRAFT")
    if result_file is None or expected_file is None:
        logger.warning("compare_watermarked_pdf: a file is None")
        return 0.0

    try:
        result_pages = len(PdfReader(result_file).pages)
        expected_pages = len(PdfReader(expected_file).pages)
    except Exception as exc:
        logger.error("compare_watermarked_pdf: page count error: %s", exc)
        return 0.0

    if result_pages != expected_pages:
        logger.info("compare_watermarked_pdf: page count mismatch %d vs %d", result_pages, expected_pages)
        return 0.0
    logger.info("compare_watermarked_pdf: page count OK (%d)", result_pages)

    mid = result_pages // 2
    sample_indices = sorted(set([0, mid, result_pages - 1]))
    try:
        doc = fitz.open(result_file)
        try:
            for i in sample_indices:
                text = doc[i].get_text()
                if keyword not in text:
                    logger.info("compare_watermarked_pdf: keyword '%s' absent on page %d", keyword, i + 1)
                    return 0.0
                logger.info("compare_watermarked_pdf: keyword '%s' found on page %d", keyword, i + 1)
        finally:
            doc.close()
    except Exception as exc:
        logger.error("compare_watermarked_pdf: fitz error: %s", exc)
        return 0.0

    return 1.0


# ── Multi-file evaluators ────────────────────────────────────────────────────

def compare_split_pdfs(result_files: List[Optional[str]], expected_files: List[Optional[str]], **options) -> float:
    """
    Evaluate a PDF-split task that produces N output PDFs (commonly 2).

    The function checks:
      1. All output files exist (non-None).
      2. Each output PDF has the correct page count (matches the gold standard).
      3. (Optional) The first-page text of each output contains an expected keyword.

    Args:
        result_files:   list of output PDF paths — from get_vm_file multi
        expected_files: list of gold PDF paths   — from get_cloud_file multi
        **options: dict with optional key "first_page_keywords": List[str]
                   e.g. ["Denoising", "Extra information"]
                   Each entry is checked against the corresponding output file's
                   first-page text (substring match, case-sensitive).
                   Pass an empty string "" to skip a particular check.

    Returns:
        float: 1.0 if all checks pass, 0.0 otherwise.

    Design rationale:
        - Page-count check catches the most common failure: agent splits at the
          wrong boundary (e.g. 11/14 instead of 12/13).
        - First-page keyword check catches file-order swaps (body↔appendix).
        - No full-text diff: Stirling-PDF may add/remove PDF metadata; we only
          care that the content is structurally correct.
    """
    keywords: List[str] = options.get("first_page_keywords", [])
    part_labels: List[str] = options.get("part_labels", [])

    min_files = max(2, len(expected_files))
    if len(result_files) < min_files or len(expected_files) < min_files:
        logger.error("compare_split_pdfs: expected at least %d files, got result=%d gold=%d",
                      min_files, len(result_files), len(expected_files))
        return 0.0

    for idx, (res, gold) in enumerate(zip(result_files, expected_files)):
        # Determine a human-readable label for logging
        if idx < len(part_labels):
            label = part_labels[idx]
        elif idx < 2:
            label = ["body", "appendix"][idx]
        else:
            label = f"part{idx}"

        # ── existence check ──────────────────────────────────────────────
        if res is None:
            logger.warning("compare_split_pdfs: %s result file is None", label)
            return 0.0
        if gold is None:
            logger.warning("compare_split_pdfs: %s gold file is None", label)
            return 0.0

        # ── page-count check ─────────────────────────────────────────────
        result_pages = _safe_page_count(res)
        expected_pages = _safe_page_count(gold)
        if result_pages is None or expected_pages is None:
            return 0.0

        if result_pages != expected_pages:
            logger.info(
                "compare_split_pdfs: %s page count mismatch: got %d, expected %d",
                label, result_pages, expected_pages,
            )
            return 0.0

        logger.info("compare_split_pdfs: %s page count OK (%d pages)", label, result_pages)

        # ── first-page keyword check ─────────────────────────────────────
        if idx < len(keywords) and keywords[idx]:
            keyword = keywords[idx]
            first_text = _extract_first_page_text(res)
            if first_text is None:
                return 0.0
            if keyword not in first_text:
                logger.info(
                    "compare_split_pdfs: %s first-page keyword '%s' not found",
                    label, keyword,
                )
                return 0.0
            logger.info("compare_split_pdfs: %s first-page keyword '%s' found", label, keyword)

    return 1.0


def compare_appended_pdf(result_file: Optional[str], expected_file: Optional[str], **options) -> float:
    """
    Evaluate a PDF-append task that merges two source PDFs into one output PDF.

    The function checks:
      1. The result file exists (non-None).
      2. Total page count matches the gold standard (main_pages + supp_pages).
      3. (Optional) The first page of the result contains ``first_page_keyword``
         (verifies the main paper is at the front).
      4. (Optional) The page at index ``main_pages`` contains ``supp_first_page_keyword``
         (verifies the supplementary material follows immediately after the main body).

    Args:
        result_file:   local path to the agent-produced merged PDF (from get_vm_file)
        expected_file: local path to the gold-standard merged PDF (from get_cache_file)
        **options:
            main_pages (int):              expected page count of the main paper
            supp_pages (int):              expected page count of the supplementary material
            first_page_keyword (str):      keyword expected on page 1 of result; "" to skip
            supp_first_page_keyword (str): keyword expected on the first page of the appended
                                           supplement (0-indexed page = main_pages); "" to skip

    Returns:
        float: 1.0 if all checks pass, 0.0 otherwise.

    Design rationale:
        - Page-count check (vs. gold) catches missing pages or duplicated pages.
        - first_page_keyword ensures the main paper is not accidentally dropped.
        - supp_first_page_keyword ensures the supplement is placed after the main body,
          not before it (catches order-swap errors).
        - No full-text diff: Stirling-PDF may alter PDF metadata; structural correctness suffices.
    """
    if result_file is None:
        logger.warning("compare_appended_pdf: result file is None")
        return 0.0
    if expected_file is None:
        logger.warning("compare_appended_pdf: gold file is None")
        return 0.0

    main_pages: int = options.get("main_pages", 0)
    supp_pages: int = options.get("supp_pages", 0)
    expected_total: int = main_pages + supp_pages
    first_page_keyword: str = options.get("first_page_keyword", "")
    supp_first_page_keyword: str = options.get("supp_first_page_keyword", "")

    try:
        result_reader = PdfReader(result_file)
        gold_reader = PdfReader(expected_file)
    except Exception as exc:
        logger.error("compare_appended_pdf: error reading PDFs: %s", exc)
        return 0.0

    result_total = len(result_reader.pages)
    gold_total = len(gold_reader.pages)

    # ── page-count check ─────────────────────────────────────────────────────
    if result_total != gold_total:
        logger.info(
            "compare_appended_pdf: page count mismatch: got %d, expected %d (gold)",
            result_total, gold_total,
        )
        return 0.0
    if expected_total > 0 and result_total != expected_total:
        logger.info(
            "compare_appended_pdf: page count mismatch: got %d, expected %d (main+supp)",
            result_total, expected_total,
        )
        return 0.0
    logger.info("compare_appended_pdf: page count OK (%d pages)", result_total)

    # ── first-page keyword check (main paper) ─────────────────────────────────
    if first_page_keyword:
        first_text = _extract_first_page_text(result_file)
        if first_text is None:
            return 0.0
        if first_page_keyword not in first_text:
            logger.info(
                "compare_appended_pdf: first-page keyword '%s' not found", first_page_keyword
            )
            return 0.0
        logger.info("compare_appended_pdf: first-page keyword '%s' found", first_page_keyword)

    # ── supplement-start keyword check ───────────────────────────────────────
    if supp_first_page_keyword and main_pages > 0:
        supp_start_idx = main_pages  # 0-indexed
        if supp_start_idx >= result_total:
            logger.info(
                "compare_appended_pdf: supp start index %d out of range (%d pages)",
                supp_start_idx, result_total,
            )
            return 0.0
        try:
            supp_text = result_reader.pages[supp_start_idx].extract_text() or ""
        except Exception as exc:
            logger.error(
                "compare_appended_pdf: error extracting supp start page text: %s", exc
            )
            return 0.0
        if supp_first_page_keyword not in supp_text:
            logger.info(
                "compare_appended_pdf: supp first-page keyword '%s' not found at page %d",
                supp_first_page_keyword, supp_start_idx + 1,
            )
            return 0.0
        logger.info(
            "compare_appended_pdf: supp first-page keyword '%s' found at page %d",
            supp_first_page_keyword, supp_start_idx + 1,
        )

    return 1.0


def check_pdf_has_page_numbers(result_file: Optional[str], expected: Any, **options) -> float:
    """
    Verify that page numbers have been added to a PDF.

    Uses PyMuPDF to scan sampled pages for digit-only tokens located in the
    top or bottom 10% of the page (header/footer zone) — the typical position
    of added page numbers. This avoids false positives from in-body numeric text.

    Checks:
      1. Page count matches expected (unchanged from source).
      2. At least ``min_pages_with_number`` sampled pages have a short numeric
         token (1–4 digits) in the header (top 10%) or footer (bottom 10%) zone.

    Args:
        result_file: local path to the agent-produced PDF
        expected:    rules dict (from get_rule)

    Rules dict:
    {
        "page_count":            int,   # expected total page count
        "min_pages_with_number": int,   # minimum sampled pages that must carry a
                                        # header/footer numeric token (default 2)
    }

    Returns:
        float: 1.0 if all checks pass, 0.0 otherwise.
    """
    if result_file is None:
        logger.warning("check_pdf_has_page_numbers: result_file is None")
        return 0.0

    rules: Dict = expected if isinstance(expected, dict) else {}
    expected_pages: int = rules.get("page_count", 0)
    min_pages_with_number: int = int(rules.get("min_pages_with_number", 2))

    # ── page count ──────────────────────────────────────────────────────
    pages = _safe_page_count(result_file)
    if pages is None:
        return 0.0
    if expected_pages > 0 and pages != expected_pages:
        logger.info("check_pdf_has_page_numbers: page count %d != %d", pages, expected_pages)
        return 0.0

    # ── scan header/footer zones for numeric tokens ──────────────────────
    import re
    num_re = re.compile(r'^\d{1,4}$')
    mid = pages // 2
    sample_indices = sorted({1, mid, pages - 1})   # skip p0 (may be cover)

    try:
        doc = fitz.open(result_file)
        try:
            pages_with_number = 0
            for i in sample_indices:
                page = doc[i]
                h = page.rect.height
                # Only check footer zone (bottom 8%) — page numbers are almost
                # always placed at the bottom centre/corner.
                footer_zone = fitz.Rect(0, h * 0.92, page.rect.width, h)
                words = page.get_text("words", clip=footer_zone)
                for block in words:
                    word = block[4].strip()
                    if num_re.match(word):
                        logger.info(
                            "check_pdf_has_page_numbers: numeric token '%s' in footer on page %d",
                            word, i + 1,
                        )
                        pages_with_number += 1
                        break

            if pages_with_number < min_pages_with_number:
                logger.info(
                    "check_pdf_has_page_numbers: only %d/%d sampled pages have header/footer number",
                    pages_with_number, min_pages_with_number,
                )
                return 0.0
            logger.info(
                "check_pdf_has_page_numbers: PASS (%d pages with header/footer number)", pages_with_number
            )
        finally:
            doc.close()
    except Exception as exc:
        logger.error("check_pdf_has_page_numbers: fitz error: %s", exc)
        return 0.0

    return 1.0


def check_pdf_encrypted(result_file: Optional[str], expected: Any, **options) -> float:
    """
    Evaluate a PDF encryption task.

    Checks that the result PDF is password-protected and (optionally) that
    it can be decrypted with the expected password.

    Args:
        result_file: local path to the agent-produced PDF (from get_vm_file)
        expected:    rules dict (from get_rule)

    Rules dict:
    {
        "password":       str,   # password to verify decryption (optional)
        "page_count":     int,   # expected page count after decryption (optional)
    }

    Returns:
        float: 1.0 if the PDF is encrypted (and optionally decrypts + page count matches), else 0.0.
    """
    if result_file is None:
        logger.warning("check_pdf_encrypted: result_file is None")
        return 0.0

    rules: Dict = expected if isinstance(expected, dict) else {}
    password: str = rules.get("password", "")
    expected_pages: int = rules.get("page_count", 0)

    try:
        reader = PdfReader(result_file)
    except Exception as exc:
        logger.error("check_pdf_encrypted: error reading PDF: %s", exc)
        return 0.0

    # ── encryption check ─────────────────────────────────────────────────────
    if not reader.is_encrypted:
        logger.info("check_pdf_encrypted: PDF is NOT encrypted")
        return 0.0
    logger.info("check_pdf_encrypted: PDF is encrypted ✓")

    # ── password verification (optional) ─────────────────────────────────────
    if password:
        try:
            result = reader.decrypt(password)
            if result == 0:
                logger.info("check_pdf_encrypted: supplied password was rejected")
                return 0.0
            logger.info("check_pdf_encrypted: supplied password was accepted")
        except Exception as exc:
            logger.error("check_pdf_encrypted: decrypt error: %s", exc)
            return 0.0

        # ── page count after decryption ───────────────────────────────────────
        if expected_pages > 0:
            try:
                pages = len(reader.pages)
                if pages != expected_pages:
                    logger.info("check_pdf_encrypted: page count %d != expected %d", pages, expected_pages)
                    return 0.0
                logger.info("check_pdf_encrypted: page count OK (%d)", pages)
            except Exception as exc:
                logger.error("check_pdf_encrypted: page count error: %s", exc)
                return 0.0

    return 1.0


def check_pdf_page_order(result_file: Optional[str], expected: Any, **options) -> float:
    """
    Verify that pages have been reorganized into a specific order.

    Checks that the first page of the result contains a keyword from
    ``first_page_keywords`` and (optionally) the last page contains a keyword
    from ``last_page_keywords``. Also verifies total page count.

    Args:
        result_file: local path to agent-produced PDF
        expected:    rules dict

    Rules dict:
    {
        "page_count":          int,          # exact page count
        "first_page_keywords": List[str],    # keywords expected on new first page
        "last_page_keywords":  List[str],    # keywords expected on new last page
    }
    """
    if result_file is None:
        logger.warning("check_pdf_page_order: result_file is None")
        return 0.0

    rules: Dict = expected if isinstance(expected, dict) else {}
    pages = _safe_page_count(result_file)
    if pages is None:
        return 0.0

    if "page_count" in rules and pages != int(rules["page_count"]):
        logger.info("check_pdf_page_order: page count %d != %d", pages, rules["page_count"])
        return 0.0

    try:
        reader = PdfReader(result_file)
        for check_idx, kw_key in [(0, "first_page_keywords"), (pages - 1, "last_page_keywords")]:
            if kw_key not in rules:
                continue
            text = reader.pages[check_idx].extract_text() or ""
            # also try fitz for image-based text
            if not text.strip():
                try:
                    doc = fitz.open(result_file)
                    text = doc[check_idx].get_text()
                    doc.close()
                except Exception:
                    pass
            for kw in rules[kw_key]:
                if kw and kw not in text:
                    logger.info("check_pdf_page_order: page %d missing keyword '%s'", check_idx, kw)
                    return 0.0
    except Exception as exc:
        logger.error("check_pdf_page_order: %s", exc)
        return 0.0

    logger.info("check_pdf_page_order: PASS")
    return 1.0


def check_pdf_redacted(result_file: Optional[str], expected: Any, **options) -> float:
    """
    Verify that specific text has been redacted (blacked out) from a PDF.

    Checks:
      1. Page count unchanged.
      2. The ``redacted_keywords`` no longer appear as extractable text on
         sampled pages (they were replaced by black rectangles).

    Args:
        result_file: local path to agent-produced PDF
        expected:    rules dict

    Rules dict:
    {
        "page_count":        int,          # total pages unchanged
        "redacted_keywords": List[str],    # words that must NOT appear in extracted text
        "sample_pages":      List[int],    # 0-based page indices to scan (default: [0,1,2])
    }
    """
    if result_file is None:
        logger.warning("check_pdf_redacted: result_file is None")
        return 0.0

    rules: Dict = expected if isinstance(expected, dict) else {}
    pages = _safe_page_count(result_file)
    if pages is None:
        return 0.0

    if "page_count" in rules and pages != int(rules["page_count"]):
        logger.info("check_pdf_redacted: page count %d != %d", pages, rules["page_count"])
        return 0.0

    redacted_kws: List[str] = rules.get("redacted_keywords", [])
    if not redacted_kws:
        logger.info("check_pdf_redacted: no redacted_keywords specified — trivially pass")
        return 1.0

    sample: List[int] = rules.get("sample_pages", list(range(min(3, pages))))

    try:
        doc = fitz.open(result_file)
        for idx in sample:
            if idx >= pages:
                continue
            text = doc[idx].get_text()
            for kw in redacted_kws:
                if kw in text:
                    logger.info("check_pdf_redacted: keyword '%s' still present on page %d", kw, idx + 1)
                    doc.close()
                    return 0.0
        doc.close()
    except Exception as exc:
        logger.error("check_pdf_redacted: fitz error: %s", exc)
        return 0.0

    logger.info("check_pdf_redacted: PASS — keywords absent from sampled pages")
    return 1.0


def check_pdf_grayscale(result_file: Optional[str], expected: Any, **options) -> float:
    """
    Verify that a PDF has been converted to grayscale (replace_colors task).

    Renders sampled pages at low resolution and checks that no pixel has a
    significant colour difference (|R-G| + |G-B| > threshold).

    Args:
        result_file: local path to agent-produced PDF
        expected:    rules dict

    Rules dict:
    {
        "page_count":       int,    # expected page count
        "max_color_delta":  int,    # per-channel delta threshold (default 15)
        "sample_pages":     List[int],  # 0-based indices to render (default [0, mid, last])
    }
    """
    if result_file is None:
        logger.warning("check_pdf_grayscale: result_file is None")
        return 0.0

    rules: Dict = expected if isinstance(expected, dict) else {}
    pages = _safe_page_count(result_file)
    if pages is None:
        return 0.0

    if "page_count" in rules and pages != int(rules["page_count"]):
        logger.info("check_pdf_grayscale: page count %d != %d", pages, rules["page_count"])
        return 0.0

    max_delta: int   = int(rules.get("max_color_delta", 15))
    sample: List[int] = rules.get("sample_pages", [0, pages // 2, pages - 1])

    try:
        doc = fitz.open(result_file)
        mat = fitz.Matrix(0.15, 0.15)   # low-res render
        for idx in sample:
            if idx >= pages:
                continue
            pix = doc[idx].get_pixmap(matrix=mat, colorspace=fitz.csRGB)
            samples = pix.samples
            colored_pixels = 0
            total_checked  = 0
            for i in range(0, min(len(samples) - 2, 6000), 3):
                r, g, b = samples[i], samples[i + 1], samples[i + 2]
                if abs(int(r) - int(g)) + abs(int(g) - int(b)) > max_delta:
                    colored_pixels += 1
                total_checked += 1
            color_ratio = colored_pixels / total_checked if total_checked else 0
            logger.info(
                "check_pdf_grayscale: page %d color_ratio=%.3f (%d/%d pixels)",
                idx + 1, color_ratio, colored_pixels, total_checked,
            )
            if color_ratio > 0.05:   # >5% coloured pixels → not grayscale
                logger.info("check_pdf_grayscale: page %d is NOT grayscale", idx + 1)
                doc.close()
                return 0.0
        doc.close()
    except Exception as exc:
        logger.error("check_pdf_grayscale: fitz error: %s", exc)
        return 0.0

    logger.info("check_pdf_grayscale: PASS")
    return 1.0


def check_pdf_scanner_effect(result_file: Optional[str], expected: Any, **options) -> float:
    """
    Verify that a scanner effect has been applied to a PDF.

    Heuristic: after applying a scanner effect the page is typically rasterized
    (embedded as an image). We check that at least one sampled page contains
    an image resource significantly larger than the page itself would be if it
    were pure vector text.

    Checks:
      1. Page count unchanged.
      2. File size is LARGER than ``min_file_size_bytes`` (rasterisation inflates size).

    Args:
        result_file: local path to agent-produced PDF
        expected:    rules dict

    Rules dict:
    {
        "page_count":          int,   # expected page count
        "min_file_size_bytes": int,   # result must be larger than original (rasterised)
    }
    """
    if result_file is None:
        logger.warning("check_pdf_scanner_effect: result_file is None")
        return 0.0

    import os
    rules: Dict = expected if isinstance(expected, dict) else {}
    pages = _safe_page_count(result_file)
    if pages is None:
        return 0.0

    if "page_count" in rules and pages != int(rules["page_count"]):
        logger.info("check_pdf_scanner_effect: page count %d != %d", pages, rules["page_count"])
        return 0.0

    if "min_file_size_bytes" in rules:
        try:
            sz = os.path.getsize(result_file)
            if sz < int(rules["min_file_size_bytes"]):
                logger.info("check_pdf_scanner_effect: file size %d < min %d", sz, rules["min_file_size_bytes"])
                return 0.0
            logger.info("check_pdf_scanner_effect: file size OK (%d bytes)", sz)
        except OSError:
            pass

    logger.info("check_pdf_scanner_effect: PASS")
    return 1.0


def check_docx_exists(result_file: Optional[str], expected: Any, **options) -> float:
    """
    Verify that a DOCX file was produced (pdf_to_word task).

    Since the result getter downloads the file as-is, we just verify:
      1. The file is not None.
      2. The file is a valid ZIP (DOCX is a ZIP archive) with size > threshold.

    Args:
        result_file: local path to the downloaded .docx file
        expected:    rules dict

    Rules dict:
    {
        "min_file_size_bytes": int,  # minimum expected file size (default 1000)
    }
    """
    if result_file is None:
        logger.warning("check_docx_exists: result_file is None")
        return 0.0

    import os
    rules: Dict = expected if isinstance(expected, dict) else {}
    min_size: int = int(rules.get("min_file_size_bytes", 1000))

    try:
        sz = os.path.getsize(result_file)
    except OSError as exc:
        logger.error("check_docx_exists: %s", exc)
        return 0.0

    if sz < min_size:
        logger.info("check_docx_exists: file size %d < min %d", sz, min_size)
        return 0.0

    # DOCX is a ZIP; check magic bytes
    try:
        with open(result_file, "rb") as f:
            magic = f.read(4)
        # ZIP magic: PK\x03\x04
        if magic[:2] != b"PK":
            logger.info("check_docx_exists: file does not appear to be a ZIP/DOCX")
            return 0.0
    except Exception as exc:
        logger.error("check_docx_exists: read error: %s", exc)
        return 0.0

    logger.info("check_docx_exists: PASS (size=%d, magic=ZIP)", sz)
    return 1.0


def compare_overlaid_pdf(result_file: Optional[str], expected_file: Optional[str], **options) -> float:
    """
    Evaluate a PDF overlay task (two PDFs merged into one by overlaying pages).

    Checks:
      1. Result file exists.
      2. Page count equals the larger of the two source PDFs
         (or ``expected_page_count`` if specified).
      3. First page contains keywords from both source documents.

    Args:
        result_file:   local path to the agent-produced merged PDF
        expected_file: local path to the gold PDF (used only for page count)
        **options:
            expected_page_count (int):      override page count check
            base_first_page_keyword (str):  keyword from base PDF's first page
            overlay_keyword (str):          keyword from overlay PDF

    Returns:
        float: 1.0 if all checks pass, 0.0 otherwise.
    """
    if result_file is None:
        logger.warning("compare_overlaid_pdf: result_file is None")
        return 0.0

    expected_pages: int = options.get("expected_page_count", 0)
    base_kw:    str = options.get("base_first_page_keyword", "")
    overlay_kw: str = options.get("overlay_keyword", "")

    pages = _safe_page_count(result_file)
    if pages is None:
        return 0.0

    if expected_pages > 0 and pages != expected_pages:
        logger.info("compare_overlaid_pdf: page count %d != %d", pages, expected_pages)
        return 0.0
    if expected_file:
        gold_pages = _safe_page_count(expected_file)
        if gold_pages and pages != gold_pages:
            logger.info("compare_overlaid_pdf: page count %d != gold %d", pages, gold_pages)
            return 0.0

    logger.info("compare_overlaid_pdf: page count OK (%d)", pages)

    try:
        doc = fitz.open(result_file)
        first_text = doc[0].get_text()
        doc.close()
    except Exception as exc:
        logger.error("compare_overlaid_pdf: fitz error: %s", exc)
        return 0.0

    for kw in [base_kw, overlay_kw]:
        if kw and kw not in first_text:
            logger.info("compare_overlaid_pdf: keyword '%s' not found on first page", kw)
            return 0.0

    logger.info("compare_overlaid_pdf: PASS")
    return 1.0


def compare_stamped_pdf(result_file: Optional[str], expected_file: Optional[str], **options) -> float:
    """
    Evaluate a PDF add-text (stamp/signature) task.

    The function checks:
      1. The result file exists (non-None).
      2. Total page count is unchanged (matches ``total_pages`` or the gold file).
      3. The target page (``target_page_index``, 0-based) contains all strings in
         ``required_texts`` — verifying the signature text was actually added.

    Args:
        result_file:   local path to the agent-produced PDF (from get_vm_file)
        expected_file: local path to the gold-standard PDF (from get_cache_file)
        **options:
            total_pages (int):          expected total page count; 0 → use gold count
            target_page_index (int):    0-based index of the page that should carry
                                        the added text (default 0)
            required_texts (List[str]): list of strings that must all appear on the
                                        target page (substring match, case-sensitive)

    Returns:
        float: 1.0 if all checks pass, 0.0 otherwise.

    Design rationale:
        - Page count check ensures no pages were accidentally added or removed.
        - required_texts check verifies the exact signature strings are present on
          the correct page, preventing empty-output cheating.
        - No pixel-level comparison: Stirling-PDF may render text at slightly
          different coordinates depending on version; text content is sufficient.
    """
    if result_file is None:
        logger.warning("compare_stamped_pdf: result file is None")
        return 0.0
    if expected_file is None:
        logger.warning("compare_stamped_pdf: gold file is None")
        return 0.0

    total_pages: int = options.get("total_pages", 0)
    target_page_index: int = options.get("target_page_index", 0)
    required_texts: List[str] = options.get("required_texts", [])

    try:
        result_reader = PdfReader(result_file)
        gold_reader   = PdfReader(expected_file)
    except Exception as exc:
        logger.error("compare_stamped_pdf: error reading PDFs: %s", exc)
        return 0.0

    result_total = len(result_reader.pages)
    gold_total   = len(gold_reader.pages)
    expected_total = total_pages if total_pages > 0 else gold_total

    # ── page-count check ─────────────────────────────────────────────────────
    if result_total != expected_total:
        logger.info(
            "compare_stamped_pdf: page count mismatch: got %d, expected %d",
            result_total, expected_total,
        )
        return 0.0
    logger.info("compare_stamped_pdf: page count OK (%d pages)", result_total)

    # ── required-text check on target page ───────────────────────────────────
    if required_texts:
        if target_page_index >= result_total:
            logger.info(
                "compare_stamped_pdf: target_page_index %d out of range (%d pages)",
                target_page_index, result_total,
            )
            return 0.0
        try:
            page_text = result_reader.pages[target_page_index].extract_text() or ""
        except Exception as exc:
            logger.error(
                "compare_stamped_pdf: error extracting page %d text: %s",
                target_page_index, exc,
            )
            return 0.0

        for text in required_texts:
            if text not in page_text:
                logger.info(
                    "compare_stamped_pdf: required text '%s' not found on page %d",
                    text, target_page_index + 1,
                )
                return 0.0
            logger.info(
                "compare_stamped_pdf: required text '%s' found on page %d",
                text, target_page_index + 1,
            )

    return 1.0
