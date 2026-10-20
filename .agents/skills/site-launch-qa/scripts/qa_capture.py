import json, os, sys, time
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
PAGES = sys.argv[2].split(",") if len(sys.argv) > 2 else ["/"]
OUT = sys.argv[3] if len(sys.argv) > 3 else "qa-screenshots"
VIEWPORTS = {"desktop": (1920, 1080), "tablet": (768, 1024), "mobile": (375, 667)}
os.makedirs(OUT, exist_ok=True)
results = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    for path in PAGES:
        for name, (w, h) in VIEWPORTS.items():
            page = browser.new_page(viewport={"width": w, "height": h})
            errors, failed = [], []
            page.on("console", lambda m: m.type == "error" and errors.append(m.text))
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("requestfailed", lambda r: failed.append(r.url))
            page.on("response", lambda r: r.status >= 400 and failed.append(f"{r.status} {r.url}"))
            t0 = time.time()
            resp = page.goto(urljoin(BASE, path), wait_until="load")
            load_s = round(time.time() - t0, 2)
            slug = (path.strip("/").replace("/", "_") or "home").replace(".html", "")
            shot = f"{OUT}/{slug}-{name}.png"
            page.screenshot(path=shot, full_page=True)
            info = page.evaluate("""() => ({
              title: document.title,
              description: document.querySelector('meta[name=description]')?.content || null,
              canonical: document.querySelector('link[rel=canonical]')?.href || null,
              lang: document.documentElement.lang || null,
              h1: [...document.querySelectorAll('h1')].map(e => e.innerText.trim()),
              imgs_missing_alt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).map(i => i.src),
              horizontal_scroll: document.documentElement.scrollWidth > window.innerWidth,
              links: [...document.querySelectorAll('a[href]')].map(a => a.href)
            })""")
            results.append({"page": path, "viewport": name, "status": resp.status if resp else None,
                             "load_seconds": load_s, "screenshot": shot, "console_errors": errors,
                             "failed_requests": sorted(set(failed)), **info})
            page.close()
    # check internal links once
    host = urlparse(BASE).netloc
    links = sorted({l.split("#")[0] for r in results for l in r["links"] if urlparse(l).netloc == host})
    broken = []
    ctx = browser.new_context()
    for l in links:
        r = ctx.request.get(l)
        if r.status >= 400:
            broken.append(f"{r.status} {l}")
    browser.close()
for r in results:
    r.pop("links")
json.dump({"pages": results, "broken_internal_links": broken}, open(f"{OUT}/test-results.json", "w"), ensure_ascii=False, indent=2)
print(f"done: {len(results)} captures, {len(broken)} broken links -> {OUT}/test-results.json")
