---
name: site-launch-qa
description: "SEO 静态网站上线或大改前做证据式质量检查：多设备截图、链接与交互测试、速度与 SEO 快检，默认判定需要修改，证据充分才放行。问能不能上线或要检查网站时使用。"
---

# 网站上线前质量把关

改编自 agency-agents 仓库的 Evidence Collector（截图取证 QA）和 Reality Checker（上线前最终把关），已调整为适合「静态内容站 + 建站新手」的版本。

## 为什么需要这个技能
用户不懂代码，没办法自己判断网站到底做得好不好。这个技能的作用就是替用户严格把关：**只相信证据，不相信说法**，包括 AI 自己之前说的「已完成」「没问题」。

## 基本态度
- **默认结论是「需要修改」**，只有证据充分才判定「可以上线」
- 第一版网站通常至少有 3–5 个问题，「没有发现问题」本身就是危险信号，要再仔细查
- 不打虚高的分数：C+ 或 B- 对第一版来说很正常，不要轻易给 A+ 或 98 分
- 每个问题都要附证据（截图文件名、测试数据或具体代码位置）
- 只对照用户原本的要求来检查，不额外加用户没提的要求
- 用大白话描述问题，并说明对访客或 SEO 有什么影响

## 检查流程

### 第 1 步：核对实际做了什么
- 列出网站的所有页面文件
- 找出用户最初的要求（对话内容或需求文档），逐条引用原话，和实际做出来的内容对照

### 第 2 步：截图取证（不能跳过）
（脚本已放在本技能的 scripts/qa_capture.py，可直接运行；下方代码与之相同。）

在网站目录启动本地服务器，然后用 Playwright 对关键页面（首页、1 个支柱页、1–2 篇文章、404 页）分别在电脑、平板、手机三种尺寸下截全页图，同时记录报错、加载失败的资源和失效的内部链接。

```bash
cd 网站根目录 && python3 -m http.server 8000 &
python3 qa_capture.py http://localhost:8000 /,/某支柱页/,/某文章.html,/404.html qa-screenshots
```

```python
# qa_capture.py  需要: pip install playwright（如果浏览器还没装，再执行 playwright install chromium）
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
```

**必须亲自打开并查看每一张截图**，描述实际看到的内容，而不是想象中应该有的样子。重点看：排版有没有错乱、手机上有没有横向滚动、文字是否清晰、图片有没有显示、导航是否正常。

### 第 3 步：交互测试
用 Playwright 点击，并截取点击前后的对比图：
- 顶部导航和页脚链接能否跳到正确页面
- 手机端的汉堡菜单能否打开和关闭
- 文章目录的锚点能否跳到对应段落
- FAQ 折叠区能否展开和收起
- 站内搜索、表单、深浅色切换（如果网站有这些功能）是否正常

### 第 4 步：SEO 快检
- 每个页面：title、description、唯一的 H1、canonical、lang 是否都有，title 有没有重复
- 图片有没有 alt，有没有特别大的图片（超过 200KB 的要标出来）
- robots.txt 有没有误封，sitemap.xml 是否包含所有页面
- 404 页面是否存在，favicon 是否正常
- 有没有占位文字（如 Lorem ipsum、「示例」「TODO」）或假链接（href="#"）

如果需要全面的 SEO 体检，改用 seo-ai-site-audit 技能。

### 第 5 步：速度
- 查看 test-results.json 里的加载时间和页面资源大小
- 本地服务器测出来的速度偏快，上线后请用户在 https://pagespeed.web.dev 测真实数据

## 直接判定「未通过」的情况
- 用户访问路径走不通（导航或链接失效）
- 电脑、平板、手机显示效果明显不一致，或者手机端排版错乱
- 页面加载超过 3 秒
- 有可以点击的元素但点了没反应
- 截图和之前宣称的效果对不上
- 之前发现的问题在截图里仍然存在

## 报告模板

```markdown
# 上线前检查报告（日期）

## 一句话结论
状态：未通过 / 需要修改 / 可以上线（默认：需要修改）
整体评分：C+ / B- / B / B+

## 检查了什么
- 页面：…
- 截图：…（列出文件名）
- 原始要求对照：
  - ✅ 要求「…」→ 截图显示「…」
  - ❌ 要求「…」→ 实际情况「…」

## 发现的问题
1. 【严重】问题描述（大白话）
   证据：mobile-home.png 显示…
   影响：访客会… / 对 SEO 的影响是…
   修复方法：…
2. 【建议】…
3. 【可选】…

## 下一步
- 需要修复的问题：…
- 修复后需要重新检查：是
```

## 收尾
报告交给用户后，询问是否要直接修复。修复完成后，重新跑一遍第 2–5 步，用新截图证明问题已经解决，然后才能改变结论。