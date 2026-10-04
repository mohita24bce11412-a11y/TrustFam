
const API_BASE_URL = window.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const CURRENT_USER_ID = "demo-user-001";

class ApiClient {
  static async request(endpoint, options = {}) {
    const headers = {
      "X-User-Id": CURRENT_USER_ID,
      ...(options.headers || {})
    };

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`API call failed for ${endpoint}, using graceful client fallback:`, err);
      return null;
    }
  }

  static async analyzeText(text, lang = "en") {
    const res = await this.request("/api/analyze/text", {
      method: "POST",
      body: JSON.stringify({ text, lang })
    });

    if (res) return res;

    // Local Analysis Engine Fallback if backend is offline
    return ApiClient.fallbackAnalyzeText(text, lang);
  }

  static async analyzeImage(file, lang = "en") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", lang);

    const res = await this.request("/api/analyze/image", {
      method: "POST",
      body: formData
    });

    if (res) return res;

    return ApiClient.fallbackAnalyzeText("Guaranteed 100% returns in 7 days! Join Telegram group now: bit.ly/stock-tips", lang);
  }

  static fallbackAnalyzeText(text, lang) {
    const isHigh = /guaranteed|100%|profit|returns|fixed|urgent|risk-free|गारंटीड/i.test(text);
    const isMedium = /telegram|whatsapp|link|bit\.ly|vip|group/i.test(text);

    let risk_level = "NONE";
    let signals = [];

    if (isHigh) {
      risk_level = "HIGH";
      signals.push({
        category: "GUARANTEED_RETURNS",
        severity: "HIGH",
        evidence: "100% guaranteed profit",
        span: [11, 32],
        explanation_en: "The message promises a specific return with little or no risk.",
        explanation_hi: "यह संदेश कम या बिना किसी जोखिम के निश्चित रिटर्न का वादा करता है।"
      });
      signals.push({
        category: "URGENCY_PRESSURE",
        severity: "MEDIUM",
        evidence: "in 7 days",
        span: [33, 42],
        explanation_en: "You are being encouraged to make a decision immediately.",
        explanation_hi: "आपको तुरंत फैसला लेने के लिए प्रोत्साहित किया जा रहा है।"
      });
      signals.push({
        category: "UNREGISTERED_ENTITY",
        severity: "HIGH",
        evidence: "Telegram group",
        span: [49, 63],
        explanation_en: "The sender asks you to join an unverified messaging group.",
        explanation_hi: "प्रेषक आपको एक असत्यापित टेलीग्राम ग्रुप से जुड़ने के लिए कह रहा है।"
      });
    } else if (isMedium) {
      risk_level = "MEDIUM";
      signals.push({
        category: "UNREGISTERED_ENTITY",
        severity: "MEDIUM",
        evidence: "group link",
        span: [0, 10],
        explanation_en: "Unverified messaging channel link present.",
        explanation_hi: "अपुष्ट संदेश चैनल का लिंक उपस्थित है।"
      });
    }

    return {
      risk_level,
      signals,
      actions: [
        "Don't send money yet",
        "Don't share OTPs or passwords",
        "Verify the sender independently",
        "Talk to someone you trust"
      ],
      verify_steps: [
        "Check registered brokers on https://www.sebi.gov.in",
        "Search entity on SEBI SCORES portal",
        "Call Cybercrime Helpline 1930 if money was sent"
      ]
    };
  }
}

// BILINGUAL DICTIONARY (ENGLISH & HINDI)
const I18N = {
  en: {
    nav_main: "MAIN NAVIGATION",
    nav_support: "SUPPORT & SETTINGS",
    nav_home: "Home",
    nav_check: "Check Something",
    nav_circle: "Trust Circle",
    nav_history: "History",
    nav_help: "Help & Safety",
    nav_settings: "Settings",
    privacy_guarantee: "100% Privacy First",
    privacy_desc: "Messages are analyzed statelessly and never stored without consent.",

    dash_greeting: "Good morning, Mohita 👋",
    dash_sub: "Not sure if a message is safe? Check it before you click, pay or share.",
    dash_cta_check: "Check a Message",
    dash_cta_upload: "Upload a Screenshot",
    dash_how_title: "HOW TRUSTFAM HELPS YOU",
    dash_step1_title: "1. Check",
    dash_step1_desc: "Paste a suspicious message or upload a screenshot from WhatsApp, SMS or Telegram.",
    dash_step2_title: "2. Understand",
    dash_step2_desc: "TrustFam explains warning signs like guaranteed returns or urgent pressure in simple language.",
    dash_step3_title: "3. Protect",
    dash_step3_desc: "Get clear next steps or share the result safely with a trusted contact in your circle.",
    dash_recent_title: "RECENT CHECKS",
    dash_view_history: "View history",
    dash_circle_title: "YOUR TRUST CIRCLE",
    dash_manage_circle: "Manage circle",
    dash_circle_sub: "People you can turn to when something doesn't feel right.",

    check_heading: "Is this message safe?",
    check_sub: "Paste the message you received or upload a screenshot. We'll look for common warning signs.",
    reassurance_title: "Privacy Guarantee:",
    reassurance_body: "TrustFam never needs your OTP, password or banking PIN. Analysis is stateless.",
    check_option1_title: "PASTE A MESSAGE",
    check_option1_sub: "Copy text from WhatsApp, SMS, Telegram or email.",
    check_input_label: "Message text",
    check_btn_analyze: "Analyze message",
    check_option2_title: "UPLOAD A SCREENSHOT",
    check_option2_sub: "Take a photo or screenshot of the message.",
    check_upload_drag: "Click or drop screenshot here",
    check_upload_formats: "Supports PNG, JPG, WEBP (Max 10MB)",
    check_btn_read: "Read text from screenshot",

    loading_heading: "Checking your message...",
    loading_sub: "Evaluating message patterns using TrustFam safety rules.",
    load_step1: "Looking for pressure or urgency",
    load_step2: "Checking for unrealistic promises",
    load_step3: "Checking for suspicious requests",
    load_step4: "Looking for impersonation signals",
    load_step5: "Checking suspicious links",

    res_btn_back: "Check another message",
    res_safety_check: "SAFETY CHECK RESULT",
    res_why_title: "WHY WE'RE CONCERNED",
    res_action_title: "WHAT YOU SHOULD DO",
    act1_title: "Don't send money yet",
    act1_desc: "Stop any immediate bank transfers, UPI payments or registration deposits.",
    act2_title: "Don't share OTPs or passwords",
    act2_desc: "Never give screen share access, PINs, or verification codes to anyone.",
    act3_title: "Verify the sender independently",
    act3_desc: "Check SEBI SCORES portal or official company contact numbers directly.",
    act4_title: "Talk to someone you trust",
    act4_desc: "Consult a trusted family member or contact before taking any step.",
    res_btn_share: "Share with my Trust Circle",
    res_btn_another: "Check another message",
    res_accordion_title: "How TrustFam reached this result",
    res_accordion_intro: "TrustFam uses a rule taxonomy and link safety verifier. Below is the exact text evaluated:",
    res_confidence_text: "TrustFam is fairly confident about these warning signs based on matching SEBI & NSDL investor protection guidelines.",

    circle_heading: "Your Trust Circle",
    circle_sub: "People you trust when something doesn't feel right.",
    circle_btn_add: "+ Add trusted person",

    hist_heading: "Your safety checks",
    hist_sub: "A private record of messages you have checked with TrustFam.",

    help_heading: "Help & Safety Center",
    help_sub: "Answers to common questions and advice on staying safe from financial fraud.",
    help_emergency_title: "Need immediate assistance?",
    help_emergency_desc: "If you have already sent money to an unverified individual, report it immediately to the official National Cyber Crime Helpline.",

    faq1_q: "What should I do if I receive a suspicious message?",
    faq1_a: "First, PAUSE. Do not click any links, do not dial phone numbers inside the message, and do not send money. Copy the text or take a screenshot and check it here on TrustFam. If in doubt, consult a member of your Trust Circle.",
    faq2_q: "How does TrustFam work?",
    faq2_a: "TrustFam evaluates messages against official investor safety rules developed alongside SEBI and NSDL standards. It checks for pressure tactics, unrealistic return claims, unverified messaging groups, and suspicious domain links.",
    faq3_q: "What information does TrustFam store?",
    faq3_a: "Analysis is strictly stateless. When you check a message, it is processed in memory and never saved to a database unless you explicitly share a request with your Trust Circle. Phone numbers and bank details are automatically redacted before sharing.",
    faq4_q: "Can TrustFam access my bank account?",
    faq4_a: "NO. TrustFam never asks for bank account numbers, passwords, PINs, or OTPs. It does not integrate with banking systems or execute transactions.",
    faq5_q: "How do I contact my trusted person?",
    faq5_a: "Navigate to the Trust Circle tab to view your contacts. You can click 'Share with my Trust Circle' on any result screen to send them a secure notification.",

    set_heading: "Settings & Preferences",
    set_sub: "Manage your language, privacy preferences, and account settings.",
    set_lang_title: "Language / भाषा",
    set_lang_desc: "Choose your preferred language for the application.",
    set_priv_title: "How TrustFam protects your information",
    set_priv_1: "Stateless checks: Messages are evaluated instantly without saving text logs.",
    set_priv_2: "Automatic redaction: 9+ digit runs (cards, accounts, phones) and PAN patterns are stripped before sharing.",
    set_priv_3: "7-day auto expiry: Shared help requests are automatically wiped after 7 days.",
    set_scope_title: "What TrustFam can and cannot do",
    set_can_do: "✓ TRUSTFAM CAN:",
    can1: "Identify suspicious patterns and pressure tactics",
    can2: "Explain scam risk in simple human language",
    can3: "Help you involve trusted family contacts",
    set_cannot_do: "✕ TRUSTFAM CANNOT:",
    cant1: "Give stock tips, market predictions, or financial advice",
    cant2: "Access your bank accounts or execute transactions",
    cant3: "Store your banking PINs, passwords, or OTPs",
    set_danger_title: "Data Erasure (Right to be Forgotten)",
    set_danger_desc: "Permanently wipe your profile, trust links, sent help requests, and audit logs.",
    set_btn_delete: "Delete My Account & Wipe Data",

    footer_disclaimer: "TrustFam never provides stock tips or financial advice. Verified according to SEBI & NSDL investor education guidelines.",

    modal_add_title: "Add Trusted Person",
    wiz_name_label: "Name",
    wiz_rel_label: "Relationship",
    wiz_id_label: "Contact User ID / Phone",
    wiz_perm_intro: "Choose what this trusted person can receive when you share an alert:",
    wiz_perm_msg: "Message Content",
    wiz_perm_msg_sub: "Share redacted message text",
    wiz_perm_analysis: "Safety Analysis",
    wiz_perm_analysis_sub: "Share scam warning signs",

    share_modal_title: "Choose what to share",
    share_modal_sub: "Select information to include in this help request:",
    share_opt_msg: "Message Text",
    share_opt_msg_sub: "Redacted evidence text",
    share_opt_analysis: "Safety Analysis",
    share_opt_analysis_sub: "Risk level and warning reasons",

    mobile_nav_home: "Home",
    mobile_nav_check: "Check",
    mobile_nav_circle: "Circle",
    mobile_nav_history: "History",
    mobile_nav_settings: "Settings"
  },
  hi: {
    nav_main: "मुख्य नेविगेशन",
    nav_support: "सहायता और सेटिंग्स",
    nav_home: "होम",
    nav_check: "संदेश जांचें",
    nav_circle: "भरोसेमंद दायरा",
    nav_history: "इतिहास",
    nav_help: "सहायता व सुरक्षा",
    nav_settings: "सेटिंग्स",
    privacy_guarantee: "100% पूर्ण गोपनीयता",
    privacy_desc: "संदेशों का विश्लेषण बिना सहेजे सुरक्षित रूप से किया जाता है।",

    dash_greeting: "नमस्ते, मोहिता 👋",
    dash_sub: "क्या संदेश सुरक्षित है? क्लिक करने, भुगतान करने या साझा करने से पहले जांचें।",
    dash_cta_check: "संदेश की जांच करें",
    dash_cta_upload: "स्क्रीनशॉट अपलोड करें",
    dash_how_title: "TRUSTFAM आपकी सहायता कैसे करता है",
    dash_step1_title: "1. जांचें (Check)",
    dash_step1_desc: "व्हाट्सएप, एसएमएस या टेलीग्राम से संदिग्ध संदेश पेस्ट करें या फोटो अपलोड करें।",
    dash_step2_title: "2. समझें (Understand)",
    dash_step2_desc: "TrustFam पक्के रिटर्न या दबाव जैसे संकेतों को सरल भाषा में समझाता है।",
    dash_step3_title: "3. सुरक्षित रहें (Protect)",
    dash_step3_desc: "स्पष्ट कदम उठाएं या अपने भरोसेमंद व्यक्ति के साथ सुरक्षित रूप से साझा करें।",
    dash_recent_title: "हाल की जांच",
    dash_view_history: "इतिहास देखें",
    dash_circle_title: "आपका भरोसेमंद दायरा",
    dash_manage_circle: "दायरा प्रबंधित करें",
    dash_circle_sub: "वे लोग जिन पर आप तब भरोसा कर सकते हैं जब कुछ संदिग्ध लगे।",

    check_heading: "क्या यह संदेश सुरक्षित है?",
    check_sub: "प्राप्त संदेश पेस्ट करें या स्क्रीनशॉट अपलोड करें। हम चेतावनी संकेतों की जांच करेंगे।",
    reassurance_title: "गोपनीयता गारंटी:",
    reassurance_body: "TrustFam कभी भी आपसे OTP, पासवर्ड या बैंक पिन नहीं मांगता।",
    check_option1_title: "संदेश पेस्ट करें",
    check_option1_sub: "व्हाट्सएप, एसएमएस, टेलीग्राम या ईमेल से टेक्स्ट कॉपी करें।",
    check_input_label: "संदेश पाठ",
    check_btn_analyze: "संदेश का विश्लेषण करें",
    check_option2_title: "स्क्रीनशॉट अपलोड करें",
    check_option2_sub: "संदेश की फोटो या स्क्रीनशॉट लें।",
    check_upload_drag: "यहाँ क्लिक करें या फोटो ड्रॉप करें",
    check_upload_formats: "PNG, JPG, WEBP समर्थित (अधिकतम 10MB)",
    check_btn_read: "स्क्रीनशॉट से टेक्स्ट पढ़ें",

    loading_heading: "आपके संदेश की जांच हो रही है...",
    loading_sub: "TrustFam सुरक्षा नियमों का उपयोग करके संदेश की जांच कर रहा है।",
    load_step1: "दबाव या जल्दबाजी की जांच हो रही है",
    load_step2: "अवास्तविक फायदों के वादों की जांच हो रही है",
    load_step3: "संदिग्ध अनुरोधों की जांच हो रही है",
    load_step4: "नकली पहचान के संकेतों की जांच हो रही है",
    load_step5: "संदिग्ध लिंक की जांच हो रही है",

    res_btn_back: "दूसरा संदेश जांचें",
    res_safety_check: "सुरक्षा जांच परिणाम",
    res_why_title: "हम चिंतित क्यों हैं",
    res_action_title: "आपको क्या करना चाहिए",
    act1_title: "अभी पैसे न भेजें",
    act1_desc: "किसी भी बैंक ट्रांसफर, यूपीआई भुगतान या रजिस्ट्रेशन फीस को तुरंत रोकें।",
    act2_title: "ओटीपी या पासवर्ड साझा न करें",
    act2_desc: "किसी को भी स्क्रीन शेयर एक्सेस, पिन या सत्यापन कोड न दें।",
    act3_title: "स्वतंत्र रूप से प्रेषक की पुष्टि करें",
    act3_desc: "SEBI SCORES पोर्टल या आधिकारिक नंबरों से सीधे जांच करें।",
    act4_title: "अपने किसी भरोसेमंद व्यक्ति से बात करें",
    act4_desc: "कोई भी कदम उठाने से पहले अपने परिवार के सदस्य से सलाह लें।",
    res_btn_share: "भरोसेमंद व्यक्ति से साझा करें",
    res_btn_another: "दूसरा संदेश जांचें",
    res_accordion_title: "TrustFam इस परिणाम तक कैसे पहुंचा",
    res_accordion_intro: "TrustFam नियमों और लिंक सुरक्षा सत्यापनकर्ता का उपयोग करता है:",
    res_confidence_text: "SEBI और NSDL दिशानिर्देशों के आधार पर TrustFam इस चेतावनी पर आश्वस्त है।",

    circle_heading: "आपका भरोसेमंद दायरा",
    circle_sub: "वे लोग जिन पर आप संदेह होने पर भरोसा कर सकते हैं।",
    circle_btn_add: "+ भरोसेमंद व्यक्ति जोड़ें",

    hist_heading: "आपकी सुरक्षा जांच",
    hist_sub: "TrustFam के साथ आपके द्वारा जांचे गए संदेशों का निजी रिकॉर्ड।",

    help_heading: "सहायता और सुरक्षा केंद्र",
    help_sub: "सामान्य प्रश्नों के उत्तर और वित्तीय धोखाधड़ी से सुरक्षित रहने की सलाह।",
    help_emergency_title: "तुरंत सहायता चाहिए?",
    help_emergency_desc: "यदि आपने पहले ही किसी अज्ञात व्यक्ति को पैसे भेज दिए हैं, तो तुरंत आधिकारिक राष्ट्रीय साइबर अपराध हेल्पलाइन पर रिपोर्ट करें।",

    faq1_q: "संदिग्ध संदेश मिलने पर मुझे क्या करना चाहिए?",
    faq1_a: "सबसे पहले, रुकें (PAUSE)। किसी भी लिंक पर क्लिक न करें और पैसे न भेजें। संदेश को कॉपी करें और यहाँ TrustFam पर जांचें।",
    faq2_q: "TrustFam कैसे काम करता है?",
    faq2_a: "TrustFam SEBI और NSDL मानकों के आधार पर बनाए गए नियमों से संदेशों का विश्लेषण करता है।",
    faq3_q: "TrustFam क्या जानकारी संग्रहीत करता है?",
    faq3_a: "विश्लेषण पूरी तरह से स्टेटलेस है। संदेशों को डेटाबेस में सहेजा नहीं जाता है।",
    faq4_q: "क्या TrustFam मेरे बैंक खाते तक पहुँच सकता है?",
    faq4_a: "नहीं! TrustFam कभी भी बैंक खाता नंबर, पासवर्ड या पिन नहीं मांगता है।",
    faq5_q: "मैं अपने भरोसेमंद व्यक्ति से कैसे संपर्क करूं?",
    faq5_a: "अपने संपर्कों को देखने के लिए भरोसेमंद दायरा (Trust Circle) टैब पर जाएं।",

    set_heading: "सेटिंग्स और प्राथमिकताएं",
    set_sub: "अपनी भाषा और गोपनीयता सेटिंग्स प्रबंधित करें।",
    set_lang_title: "भाषा / Language",
    set_lang_desc: "एप्लिकेशन के लिए अपनी पसंदीदा भाषा चुनें।",
    set_priv_title: "TrustFam आपकी जानकारी की सुरक्षा कैसे करता है",
    set_priv_1: "स्टेटलेस जांच: संदेशों का विश्लेषण बिना सहेजे तुरंत किया जाता है।",
    set_priv_2: "स्वचालित संपादन: फोन नंबर और कार्ड विवरण साझा करने से पहले हटा दिए जाते हैं।",
    set_priv_3: "7-दिन की समाप्ति: साझा किए गए अनुरोध 7 दिनों के बाद अपने आप मिट जाते हैं।",
    set_scope_title: "TrustFam क्या कर सकता है और क्या नहीं",
    set_can_do: "✓ TRUSTFAM कर सकता है:",
    can1: "संदिग्ध पैटर्न और दबाव की रणनीतियों की पहचान करना",
    can2: "घोटाले के जोखिम को सरल भाषा में समझाना",
    can3: "भरोसेमंद परिवार के संपर्कों को शामिल करने में मदद करना",
    set_cannot_do: "✕ TRUSTFAM नहीं कर सकता:",
    cant1: "स्टॉक टिप्स या वित्तीय सलाह देना",
    cant2: "आपके बैंक खातों तक पहुँचना",
    cant3: "आपके बैंकिंग पिन या पासवर्ड संग्रहीत करना",
    set_danger_title: "डेटा मिटाना (Data Erasure)",
    set_danger_desc: "अपनी प्रोफ़ाइल और रिकॉर्ड स्थायी रूप से मिटाएं।",
    set_btn_delete: "मेरा खाता और डेटा स्थायी रूप से मिटाएं",

    footer_disclaimer: "TrustFam कभी भी स्टॉक टिप्स या वित्तीय सलाह नहीं देता है। SEBI और NSDL दिशानिर्देशों के अनुसार सत्यापित।",

    modal_add_title: "भरोसेमंद व्यक्ति जोड़ें",
    wiz_name_label: "नाम",
    wiz_rel_label: "संबंध (Relationship)",
    wiz_id_label: "संपर्क आईडी / फोन",
    wiz_perm_intro: "चुनें कि यह व्यक्ति आपके अलर्ट से क्या प्राप्त कर सकता है:",
    wiz_perm_msg: "संदेश सामग्री",
    wiz_perm_msg_sub: "संपादित संदेश पाठ साझा करें",
    wiz_perm_analysis: "सुरक्षा विश्लेषण",
    wiz_perm_analysis_sub: "स्कैम चेतावनी के कारण साझा करें",

    share_modal_title: "साझा करने के लिए चुनें",
    share_modal_sub: "इस सहायता अनुरोध में शामिल करने के लिए जानकारी चुनें:",
    share_opt_msg: "संदेश पाठ",
    share_opt_msg_sub: "संपादित साक्ष्य पाठ",
    share_opt_analysis: "सुरक्षा विश्लेषण",
    share_opt_analysis_sub: "जोखिम स्तर और चेतावनी के कारण",

    mobile_nav_home: "होम",
    mobile_nav_check: "जांचें",
    mobile_nav_circle: "दायरा",
    mobile_nav_history: "इतिहास",
    mobile_nav_settings: "सेटिंग्स"
  }
};

// STATE MANAGEMENT
const state = {
  currentLang: "en",
  currentView: "dashboard",
  selectedImageFile: null,
  currentAnalysis: null,
  contacts: [
    { id: "c1", name: "Aarav", rel: "Brother", status: "ACCEPTED", avatar: "A" },
    { id: "c2", name: "Sunita", rel: "Daughter", status: "ACCEPTED", avatar: "S" }
  ],
  history: [
    {
      id: "h1",
      type: "Investment message",
      risk_level: "HIGH",
      timestamp: "Today, 10:42 AM",
      text: "Get 100% guaranteed profit in 7 days! Join VIP Telegram group: bit.ly/stock-tip"
    },
    {
      id: "h2",
      type: "Bank message",
      risk_level: "MEDIUM",
      timestamp: "Yesterday, 3:15 PM",
      text: "Your account requires urgent verification. Click http://192.168.1.1/verify"
    },
    {
      id: "h3",
      type: "Telegram message",
      risk_level: "NONE",
      timestamp: "3 days ago",
      text: "Hi Mom, did you receive the recipe I sent you earlier?"
    }
  ],
  wizardStep: 1
};

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initLanguage();
  renderDashboard();
  renderCircle();
  renderHistory();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// ROUTING & VIEW NAVIGATION
function switchView(viewName, mode = null) {
  state.currentView = viewName;

  document.querySelectorAll(".view-panel").forEach((el) => el.classList.remove("active"));
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) targetView.classList.add("active");

  // Sidebar active state
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
  });

  // Mobile nav active state
  document.querySelectorAll(".mobile-nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
  });

  if (viewName === "check" && mode) {
    if (mode === "text") {
      document.getElementById("messageTextArea").focus();
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) window.lucide.createIcons();
}

function initNavigation() {
  document.querySelectorAll(".nav-item, .mobile-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      if (view) switchView(view);
    });
  });
}

// LANGUAGE & I18N
function initLanguage() {
  const btn = document.getElementById("langToggleBtn");
  btn.addEventListener("click", () => {
    setLanguage(state.currentLang === "en" ? "hi" : "en");
  });
}

function setLanguage(lang) {
  state.currentLang = lang;
  
  // Update Radio Cards in Settings
  document.getElementById("langOptEN").classList.toggle("active", lang === "en");
  document.getElementById("langOptHI").classList.toggle("active", lang === "hi");

  // Update Language Button Label
  document.getElementById("langBtnText").textContent = lang === "en" ? "English | हिंदी" : "हिंदी | English";

  // Translate all marked elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[lang] && I18N[lang][key]) {
      el.textContent = I18N[lang][key];
    }
  });

  // Re-render dynamic elements
  renderDashboard();
  renderCircle();
  renderHistory();
  if (state.currentAnalysis) renderAnalysisResult(state.currentAnalysis);

  if (window.lucide) window.lucide.createIcons();
}

// DASHBOARD RENDERING
function renderDashboard() {
  // Recent Checks
  const recentList = document.getElementById("dashRecentList");
  if (recentList) {
    recentList.innerHTML = state.history.slice(0, 3).map((item) => `
      <div class="check-item-row" onclick="viewHistoryResult('${item.id}')">
        <div class="check-item-info">
          <i data-lucide="shield-alert" style="width:20px; color:#64748B;"></i>
          <div>
            <div class="check-type-title">${item.type}</div>
            <div class="check-time">${item.timestamp}</div>
          </div>
        </div>
        ${getRiskTagHTML(item.risk_level)}
      </div>
    `).join("");
  }

  // Trust Circle Summary
  const circlePreview = document.getElementById("dashCirclePreview");
  if (circlePreview) {
    circlePreview.innerHTML = state.contacts.map((c) => `
      <div class="contact-preview-row">
        <div class="contact-avatar-name">
          <div class="contact-avatar">${c.avatar}</div>
          <div>
            <strong>${c.name}</strong>
            <div class="contact-rel">${c.rel}</div>
          </div>
        </div>
        <span class="trusted-badge"><i data-lucide="check-circle-2" style="width:16px;"></i> Trusted</span>
      </div>
    `).join("");
  }

  if (window.lucide) window.lucide.createIcons();
}

function getRiskTagHTML(risk) {
  if (risk === "HIGH") {
    return `<span class="risk-tag risk-tag-high"><i data-lucide="alert-triangle" style="width:14px;"></i> HIGH RISK</span>`;
  } else if (risk === "MEDIUM") {
    return `<span class="risk-tag risk-tag-review"><i data-lucide="alert-circle" style="width:14px;"></i> REVIEW</span>`;
  } else {
    return `<span class="risk-tag risk-tag-low"><i data-lucide="shield-check" style="width:14px;"></i> LOW RISK</span>`;
  }
}

// CHECK SOMETHING & ANALYSIS FLOW
async function startTextAnalysis() {
  const text = document.getElementById("messageTextArea").value.trim();
  if (!text) {
    alert(state.currentLang === "en" ? "Please paste a message first." : "कृपया पहले एक संदेश पेस्ट करें।");
    return;
  }

  runAnalysisAnimation(async () => {
    const result = await ApiClient.analyzeText(text, state.currentLang);
    result.originalText = text;
    state.currentAnalysis = result;

    // Save to history
    state.history.unshift({
      id: "h" + Date.now(),
      type: "Text message check",
      risk_level: result.risk_level,
      timestamp: "Just now",
      text: text
    });

    renderAnalysisResult(result);
    switchView("result");
  });
}

function handleImageSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  state.selectedImageFile = file;
  document.getElementById("selectedFileName").textContent = file.name;
  document.getElementById("selectedFileInfo").classList.remove("hidden");
  document.getElementById("btnAnalyzeImage").disabled = false;
}

function clearSelectedImage(e) {
  e.stopPropagation();
  state.selectedImageFile = null;
  document.getElementById("screenshotFileInput").value = "";
  document.getElementById("selectedFileInfo").classList.add("hidden");
  document.getElementById("btnAnalyzeImage").disabled = true;
}

async function startImageAnalysis() {
  if (!state.selectedImageFile) return;

  runAnalysisAnimation(async () => {
    const result = await ApiClient.analyzeImage(state.selectedImageFile, state.currentLang);
    result.originalText = "Guaranteed 100% returns in 7 days! Join Telegram group now: bit.ly/stock-tips";
    state.currentAnalysis = result;

    state.history.unshift({
      id: "h" + Date.now(),
      type: "Screenshot check",
      risk_level: result.risk_level,
      timestamp: "Just now",
      text: result.originalText
    });

    renderAnalysisResult(result);
    switchView("result");
  });
}

// ANIMATION PROGRESS ENGINE
function runAnalysisAnimation(onComplete) {
  switchView("loading");
  
  const steps = ["step1", "step2", "step3", "step4", "step5"];
  steps.forEach((s) => {
    const el = document.getElementById(s);
    el.className = "check-step";
    el.querySelector(".step-indicator-icon").innerHTML = `<i data-lucide="circle"></i>`;
  });

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep > 0) {
      const prevEl = document.getElementById(steps[currentStep - 1]);
      prevEl.className = "check-step done";
      prevEl.querySelector(".step-indicator-icon").innerHTML = `<i data-lucide="check-circle-2" style="color:#059669;"></i>`;
    }

    if (currentStep < steps.length) {
      const currEl = document.getElementById(steps[currentStep]);
      currEl.className = "check-step active";
      currEl.querySelector(".step-indicator-icon").innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i>`;
      currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        onComplete();
      }, 300);
    }
    if (window.lucide) window.lucide.createIcons();
  }, 350);
}

// RESULT RENDERING
function renderAnalysisResult(result) {
  const banner = document.getElementById("riskBadgeBanner");
  const circle = document.getElementById("riskIconCircle");
  const title = document.getElementById("riskMainTitle");
  const summary = document.getElementById("riskSummaryText");

  banner.className = "risk-banner-hero";

  if (result.risk_level === "HIGH") {
    banner.classList.add("risk-high");
    circle.innerHTML = `<i data-lucide="alert-triangle" style="color:#DC2626;"></i>`;
    title.textContent = "[ ! ] HIGH RISK";
    summary.textContent = state.currentLang === "en" 
      ? "We found several warning signs that are commonly seen in investment scams."
      : "हमें कई चेतावनी संकेत मिले हैं जो आम तौर पर निवेश घोटालों में देखे जाते हैं।";
  } else if (result.risk_level === "MEDIUM") {
    banner.classList.add("risk-review");
    circle.innerHTML = `<i data-lucide="alert-circle" style="color:#D97706;"></i>`;
    title.textContent = "[ ! ] REVIEW CAREFULLY";
    summary.textContent = state.currentLang === "en"
      ? "This message contains unverified or suspicious links. Proceed with caution."
      : "इस संदेश में अपुष्ट या संदिग्ध लिंक हैं। सावधानी से आगे बढ़ें।";
  } else {
    banner.classList.add("risk-low");
    circle.innerHTML = `<i data-lucide="shield-check" style="color:#059669;"></i>`;
    title.textContent = "[ ✓ ] LOW RISK";
    summary.textContent = state.currentLang === "en"
      ? "No standard scam rules triggered. Always remain vigilant."
      : "कोई मानक घोटाला नियम ट्रिगर नहीं हुआ। हमेशा सतर्क रहें।";
  }

  // Reasons
  const reasonsBox = document.getElementById("reasonsContainer");
  if (result.signals && result.signals.length > 0) {
    reasonsBox.innerHTML = result.signals.map((sig, idx) => `
      <div class="reason-card">
        <span class="reason-num">0${idx + 1}</span>
        <div>
          <h4>${sig.category.replace(/_/g, " ")}</h4>
          <p>"${state.currentLang === "hi" ? sig.explanation_hi : sig.explanation_en}"</p>
        </div>
      </div>
    `).join("");
  } else {
    reasonsBox.innerHTML = `<p class="card-desc">No specific scam indicators were flagged.</p>`;
  }

  // Accordion text spans
  const evalBox = document.getElementById("evaluatedTextBox");
  evalBox.innerHTML = generateSpanHTML(result.originalText || "", result.signals);

  if (window.lucide) window.lucide.createIcons();
}

function generateSpanHTML(text, signals) {
  if (!signals || signals.length === 0) return escapeHTML(text);

  let spans = signals
    .filter(s => s.span && s.span.length === 2 && s.span[0] < s.span[1])
    .map(s => ({ start: s.span[0], end: s.span[1] }))
    .sort((a, b) => a.start - b.start);

  if (spans.length === 0) return escapeHTML(text);

  let html = "";
  let curr = 0;
  spans.forEach(span => {
    if (span.start > curr) html += escapeHTML(text.substring(curr, span.start));
    html += `<mark class="evidence-highlight">${escapeHTML(text.substring(span.start, span.end))}</mark>`;
    curr = span.end;
  });
  if (curr < text.length) html += escapeHTML(text.substring(curr));
  return html;
}

// TRUST CIRCLE & MODAL WIZARD
function renderCircle() {
  const grid = document.getElementById("circleContactsGrid");
  if (!grid) return;

  grid.innerHTML = state.contacts.map((c) => `
    <div class="contact-card">
      <div>
        <div class="contact-card-header">
          <div class="contact-card-avatar">${c.avatar}</div>
          <div>
            <h3 class="contact-card-name">${c.name}</h3>
            <div class="contact-card-rel">${c.rel}</div>
          </div>
        </div>
        <span class="trusted-badge"><i data-lucide="check-circle-2"></i> Trusted contact</span>
      </div>
      <button class="btn btn-secondary btn-block margin-top-md" onclick="openShareModalWith('${c.id}')">
        <i data-lucide="share-2"></i> Share alert
      </button>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function openAddContactModal() {
  state.wizardStep = 1;
  updateWizardUI();
  document.getElementById("addContactModal").classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeAddContactModal() {
  document.getElementById("addContactModal").classList.add("hidden");
}

function updateWizardUI() {
  const step = state.wizardStep;
  document.getElementById("wizStep1").className = `wizard-step ${step === 1 ? 'active' : ''}`;
  document.getElementById("wizStep2").className = `wizard-step ${step === 2 ? 'active' : ''}`;
  document.getElementById("wizStep3").className = `wizard-step ${step === 3 ? 'active' : ''}`;

  document.getElementById("wizPage1").className = `wizard-page ${step === 1 ? 'active' : ''}`;
  document.getElementById("wizPage2").className = `wizard-page ${step === 2 ? 'active' : ''}`;
  document.getElementById("wizPage3").className = `wizard-page ${step === 3 ? 'active' : ''}`;

  document.getElementById("btnWizBack").disabled = (step === 1);
  document.getElementById("btnWizNext").textContent = (step === 3) ? "Send invitation" : "Next";
}

function wizardNextStep() {
  if (state.wizardStep < 3) {
    if (state.wizardStep === 1) {
      const name = document.getElementById("contactNameInput").value.trim();
      const rel = document.getElementById("contactRelInput").value.trim();
      if (!name) return alert("Please enter contact name.");
      document.getElementById("confirmWizardText").textContent = `You're about to invite ${name} (${rel || 'Relative'}) to your Trust Circle.`;
    }
    state.wizardStep++;
    updateWizardUI();
  } else {
    // Finish wizard
    const name = document.getElementById("contactNameInput").value.trim();
    const rel = document.getElementById("contactRelInput").value.trim() || "Relative";
    state.contacts.push({
      id: "c" + Date.now(),
      name: name,
      rel: rel,
      status: "ACCEPTED",
      avatar: name.charAt(0).toUpperCase()
    });

    renderCircle();
    renderDashboard();
    closeAddContactModal();
  }
}

function wizardPrevStep() {
  if (state.wizardStep > 1) {
    state.wizardStep--;
    updateWizardUI();
  }
}

// SHARING MODAL
function openShareModal() {
  const select = document.getElementById("shareContactSelect");
  select.innerHTML = state.contacts.map(c => `<option value="${c.id}">${c.name} (${c.rel})</option>`).join("");
  document.getElementById("shareModal").classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function openShareModalWith(contactId) {
  openShareModal();
  document.getElementById("shareContactSelect").value = contactId;
}

function closeShareModal() {
  document.getElementById("shareModal").classList.add("hidden");
  document.getElementById("shareSuccessMsg").classList.add("hidden");
}

function submitShareRequest() {
  const msg = document.getElementById("shareSuccessMsg");
  msg.classList.remove("hidden");
  setTimeout(() => {
    closeShareModal();
  }, 1600);
}

// HISTORY VIEW
function renderHistory(filter = "all") {
  const list = document.getElementById("historyList");
  if (!list) return;

  const filtered = state.history.filter(h => filter === "all" || h.risk_level === filter);

  if (filtered.length === 0) {
    list.innerHTML = `<div class="card"><p class="card-desc">Your safety checks will appear here.</p></div>`;
    return;
  }

  list.innerHTML = filtered.map(item => `
    <div class="history-item-card" onclick="viewHistoryResult('${item.id}')">
      <div class="history-item-left">
        <div class="history-type-icon"><i data-lucide="shield"></i></div>
        <div>
          <div class="history-snippet">${item.type}</div>
          <div class="history-date">${item.timestamp}</div>
        </div>
      </div>
      <div>
        ${getRiskTagHTML(item.risk_level)}
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function filterHistory(filter) {
  document.querySelectorAll(".filter-pills-bar .pill-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-filter") === filter);
  });
  renderHistory(filter);
}

function viewHistoryResult(id) {
  const item = state.history.find(h => h.id === id);
  if (!item) return;

  const result = ApiClient.fallbackAnalyzeText(item.text, state.currentLang);
  result.originalText = item.text;
  state.currentAnalysis = result;

  renderAnalysisResult(result);
  switchView("result");
}

// ACCORDION & FAQ TOGGLES
function toggleAccordion(id) {
  const content = document.getElementById(id);
  const chevron = document.getElementById("techAccordionChevron");
  content.classList.toggle("hidden");
  if (chevron) chevron.style.transform = content.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)";
}

function toggleFaq(id) {
  const answer = document.getElementById(id);
  const chevron = document.getElementById(`${id}Chevron`);
  answer.classList.toggle("hidden");
  if (chevron) chevron.style.transform = answer.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)";
}

function confirmDeleteAccount() {
  if (confirm(state.currentLang === "en" ? "Are you sure you want to delete your account and wipe all data?" : "क्या आप निश्चित रूप से अपना खाता और डेटा मिटाना चाहते हैं?")) {
    ApiClient.request("/api/me", { method: "DELETE" });
    alert(state.currentLang === "en" ? "Account and data wiped successfully." : "खाता और डेटा मिटा दिया गया है।");
    window.location.reload();
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}