import re
from typing import Any


# Patterns for common sensitive information.
# These are intentionally conservative and are used only for redaction
# before information is shared with a trusted contact.
SENSITIVE_PATTERNS = [
    # Email addresses
    (
        re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
        "[REDACTED EMAIL]",
    ),

    # Indian mobile numbers
    (
        re.compile(r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)"),
        "[REDACTED PHONE]",
    ),

    # PAN-like identifiers
    (
        re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"),
        "[REDACTED PAN]",
    ),

    # Aadhaar-like 12 digit numbers
    (
        re.compile(r"(?<!\d)\d{4}[\s-]?\d{4}[\s-]?\d{4}(?!\d)"),
        "[REDACTED ID]",
    ),

    # Long card/account-like numbers
    (
        re.compile(r"(?<!\d)(?:\d[\s-]?){13,19}(?!\d)"),
        "[REDACTED FINANCIAL NUMBER]",
    ),
]


def redact_sensitive_info(text: str) -> str:
    """
    Redact common personally identifiable or financial information
    before a message is shared with a trusted contact.

    The original text is never modified in-place.
    """
    if not text:
        return text

    redacted = text

    for pattern, replacement in SENSITIVE_PATTERNS:
        redacted = pattern.sub(replacement, redacted)

    return redacted


def sanitize_analysis_for_sharing(
    analysis: Any,
    share_analysis: bool = True,
) -> dict | None:
    """
    Prepare an analysis result for sharing with a trusted contact.

    Only non-sensitive safety information is retained.
    Investment recommendations, if ever present in an analysis object,
    are deliberately excluded from the shared payload.
    """
    if not share_analysis or not analysis:
        return None

    if hasattr(analysis, "model_dump"):
        data = analysis.model_dump()
    elif hasattr(analysis, "dict"):
        data = analysis.dict()
    elif isinstance(analysis, dict):
        data = dict(analysis)
    else:
        return {"summary": str(analysis)}

    allowed_fields = {
        "risk_level",
        "signals",
        "actions",
        "explanation",
        "warnings",
        "ocr_low_confidence",
    }

    sanitized = {
        key: data[key]
        for key in allowed_fields
        if key in data
    }

    return sanitized
