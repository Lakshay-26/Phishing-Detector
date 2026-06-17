# 🛡️ Phishing URL Detection Web App

Analyze. Detect. Protect.

A robust, full-stack web application designed to detect whether a given URL is safe or a potential phishing attack. Built using rule-based detection logic, this application analyzes various aspects of a URL to identify common malicious patterns often used by cybercriminals.

## ✨ Features
- **URL Input & Validation**: Clean, user-friendly interface to input and validate URLs in real-time.
- **Advanced Phishing Detection**:
  - Flags unsecured `http://` protocols.
  - Detects the `@` symbol used to obscure true destinations.
  - Flags unusually long URLs (>75 characters).
  - Identifies suspicious keywords (e.g., `login`, `verify`, `bank`, `secure`).
  - Detects raw IP addresses used instead of domain names.
  - Flags common URL shorteners (`bit.ly`, `tinyurl`, etc.).
  - Analyzes domains for multiple hyphens or excessive subdomains.
- **Dynamic Result Display**: Clearly indicates whether a URL is `✅ SAFE` or `⚠️ SUSPICIOUS` along with the exact reasons why.
- **Bonus Feature - URL History**: Automatically tracks and stores your recently checked URLs in the browser.
- **Premium UI/UX**: Dark-themed, glassmorphic design with smooth micro-animations.

## 🛠️ Tech Stack
- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System), JavaScript
- **Backend**: Python, Flask, Flask-CORS
- **Server**: Gunicorn (for production deployment)

## 🚀 How to Run Locally

### Prerequisites
Make sure you have [Python 3](https://www.python.org/downloads/) installed on your system.

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/phishing-url-detector.git
   cd phishing-url-detector
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the Flask server:
   ```bash
   python app.py
   ```

4. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

## 🌐 Deployment
This app is fully prepared to be deployed on cloud platforms like **Render**, **Railway**, or **Vercel**. 
A `requirements.txt` and a configured `app.py` are included. If deploying on Render, use `gunicorn app:app` as your Start Command.

---
*Developed as part of a Cyber Security Internship Project.*
