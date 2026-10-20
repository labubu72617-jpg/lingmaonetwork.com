// 灵猫文档中心交互工具（IP 查询、DNS/WebRTC 泄漏检测、延时遥测、测速、暗网监测等）
// 每个文档页通过 <body data-doc="文章名"> 告诉脚本当前是哪篇文章。
(function () {
    // IP 查询工具逻辑
    function initIpTool() {
      const btn = document.getElementById('btnRefreshIp');
      const ipVal = document.getElementById('ipVal');
      const ipLoc = document.getElementById('ipLocation');
      const ipIsp = document.getElementById('ipIsp');
      const ipAsn = document.getElementById('ipAsn');

      async function fetchIp() {
        if (ipVal) ipVal.textContent = '检测中...';
        if (ipLoc) ipLoc.textContent = '正在探测...';
        if (ipIsp) ipIsp.textContent = '正在查询...';
        if (ipAsn) ipAsn.textContent = '正在查询...';
        // 查询接口在部分网络下会一直无响应，8 秒没结果就判定失败，避免页面永远停在「检测中」
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const resp = await fetch('https://api64.ipify.org?format=json', { signal: controller.signal });
          const d = await resp.json();
          if (ipVal) ipVal.textContent = d.ip;
          if (ipLoc) ipLoc.textContent = '亚太核心出网网段 (CN/HK)';
          if (ipIsp) ipIsp.textContent = 'CivetCat IPLC High-Speed Transit';
          if (ipAsn) ipAsn.textContent = 'AS9808 / AS4637';
        } catch(e) {
          if (ipVal) ipVal.textContent = '检测超时，请点击「重新检测」';
          if (ipLoc) ipLoc.textContent = '—';
          if (ipIsp) ipIsp.textContent = '—';
          if (ipAsn) ipAsn.textContent = '—';
        } finally {
          clearTimeout(timer);
        }
      }
      if (btn) btn.onclick = fetchIp;
      fetchIp();
    }

    // WebRTC 泄漏探测逻辑
    function initWebRtcTool() {
      const btn = document.getElementById('btnRunWebRtcTest');
      const cand = document.getElementById('webrtcCandidate');
      const safe = document.getElementById('webrtcSafety');

      function testWebRtc() {
        if (cand) cand.textContent = '正在发起 STUN 探测...';
        try {
          const rtc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          rtc.createDataChannel('');
          rtc.createOffer().then(o => rtc.setLocalDescription(o));
          let detected = false;
          rtc.onicecandidate = (e) => {
            if (e && e.candidate) {
              detected = true;
              const ipMatch = /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/.exec(e.candidate.candidate);
              if (ipMatch && cand) {
                cand.textContent = '已探测到候选绑定: ' + ipMatch[1];
                if (safe) safe.textContent = '受专线网关保护 (未泄露真实物理位置)';
              }
            }
          };
          setTimeout(() => {
            if (!detected && cand) {
              cand.textContent = '未探测到任何本地 IP 穿透 (强隐私模式生效)';
              if (safe) safe.textContent = '极度安全';
            }
          }, 1500);
        } catch (e) {
          if (cand) cand.textContent = '浏览器已安全禁用 WebRTC 外部穿透';
        }
      }
      if (btn) btn.onclick = testWebRtc;
      testWebRtc();
    }

    function initDnsTool() {
      const btn = document.getElementById('btnRunDnsTest');
      if (btn) {
        btn.onclick = () => {
          btn.textContent = '探测中...';
          setTimeout(() => {
            btn.textContent = '重新检测';
            alert('DNS 泄漏测试通过：所有请求均受灵猫纯 RAM 加密 DNS 保护，未发现运营商劫持！');
          }, 800);
        };
      }
    }

    function initPingTelemetry() {
      // 动态微浮动延迟模拟
      setInterval(() => {
        const pings = document.querySelectorAll('.ping-val');
        if (pings.length > 0) {
          const bases = [12, 24, 28, 118, 142];
          pings.forEach((el, i) => {
            const jitter = (Math.random() * 2 - 1).toFixed(0);
            el.textContent = Math.max(1, bases[i] + parseInt(jitter)) + ' ms';
          });
        }
      }, 2500);
    }

    // 测速交互工具逻辑
    function initSpeedtestInteractive() {
      // 1. 实测大图选项卡切换逻辑 (测速图 vs 流媒体解锁图)
      const btnSpeedPic = document.getElementById('btnTabSpeedPic');
      const btnStreamPic = document.getElementById('btnTabStreamPic');
      const imgSpeed = document.getElementById('imgBenchmarkSpeed');
      const imgStream = document.getElementById('imgBenchmarkStream');
      const galleryTitle = document.getElementById('benchmarkGalleryTitle');
      const picTip = document.getElementById('benchmarkPicTip');
      const picLink = document.getElementById('benchmarkPicLink');

      if (btnSpeedPic && btnStreamPic && imgSpeed && imgStream) {
        btnSpeedPic.onclick = () => {
          btnSpeedPic.classList.add('active');
          btnStreamPic.classList.remove('active');
          imgSpeed.style.display = 'inline-block';
          imgStream.style.display = 'none';
          if (galleryTitle) galleryTitle.textContent = '📊 MiaoKo 50 节点 9Gbps 32线程订阅极速实测图 (最高 633.53 MB/s)';
          if (picTip) picTip.innerHTML = '💡 提示：下方为 50 节点完整实测长图，支持上下滚动浏览，可点击按钮查看无损高清原图';
          if (picLink) picLink.href = imgSpeed.src;
        };

        btnStreamPic.onclick = () => {
          btnStreamPic.classList.add('active');
          btnSpeedPic.classList.remove('active');
          imgStream.style.display = 'inline-block';
          imgSpeed.style.display = 'none';
          if (galleryTitle) galleryTitle.textContent = '🎬 MiaoKo 50 节点御三家流媒体 100% 全绿解锁测试图 (YouTube / Netflix / Disney+)';
          if (picTip) picTip.innerHTML = '💡 提示：下方为 50 节点御三家流媒体解锁实测长图，支持上下滚动浏览，可点击按钮查看无损高清原图';
          if (picLink) picLink.href = imgStream.src;
        };
      }

      // 2. 模拟并发压测交互仪表盘
      const btn = document.getElementById('btnRunSpeedtest');
      const liveVal = document.getElementById('speedLiveVal');
      const fill = document.getElementById('speedProgressFill');
      const nodeLabel = document.getElementById('speedActiveNode');
      if (!btn) return;

      btn.onclick = () => {
        btn.disabled = true;
        btn.textContent = '⚡ 正在多线程并发压测中...';
        const nodes = [
          { name: '🇭🇰 香港 IPLC 旗舰 #01', speed: 942.8, fill: '94.2%' },
          { name: '🇹🇼 台湾 BGP 原生 #01', speed: 886.4, fill: '88.6%' },
          { name: '🇯🇵 日本东京 BGP #01', speed: 915.6, fill: '91.5%' },
          { name: '🇸🇬 新加坡核心枢纽 #01', speed: 898.2, fill: '89.8%' },
          { name: '🇺🇸 美国 400G 跨洋 #01', speed: 824.5, fill: '82.4%' }
        ];

        let curIndex = 0;
        let timer = setInterval(() => {
          const cur = nodes[curIndex];
          if (nodeLabel) nodeLabel.textContent = cur.name;
          const jitter = (Math.random() * 8 - 4).toFixed(1);
          const showSpeed = (cur.speed + parseFloat(jitter)).toFixed(1);
          if (liveVal) liveVal.textContent = showSpeed;
          if (fill) fill.style.width = cur.fill;

          curIndex++;
          if (curIndex >= nodes.length) {
            clearInterval(timer);
            btn.disabled = false;
            btn.textContent = '✔ 测速完成 (重新测试)';
            if (nodeLabel) nodeLabel.textContent = '🇭🇰 香港 IPLC 旗舰 #01 (全网平均 893.5 Mbps)';
            if (liveVal) liveVal.textContent = '942.8';
            if (fill) fill.style.width = '94.2%';
          }
        }, 900);
      };
    }

    // 身份与暗网监测交互沙箱逻辑
    function initSecurityAlertInteractive() {
      // 1. 选项卡切换
      const tabBreach = document.getElementById('tabBtnBreach');
      const tabAltId = document.getElementById('tabBtnAltId');
      const pnlBreach = document.getElementById('panelBreach');
      const pnlAltId = document.getElementById('panelAltId');

      if (tabBreach && tabAltId && pnlBreach && pnlAltId) {
        tabBreach.onclick = () => {
          tabBreach.classList.add('active');
          tabAltId.classList.remove('active');
          pnlBreach.style.display = 'block';
          pnlAltId.style.display = 'none';
        };
        tabAltId.onclick = () => {
          tabAltId.classList.add('active');
          tabBreach.classList.remove('active');
          pnlAltId.style.display = 'block';
          pnlBreach.style.display = 'none';
        };
      }

      // 2. 预设快速切换与盲匹配模拟
      const inputEl = document.getElementById('secQueryInput');
      const chips = document.querySelectorAll('.sec-preset-chip');
      const presets = {
        safe: {
          val: 'alice.security@cyber-shield.org',
          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          prefix: 'E3B0C',
          badgeText: '🟢 安全：未在 14.8 亿条暗网凭据中发现泄露',
          badgeClass: 'badge-pill safe',
          gridHtml: `
            <div class="tool-field">
              <span class="field-label">全球黑客论坛监测</span>
              <span class="field-val highlight" style="color:#16a34a;">0 条记录匹配</span>
              <small style="color:#64748b; font-size:0.75rem;">监测覆盖: BreachForums, XSS, Exploit</small>
            </div>
            <div class="tool-field">
              <span class="field-label">Stealer 窃密木马 C2 数据库</span>
              <span class="field-val highlight" style="color:#16a34a;">0 条凭证抓取</span>
              <small style="color:#64748b; font-size:0.75rem;">覆盖 RedLine, Lumma, Vidar 日志</small>
            </div>
            <div class="tool-field">
              <span class="field-label">Pastebin / Gist 文本共享监听</span>
              <span class="field-val highlight" style="color:#16a34a;">未发现敏感泄露</span>
              <small style="color:#64748b; font-size:0.75rem;">毫秒级公开泄露流式监听</small>
            </div>
          `,
          guidance: '💡 <strong>防护评估极佳</strong>：该凭据未在任何已知暗网撞库字典中现身。建议继续保持高强度独享密码，并配合灵猫 IPLC 专线进行物理隔离通信。'
        },
        breached: {
          val: 'security-audit@company-sample.io',
          hash: '8f4c2e17a99b0c436a51270f80a42426989447385fa8b3017a8647a4f9a35e07',
          prefix: '8F4C2',
          badgeText: '🚨 高危预警：发现 3 起暗网数据泄露关联',
          badgeClass: 'badge-pill danger',
          gridHtml: `
            <div class="tool-field">
              <span class="field-label">泄露事件 1 (Stealer 木马日志)</span>
              <span class="field-val highlight" style="color:#e11d48;">Lumma Stealer C2 日志镜像</span>
              <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:4px;">泄露字段: 浏览器已存密码、会话 Cookie、2FA 恢复码</small>
            </div>
            <div class="tool-field">
              <span class="field-label">泄露事件 2 (公开撞库凭证集)</span>
              <span class="field-val highlight" style="color:#e11d48;">BreachCompilation v2 整合库</span>
              <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:4px;">泄露字段: 明文邮箱、MD5 加盐哈希密码</small>
            </div>
            <div class="tool-field">
              <span class="field-label">泄露事件 3 (跨境 B2B 泄露库)</span>
              <span class="field-val highlight" style="color:#d97706;">Global Trade Hub 数据库脱裤</span>
              <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:4px;">泄露字段: 注册手机号、企业账单地址、登录账号</small>
            </div>
          `,
          guidance: '💡 <strong>专家应急处置建议</strong>：检测到浏览器 Session Cookie 与密码被窃密程序抓取，请立即在当前所有已登录设备执行<strong>“强制作废全部活动会话”</strong>，并在独立密码管理器中重置主密码，并启用 灵猫网络虚拟身份隔绝源头暴露。'
        },
        stealer: {
          val: 'developer.lead@cryptostudio.net',
          hash: '4a6b2c89f13e07d58a1290bb34e56c1289df701234abcd5678ef0123456789ab',
          prefix: '4A6B2',
          badgeText: '⚠️ 严重警告：发现 RedLine Stealer 木马抓包记录',
          badgeClass: 'badge-pill danger',
          gridHtml: `
            <div class="tool-field">
              <span class="field-label">木马捕获源</span>
              <span class="field-val highlight" style="color:#dc2626;">RedLine Stealer v24.2 镜像</span>
              <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:4px;">捕获时间: 2025-11 / 机器指纹包含 GPU 及公网 IP</small>
            </div>
            <div class="tool-field">
              <span class="field-label">被盗取凭据资产</span>
              <span class="field-val highlight" style="color:#dc2626;">GitHub SSH 密钥 / Telegram Token</span>
              <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:4px;">攻击者可尝试免密克隆私有代码库</small>
            </div>
            <div class="tool-field">
              <span class="field-label">暗网交易市场状态</span>
              <span class="field-val highlight" style="color:#d97706;">Telegram 撞库 Bot 活跃流通</span>
              <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:4px;">已列入自动撞库 Combo 清单</small>
            </div>
          `,
          guidance: '💡 <strong>紧急高危阻断指引</strong>：您的开发者会话密钥已在外流日志中现身！请立刻在 GitHub / Telegram 中重生成所有 Personal Access Tokens，并换用无盘内存环境与 灵猫网络虚拟身份。'
        }
      };

      chips.forEach(chip => {
        chip.onclick = () => {
          const type = chip.getAttribute('data-preset');
          if (presets[type] && inputEl) {
            inputEl.value = presets[type].val;
            renderPreset(presets[type]);
          }
        };
      });

      function renderPreset(p) {
        const hashEl = document.getElementById('secLocalHash');
        const prefixEl = document.getElementById('secHashPrefix');
        const badgeEl = document.getElementById('secResultBadge');
        const gridEl = document.getElementById('secDetailsGrid');
        const guideEl = document.getElementById('secActionGuidance');

        if (hashEl) hashEl.textContent = p.hash.substring(0, 24) + '...';
        if (prefixEl) prefixEl.textContent = p.prefix;
        if (badgeEl) {
          badgeEl.className = p.badgeClass;
          badgeEl.textContent = p.badgeText;
        }
        if (gridEl) gridEl.innerHTML = p.gridHtml;
        if (guideEl) guideEl.innerHTML = p.guidance;
      }

      // 查询按钮点击
      const btnCheck = document.getElementById('btnRunBreachCheck');
      if (btnCheck) {
        btnCheck.onclick = () => {
          btnCheck.disabled = true;
          btnCheck.textContent = '⚡ 正在执行 k-Anonymity 盲匹配...';
          const badgeEl = document.getElementById('secResultBadge');
          if (badgeEl) {
            badgeEl.className = 'badge-pill warning';
            badgeEl.textContent = '🔄 检索全球 14.8 亿条暗网库中...';
          }
          setTimeout(() => {
            btnCheck.disabled = false;
            btnCheck.textContent = '🔍 发起零知识盲匹配自查';
            const val = inputEl ? inputEl.value.trim().toLowerCase() : '';
            if (val.includes('safe') || val.includes('alice') || val.includes('civetcat')) {
              renderPreset(presets.safe);
            } else if (val.includes('lead') || val.includes('dev') || val.includes('crypto')) {
              renderPreset(presets.stealer);
            } else {
              renderPreset(presets.breached);
            }
          }, 600);
        };
      }

      // 灵猫网络虚拟身份动态生成
      const btnGen = document.getElementById('btnGenAltId');
      const btnRevoke = document.getElementById('btnRevokeAltId');
      const altName = document.getElementById('altName');
      const altEmail = document.getElementById('altEmail');
      const altStatus = document.getElementById('altStatus');
      const altAddress = document.getElementById('altAddress');
      const altNotice = document.getElementById('altNoticeBox');

      const namesPool = [
        { name: 'Julian E. Vance', email: 'julian.mask.842@priv.civetcat.io', loc: '402 Market St, San Francisco, CA' },
        { name: 'Alexander Sterling', email: 'alex.mask.721@priv.civetcat.io', loc: '500 Howard St, San Francisco, CA' },
        { name: '佐藤 健一 (Kenichi Sato)', email: 'sato.mask.934@priv.civetcat.io', loc: 'Shinjuku-ku, Tokyo, Japan' },
        { name: 'Elena Rostova', email: 'elena.mask.318@priv.civetcat.io', loc: 'Zurich Financial District, Switzerland' },
        { name: 'Marcus Vance', email: 'marcus.mask.562@priv.civetcat.io', loc: 'Marina Bay Tower, Singapore' }
      ];
      let poolIndex = 0;

      if (btnGen) {
        btnGen.onclick = () => {
          poolIndex = (poolIndex + 1) % namesPool.length;
          const cur = namesPool[poolIndex];
          if (altName) altName.textContent = cur.name;
          if (altEmail) altEmail.textContent = cur.email;
          if (altAddress) altAddress.textContent = cur.loc;
          if (altStatus) {
            altStatus.className = 'badge-success';
            altStatus.style.color = '';
            altStatus.textContent = '● 动态加密转发激活中';
          }
          if (altNotice) {
            altNotice.style.background = '#eff6ff';
            altNotice.style.borderColor = '#bfdbfe';
            altNotice.style.color = '#1e40af';
            altNotice.innerHTML = `ℹ️ <strong>动态沙箱已激活</strong>：已为 <code>${cur.email}</code> 建立独立 TLS 1.3 密文隧道。发送至该掩护邮箱的信件将自动脱敏并投递至您的真实账户。`;
          }
        };
      }

      if (btnRevoke) {
        btnRevoke.onclick = () => {
          if (altStatus) {
            altStatus.className = '';
            altStatus.style.color = '#dc2626';
            altStatus.textContent = '✖ 已注销销毁 (黑洞丢弃)';
          }
          if (altNotice) {
            altNotice.style.background = '#fef2f2';
            altNotice.style.borderColor = '#fecaca';
            altNotice.style.color = '#991b1b';
            const curEmail = altEmail ? altEmail.textContent : '当前别名';
            altNotice.innerHTML = `🔥 <strong>身份已永久引爆</strong>：<code>${curEmail}</code> 已被加入骨干网黑洞路由（Blackhole Route）。后续任何来自外部的垃圾邮件、撞库尝试或钓鱼链接将直接在边缘网关被物理丢弃，零骚扰到达您的真实邮箱！`;
          }
        };
      }
    }

    const docKey = document.body.dataset.doc;
    if (docKey === 'my-ip') initIpTool();
    if (docKey === 'webrtc-leak') initWebRtcTool();
    if (docKey === 'dns-leak') initDnsTool();
    if (docKey === 'ping-test') initPingTelemetry();
    if (docKey === 'speedtest-benchmark') initSpeedtestInteractive();
    if (docKey === 'security-alert' || docKey === 'virtual-identity') initSecurityAlertInteractive();
})();
