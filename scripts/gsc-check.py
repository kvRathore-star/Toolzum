#!/usr/bin/env python3
"""GSC checkpoint via service-account key: sitemaps, search trend, URL inspection."""
import base64, json, subprocess, time, urllib.parse, sys, re, random, os

def curl(url: str, data: str = None, headers: list = None) -> tuple[int, str]:
    cmd = ["curl", "-s", "-m", "30", "-o", "-", "-w", "\n%{http_code}", url]
    if data is not None:
        cmd += ["-d", data]
    for h in headers or []:
        cmd += ["-H", h]
    p = subprocess.run(cmd, capture_output=True, text=True)
    body, _, code = p.stdout.rpartition("\n")
    try:
        return int(code), body
    except ValueError:
        return 0, p.stdout

KEY_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "toolzum-6a54818ccc84- gsc json key.json")
SITE = "sc-domain:toolzum.com"
TOKEN_CACHE = "/tmp/gsc_token.json"


def b64url(b: bytes) -> bytes:
    return base64.urlsafe_b64encode(b).rstrip(b"=")


def get_token() -> str:
    try:
        cached = json.load(open(TOKEN_CACHE))
        if cached["exp"] > time.time() + 60:
            return cached["access_token"]
    except Exception:
        pass
    key = json.load(open(KEY_PATH))
    header = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    now = int(time.time())
    claims = b64url(json.dumps({
        "iss": key["client_email"],
        "scope": "https://www.googleapis.com/auth/webmasters.readonly "
                 "https://www.googleapis.com/auth/webmasters",
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now, "exp": now + 3600,
    }).encode())
    signing_input = header + b"." + claims
    pem_path = TOKEN_CACHE + ".pem"
    with open(pem_path, "w") as f:
        f.write(key["private_key"])
    sig = subprocess.run(["openssl", "dgst", "-sha256", "-sign", pem_path],
                         input=signing_input, capture_output=True, check=True).stdout
    jwt_tok = signing_input + b"." + b64url(sig)
    data = urllib.parse.urlencode({
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt_tok,
    })
    code, body = curl("https://oauth2.googleapis.com/token", data=data)
    if code != 200:
        raise SystemExit(f"token failed {code}: {body[:300]}")
    resp = json.loads(body)
    json.dump({"access_token": resp["access_token"], "exp": now + 3500}, open(TOKEN_CACHE, "w"))
    return resp["access_token"]


def call(url: str, payload=None):
    code, body = curl(
        url,
        data=json.dumps(payload) if payload is not None else None,
        headers=[f"Authorization: Bearer {get_token()}", "Content-Type: application/json"],
    )
    if code and code < 400:
        try:
            return json.loads(body)
        except Exception:
            return {"_http_error": code, "_body": body[:400]}
    return {"_http_error": code, "_body": body[:400]}


def d(days_ago: int) -> str:
    return time.strftime("%Y-%m-%d", time.gmtime(time.time() - days_ago * 86400))


def window_totals(start_days: int, end_days: int) -> dict:
    rows = call(f"https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(SITE, safe='')}/searchAnalytics/query",
                {"startDate": d(start_days), "endDate": d(end_days),
                 "dimensions": ["date"], "rowLimit": 2500})
    if "_http_error" in rows:
        return {"error": rows}
    clicks = sum(r.get("clicks", 0) for r in rows.get("rows", []))
    impr = sum(r.get("impressions", 0) for r in rows.get("rows", []))
    keys = sum(1 for _ in rows.get("rows", []))
    return {"clicks": clicks, "impressions": impr, "active_days": keys}


def inspect_one(u: str) -> dict:
    r = call("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
             {"inspectionUrl": u, "siteUrl": SITE, "languageCode": "en"})
    if "_http_error" in r:
        if r["_http_error"] == 429:
            time.sleep(10)
            r = call("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                     {"inspectionUrl": u, "siteUrl": SITE, "languageCode": "en"})
        if "_http_error" in r:
            return {"url": u, "error": r["_http_error"]}
    ist = r.get("inspectionResult", {}).get("indexStatusResult", {})
    return {"url": u, "coverage": ist.get("coverageState"), "verdict": ist.get("verdict"),
            "lastCrawl": ist.get("lastCrawlTime"), "page": ist.get("pageState")}


def sweep(outfile: str):
    from concurrent.futures import ThreadPoolExecutor, as_completed
    _, sm = curl("https://toolzum.com/sitemap.xml")
    urls = re.findall(r"<loc>(.*?)</loc>", sm)
    allu = list(dict.fromkeys(["https://toolzum.com/", "https://toolzum.com/pricing"] + urls))
    total = len(allu)
    get_token()
    print(f"sweep {total} urls -> {outfile}", file=sys.stderr, flush=True)
    done = errs = 0
    with open(outfile, "w") as f:
        f.write("url,coverage,verdict,lastCrawl\n")
        with ThreadPoolExecutor(max_workers=4) as ex:
            futs = {ex.submit(inspect_one, u): u for u in allu}
            for fut in as_completed(futs):
                r = fut.result()
                done += 1
                if "error" in r:
                    errs += 1
                    f.write(f'{r["url"]},ERROR-{r["error"]},,\n')
                else:
                    f.write(f'{r["url"]},{r["coverage"]},{r.get("verdict","")},{r.get("lastCrawl","")}\n')
                f.flush()
                if done % 50 == 0:
                    print(f"{done}/{total} (errs={errs})", file=sys.stderr, flush=True)
    print(f"done {total} (errs={errs}) -> {outfile}", file=sys.stderr, flush=True)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--sweep":
        sweep(sys.argv[2] if len(sys.argv) > 2 else "gsc-inspection.csv")
        return
    out = {}

    # 1. Sites the SA can see (proves the SA was added to the property)
    out["sites"] = call("https://www.googleapis.com/webmasters/v3/sites")

    # 2. Sitemap state — checkpoint trigger (a): lastDownloaded vs Sep 11
    out["sitemaps"] = call(f"https://www.googleapis.com/webmasters/v3/sitemaps/{urllib.parse.quote(SITE, safe='')}")

    # 3. Search trend: recent 4 weeks vs the 4 before
    out["recent28"] = window_totals(28, 1)
    out["prev28"] = window_totals(56, 29)
    out["recent7"] = window_totals(7, 1)

    # 4. URL inspection sample — sitemap spread (homepage + pricing + tools)
    _, sm = curl("https://toolzum.com/sitemap.xml")
    urls = re.findall(r"<loc>(.*?)</loc>", sm)
    tools = [u for u in urls if u.rstrip("/") != "https://toolzum.com"]
    sample = ["https://toolzum.com/", "https://toolzum.com/pricing"]
    if tools:
        random.seed(42)
        sample += random.sample(tools, min(20, len(tools)))
    inspections = []
    for u in sample:
        r = call("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                 {"inspectionUrl": u, "siteUrl": SITE, "languageCode": "en"})
        if "_http_error" in r:
            inspections.append({"url": u, "error": r})
            continue
        ist = r.get("inspectionResult", {}).get("indexStatusResult", {})
        inspections.append({
            "url": u,
            "coverage": ist.get("coverageState"),
            "verdict": ist.get("verdict"),
            "lastCrawl": ist.get("lastCrawlTime"),
            "page": ist.get("pageState"),
        })
    out["inspections"] = inspections

    print(json.dumps(out, indent=2)[:12000])


if __name__ == "__main__":
    main()
