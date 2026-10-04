# TrustFam 

### Pause. Verify. Stay Safe.

TrustFam is a safety-first platform designed to help people identify potentially fraudulent or manipulative investment messages before they act on them.

The application analyzes suspicious investment messages, WhatsApp forwards, stock tips, and screenshots for common scam indicators and provides an understandable risk assessment. Users can also connect with trusted contacts and share sanitized safety information when they need a second opinion.

> **TrustFam does not provide stock tips, investment recommendations, or guaranteed-return advice.**
> It is designed to help users pause, verify, and make safer decisions.

---

## The Problem

Investment scams are increasingly distributed through:

- WhatsApp forwards
- Telegram groups
- Social media messages
- Fake investment advisors
- Guaranteed-return schemes
- Stock tips and trading signals
- Screenshots containing suspicious financial claims

Many users, especially people who are less familiar with digital financial scams, may find it difficult to distinguish legitimate opportunities from manipulation.

TrustFam addresses this problem by providing a simple safety layer between receiving a suspicious message and acting on it.

---

## Our Solution

TrustFam follows a simple principle:

### **Pause → Analyze → Verify → Decide**

Users can:

1. Paste a suspicious message into TrustFam.
2. Upload a screenshot of the message.
3. Let the analysis engine identify potential risk signals.
4. Review the detected indicators and warnings.
5. Share a sanitized analysis with a trusted contact if needed.
6. Use the information to make a more informed decision.

---

##  Key Features

###  Text Analysis

Analyze suspicious investment-related messages for common scam indicators such as:

- Guaranteed or unrealistic returns
- Urgency and pressure tactics
- Suspicious links
- Requests for money or personal information
- Manipulative language
- High-risk investment claims

### Screenshot Analysis

Users can upload screenshots of messages instead of manually copying their contents.

TrustFam uses OCR to extract text from uploaded images and passes the extracted content through the same analysis pipeline.

###  Risk Assessment

The analysis engine produces structured safety information including:

- Risk level
- Detected signals
- Explanation
- Recommended safety actions
- Warnings
- OCR confidence information when applicable

###  Trusted Circle

Users can connect with trusted contacts through a controlled invitation system.

Features include:

- Send contact invitations
- Accept invitations
- View trusted contacts
- Remove contacts
- Require an active trust relationship before sharing help requests

###  Privacy-Aware Sharing

TrustFam does not simply forward the original message.

Before sharing, the backend can:

- Redact sensitive information
- Sanitize analysis results
- Remove unnecessary information
- Exclude investment recommendations from shared analysis

This allows users to ask for help without unnecessarily exposing sensitive information.

---

##  Architecture

```text
                         ┌─────────────────────┐
                         │      TrustFam UI    │
                         │   HTML / CSS / JS   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     FastAPI API     │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │ Text        │       │ Image / OCR │       │ Trusted     │
       │ Analysis    │       │ Pipeline    │       │ Circle      │
       └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │   SQLAlchemy ORM    │
                         └──────────┬──────────┘
                                    ▼
                         ┌─────────────────────┐
                         │   SQLite Database   │
                         └─────────────────────┘
