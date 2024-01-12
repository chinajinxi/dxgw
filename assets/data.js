/* =========================================================
 * 原型数据层（静态演示数据，按设计稿还原）
 * ========================================================= */
const COLORS = {
  cyan: "#2ed3e6",
  cyanDim: "#1b8fa0",
  green: "#37d399",
  amber: "#f5a623",
  red: "#ff6262",
  purple: "#a78bfa",
  blue: "#4ea8ff"
};

/* 可复现的伪随机，保证每次渲染数据一致 */
function seeded(seed) {
  let s = Math.floor(seed) % 233280;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildSeries(n, base, amp, seed, drift) {
  const rnd = seeded(seed);
  const out = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    const wave = Math.sin(i * 0.55 + seed * 0.01) * amp * 0.45;
    v = base + wave + (rnd() - 0.5) * amp * 0.7 + (drift ? (drift * i) : 0);
    out.push(Math.round(v * 1000) / 1000);
  }
  return out;
}

/* 水锤毫秒级波形：稳态 + 衰减振荡尖峰 */
function hammerWave(peak, base, seed) {
  const rnd = seeded(seed);
  return Array.from({ length: 120 }, (_, i) => {
    let v = base + (rnd() - 0.5) * 0.012;
    if (i >= 26) {
      const t = i - 26;
      v += (peak - base) * Math.exp(-t / 15) * Math.cos(t * 0.52);
    }
    return Math.round(Math.max(0.2, v) * 1000) / 1000;
  });
}

const DAY_LABELS = Array.from({ length: 30 }, (_, i) => "9/" + (i + 1));
const HOUR_LABELS = Array.from({ length: 25 }, (_, i) => i + "时");

const Data = {
  updatedAt: "2023-09-30 09:24:16",
  kpi: {
    orders: "1,286",
    alerts: "47",
    alertSites: "12",
    devices: "2,856",
    onlineRate: "97.3%"
  },

  /* ---------- 首页 ---------- */
  homeTrend: {
    labels: DAY_LABELS,
    values: [96, 118, 134, 146, 168, 162, 188, 171, 152, 141, 118, 96, 79, 61, 55, 68, 86, 101, 126, 148, 161, 153, 172, 191, 183, 150, 138, 117, 104, 91]
  },
  zonesTop: [
    { name: "A区", value: 40 },
    { name: "B区", value: 35 },
    { name: "C区", value: 27 },
    { name: "D区", value: 22 },
    { name: "E区", value: 17 },
    { name: "F区", value: 12 }
  ],
  homeMapNodes: [
    { id: "P-01", label: "P-01", x: 248, y: 268, color: COLORS.green, value: "0.42 MPa", status: "在线" },
    { id: "P-03", label: "P-03", x: 190, y: 386, color: COLORS.green, value: "0.39 MPa", status: "在线" },
    { id: "P-07", label: "P-07", x: 522, y: 208, color: COLORS.amber, value: "0.55 MPa", status: "预警" },
    { id: "P-09", label: "P-09", x: 452, y: 164, color: COLORS.green, value: "0.44 MPa", status: "在线" },
    { id: "P-05", label: "P-05", x: 606, y: 262, color: COLORS.green, value: "0.46 MPa", status: "在线" },
    { id: "A-12", label: "A-12", x: 762, y: 340, color: COLORS.red, value: "压力突变", status: "紧急告警", alertId: "A-1024" }
  ],

  /* ---------- 告警 ---------- */
  alerts: [
    {
      id: "A-1024", date: "09-30", day: "9/30", time: "09:24:16", site: "A区 泵房", zone: "A区",
      type: "压力突变", level: "紧急", status: "处置中", device: "P-01", value: "0.68 MPa",
      owner: "张工 · 管网运维一组",
      desc: "A区泵房出口压力在 30 秒内由 0.42 MPa 升至 0.68 MPa，超过紧急阈值 0.60 MPa，疑似水锤或阀门异常。",
      timeline: [
        { t: "09:24:16", c: "系统自动识别压力突变并生成紧急告警" },
        { t: "09:24:40", c: "已推送至当班运维人员（张工）" },
        { t: "09:26:02", c: "运维人员接单，开始远程核查" },
        { t: "09:31:18", c: "已调取泵房进出口压力波形，等待现场确认" }
      ]
    },
    {
      id: "A-1023", date: "09-30", day: "9/30", time: "09:18:02", site: "C区 管网", zone: "C区",
      type: "流量异常", level: "严重", status: "已处置", device: "F-08", value: "126 m³/h",
      owner: "李工 · 分区计量组",
      desc: "C区 DMA 分区夜间最小流量较基线升高 18%，存在漏损风险，已派单复核。",
      timeline: [
        { t: "09:18:02", c: "系统识别流量异常并生成告警" },
        { t: "09:20:31", c: "派发工单至分区计量组" },
        { t: "09:28:09", c: "现场复核完成，关闭误报阀门" },
        { t: "09:33:45", c: "告警处置完成，流量恢复基线" }
      ]
    },
    {
      id: "A-1022", date: "09-30", day: "9/30", time: "08:57:41", site: "B区 井盖", zone: "B区",
      type: "位移告警", level: "严重", status: "已处置", device: "D-06", value: "位移 32 mm",
      owner: "王工 · 巡查一组",
      desc: "B区井盖位移传感器触发，井盖偏移 32 mm，超过阈值 20 mm，存在安全隐患。",
      timeline: [
        { t: "08:57:41", c: "井盖位移传感器触发告警" },
        { t: "09:02:10", c: "巡查人员到达现场并设置警示" },
        { t: "09:12:55", c: "井盖复位完成，传感器读数归零" },
        { t: "09:15:20", c: "告警关闭" }
      ]
    },
    {
      id: "A-1021", date: "09-30", day: "9/30", time: "08:41:33", site: "D区 水质", zone: "D区",
      type: "浊度超标", level: "一般", status: "已处置", device: "W-31", value: "0.86 NTU",
      owner: "赵工 · 水质监测组",
      desc: "D区水质监测点浊度短时升至 0.86 NTU，超过预警值 0.80 NTU，持续约 6 分钟后回落。",
      timeline: [
        { t: "08:41:33", c: "浊度连续 3 个采样周期超标，触发告警" },
        { t: "08:44:12", c: "系统自动标记为短时波动" },
        { t: "08:47:33", c: "读数回落至 0.6 NTU，告警解除" }
      ]
    },
    {
      id: "A-1020", date: "09-30", day: "9/30", time: "08:22:10", site: "A区 噪声", zone: "A区",
      type: "漏水疑似", level: "一般", status: "已处置", device: "N-22", value: "46 dB",
      owner: "张工 · 管网运维一组",
      desc: "A区噪声监测点夜间噪声由 38 dB 升至 46 dB，频谱特征与漏水噪声相似。",
      timeline: [
        { t: "08:22:10", c: "噪声频谱识别为漏水疑似" },
        { t: "08:30:44", c: "联动漏水预警模型进行二次分析" },
        { t: "08:39:16", c: "复核为附近施工噪声，告警关闭" }
      ]
    },
    {
      id: "A-1019", date: "09-30", day: "9/30", time: "07:58:04", site: "E区 末端", zone: "E区",
      type: "压力偏低", level: "严重", status: "已处置", device: "P-12", value: "0.21 MPa",
      owner: "陈工 · 调度中心",
      desc: "E区管网末端压力持续低于 0.24 MPa 达 20 分钟，影响约 320 户居民用水。",
      timeline: [
        { t: "07:58:04", c: "末端压力持续偏低，触发严重告警" },
        { t: "08:01:20", c: "调度中心调整 A区泵站出水压力" },
        { t: "08:12:41", c: "末端压力恢复至 0.31 MPa" },
        { t: "08:16:05", c: "告警处置完成" }
      ]
    },
    {
      id: "A-1018", date: "09-29", day: "9/29", time: "22:14:36", site: "C区 支管", zone: "C区",
      type: "流量异常", level: "一般", status: "已处置", device: "F-08", value: "98 m³/h",
      owner: "李工 · 分区计量组",
      desc: "C区支管夜间流量波动异常，与历史基线偏差 12%，系统判定为一般告警。",
      timeline: [
        { t: "22:14:36", c: "夜间流量偏差超过 10%，触发告警" },
        { t: "22:31:08", c: "复核为绿化用水，已通知调度" }
      ]
    },
    {
      id: "A-1017", date: "09-29", day: "9/29", time: "20:03:19", site: "B区 泵站", zone: "B区",
      type: "水锤疑似", level: "紧急", status: "已处置", device: "P-07", value: "0.61 MPa",
      owner: "陈工 · 调度中心",
      desc: "B区泵站停机过程中出现水锤压力波动，峰值 0.61 MPa，已调整阀门关闭策略。",
      timeline: [
        { t: "20:03:19", c: "水锤模型识别瞬时压力冲击" },
        { t: "20:05:41", c: "调度中心介入，延长阀门关闭时间" },
        { t: "20:22:10", c: "压力波动恢复正常，告警关闭" }
      ]
    }
  ],

  /* ---------- 管网监测 ---------- */
  topology: [
    { id: "DTU", label: "DTU 网关", x: 450, y: 188, color: COLORS.cyan, kind: "gateway", status: "在线", zone: "全域" },
    { id: "T-01", label: "T-01", x: 450, y: 64, color: COLORS.green, status: "在线", zone: "A区", type: "压力计", value: "0.42 MPa" },
    { id: "T-02", label: "T-02", x: 612, y: 112, color: COLORS.green, status: "在线", zone: "B区", type: "流量计", value: "126 m³/h" },
    { id: "T-05", label: "T-05", x: 762, y: 188, color: COLORS.amber, status: "预警", zone: "C区", type: "液位计", value: "1.8 m" },
    { id: "T-03", label: "T-03", x: 630, y: 284, color: COLORS.green, status: "在线", zone: "D区", type: "水质仪", value: "0.6 NTU" },
    { id: "T-04", label: "T-04", x: 430, y: 306, color: COLORS.amber, status: "预警", zone: "E区", type: "噪声仪", value: "46 dB" },
    { id: "T-06", label: "T-06", x: 248, y: 262, color: COLORS.green, status: "在线", zone: "A区", type: "压力计", value: "0.39 MPa" },
    { id: "T-07", label: "T-07", x: 250, y: 118, color: COLORS.amber, status: "告警", zone: "C区", type: "液位计", value: "2.4 m" },
    { id: "T-08", label: "T-08", x: 120, y: 172, color: COLORS.green, status: "在线", zone: "F区", type: "井盖", value: "正常" }
  ],
  deviceAccess: [
    { id: "D-01", type: "压力计", status: "在线" },
    { id: "D-02", type: "流量计", status: "在线" },
    { id: "D-03", type: "噪声仪", status: "在线" },
    { id: "D-04", type: "液位计", status: "告警" },
    { id: "D-05", type: "水质仪", status: "在线" },
    { id: "D-06", type: "井盖", status: "在线" },
    { id: "D-07", type: "网关", status: "在线" }
  ],
  networkPoints: [
    { no: 1, id: "P-01", zone: "A区 给水干管", type: "压力计", value: "0.42 MPa", status: "在线" },
    { no: 2, id: "F-08", zone: "B区 排水管网", type: "流量计", value: "126 m³/h", status: "在线" },
    { no: 3, id: "L-15", zone: "C区 井内液位", type: "液位计", value: "1.8 m", status: "告警" },
    { no: 4, id: "N-22", zone: "A区 噪声监测", type: "噪声仪", value: "46 dB", status: "在线" },
    { no: 5, id: "W-31", zone: "D区 水质监测", type: "水质仪", value: "浊度 0.6 NTU", status: "在线" }
  ],

  /* ---------- 压力监测 ---------- */
  pressurePoints: [
    { id: "P-01", zone: "A区 给水干管", value: "0.42 MPa", avg: "0.41", peak: "0.48", status: "正常", color: COLORS.green },
    { id: "P-07", zone: "B区 支管", value: "0.55 MPa", avg: "0.53", peak: "0.61", status: "正常", color: COLORS.cyan },
    { id: "P-12", zone: "E区 末端", value: "0.22 MPa", avg: "0.24", peak: "0.30", status: "预警", color: COLORS.amber },
    { id: "P-15", zone: "C区 干管", value: "0.44 MPa", avg: "0.43", peak: "0.50", status: "正常", color: COLORS.blue },
    { id: "P-18", zone: "D区 支管", value: "0.39 MPa", avg: "0.40", peak: "0.46", status: "正常", color: COLORS.purple }
  ],

  /* ---------- 环境监测 ---------- */
  envPoints: {
    "E-01": { zone: "A区 给水干管", flow: 126, total: "18,642", volt: "3.62", level: "1.8", temp: "22.4", status: "正常", flowSeries: [86, 92, 88, 104, 118, 126, 121, 108, 96, 88, 76, 72, 68, 75, 82, 96, 104, 118, 132, 142, 138, 130, 124, 126] },
    "E-04": { zone: "B区 排水管网", flow: 98, total: "12,310", volt: "3.55", level: "1.2", temp: "21.8", status: "正常", flowSeries: [72, 76, 68, 82, 96, 90, 84, 78, 66, 60, 58, 62, 70, 78, 88, 96, 104, 98, 112, 108, 100, 96, 92, 98] },
    "E-07": { zone: "C区 井内液位", flow: 142, total: "20,118", volt: "3.48", level: "2.6", temp: "23.1", status: "预警", flowSeries: [110, 118, 108, 124, 136, 142, 138, 128, 118, 104, 96, 88, 84, 92, 104, 112, 126, 138, 148, 156, 150, 146, 140, 142] },
    "E-11": { zone: "D区 末端管网", flow: 76, total: "9,204", volt: "3.60", level: "0.9", temp: "21.2", status: "正常", flowSeries: [58, 62, 56, 64, 72, 76, 70, 66, 58, 52, 48, 46, 50, 56, 62, 68, 76, 84, 90, 88, 84, 80, 74, 76] }
  },
  envTable: [
    { id: "E-01", flow: "126 m³/h", total: "18,642 m³", volt: "3.62 V", level: "1.8 m", temp: "22.4 °C", status: "正常" },
    { id: "E-04", flow: "98 m³/h", total: "12,310 m³", volt: "3.55 V", level: "1.2 m", temp: "21.8 °C", status: "正常" },
    { id: "E-07", flow: "142 m³/h", total: "20,118 m³", volt: "3.48 V", level: "2.6 m", temp: "23.1 °C", status: "预警" },
    { id: "E-11", flow: "76 m³/h", total: "9,204 m³", volt: "3.60 V", level: "0.9 m", temp: "21.2 °C", status: "正常" }
  ],

  /* ---------- 安全报告 ---------- */
  reports: [
    {
      id: "daily-0930", name: "安全日报", period: "2023-09-30", status: "已生成",
      title: "安全日报（2023-09-30）", meta: "生成时间 2023-09-30 08:00 · 自动生成",
      sections: [
        { h: "一、今日安全概况", p: "截至 08:00，平台在线设备 2,856 台，在线率 97.3%。今日累计告警 12 起，其中紧急告警 1 起（A区泵房压力突变），已由运维一组接单处置。管网压力整体平稳，A区平均压力 0.42 MPa，E区末端压力偏低已恢复。" },
        { h: "二、重点风险与整改", p: "A区泵房压力突变，已完成远程核查，现场正在确认阀门状态。C区井盖位移告警已处置完毕，井盖复位并加装限位器。D区水质浊度短时波动，当前读数已回落至 0.6 NTU。" }
      ]
    },
    {
      id: "weekly-39", name: "安全周报", period: "第 39 周", status: "已生成",
      title: "安全周报（第 39 周）", meta: "统计周期 2023-09-22 至 2023-09-28 · 自动生成",
      sections: [
        { h: "一、本周总体态势", p: "本周累计告警 328 起，环比下降 3.6%，紧急告警 9 起，均已闭环。设备在线率维持在 97% 以上，平均无故障运行时间 26 天。压力与流量指标整体处于正常区间。" },
        { h: "二、重点风险与整改", p: "A区泵房压力突变 3 起，已更换 1 组止回阀并优化阀门关闭策略；C区 2 处井盖位移传感器完成灵敏度校准；B区夜间最小流量偏高，已纳入下周 DMA 分区排查计划。" }
      ]
    },
    {
      id: "monthly-09", name: "安全月报", period: "2023-09", status: "已生成",
      title: "安全月报（2023-09）", meta: "统计周期 2023-09-01 至 2023-09-30 · 自动生成",
      sections: [
        { h: "一、总体安全态势", p: "本月管网运行总体平稳，累计告警 1,286 起，环比下降 4.2%，紧急告警 5 起，均已闭环处置。设备在线率 97.3%，平均无故障运行时间 26 天。" },
        { h: "二、重点风险与整改", p: "A区泵房压力突变 2 起，已完成阀门检修与压力调节；C区井盖位移偏高，已加装位移限位器；D区水质浊度短时超标，已复核并恢复正常。" }
      ]
    },
    {
      id: "daily-0929", name: "安全日报", period: "2023-09-29", status: "已生成",
      title: "安全日报（2023-09-29）", meta: "生成时间 2023-09-29 08:00 · 自动生成",
      sections: [
        { h: "一、今日安全概况", p: "截至 08:00，平台在线设备 2,851 台，在线率 97.1%。昨日累计告警 15 起，紧急告警 1 起（B区泵站水锤疑似），已调整阀门关闭策略并复核完成。管网压力整体平稳。" },
        { h: "二、重点风险与整改", p: "B区泵站水锤压力峰值 0.61 MPa，已延长阀门关闭时间；E区末端压力短时偏低，调度中心调整泵站出水压力后恢复。" }
      ]
    },
    {
      id: "daily-0928", name: "安全日报", period: "2023-09-28", status: "已生成",
      title: "安全日报（2023-09-28）", meta: "生成时间 2023-09-28 08:00 · 自动生成",
      sections: [
        { h: "一、今日安全概况", p: "截至 08:00，平台在线设备 2,849 台，在线率 96.9%。昨日累计告警 11 起，均为一般告警，未发生紧急事件。A区、D区压力指标正常。" },
        { h: "二、重点风险与整改", p: "D区水质监测点浊度短时升高，已复核为取样管路扰动，读数恢复正常；C区支管夜间流量波动，已确认为绿化用水。" }
      ]
    }
  ],
  safetyTrend: {
    labels: ["10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月"],
    alerts: [42, 52, 57, 53, 51, 46, 41, 34, 31, 40, 48, 55],
    score: [74.6, 75.3, 74.2, 74.8, 73.7, 73.1, 73.4, 73.8, 74.4, 74.1, 74.7, 75.1]
  },

  /* ---------- 漏水预警 ---------- */
  leaks: [
    { id: "L-01", zone: "A区 给水干管", prob: 78, acc: "±1.5 m", status: "待复核", advice: "现场确认", x: 300, y: 186, color: COLORS.red },
    { id: "L-02", zone: "B区 支管", prob: 62, acc: "±2.1 m", status: "待复核", advice: "告警复核", x: 548, y: 108, color: COLORS.amber },
    { id: "L-03", zone: "D区 末端", prob: 45, acc: "±2.8 m", status: "观察", advice: "持续监测", x: 486, y: 268, color: COLORS.cyan },
    { id: "L-04", zone: "C区 干管", prob: 31, acc: "±3.2 m", status: "已排除", advice: "—", x: 176, y: 96, color: COLORS.green }
  ],
  leakMonitors: [
    { id: "M-01", x: 198, y: 268, color: COLORS.cyan },
    { id: "M-02", x: 408, y: 330, color: COLORS.cyan },
    { id: "M-03", x: 706, y: 178, color: COLORS.cyan },
    { id: "M-04", x: 636, y: 322, color: COLORS.cyan }
  ],
  leakAnalyze: {
    labels: Array.from({ length: 81 }, (_, i) => i + ""),
    pressure: (function () {
      const rnd = seeded(7);
      return Array.from({ length: 81 }, (_, i) => {
        let v = 0.41 + Math.sin(i * 0.5) * 0.012 + (rnd() - 0.5) * 0.012;
        if (i >= 45 && i <= 52) v += 0.06 - Math.abs(i - 48) * 0.005;
        return Math.round(v * 1000) / 1000;
      });
    })(),
    audio: (function () {
      const rnd = seeded(17);
      return Array.from({ length: 81 }, (_, i) => {
        let v = 0.07 + Math.sin(i * 0.8) * 0.008 + (rnd() - 0.5) * 0.008;
        if (i >= 45 && i <= 52) v += 0.018;
        return Math.round(v * 1000) / 1000;
      });
    })()
  },

  /* ---------- 信息管理 ---------- */
  infoDevices: [
    { id: "D-0101", name: "A区压力计", type: "压力计", net: "A区给水干管", status: "在线", battery: "3.62 V", signal: "-72 dBm" },
    { id: "D-0102", name: "B区流量计", type: "流量计", net: "B区排水分管", status: "在线", battery: "3.55 V", signal: "-78 dBm" },
    { id: "D-0103", name: "C区液位计", type: "液位计", net: "C区井内液位", status: "在线", battery: "3.48 V", signal: "-81 dBm" },
    { id: "D-0104", name: "A区噪声仪", type: "噪声仪", net: "A区管网", status: "告警", battery: "3.41 V", signal: "-90 dBm" },
    { id: "D-0105", name: "D区水质仪", type: "水质仪", net: "D区水质", status: "在线", battery: "3.60 V", signal: "-75 dBm" },
    { id: "D-0106", name: "B区井盖终端", type: "井盖", net: "B区井盖", status: "离线", battery: "2.96 V", signal: "—" }
  ],
  remoteCodes: [
    { key: "远程配置", code: "#2ce6a8", action: "config" },
    { key: "远程升级", code: "#2c3ae", action: "upgrade" },
    { key: "远程重启", code: "#f5a524", action: "reboot" },
    { key: "参数校准", code: "#2c3ae", action: "calibrate" },
    { key: "固件版本", code: "#a8c4dc", action: "firmware" },
    { key: "心跳状态", code: "#2ce6a8", action: "heartbeat" }
  ],
  pipeAssets: [
    { id: "PL-01", name: "A区给水干管", diameter: "DN300", length: "6.8 km", material: "球墨铸铁", status: "正常" },
    { id: "PL-02", name: "B区排水管网", diameter: "DN400", length: "5.2 km", material: "HDPE", status: "正常" },
    { id: "PL-03", name: "C区支管", diameter: "DN200", length: "3.6 km", material: "PE", status: "维护中" },
    { id: "PL-04", name: "D区末端管网", diameter: "DN150", length: "2.4 km", material: "钢塑复合", status: "正常" }
  ],

  /* ---------- 压力分析 ---------- */
  pressureAnalysis: {
    modes: [
      { key: "ms", name: "毫秒波形", freq: "1000", freqUnit: "Hz", freqNote: "毫秒级", peak: "0.68", peakNote: "09:24:16", fluct: "±0.06", fluctNote: "正常范围", abnormal: 2, title: "压力波形分析（毫秒波形）", unit: "ms", xTick: 40, yMin: 0.38, yMax: 0.45, points: 200, seed: 31 },
      { key: "s", name: "秒波形", freq: "1", freqUnit: "Hz", freqNote: "秒级", peak: "0.58", peakNote: "09:24:08", fluct: "±0.05", fluctNote: "正常范围", abnormal: 1, title: "压力波形分析（秒波形）", unit: "s", xTick: 10, yMin: 0.36, yMax: 0.62, points: 60, seed: 37 },
      { key: "min", name: "分钟波形", freq: "0.016", freqUnit: "Hz", freqNote: "分钟级", peak: "0.52", peakNote: "09:24", fluct: "±0.04", fluctNote: "正常范围", abnormal: 0, title: "压力波形分析（分钟波形）", unit: "min", xTick: 10, yMin: 0.38, yMax: 0.56, points: 60, seed: 41 },
      { key: "day", name: "日压力", freq: "24", freqUnit: "点/日", freqNote: "日均值", peak: "0.48", peakNote: "14:00", fluct: "±0.03", fluctNote: "平稳", abnormal: 0, title: "日压力变化（24 小时）", unit: "时", xTick: 3, yMin: 0.36, yMax: 0.50, points: 24, seed: 43 },
      { key: "month", name: "月压力", freq: "30", freqUnit: "点/月", freqNote: "日均值", peak: "0.46", peakNote: "9/18", fluct: "±0.02", fluctNote: "平稳", abnormal: 0, title: "月压力变化（近 30 天）", unit: "日", xTick: 5, yMin: 0.38, yMax: 0.48, points: 30, seed: 47 }
    ]
  },
  pressurePeriodRows: [
    { period: "00:00-06:00", avg: "0.41", peak: "0.46", low: "0.37", range: "0.09", status: "正常" },
    { period: "06:00-12:00", avg: "0.44", peak: "0.68", low: "0.39", range: "0.29", status: "异常" },
    { period: "12:00-18:00", avg: "0.43", peak: "0.49", low: "0.40", range: "0.09", status: "正常" },
    { period: "18:00-24:00", avg: "0.42", peak: "0.47", low: "0.38", range: "0.09", status: "正常" }
  ],

  /* ---------- 流量分析 ---------- */
  flow: {
    today: "18,642",
    daily: "17,980",
    peak: "142",
    night: "76",
    labels30: DAY_LABELS,
    values30: [17020, 17380, 17110, 17640, 17980, 17820, 18060, 18140, 17930, 17800, 17620, 17910, 18120, 17980, 18310, 18240, 18010, 17760, 17890, 18110, 17940, 17730, 17620, 17890, 18060, 18120, 18210, 18040, 18180, 18642],
    months: [
      { month: "2023-09", total: "539,400 m³", avg: "17,980 m³", peak: "142 m³/h", yoy: "+3.1%", status: "正常" },
      { month: "2023-08", total: "558,000 m³", avg: "18,000 m³", peak: "156 m³/h", yoy: "+1.2%", status: "正常" },
      { month: "2023-07", total: "612,000 m³", avg: "19,742 m³", peak: "168 m³/h", yoy: "+5.6%", status: "偏高" },
      { month: "2023-06", total: "570,000 m³", avg: "19,000 m³", peak: "158 m³/h", yoy: "+0.8%", status: "正常" }
    ]
  },

  /* ---------- 噪声分析 ---------- */
  noise: {
    limits: { day: 55, night: 45 },
    points: [
      { id: "N-01", zone: "A区·住宅", type: "声级计", value: 42, dayAvg: 49, nightAvg: 43, status: "正常",
        series: [43, 42, 41, 40, 40, 42, 47, 52, 50, 48, 47, 46, 46, 47, 46, 45, 47, 51, 54, 50, 47, 45, 44, 43, 42] },
      { id: "N-02", zone: "B区·商业", type: "声级计", value: 46, dayAvg: 52, nightAvg: 47, status: "偏高",
        series: [46, 45, 44, 44, 45, 47, 51, 56, 55, 53, 52, 51, 53, 52, 52, 51, 54, 58, 60, 56, 53, 50, 48, 47, 46] },
      { id: "N-03", zone: "C区·主干道", type: "声级计", value: 52, dayAvg: 59, nightAvg: 53, status: "超标",
        series: [52, 51, 50, 49, 50, 53, 58, 63, 62, 59, 57, 56, 57, 56, 56, 57, 60, 65, 68, 63, 59, 56, 54, 53, 52] },
      { id: "N-04", zone: "D区·学校", type: "声级计", value: 41, dayAvg: 47, nightAvg: 41, status: "正常",
        series: [42, 41, 40, 39, 40, 42, 46, 50, 49, 47, 46, 45, 45, 46, 45, 44, 46, 49, 51, 48, 45, 43, 42, 42, 41] },
      { id: "N-05", zone: "E区·施工", type: "声级计", value: 50, dayAvg: 61, nightAvg: 54, status: "超标",
        series: [53, 52, 51, 52, 54, 57, 62, 68, 67, 64, 61, 59, 60, 59, 58, 59, 62, 66, 69, 64, 60, 56, 54, 53, 51] },
      { id: "N-06", zone: "F区·公园", type: "声级计", value: 38, dayAvg: 43, nightAvg: 37, status: "正常",
        series: [38, 37, 37, 36, 36, 38, 41, 45, 44, 42, 41, 40, 40, 41, 40, 39, 41, 44, 46, 43, 41, 40, 39, 38, 38] }
    ],
    sources: [
      { name: "交通噪声", value: 36, color: COLORS.cyan },
      { name: "施工噪声", value: 27, color: COLORS.amber },
      { name: "生活噪声", value: 22, color: COLORS.purple },
      { name: "工业噪声", value: 15, color: COLORS.blue }
    ]
  },

  /* ---------- 告警规则配置 ---------- */
  alertRules: {
    zones: ["A区 / B区 / C区", "全域", "A区", "B区", "C区", "D区"],
    devices: ["压力计 / 流量计 / 液位计", "压力计", "流量计", "液位计", "水质仪", "井盖"],
    levels: ["紧急 / 重要 / 一般", "紧急", "重要", "一般"],
    notify: ["短信 + 站内 + 钉钉", "短信 + 站内", "站内 + 钉钉", "仅站内"],
    tickets: ["自动派发至 PMS", "人工创建工单", "不联动工单"],
    conditions: {
      "压力计": "压力 > 0.60 MPa",
      "流量计": "偏差 > 15%",
      "液位计": "液位 > 2.0 m",
      "水质仪": "浊度 > 1.0 NTU",
      "井盖": "位移 > 3 cm"
    },
    defaults: { zone: "A区 / B区 / C区", device: "压力计 / 流量计 / 液位计", level: "紧急 / 重要 / 一般", cond: "压力 > 0.60 MPa", notify: "短信 + 站内 + 钉钉", ticket: "自动派发至 PMS" },
    rules: [
      { name: "压力越限告警", scope: "A区/B区", device: "压力计", cond: "压力 > 0.60 MPa", level: "紧急", status: "启用" },
      { name: "流量异常告警", scope: "全域", device: "流量计", cond: "偏差 > 15%", level: "重要", status: "启用" },
      { name: "液位超限告警", scope: "C区/D区", device: "液位计", cond: "液位 > 2.0 m", level: "重要", status: "启用" },
      { name: "水质超标告警", scope: "D区", device: "水质仪", cond: "浊度 > 1.0 NTU", level: "一般", status: "启用" },
      { name: "井盖位移告警", scope: "全域", device: "井盖", cond: "位移 > 3 cm", level: "重要", status: "停用" }
    ],
    pms: [
      { no: "WO-2081", alert: "A-1024", time: "09:24:20", status: "处理中", owner: "上海项目公司 · 李工", desc: "A区泵房压力突变，已派发抢修班组现场核查。" },
      { no: "WO-2080", alert: "A-1023", time: "09:18:10", status: "已完结", owner: "上海项目公司 · 李工", desc: "C区管网流量异常，经排查为计量表漂移，已校准恢复。" },
      { no: "WO-2079", alert: "A-1022", time: "05:57:50", status: "已完结", owner: "杭州项目公司 · 周工", desc: "B区井盖位移告警，现场复核为井盖回弹，已复位并加固。" },
      { no: "WO-2078", alert: "A-1021", time: "08:41:40", status: "已完结", owner: "上海项目公司 · 陈工", desc: "D区浊度超标，管网冲洗后水质恢复正常。" },
      { no: "WO-2077", alert: "A-1020", time: "08:22:20", status: "失败重发", owner: "杭州项目公司 · 周工", desc: "E区噪声疑似漏水，PMS 接口超时导致派发失败，等待重发。" }
    ]
  },

  /* ---------- 组织架构管理 ---------- */
  org: {
    stats: { nodes: 24, companies: 6, users: 186, online: 92 },
    permissions: [
      { org: "上海项目公司", scope: "A区/市区", perm: "读写", status: "启用" },
      { org: "杭州项目公司", scope: "C区", perm: "读写", status: "启用" },
      { org: "广州项目公司", scope: "D区/A区", perm: "读写", status: "启用" },
      { org: "深圳项目公司", scope: "F区", perm: "只读", status: "启用" },
      { org: "成都项目公司", scope: "G区", perm: "只读", status: "停用" }
    ],
    users: [
      { account: "admin", org: "集团", role: "系统管理员", status: "启用", last: "09:21:04" },
      { account: "op_sh", org: "上海项目公司", role: "运维人员", status: "启用", last: "09:18:32" },
      { account: "op_hz", org: "杭州项目公司", role: "运维人员", status: "启用", last: "08:56:10" },
      { account: "view_gz", org: "广州项目公司", role: "查看人员", status: "启用", last: "2023-09-29 17:40" },
      { account: "op_cd", org: "成都项目公司", role: "运维人员", status: "停用", last: "2023-09-12 10:02" }
    ]
  },

  /* ---------- 水锤分析 ---------- */
  hammer: {
    threshold: 1.2,
    events: [
      {
        id: "WH-0924-01", time: "09:21:08.420", pipe: "A区 · DN600 供水干管", valve: "V-06 电动阀",
        peak: 1.42, base: 0.38, rate: 0.86, duration: 1.8, close: 0.8, level: "紧急", status: "待确认",
        desc: "A-12 阀室电动阀在 0.8 s 内快速关闭，产生 1.42 MPa 瞬时压力峰值，超过管段承压预警值 1.20 MPa。",
        advice: "建议复核阀门关闭程序，将关阀时间延长至 3 s 以上；同步对 A区 DN600 干管开展承压复核，必要时加装水锤消除器。",
        series: hammerWave(1.42, 0.38, 7)
      },
      {
        id: "WH-0924-02", time: "08:47:32.180", pipe: "C区 · DN400 支管", valve: "V-12 蝶阀",
        peak: 1.31, base: 0.42, rate: 0.62, duration: 1.2, close: 1.1, level: "重要", status: "已处置",
        desc: "C区支管蝶阀关闭过程中出现 1.31 MPa 压力峰值，升压速率 0.62 MPa/s，超过预警值 0.11 MPa。",
        advice: "已延长蝶阀关闭行程并加装缓冲装置，建议一周内复测该管段压力波动。",
        series: hammerWave(1.31, 0.42, 11)
      },
      {
        id: "WH-0923-07", time: "22:16:05.660", pipe: "B区 · DN500 干管", valve: "V-03 电动阀",
        peak: 1.18, base: 0.36, rate: 0.48, duration: 0.9, close: 1.4, level: "重要", status: "已处置",
        desc: "B区夜间切泵作业触发压力振荡，峰值 1.18 MPa，未超过承压预警值，但升压速率偏高。",
        advice: "建议优化切泵时序，采用变频软启停，避免夜间负荷低谷时段集中操作。",
        series: hammerWave(1.18, 0.36, 19)
      },
      {
        id: "WH-0923-04", time: "17:02:51.320", pipe: "D区 · DN300 支管", valve: "V-09 手动阀",
        peak: 1.09, base: 0.44, rate: 0.35, duration: 0.6, close: 2.0, level: "一般", status: "已关闭",
        desc: "D区手动阀例行操作产生轻微水锤，峰值 1.09 MPa，处于安全区间。",
        advice: "操作规范执行到位，无需处置；建议在阀门处张贴慢关操作提示。",
        series: hammerWave(1.09, 0.44, 29)
      },
      {
        id: "WH-0922-11", time: "11:38:20.900", pipe: "E区 · DN500 干管", valve: "V-15 电动阀",
        peak: 1.26, base: 0.4, rate: 0.71, duration: 1.5, close: 0.9, level: "重要", status: "已处置",
        desc: "E区电动阀联锁关闭产生 1.26 MPa 压力峰值，超过预警值 0.06 MPa，未造成管道破损。",
        advice: "已调整联锁关闭曲线并增设泄压阀，建议将同类阀门的关阀时间统一纳入配置核查。",
        series: hammerWave(1.26, 0.4, 37)
      }
    ]
  },

  /* ---------- 系统信息 ---------- */
  systemInfo: {
    version: "v2.3.1",
    update: "2023-09-28",
    user: "系统管理员",
    role: "超级管理员"
  }
};
