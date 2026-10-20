---
name: seo-ai-site-audit
description: "体检 SEO 静态网站：技术 SEO（robots、sitemap、结构化数据、速度、移动端）和 AI 搜索可见度（llms.txt、AI 爬虫、AI 引用），并直接修复。体检网站或想被 AI 引用时使用。"
---

# SEO + AI 搜索网站体检

改编自 agency-agents 仓库的 SEO Specialist（技术 SEO 部分）、AEO Foundations Architect 和 AI Citation Strategist，已调整为适合「静态内容站 + 建站新手」的版本。

## 用户情况
用户在做 SEO 静态内容站，不懂代码。所以要用通俗中文讲清楚每个问题的影响，并直接动手修复。只有需要用户做决定的事（例如是否允许 AI 爬虫抓取）才先问，问的时候把各个选项的利弊讲清楚。

## 顺序原则：先打地基，再做优化
先确认搜索引擎和 AI 能「找到、读懂」网站（A 部分和 B 部分），再去研究怎么被 AI 引用（C 部分）。地基没打好，后面的优化都白做。

---

## A. 技术 SEO 检查

### A1. 自动扫描所有页面
（脚本已放在本技能的 scripts/seo_scan.py，可直接运行；下方代码与之相同。）

在网站根目录运行下面的脚本（只需要 Python 3），得到每个页面的问题清单：

```python
# seo_scan.py  用法: python3 seo_scan.py 网站根目录
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
```

扫描结果只是线索，要打开相关文件确认后再下结论。网站如果用生成器（Astro、Hugo 等）搭建，就扫描构建后的输出目录（如 dist/、public/）。

### A2. 逐项核对
**能否被抓取和收录**
- [ ] robots.txt 存在，没有误封重要目录，并写明 `Sitemap: https://域名/sitemap.xml`
- [ ] sitemap.xml 包含所有应被收录的页面，不含 404、跳转页或非 canonical 的 URL；上线后提交到 Google Search Console（中文站另外提交到百度搜索资源平台）
- [ ] 每个页面有指向自己的 canonical；同一内容只有一个网址（带不带 www、结尾带不带 / 要统一）
- [ ] 全站 HTTPS，没有连续多次跳转
- [ ] 有自定义 404 页面，并返回真正的 404 状态码

**网站结构**
- [ ] URL 简短、有意义，最好用英文小写和连字符
- [ ] 任何页面离首页不超过 3 次点击，没有孤立页面
- [ ] 有面包屑导航，并配 BreadcrumbList 结构化数据

**速度（Core Web Vitals，网页核心性能指标）**
| 指标 | 含义 | 达标值 |
|---|---|---|
| LCP | 主要内容多快显示出来 | < 2.5 秒 |
| INP | 点击后多快有反应 | < 200 毫秒 |
| CLS | 页面加载时会不会乱跳 | < 0.1 |

真实数据请用户在 https://pagespeed.web.dev 输入网址查看，或者看 Search Console 里的「核心网页指标」报告。静态站常见的修复方法：压缩图片并改用 WebP、给图片写明宽高、删掉用不上的 JS 和字体、首屏以下的图片延迟加载。

**移动端**
- [ ] 有 `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] 手机上没有横向滚动条，字号清晰，按钮之间间距够大

**结构化数据**
- [ ] 文章页有 Article/BlogPosting，全站有 Organization 和 WebSite
- [ ] 用 https://validator.schema.org 或谷歌的富媒体搜索结果测试工具验证
- 提醒：谷歌目前只对少数权威政府和健康类网站显示 FAQ 富媒体结果，HowTo 富媒体结果已经取消。加 FAQPage 标记主要是帮助机器理解内容，不要承诺会显示富媒体结果。

---

## B. AI 搜索地基（AEO）

### B1. AI 爬虫访问（需要用户做决定）
AI 爬虫分两类，建议分开处理：
- **AI 搜索和引用类**（允许后，AI 回答问题时才可能引用并链接到你的网站），建议允许：OAI-SearchBot、ChatGPT-User（OpenAI）；Claude-SearchBot、Claude-User（Anthropic）；PerplexityBot
- **AI 训练类**（内容会被用来训练模型），由用户决定：GPTBot（OpenAI）、ClaudeBot（Anthropic）、Google-Extended（只影响 Gemini，不影响谷歌搜索排名）、Applebot-Extended、CCBot
- 通常建议屏蔽：Bytespider 等抓取很激进的爬虫

爬虫名称会变化，写 robots.txt 前先上网搜索各家官方文档，核对最新名称。把选项讲清楚，由用户拍板，然后照此执行。示例：

```text
# AI 爬虫访问策略 — 更新于 YYYY-MM-DD
User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Bytespider
Disallow: /

User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

### B2. llms.txt
在网站根目录放一份 `/llms.txt`，给 AI 一份精选的网站导览。要跟用户说明：这是社区约定（由 Jeremy Howard 提出），不是正式标准，各大 AI 公司是否会使用还不确定。做起来成本很低，可以做，但不要期待太高。

```markdown
# 网站名称

> 一句话说明网站是做什么的、给谁看的

## 核心页面
- [支柱页标题](https://域名/url)：一句话说明

## 按主题分类
### 主题 1
- [文章标题](https://域名/url)：一句话说明
```

新增或删除文章后要同步更新。过期的 llms.txt 会把 AI 引向失效页面，比没有这个文件更糟。

### B3. 内容是否容易被 AI 读懂
- [ ] 关闭 JavaScript 后正文仍然能看到（纯静态 HTML 一般没问题；如果用 React 等框架，要确认是预渲染的）
- [ ] 标题层级是按语义来用的（H1→H2→H3），而不是为了调字体大小
- [ ] 非常长的页面在开头加一段「要点总结」，或者拆成几篇更聚焦的文章
- [ ] 重要内容不要只放在图片或 PDF 里
- 内容站不需要做 agent-permissions.json、WebMCP 这类「让 AI 帮用户下单」的设置，可以跳过

### 地基评分表
| 检查项 | 状态 | 说明 |
|---|---|---|
| robots.txt 有 AI 爬虫规则 | ✅/❌/⚠️ | |
| llms.txt 已发布且是最新的 | | |
| sitemap 完整并已提交 | | |
| 关闭 JS 后正文可见 | | |
| 标题层级正确 | | |
| 结构化数据覆盖所有文章 | | |

---

## C. AI 引用检查（地基打好后再做）

1. **准备问题**：列出 20–40 个目标读者会问 AI 的问题，按类型分组：推荐类（「最好的 X」）、对比类（「X 和 Y 有什么区别」）、方法类（「怎么做 X」）、选择类（「怎么选 X」）。
2. **测试**：没办法直接操作 ChatGPT、Gemini、Perplexity、Claude 这几个平台时，把问题清单交给用户，请用户逐个提问后把回答贴回来；如果有浏览器工具可用，就自己去测。把结果记录成表格：

| 问题 | 平台 | 有没有引用我们 | 引用了谁 | 对方为什么胜出 | 优先级 |

3. **分析被抢走的问题**：看被引用的竞争对手做对了什么，常见原因包括有专门的对比页、问答页的问题和提问方式完全吻合、开头直接给出答案、数据和来源清楚、品牌名称一致。
4. **修复清单**：按预期效果排序（不是按难易排序），逐条写明针对哪些问题、怎么改，然后直接动手改。常见修复：
   - 「X 和 Y 的区别」类问题 → 做专门的对比页，配客观的对比表
   - 「怎么选 X」类问题 → 写选购指南，给出清晰的判断标准
   - 方法类问题 → 开头先给结论，再展开步骤
   - 实体信号 → 全站统一网站名称，完善「关于我们」和作者页，加 Organization 结构化数据
5. **复查**：修复约 14 天后，用同一批问题再测一遍，对比引用率的变化。

规则：AI 的回答每次都可能不同，所以只能说「提高被引用的可能性」，不能保证一定被引用。测试结果只代表当时的情况。修复前一定先记录基线，否则无法证明修复有没有效果。

---

## 交付格式
1. **体检总结**：用 3–5 句大白话说明网站目前的整体状况
2. **评分表**：A、B 两部分，每项标 ✅/❌/⚠️
3. **问题清单**：按「严重 / 建议 / 可选」分级，每条写清楚是什么问题、有什么影响、怎么修
4. **直接修复**：除了需要用户拍板的事项，其余直接改好，然后列出修改了哪些文件
5. **下一步**：需要用户自己去做的事（例如提交 Search Console、在 PageSpeed 测速），写成带网址的简单步骤