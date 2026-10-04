import re

RULES = [
    {
        "category": "GUARANTEED_RETURNS",
        "severity": "HIGH",
        "patterns": [
            r"\b(100%|guaranteed|fixed|risk-free)\s+(returns?|profits?)\b",
            r"\b(गारंटीड|पक्का|बिना\s+जोखिम)\s+(रिटर्न|मुनाफा|लाभ)\b"
        ],
        "explanation_en": "Promises of fixed or guaranteed high returns are classic signs of financial fraud. Real market investments carry risk.",
        "explanation_hi": "फिक्स्ड या गारंटीड रिटर्न का वादा वित्तीय धोखाधड़ी का स्पष्ट संकेत है। वास्तविक बाजार निवेश में जोखिम होता है।"
    },
    {
        "category": "URGENCY_PRESSURE",
        "severity": "MEDIUM",
        "patterns": [
            r"\b(act\s+now|limited\s+time|urgent|expires\s+today|hurry)\b",
            r"\b(तुरंत|अभी|सीमित\s+समय|आज\nही|जल्दी\s+करें)\b"
        ],
        "explanation_en": "High-pressure urgency tactics try to prevent you from double-checking facts or consulting trusted people.",
        "explanation_hi": "दबाव बनाने वाली रणनीति आपको तथ्यों की जांच करने या भरोसेमंद लोगों से सलाह लेने से रोकने के लिए होती है।"
    },
    {
        "category": "UNREGISTERED_ENTITY",
        "severity": "HIGH",
        "patterns": [
            r"\b(whatsapp|telegram)\s+(group|channel|vip|signals)\b",
            r"\b(व्हाट्सएप|टेलीग्राम)\s+(ग्रुप|चैनल|सिग्नल)\b"
        ],
        "explanation_en": "SEBI-registered advisors rarely operate exclusive stock-tip groups on messaging apps like WhatsApp or Telegram.",
        "explanation_hi": "सेबी (SEBI) से पंजीकृत सलाहकार आमतौर पर व्हाट्सएप या टेलीग्राम पर स्टॉक-टिप ग्रुप नहीं चलाते हैं।"
    }
]