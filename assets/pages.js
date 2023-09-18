/* =========================================================
 * 页面模块（14 个业务页面）
 * ========================================================= */
const Pages = {};

/* ---------------- 通用 UI 片段 ---------------- */
const STATUS_CLASS = {
  "在线": "ok", "正常": "ok", "已生成": "ok", "已确认": "ok", "已完成": "ok", "已完结": "ok", "启用": "ok",
  "告警": "warn", "预警": "warn", "待复核": "warn", "待确认": "warn", "观察": "warn", "维护中": "warn",
  "处置中": "warn", "偏高": "warn", "异常": "warn", "处理中": "warn",
  "已处置": "info", "已排除": "info",
  "离线": "off", "已关闭": "off", "停用": "off",
  "超标": "danger", "失败重发": "danger", "—": "clean"
};

function statusHTML(s) {
  const cls = STATUS_CLASS[s] || "off";
  return '<span class="status ' + cls + '"><span class="dot"></span>' + s + "</span>";
}
function levelHTML(l) {
  const cls = l === "紧急" ? "lv-critical" : (l === "严重" || l === "重要") ? "lv-major" : "lv-minor";
  return '<span class="level ' + cls + '"><i></i>' + l + "</span>";
}
function statCard(o) {
  return '<div class="stat-card"' + (o.attrs || "") + ">" +
    '<div class="stat-label">' + o.label + "</div>" +
    '<div class="stat-value"><b' + (o.valueId ? ' id="' + o.valueId + '"' : "") + ">" + o.value + "</b>" +
    (o.unit ? "<span>" + o.unit + "</span>" : "") + "</div>" +
    '<div class="stat-note"' + (o.noteId ? ' id="' + o.noteId + '"' : "") + ">" + (o.note || "") + "</div>" +
    "</div>";
}
function panel(o) {
  return '<section class="panel ' + (o.cls || "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + ">" +
    '<div class="panel-head">' +
    '<div class="panel-title">' + o.title + (o.sub ? '<span class="panel-sub">' + o.sub + "</span>" : "") + "</div>" +
    (o.actions ? '<div class="panel-actions">' + o.actions + "</div>" : "") +
    "</div>" +
    '<div class="panel-body ' + (o.bodyCls || "") + '">' + o.body + "</div>" +
    (o.foot ? '<div class="panel-foot">' + o.foot + "</div>" : "") +
    "</section>";
}
function dataTable(cols, rows, opts) {
  opts = opts || {};
  return '<div class="table-wrap"><table class="data-table ' + (opts.cls || "") + '"><thead><tr>' +
    cols.map(c => "<th>" + c + "</th>").join("") +
    "</tr></thead><tbody>" +
    rows.map(r => {
      const attrs = typeof r === "object" && !Array.isArray(r) ? (r.attrs || "") : "";
      const cells = Array.isArray(r) ? r : r.cells;
      return "<tr " + attrs + ">" + cells.map(c => "<td>" + c + "</td>").join("") + "</tr>";
    }).join("") +
    "</tbody></table></div>";
}
function legend(items) {
  return '<div class="legend">' + items.map(it =>
    '<span class="lg"><i style="background:' + it.color + '"></i>' + it.name + "</span>"
  ).join("") + "</div>";
}
function tipHTML(title, rows) {
  return '<div class="t-h">' + title + "</div>" +
    rows.map(r => '<div class="t-row"><i style="background:' + r.color + '"></i><span>' + r.name + "</span><b>" + r.value + "</b></div>").join("");
}

/* ---------------- 地图 / 拓扑 SVG ---------------- */
function mapDefs() {
  return '<defs>' +
    '<radialGradient id="mapBg" cx="50%" cy="38%" r="72%">' +
    '<stop offset="0%" stop-color="#12364b" stop-opacity=".55"/>' +
    '<stop offset="100%" stop-color="#08151f" stop-opacity=".05"/>' +
    "</radialGradient>" +
    '<filter id="nodeGlow" x="-80%" y="-80%" width="260%" height="260%">' +
    '<feGaussianBlur stdDeviation="3" result="blur"/>' +
    '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
    "</filter>" +
    "</defs>";
}
function mapBackdrop() {
  return '<rect width="900" height="380" fill="url(#mapBg)"/>' +
    '<g>' +
    '<path class="map-bg-fill" d="M52 72 L242 40 L338 108 L286 210 L118 206 L40 138 Z"/>' +
    '<path class="map-bg-fill" d="M366 46 L584 62 L664 138 L600 224 L432 206 L356 132 Z"/>' +
    '<path class="map-bg-fill" d="M690 82 L846 108 L864 226 L760 282 L664 230 L686 152 Z"/>' +
    '<path class="map-bg-fill" d="M96 258 L298 244 L362 330 L232 360 L92 332 Z"/>' +
    '<path class="map-bg-line" d="M-20 150 C 120 104, 250 208, 400 168 S 640 92, 920 158"/>' +
    '<path class="map-bg-line" d="M-20 268 C 140 218, 270 300, 430 262 S 700 208, 920 274"/>' +
    '<path class="map-bg-line" d="M120 -10 C 168 96, 286 132, 300 240 S 330 330, 292 390"/>' +
    '<path class="map-bg-line" d="M640 -10 C 600 92, 660 168, 624 258 S 606 334, 640 390"/>' +
    '<circle cx="748" cy="298" r="2" fill="rgba(120,180,210,.28)"/>' +
    '<circle cx="704" cy="316" r="1.5" fill="rgba(120,180,210,.2)"/>' +
    '<circle cx="812" cy="272" r="1.5" fill="rgba(120,180,210,.2)"/>' +
    "</g>";
}
function nodeSVG(n) {
  const pulse = n.color === COLORS.red ? '<circle class="pulse-ring" cx="' + n.x + '" cy="' + n.y + '" r="9" fill="none" stroke="' + n.color + '" stroke-width="1.2"/>' : "";
  return '<g class="map-node" data-node="' + n.id + '" tabindex="0">' +
    '<circle class="node-halo" cx="' + n.x + '" cy="' + n.y + '" r="17" fill="' + n.color + '"/>' +
    pulse +
    '<circle class="node-core" cx="' + n.x + '" cy="' + n.y + '" r="6.5" fill="' + n.color + '" filter="url(#nodeGlow)"/>' +
    '<text class="node-label" x="' + n.x + '" y="' + (n.y - 15) + '" text-anchor="middle">' + (n.label || n.id) + "</text>" +
    "</g>";
}
function mapSVG(nodes, extra) {
  return '<svg viewBox="0 0 900 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    mapDefs() + mapBackdrop() + (extra || "") +
    nodes.map(nodeSVG).join("") +
    "</svg>";
}
function bindMapNodes(root, resolve, onClick) {
  root.querySelectorAll(".map-node").forEach(g => {
    const id = g.getAttribute("data-node");
    g.addEventListener("mousemove", ev => {
      const html = resolve(id);
      if (html) Charts.showTip(html, ev.clientX, ev.clientY);
    });
    g.addEventListener("mouseleave", Charts.hideTip);
    g.addEventListener("click", () => onClick && onClick(id));
  });
}

/* ---------------- 通用抽屉 ---------------- */
function openAlertDrawer(id) {
  const a = Data.alerts.find(x => x.id === id);
  if (!a) return;
  const isDone = a.status === "已处置";
  const body =
    '<div class="alert-summary">' +
    '<div class="ico"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2 15 14H1L8 2Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 6v4M8 12v.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></div>' +
    '<div class="txt"><b>' + a.type + "</b> · " + levelHTML(a.level) + " 等级，当前状态 " + statusHTML(a.status) + "</div>" +
    "</div>" +
    '<div class="section-label">基础信息</div>' +
    '<div class="kv-grid">' +
    '<div class="kv"><span class="k">告警编号</span><span class="v">' + a.id + "</span></div>" +
    '<div class="kv"><span class="k">发生时间</span><span class="v">' + a.day + " " + a.time + "</span></div>" +
    '<div class="kv"><span class="k">告警站点</span><span class="v">' + a.site + "</span></div>" +
    '<div class="kv"><span class="k">监测设备</span><span class="v">' + a.device + "</span></div>" +
    '<div class="kv"><span class="k">实时读数</span><span class="v">' + a.value + "</span></div>" +
    '<div class="kv"><span class="k">处置人</span><span class="v">' + a.owner + "</span></div>" +
    "</div>" +
    '<div class="section-label">告警描述</div>' +
    '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">' + a.desc + "</p>" +
    '<div class="section-label">处置进度</div>' +
    '<div class="timeline">' +
    a.timeline.map(t => '<div class="tl-item"><div class="tl-t">' + t.t + '</div><div class="tl-c">' + t.c + "</div></div>").join("") +
    "</div>";
  const footer = isDone
    ? '<button class="btn" data-dr="close">关闭</button>'
    : '<button class="btn" data-dr="close">稍后处理</button><button class="btn primary" data-dr="ack">确认处置</button>';
  UI.drawer({
    eyebrow: "告警详情 · " + a.id,
    title: a.type,
    sub: a.site + " · " + a.day + " " + a.time,
    body: body,
    footer: footer,
    onMount(el) {
      el.querySelectorAll("[data-dr]").forEach(btn => {
        btn.addEventListener("click", () => {
          const act = btn.getAttribute("data-dr");
          if (act === "ack") {
            a.status = "已处置";
            a.timeline.push({ t: "09:36:20", c: "运维人员确认处置完成，告警闭环" });
            UI.toast("告警 " + a.id + " 已确认处置", "ok");
            UI.closeDrawer();
            refreshPage();
          } else {
            UI.closeDrawer();
          }
        });
      });
    }
  });
}

function openDeviceDrawer(d) {
  const body =
    '<div class="kv-grid">' +
    '<div class="kv"><span class="k">设备编号</span><span class="v">' + d.id + "</span></div>" +
    '<div class="kv"><span class="k">设备类型</span><span class="v">' + (d.type || "监测终端") + "</span></div>" +
    '<div class="kv"><span class="k">所属管网</span><span class="v">' + (d.zone || d.net || "—") + "</span></div>" +
    '<div class="kv"><span class="k">当前状态</span><span class="v">' + statusHTML(d.status || "在线") + "</span></div>" +
    '<div class="kv"><span class="k">实时读数</span><span class="v">' + (d.value || "—") + "</span></div>" +
    '<div class="kv"><span class="k">最近上报</span><span class="v">09:24:00</span></div>' +
    "</div>" +
    '<div class="section-label">近 24 小时在线情况</div>' +
    '<div class="timeline">' +
    '<div class="tl-item"><div class="tl-t">09:24:00</div><div class="tl-c">心跳正常，数据上报成功</div></div>' +
    '<div class="tl-item"><div class="tl-t">08:24:00</div><div class="tl-c">心跳正常，信号强度 -72 dBm</div></div>' +
    '<div class="tl-item"><div class="tl-t">07:24:00</div><div class="tl-c">心跳正常，电池电压 3.62 V</div></div>' +
    "</div>" +
    '<div class="section-label">关联告警</div>' +
    '<div class="check-list">' +
    (Data.alerts.slice(0, 2).map((a, i) => '<button class="check-item" data-alert="' + a.id + '">' +
      '<span class="ci-badge">' + (i + 1) + "</span><span>" + a.type + " · " + a.site + "</span>" +
      '<span class="ci-time">' + a.time + "</span></button>").join("")) +
    "</div>";
  UI.drawer({
    eyebrow: "设备详情",
    title: d.name || d.id,
    sub: (d.type || "监测终端") + " · " + (d.zone || d.net || ""),
    body: body,
    footer: '<button class="btn" data-dr="close">关闭</button><button class="btn primary" data-dr="goto">前往信息管理</button>',
    onMount(el) {
      el.querySelectorAll("[data-alert]").forEach(btn => {
        btn.addEventListener("click", () => openAlertDrawer(btn.getAttribute("data-alert")));
      });
      el.querySelectorAll("[data-dr]").forEach(btn => {
        btn.addEventListener("click", () => {
          if (btn.getAttribute("data-dr") === "goto") {
            UI.closeDrawer();
            location.hash = "#/info";
          } else UI.closeDrawer();
        });
      });
    }
  });
}
function refreshPage() {
  if (window.App && App.refresh) App.refresh();
}

/* =========================================================
 * 系统首页
 * ========================================================= */
Pages.home = {
  render() {
    const alertRows = Data.alerts.slice(0, 5).map(a => ({
      attrs: 'class="clickable" data-alert-id="' + a.id + '"',
      cells: [
        '<span class="mono">' + a.time + "</span>",
        a.site,
        '<span class="muted">' + a.type + "</span>",
        levelHTML(a.level)
      ]
    }));
    return '<div class="stat-grid">' +
      statCard({ label: "工单记录", value: "1,286", note: '较上月 <b class="up">+8.2%</b>' }) +
      statCard({ label: "实时告警", value: "47", note: '较昨日 <b class="down">+6.1%</b>' }) +
      statCard({ label: "告警站点", value: "12", note: '较昨日 <b class="up">-2.4%</b>' }) +
      statCard({ label: "在线设备", value: "2,856", note: '在线率 <b class="plain">97.3%</b>' }) +
      "</div>" +
      '<div class="grid split-a">' +
      panel({
        title: "告警数量趋势",
        body: '<div class="chart-host" id="homeTrendChart" style="height:252px"></div>'
      }) +
      panel({
        title: "地图叠加 · 实时监测",
        actions: legend([{ color: COLORS.green, name: "正常" }, { color: COLORS.amber, name: "预警" }, { color: COLORS.red, name: "告警" }]),
        body: '<div class="map-canvas" style="height:252px">' + mapSVG(Data.homeMapNodes) + "</div>"
      }) +
      "</div>" +
      '<div class="grid split-b">' +
      panel({
        title: "告警站点 TOP10",
        body: '<div class="chart-host" id="homeZoneChart" style="height:230px"></div>'
      }) +
      panel({
        title: "实时告警记录",
        actions: '<button class="text-link" data-goto="alerts">查看全部</button>',
        body: dataTable(["时间", "站点", "类型", "等级"], alertRows)
      }) +
      "</div>";
  },
  mount(root) {
    Charts.line(root.querySelector("#homeTrendChart"), {
      labels: Data.homeTrend.labels,
      series: [{ name: "告警数量", color: COLORS.cyan, data: Data.homeTrend.values, area: true, format: v => v + " 起" }],
      yMin: 0, yMax: 200, yTicks: 8, height: 252, xTickEvery: 5, endDot: true,
      tip: i => tipHTML(Data.homeTrend.labels[i], [{ name: "告警数量", color: COLORS.cyan, value: Data.homeTrend.values[i] + " 起" }])
    });
    Charts.bars(root.querySelector("#homeZoneChart"), {
      labels: Data.zonesTop.map(z => z.name),
      values: Data.zonesTop.map(z => z.value),
      colors: [COLORS.red, COLORS.amber, "#f5c542", COLORS.cyan, COLORS.cyan, COLORS.cyan],
      yMax: 42, yTicks: 8, height: 230, name: "告警数量", format: v => v + " 起", barWidth: 34,
      onClick: i => {
        UI.toast("已筛选 " + Data.zonesTop[i].name + " 告警站点", "ok");
        location.hash = "#/alerts";
      }
    });
    bindMapNodes(root, id => {
      const n = Data.homeMapNodes.find(x => x.id === id);
      return tipHTML(n.id + " · " + n.status, [
        { name: "实时读数", color: n.color, value: n.value },
        { name: "所属区域", color: "#5f788a", value: "A区 给水干管" }
      ]);
    }, id => {
      const n = Data.homeMapNodes.find(x => x.id === id);
      if (n.alertId) openAlertDrawer(n.alertId);
      else openDeviceDrawer({ id: n.id, type: "压力监测点", zone: "A区 给水干管", value: n.value, status: n.status });
    });
    root.querySelectorAll("[data-alert-id]").forEach(row => {
      row.addEventListener("click", () => openAlertDrawer(row.getAttribute("data-alert-id")));
    });
    root.querySelectorAll("[data-goto]").forEach(btn => {
      btn.addEventListener("click", () => { location.hash = "#/" + btn.getAttribute("data-goto"); });
    });
  }
};

/* =========================================================
 * 管网监测
 * ========================================================= */
Pages.network = {
  render() {
    const center = Data.topology[0];
    const nodes = Data.topology.slice(1);
    const lines = nodes.map(n => '<line class="topology-line animated" x1="' + center.x + '" y1="' + center.y + '" x2="' + n.x + '" y2="' + n.y + '"/>').join("");
    const rings = '<circle cx="' + center.x + '" cy="' + center.y + '" r="76" fill="none" stroke="rgba(46,211,230,.12)" stroke-dasharray="3 6"/>' +
      '<circle cx="' + center.x + '" cy="' + center.y + '" r="132" fill="none" stroke="rgba(46,211,230,.07)" stroke-dasharray="3 8"/>' +
      '<circle cx="' + center.x + '" cy="' + center.y + '" r="190" fill="none" stroke="rgba(46,211,230,.05)" stroke-dasharray="2 9"/>';
    const gateway = '<g class="map-node" data-node="' + center.id + '" tabindex="0">' +
      '<circle class="node-halo" cx="' + center.x + '" cy="' + center.y + '" r="26" fill="' + COLORS.cyan + '"/>' +
      '<circle class="pulse-ring" cx="' + center.x + '" cy="' + center.y + '" r="16" fill="none" stroke="' + COLORS.cyan + '" stroke-width="1.2"/>' +
      '<circle class="node-core" cx="' + center.x + '" cy="' + center.y + '" r="12" fill="' + COLORS.cyan + '" filter="url(#nodeGlow)"/>' +
      '<text class="node-label" x="' + center.x + '" y="' + (center.y - 24) + '" text-anchor="middle">' + center.label + "</text>" +
      '<text class="node-sub" x="' + center.x + '" y="' + (center.y + 30) + '" text-anchor="middle">' + center.status + " · 在线设备 2,856</text>" +
      "</g>";
    const topology = '<svg viewBox="0 0 900 360" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      mapDefs() +
      '<rect width="900" height="360" fill="url(#mapBg)"/>' +
      mapBackdrop() + rings + lines + gateway +
      nodes.map(n => {
        const sub = (n.type || "") + " · " + n.zone;
        return '<g class="map-node" data-node="' + n.id + '" tabindex="0">' +
          '<circle class="node-halo" cx="' + n.x + '" cy="' + n.y + '" r="16" fill="' + n.color + '"/>' +
          (n.status === "告警" ? '<circle class="pulse-ring" cx="' + n.x + '" cy="' + n.y + '" r="9" fill="none" stroke="' + n.color + '" stroke-width="1.2"/>' : "") +
          '<circle class="node-core" cx="' + n.x + '" cy="' + n.y + '" r="7" fill="' + n.color + '" filter="url(#nodeGlow)"/>' +
          '<text class="node-label" x="' + n.x + '" y="' + (n.y - 15) + '" text-anchor="middle">' + n.label + "</text>" +
          '<text class="node-sub" x="' + n.x + '" y="' + (n.y + 20) + '" text-anchor="middle">' + sub + "</text>" +
          "</g>";
      }).join("") +
      '<text x="24" y="340" style="fill:#5c7a8d;font-size:10px;">● 在线　● 预警　● 告警　·　数据更新 09:24:16</text>' +
      "</svg>";

    const deviceRows = Data.deviceAccess.map(d => ({
      attrs: 'class="clickable" data-device="' + d.id + '"',
      cells: [d.id, '<span class="muted">' + d.type + "</span>", statusHTML(d.status)]
    }));
    const pointRows = Data.networkPoints.map(p => ({
      attrs: 'class="clickable" data-device="' + p.id + '"',
      cells: [p.no, '<span class="strong">' + p.id + "</span>", p.zone, p.type, '<span class="mono">' + p.value + "</span>", statusHTML(p.status)]
    }));

    return '<div class="stat-grid">' +
      statCard({ label: "接入设备", value: "2,856", note: '在线 <b class="up">2,779</b>' }) +
      statCard({ label: "监测站点", value: "186", note: "覆盖 <b>12</b> 个行政分区" }) +
      statCard({ label: "管网总长", value: "482", unit: "km", note: "给水 <b>318</b> km · 排水 <b>164</b> km" }) +
      statCard({ label: "今日新增", value: "6", note: "设备接入 · 全部调试完成" }) +
      "</div>" +
      '<div class="grid split-a">' +
      panel({
        title: "管网监测网络拓扑图",
        actions: legend([{ color: COLORS.green, name: "在线" }, { color: COLORS.amber, name: "预警" }, { color: COLORS.red, name: "告警" }]),
        body: '<div class="map-canvas" style="height:304px">' + topology + "</div>"
      }) +
      panel({
        title: "设备接入状态",
        actions: '<span class="panel-sub">2,856 台</span>',
        body: dataTable(["设备", "类型", "状态"], deviceRows)
      }) +
      "</div>" +
      panel({
        title: "监测点实时数据",
        actions: '<span class="panel-sub">共 186 个监测点</span>',
        body: dataTable(["序号", "监测点", "管网区域", "设备类型", "实时值", "状态"], pointRows)
      });
  },
  mount(root) {
    const resolveNode = id => {
      const n = Data.topology.find(x => x.id === id);
      if (!n) return "";
      if (n.kind === "gateway") {
        return tipHTML("DTU 网关 · 在线", [
          { name: "接入设备", color: COLORS.cyan, value: "2,856 台" },
          { name: "在线率", color: COLORS.green, value: "97.3%" },
          { name: "上行带宽", color: "#5f788a", value: "42.6 Mbps" }
        ]);
      }
      return tipHTML(n.id + " · " + n.status, [
        { name: n.type, color: n.color, value: n.value },
        { name: "所属区域", color: "#5f788a", value: n.zone }
      ]);
    };
    bindMapNodes(root, resolveNode, id => {
      const n = Data.topology.find(x => x.id === id);
      if (n.kind === "gateway") {
        UI.toast("网关设备运行正常，在线设备 2,856 台", "ok");
        return;
      }
      openDeviceDrawer({ id: n.id, name: n.id + " 监测点", type: n.type, zone: n.zone, value: n.value, status: n.status });
    });
    root.querySelectorAll("[data-device]").forEach(row => {
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-device");
        const p = Data.networkPoints.find(x => x.id === id);
        if (p) {
          openDeviceDrawer({ id: p.id, name: p.id + " 监测点", type: p.type, zone: p.zone, value: p.value, status: p.status });
        } else {
          const d = Data.deviceAccess.find(x => x.id === id);
          openDeviceDrawer({ id: d.id, name: d.id + " 设备", type: d.type, zone: "A区给水干管", value: "0.42 MPa", status: d.status });
        }
      });
    });
  }
};

/* =========================================================
 * 压力监测
 * ========================================================= */
Pages.pressure = {
  render() {
    const rows = Data.pressurePoints.map(p => ({
      attrs: 'class="clickable" data-pressure="' + p.id + '"',
      cells: [
        '<span class="strong">' + p.id + "</span>", p.zone,
        '<span class="mono">' + p.value + "</span>", '<span class="mono">' + p.avg + "</span>",
        '<span class="mono">' + p.peak + "</span>", statusHTML(p.status)
      ]
    }));
    return '<div class="stat-grid">' +
      statCard({ label: "平均压力", value: "0.42", unit: "MPa", note: "正常范围" }) +
      statCard({ label: "最高压力", value: "0.68", unit: "MPa", note: '<b class="warn">A区 泵房</b>' }) +
      statCard({ label: "最低压力", value: "0.21", unit: "MPa", note: '<b class="down">E区 末端</b>' }) +
      statCard({ label: "压力测点", value: "64", note: '在线 <b class="up">63</b> · 在线率 98.4%' }) +
      "</div>" +
      panel({
        title: "实时压力监测（各测点）",
        actions: legend([
          { color: COLORS.green, name: "P-01" },
          { color: COLORS.cyan, name: "P-07" },
          { color: COLORS.amber, name: "P-12" }
        ]) + '<div class="seg" id="pressureRange"><button data-range="live" class="active">实时</button><button data-range="1h">近1小时</button><button data-range="24h">近24小时</button></div>',
        body: '<div class="chart-host" id="pressureChart" style="height:268px"></div>'
      }) +
      panel({
        title: "测点压力明细",
        actions: '<span class="panel-sub">数据更新于 09:24:16</span>',
        body: dataTable(["测点", "所属区域", "实时压力", "均值", "峰值", "状态"], rows)
      });
  },
  mount(root) {
    let range = "live";
    const host = root.querySelector("#pressureChart");
    function labelsFor(r) {
      if (r === "live") {
        const arr = [];
        for (let i = 0; i < 30; i++) {
          const m = 9 * 60 + i * 2;
          arr.push(String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"));
        }
        return arr;
      }
      if (r === "1h") {
        const arr = [];
        for (let i = 0; i < 60; i++) {
          const m = 8 * 60 + 30 + i;
          arr.push(String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"));
        }
        return arr;
      }
      return Array.from({ length: 25 }, (_, i) => String(i).padStart(2, "0") + ":00");
    }
    function draw() {
      const labels = labelsFor(range);
      const n = labels.length;
      const p1 = buildSeries(n, 0.41, 0.05, range === "live" ? 12 : range === "1h" ? 13 : 14);
      const p7 = buildSeries(n, 0.53, 0.055, range === "live" ? 22 : range === "1h" ? 23 : 24);
      const p12 = buildSeries(n, 0.245, 0.035, range === "live" ? 32 : range === "1h" ? 33 : 34);
      Charts.line(host, {
        labels: labels,
        series: [
          { name: "P-01", color: COLORS.green, data: p1, format: v => v.toFixed(3) + " MPa" },
          { name: "P-07", color: COLORS.cyan, data: p7, format: v => v.toFixed(3) + " MPa" },
          { name: "P-12", color: COLORS.amber, data: p12, format: v => v.toFixed(3) + " MPa" }
        ],
        yMin: 0.18, yMax: 0.62, yTicks: 5, height: 268,
        xTickEvery: range === "live" ? 5 : range === "1h" ? 10 : 4,
        xFormat: i => labels[i],
        tip: i => tipHTML(labels[i] + " · 实时压力", [
          { name: "P-01", color: COLORS.green, value: p1[i].toFixed(3) + " MPa" },
          { name: "P-07", color: COLORS.cyan, value: p7[i].toFixed(3) + " MPa" },
          { name: "P-12", color: COLORS.amber, value: p12[i].toFixed(3) + " MPa" }
        ])
      });
    }
    draw();
    root.querySelectorAll("#pressureRange button").forEach(btn => {
      btn.addEventListener("click", () => {
        range = btn.getAttribute("data-range");
        root.querySelectorAll("#pressureRange button").forEach(b => b.classList.toggle("active", b === btn));
        draw();
      });
    });
    root.querySelectorAll("[data-pressure]").forEach(row => {
      row.addEventListener("click", () => {
        const p = Data.pressurePoints.find(x => x.id === row.getAttribute("data-pressure"));
        UI.drawer({
          eyebrow: "测点详情 · " + p.id,
          title: p.zone,
          sub: "实时压力 " + p.value + " · " + p.status,
          body: '<div class="kv-grid">' +
            '<div class="kv"><span class="k">实时压力</span><span class="v big">' + p.value + "</span></div>" +
            '<div class="kv"><span class="k">24h 均值</span><span class="v">' + p.avg + " MPa</span></div>" +
            '<div class="kv"><span class="k">24h 峰值</span><span class="v">' + p.peak + " MPa</span></div>" +
            '<div class="kv"><span class="k">状态</span><span class="v">' + statusHTML(p.status) + "</span></div>" +
            "</div>" +
            '<div class="section-label">压力告警</div>' +
            '<div class="check-list">' +
            (p.status === "预警"
              ? '<button class="check-item"><span class="ci-badge">!</span><span>末端压力持续低于 0.24 MPa</span><span class="ci-time">07:58</span></button>'
              : '<div class="muted" style="font-size:12px;padding:8px 2px;">该测点近 24 小时无压力告警</div>') +
            "</div>",
          footer: '<button class="btn" data-close>关闭</button><button class="btn primary" data-focus>加入重点监测</button>',
          onMount(el) {
            el.querySelector("[data-close]").addEventListener("click", UI.closeDrawer);
            el.querySelector("[data-focus]").addEventListener("click", () => {
              UI.toast("已将 " + p.id + " 加入重点监测", "ok");
              UI.closeDrawer();
            });
          }
        });
      });
    });
  }
};

/* =========================================================
 * 环境监测
 * ========================================================= */
Pages.environment = {
  render() {
    const options = Object.keys(Data.envPoints).map(k => '<option value="' + k + '">' + k + " · " + Data.envPoints[k].zone + "</option>").join("");
    const rows = Data.envTable.map(r => ({
      attrs: 'class="clickable" data-env="' + r.id + '"',
      cells: [
        '<span class="strong">' + r.id + "</span>", r.flow, r.total, r.volt, r.level, r.temp, statusHTML(r.status)
      ]
    }));
    return '<div class="toolbar">' +
      '<span class="toolbar-label">监测点</span>' +
      '<select class="select" id="envPointSelect">' + options + "</select>" +
      '<span class="grow"></span>' +
      '<span class="toolbar-label">数据更新于 ' + Data.updatedAt + "</span>" +
      "</div>" +
      '<div class="stat-grid">' +
      statCard({ label: "瞬时流量", value: "126", unit: "m³/h", valueId: "envFlow", note: '较昨日 <b class="up">+3.1%</b>' }) +
      statCard({ label: "电池电压", value: "3.62", unit: "V", valueId: "envVolt", note: "正常" }) +
      statCard({ label: "累积流量", value: "18,642", unit: "m³", valueId: "envTotal", note: "本月累计" }) +
      statCard({ label: "井内液位", value: "1.8", unit: "m", valueId: "envLevel", noteId: "envLevelNote", note: '<b class="warn">C区 偏高</b>' }) +
      "</div>" +
      '<div class="grid split-even">' +
      panel({
        title: "瞬时流量 / 累积流量",
        actions: legend([{ color: COLORS.cyan, name: "瞬时流量 m³/h" }, { color: COLORS.green, name: "累积流量 ×10² m³" }]),
        body: '<div class="chart-host" id="envFlowChart" style="height:238px"></div>'
      }) +
      panel({
        title: "井内液位 / 温度",
        actions: legend([{ color: COLORS.purple, name: "液位 m" }, { color: COLORS.amber, name: "温度 °C" }]),
        body: '<div class="chart-host" id="envLevelChart" style="height:238px"></div>'
      }) +
      "</div>" +
      panel({
        title: "环境监测数据",
        actions: '<span class="panel-sub">4 个监测点</span>',
        body: dataTable(["测点", "瞬时流量", "累积流量", "电池电压", "井内液位", "温度", "状态"], rows)
      });
  },
  mount(root) {
    let current = "E-01";
    const parseNum = s => parseFloat(String(s).replace(/[^\d.]/g, ""));

    function apply(key) {
      current = key;
      const p = Data.envPoints[key];
      root.querySelector("#envFlow").textContent = p.flow;
      root.querySelector("#envVolt").textContent = p.volt;
      root.querySelector("#envTotal").textContent = p.total;
      root.querySelector("#envLevel").textContent = p.level;
      root.querySelector("#envLevelNote").innerHTML = p.status === "预警"
        ? '<b class="warn">C区 偏高</b>'
        : '<b class="plain">' + p.zone + "</b>";
      root.querySelectorAll("[data-env]").forEach(r => r.classList.toggle("selected", r.getAttribute("data-env") === key));
      drawFlow(p);
      drawLevel(p);
    }

    function drawFlow(p) {
      const host = root.querySelector("#envFlowChart");
      const labels = HOUR_LABELS.slice(0, 24);
      const n = labels.length;
      const flow = p.flowSeries.slice(0, 24);
      const total = parseNum(p.total);
      const cum = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        cum.push(Math.round((total * (0.62 + 0.38 * t)) / 100));
      }
      Charts.line(host, {
        labels: labels,
        series: [
          { name: "瞬时流量", color: COLORS.cyan, data: flow, area: true, format: v => v + " m³/h" },
          { name: "累积流量", color: COLORS.green, data: cum, scale: { min: 60, max: 210 }, format: v => (v * 100).toLocaleString() + " m³" }
        ],
        yMin: 60, yMax: 160, yTicks: 5, height: 238,
        xTickEvery: 4, xFormat: i => labels[i],
        tip: i => tipHTML(labels[i] + " 时段", [
          { name: "瞬时流量", color: COLORS.cyan, value: flow[i] + " m³/h" },
          { name: "累积流量", color: COLORS.green, value: (cum[i] * 100).toLocaleString() + " m³" }
        ])
      });
    }

    function drawLevel(p) {
      const host = root.querySelector("#envLevelChart");
      const labels = HOUR_LABELS.slice(0, 24);
      const n = labels.length;
      const lv = buildSeries(n, parseNum(p.level), 0.35, 51);
      const tp = buildSeries(n, parseNum(p.temp), 0.8, 61);
      Charts.line(host, {
        labels: labels,
        series: [
          { name: "井内液位", color: COLORS.purple, data: lv, scale: { min: 0, max: 3 }, format: v => v.toFixed(2) + " m" },
          { name: "温度", color: COLORS.amber, data: tp, scale: { min: 20, max: 25 }, format: v => v.toFixed(1) + " °C" }
        ],
        yMin: 0, yMax: 3, yTicks: 3, height: 238,
        rightAxis: { min: 20, max: 25, ticks: 5, format: v => v.toFixed(0) + "°" },
        xTickEvery: 4, xFormat: i => labels[i],
        tip: i => tipHTML(labels[i] + " 时段", [
          { name: "井内液位", color: COLORS.purple, value: lv[i].toFixed(2) + " m" },
          { name: "温度", color: COLORS.amber, value: tp[i].toFixed(1) + " °C" }
        ])
      });
    }

    root.querySelector("#envPointSelect").addEventListener("change", e => {
      apply(e.target.value);
      UI.toast("已切换至监测点 " + e.target.value, "ok");
    });
    root.querySelectorAll("[data-env]").forEach(row => {
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-env");
        root.querySelector("#envPointSelect").value = id;
        apply(id);
      });
    });
    apply("E-01");
  }
};

/* =========================================================
 * 告警管理
 * ========================================================= */
Pages.alerts = {
  _state: { level: "all", q: "", date: null },
  render() {
    return '<div class="toolbar">' +
      '<div class="seg" id="alertLevel">' +
      '<button data-level="all" class="active">全部</button>' +
      '<button data-level="紧急">紧急</button>' +
      '<button data-level="严重">严重</button>' +
      '<button data-level="一般">一般</button>' +
      "</div>" +
      '<input class="input sm" id="alertSearch" placeholder="搜索告警ID / 站点 / 类型" style="width:210px" />' +
      '<span class="toolbar-label" id="alertFilterInfo"></span>' +
      '<span class="grow"></span>' +
      '<button class="btn small" id="alertExport">导出告警</button>' +
      "</div>" +
      '<div class="stat-grid">' +
      statCard({ label: "今日告警", value: "47", note: '较昨日 <b class="down">+6.1%</b>' }) +
      statCard({ label: "紧急告警", value: "5", note: '<b class="down">需立即处理</b>' }) +
      statCard({ label: "已处置", value: "38", note: '处理率 <b class="up">80.9%</b>' }) +
      statCard({ label: "平均处置时长", value: "42", unit: "min", note: '较上月 <b class="up">-8 min</b>' }) +
      "</div>" +
      '<div class="grid split-a">' +
      panel({
        title: "告警数量分析",
        actions: legend([{ color: COLORS.cyan, name: "日常" }, { color: COLORS.amber, name: "高峰" }]),
        body: '<div class="chart-host" id="alertBarChart" style="height:244px"></div>'
      }) +
      panel({
        title: "告警类型分析",
        actions: '<span class="panel-sub">今日 47 起</span>',
        body: '<div class="chart-host" id="alertDonut" style="height:244px"></div>'
      }) +
      "</div>" +
      panel({
        title: '告警明细 <span class="panel-sub" id="alertCount"></span>',
        actions: '<span class="panel-sub">按时间倒序</span>',
        body: '<div id="alertTableHost"></div>'
      });
  },
  mount(root) {
    const state = Pages.alerts._state;
    const tableHost = root.querySelector("#alertTableHost");
    const countEl = root.querySelector("#alertCount");
    const infoEl = root.querySelector("#alertFilterInfo");

    function filtered() {
      const q = state.q.trim().toLowerCase();
      return Data.alerts.filter(a =>
        (state.level === "all" || a.level === state.level) &&
        (!state.date || a.date === state.date) &&
        (!q || (a.id + a.site + a.type + a.device).toLowerCase().indexOf(q) >= 0)
      );
    }
    function renderTable() {
      const list = filtered();
      countEl.textContent = "共 " + list.length + " 条";
      if (!list.length) {
        tableHost.innerHTML = '<div style="padding:34px 0;text-align:center;color:#6d8798;font-size:12px;">暂无符合条件的告警记录</div>';
        return;
      }
      tableHost.innerHTML = dataTable(
        ["告警ID", "时间", "站点", "类型", "等级", "状态", "操作"],
        list.map(a => ({
          attrs: 'class="clickable" data-alert-id="' + a.id + '"',
          cells: [
            '<span class="mono">' + a.id + "</span>",
            '<span class="mono">' + a.day + " " + a.time + "</span>",
            a.site,
            '<span class="muted">' + a.type + "</span>",
            levelHTML(a.level),
            statusHTML(a.status),
            '<button class="text-link" data-detail="' + a.id + '">详情</button>'
          ]
        }))
      );
      tableHost.querySelectorAll("[data-alert-id]").forEach(row => {
        row.addEventListener("click", ev => {
          if (ev.target.closest("[data-detail]")) return;
          openAlertDrawer(row.getAttribute("data-alert-id"));
        });
      });
      tableHost.querySelectorAll("[data-detail]").forEach(btn => {
        btn.addEventListener("click", ev => {
          ev.stopPropagation();
          openAlertDrawer(btn.getAttribute("data-detail"));
        });
      });
    }
    function renderInfo() {
      const bits = [];
      if (state.level !== "all") bits.push("等级：" + state.level);
      if (state.date) bits.push("日期：" + state.date.replace("-", "/"));
      if (state.q) bits.push('关键词："' + state.q + '"');
      if (!bits.length) { infoEl.innerHTML = ""; return; }
      infoEl.innerHTML = bits.join(" · ") + ' <button class="text-link" id="alertClear">清除</button>';
      infoEl.querySelector("#alertClear").addEventListener("click", () => {
        state.level = "all"; state.q = ""; state.date = null;
        root.querySelector("#alertSearch").value = "";
        root.querySelectorAll("#alertLevel button").forEach(b => b.classList.toggle("active", b.getAttribute("data-level") === "all"));
        renderInfo(); renderTable();
      });
    }

    Charts.bars(root.querySelector("#alertBarChart"), {
      labels: Data.alertBars.labels,
      values: Data.alertBars.values,
      colors: (i) => i < 3 ? COLORS.cyan : COLORS.amber,
      yMax: 60, yTicks: 6, height: 244, name: "告警数量", format: v => v + " 起", barWidth: 26,
      onClick: i => {
        const day = Data.alertBars.labels[i];
        const date = "09-" + day.split("/")[1];
        const hasDetail = Data.alerts.some(a => a.date === date);
        if (!hasDetail) {
          UI.toast(day + " 共 " + Data.alertBars.values[i] + " 起告警，明细已归档", "warn");
          return;
        }
        state.date = date;
        renderInfo(); renderTable();
        UI.toast("已筛选 " + day + " 的告警", "ok");
      }
    });
    Charts.donut(root.querySelector("#alertDonut"), {
      data: Data.alertTypes,
      centerValue: "47",
      centerLabel: "今日告警",
      height: 244
    });

    root.querySelectorAll("#alertLevel button").forEach(btn => {
      btn.addEventListener("click", () => {
        state.level = btn.getAttribute("data-level");
        root.querySelectorAll("#alertLevel button").forEach(b => b.classList.toggle("active", b === btn));
        renderInfo(); renderTable();
      });
    });
    root.querySelector("#alertSearch").addEventListener("input", e => {
      state.q = e.target.value;
      renderInfo(); renderTable();
    });
    root.querySelector("#alertExport").addEventListener("click", () => {
      const list = filtered();
      const csv = "\ufeff告警ID,日期,时间,站点,类型,等级,状态\n" +
        list.map(a => [a.id, a.date, a.time, a.site, a.type, a.level, a.status].join(",")).join("\n");
      downloadFile("告警清单_2026-09-30.csv", csv, "text/csv;charset=utf-8");
      UI.toast("告警清单已导出（" + list.length + " 条）", "ok");
    });

    if (state.q) root.querySelector("#alertSearch").value = state.q;
    root.querySelectorAll("#alertLevel button").forEach(b => b.classList.toggle("active", b.getAttribute("data-level") === state.level));
    renderInfo();
    renderTable();
  }
};

/* =========================================================
 * 安全报告
 * ========================================================= */
Pages.report = {
  render() {
    return '<div class="stat-grid">' +
      statCard({ label: "本月报告", value: "31", note: "日报 <b>30</b> · 月报 <b>1</b>" }) +
      statCard({ label: "安全评分", value: "92.4", note: '较上月 <b class="up">+1.6</b>' }) +
      statCard({ label: "风险项", value: "6", note: '已整改 <b class="up">5</b>' }) +
      statCard({
        label: "自动生成", value: "开启", valueId: "reportAutoVal",
        note: '每日 08:00 <button class="switch on" id="autoSwitch" style="margin-left:auto" aria-label="自动生成开关"></button>'
      }) +
      "</div>" +
      '<div class="grid split-a">' +
      panel({
        title: "报告列表",
        actions: '<span class="panel-sub">本月 31 份</span>',
        body: '<div class="report-list" id="reportList"></div>'
      }) +
      panel({
        title: "报告预览",
        actions: '<button class="btn small" id="reportExport">导出 PDF</button>',
        body: '<div class="report-preview" id="reportPreview"></div>'
      }) +
      "</div>" +
      panel({
        title: "安全指标趋势",
        actions: legend([{ color: COLORS.green, name: "安全评分" }, { color: "#2b7f96", name: "告警数" }]),
        body: '<div class="chart-host" id="safetyChart" style="height:236px"></div>'
      });
  },
  mount(root) {
    let active = 2;
    function renderList() {
      root.querySelector("#reportList").innerHTML = Data.reports.map((r, i) =>
        '<button class="report-row' + (i === active ? " active" : "") + '" data-report="' + i + '">' +
        '<span class="r-name">' + r.name + "</span>" +
        '<span class="r-period">' + r.period + "</span>" +
        '<span class="r-status">' + r.status + "</span>" +
        "</button>"
      ).join("");
      root.querySelectorAll("[data-report]").forEach(btn => {
        btn.addEventListener("click", () => { active = +btn.getAttribute("data-report"); renderList(); renderPreview(); });
      });
    }
    function renderPreview() {
      const r = Data.reports[active];
      root.querySelector("#reportPreview").innerHTML =
        '<div class="report-doc"><h3>' + r.title + '</h3><div class="doc-meta">' + r.meta + "</div>" +
        r.sections.map(s => "<h4>" + s.h + "</h4><p>" + s.p + "</p>").join("") +
        "</div>";
    }
    renderList();
    renderPreview();

    root.querySelector("#reportExport").addEventListener("click", () => {
      const r = Data.reports[active];
      const html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>' + r.title + "</title>" +
        "<style>body{font-family:'Microsoft YaHei',sans-serif;max-width:760px;margin:40px auto;color:#1f2d3d;line-height:1.9;padding:0 24px}h1{font-size:22px}h2{font-size:15px;margin-top:22px;color:#0b6f7c}p{font-size:13px}small{color:#6b7c8c}</style></head><body>" +
        "<h1>" + r.title + "</h1><small>智慧管网平台 · " + r.meta + "</small>" +
        r.sections.map(s => "<h2>" + s.h + "</h2><p>" + s.p + "</p>").join("") +
        "<p style=\"margin-top:36px;font-size:11px;color:#8898a6;\">本报告由平台自动生成，仅用于内部安全管理。</p>" +
        "</body></html>";
      downloadFile(r.title.replace(/[（）]/g, "_") + ".html", html, "text/html;charset=utf-8");
      UI.toast("报告已导出，可使用浏览器打印为 PDF", "ok");
    });

    const sw = root.querySelector("#autoSwitch");
    sw.addEventListener("click", () => {
      const on = sw.classList.toggle("on");
      root.querySelector("#reportAutoVal").textContent = on ? "开启" : "关闭";
      UI.toast(on ? "已开启每日 08:00 自动生成报告" : "已关闭自动生成报告", on ? "ok" : "warn");
    });

    Charts.combo(root.querySelector("#safetyChart"), {
      labels: Data.safetyTrend.labels,
      bars: Data.safetyTrend.alerts,
      line: Data.safetyTrend.score,
      barsName: "告警数",
      lineName: "安全评分",
      barColor: "#1d7c92",
      lineColor: COLORS.green,
      yMin: 0, yMax: 100, yTicks: 5, height: 236, barWidth: 34
    });
  }
};

/* =========================================================
 * 漏水预警
 * ========================================================= */
Pages.leak = {
  render() {
    return '<div class="stat-grid">' +
      statCard({ label: "漏水概率", value: "78", unit: "%", valueId: "leakProb", noteId: "leakProbNote", note: '<b class="down">A区 疑似漏水</b>' }) +
      statCard({ label: "疑似漏点", value: "3", note: '<b class="warn">待人工复核</b>' }) +
      statCard({ label: "定位精度", value: "±1.5", unit: "m", note: "算法 v2.3 · 持续学习" }) +
      statCard({ label: "今日预警", value: "6", note: '已确认 <b class="up">2</b>' }) +
      "</div>" +
      '<div class="grid split-a">' +
      panel({
        title: "压力突变 + 音频综合分析",
        actions: legend([{ color: COLORS.cyan, name: "压力" }, { color: COLORS.amber, name: "音频" }]),
        body: '<div class="chart-host" id="leakChart" style="height:248px"></div>'
      }) +
      panel({
        title: "漏水点定位",
        actions: legend([{ color: COLORS.red, name: "疑似漏点" }, { color: COLORS.cyan, name: "监测点" }]),
        body: '<div class="map-canvas" id="leakMap" style="height:248px"></div>'
      }) +
      "</div>" +
      panel({
        title: "漏水预警清单",
        actions: '<span class="panel-sub" id="leakCount">4 处疑似</span>',
        body: '<div id="leakTableHost"></div>'
      });
  },
  mount(root) {
    let selected = "L-01";

    function renderMap() {
      const sel = Data.leaks.find(l => l.id === selected);
      const routes = Data.leakMonitors.map(m =>
        '<line class="map-route" x1="' + sel.x + '" y1="' + sel.y + '" x2="' + m.x + '" y2="' + m.y + '"/>'
      ).join("");
      const leakNodes = Data.leaks.map(l => ({
        id: l.id,
        label: l.id === selected ? "疑似漏点" : l.id,
        x: l.x, y: l.y,
        color: l.id === selected ? COLORS.red : (l.status === "已排除" ? COLORS.green : COLORS.amber)
      }));
      const monitors = Data.leakMonitors.map(m => ({ id: m.id, label: "监测点", x: m.x, y: m.y, color: COLORS.cyan }));
      root.querySelector("#leakMap").innerHTML = mapSVG(leakNodes.concat(monitors), routes);
      bindMapNodes(root, id => {
        const l = Data.leaks.find(x => x.id === id);
        if (l) {
          return tipHTML(l.id + " · " + l.status, [
            { name: "区域", color: l.color, value: l.zone },
            { name: "漏水概率", color: COLORS.red, value: l.prob + "%" },
            { name: "定位精度", color: "#5f788a", value: l.acc }
          ]);
        }
        return tipHTML(id + " · 监测点", [{ name: "状态", color: COLORS.cyan, value: "在线 · 采样正常" }]);
      }, id => {
        const l = Data.leaks.find(x => x.id === id);
        if (l) select(l.id, true);
        else UI.toast("监测点 " + id + " 运行正常", "ok");
      });
    }

    function renderTable() {
      const rows = Data.leaks.map(l => ({
        attrs: 'class="clickable' + (l.id === selected ? " selected" : "") + '" data-leak="' + l.id + '"',
        cells: [
          '<span class="strong">' + l.id + "</span>", l.zone,
          '<span class="mono">' + l.prob + "%</span>", '<span class="mono">' + l.acc + "</span>",
          statusHTML(l.status), '<span class="muted">' + l.advice + "</span>"
        ]
      }));
      root.querySelector("#leakTableHost").innerHTML = dataTable(
        ["漏点ID", "区域", "漏水概率", "定位精度", "状态", "建议"], rows
      );
      root.querySelectorAll("[data-leak]").forEach(row => {
        row.addEventListener("click", () => select(row.getAttribute("data-leak"), true));
      });
      root.querySelector("#leakCount").textContent = Data.leaks.filter(l => l.status !== "已排除").length + " 处疑似";
    }

    function updateCards() {
      const l = Data.leaks.find(x => x.id === selected);
      root.querySelector("#leakProb").textContent = l.prob;
      const note = root.querySelector("#leakProbNote");
      note.innerHTML = l.status === "已确认"
        ? '<b class="up">' + l.zone + " · 已确认</b>"
        : l.status === "已排除"
          ? '<b class="plain">' + l.zone + " · 已排除</b>"
          : '<b class="down">' + l.zone + " · 疑似漏水</b>";
    }

    function select(id, open) {
      selected = id;
      const l = Data.leaks.find(x => x.id === id);
      renderMap();
      renderTable();
      updateCards();
      if (open) openLeakDrawer(l);
    }

    function openLeakDrawer(l) {
      UI.drawer({
        eyebrow: "漏水预警 · " + l.id,
        title: l.zone + " 疑似漏点",
        sub: "漏水概率 " + l.prob + "% · 定位精度 " + l.acc,
        body: '<div class="alert-summary">' +
          '<div class="ico"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2c2.6 3 4.4 5 4.4 7A4.4 4.4 0 0 1 8 13.4 4.4 4.4 0 0 1 3.6 9C3.6 7 5.4 5 8 2Z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 11.2V7.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>' +
          '<div class="txt">压力与音频特征吻合度 <b>' + l.prob + '%</b>，建议' + l.advice + "</div></div>" +
          '<div class="section-label">定位结果</div>' +
          '<div class="kv-grid">' +
          '<div class="kv"><span class="k">漏点编号</span><span class="v">' + l.id + "</span></div>" +
          '<div class="kv"><span class="k">所属区域</span><span class="v">' + l.zone + "</span></div>" +
          '<div class="kv"><span class="k">定位精度</span><span class="v">' + l.acc + "</span></div>" +
          '<div class="kv"><span class="k">状态</span><span class="v">' + statusHTML(l.status) + "</span></div>" +
          "</div>" +
          '<div class="section-label">分析依据</div>' +
          '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">09:42 前后压力出现 0.06 MPa 突变，同时 45–52 号音频采样段能量抬升 18 dB，频谱特征与已知漏点样本匹配度较高。</p>' +
          '<div class="section-label">处置建议</div>' +
          '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">建议安排现场听漏确认；若确认漏点，优先采用不停水抢修工艺，并同步更新管网资产台账。</p>',
        footer: l.status === "已确认" || l.status === "已排除"
          ? '<button class="btn" data-close>关闭</button>'
          : '<button class="btn" data-close>稍后处理</button><button class="btn primary" data-confirm>现场确认</button>',
        onMount(el) {
          el.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", UI.closeDrawer));
          const cf = el.querySelector("[data-confirm]");
          if (cf) {
            cf.addEventListener("click", () => {
              l.status = "已确认";
              l.advice = "已派单";
              UI.toast(l.id + " 已确认，抢修工单已派发", "ok");
              UI.closeDrawer();
              renderTable(); updateCards(); renderMap();
            });
          }
        }
      });
    }

    Charts.line(root.querySelector("#leakChart"), {
      labels: Data.leakAnalyze.labels,
      series: [
        { name: "压力", color: COLORS.cyan, data: Data.leakAnalyze.pressure, format: v => v.toFixed(3) + " MPa" },
        { name: "音频", color: COLORS.amber, data: Data.leakAnalyze.audio, scale: { min: 0, max: 0.16 }, format: v => v.toFixed(3) }
      ],
      yMin: 0.32, yMax: 0.50, yTicks: 4, height: 248, smooth: false,
      rightAxis: { min: 0, max: 0.16, ticks: 4, format: v => v.toFixed(2) },
      xTickEvery: 10, xFormat: i => i,
      band: { from: 45, to: 52, label: "疑似漏水 09:42" },
      tip: i => tipHTML("采样点 " + i, [
        { name: "压力", color: COLORS.cyan, value: Data.leakAnalyze.pressure[i].toFixed(3) + " MPa" },
        { name: "音频能量", color: COLORS.amber, value: Data.leakAnalyze.audio[i].toFixed(3) }
      ])
    });

    renderMap();
    renderTable();
    updateCards();
  }
};

/* =========================================================
 * 信息管理
 * ========================================================= */
Pages.info = {
  render() {
    const rows = Data.infoDevices.map(d => ({
      attrs: 'class="clickable' + (d.id === "D-0103" ? " selected" : "") + '" data-device="' + d.id + '"',
      cells: [
        '<span class="mono">' + d.id + "</span>", d.name,
        '<span class="muted">' + d.type + "</span>", d.net, statusHTML(d.status)
      ]
    }));
    const assets = Data.pipeAssets.map(p => ({
      attrs: "",
      cells: [
        '<span class="mono">' + p.id + "</span>", p.name, p.diameter, p.length, p.material, statusHTML(p.status)
      ]
    }));
    return '<div class="stat-grid">' +
      statCard({ label: "设备总数", value: "2,856", note: '在线 <b class="up">2,779</b>' }) +
      statCard({ label: "管网资产", value: "482", unit: "km", note: '覆盖 <b>12</b> 个区域' }) +
      statCard({ label: "远程管理", value: "已连接", note: '支持远程升级 · <b class="up">在线</b>' }) +
      statCard({ label: "待办事项", value: "4", note: '设备校准 · <b class="warn">待处理</b>', attrs: ' id="todoCard" style="cursor:pointer"' }) +
      "</div>" +
      '<div class="grid split-info">' +
      panel({
        title: "设备信息",
        actions: '<input class="input sm" id="deviceSearch" placeholder="搜索设备编号 / 名称" style="width:180px" />',
        body: '<div id="infoDeviceTable">' + dataTable(["设备编号", "设备名称", "类型", "所属管网", "状态"], rows) + "</div>"
      }) +
      panel({
        title: "设备远程管理",
        actions: '<span class="panel-sub" id="remoteTitle"></span>',
        body: '<div id="remotePanel"></div>'
      }) +
      "</div>" +
      panel({
        title: "管网资产清单",
        actions: '<span class="panel-sub">482 km · 12 个区域</span>',
        body: dataTable(["管网编号", "管网名称", "管径", "长度", "材质", "状态"], assets)
      });
  },
  mount(root) {
    let selected = "D-0103";
    const tableHost = root.querySelector("#infoDeviceTable");

    function renderDevices(q) {
      const kw = (q || "").trim().toLowerCase();
      const list = Data.infoDevices.filter(d => !kw || (d.id + d.name + d.type).toLowerCase().indexOf(kw) >= 0);
      tableHost.innerHTML = dataTable(
        ["设备编号", "设备名称", "类型", "所属管网", "状态"],
        list.map(d => ({
          attrs: 'class="clickable' + (d.id === selected ? " selected" : "") + '" data-device="' + d.id + '"',
          cells: ['<span class="mono">' + d.id + "</span>", d.name, '<span class="muted">' + d.type + "</span>", d.net, statusHTML(d.status)]
        }))
      );
      tableHost.querySelectorAll("[data-device]").forEach(row => {
        row.addEventListener("click", () => { selected = row.getAttribute("data-device"); renderDevices(q); renderRemote(); });
      });
    }

    function renderRemote() {
      const d = Data.infoDevices.find(x => x.id === selected);
      root.querySelector("#remoteTitle").textContent = "已连接设备 " + d.id + "（" + d.name + "）";
      root.querySelector("#remotePanel").innerHTML =
        '<div class="remote-head">' +
        '<div><div class="rh-main">' + d.id + " · " + d.name + '</div><div class="rh-sub">' + d.net + " · 固件 v2.3.1 · 信号 " + d.signal + "</div></div>" +
        '<span class="rh-status">' + (d.status === "在线" ? "● 已连接" : "● " + d.status) + "</span>" +
        "</div>" +
        '<div class="action-list">' +
        Data.remoteCodes.map(a =>
          '<button class="action-row" data-remote="' + a.action + '"><span>' + a.key + '</span><span class="ar-code">' + a.code + '</span></button>'
        ).join("") +
        "</div>";
      root.querySelector("#remotePanel").querySelectorAll("[data-remote]").forEach(btn => {
        btn.addEventListener("click", () => openRemoteAction(btn.getAttribute("data-remote"), d));
      });
    }

    function openRemoteAction(action, d) {
      if (action === "firmware") {
        UI.drawer({
          eyebrow: "固件信息 · " + d.id,
          title: "固件版本 v2.3.1",
          sub: "发布日期 2026-08-12 · 支持远程升级",
          body: '<div class="kv-grid">' +
            '<div class="kv"><span class="k">当前版本</span><span class="v">v2.3.1</span></div>' +
            '<div class="kv"><span class="k">最新版本</span><span class="v">v2.4.0</span></div>' +
            '<div class="kv"><span class="k">升级包大小</span><span class="v">2.4 MB</span></div>' +
            '<div class="kv"><span class="k">校验状态</span><span class="v">' + statusHTML("正常") + "</span></div>" +
            "</div>" +
            '<div class="section-label">版本说明</div>' +
            '<div class="timeline">' +
            '<div class="tl-item"><div class="tl-t">v2.4.0 · 2026-09-20</div><div class="tl-c">新增低功耗模式，待机功耗降低 18%</div></div>' +
            '<div class="tl-item"><div class="tl-t">v2.3.1 · 2026-08-12</div><div class="tl-c">优化压力采样稳定性，修复偶发上报延迟</div></div>' +
            "</div>",
          footer: '<button class="btn" data-close>关闭</button>',
          onMount(el) { el.querySelector("[data-close]").addEventListener("click", UI.closeDrawer); }
        });
        return;
      }
      if (action === "heartbeat") {
        UI.drawer({
          eyebrow: "心跳状态 · " + d.id,
          title: "设备运行健康度",
          sub: "最近心跳 09:24:00 · 状态正常",
          body: '<div class="kv-grid">' +
            '<div class="kv"><span class="k">最近心跳</span><span class="v">09:24:00</span></div>' +
            '<div class="kv"><span class="k">心跳间隔</span><span class="v">60 s</span></div>' +
            '<div class="kv"><span class="k">电池电压</span><span class="v">' + d.battery + "</span></div>" +
            '<div class="kv"><span class="k">信号强度</span><span class="v">' + d.signal + "</span></div>" +
            "</div>" +
            '<div class="section-label">今日心跳记录</div>' +
            '<div class="timeline">' +
            '<div class="tl-item"><div class="tl-t">09:24:00</div><div class="tl-c">心跳正常 · 数据包 128 B</div></div>' +
            '<div class="tl-item"><div class="tl-t">09:23:00</div><div class="tl-c">心跳正常 · 数据包 126 B</div></div>' +
            '<div class="tl-item"><div class="tl-t">09:22:00</div><div class="tl-c">心跳正常 · 数据包 130 B</div></div>' +
            "</div>",
          footer: '<button class="btn" data-close>关闭</button>',
          onMount(el) { el.querySelector("[data-close]").addEventListener("click", UI.closeDrawer); }
        });
        return;
      }
      let title = "";
      let body = "";
      let submitText = "下发";
      if (action === "config") {
        title = "远程配置 · " + d.id;
        submitText = "下发配置";
        body = '<div class="form-grid">' +
          '<div class="field"><label>采样间隔</label><select class="select"><option>15 秒</option><option selected>30 秒</option><option>60 秒</option></select></div>' +
          '<div class="field"><label>上报周期</label><select class="select"><option selected>1 分钟</option><option>5 分钟</option><option>15 分钟</option></select></div>' +
          '<div class="field"><label>压力上限阈值</label><input class="input" value="0.60 MPa" /></div>' +
          '<div class="field"><label>压力下限阈值</label><input class="input" value="0.24 MPa" /></div>' +
          '<div class="field full"><label>备注</label><input class="input" placeholder="选填，说明本次配置变更原因" /></div>' +
          "</div>";
      } else if (action === "upgrade") {
        title = "远程升级 · " + d.id;
        body = '<div class="kv-grid" style="margin-bottom:16px;">' +
          '<div class="kv"><span class="k">当前版本</span><span class="v">v2.3.1</span></div>' +
          '<div class="kv"><span class="k">目标版本</span><span class="v">v2.4.0</span></div>' +
          "</div>" +
          '<div class="progress"><div class="bar" id="upgradeBar"></div></div>' +
          '<div class="progress-note"><span id="upgradeText">等待下发升级指令</span><span id="upgradePct">0%</span></div>';
        submitText = "开始升级";
      } else if (action === "reboot") {
        title = "远程重启 · " + d.id;
        submitText = "确认重启";
        body = '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">重启期间设备将中断上报约 30 秒，历史数据不受影响。确认对 <b style="color:#eaf9ff;">' + d.id + " · " + d.name + "</b> 执行远程重启？</p>";
      } else if (action === "calibrate") {
        title = "参数校准 · " + d.id;
        submitText = "开始校准";
        body = '<div class="form-grid">' +
          '<div class="field"><label>校准类型</label><select class="select"><option selected>零点校准</option><option>量程校准</option><option>温度补偿</option></select></div>' +
          '<div class="field"><label>标准值</label><input class="input" value="0.00 MPa" /></div>' +
          '<div class="field full"><label>说明</label><input class="input" value="按季度维护计划执行" /></div>' +
          "</div>";
      }
      UI.modal({
        title: title,
        body: body,
        footer: '<button class="btn" data-cancel>取消</button><button class="btn primary" data-submit>' + submitText + "</button>",
        onMount(el) {
          el.querySelector("[data-cancel]").addEventListener("click", UI.closeModal);
          el.querySelector("[data-submit]").addEventListener("click", () => {
            if (action === "upgrade") {
              let pct = 0;
              const bar = el.querySelector("#upgradeBar");
              const txt = el.querySelector("#upgradeText");
              const num = el.querySelector("#upgradePct");
              const timer = setInterval(() => {
                pct += Math.ceil(Math.random() * 9);
                if (pct >= 100) {
                  pct = 100;
                  clearInterval(timer);
                  txt.textContent = "升级完成，正在重启设备…";
                  UI.toast(d.id + " 固件升级成功，已重启上线", "ok");
                  setTimeout(UI.closeModal, 900);
                  return;
                }
                if (bar && bar.isConnected) {
                  bar.style.width = pct + "%";
                  num.textContent = pct + "%";
                  txt.textContent = "正在下发升级包…";
                }
              }, 320);
            } else {
              const msgs = {
                config: "配置已下发，设备将在下一个周期生效",
                reboot: "重启指令已下发，预计 30 秒后恢复",
                calibrate: "校准指令已下发，预计 2 分钟完成"
              };
              UI.toast(msgs[action] || "指令已下发", "ok");
              UI.closeModal();
            }
          });
        }
      });
    }

    root.querySelector("#deviceSearch").addEventListener("input", e => renderDevices(e.target.value));
    root.querySelector("#todoCard").addEventListener("click", () => {
      UI.drawer({
        eyebrow: "待办事项",
        title: "设备校准任务",
        sub: "共 4 项待处理",
        body: '<div class="check-list">' +
          '<button class="check-item"><span class="ci-badge">1</span><span>D-0103 液位计 · 零点校准</span><span class="ci-time">今日 18:00 前</span></button>' +
          '<button class="check-item"><span class="ci-badge">2</span><span>D-0105 水质仪 · 量程校准</span><span class="ci-time">10-02</span></button>' +
          '<button class="check-item"><span class="ci-badge">3</span><span>P-07 压力计 · 季度巡检</span><span class="ci-time">10-05</span></button>' +
          '<button class="check-item"><span class="ci-badge">4</span><span>D-0106 井盖终端 · 电池更换</span><span class="ci-time">10-08</span></button>' +
          "</div>",
        footer: '<button class="btn" data-close>关闭</button>',
        onMount(el) { el.querySelector("[data-close]").addEventListener("click", UI.closeDrawer); }
      });
    });

    renderDevices("");
    renderRemote();
  }
};

/* =========================================================
 * 压力分析
 * ========================================================= */
Pages.pressureAnalysis = {
  render() {
    const rows = Data.pressurePeriodRows.map(r => ({
      cells: [
        '<span class="mono">' + r.period + "</span>", '<span class="mono">' + r.avg + "</span>",
        '<span class="mono">' + r.peak + "</span>", '<span class="mono">' + r.low + "</span>",
        '<span class="mono">' + r.range + "</span>", statusHTML(r.status === "异常" ? "异常" : "正常")
      ]
    }));
    const modes = Data.pressureAnalysis.modes;
    return '<div class="tabs" id="anaTabs">' +
      modes.map((m, i) => '<button data-mode="' + m.key + '"' + (i === 0 ? ' class="active"' : "") + ">" + m.name + "</button>").join("") +
      "</div>" +
      '<div class="stat-grid">' +
      statCard({ label: "采样频率", value: "1000", unit: "Hz", valueId: "anaFreq", noteId: "anaFreqNote", note: '<b class="cyan">毫秒级</b>' }) +
      statCard({ label: "峰值压力", value: "0.68", unit: "MPa", valueId: "anaPeak", noteId: "anaPeakNote", note: '<b class="warn">09:24:16</b>' }) +
      statCard({ label: "压力波动", value: "±0.06", unit: "MPa", valueId: "anaFluct", note: "正常范围" }) +
      statCard({ label: "异常波形", value: "2", note: '<b class="down">待分析</b>', valueId: "anaAbnormal" }) +
      "</div>" +
      panel({
        title: '<span id="anaChartTitle">压力波形分析（毫秒波形）</span>',
        actions: '<span class="panel-sub" id="anaChartSub">时间窗 09:24:16.000 · 采样 200 点</span>',
        body: '<div class="chart-host" id="anaChart" style="height:272px"></div>'
      }) +
      panel({
        title: "分时段压力统计",
        actions: '<span class="panel-sub">2026-09-30</span>',
        body: dataTable(["时段", "均值", "峰值", "谷值", "波动幅度", "状态"], rows)
      });
  },
  mount(root) {
    const modes = Data.pressureAnalysis.modes;
    let mode = modes[0];

    function build(m) {
      const rnd = seeded(m.seed);
      const mid = (m.yMin + m.yMax) / 2;
      return Array.from({ length: m.points }, (_, i) => {
        let v = mid + Math.sin(i * 0.34 + m.seed) * (m.yMax - m.yMin) * 0.22 + (rnd() - 0.5) * (m.yMax - m.yMin) * 0.07;
        if (m.key === "ms" && i >= 120 && i <= 127) v -= (m.yMax - m.yMin) * 0.35;
        if (m.key === "s" && i >= 38 && i <= 43) v += (m.yMax - m.yMin) * 0.18;
        return Math.round(v * 10000) / 10000;
      });
    }

    function draw() {
      root.querySelectorAll("#anaTabs button").forEach(b => b.classList.toggle("active", b.getAttribute("data-mode") === mode.key));
      root.querySelector("#anaFreq").textContent = mode.freq;
      root.querySelector("#anaFreq").nextElementSibling.textContent = mode.freqUnit;
      root.querySelector("#anaFreqNote").innerHTML = '<b class="cyan">' + mode.freqNote + "</b>";
      root.querySelector("#anaPeak").textContent = mode.peak;
      root.querySelector("#anaPeakNote").innerHTML = '<b class="warn">' + mode.peakNote + "</b>";
      root.querySelector("#anaFluct").textContent = mode.fluct;
      root.querySelector("#anaAbnormal").textContent = mode.abnormal;
      root.querySelector("#anaChartTitle").textContent = mode.title;
      root.querySelector("#anaChartSub").textContent = "时间窗 09:24 · 采样 " + mode.points + " 点";

      const values = build(mode);
      const unit = mode.key === "ms" ? "ms" : mode.key === "s" ? "s" : mode.key === "min" ? "min" : mode.key === "day" ? "时" : "日";
      Charts.line(root.querySelector("#anaChart"), {
        labels: values.map((_, i) => i + unit),
        series: [{ name: "压力", color: COLORS.cyan, data: values, format: v => v.toFixed(3) + " MPa" }],
        yMin: mode.yMin, yMax: mode.yMax, yTicks: 5, height: 272, smooth: true,
        xTickEvery: mode.xTick,
        band: mode.key === "ms" ? { from: 120, to: 128, tone: "amber", label: "异常波形" } : (mode.key === "s" ? { from: 38, to: 43, tone: "amber", label: "压力突变" } : null),
        tip: i => tipHTML((mode.key === "ms" ? i + " ms" : "第 " + (i + 1) + " 个采样点"), [
          { name: "压力", color: COLORS.cyan, value: values[i].toFixed(3) + " MPa" }
        ])
      });
    }

    root.querySelectorAll("#anaTabs button").forEach(btn => {
      btn.addEventListener("click", () => {
        mode = modes.find(m => m.key === btn.getAttribute("data-mode"));
        draw();
      });
    });
    draw();
  }
};

/* =========================================================
 * 流量分析
 * ========================================================= */
Pages.flowAnalysis = {
  render() {
    const rows = Data.flow.months.map(m => ({
      attrs: 'class="clickable" data-month="' + m.month + '"',
      cells: [
        '<span class="mono">' + m.month + "</span>", '<span class="mono">' + m.total + "</span>",
        '<span class="mono">' + m.avg + "</span>", '<span class="mono">' + m.peak + "</span>",
        '<span class="mono">' + m.yoy + "</span>", statusHTML(m.status)
      ]
    }));
    return '<div class="stat-grid">' +
      statCard({ label: "今日流量", value: "18,642", unit: "m³", note: '较昨日 <b class="up">+3.1%</b>' }) +
      statCard({ label: "日均流量", value: "17,980", unit: "m³", note: "近 30 天" }) +
      statCard({ label: "峰值流量", value: "142", unit: "m³/h", note: '12:30 · <b class="warn">用水高峰</b>' }) +
      statCard({ label: "夜间最小流量", value: "76", unit: "m³/h", note: '<b class="cyan">漏损参考</b>' }) +
      "</div>" +
      panel({
        title: '日流量趋势 <span class="panel-sub" id="flowRangeLabel">近 30 天</span>',
        actions: '<div class="seg" id="flowRange"><button data-range="7">近7天</button><button data-range="30" class="active">近30天</button><button data-range="90">近90天</button></div>',
        body: '<div class="chart-host" id="flowChart" style="height:270px"></div>'
      }) +
      panel({
        title: "月度流量统计",
        actions: '<span class="panel-sub">2026-06 至 2026-09</span>',
        body: dataTable(["月份", "总流量", "日均流量", "峰值流量", "同比", "状态"], rows)
      });
  },
  mount(root) {
    function labels90() {
      const start = new Date(2026, 6, 3);
      const arr = [];
      for (let i = 0; i < 90; i++) {
        const d = new Date(start.getTime() + i * 86400000);
        arr.push((d.getMonth() + 1) + "/" + d.getDate());
      }
      return arr;
    }
    function render(range) {
      let labels;
      let values;
      let tick;
      if (range === "7") {
        labels = Data.flow.labels30.slice(-7);
        values = Data.flow.values30.slice(-7);
        tick = 1;
      } else if (range === "90") {
        labels = labels90();
        values = buildSeries(90, 17800, 1400, 77).map(v => Math.round(v + 900));
        tick = 15;
      } else {
        labels = Data.flow.labels30;
        values = Data.flow.values30;
        tick = 5;
      }
      root.querySelector("#flowRangeLabel").textContent = "近 " + (range === "7" ? 7 : range === "90" ? 90 : 30) + " 天";
      Charts.line(root.querySelector("#flowChart"), {
        labels: labels,
        series: [{ name: "日流量", color: COLORS.cyan, data: values, area: true, format: v => Charts.fmtNum(v) + " m³" }],
        yMin: 0, yMax: 20000, yTicks: 8, height: 270,
        xTickEvery: tick, endDot: true,
        yFormat: v => (v === 0 ? "0" : (v / 1000) + "k"),
        tip: i => tipHTML(labels[i] + " 日流量", [{ name: "总流量", color: COLORS.cyan, value: Charts.fmtNum(values[i]) + " m³" }])
      });
    }
    root.querySelectorAll("#flowRange button").forEach(btn => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("#flowRange button").forEach(b => b.classList.toggle("active", b === btn));
        render(btn.getAttribute("data-range"));
      });
    });
    root.querySelectorAll("[data-month]").forEach(row => {
      row.addEventListener("click", () => {
        const m = Data.flow.months.find(x => x.month === row.getAttribute("data-month"));
        UI.drawer({
          eyebrow: "月度流量 · " + m.month,
          title: m.total,
          sub: "日均 " + m.avg + " · 峰值 " + m.peak,
          body: '<div class="kv-grid">' +
            '<div class="kv"><span class="k">总流量</span><span class="v big">' + m.total + "</span></div>" +
            '<div class="kv"><span class="k">日均流量</span><span class="v">' + m.avg + "</span></div>" +
            '<div class="kv"><span class="k">峰值流量</span><span class="v">' + m.peak + "</span></div>" +
            '<div class="kv"><span class="k">同比</span><span class="v">' + m.yoy + "</span></div>" +
            '<div class="kv"><span class="k">状态</span><span class="v">' + statusHTML(m.status) + "</span></div>" +
            "</div>" +
            '<div class="section-label">分析结论</div>' +
            '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">' + (m.status === "偏高"
              ? "本月日均流量较近三个月均值高 5.6%，与高温天气及绿化用水增加相关，建议持续关注夜间最小流量变化。"
              : "本月流量处于合理区间，夜间最小流量平稳，暂未发现明显漏损趋势。") + "</p>",
          footer: '<button class="btn" data-close>关闭</button>',
          onMount(el) { el.querySelector("[data-close]").addEventListener("click", UI.closeDrawer); }
        });
      });
    });
    render("30");
  }
};

/* =========================================================
 * 水锤分析
 * ========================================================= */
function hammerTableHTML(selected) {
  const rows = Data.hammer.events.map(e => ({
    attrs: 'class="clickable' + (e.id === selected ? " selected" : "") + '" data-hammer="' + e.id + '"',
    cells: [
      '<span class="mono">' + e.id + "</span>",
      '<span class="mono">' + e.time + "</span>",
      e.pipe,
      '<span class="mono">' + e.peak.toFixed(2) + " MPa</span>",
      '<span class="mono">' + e.rate.toFixed(2) + " MPa/s</span>",
      '<span class="mono">' + e.duration.toFixed(1) + " s</span>",
      levelHTML(e.level),
      statusHTML(e.status)
    ]
  }));
  return dataTable(["事件编号", "发生时间", "管段", "峰值压力", "升压速率", "持续时间", "等级", "状态"], rows);
}

Pages.hammer = {
  render() {
    const h = Data.hammer;
    return '<div class="stat-grid">' +
      statCard({ label: "今日水锤事件", value: "7", note: '较昨日 <b class="down">+2</b>' }) +
      statCard({ label: "最大压力峰值", value: "1.42", unit: "MPa", note: '<b class="warn">超预警 0.22 MPa</b>' }) +
      statCard({ label: "超限管段", value: "2", note: "预警值 1.20 MPa" }) +
      statCard({ label: "在线阀室", value: "6", note: '关阀事件 <b class="cyan">4 起</b>' }) +
      "</div>" +
      '<div class="grid split-a">' +
      panel({
        title: '水锤波形捕捉 <span class="panel-sub" id="hmSub">WH-0924-01 · 09:21:08</span>',
        actions: legend([{ color: COLORS.cyan, name: "压力波形" }, { color: COLORS.amber, name: "承压预警" }]) +
          '<select class="select" id="hmEvent" style="width:186px">' +
          h.events.map(e => '<option value="' + e.id + '">' + e.id + " · " + e.time.slice(0, 8) + "</option>").join("") + "</select>",
        body: '<div class="chart-host" id="hmChart" style="height:272px"></div>'
      }) +
      panel({
        title: "事件特征分析",
        actions: '<span id="hmRisk">' + levelHTML(h.events[0].level) + "</span>",
        body: '<div id="hmFeatures"></div>'
      }) +
      "</div>" +
      panel({
        title: "水锤事件记录",
        actions: '<span class="panel-sub">近 24 小时 · 点击查看</span>',
        body: '<div id="hmTableHost">' + hammerTableHTML(h.events[0].id) + "</div>"
      });
  },
  mount(root) {
    const h = Data.hammer;
    let current = h.events[0];

    function featureHTML(e) {
      return '<div class="kv-grid">' +
        '<div class="kv"><span class="k">峰值压力</span><span class="v big">' + e.peak.toFixed(2) + " MPa</span></div>" +
        '<div class="kv"><span class="k">稳态压力</span><span class="v">' + e.base.toFixed(2) + " MPa</span></div>" +
        '<div class="kv"><span class="k">升压速率</span><span class="v">' + e.rate.toFixed(2) + " MPa/s</span></div>" +
        '<div class="kv"><span class="k">持续时间</span><span class="v">' + e.duration.toFixed(1) + " s</span></div>" +
        '<div class="kv"><span class="k">关阀时间</span><span class="v">' + e.close.toFixed(1) + " s</span></div>" +
        '<div class="kv"><span class="k">风险等级</span><span class="v">' + levelHTML(e.level) + "</span></div>" +
        "</div>" +
        '<div class="section-label">风险研判</div>' +
        '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">' + e.advice + "</p>";
    }

    function markRow() {
      root.querySelectorAll("[data-hammer]").forEach(tr =>
        tr.classList.toggle("selected", tr.getAttribute("data-hammer") === current.id));
    }
    function bindTable() {
      root.querySelectorAll("[data-hammer]").forEach(tr =>
        tr.addEventListener("click", () => openEvent(tr.getAttribute("data-hammer"))));
    }
    function renderTable() {
      root.querySelector("#hmTableHost").innerHTML = hammerTableHTML(current.id);
      bindTable();
    }

    function draw() {
      const e = current;
      root.querySelector("#hmSub").textContent = e.id + " · " + e.time;
      root.querySelector("#hmEvent").value = e.id;
      root.querySelector("#hmRisk").innerHTML = levelHTML(e.level);
      root.querySelector("#hmFeatures").innerHTML = featureHTML(e);

      const labels = e.series.map((_, i) => i + " ms");
      Charts.line(root.querySelector("#hmChart"), {
        labels: labels,
        series: [
          { name: "压力波形", color: COLORS.cyan, data: e.series, format: v => v.toFixed(3) + " MPa" },
          { name: "承压预警值", color: COLORS.amber, data: labels.map(() => h.threshold), dash: "5 4", thin: true, format: v => v.toFixed(2) + " MPa" }
        ],
        yMin: 0.2, yMax: 1.6, yTicks: 7, height: 272, smooth: true, xTickEvery: 15,
        band: { from: 26, to: 34, tone: "amber", label: "峰值区间" },
        tip: i => tipHTML(labels[i], [
          { name: "压力", color: COLORS.cyan, value: e.series[i].toFixed(3) + " MPa" },
          { name: "承压预警", color: COLORS.amber, value: h.threshold.toFixed(2) + " MPa" }
        ])
      });
      markRow();
    }

    function selectEvent(id) {
      const e = h.events.find(x => x.id === id);
      if (!e) return;
      current = e;
      draw();
    }

    function openEvent(id) {
      const e = h.events.find(x => x.id === id);
      if (!e) return;
      const pending = e.status === "待确认";
      const timeline = pending
        ? [{ t: e.time.slice(0, 8), c: "高频压力传感器捕捉到 " + e.peak.toFixed(2) + " MPa 压力尖峰" }, { t: "09:21:10", c: "系统判定为水锤事件，已推送告警并通知阀室责任人" }, { t: "09:24:16", c: "等待运维人员现场复核" }]
        : [{ t: e.time.slice(0, 8), c: "捕捉到压力尖峰 " + e.peak.toFixed(2) + " MPa，超过预警值" }, { t: "10:02:30", c: "现场复核阀门关闭程序，完成参数调整" }, { t: "10:40:18", c: "复测峰值回落至安全区间，事件闭环" }];
      UI.drawer({
        eyebrow: "水锤事件 · " + e.id,
        title: e.pipe,
        sub: e.time + " · " + e.valve + " · " + statusHTML(e.status),
        body: '<div class="kv-grid">' +
          '<div class="kv"><span class="k">峰值压力</span><span class="v big">' + e.peak.toFixed(2) + " MPa</span></div>" +
          '<div class="kv"><span class="k">稳态压力</span><span class="v">' + e.base.toFixed(2) + " MPa</span></div>" +
          '<div class="kv"><span class="k">升压速率</span><span class="v">' + e.rate.toFixed(2) + " MPa/s</span></div>" +
          '<div class="kv"><span class="k">持续时间</span><span class="v">' + e.duration.toFixed(1) + " s</span></div>" +
          '<div class="kv"><span class="k">关阀时间</span><span class="v">' + e.close.toFixed(1) + " s</span></div>" +
          '<div class="kv"><span class="k">风险等级</span><span class="v">' + levelHTML(e.level) + "</span></div>" +
          "</div>" +
          '<div class="section-label">事件说明</div>' +
          '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">' + e.desc + "</p>" +
          '<div class="section-label">处置建议</div>' +
          '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">' + e.advice + "</p>" +
          '<div class="section-label">流转记录</div>' +
          '<div class="timeline">' +
          timeline.map(t => '<div class="tl-item"><div class="tl-t">' + t.t + '</div><div class="tl-c">' + t.c + "</div></div>").join("") +
          "</div>",
        footer: '<button class="btn" data-hm="close">关闭</button>' +
          (pending ? '<button class="btn primary" data-hm="confirm">确认处置</button>' : "") +
          '<button class="btn ' + (pending ? "" : "primary") + '" data-hm="locate">定位波形</button>',
        onMount(el) {
          el.querySelectorAll("[data-hm]").forEach(btn => btn.addEventListener("click", () => {
            const act = btn.getAttribute("data-hm");
            if (act === "confirm") {
              e.status = "已处置";
              UI.toast("水锤事件 " + e.id + " 已确认处置", "ok");
              UI.closeDrawer();
              renderTable();
            } else if (act === "locate") {
              selectEvent(e.id);
              UI.closeDrawer();
              UI.toast("已定位 " + e.id + " 的毫秒级波形", "ok");
            } else UI.closeDrawer();
          }));
        }
      });
    }

    root.querySelector("#hmEvent").addEventListener("change", ev => selectEvent(ev.target.value));
    bindTable();
    draw();
  }
};
/* =========================================================
 * 噪声分析
 * ========================================================= */
Pages.noise = {
  render() {
    const pts = Data.noise.points;
    const rows = pts.map(p => ({
      attrs: 'class="clickable' + (p.id === "N-01" ? " selected" : "") + '" data-noise="' + p.id + '"',
      cells: [
        '<span class="mono">' + p.id + "</span>",
        p.zone,
        '<span class="muted">' + p.type + "</span>",
        '<span class="mono">' + p.value + " dB</span>",
        '<span class="mono">' + p.dayAvg + " dB</span>",
        '<span class="mono">' + p.nightAvg + " dB</span>",
        statusHTML(p.status)
      ]
    }));
    return '<div class="stat-grid">' +
      statCard({ label: "平均噪声", value: "45", unit: "dB", note: '较昨日 <b class="up">-1.2 dB</b>' }) +
      statCard({ label: "昼间均值", value: "52", unit: "dB", note: '标准 ≤ 55 dB · <b class="up">达标</b>' }) +
      statCard({ label: "夜间均值", value: "46", unit: "dB", note: '标准 ≤ 45 dB · <b class="warn">超标 1 dB</b>' }) +
      statCard({ label: "超标点位", value: "2", note: '<b class="warn">N-03 主干道 / N-05 施工</b>' }) +
      "</div>" +
      '<div class="grid split-a">' +
      panel({
        title: '24 小时噪声趋势 <span class="panel-sub" id="noiseSub">N-01 · A区·住宅</span>',
        actions: legend([{ color: COLORS.cyan, name: "实测" }, { color: COLORS.amber, name: "昼间限值" }, { color: COLORS.purple, name: "夜间限值" }]) +
          '<select class="select" id="noisePoint" style="width:156px">' +
          pts.map(p => '<option value="' + p.id + '">' + p.id + " · " + p.zone + "</option>").join("") + "</select>",
        body: '<div class="chart-host" id="noiseChart" style="height:250px"></div>'
      }) +
      panel({
        title: "噪声来源分布",
        actions: '<span class="panel-sub">近 7 天 · 128 起</span>',
        body: '<div class="chart-host" id="noiseDonut" style="height:250px"></div>'
      }) +
      "</div>" +
      panel({
        title: "噪声监测点明细",
        actions: '<span class="panel-sub">6 个监测点 · 数据更新 09:24:16</span>',
        body: dataTable(["点位", "区域", "类型", "实时值", "昼间均值", "夜间均值", "状态"], rows)
      });
  },
  mount(root) {
    const pts = Data.noise.points;
    const lim = Data.noise.limits;
    let current = pts[0];

    function drawChart() {
      root.querySelector("#noiseSub").textContent = current.id + " · " + current.zone;
      root.querySelector("#noisePoint").value = current.id;
      Charts.line(root.querySelector("#noiseChart"), {
        labels: HOUR_LABELS,
        series: [
          { name: "实测噪声", color: COLORS.cyan, data: current.series, area: true, format: v => v + " dB" },
          { name: "昼间限值", color: COLORS.amber, data: HOUR_LABELS.map(() => lim.day), dash: "5 4", thin: true, format: v => v + " dB" },
          { name: "夜间限值", color: COLORS.purple, data: HOUR_LABELS.map(() => lim.night), dash: "2 3", thin: true, format: v => v + " dB" }
        ],
        yMin: 30, yMax: 70, yTicks: 4, height: 250, xTickEvery: 2,
        band: { from: 0, to: 6, tone: "night", label: "夜间时段" },
        tip: i => tipHTML(HOUR_LABELS[i], [
          { name: "实测噪声", color: COLORS.cyan, value: current.series[i] + " dB" },
          { name: "昼间限值", color: COLORS.amber, value: lim.day + " dB" },
          { name: "夜间限值", color: COLORS.purple, value: lim.night + " dB" }
        ])
      });
    }
    function markRow() {
      root.querySelectorAll("[data-noise]").forEach(tr =>
        tr.classList.toggle("selected", tr.getAttribute("data-noise") === current.id));
    }
    function selectPoint(id) {
      const p = pts.find(x => x.id === id);
      if (!p) return;
      current = p;
      drawChart(); markRow();
    }
    function openPoint(id) {
      const p = pts.find(x => x.id === id);
      if (!p) return;
      const over = p.status === "超标";
      const timeline = over
        ? [{ t: "22:40", c: "交通与施工噪声叠加，夜间等效声级达到 58 dB" }, { t: "23:10", c: "现场巡查确认，要求施工方 22:00 后停止高噪声作业" }, { t: "08:30", c: "复测 " + p.value + " dB，仍高于昼间限值，持续跟踪" }]
        : p.status === "偏高"
          ? [{ t: "07:30", c: "早高峰车流增大，短时达到 " + (p.value + 6) + " dB" }, { t: "21:00", c: "夜间恢复平稳，" + p.nightAvg + " dB" }]
          : [{ t: "07:00", c: "昼间巡检正常，" + p.dayAvg + " dB" }, { t: "22:00", c: "夜间监测正常，" + p.nightAvg + " dB" }];
      const advice = over
        ? "建议核查周边施工与交通组织，夜间 22:00 后限制高噪声作业，并将监测频次加密至每小时一次。"
        : p.status === "偏高"
          ? "建议关注早晚高峰车流噪声，必要时增设声屏障或调整监测点位。"
          : "当前噪声水平符合 GB 3096 声环境功能区标准，维持常规监测频次。";
      UI.drawer({
        eyebrow: "噪声监测点 · " + p.id,
        title: p.zone,
        sub: p.type + " · 实时 " + p.value + " dB(A)",
        body: '<div class="kv-grid">' +
          '<div class="kv"><span class="k">点位编号</span><span class="v">' + p.id + "</span></div>" +
          '<div class="kv"><span class="k">设备类型</span><span class="v">' + p.type + "</span></div>" +
          '<div class="kv"><span class="k">实时噪声</span><span class="v">' + p.value + " dB(A)</span></div>" +
          '<div class="kv"><span class="k">昼间均值</span><span class="v">' + p.dayAvg + " dB（限值 " + lim.day + "）</span></div>" +
          '<div class="kv"><span class="k">夜间均值</span><span class="v">' + p.nightAvg + " dB（限值 " + lim.night + "）</span></div>" +
          '<div class="kv"><span class="k">当前状态</span><span class="v">' + statusHTML(p.status) + "</span></div>" +
          "</div>" +
          '<div class="section-label">超标时段（近 24 小时）</div>' +
          '<div class="timeline">' +
          timeline.map(t => '<div class="tl-item"><div class="tl-t">' + t.t + '</div><div class="tl-c">' + t.c + "</div></div>").join("") +
          "</div>" +
          '<div class="section-label">处置建议</div>' +
          '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">' + advice + "</p>",
        footer: '<button class="btn" data-n="close">关闭</button><button class="btn primary" data-n="trend">查看 24 小时趋势</button>',
        onMount(el) {
          el.querySelectorAll("[data-n]").forEach(btn => btn.addEventListener("click", () => {
            const act = btn.getAttribute("data-n");
            UI.closeDrawer();
            if (act === "trend") {
              selectPoint(p.id);
              UI.toast("已切换至 " + p.id + " 的 24 小时噪声趋势", "ok");
            }
          }));
        }
      });
    }

    root.querySelector("#noisePoint").addEventListener("change", e => selectPoint(e.target.value));
    root.querySelectorAll("[data-noise]").forEach(tr =>
      tr.addEventListener("click", () => openPoint(tr.getAttribute("data-noise"))));

    Charts.donut(root.querySelector("#noiseDonut"), {
      data: Data.noise.sources,
      centerValue: "100%",
      centerLabel: "来源占比",
      height: 250,
      tipTitle: "噪声来源占比",
      tipUnit: "%"
    });
    drawChart();
  }
};

/* =========================================================
 * 告警规则配置
 * ========================================================= */
function rulesTableHTML() {
  const rows = Data.alertRules.rules.map((r, i) => ({
    attrs: 'class="clickable" data-rule="' + i + '"',
    cells: [
      '<span class="strong">' + r.name + "</span>",
      r.scope,
      '<span class="muted">' + r.device + "</span>",
      '<span class="mono">' + r.cond + "</span>",
      levelHTML(r.level),
      statusHTML(r.status)
    ]
  }));
  return dataTable(["规则名称", "适用区域", "设备类型", "触发条件", "等级", "状态"], rows);
}
function pmsTableHTML() {
  const rows = Data.alertRules.pms.map((p, i) => ({
    attrs: 'class="clickable" data-pms="' + i + '"',
    cells: [
      '<span class="mono">' + p.no + "</span>",
      '<span class="mono">' + p.alert + "</span>",
      '<span class="mono">' + p.time + "</span>",
      statusHTML(p.status)
    ]
  }));
  return dataTable(["工单号", "告警", "派发时间", "状态"], rows);
}

Pages.alertRules = {
  render() {
    const r = Data.alertRules;
    const options = list => list.map(v => '<option value="' + v + '">' + v + "</option>").join("");
    const formRow = (label, control) => '<div class="form-row"><label>' + label + "</label>" + control + "</div>";
    return '<div class="grid split-even">' +
      panel({
        title: "告警规则配置",
        body: '<div class="form-rows">' +
          formRow("管网区域", '<select class="select" id="ruleZone">' + options(r.zones) + "</select>") +
          formRow("设备类型", '<select class="select" id="ruleDevice">' + options(r.devices) + "</select>") +
          formRow("告警等级", '<select class="select" id="ruleLevel">' + options(r.levels) + "</select>") +
          formRow("触发条件", '<input class="input" id="ruleCond" value="' + r.defaults.cond + '" />') +
          formRow("通知策略", '<select class="select" id="ruleNotify">' + options(r.notify) + "</select>") +
          formRow("联动工单", '<select class="select" id="ruleTicket">' + options(r.tickets) + "</select>") +
          "</div>",
        foot: '<div class="form-actions"><button class="btn" id="ruleReset">重置</button><button class="btn primary" id="ruleSave">保存规则</button></div>'
      }) +
      panel({
        title: "告警联动处置（PMS 工单）",
        actions: '<span class="panel-sub">近 5 条派发记录</span>',
        body: '<div id="pmsHost">' + pmsTableHTML() + "</div>"
      }) +
      "</div>" +
      panel({
        title: "规则列表",
        actions: '<span class="panel-sub" id="rulesCount">共 ' + r.rules.length + " 条规则</span>",
        body: '<div id="rulesHost">' + rulesTableHTML() + "</div>"
      });
  },
  mount(root) {
    const r = Data.alertRules;

    function bindRules() {
      root.querySelectorAll("[data-rule]").forEach(tr =>
        tr.addEventListener("click", () => openRule(+tr.getAttribute("data-rule"))));
    }
    function renderRules() {
      root.querySelector("#rulesHost").innerHTML = rulesTableHTML();
      root.querySelector("#rulesCount").textContent = "共 " + r.rules.length + " 条规则";
      bindRules();
    }
    function bindPms() {
      root.querySelectorAll("[data-pms]").forEach(tr =>
        tr.addEventListener("click", () => openPms(+tr.getAttribute("data-pms"))));
    }
    function renderPms() {
      root.querySelector("#pmsHost").innerHTML = pmsTableHTML();
      bindPms();
    }

    function openRule(i) {
      const rule = r.rules[i];
      if (!rule) return;
      UI.drawer({
        eyebrow: "告警规则 · " + rule.name,
        title: rule.name,
        sub: rule.scope + " · " + rule.device,
        body: '<div class="kv-grid">' +
          '<div class="kv"><span class="k">适用区域</span><span class="v">' + rule.scope + "</span></div>" +
          '<div class="kv"><span class="k">设备类型</span><span class="v">' + rule.device + "</span></div>" +
          '<div class="kv"><span class="k">触发条件</span><span class="v">' + rule.cond + "</span></div>" +
          '<div class="kv"><span class="k">告警等级</span><span class="v">' + levelHTML(rule.level) + "</span></div>" +
          '<div class="kv"><span class="k">通知策略</span><span class="v">' + r.defaults.notify + "</span></div>" +
          '<div class="kv"><span class="k">联动工单</span><span class="v">' + r.defaults.ticket + "</span></div>" +
          "</div>" +
          '<div class="section-label">规则状态</div>' +
          '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">当前规则' +
          (rule.status === "启用" ? "已启用，命中触发条件后将按通知策略推送，并自动派发至 PMS。" : "已停用，不会产生新的告警与工单。") +
          "</p>",
        footer: '<button class="btn" data-r="close">关闭</button>' +
          '<button class="btn ' + (rule.status === "启用" ? "danger" : "primary") + '" data-r="toggle">' +
          (rule.status === "启用" ? "停用规则" : "启用规则") + "</button>",
        onMount(el) {
          el.querySelectorAll("[data-r]").forEach(btn => btn.addEventListener("click", () => {
            if (btn.getAttribute("data-r") === "toggle") {
              rule.status = rule.status === "启用" ? "停用" : "启用";
              UI.toast("规则「" + rule.name + "」已" + rule.status, "ok");
              UI.closeDrawer();
              renderRules();
            } else UI.closeDrawer();
          }));
        }
      });
    }

    function openPms(i) {
      const order = r.pms[i];
      if (!order) return;
      const timeline = order.status === "失败重发"
        ? [{ t: order.time, c: "PMS 接口调用超时，工单派发失败" }, { t: "08:22:31", c: "系统已进入自动重发队列，等待人工确认" }]
        : order.status === "处理中"
          ? [{ t: order.time, c: "工单已派发至 " + order.owner }, { t: "09:25:10", c: "运维人员接单，正在前往现场" }]
          : [{ t: order.time, c: "工单派发成功" }, { t: "09:20:02", c: "运维人员接单并到场" }, { t: "09:41:20", c: "处置完成，工单闭环" }];
      UI.drawer({
        eyebrow: "PMS 工单 · " + order.no,
        title: order.no,
        sub: "关联告警 " + order.alert + " · " + statusHTML(order.status),
        body: '<div class="kv-grid">' +
          '<div class="kv"><span class="k">工单号</span><span class="v">' + order.no + "</span></div>" +
          '<div class="kv"><span class="k">关联告警</span><span class="v">' + order.alert + "</span></div>" +
          '<div class="kv"><span class="k">派发时间</span><span class="v">' + order.time + "</span></div>" +
          '<div class="kv"><span class="k">接收单位</span><span class="v">' + order.owner + "</span></div>" +
          '<div class="kv"><span class="k">工单状态</span><span class="v">' + statusHTML(order.status) + "</span></div>" +
          "</div>" +
          '<div class="section-label">工单内容</div>' +
          '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">' + order.desc + "</p>" +
          '<div class="section-label">流转记录</div>' +
          '<div class="timeline">' +
          timeline.map(t => '<div class="tl-item"><div class="tl-t">' + t.t + '</div><div class="tl-c">' + t.c + "</div></div>").join("") +
          "</div>",
        footer: '<button class="btn" data-pm="close">关闭</button>' +
          (order.status === "失败重发" ? '<button class="btn primary" data-pm="retry">重新派发</button>' : ""),
        onMount(el) {
          el.querySelectorAll("[data-pm]").forEach(btn => btn.addEventListener("click", () => {
            if (btn.getAttribute("data-pm") === "retry") {
              order.status = "处理中";
              UI.toast("工单 " + order.no + " 已重新派发至 PMS", "ok");
              UI.closeDrawer();
              renderPms();
            } else UI.closeDrawer();
          }));
        }
      });
    }

    root.querySelector("#ruleDevice").addEventListener("change", e => {
      const cond = r.conditions[e.target.value];
      if (cond) root.querySelector("#ruleCond").value = cond;
    });
    root.querySelector("#ruleReset").addEventListener("click", () => {
      const d = r.defaults;
      root.querySelector("#ruleZone").value = d.zone;
      root.querySelector("#ruleDevice").value = d.device;
      root.querySelector("#ruleLevel").value = d.level;
      root.querySelector("#ruleNotify").value = d.notify;
      root.querySelector("#ruleTicket").value = d.ticket;
      root.querySelector("#ruleCond").value = d.cond;
      UI.toast("已恢复默认规则配置");
    });
    root.querySelector("#ruleSave").addEventListener("click", () => {
      const device = root.querySelector("#ruleDevice").value.split(" / ")[0];
      const cond = root.querySelector("#ruleCond").value.trim();
      if (!cond) { UI.toast("请填写触发条件", "warn"); return; }
      const names = { "压力计": "压力越限告警", "流量计": "流量异常告警", "液位计": "液位超限告警", "水质仪": "水质超标告警", "井盖": "井盖位移告警" };
      const scope = root.querySelector("#ruleZone").value.replace(/ \/ /g, "/");
      r.rules.unshift({
        name: (names[device] || "自定义告警规则") + "（自定义）",
        scope: scope,
        device: device,
        cond: cond,
        level: root.querySelector("#ruleLevel").value.split(" / ")[0],
        status: "启用"
      });
      renderRules();
      UI.toast("规则已保存并生效：" + scope + " · " + cond, "ok");
    });

    bindRules();
    bindPms();
  }
};

/* =========================================================
 * 组织架构管理
 * ========================================================= */
function orgTreeHTML() {
  const leaf = name => '<li><button class="tree-leaf" data-org-node="' + name + '">' + name + "</button></li>";
  return '<ul class="org-tree">' +
    '<li><span class="tree-label"><i></i>集团<span class="tree-meta">24 节点</span></span>' +
    "<ul>" +
    '<li><span class="tree-label dept"><i></i>华东事业部<span class="tree-meta">2 家公司</span></span><ul>' +
    leaf("上海项目公司") + leaf("杭州项目公司") + "</ul></li>" +
    '<li><span class="tree-label dept"><i></i>华南事业部<span class="tree-meta">2 家公司</span></span><ul>' +
    leaf("广州项目公司") + leaf("深圳项目公司") + "</ul></li>" +
    '<li><span class="tree-label dept"><i></i>西南事业部<span class="tree-meta">1 家公司</span></span><ul>' +
    leaf("成都项目公司") + "</ul></li>" +
    "</ul></li>" +
    "</ul>";
}
function permTableHTML(selected) {
  const rows = Data.org.permissions.map(p => ({
    attrs: 'class="clickable' + (p.org === selected ? " selected" : "") + '" data-perm="' + p.org + '"',
    cells: [p.org, p.scope, p.perm, statusHTML(p.status)]
  }));
  return dataTable(["组织", "管网数据范围", "权限", "状态"], rows);
}
function userTableHTML(selected) {
  const rows = Data.org.users.map(u => ({
    attrs: 'class="clickable' + (u.org === selected ? " selected" : "") + '" data-user="' + u.account + '"',
    cells: ['<span class="mono">' + u.account + "</span>", u.org, u.role, statusHTML(u.status)]
  }));
  return dataTable(["账号", "所属组织", "角色", "状态"], rows);
}

Pages.org = {
  render() {
    const s = Data.org.stats;
    return '<div class="stat-grid">' +
      statCard({ label: "组织节点", value: String(s.nodes), note: "三级架构" }) +
      statCard({ label: "项目公司", value: String(s.companies), note: "已接入" }) +
      statCard({ label: "用户账号", value: String(s.users), note: "在线 " + s.online }) +
      statCard({ label: "数据权限", value: "已隔离", note: "按组织划分数据范围" }) +
      "</div>" +
      '<div class="grid split-b">' +
      panel({
        title: "组织架构树",
        actions: '<span class="panel-sub">三级架构</span>',
        body: '<div id="orgTreeHost">' + orgTreeHTML() + "</div>",
        foot: '<div class="tree-tip">点击项目公司节点，可联动定位右侧数据权限与账号</div>'
      }) +
      '<div class="stack">' +
      panel({
        title: "数据权限配置",
        actions: '<span class="panel-sub">按组织隔离</span>',
        body: '<div id="permHost">' + permTableHTML(null) + "</div>"
      }) +
      panel({
        title: "用户与角色",
        actions: '<span class="panel-sub">共 186 个账号</span>',
        body: '<div id="userHost">' + userTableHTML(null) + "</div>"
      }) +
      "</div>" +
      "</div>";
  },
  mount(root) {
    let selectedOrg = null;

    function applySelection() {
      root.querySelectorAll(".tree-leaf").forEach(b =>
        b.classList.toggle("selected", b.getAttribute("data-org-node") === selectedOrg));
      root.querySelectorAll("[data-perm]").forEach(tr =>
        tr.classList.toggle("selected", tr.getAttribute("data-perm") === selectedOrg));
      root.querySelectorAll("[data-user]").forEach(tr =>
        tr.classList.toggle("selected", tr.children[1].textContent.trim() === selectedOrg));
    }
    function bindPerms() {
      root.querySelectorAll("[data-perm]").forEach(tr =>
        tr.addEventListener("click", () => openPerm(tr.getAttribute("data-perm"))));
    }
    function bindUsers() {
      root.querySelectorAll("[data-user]").forEach(tr =>
        tr.addEventListener("click", () => openUser(tr.getAttribute("data-user"))));
    }
    function renderPerms() {
      root.querySelector("#permHost").innerHTML = permTableHTML(selectedOrg);
      bindPerms(); applySelection();
    }
    function renderUsers() {
      root.querySelector("#userHost").innerHTML = userTableHTML(selectedOrg);
      bindUsers(); applySelection();
    }

    function openPerm(org) {
      const p = Data.org.permissions.find(x => x.org === org);
      if (!p) return;
      const active = p.status === "启用";
      UI.drawer({
        eyebrow: "数据权限 · " + p.org,
        title: p.org,
        sub: "管网数据范围 " + p.scope,
        body: '<div class="kv-grid">' +
          '<div class="kv"><span class="k">所属组织</span><span class="v">' + p.org + "</span></div>" +
          '<div class="kv"><span class="k">数据范围</span><span class="v">' + p.scope + "</span></div>" +
          '<div class="kv"><span class="k">权限级别</span><span class="v">' + p.perm + "</span></div>" +
          '<div class="kv"><span class="k">当前状态</span><span class="v">' + statusHTML(p.status) + "</span></div>" +
          "</div>" +
          '<div class="section-label">权限说明</div>' +
          '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">' +
          (p.perm === "读写" ? "该组织可查看并编辑授权范围内的管网、设备与告警数据。" : "该组织仅可查看授权范围内的数据，不能执行编辑与处置操作。") +
          "</p>",
        footer: '<button class="btn" data-po="close">关闭</button>' +
          (active
            ? '<button class="btn" data-po="perm">切换为' + (p.perm === "读写" ? "只读" : "读写") + '</button><button class="btn danger" data-po="status">停用</button>'
            : '<button class="btn primary" data-po="status">启用</button>'),
        onMount(el) {
          el.querySelectorAll("[data-po]").forEach(btn => btn.addEventListener("click", () => {
            const act = btn.getAttribute("data-po");
            if (act === "perm") {
              p.perm = p.perm === "读写" ? "只读" : "读写";
              UI.toast(p.org + " 数据权限已调整为 " + p.perm, "ok");
            } else if (act === "status") {
              p.status = p.status === "启用" ? "停用" : "启用";
              UI.toast(p.org + " 数据权限已" + p.status, p.status === "启用" ? "ok" : "warn");
            }
            UI.closeDrawer();
            renderPerms();
          }));
        }
      });
    }

    function openUser(account) {
      const u = Data.org.users.find(x => x.account === account);
      if (!u) return;
      const perm = Data.org.permissions.find(x => x.org === u.org);
      UI.drawer({
        eyebrow: "用户账号 · " + u.account,
        title: u.account,
        sub: u.org + " · " + u.role,
        body: '<div class="kv-grid">' +
          '<div class="kv"><span class="k">账号</span><span class="v">' + u.account + "</span></div>" +
          '<div class="kv"><span class="k">所属组织</span><span class="v">' + u.org + "</span></div>" +
          '<div class="kv"><span class="k">角色</span><span class="v">' + u.role + "</span></div>" +
          '<div class="kv"><span class="k">数据范围</span><span class="v">' + (perm ? perm.scope : "全部") + "</span></div>" +
          '<div class="kv"><span class="k">最近登录</span><span class="v">' + u.last + "</span></div>" +
          '<div class="kv"><span class="k">账号状态</span><span class="v">' + statusHTML(u.status) + "</span></div>" +
          "</div>" +
          '<div class="section-label">角色权限</div>' +
          '<p style="margin:0;font-size:12px;line-height:1.85;color:#a9c2d2;">' +
          (u.role === "系统管理员" ? "拥有全平台配置、组织管理与数据权限分配能力。"
            : u.role === "运维人员" ? "可查看并处置授权范围内的设备告警，执行远程配置与工单闭环。"
              : "仅可查看授权范围内的运行数据与报告，无编辑与处置权限。") +
          "</p>",
        footer: '<button class="btn" data-uo="close">关闭</button>' +
          '<button class="btn ' + (u.status === "启用" ? "danger" : "primary") + '" data-uo="status">' +
          (u.status === "启用" ? "停用账号" : "启用账号") + "</button>",
        onMount(el) {
          el.querySelectorAll("[data-uo]").forEach(btn => btn.addEventListener("click", () => {
            if (btn.getAttribute("data-uo") === "status") {
              u.status = u.status === "启用" ? "停用" : "启用";
              UI.toast("账号 " + u.account + " 已" + u.status, u.status === "启用" ? "ok" : "warn");
            }
            UI.closeDrawer();
            renderUsers();
          }));
        }
      });
    }

    root.querySelectorAll(".tree-leaf").forEach(b => b.addEventListener("click", () => {
      const org = b.getAttribute("data-org-node");
      selectedOrg = selectedOrg === org ? null : org;
      applySelection();
    }));

    bindPerms();
    bindUsers();
  }
};

/* =========================================================
 * 通用下载
 * ========================================================= */
function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 600);
}

