from app.analysis.engine import analyze_text_engine

def test_guaranteed_returns_detection():
    text = "Get 100% guaranteed returns on your stock portfolio today!"
    res = analyze_text_engine(text)
    assert res["risk_level"] == "HIGH"
    assert any(s["category"] == "GUARANTEED_RETURNS" for s in res["signals"])

def test_hindi_taxonomies():
    text = "बिना जोखिम पक्का फायदा तुरंत रजिस्टर करें"
    res = analyze_text_engine(text)
    assert res["risk_level"] in ["MEDIUM", "HIGH"]

def test_ip_link_detection():
    text = "Check your stock profits here: http://192.168.1.1/login"
    res = analyze_text_engine(text)
    assert res["risk_level"] == "HIGH"
    assert any(s["category"] == "SUSPICIOUS_LINK_IP" for s in res["signals"])

def test_clean_text():
    text = "Hello, what is the stock price of TCS today?"
    res = analyze_text_engine(text)
    assert res["risk_level"] == "NONE"
    assert len(res["signals"]) == 0