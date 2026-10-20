import os, re, sys, json
from collections import defaultdict
from html.parser import HTMLParser

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."

class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.d = defaultdict(list); s._t = None; s.buf = ""
    def handle_starttag(s, t, a):
        a = dict(a)
        if t in ("title", "h1"): s._t, s.buf = t, ""
        if t == "meta" and a.get("name") == "description": s.d["description"].append(a.get("content", ""))
        if t == "link" and a.get("rel") == "canonical": s.d["canonical"].append(a.get("href"))
        if t == "html": s.d["lang"].append(a.get("lang"))
        if t == "img" and "alt" not in a: s.d["img_no_alt"].append(a.get("src"))
        if t == "a" and a.get("href"): s.d["links"].append(a["href"])
        if t == "script" and a.get("type") == "application/ld+json": s.d["jsonld"].append(1)
    def handle_data(s, x):
        if s._t: s.buf += x
    def handle_endtag(s, t):
        if t == s._t: s.d[t].append(s.buf.strip()); s._t = None

pages = {}
for dp, _, fs in os.walk(ROOT):
    if any(x in dp for x in ("node_modules", ".git")): continue
    for f in fs:
        if f.endswith(".html"):
            fp = os.path.join(dp, f); rel = "/" + os.path.relpath(fp, ROOT).replace(os.sep, "/")
            p = P(); p.feed(open(fp, encoding="utf-8", errors="ignore").read()); pages[rel] = p.d

def url_of(rel): return re.sub(r"index\.html$", "", rel)
exists = set(pages) | {url_of(r) for r in pages} | {r[:-5] for r in pages}
sitemap = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read() if os.path.exists(os.path.join(ROOT, "sitemap.xml")) else ""
issues, titles, inbound = defaultdict(list), defaultdict(list), defaultdict(int)
for rel, d in pages.items():
    t = d["title"][0] if d["title"] else ""
    if not t: issues[rel].append("缺少 title")
    titles[t].append(rel)
    if not d["description"]: issues[rel].append("缺少 meta description")
    if len(d["h1"]) != 1: issues[rel].append(f"H1 数量为 {len(d['h1'])}（应为 1）")
    if not d["canonical"]: issues[rel].append("缺少 canonical")
    if not any(d["lang"]): issues[rel].append("html 缺少 lang 属性")
    if not d["jsonld"]: issues[rel].append("没有结构化数据 (JSON-LD)")
    if d["img_no_alt"]: issues[rel].append(f"{len(d['img_no_alt'])} 张图片缺少 alt")
    if sitemap and url_of(rel).rstrip("/").split("/")[-1] not in sitemap and "404" not in rel: issues[rel].append("可能不在 sitemap.xml 中")
    for h in d["links"]:
        if re.match(r"^(https?:|mailto:|tel:|#|javascript:)", h): continue
        target = os.path.normpath(os.path.join(os.path.dirname(rel), h.split("#")[0].split("?")[0])).replace(os.sep, "/")
        if h.startswith("/"): target = h.split("#")[0].split("?")[0]
        inbound[target] += 1
        if target not in exists and target.rstrip("/") + "/" not in exists and target + "/index.html" not in exists:
            issues[rel].append(f"内部链接失效: {h}")
for t, rels in titles.items():
    if t and len(rels) > 1:
        for r in rels: issues[r].append(f"title 与其他页面重复: {rels}")
for rel in pages:
    if rel != "/index.html" and "404" not in rel and not any(inbound.get(k) for k in {rel, url_of(rel), rel[:-5]}):
        issues[rel].append("孤立页面（没有任何内部链接指向它）")
print(json.dumps({"pages_scanned": len(pages), "has_robots_txt": os.path.exists(os.path.join(ROOT, "robots.txt")),
                  "has_sitemap_xml": bool(sitemap), "has_llms_txt": os.path.exists(os.path.join(ROOT, "llms.txt")),
                  "issues": issues}, ensure_ascii=False, indent=2))
