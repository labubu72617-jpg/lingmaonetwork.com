# 文档中心生成器：把 articles.json 里的每篇文章生成独立静态页面 docs/<文章名>.html，
# 同时重新生成 sitemap.xml 和 llms.txt，保证三者永远同步。
# 用法（在网站根目录运行）: python docs-src/build_docs.py
import html
import json
import os
import re
from collections import OrderedDict

SITE = "https://lingmaonetwork.com/"
BRAND = "灵猫 Civet Cat"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "docs-src")
OUT = os.path.join(ROOT, "docs")

# 根目录下需要被搜索引擎收录的页面（会写进 sitemap.xml）
ROOT_PAGES = [("", "首页"), ("pricing.html", "订阅套餐价格")]


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def write(p, s):
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def fix_links(content):
    """文章正文里的链接原本相对网站根目录，页面挪到 docs/ 后要调整。"""
    content = re.sub(r'href="docs\.html\?article=([a-z0-9-]+)"', r'href="\1.html"', content)
    content = re.sub(r'(href|src)="(index\.html|pricing\.html|assets/)', r'\1="../\2', content)
    return content


def jsonld(key, a):
    url = f"{SITE}docs/{key}.html"
    data = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": a["title"],
        "description": a["summary"],
        "url": url,
        "mainEntityOfPage": url,
        "inLanguage": "zh-CN",
        "articleSection": a["category"],
        "datePublished": a["date"],
        "dateModified": a["date"],
        "author": {"@type": "Organization", "name": BRAND, "url": SITE},
        "publisher": {"@id": f"{SITE}#org", "@type": "Organization", "name": BRAND,
                      "logo": {"@type": "ImageObject", "url": f"{SITE}assets/images/logo.png"}},
        "isPartOf": {"@id": f"{SITE}#website"},
    }
    return json.dumps(data, ensure_ascii=False).replace("</", "<\\/")


def main():
    articles = json.loads(read(os.path.join(SRC, "articles.json")), object_pairs_hook=OrderedDict)
    tpl = read(os.path.join(SRC, "template.html"))
    os.makedirs(OUT, exist_ok=True)

    for key, a in articles.items():
        page = tpl
        # 侧边栏高亮当前文章
        page = page.replace(f'<li class="docs-menu-item" data-id="{key}">',
                            f'<li class="docs-menu-item active" data-id="{key}">')
        values = {
            "KEY": key,
            "PAGE_TITLE": html.escape(a["title"]) + " - 灵猫网络文档中心",
            "DESCRIPTION": html.escape(a["summary"], quote=True),
            "CANONICAL": f"{SITE}docs/{key}.html",
            "JSONLD": jsonld(key, a),
            "CATEGORY": html.escape(a["category"]),
            "READTIME": html.escape(a["readTime"]),
            "DATE": html.escape(a["date"]),
            "TITLE": html.escape(a["title"]),
            "SUMMARY": html.escape(a["summary"]),
            "CONTENT": fix_links(a["content"]),
        }
        for k, v in values.items():
            page = page.replace("{{" + k + "}}", v)
        write(os.path.join(OUT, f"{key}.html"), page)

    # sitemap.xml
    urls = [(SITE + p, None) for p, _ in ROOT_PAGES]
    urls += [(f"{SITE}docs/{k}.html", a["date"]) for k, a in articles.items()]
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, d in urls:
        lines.append(f"  <url><loc>{u}</loc>" + (f"<lastmod>{d}</lastmod>" if d else "") + "</url>")
    lines.append("</urlset>")
    write(os.path.join(ROOT, "sitemap.xml"), "\n".join(lines) + "\n")

    # llms.txt（按文档分类分组）
    groups = OrderedDict()
    for k, a in articles.items():
        groups.setdefault(a["category"], []).append((k, a))
    out = [f"# {BRAND}", "",
           "> 灵猫 (Civet Cat) 提供全 IPLC 物理专线的全球高速网络服务，本站包含套餐价格、技术原理、使用教程与网络检测工具。", "",
           "## 核心页面",
           f"- [首页]({SITE})：产品总览与核心卖点",
           f"- [订阅套餐价格]({SITE}pricing.html)：全部套餐、价格与流量方案", ""]
    for cat, items in groups.items():
        out.append(f"## {cat}")
        for k, a in items:
            out.append(f"- [{a['title']}]({SITE}docs/{k}.html)：{a['summary']}")
        out.append("")
    write(os.path.join(ROOT, "llms.txt"), "\n".join(out))

    print(f"已生成 {len(articles)} 个文档页面，以及 sitemap.xml（{len(urls)} 个网址）和 llms.txt")


if __name__ == "__main__":
    main()
