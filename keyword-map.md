# 关键词归属表 (keyword-map)

> 规则：一个主关键词只归一个页面。新增或修改任何页面的 title / H1 / description 前，先查这张表。
> 搜索量一栏目前全部是**估算**（网站还没接入 Search Console，也没有关键词工具数据）。接入后用真实数据替换。
> 更新于 2026-10-19

## 一、关键词 → 负责页面

| 主关键词 | 搜索量 | 意图 | 负责页面 | 角色 | 优先级 |
|---|---|---|---|---|---|
| 灵猫 / Civet Cat / 灵猫专线（品牌词） | 估算：低（新品牌） | 导航型 | `/` 首页 | 首页 | 高 |
| IPLC 专线 是什么 / IPLC 是什么意思 | 估算：中 | 信息型 | `/docs/what-is-iplc.html` | **支柱页：IPLC 专线** | 高 |
| IPLC 和 IEPL 区别 | 估算：中 | 信息型 | 待写：`/docs/iplc-vs-iepl.html` | 支撑 | 高 |
| IPLC 和 BGP / CN2 区别 | 估算：中 | 商业调查 | 待写：`/docs/iplc-vs-bgp-cn2.html`（把 what-is-iplc 里的对比表扩写成独立文章） | 支撑 | 高 |
| IPLC 专线 延迟 / 晚高峰测速 | 估算：中 | 商业调查 | `/docs/speedtest-benchmark.html` | 支撑 | 高 |
| IPLC 骨干网络 架构 | 估算：低 | 信息型 | `/docs/iplc-network.html` | 支撑（需扩写） | 中 |
| IPLC 节点 香港 / 日本 / 新加坡 | 估算：中 | 商业调查 | `/docs/global-nodes.html` | 支撑（需扩写） | 中 |
| 原生 IP 和广播 IP 区别 | 估算：中 | 信息型 | `/docs/native-ip.html` | **支柱页：原生 IP 与解锁** | 高 |
| ChatGPT 地区不支持 / 怎么稳定使用 ChatGPT | 估算：高 | 信息型 | `/docs/ai-productivity.html` | 支撑（需扩写） | 高 |
| Claude / OpenAI API 稳定直连（企业） | 估算：低 | 商业调查 | `/docs/solution-ai-dev.html` | 支撑 —— **避免和 ai-productivity 抢同一个词**，只做「企业 / API / 高并发」方向 | 中 |
| Netflix 解锁 / 流媒体解锁 检测 | 估算：中 | 信息型 | `/docs/solution-streaming.html` | 支撑（需扩写） | 中 |
| 跨境电商 防关联 IP | 估算：中 | 商业调查 | `/docs/solution-ecommerce.html` | 支撑（需扩写） | 中 |
| DNS 泄漏检测 | 估算：中 | 交易型（工具） | `/docs/dns-leak.html` | **支柱页：网络检测工具** | 高 |
| WebRTC 泄漏检测 | 估算：中 | 交易型（工具） | `/docs/webrtc-leak.html` | 支撑 | 高 |
| 我的 IP 查询 / 本机公网 IP | 估算：高、竞争极大 | 交易型（工具） | `/docs/my-ip.html` | 支撑 | 低（大站太多） |
| 节点 延迟测试 / ping 测试 | 估算：中 | 交易型（工具） | `/docs/ping-test.html` | 支撑 | 中 |
| 零日志 / 无日志 政策 | 估算：低 | 商业调查 | `/docs/no-logs-policy.html` | **支柱页：隐私安全** | 中 |
| RAM 无盘服务器 | 估算：低 | 信息型 | `/docs/ram-diskless.html` | 支撑 | 低 |
| 暗网监测 / 邮箱泄露查询 | 估算：中 | 交易型 | `/docs/security-alert.html` | 支撑 | 中 |
| 虚拟邮箱 / 隐私邮箱别名 | 估算：低 | 信息型 | `/docs/virtual-identity.html` | 支撑 —— **避免和 security-alert 抢「隐私防护」** | 低 |
| 客户端下载 / 订阅导入教程 | 估算：低（品牌用户） | 导航型 | `/docs/downloads.html`、`/docs/setup-guides.html` | 支持页 | 中 |
| 灵猫 价格 / 套餐 | 估算：低 | 交易型 | `/pricing.html` | 落地页 | 高 |
| 灵猫 优惠码 | 估算：低 | 交易型 | `/docs/discount-80.html` | 落地页 | 中 |

## 二、发现的关键词蚕食（几个页面抢同一个词）

| 冲突的页面 | 抢的词 | 处理方法 |
|---|---|---|
| 首页 FAQ 第 1 题「什么是全物理 IPLC 专线？」 vs `/docs/what-is-iplc.html` 的 H1 | IPLC 专线是什么 | 首页 FAQ 只保留 1–2 句短答案，加一个「阅读完整解析」链接到 what-is-iplc |
| `/docs/ai-productivity.html` vs `/docs/solution-ai-dev.html` | AI 大模型 直连 | ai-productivity 管个人用户（ChatGPT/Claude 网页版、App），solution-ai-dev 改成只讲企业 API 和高并发 |
| `/docs/what-is-iplc.html` vs `/docs/iplc-network.html` vs `/docs/global-nodes.html` | IPLC 专线 | what-is-iplc 做支柱页；另外两篇分别只讲「灵猫自己的骨干架构」和「节点分布与规格」，并链接回支柱页 |
| `/docs/security-alert.html` vs `/docs/virtual-identity.html` | 隐私防护 / 身份防护 | security-alert 管「泄露监测」，virtual-identity 管「虚拟邮箱别名」 |
| `/docs/no-logs-policy.html` vs `/docs/privacy.html` vs `/docs/security-whitepaper.html` | 零日志 / 隐私 | no-logs-policy 做支柱页；privacy 只做法律文本；security-whitepaper 合并进 no-logs-policy 或扩写成真正的白皮书 |

## 三、内容问题
- 31 篇文档里有 25 篇正文不足 500 字，属于「内容过薄」，搜索引擎和 AI 很少会引用。按下面的日历优先扩写。
- 所有文章都没有作者署名，只写了「更新于」日期。建议加一个真实的作者或团队页（E-E-A-T）。
- 测速报告的配图已换成真实测速图（2026-10-19，MiaoKo 测速工具，珠海联通 9Gbps 32 线程，测试时间 2026-07-19 17:24）。注意：正文写的「三网、晚高峰 20:00–23:00、7 天第三方实验室」与这张图的测试条件不一致，用户暂时决定不改文字。

## 四、内容日历（前 8 周，新站先做竞争小的长尾词）

| 周次 | 标题（草案） | 主关键词 | 集群 | 角色 | 状态 |
|---|---|---|---|---|---|
| 第 1 周 | 扩写《什么是 IPLC 专线？》，加 FAQ、目录和外部权威来源 | IPLC 专线 是什么 | IPLC 专线 | 支柱 | 待做 |
| 第 1 周 | 修复首页 FAQ 与支柱页的蚕食 | — | — | — | 待做 |
| 第 2 周 | IPLC 和 IEPL 有什么区别？一张表看懂 | IPLC 和 IEPL 区别 | IPLC 专线 | 支撑 | 待写 |
| 第 2 周 | IPLC、BGP、CN2 GIA 对比：晚高峰谁更稳？ | IPLC 和 BGP 区别 | IPLC 专线 | 支撑 | 待写 |
| 第 3 周 | 扩写《原生 IP 与广播 IP 区别》 | 原生 IP 和广播 IP 区别 | 原生 IP 与解锁 | 支柱 | 待做 |
| 第 3 周 | 扩写《ChatGPT 提示地区不支持怎么办》（改写 ai-productivity） | ChatGPT 地区不支持 | 原生 IP 与解锁 | 支撑 | 待做 |
| 第 4 周 | 扩写 DNS 泄漏检测页：什么是 DNS 泄漏、怎么修复 | DNS 泄漏检测 | 网络检测工具 | 支柱 | 待做 |
| 第 4 周 | 扩写 WebRTC 泄漏检测页：浏览器关闭 WebRTC 教程 | WebRTC 泄漏检测 | 网络检测工具 | 支撑 | 待做 |
| 第 5 周 | 流媒体解锁检测：Netflix 显示代理错误怎么办 | Netflix 解锁 | 原生 IP 与解锁 | 支撑 | 待做 |
| 第 6 周 | 跨境电商多店铺防关联：IP 环境怎么搭 | 跨境电商 防关联 IP | 原生 IP 与解锁 | 支撑 | 待做 |
| 第 7 周 | 零日志政策说明（合并 security-whitepaper） | 零日志 | 隐私安全 | 支柱 | 待做 |
| 第 8 周 | 补做晚高峰、三网实测，让测速报告正文和配图一致 | IPLC 晚高峰测速 | IPLC 专线 | 支撑 | 待做 |

## 五、内链规则
- 每篇支撑文章正文里至少 1 次链接回本集群的支柱页，锚文字用支柱页的主关键词。
- 支柱页链接到本集群所有支撑文章。
- 首页各模块的「了解更多」按钮链接到对应支柱页，而不是 pricing。
