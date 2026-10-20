/**
 * 灵猫网络 (Civet Cat) 官网交互脚本 (main.js)
 * 支持简体中文 / English 两种语言切换
 */

// --------------------------------------------------------------------------
// 1. 多语言翻译字典
// --------------------------------------------------------------------------
// 中文就是页面 HTML 里写的原文（切回中文时会还原原文），这里只需要放其他语言的译文。
// 修改中文文案后，记得同步修改下面对应的英文。
const i18nTranslations = {
  "en": {
    "docTitle": "Civet Cat - Enterprise Global High-Speed Private Network & Digital Privacy Protection",
    "docTitlePricing": "Civet Cat - Subscription Plans & Pricing · Full IPLC Backbone",
    "topBanner": "🐾 Civet Cat full-IPLC network upgrade · Native IPs for Netflix, ChatGPT & Gemini · Up to 1000 Mbps",
    "navHome": "Home",
    "navProducts": "Services",
    "navNetwork": "Global IPLC Lines",
    "navFeatures": "Security",
    "navPricing": "Pricing",
    "navReviews": "Reviews",
    "navAccount": "My Account",
    "headerCtaBtn": "Subscribe",
    "heroBadge": "Civet Cat enterprise-grade private network · IPLC flagship backbone",
    "heroTitle": "Global High-Speed <span class=\"text-gradient-purple\">Private Lines</span><br>Protecting Every <span class=\"text-gradient-purple\">Digital Connection</span>",
    "heroLead": "Built on a full IPLC private-line backbone with dedicated 1000 Mbps bandwidth and millisecond-level latency. A strict no-logs policy and military-grade end-to-end encryption, with native access to Netflix, ChatGPT and leading AI productivity tools.",
    "heroCta": "Start Your Private Line →",
    "platformsLabel": "Native apps for:",
    "platformRouter": "Router",
    "trustStats": "Trusted by developers and enterprise teams worldwide — over <strong>100 TB+</strong> of traffic handled daily, with <strong>99.99%</strong> network availability",
    "bentoTitle": "All-in-One Network & Digital Security Suite",
    "bentoSubtitle": "No more complicated setups or unstable connections. One app gives you fast global connectivity and complete privacy protection.",
    "card1Title": "Encrypted Global Private Lines",
    "card1Desc": "Full IPLC lines with millisecond latency, native IPs and advanced end-to-end encryption — no more packet loss or public-network surveillance.",
    "card2Title": "Threat & Phishing Defense",
    "card2Desc": "A built-in proactive security engine automatically blocks phishing sites and malicious scripts to keep your funds and credentials safe.",
    "card3Title": "Protection Across All Devices",
    "card3Desc": "Works on computers, phones, tablets and home network gateways. One account roams smoothly across all your devices.",
    "card4Title": "Digital Identity & Privacy Shield",
    "card4Desc": "Virtual identity masking and real-time dark-web leak monitoring stop data breaches and harassment at the source.",
    "ctaBannerBtn": "Activate on the Official Site →"
  }
};

// --------------------------------------------------------------------------
// 2. 核心交互逻辑与多语言切换驱动
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 4. 套餐方案分类筛选 Tab 交互逻辑
  // --------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.pricing-tab-btn');
  const pricingCards = document.querySelectorAll('.pricing-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      pricingCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter || (filter === 'onetime' && (cat === 'onetime' || cat === 'custom'))) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  const langSwitcher = document.getElementById('langSwitcher');
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langItems = document.querySelectorAll('.lang-item');
  const mobileLangBtns = document.querySelectorAll('.mobile-lang-btn');

  // 1. 语言下拉菜单点击展开与收起
  if (langBtn && langSwitcher) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = langSwitcher.classList.contains('open');
      if (isOpen) {
        langSwitcher.classList.remove('open');
        langBtn.setAttribute('aria-expanded', 'false');
      } else {
        langSwitcher.classList.add('open');
        langBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // 点击页面任意外部区域自动关闭下拉面板
    document.addEventListener('click', (e) => {
      if (!langSwitcher.contains(e.target)) {
        langSwitcher.classList.remove('open');
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. 语言切换核心执行函数
  // 先记下页面 HTML 里的中文原文，切回中文时直接还原
  const translatableElements = document.querySelectorAll('[data-i18n]');
  const originalHtml = new Map();
  translatableElements.forEach((el) => originalHtml.set(el, el.innerHTML));

  function applyLanguage(langCode) {
    const isChinese = langCode === 'zh-CN';
    if (!isChinese && !i18nTranslations[langCode]) {
      console.warn('Language not found:', langCode);
      return;
    }

    const dict = isChinese ? {} : i18nTranslations[langCode];
    document.documentElement.lang = langCode;

    // 批量替换带有 data-i18n 属性的所有 DOM 节点内容（含 <title>）
    translatableElements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (isChinese) {
        el.innerHTML = originalHtml.get(el);
      } else if (dict[key]) {
        // 如果包含 HTML 标签则使用 innerHTML，否则使用 textContent
        if (dict[key].includes('<') && dict[key].includes('>')) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // 同步高亮选中状态 (桌面端)
    langItems.forEach((item) => {
      if (item.getAttribute('data-lang') === langCode) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 同步高亮选中状态 (移动端)
    mobileLangBtns.forEach((btn) => {
      if (btn.getAttribute('data-lang') === langCode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 保存当前选中的语言至浏览器本地持久缓存
    try {
      localStorage.setItem('lingmao_preferred_lang', langCode);
    } catch (e) {}

    // 关闭下拉面板
    if (langSwitcher) {
      langSwitcher.classList.remove('open');
      if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
    }
  }

  // 3. 绑定语言选项点击事件 (桌面下拉列表)
  langItems.forEach((item) => {
    item.addEventListener('click', () => {
      const lang = item.getAttribute('data-lang');
      applyLanguage(lang);
    });
  });

  // 4. 绑定移动端抽屉语言按钮点击事件
  mobileLangBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      applyLanguage(lang);
    });
  });

  // 5. 初始化读取并激活语言
  let savedLang = 'zh-CN';
  try {
    savedLang = localStorage.getItem('lingmao_preferred_lang') || 'zh-CN';
  } catch (e) {}
  // 中文是页面默认语言，无需处理；以前选过、现在已删除的语言（如德语）也会自动回到中文
  if (i18nTranslations[savedLang]) {
    applyLanguage(savedLang);
  }

  // --------------------------------------------------------------------------
  // 3. 移动端抽屉菜单交互控制 (Mobile Drawer)
  // --------------------------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');

  function openDrawer() {
    if (mobileDrawer && drawerOverlay) {
      mobileDrawer.classList.add('open');
      drawerOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (mobileDrawer && drawerOverlay) {
      mobileDrawer.classList.remove('open');
      drawerOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // 点击抽屉内任意跳转链接后自动关闭抽屉
  const drawerLinks = document.querySelectorAll('.mobile-nav-link');
  drawerLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  // --------------------------------------------------------------------------
  // 5. 核心服务下拉菜单交互 (Support Hover & Click Toggle)
  // --------------------------------------------------------------------------
  const navDropdownToggle = document.getElementById('navDropdownToggle');
  const hasDropdown = document.querySelector('.has-dropdown');

  if (navDropdownToggle && hasDropdown) {
    navDropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = hasDropdown.classList.toggle('active');
      navDropdownToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!hasDropdown.contains(e.target)) {
        hasDropdown.classList.remove('active');
        navDropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });

    const dropdownCards = hasDropdown.querySelectorAll('.dropdown-card');
    dropdownCards.forEach((card) => {
      card.addEventListener('click', () => {
        hasDropdown.classList.remove('active');
        navDropdownToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. 顶部活动公告条关闭
  // --------------------------------------------------------------------------
  const closeTopBanner = document.getElementById('closeTopBanner');
  const topBanner = document.getElementById('topBanner');
  if (closeTopBanner && topBanner) {
    closeTopBanner.addEventListener('click', () => {
      topBanner.style.transition = 'opacity 0.25s ease, margin-top 0.25s ease';
      topBanner.style.opacity = '0';
      topBanner.style.marginTop = '-38px';
      setTimeout(() => {
        topBanner.style.display = 'none';
      }, 250);
    });
  }

  // --------------------------------------------------------------------------
  // 7. 右下角优雅 SaaS 活动弹窗与快捷胶囊交互 (保证每次刷新均弹出，直到用户主动关闭)
  // --------------------------------------------------------------------------
  const saasToast = document.getElementById('activityPopup') || document.getElementById('saasPromoToast');
  const closePopupBtn = document.getElementById('closePopupBtn');
  const btnDismiss = document.getElementById('btnDismiss');
  const btnHideToday = document.getElementById('btnHideToday');
  const activityMinBadge = document.getElementById('activityMinBadge');
  const btnCopyCoupon = document.getElementById('btnCopyCoupon');
  const couponCodeText = document.getElementById('couponCodeText');

  // 1. 清除历史屏蔽标志，确保每次刷新进入主页都必然呈现
  try {
    localStorage.removeItem('lingmao_hide_toast_date');
  } catch (e) {}

  // 2. 页面加载后平滑弹出并始终稳固停驻于最右下角
  setTimeout(() => {
    // 手机屏幕太窄，大卡片会盖住首屏标题：只显示右下角迷你胶囊，用户点开才展开
    if (window.matchMedia('(max-width: 640px)').matches) {
      if (saasToast) saasToast.classList.add('hidden');
      if (activityMinBadge) activityMinBadge.classList.add('visible');
      return;
    }
    if (saasToast) {
      saasToast.classList.remove('hidden');
      saasToast.classList.remove('closed-by-user');
      saasToast.style.transform = '';
    }
    if (activityMinBadge) {
      activityMinBadge.classList.remove('visible');
    }
  }, 350);

  // 3. 用户主动选择关闭（点击右上角✕、关闭按钮或不再提示）
  let pillTransitionTimer = null;
  function hideToast(showPill = true) {
    if (saasToast) {
      saasToast.classList.add('hidden');
      saasToast.classList.add('closed-by-user');
    }
    if (pillTransitionTimer) {
      clearTimeout(pillTransitionTimer);
      pillTransitionTimer = null;
    }
    if (showPill && activityMinBadge) {
      // 优雅错开：等待大卡片平滑淡出（约180ms）后，迷你胶囊平滑浮现，彻底消除空间重叠与卡顿冲突
      pillTransitionTimer = setTimeout(() => {
        activityMinBadge.classList.add('visible');
      }, 180);
    }
  }

  // 4. 点击右下角最小化胶囊重新唤起弹窗（恢复到最右下角）
  function showToast() {
    if (pillTransitionTimer) {
      clearTimeout(pillTransitionTimer);
      pillTransitionTimer = null;
    }
    if (activityMinBadge) {
      activityMinBadge.classList.remove('visible');
    }
    // 胶囊开始隐退后，大卡片丝滑回弹展开
    setTimeout(() => {
      if (saasToast) {
        saasToast.classList.remove('hidden');
        saasToast.classList.remove('closed-by-user');
        saasToast.style.transform = '';
      }
    }, 120);
  }

  if (closePopupBtn) closePopupBtn.addEventListener('click', () => hideToast(true));
  if (btnDismiss) btnDismiss.addEventListener('click', () => hideToast(true));
  if (btnHideToday) btnHideToday.addEventListener('click', () => hideToast(true));
  if (activityMinBadge) activityMinBadge.addEventListener('click', showToast);

  // 复制优惠码
  if (btnCopyCoupon && couponCodeText) {
    btnCopyCoupon.addEventListener('click', async () => {
      const code = couponCodeText.textContent.trim();
      try {
        await navigator.clipboard.writeText(code);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      const origText = btnCopyCoupon.textContent;
      btnCopyCoupon.textContent = '已复制！';
      btnCopyCoupon.style.background = '#10b981';
      btnCopyCoupon.style.color = '#ffffff';
      setTimeout(() => {
        btnCopyCoupon.textContent = origText;
        btnCopyCoupon.style.background = '';
        btnCopyCoupon.style.color = '';
      }, 2000);
    });
  }

  // --------------------------------------------------------------------------
  // 8. 3D 交互全球拓扑与实时遥测动态
  // --------------------------------------------------------------------------
  const globeContainer = document.getElementById('globeCardContainer');
  const globeCard = document.getElementById('interactiveGlobeCard');
  const globeGlare = document.getElementById('globeGlare');
  const globeBw = document.getElementById('globeBw');
  const globePing = document.getElementById('globePing');

  if (globeBw || globePing) {
    setInterval(() => {
      if (globeBw) {
        const baseBw = 428.6;
        const deltaBw = (Math.random() * 8 - 4).toFixed(1);
        globeBw.textContent = (baseBw + parseFloat(deltaBw)).toFixed(1);
      }
      if (globePing) {
        const basePing = 24.2;
        const deltaPing = (Math.random() * 1.6 - 0.8).toFixed(1);
        globePing.textContent = (basePing + parseFloat(deltaPing)).toFixed(1);
      }
    }, 2400);
  }

  if (globeContainer && globeCard) {
    globeContainer.addEventListener('mousemove', (e) => {
      const rect = globeContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      globeCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
      if (globeGlare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        globeGlare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`;
      }
    });

    globeContainer.addEventListener('mouseleave', () => {
      globeCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      globeCard.style.transition = 'transform 0.5s ease';
      if (globeGlare) {
        globeGlare.style.background = '';
      }
    });

    globeContainer.addEventListener('mouseenter', () => {
      globeCard.style.transition = 'none';
    });
  }

  // --------------------------------------------------------------------------
  // 9. 页面跳转平滑自然过渡动效 (Page Transition)
  // --------------------------------------------------------------------------
  document.body.classList.add('page-enter');
  setTimeout(() => {
    document.body.classList.remove('page-enter');
  }, 350);

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-exit');
    document.body.classList.add('page-enter');
    setTimeout(() => {
      document.body.classList.remove('page-enter');
    }, 350);
  });

  const transitionLinks = document.querySelectorAll('.page-transition-link');
  transitionLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetUrl = link.getAttribute('href');
      if (!targetUrl || targetUrl.startsWith('http') || targetUrl.includes('//')) {
        return;
      }
      if (targetUrl.startsWith('#')) {
        return;
      }

      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const targetPath = targetUrl.split('#')[0];

      if (currentPath === targetPath && !targetUrl.includes('#')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 200);
    });
  });

  // --------------------------------------------------------------------------
  // 10. FAQ 常见问题手风琴折叠展开交互
  // --------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      if (trigger) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const isCurrentlyActive = item.classList.contains('active');

          // 收起所有其他 FAQ 项
          faqItems.forEach((other) => {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-trigger');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          });

          // 如果之前未展开，则展开当前点击项；如果已展开，则收起
          if (!isCurrentlyActive) {
            item.classList.add('active');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 11. 页脚返回顶部平滑滚动交互
  // --------------------------------------------------------------------------
  const backToTopBtns = document.querySelectorAll('#btnBackToTop, .btn-back-to-top');
  backToTopBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

});

