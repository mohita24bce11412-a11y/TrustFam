import re
from urllib.parse import urlparse

SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "rb.gy"}
OFFICIAL_DOMAINS = {"sebi.gov.in", "nsdl.co.in", "cdslindia.com"}
RISKY_TLDS = {".xyz", ".top", ".work", ".click", ".loans", ".vip"}

URL_REGEX = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+', re.IGNORECASE)

def check_links(text: str):
    signals = []
    matches = list(URL_REGEX.finditer(text))
    
    for match in matches:
        raw_url = match.group(0)
        span = [match.start(), match.end()]
        parsed = urlparse(raw_url if raw_url.startswith("http") else f"http://{raw_url}")
        netloc = parsed.netloc.lower()

        # Check IP address host
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", netloc):
            signals.append({
                "category": "SUSPICIOUS_LINK_IP",
                "severity": "HIGH",
                "evidence": raw_url,
                "span": span,
                "explanation_en": "Links using raw IP addresses instead of domain names are highly suspicious.",
                "explanation_hi": "डोमेन नाम के बजाय आईपी एड्रेस (IP address) वाले लिंक बेहद संदिग्ध होते हैं।"
            })

        # Check Shorteners
        elif netloc in SHORTENERS:
            signals.append({
                "category": "SHORTENED_URL",
                "severity": "MEDIUM",
                "evidence": raw_url,
                "span": span,
                "explanation_en": "Shortened links hide the real destination domain.",
                "explanation_hi": "छोटे किए गए लिंक वास्तविक वेबसाइट को छिपाते हैं।"
            })

        # Check Look-alike / Impersonation
        for official in OFFICIAL_DOMAINS:
            name_part = official.split('.')[0]
            if name_part in netloc and netloc != official:
                signals.append({
                    "category": "IMPERSONATED_DOMAIN",
                    "severity": "HIGH",
                    "evidence": raw_url,
                    "span": span,
                    "explanation_en": f"This link resembles official domain '{official}' but does not match it exact. Potential phishing attempt.",
                    "explanation_hi": f"यह लिंक आधिकारिक डोमेन '{official}' जैसा दिखता है, लेकिन मूल नहीं है। यह फ़िशिंग हो सकती है।"
                })

        # Risky TLDs
        if any(netloc.endswith(tld) for tld in RISKY_TLDS):
            signals.append({
                "category": "RISKY_TLD",
                "severity": "MEDIUM",
                "evidence": raw_url,
                "span": span,
                "explanation_en": "Link uses a top-level domain frequently associated with low-cost spam or fraud schemes.",
                "explanation_hi": "यह लिंक ऐसे एक्सटेंशन का उपयोग करता है जो अक्सर धोखाधड़ी से जुड़े होते हैं।"
            })

    return signals