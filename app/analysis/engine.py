import re
from typing import List, Dict, Any
from app.analysis.taxonomy import RULES
from app.analysis.links import check_links

def normalize_text(text: str) -> str:
    return " ".join(text.split())

def analyze_text_engine(text: str) -> Dict[str, Any]:
    norm_text = normalize_text(text)
    signals: List[Dict[str, Any]] = []

    # 1. Check Taxonomy Regex Rules
    for rule in RULES:
        for pattern in rule["patterns"]:
            regex = re.compile(pattern, re.IGNORECASE)
            for match in regex.finditer(norm_text):
                signals.append({
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "evidence": match.group(0),
                    "span": [match.start(), match.end()],
                    "explanation_en": rule["explanation_en"],
                    "explanation_hi": rule["explanation_hi"]
                })

    # 2. Check Link Security
    signals.extend(check_links(norm_text))

    # Determine Risk Level
    severities = [s["severity"] for s in signals]
    if "HIGH" in severities:
        risk_level = "HIGH"
    elif "MEDIUM" in severities:
        risk_level = "MEDIUM"
    elif "LOW" in severities:
        risk_level = "LOW"
    else:
        risk_level = "NONE"

    # Default Guidance Steps
    actions = [
        "PAUSE: Stop any immediate transfers or registrations.",
        "VERIFY: Cross-check claims using official SEBI/NSDL sources.",
        "ASK: Consult a trusted contact from your circle before acting."
    ]

    verify_steps = [
        "Check registered intermediaries at: https://www.sebi.gov.in",
        "Verify suspicious entities on SEBI SCORES portal.",
        "Report financial fraud immediately on cybercrime.gov.in or helpline 1930."
    ]

    return {
        "risk_level": risk_level,
        "signals": signals,
        "actions": actions,
        "verify_steps": verify_steps
    }