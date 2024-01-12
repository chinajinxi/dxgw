/* =========================================================
 * 应用外壳：导航、路由、全局搜索、抽屉 / 弹窗 / Toast
 * ========================================================= */
const UI = (function () {
  const drawer = document.getElementById("drawer");
  const drawerMask = document.getElementById("drawerMask");
  const drawerEyebrow = document.getElementById("drawerEyebrow");
  const drawerTitle = document.getElementById("drawerTitle");
  const drawerSub = document.getElementById("drawerSub");
  const drawerBody = document.getElementById("drawerBody");
  const drawerFoot = document.getElementById("drawerFoot");
  const modal = document.getElementById("modal");
  const modalMask = document.getElementById("modalMask");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalFoot = document.getElementById("modalFoot");
  const toastStack = document.getElementById("toastStack");

  function openDrawer(o) {
    drawerEyebrow.textContent = o.eyebrow || "";
    drawerTitle.textContent = o.title || "";
    drawerSub.textContent = o.sub || "";
    drawerSub.style.display = o.sub ? "" : "none";
    drawerBody.innerHTML = o.body || "";
    drawerFoot.innerHTML = o.footer || "";
    drawer.classList.add("open");
    drawerMask.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    if (o.onMount) o.onMount(drawer);
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawerMask.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }
  function openModal(o) {
    modalTitle.textContent = o.title || "";
    modalBody.innerHTML = o.body || "";
    modalFoot.innerHTML = o.footer || "";
    modal.classList.add("open");
    modalMask.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    if (o.onMount) o.onMount(modal);
  }
  function closeModal() {
    modal.classList.remove("open");
    modalMask.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
  function toast(msg, type) {
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.textContent = msg;
    toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 260);
    }, 3000);
  }

  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  drawerMask.addEventListener("click", closeDrawer);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  modalMask.addEventListener("click", closeModal);

  return {
    drawer: openDrawer,
    closeDrawer: closeDrawer,
    modal: openModal,
    closeModal: closeModal,
    toast: toast
  };
})();

const App = (function () {
  const NAV = [
    {
      items: [
        { key: "home", label: "综合驾驶舱" },
        { key: "network", label: "管线运行监控" },
        { key: "pressure", label: "压力工况监视" },
        { key: "environment", label: "环境参数感知" },
        { key: "noise", label: "噪声异响分析" },
        { key: "report", label: "安全运行报告" },
        { key: "leak", label: "漏损预警" },
        { key: "info", label: "台账信息维护" }
      ]
    },
    {
      group: "运维配置",
      items: [
        { key: "pressureAnalysis", label: "压力特性分析" },
        { key: "flowAnalysis", label: "流量趋势分析" },
        { key: "hammer", label: "水锤工况分析" },
        { key: "alertRules", label: "告警策略设置" },
        { key: "org", label: "组织机构维护" }
      ]
    }
  ];
  const EXTRA_SEARCH = [
    { key: "info", label: "设备台账", note: "设备信息与远程管理" },
    { key: "leak", label: "漏点定位", note: "漏水预警与定位" },
    { key: "report", label: "安全月报", note: "报告预览与导出" },
    { key: "flowAnalysis", label: "日流量趋势", note: "近 30 天流量分析" },
    { key: "pressureAnalysis", label: "压力波形分析", note: "毫秒级波形" },
    { key: "home", label: "告警站点 TOP10", note: "首页排行" }
  ];

  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const searchInput = document.getElementById("globalSearch");
  const searchPop = document.getElementById("searchPop");
  const searchWrap = document.getElementById("globalSearchWrap");
  const adminBtn = document.getElementById("adminBtn");
  const adminMenu = document.getElementById("adminMenu");

  const flat = NAV.reduce((a, g) => a.concat(g.items), []);
  const labelOf = key => (flat.find(x => x.key === key) || { label: key }).label;

  function renderSidebar(active) {
    sidebar.innerHTML = NAV.map(g =>
      (g.group ? '<div class="nav-group">' + g.group + "</div>" : "") +
      g.items.map(it =>
        '<a class="nav-item' + (it.key === active ? " active" : "") + '" href="#/' + it.key + '" data-nav="' + it.key + '">' + it.label + "</a>"
      ).join("")
    ).join("") +
      '<div class="sidebar-foot">平台版本 v1.0.0<br>交互原型 · 演示数据</div>';
  }

  function keyFromHash() {
    const k = (location.hash || "").replace(/^#\/?/, "").trim();
    return k || "home";
  }

  function render() {
    let key = keyFromHash();
    if (!Pages[key]) key = "home";
    renderSidebar(key);
    const page = Pages[key];
    main.innerHTML = '<section class="page" data-page="' + key + '">' + page.render() + "</section>";
    requestAnimationFrame(() => {
      try {
        page.mount(main);
      } catch (err) {
        console.error("页面初始化失败:", err);
      }
    });
    document.title = labelOf(key) + " · 智慧管网平台";
    window.scrollTo({ top: 0 });
    UI.closeDrawer();
    UI.closeModal();
  }

  function refresh() {
    render();
  }

  /* ---------- 全局搜索 ---------- */
  const searchItems = flat.concat(EXTRA_SEARCH);
  function renderSearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      searchPop.innerHTML = '<div class="sp-label">快捷跳转</div>' +
        searchItems.slice(0, 6).map(it =>
          '<div class="search-item" data-key="' + it.key + '"><span>' + it.label + '</span><em>' + (it.note || labelOf(it.key)) + "</em></div>"
        ).join("");
    } else {
      const matched = searchItems.filter(it => (it.label + (it.note || "")).toLowerCase().indexOf(q) >= 0);
      searchPop.innerHTML = matched.length
        ? '<div class="sp-label">搜索结果</div>' + matched.slice(0, 8).map(it =>
          '<div class="search-item" data-key="' + it.key + '"><span>' + it.label + '</span><em>' + (it.note || "页面") + "</em></div>"
        ).join("")
        : '<div class="search-empty">未找到相关功能，试试「告警」「压力」</div>';
    }
    searchPop.hidden = false;
    searchPop.querySelectorAll("[data-key]").forEach(item => {
      item.addEventListener("click", () => {
        location.hash = "#/" + item.getAttribute("data-key");
        hideSearch();
      });
    });
  }
  function hideSearch() {
    searchPop.hidden = true;
    searchInput.value = "";
  }
  searchInput.addEventListener("focus", renderSearch);
  searchInput.addEventListener("input", renderSearch);
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const first = searchPop.querySelector("[data-key]");
      if (first) { location.hash = "#/" + first.getAttribute("data-key"); hideSearch(); }
    } else if (e.key === "Escape") {
      hideSearch();
    }
  });

  adminBtn.addEventListener("click", e => {
    e.stopPropagation();
    adminMenu.hidden = !adminMenu.hidden;
    searchPop.hidden = true;
  });
  adminMenu.querySelectorAll("[data-admin]").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.getAttribute("data-admin");
      adminMenu.hidden = true;
      if (act === "logout") UI.toast("已退出登录（原型演示）", "warn");
      else UI.toast("该功能为演示占位：" + btn.textContent, "warn");
    });
  });

  document.addEventListener("click", e => {
    if (!searchWrap.contains(e.target)) searchPop.hidden = true;
    if (!adminMenu.contains(e.target) && e.target !== adminBtn) adminMenu.hidden = true;
  });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== searchInput && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === "Escape") {
      UI.closeDrawer();
      UI.closeModal();
      searchPop.hidden = true;
    }
  });

  window.addEventListener("hashchange", render);
  if (!location.hash) history.replaceState(null, "", "#/home");
  render();

  return { refresh: refresh, go: k => { location.hash = "#/" + k; } };
})();
