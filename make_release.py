# 生成上线包：把网站真正需要的文件复制到 release/ 文件夹，上线时只上传 release/ 里的内容。
# 用法（在网站根目录运行）: python make_release.py
#
# 会先重新生成文档页、sitemap.xml 和 llms.txt，然后只复制：
#   - 下面 PAGES / FILES 列出的页面和文件
#   - docs/ 下的全部文档页
#   - 页面、样式和脚本里实际引用到的图片（没用到的图片不会上传）
# 不会上传：说明文档、源码备份、测试文件、docs-src/、node_modules/、.agents/、.claude/ 等。
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "release")

PAGES = ["index.html", "pricing.html", "docs.html", "speedtest.html", "404.html"]
FILES = ["robots.txt", "BingSiteAuth.xml", "sitemap.xml", "llms.txt", "css/style.css", "js/main.js", "js/docs.js"]


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


def copy(rel):
    dst = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(os.path.join(ROOT, rel), dst)


def main():
    subprocess.run([sys.executable, os.path.join(ROOT, "docs-src", "build_docs.py")], check=True)

    docs = sorted("docs/" + f for f in os.listdir(os.path.join(ROOT, "docs")) if f.endswith(".html"))
    sources = PAGES + FILES + docs

    # 找出所有被引用的图片
    assets = set()
    for rel in sources:
        if rel.endswith((".html", ".css", ".js")):
            for m in re.findall(r"assets/[A-Za-z0-9_./-]+", read(rel)):
                assets.add(m.rstrip("."))
    missing = sorted(a for a in assets if not os.path.isfile(os.path.join(ROOT, a)))
    if missing:
        sys.exit("以下图片被页面引用但文件不存在，请先处理：\n  " + "\n  ".join(missing))

    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    for rel in sources + sorted(assets):
        copy(rel)

    all_images = set("assets/images/" + f for f in os.listdir(os.path.join(ROOT, "assets", "images")))
    unused = sorted(all_images - assets)
    print(f"上线包已生成：release/（{len(sources)} 个页面和文件，{len(assets)} 张图片）")
    if unused:
        print(f"有 {len(unused)} 张图片没被任何页面使用，没有放进上线包：")
        for u in unused:
            print("  " + u)


if __name__ == "__main__":
    main()
