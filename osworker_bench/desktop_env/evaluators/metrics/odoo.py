"""
Odoo Evaluator Metrics — Composable Primitives
================================================

DESIGN PHILOSOPHY (same as chrome.py)
--------------------------------------
Evaluator functions are composable, parametric primitives:

  chrome.py pattern:  check_font_size(result, rule)  — dispatches on rule['type']
  odoo.py pattern:    check_odoo_result(result, rules) — dispatches on checks[].op

Both follow the same principle: basic reusable functions + parameters,
NOT monolithic per-task functions.

ARCHITECTURE
------------
  1. Primitive check functions  — each tests ONE thing (_prim_field_compare, etc.)
  2. check_odoo_result()        — generic combinator that runs any set of
                                  primitives declared in the task JSON

Most new tasks need ZERO new Python code — just new JSON rules.
When a genuinely new check dimension is needed, add a new primitive
(make it parametric and reusable, like chrome.py functions).

ENTRY POINT (use this in all new task JSONs)
--------------------------------------------
  "func": "check_odoo_result"

  "expected": {
    "type": "rule",
    "rules": {
      "model": "hr.expense.sheet",
      "checks": [
        {"op": "min_records",          "value": 1},
        {"op": "field_ge",             "field": "total_amount", "value": 83.0},
        {"op": "related_count_ge",     "related_field": "expense_line_ids", "value": 2},
        {"op": "any_related_keyword",  "related_field": "expense_line_ids",
                                       "text_fields": ["name", "product_name"],
                                       "keywords": ["taxi"]}
      ]
    }
  }

PRIMITIVE OPERATIONS (ops)
--------------------------
Record-level (applied to each candidate record):
  field_eq        field == value
  field_ne        field != value
  field_ge        field >= value  (numeric)
  field_le        field <= value  (numeric)
  field_gt        field >  value  (numeric)
  field_lt        field <  value  (numeric)
  field_contains  value in str(field)  (case-insensitive)

  related_count_ge   len(record[related_field]) >= value
  any_related_keyword  any related record text field contains any keyword

  state_in           record["state"] in allowed_states list

Global (applied across all candidate records):
  min_records        total candidates >= value  (default 1)

HOW THE RESULT JSON IS STRUCTURED (from check_odoo.py)
-------------------------------------------------------
  {
    "ok": true,
    "model": "hr.expense.sheet",
    "records": [
      {
        "id": 42,
        "name": "...",
        "state": "draft",
        "total_amount": 83.5,
        "expense_line_ids": [
          {"id": 7, "name": "Taxi to airport", "total_amount": 35.0,
           "product_name": "Taxi"},
          {"id": 8, "name": "Taxi from hotel",  "total_amount": 48.5,
           "product_name": "Taxi"}
        ],
        ...
      }
    ],
    "error": null
  }

LEGACY FUNCTIONS (kept for backward compatibility)
--------------------------------------------------
  check_odoo_expense_report    → wraps check_odoo_result
  check_odoo_record_created    → wraps check_odoo_result
  check_odoo_invoice_created   → wraps check_odoo_result
  check_odoo_contact_created   → wraps check_odoo_result

ADDING NEW CHECK SCRIPTS
------------------------
New tasks should use the SINGLE generic script:
  setup/odoo/tasks/check_odoo.py  --model <MODEL> [--fields f1,f2,...] [--related field:subfield,...]

This replaces all old check_expense_report.py, check_invoice_created.py etc.
"""

import json
import logging
import operator as _op
from typing import Any, Dict, List, Optional

logger = logging.getLogger("desktopenv.metric.odoo")


# ═══════════════════════════════════════════════════════════════════════════
# JSON helpers
# ═══════════════════════════════════════════════════════════════════════════

def _parse(result: Any) -> Optional[Any]:
    if result is None:
        return None
    if isinstance(result, (dict, list)):
        return result
    if isinstance(result, str):
        result = result.strip()
        if not result:
            return None
        try:
            return json.loads(result)
        except json.JSONDecodeError as e:
            logger.warning("JSON parse failed: %s | input=%.200s", e, result)
    return None


# ═══════════════════════════════════════════════════════════════════════════
# Primitive operations
# ═══════════════════════════════════════════════════════════════════════════

_OPS = {
    "field_eq":  _op.eq,
    "field_ne":  _op.ne,
    "field_ge":  _op.ge,
    "field_le":  _op.le,
    "field_gt":  _op.gt,
    "field_lt":  _op.lt,
}


def _prim_field_compare(record: Dict, check: Dict) -> bool:
    """field_{eq,ne,ge,le,gt,lt}: compare record[field] against value."""
    op_name = check["op"]
    field   = check["field"]
    ref     = check["value"]
    val     = record.get(field)
    if val is None:
        return False
    try:
        if op_name in ("field_ge", "field_le", "field_gt", "field_lt"):
            val = float(val)
            ref = float(ref)
        return _OPS[op_name](val, ref)
    except (TypeError, ValueError) as e:
        logger.debug("_prim_field_compare error: %s | field=%s val=%s ref=%s", e, field, val, ref)
        return False


def _prim_field_contains(record: Dict, check: Dict) -> bool:
    """field_contains: str(check['value']).lower() in str(record[field]).lower()"""
    field = check["field"]
    ref   = str(check["value"]).lower()
    val   = str(record.get(field, "")).lower()
    return ref in val


def _prim_related_count_ge(record: Dict, check: Dict) -> bool:
    """related_count_ge: len(record[related_field]) >= value"""
    rel_field = check["related_field"]
    min_count = int(check["value"])
    items = record.get(rel_field, [])
    if isinstance(items, list):
        return len(items) >= min_count
    return False


def _prim_any_related_keyword(record: Dict, check: Dict) -> bool:
    """
    any_related_keyword: for each keyword, at least one related item's
    text fields (name, product_name, etc.) contains it.
    All keywords must be satisfied.
    """
    rel_field   = check["related_field"]
    text_fields = check.get("text_fields", ["name"])
    keywords    = [str(k).lower() for k in check.get("keywords", [])]
    items       = record.get(rel_field, [])

    if not keywords:
        return True
    if not items:
        return False

    for kw in keywords:
        satisfied = False
        for item in items:
            combined = " ".join(str(item.get(f, "")) for f in text_fields).lower()
            if kw in combined:
                satisfied = True
                break
        if not satisfied:
            logger.debug("_prim_any_related_keyword: keyword '%s' not found in %d items", kw, len(items))
            return False
    return True


def _prim_any_related_field_ge(record: Dict, check: Dict) -> bool:
    """
    any_related_field_ge: at least one related record has numeric field >= value.
    Useful for checking discount, quantity, price on order lines.

    Example: {"op": "any_related_field_ge", "related_field": "order_line",
               "field": "discount", "value": 10}
    """
    rel_field = check["related_field"]
    field     = check["field"]
    min_val   = float(check["value"])
    items     = record.get(rel_field, [])
    if not isinstance(items, list):
        return False
    for item in items:
        try:
            if float(item.get(field, 0)) >= min_val:
                return True
        except (TypeError, ValueError):
            pass
    logger.debug("_prim_any_related_field_ge: no item has %s >= %s in %d items",
                 field, min_val, len(items))
    return False


def _prim_state_in(record: Dict, check: Dict) -> bool:
    """state_in: record['state'] in check['states']"""
    allowed = check.get("states", [])
    return record.get("state", "") in allowed


_PRIM_DISPATCH = {
    "field_eq":               _prim_field_compare,
    "field_ne":               _prim_field_compare,
    "field_ge":               _prim_field_compare,
    "field_le":               _prim_field_compare,
    "field_gt":               _prim_field_compare,
    "field_lt":               _prim_field_compare,
    "field_contains":         _prim_field_contains,
    "related_count_ge":       _prim_related_count_ge,
    "any_related_keyword":    _prim_any_related_keyword,
    "any_related_field_ge":   _prim_any_related_field_ge,
    "state_in":               _prim_state_in,
}


# ═══════════════════════════════════════════════════════════════════════════
# Core engine
# ═══════════════════════════════════════════════════════════════════════════

def _run_checks(records: List[Dict], checks: List[Dict]) -> bool:
    """
    Return True if at least one record satisfies ALL per-record checks.
    Global checks (min_records) are handled separately.
    """
    per_record_checks = [c for c in checks if c.get("op") != "min_records"]

    for record in records:
        if all(
            _PRIM_DISPATCH[c["op"]](record, c)
            for c in per_record_checks
            if c["op"] in _PRIM_DISPATCH
        ):
            logger.info("_run_checks: PASS on record id=%s", record.get("id"))
            return True

    logger.info("_run_checks: no record satisfied all per-record checks")
    return False


# ═══════════════════════════════════════════════════════════════════════════
# ★ PRIMARY ENTRY POINT — use this for all new tasks
# ═══════════════════════════════════════════════════════════════════════════

def check_odoo_result(result: Any, expected: Any, **options) -> float:
    """
    Generic Odoo evaluator — driven entirely by JSON rules.

    Result JSON (from setup/odoo/tasks/check_odoo.py):
    {
        "ok": true,
        "model": "hr.expense.sheet",
        "records": [...],
        "error": null
    }

    Rules (evaluator.expected.rules):
    {
        "model": "hr.expense.sheet",      # optional, for logging only
        "checks": [
            {"op": "min_records",         "value": 1},
            {"op": "field_ge",            "field": "total_amount",  "value": 83.0},
            {"op": "related_count_ge",    "related_field": "expense_line_ids", "value": 2},
            {"op": "any_related_keyword", "related_field": "expense_line_ids",
                                          "text_fields": ["name", "product_name"],
                                          "keywords": ["taxi"]},
            {"op": "state_in",            "states": ["draft", "submit", "posted"]}
        ]
    }
    """
    data = _parse(result)
    if data is None or not data.get("ok", False):
        logger.warning("check_odoo_result: bad result: %.200s", str(result))
        return 0.0

    records: List[Dict] = data.get("records", [])
    rules:   Dict       = expected if isinstance(expected, dict) else {}
    checks:  List[Dict] = rules.get("checks", [])

    if not checks:
        logger.warning("check_odoo_result: no checks defined — trivially passing")
        return 1.0 if records else 0.0

    # Global: min_records
    for c in checks:
        if c.get("op") == "min_records":
            if len(records) < int(c.get("value", 1)):
                logger.info("check_odoo_result: FAIL min_records %d (got %d)",
                            c["value"], len(records))
                return 0.0

    if not records:
        logger.info("check_odoo_result: no records found")
        return 0.0

    return 1.0 if _run_checks(records, checks) else 0.0


# ═══════════════════════════════════════════════════════════════════════════
# Legacy wrappers (backward-compat — translate old rules → new checks)
# ═══════════════════════════════════════════════════════════════════════════

def _legacy_to_checks(rules: Dict, model_hint: str = "") -> Dict:
    """Convert legacy rules dicts to new-style checks list."""
    checks = [{"op": "min_records", "value": int(rules.get("min_records", 1))}]

    # expense-report rules
    if "min_expense_lines" in rules:
        checks.append({"op": "related_count_ge",
                       "related_field": "expense_line_ids",
                       "value": rules["min_expense_lines"]})
    if "product_keywords" in rules:
        checks.append({"op": "any_related_keyword",
                       "related_field": "expense_line_ids",
                       "text_fields": ["name", "product_name"],
                       "keywords": rules["product_keywords"]})
    if "min_total_amount" in rules:
        checks.append({"op": "field_ge", "field": "total_amount",
                       "value": rules["min_total_amount"]})
    if "max_total_amount" in rules and rules["max_total_amount"] is not None:
        checks.append({"op": "field_le", "field": "total_amount",
                       "value": rules["max_total_amount"]})
    if rules.get("require_submit"):
        checks.append({"op": "state_in",
                       "states": ["submit", "posted", "done", "validate"]})

    # invoice rules
    if "move_type" in rules:
        checks.append({"op": "field_eq", "field": "move_type", "value": rules["move_type"]})
    if "min_amount" in rules:
        checks.append({"op": "field_ge", "field": "amount_total", "value": rules["min_amount"]})
    if "max_amount" in rules and rules["max_amount"] is not None:
        checks.append({"op": "field_le", "field": "amount_total", "value": rules["max_amount"]})
    if "min_lines" in rules:
        checks.append({"op": "related_count_ge",
                       "related_field": "invoice_line_ids",
                       "value": rules["min_lines"]})
    if rules.get("partner_keyword"):
        checks.append({"op": "field_contains", "field": "partner_name",
                       "value": rules["partner_keyword"]})
    if rules.get("require_confirm"):
        checks.append({"op": "state_in", "states": ["posted"]})

    # contact rules
    if "name_keyword" in rules and rules["name_keyword"]:
        checks.append({"op": "field_contains", "field": "name", "value": rules["name_keyword"]})
    if "email_keyword" in rules and rules["email_keyword"]:
        checks.append({"op": "field_contains", "field": "email", "value": rules["email_keyword"]})
    if "phone_keyword" in rules and rules["phone_keyword"]:
        checks.append({"op": "field_contains", "field": "phone", "value": rules["phone_keyword"]})
    if rules.get("is_customer") is True:
        checks.append({"op": "field_ge", "field": "customer_rank", "value": 1})
    if rules.get("is_supplier") is True:
        checks.append({"op": "field_ge", "field": "supplier_rank", "value": 1})

    # generic field_rules
    for fr in rules.get("field_rules", []):
        method = fr.get("method", "eq")
        op_map = {"eq": "field_eq", "ne": "field_ne",
                  "ge": "field_ge", "le": "field_le",
                  "gt": "field_gt", "lt": "field_lt",
                  "contains": "field_contains"}
        op = op_map.get(method, "field_eq")
        checks.append({"op": op, "field": fr["field"], "value": fr["ref"]})

    return {"model": model_hint, "checks": checks}


def check_odoo_expense_report(result: Any, expected: Any, **options) -> float:
    """Legacy wrapper → check_odoo_result."""
    rules = expected if isinstance(expected, dict) else {}
    new_rules = _legacy_to_checks(rules, model_hint="hr.expense.sheet")
    return check_odoo_result(result, new_rules, **options)


def check_odoo_record_created(result: Any, expected: Any, **options) -> float:
    """Legacy wrapper → check_odoo_result."""
    rules = expected if isinstance(expected, dict) else {}
    new_rules = _legacy_to_checks(rules)
    return check_odoo_result(result, new_rules, **options)


def check_odoo_invoice_created(result: Any, expected: Any, **options) -> float:
    """Legacy wrapper → check_odoo_result."""
    rules = expected if isinstance(expected, dict) else {}
    new_rules = _legacy_to_checks(rules, model_hint="account.move")
    return check_odoo_result(result, new_rules, **options)


def check_odoo_contact_created(result: Any, expected: Any, **options) -> float:
    """Legacy wrapper → check_odoo_result."""
    rules = expected if isinstance(expected, dict) else {}
    new_rules = _legacy_to_checks(rules, model_hint="res.partner")
    return check_odoo_result(result, new_rules, **options)
