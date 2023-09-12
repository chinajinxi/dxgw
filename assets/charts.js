/* =========================================================
 * 轻量 SVG 图表引擎（无外部依赖）
 * 支持：折线 / 面积 / 双轴 / 柱状 / 环形 / 组合图
 * ========================================================= */
const Charts = (function () {
  const registry = [];
  let uid = 0;
  let tipEl = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function fmtNum(v, decimals) {
    if (typeof v !== "number" || !isFinite(v)) return "—";
    const d = decimals == null ? (Math.abs(v) < 10 ? 2 : 0) : decimals;
    return v.toFixed(d).replace(/\.0+$/, "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }
  function smoothPath(pts, tension) {
    if (!pts.length) return "";
    if (pts.length < 3) return pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
    const t = tension == null ? 0.16 : tension;
    const d = ["M" + pts[0][0] + " " + pts[0][1]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) * t;
      const c1y = p1[1] + (p2[1] - p0[1]) * t;
      const c2x = p2[0] - (p3[0] - p1[0]) * t;
      const c2y = p2[1] - (p3[1] - p1[1]) * t;
      d.push("C" + c1x + " " + c1y + " " + c2x + " " + c2y + " " + p2[0] + " " + p2[1]);
    }
    return d.join(" ");
  }
  function polyPath(pts) {
    return pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  }
  function pathFor(pts, smooth) {
    return smooth ? smoothPath(pts) : polyPath(pts);
  }

  /* ---------- 悬浮提示 ---------- */
  function ensureTip() {
    if (!tipEl) {
      tipEl = document.createElement("div");
      tipEl.className = "chart-tip";
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }
  function showTip(html, x, y) {
    const el = ensureTip();
    el.innerHTML = html;
    el.classList.add("show");
    const pad = 14;
    const rect = el.getBoundingClientRect();
    let left = x + pad;
    let top = y - rect.height - 8;
    if (left + rect.width > window.innerWidth - 10) left = x - rect.width - pad;
    if (left < 6) left = 6;
    if (top < 60) top = y + 16;
    el.style.left = left + "px";
    el.style.top = top + "px";
  }
  function hideTip() {
    if (tipEl) tipEl.classList.remove("show");
  }
  document.addEventListener("scroll", hideTip, true);

  function tipRows(rows) {
    return rows.map(r =>
      '<div class="t-row"><i style="background:' + r.color + '"></i><span>' + esc(r.name) + "</span><b>" + esc(r.value) + "</b></div>"
    ).join("");
  }

  function register(host, draw) {
    registry.push({ host, draw });
  }
  let resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      for (let i = registry.length - 1; i >= 0; i--) {
        const item = registry[i];
        if (!item.host.isConnected) { registry.splice(i, 1); continue; }
        if (item.host.clientWidth > 0) item.draw();
      }
    }, 160);
  });

  /* ---------- 折线图 ---------- */
  function line(host, cfg) {
    if (!host) return;
    function draw() {
      const w = Math.max(280, Math.round(host.clientWidth || 600));
      const h = cfg.height || Math.max(200, host.clientHeight || 260);
      const labels = cfg.labels || [];
      const n = labels.length;
      if (!n) { host.innerHTML = ""; return; }

      const pad = {
        l: cfg.padLeft != null ? cfg.padLeft : 44,
        r: cfg.padRight != null ? cfg.padRight : (cfg.rightAxis ? 40 : 16),
        t: cfg.padTop != null ? cfg.padTop : 16,
        b: cfg.padBottom != null ? cfg.padBottom : 28
      };
      const iw = w - pad.l - pad.r;
      const ih = h - pad.t - pad.b;
      const yMin = cfg.yMin != null ? cfg.yMin : 0;
      const yMax = cfg.yMax != null ? cfg.yMax : 100;
      const yTicks = cfg.yTicks || 5;
      const smooth = cfg.smooth !== false;
      const X = i => pad.l + (n === 1 ? iw / 2 : (i * iw) / (n - 1));
      const Y = (v, s) => {
        const mn = s && s.scale ? s.scale.min : yMin;
        const mx = s && s.scale ? s.scale.max : yMax;
        return pad.t + ih - ((v - mn) / (mx - mn || 1)) * ih;
      };
      const series = (cfg.series || []).filter(s => s.data && s.data.length);
      let out = '<svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" role="img">';

      /* 渐变 */
      out += "<defs>";
      series.forEach(s => {
        if (s.area) {
          s._gid = "cg-" + (++uid);
          out += '<linearGradient id="' + s._gid + '" x1="0" x2="0" y1="0" y2="1">' +
            '<stop offset="0%" stop-color="' + s.color + '" stop-opacity="0.30"/>' +
            '<stop offset="100%" stop-color="' + s.color + '" stop-opacity="0.01"/>' +
            "</linearGradient>";
        }
      });
      out += "</defs>";

      /* 横向网格 + 左轴 */
      for (let i = 0; i <= yTicks; i++) {
        const val = yMin + ((yMax - yMin) * i) / yTicks;
        const y = Y(val);
        out += '<line class="chart-grid-line" x1="' + pad.l + '" y1="' + y + '" x2="' + (w - pad.r) + '" y2="' + y + '"/>';
        const lab = cfg.yFormat ? cfg.yFormat(val) : fmtNum(val, cfg.decimals);
        out += '<text class="chart-axis-label" x="' + (pad.l - 9) + '" y="' + (y + 3.4) + '" text-anchor="end">' + esc(lab) + "</text>";
      }

      /* 右轴 */
      if (cfg.rightAxis) {
        const ra = cfg.rightAxis;
        const rticks = ra.ticks || 5;
        for (let i = 0; i <= rticks; i++) {
          const val = ra.min + ((ra.max - ra.min) * i) / rticks;
          const y = pad.t + ih - (i / rticks) * ih;
          const lab = ra.format ? ra.format(val) : fmtNum(val, 1);
          out += '<text class="chart-axis-label right" x="' + (w - pad.r + 8) + '" y="' + (y + 3.4) + '" text-anchor="start">' + esc(lab) + "</text>";
        }
      }

      /* X 轴标签 */
      const step = cfg.xTickEvery || Math.max(1, Math.ceil(n / 8));
      for (let i = 0; i < n; i++) {
        if (i % step !== 0 && i !== n - 1) continue;
        if (n > 40 && i === n - 1 && (n - 1) % step !== 0) continue;
        const lab = cfg.xFormat ? cfg.xFormat(i) : labels[i];
        const anchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
        out += '<text class="chart-axis-label" x="' + X(i) + '" y="' + (h - 9) + '" text-anchor="' + anchor + '">' + esc(lab) + "</text>";
      }

      /* 标注区间 */
      if (cfg.band) {
        const x1 = X(cfg.band.from);
        const x2 = X(Math.min(cfg.band.to, n - 1));
        out += '<rect class="chart-band ' + (cfg.band.tone || "") + '" x="' + x1 + '" y="' + pad.t + '" width="' + Math.max(2, x2 - x1) + '" height="' + ih + '" rx="2"/>';
        if (cfg.band.label) {
          out += '<text class="chart-band-label ' + (cfg.band.tone || "") + '" x="' + (x1 + (x2 - x1) / 2) + '" y="' + (pad.t + 12) + '" text-anchor="middle">' + esc(cfg.band.label) + "</text>";
        }
      }

      /* 数据线 */
      series.forEach(s => {
        const pts = s.data.map((v, i) => [X(i), Y(v, s)]);
        if (!pts.length) return;
        if (s.area) {
          const base = pad.t + ih;
          out += '<path d="' + pathFor(pts, smooth) + " L" + pts[pts.length - 1][0] + " " + base + " L" + pts[0][0] + " " + base + ' Z" fill="url(#' + s._gid + ')" opacity=".9"/>';
        }
        out += '<path class="chart-line' + (s.thin ? " thin" : "") + '" d="' + pathFor(pts, smooth) + '" stroke="' + s.color + '"' +
          (s.dash ? ' stroke-dasharray="' + s.dash + '"' : "") + "/>";
        if (cfg.endDot) {
          const last = pts[pts.length - 1];
          out += '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="3" fill="' + s.color + '" stroke="#0b1a26" stroke-width="1.5"/>';
        }
      });

      /* 悬浮层 */
      out += '<g class="hover-group" style="display:none">';
      out += '<line class="chart-hover-guide" x1="0" y1="' + pad.t + '" x2="0" y2="' + (pad.t + ih) + '"/>';
      series.forEach(s => {
        out += '<circle r="3.2" fill="' + s.color + '" stroke="#08161f" stroke-width="1.4"/>';
      });
      out += "</g>";
      out += '<rect class="hover-capture" x="' + pad.l + '" y="' + pad.t + '" width="' + iw + '" height="' + ih + '" fill="transparent" style="cursor:crosshair"/>';
      out += "</svg>";
      host.innerHTML = out;

      const svg = host.querySelector("svg");
      const capture = host.querySelector(".hover-capture");
      const hg = host.querySelector(".hover-group");
      const guide = host.querySelector(".chart-hover-guide");
      const dots = hg ? Array.from(hg.querySelectorAll("circle")) : [];
      let activeIndex = -1;

      function onMove(ev) {
        const rect = svg.getBoundingClientRect();
        if (!rect.width) return;
        const scale = w / rect.width;
        const px = (ev.clientX - rect.left) * scale;
        const ratio = (px - pad.l) / (iw || 1);
        const idx = Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))));
        const gx = X(idx);
        hg.style.display = "";
        guide.setAttribute("x1", gx);
        guide.setAttribute("x2", gx);
        dots.forEach((d, di) => {
          const s = series[di];
          const v = s.data[idx];
          if (v == null) { d.style.display = "none"; return; }
          d.style.display = "";
          d.setAttribute("cx", gx);
          d.setAttribute("cy", Y(v, s));
        });
        let html;
        if (cfg.tip) {
          html = cfg.tip(idx);
        } else {
          html = '<div class="t-h">' + esc(cfg.tipTitle ? cfg.tipTitle(idx) : labels[idx]) + "</div>" +
            tipRows(series.map(s => ({
              name: s.name,
              color: s.color,
              value: s.format ? s.format(s.data[idx]) : fmtNum(s.data[idx], cfg.decimals)
            })));
        }
        showTip(html, ev.clientX, ev.clientY);
        activeIndex = idx;
        if (cfg.onHover) cfg.onHover(idx);
      }
      capture.addEventListener("mousemove", onMove);
      capture.addEventListener("mouseleave", function () {
        hg.style.display = "none";
        hideTip();
        activeIndex = -1;
        if (cfg.onHover) cfg.onHover(-1);
      });
      if (cfg.onClick) {
        capture.addEventListener("click", function () {
          if (activeIndex >= 0) cfg.onClick(activeIndex);
        });
      }
      host._chartMeta = { activeIndex: activeIndex };
    }
    draw();
    register(host, draw);
  }

  /* ---------- 柱状图 ---------- */
  function bars(host, cfg) {
    if (!host) return;
    function draw() {
      const w = Math.max(260, Math.round(host.clientWidth || 500));
      const h = cfg.height || Math.max(180, host.clientHeight || 240);
      const labels = cfg.labels || [];
      const values = cfg.values || [];
      const n = values.length;
      if (!n) { host.innerHTML = ""; return; }
      const pad = { l: cfg.padLeft != null ? cfg.padLeft : 38, r: 14, t: 14, b: 26 };
      const iw = w - pad.l - pad.r;
      const ih = h - pad.t - pad.b;
      const yMin = cfg.yMin != null ? cfg.yMin : 0;
      const yMax = cfg.yMax != null ? cfg.yMax : Math.max.apply(null, values) * 1.18;
      const yTicks = cfg.yTicks || 5;
      const slot = iw / n;
      const barW = Math.min(cfg.barWidth || 26, slot * 0.56);
      const Y = v => pad.t + ih - ((v - yMin) / (yMax - yMin || 1)) * ih;
      let out = '<svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '">';
      for (let i = 0; i <= yTicks; i++) {
        const val = yMin + ((yMax - yMin) * i) / yTicks;
        const y = Y(val);
        out += '<line class="chart-grid-line" x1="' + pad.l + '" y1="' + y + '" x2="' + (w - pad.r) + '" y2="' + y + '"/>';
        out += '<text class="chart-axis-label" x="' + (pad.l - 8) + '" y="' + (y + 3.4) + '" text-anchor="end">' + fmtNum(val, 0) + "</text>";
      }
      values.forEach((v, i) => {
        const cx = pad.l + slot * i + slot / 2;
        const y = Y(v);
        const bh = pad.t + ih - y;
        const color = cfg.colors ? (typeof cfg.colors === "function" ? cfg.colors(i, v) : cfg.colors[i]) : COLORS.cyan;
        out += '<rect class="chart-bar" data-i="' + i + '" x="' + (cx - barW / 2) + '" y="' + y + '" width="' + barW + '" height="' + Math.max(2, bh) + '" rx="2.5" fill="' + color + '"' +
          (cfg.barOpacity ? ' fill-opacity="' + cfg.barOpacity + '"' : "") + "/>";
        if (cfg.highlightIndex === i) {
          out += '<rect x="' + (cx - barW / 2 - 2) + '" y="' + (y - 2) + '" width="' + (barW + 4) + '" height="' + (Math.max(2, bh) + 4) + '" rx="3" fill="none" stroke="' + color + '" stroke-opacity=".4"/>';
        }
        out += '<text class="chart-axis-label" x="' + cx + '" y="' + (h - 8) + '" text-anchor="middle">' + esc(labels[i]) + "</text>";
      });
      out += "</svg>";
      host.innerHTML = out;

      host.querySelectorAll(".chart-bar").forEach(rect => {
        rect.addEventListener("mousemove", ev => {
          const i = +rect.getAttribute("data-i");
          const val = values[i];
          const html = '<div class="t-h">' + esc(cfg.tipTitle ? cfg.tipTitle(i) : labels[i]) + "</div>" +
            tipRows([{ name: cfg.name || "数值", color: rect.getAttribute("fill"), value: (cfg.format ? cfg.format(val) : fmtNum(val, cfg.decimals)) }]);
          showTip(html, ev.clientX, ev.clientY);
          if (cfg.onHover) cfg.onHover(i);
        });
        rect.addEventListener("mouseleave", () => { hideTip(); if (cfg.onHover) cfg.onHover(-1); });
        if (cfg.onClick) {
          rect.addEventListener("click", () => cfg.onClick(+rect.getAttribute("data-i")));
        }
      });
    }
    draw();
    register(host, draw);
  }

  /* ---------- 环形图 ---------- */
  function donut(host, cfg) {
    if (!host) return;
    function draw() {
      const w = Math.max(260, Math.round(host.clientWidth || 360));
      const h = cfg.height || Math.max(200, host.clientHeight || 240);
      const data = (cfg.data || []).filter(d => d.value > 0);
      const total = data.reduce((a, d) => a + d.value, 0) || 1;
      const cx = w / 2;
      const cy = h / 2 + 4;
      const rOuter = Math.min(cfg.radius || 76, h * 0.34, w * 0.26);
      const rInner = rOuter * 0.64;
      const gap = 0.02;
      let angle = -Math.PI / 2;
      let out = '<svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '">';

      function arc(a0, a1, ro, ri) {
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const p = (a, r) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
        const o0 = p(a0, ro), o1 = p(a1, ro), i1 = p(a1, ri), i0 = p(a0, ri);
        return "M" + o0[0] + " " + o0[1] + "A" + ro + " " + ro + " 0 " + large + " 1 " + o1[0] + " " + o1[1] +
          "L" + i1[0] + " " + i1[1] + "A" + ri + " " + ri + " 0 " + large + " 0 " + i0[0] + " " + i0[1] + "Z";
      }

      data.forEach((d, i) => {
        const span = (d.value / total) * Math.PI * 2;
        const a0 = angle + gap / 2;
        const a1 = angle + span - gap / 2;
        angle += span;
        out += '<path class="donut-seg" data-i="' + i + '" d="' + arc(a0, a1, rOuter, rInner) + '" fill="' + d.color + '" style="transition:opacity .15s;cursor:pointer"/>';

        const mid = (a0 + a1) / 2;
        const lr = rOuter + 26;
        const lx = cx + lr * Math.cos(mid);
        const ly = cy + lr * Math.sin(mid);
        const cos = Math.cos(mid);
        const anchor = cos > 0.18 ? "start" : cos < -0.18 ? "end" : "middle";
        const pct = Math.round((d.value / total) * 100);
        out += '<text x="' + lx + '" y="' + (ly - 2) + '" text-anchor="' + anchor + '" class="chart-axis-label" style="fill:#aac5d5;font-size:11px;">' + esc(d.name) + "</text>";
        out += '<text x="' + lx + '" y="' + (ly + 11) + '" text-anchor="' + anchor + '" class="chart-axis-label" style="fill:#6f8b9d;font-size:10px;">' + pct + "%</text>";
      });

      out += '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" fill="#f1fbff" style="font-size:22px;font-weight:600;font-family:inherit;">' + esc(cfg.centerValue != null ? cfg.centerValue : total) + "</text>";
      out += '<text x="' + cx + '" y="' + (cy + 17) + '" text-anchor="middle" class="chart-axis-label" style="font-size:10px;">' + esc(cfg.centerLabel || "总计") + "</text>";
      out += "</svg>";
      host.innerHTML = out;

      host.querySelectorAll(".donut-seg").forEach(seg => {
        const idx = +seg.getAttribute("data-i");
        const d = data[idx];
        seg.addEventListener("mousemove", ev => {
          seg.style.opacity = "0.82";
          const pct = ((d.value / total) * 100).toFixed(1);
          showTip('<div class="t-h">' + esc(cfg.tipTitle || "告警类型占比") + '</div>' + tipRows([{ name: d.name, color: d.color, value: d.value + (cfg.tipUnit == null ? " 起" : cfg.tipUnit) + " · " + pct + "%" }]), ev.clientX, ev.clientY);
          if (cfg.onHover) cfg.onHover(idx);
        });
        seg.addEventListener("mouseleave", () => {
          seg.style.opacity = "";
          hideTip();
          if (cfg.onHover) cfg.onHover(-1);
        });
        if (cfg.onClick) seg.addEventListener("click", () => cfg.onClick(idx));
      });
    }
    draw();
    register(host, draw);
  }

  /* ---------- 组合图（柱 + 线） ---------- */
  function combo(host, cfg) {
    if (!host) return;
    function draw() {
      const w = Math.max(300, Math.round(host.clientWidth || 700));
      const h = cfg.height || Math.max(200, host.clientHeight || 250);
      const labels = cfg.labels || [];
      const barData = cfg.bars || [];
      const lineData = cfg.line || [];
      const n = labels.length;
      if (!n) { host.innerHTML = ""; return; }
      const pad = { l: 44, r: 18, t: 18, b: 26 };
      const iw = w - pad.l - pad.r;
      const ih = h - pad.t - pad.b;
      const yMin = cfg.yMin != null ? cfg.yMin : 0;
      const yMax = cfg.yMax != null ? cfg.yMax : 100;
      const yTicks = cfg.yTicks || 5;
      const slot = iw / n;
      const barW = Math.min(cfg.barWidth || 28, slot * 0.5);
      const Y = v => pad.t + ih - ((v - yMin) / (yMax - yMin || 1)) * ih;
      const X = i => pad.l + slot * i + slot / 2;
      let out = '<svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '">';
      out += '<defs><linearGradient id="cg-' + (++uid) + '" x1="0" x2="0" y1="0" y2="1">' +
        '<stop offset="0%" stop-color="' + (cfg.barColor || "#1d7c92") + '" stop-opacity=".85"/>' +
        '<stop offset="100%" stop-color="' + (cfg.barColor || "#1d7c92") + '" stop-opacity=".25"/></linearGradient></defs>';
      const gradId = "cg-" + uid;
      for (let i = 0; i <= yTicks; i++) {
        const val = yMin + ((yMax - yMin) * i) / yTicks;
        const y = Y(val);
        out += '<line class="chart-grid-line" x1="' + pad.l + '" y1="' + y + '" x2="' + (w - pad.r) + '" y2="' + y + '"/>';
        out += '<text class="chart-axis-label" x="' + (pad.l - 9) + '" y="' + (y + 3.4) + '" text-anchor="end">' + fmtNum(val, 0) + "</text>";
      }
      labels.forEach((lab, i) => {
        out += '<text class="chart-axis-label" x="' + X(i) + '" y="' + (h - 8) + '" text-anchor="middle">' + esc(lab) + "</text>";
        const v = barData[i] || 0;
        const y = Y(v);
        out += '<rect class="chart-bar" data-i="' + i + '" x="' + (X(i) - barW / 2) + '" y="' + y + '" width="' + barW + '" height="' + Math.max(2, pad.t + ih - y) + '" rx="2" fill="url(#' + gradId + ')"/>';
      });
      const pts = lineData.map((v, i) => [X(i), Y(v)]);
      out += '<path class="chart-line" d="' + smoothPath(pts) + '" stroke="' + (cfg.lineColor || COLORS.green) + '"/>';
      out += '<g class="hover-group" style="display:none"><line class="chart-hover-guide" x1="0" y1="' + pad.t + '" x2="0" y2="' + (pad.t + ih) + '"/>' +
        '<circle r="3.2" fill="' + (cfg.lineColor || COLORS.green) + '" stroke="#08161f" stroke-width="1.4"/></g>';
      out += '<rect class="hover-capture" x="' + pad.l + '" y="' + pad.t + '" width="' + iw + '" height="' + ih + '" fill="transparent" style="cursor:crosshair"/>';
      out += "</svg>";
      host.innerHTML = out;

      const svg = host.querySelector("svg");
      const hg = host.querySelector(".hover-group");
      const guide = host.querySelector(".chart-hover-guide");
      const dot = hg.querySelector("circle");
      host.querySelector(".hover-capture").addEventListener("mousemove", ev => {
        const rect = svg.getBoundingClientRect();
        if (!rect.width) return;
        const px = (ev.clientX - rect.left) * (w / rect.width);
        const idx = Math.max(0, Math.min(n - 1, Math.round((px - pad.l - slot / 2) / slot)));
        const gx = X(idx);
        hg.style.display = "";
        guide.setAttribute("x1", gx); guide.setAttribute("x2", gx);
        dot.setAttribute("cx", gx);
        dot.setAttribute("cy", Y(lineData[idx]));
        const html = '<div class="t-h">' + esc(labels[idx]) + "</div>" + tipRows([
          { name: cfg.barsName || "告警数", color: cfg.barColor || "#1d7c92", value: (barData[idx] || 0) + " 起" },
          { name: cfg.lineName || "安全评分", color: cfg.lineColor || COLORS.green, value: (lineData[idx] == null ? "—" : lineData[idx]) }
        ]);
        showTip(html, ev.clientX, ev.clientY);
        if (cfg.onHover) cfg.onHover(idx);
      });
      host.querySelector(".hover-capture").addEventListener("mouseleave", () => {
        hg.style.display = "none";
        hideTip();
        if (cfg.onHover) cfg.onHover(-1);
      });
      if (cfg.onClick) {
        host.querySelector(".hover-capture").addEventListener("click", ev => {
          const rect = svg.getBoundingClientRect();
          const px = (ev.clientX - rect.left) * (w / rect.width);
          const idx = Math.max(0, Math.min(n - 1, Math.round((px - pad.l - slot / 2) / slot)));
          cfg.onClick(idx);
        });
      }
    }
    draw();
    register(host, draw);
  }

  return {
    line: line,
    bars: bars,
    donut: donut,
    combo: combo,
    showTip: showTip,
    hideTip: hideTip,
    fmtNum: fmtNum
  };
})();
