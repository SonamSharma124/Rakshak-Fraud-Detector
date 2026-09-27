import re

URL_SHORTENERS = [
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly",
    "is.gd", "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at"
]

SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq",
    ".click", ".link", ".work", ".loan", ".date"
]

TRUSTED_BRANDS = {
    "sbi": ["onlinesbi.com", "sbi.co.in"],
    "hdfc": ["hdfcbank.com"],
    "icici": ["icicibank.com"],
    "paytm": ["paytm.com"],
    "phonepe": ["phonepe.com"],
    "amazon": ["amazon.in", "amazon.com"],
    "flipkart": ["flipkart.com"],
}


def extract_urls(text):
    pattern = r'(?:https?://|www\.)[^\s<>"\']+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:/[^\s<>"\']*)?'
    urls = re.findall(pattern, text)
    return list(set(urls))


def get_domain(url):
    cleaned = re.sub(r'^https?://', '', url)
    cleaned = re.sub(r'^www\.', '', cleaned)
    domain = cleaned.split('/')[0].lower()
    return domain


def analyze_url(url):
    domain = get_domain(url)
    flags = []

    if any(short in domain for short in URL_SHORTENERS):
        flags.append("URL shortener used - real destination is hidden")

    if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
        flags.append("Suspicious top-level domain often used in scams")

    if url.lower().startswith("http://"):
        flags.append("Not using HTTPS - connection is not encrypted")

    for brand, official_domains in TRUSTED_BRANDS.items():
        if brand in domain and not any(domain == d or domain.endswith("." + d) for d in official_domains):
            flags.append(f"Impersonates '{brand.upper()}' but domain is not official")
            break

    if domain.count("-") >= 2:
        flags.append("Domain has many hyphens - common in fake sites")

    return {
        "url": url,
        "domain": domain,
        "flags": flags,
        "risk": "high" if len(flags) >= 2 else ("medium" if len(flags) == 1 else "low")
    }


def check_links(text):
    urls = extract_urls(text)

    if not urls:
        return {
            "urls_found": 0,
            "results": [],
            "overall_link_risk": "none"
        }

    results = [analyze_url(url) for url in urls]
    risks = [r["risk"] for r in results]

    if "high" in risks:
        overall = "high"
    elif "medium" in risks:
        overall = "medium"
    else:
        overall = "low"

    return {
        "urls_found": len(urls),
        "results": results,
        "overall_link_risk": overall
    }