from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from urllib.parse import urlparse
import re

app = Flask(__name__)
CORS(app)

SUSPICIOUS_KEYWORDS = ['login', 'verify', 'bank', 'secure', 'account', 'update', 'password', 'credential', 'auth', 'signin']
MAX_URL_LENGTH = 75
SHORTENING_SERVICES = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly']

def analyze_url(url):
    reasons = []
    is_safe = True
    
    # Basic validation
    if not isinstance(url, str):
        return {"url": url, "is_safe": False, "reasons": ["Invalid input."]}

    url_lower = url.lower()
    
    # Protocol Check
    if url_lower.startswith('http://'):
        is_safe = False
        reasons.append("Uses unsecured HTTP instead of HTTPS.")
    elif not url_lower.startswith('https://'):
        # Let's consider URLs without protocols as potentially suspicious but not outright malicious 
        # unless they fail other checks. For strictness requested:
        pass
        
    # @ Symbol Check
    if '@' in url:
        is_safe = False
        reasons.append("Contains '@' symbol, which can hide the true destination.")

    # Length Check
    if len(url) > MAX_URL_LENGTH:
        is_safe = False
        reasons.append(f"URL is exceptionally long ({len(url)} characters).")

    # Keyword Check
    found_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
    if found_keywords:
        is_safe = False
        reasons.append(f"Contains suspicious keywords: {', '.join(found_keywords)}.")

    # Domain Analysis (Parse URL)
    try:
        # urlparse requires a scheme to accurately get netloc
        parse_target = url if '://' in url else 'http://' + url
        parsed_url = urlparse(parse_target)
        domain = parsed_url.netloc.lower()
        
        # IP Address Check (remove port if exists)
        domain_without_port = domain.split(':')[0]
        ip_pattern = re.compile(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$')
        if ip_pattern.match(domain_without_port):
            is_safe = False
            reasons.append("Domain is an IP address instead of a name.")

        # URL Shortener Check
        if any(domain_without_port.endswith(service) for service in SHORTENING_SERVICES):
            is_safe = False
            reasons.append("Uses a URL shortening service, which hides the true destination.")

        # Multiple Hyphens in Domain
        if domain_without_port.count('-') >= 2:
            is_safe = False
            reasons.append("Domain contains multiple hyphens, often used to spoof legitimate sites.")

        # Unusually high number of subdomains
        clean_domain = domain_without_port.replace('www.', '')
        if clean_domain.count('.') >= 3:
            is_safe = False
            reasons.append("Domain has an unusually high number of subdomains.")
            
    except Exception:
        pass

    if is_safe:
        reasons.append("This URL appears to be safe.")

    return {
        "url": url,
        "is_safe": is_safe,
        "reasons": reasons
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/detect', methods=['POST'])
def detect():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "No URL provided."}), 400
    
    url = data.get('url', '').strip()
    if not url:
        return jsonify({"error": "URL cannot be empty."}), 400
        
    result = analyze_url(url)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
