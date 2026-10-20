# 灵猫 (Lingmao) 网站模板 - 官方白底高保真模板二次开发与内容替换指南

本模板已为您完全按照 `https://surfshark.com/zh` 官方最新白底视觉规范 1:1 构建完毕（包含纯白大底 `#ffffff`、`#48b8ba` 绿松石圆角 Hero 卡片、`#f5f5f6` 浅灰 Bento 卡片、`#de2e4c` 树莓红转化按钮以及 17 语种垂直下拉切换面板），并深度集成了灵猫专线官网（`vip01.civetnet.com`）的 **10 大全 IPLC 订阅套餐**。

代码采用纯原生、语义化的 **HTML5 + CSS 变量 + JavaScript** 架构，零任何第三方庞大框架依赖，开箱即用，双击 `index.html` 即可在任意浏览器直接本地离线预览。

---

## 一、核心跳转逻辑说明

1. **「我的账户」跳转**：
   * 顶部导航栏右侧、移动端抽屉菜单中的「我的账户 / 登录」链接均已直连灵猫官网：`https://vip01.civetnet.com`（新窗口安全打开）。
2. **「获取 灵猫」/「获取」按钮跳转**：
   * 导航栏红色「获取 灵猫」按钮、Hero 首屏「获取 灵猫 →」大按钮、导航栏「定价套餐」链接、底部横幅按钮均平滑滚动跳转至页面内置的 **`#pricing` 订阅方案专区**。
3. **「立即订阅」卡片跳转**：
   * 每一个套餐卡片下方的「立即订阅」按钮均直连 `https://vip01.civetnet.com`，方便用户直接下单订购。

---

## 二、项目文件目录说明

```
lingmaonetwork.com/
│
├── index.html               # 核心页面：全部版块（含 10 大真实套餐与详细中文标注）
├── css/
│   └── style.css            # 全局样式：官方纯白大厂设计规范、套餐卡片样式、响应式断点
├── js/
│   └── main.js              # 交互逻辑：17 语种即时切换、套餐 Tab 筛选、移动端抽屉
├── assets/
│   └── images/              # 高清矢量图与界面效果图（已全部本地化离线下载）
│       ├── logo.png                         # Civet Cat 专属卡通萌猫 Logo
│       ├── hero-bf-zh.png                   # 首屏黑五大促实机展示图
│       ├── trustpilot.svg, app-store.svg    # 权威机构评分 Logo
│       ├── secure-connection-zh-desktop.png # Bento 安全连接演示图
│       ├── scam-protection-zh-desktop.png   # Bento 诈骗防护演示图
│       ├── devices-lifestyle.png            # Bento 设备防护演示图
│       ├── mask-identity-desktop.png        # Bento 身份防护演示图
│       └── ...                              # 更多原站高清资产
├── CONTENT_GUIDE.md         # 本开发与内容替换指南
└── yuanma.txt               # 原版备份参考源码
```

---

## 三、灵猫 10 大订阅套餐配置指引 (`#pricing`)

在 [`index.html`](file:///c:/Users/lingm/OneDrive/Desktop/lingmaonetwork.com/index.html) 中搜索 `【全新板块】灵猫官方订阅套餐专区`（约第 674 行），即可查看和修改所有套餐内容：

### 1. 套餐数据一览表（复刻真实套餐）

| 套餐名称 | 周期 / 价格 | 月可用流量 | 时长 | 标签属性 (`data-category`) | 核心特性 |
|---|---|---|---|---|---|
| **灵猫·年付小包** | ¥85.00 / 年 | 45GB / 月 | 365天 | `yearly` | 全IPLC专线、1000Mbps、流媒体/AI解锁 |
| **灵猫·年付Small** | ¥195.00 / 年 | 150GB / 月 | 365天 | `yearly` | 全IPLC专线、1000Mbps、流媒体/AI解锁【热销推荐】 |
| **灵猫·年付Big** | ¥295.00 / 年 | 300GB / 月 | 365天 | `yearly` | 全IPLC专线、1000Mbps、大容量高速专线 |
| **灵猫·季付Small** | ¥65.00 / 季 | 150GB / 月 | 90天 | `quarterly` | 全IPLC专线、1000Mbps、灵活季付 |
| **灵猫·季付Big** | ¥125.00 / 季 | 300GB / 月 | 90天 | `quarterly` | 全IPLC专线、1000Mbps、大容量季付 |
| **灵猫·月付Small** | ¥25.00 / 月 | 150GB / 月 | 30天 | `monthly` | 全IPLC专线、1000Mbps、超低门槛 |
| **灵猫·月付Big** | ¥45.00 / 月 | 300GB / 月 | 30天 | `monthly` | 全IPLC专线、1000Mbps、双倍大流量 |
| **灵猫·不限时Smail**| ¥100.00 / 一次性 | 100GB (不限时) | 不限时 | `onetime` | 全IPLC专线、用完重置享9折、永久有效 |
| **灵猫·不限时Big**  | ¥350.00 / 一次性 | 500GB (不限时) | 不限时 | `onetime` | 全IPLC专线、用完重置享9折、高性价比备用 |
| **灵猫·大流量定制**| ¥999.00 / 月 | 定制工单按需 | 30天 | `onetime` | 独立定制独享带宽、企业或重度团队专属 |

### 2. 套餐分类筛选 Tab 按钮机制
在 [`js/main.js`](file:///c:/Users/lingm/OneDrive/Desktop/lingmaonetwork.com/js/main.js) 中通过 `data-filter` 与套餐卡片的 `data-category` 属性实现无缝切换：
* `all`: 显示全部 10 个方案
* `yearly`: 仅显示 3 个年付特惠方案
* `quarterly`: 仅显示 2 个季付方案
* `monthly`: 仅显示 2 个月付方案
* `onetime`: 显示 2 个不限时方案与 1 个大流量定制方案

---

## 四、官方白色主题与配色变量说明 (`css/style.css`)

打开 [`css/style.css`](file:///c:/Users/lingm/OneDrive/Desktop/lingmaonetwork.com/css/style.css) 文件，在最顶部的 `:root` 变量区进行主题微调：

```css
:root {
  /* 页面底色体系 (纯白明亮大厂风) */
  --bg-primary: #ffffff;          /* 页面核心大底色 (纯白) */
  --bg-secondary: #f5f5f6;        /* 次级底色 / Bento 卡片底色 (浅灰) */
  --bg-card: #f5f5f6;             /* Bento 核心卡片背景 */
  --bg-card-hover: #eceef0;       /* 卡片悬停背景色 */

  /* 强调色与品牌色 */
  --brand-primary: #de2e4c;       /* 品牌标志红 (高转化率行动按钮) */
  --brand-primary-hover: #c03146; /* 品牌红悬浮加深 */
  --brand-cyan: #1ebfbf;          /* 标志性绿松石青色 */
  --hero-card-bg: #48b8ba;        /* 首屏圆角卡片背景色 */

  /* 文字颜色层级 */
  --text-main: #16191c;           /* 主标题与主文本 (浓郁深炭黑) */
  --text-muted: #423d3d;          /* 副文本、段落文本 */
  --text-dim: #7f8a9a;            /* 辅助说明、脚注、小字 */
}
```

---

## 五、各区块内容替换指引（在 `index.html` 与 `js/main.js` 中修改）

所有板块在 [`index.html`](file:///c:/Users/lingm/OneDrive/Desktop/lingmaonetwork.com/index.html) 中均带有 `【区块 X】` 的中文大注释，可使用 `Ctrl + F` 快速定位：

### 1. 顶部公告栏 (`top-banner`)
* **修改位置**：约第 25 行
* **文案修改**：搜索 `欲购从速！在此抢购黑五优惠`，替换为您的促销文案。
* **多语言**：在 `js/main.js` 中的 `topBanner` 字段同步修改不同语言的文案。

### 2. 网站导航栏与 Logo (`site-header`)
* **修改位置**：约第 35 行
* **Logo 修改**：采用高保真 Civet Cat 渐变萌猫图标，位于 `assets/images/logo.png`。
* **右上角操作区**：细竖线分割符 + 扁平经纬地球图标（点击滑出 17 语种选择列表）+ **我的账户**（直连 `https://vip01.civetnet.com`）+ **获取 灵猫** 红色按钮（直通 `#pricing`）。

### 3. 首屏主视觉区 (`hero-section`)
* **视觉特点**：居中的 `#48b8ba` 超大圆角卡片，右侧背景带有透明 `%` 水印。
* **主标题**：`<h1 class="hero-title" data-i18n="heroTitle">把握 VPN 限时优惠</h1>`。
* **行动按钮**：红色胶囊按钮 `获取 灵猫 →`（跳至 `#pricing` 套餐）与黑色胶囊徽章 `30 天退款保证`。
* **右侧主图**：`assets/images/hero-bf-zh.png`，配有右下角支持平台角标（Windows、Apple、Android、TV 等）。

### 4. 信任背书与评分条 (`trust-section`)
* **修改位置**：约第 280 行
* **修改数据**：搜索 `40M+`、`30+`，替换为您真实的下载量、活跃用户数或合作企业数。

### 5. 核心 Bento 卡片网格 (`bento-section`)
* **视觉规范**：白色背景上陈列 `#f5f5f6` 浅灰圆角卡片，悬停时微升并加深背景。
* **4 张卡片**：安全连接、诈骗防护、设备防护、身份防护。

### 6. 深度功能专区 (`feature-section`)
* 采用白底与 `#f9f9fa` 极浅灰交替排版，图文左右穿插：
  * **VPN 专区**：3 个大数字看板（`4500+`、`10 Gbps`、`100%` RAM 服务器）。
  * **防诈骗 3 列卡片**：短信来电拦截、钓鱼邮件检测、恶意网站防护。
  * **杀毒与资质认证**：AV-TEST 权威安全机构背书。
  * **身份隐私列表**：Alternative ID 与数据外泄即时告警。

### 7. 媒体评测与用户口碑 (`reviews-section`)
* `#f5f5f6` 浅灰圆角卡片，包含 Tom's Guide、YouTube 大V、TechRadar 的星级评价。

### 8. 底部收尾 CTA 与页脚
* **CTA 横幅**：绿松石渐变底色，搭配醒目红色购买按钮（点击直达 `#pricing`）。
* **深色综合页脚**：深炭黑 `#16191c` 高对比度底色，包含多列导航链接、7 大安全支付渠道胶囊（Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay, 加密货币）以及版权声明。

---

## 六、多语言国际化 (i18n) 扩展说明

当前系统已完整内置以下 **17 种语言**：
1. 简体中文 (`zh-CN`)
2. English (`en`)
3. Deutsch (`de`)
4. Español (`es`)
5. Français (`fr`)
6. Italiano (`it`)
7. Nederlands (`nl`)
8. Polski (`pl`)
9. Português (`pt`)
10. Suomi (`fi`)
11. Türkçe (`tr`)
12. Русский (`ru`)
13. Українська (`uk`)
14. 한국어 (`ko`)
15. 香港繁體 (`zh-HK`)
16. 台灣繁體 (`zh-TW`)
17. 日本語 (`ja`)

**如何添加更多语言或修改翻译文案？**
打开 [`js/main.js`](file:///c:/Users/lingm/OneDrive/Desktop/lingmaonetwork.com/js/main.js)，在 `i18nTranslations` 对象中找到对应语言代码，直接修改或新增键值对即可。用户切换的语言将自动持久化保存在浏览器的 `localStorage` 中。
