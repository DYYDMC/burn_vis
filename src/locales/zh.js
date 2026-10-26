// 简体中文 (Mandarin, Simplified Chinese).

export default {
  code: 'zh', flag: '🇨🇳', name: '中文', locale: 'zh-CN',
  strings: {
    title: '燃脂目标',
    language: '语言',
    date: (day, month) => `${month + 1}月${day}日`,
    kcal: n => `${n} 千卡`,
    minutes: n => `${n} 分钟`,

    goal: '目标',
    leftSub: kg => `千卡脂肪待融化 · ≈ ${kg} 公斤`,
    ahead: n => `领先计划 ${n} 千卡`,
    behind: n => `落后计划 ${n} 千卡`,
    daysLeft: '剩余天数',
    perDay: '千卡 / 天',
    burnedToday: '今日已燃烧',

    addPlaceholder: '+ 已燃烧千卡',
    addLabel: '手动添加已燃烧的千卡',
    meltIt: '融化它',
    added: n => `−${n} 千卡 🔥`,
    confirmBig: n => `确定手动添加今天燃烧的 ${n} 千卡吗？这比跑一场马拉松还多。`,

    synced: n => `已从 Apple 健康同步 ${n} 天`,
    syncEmpty: 'Apple 健康链接中没有可读取的日期',
    lastSynced: when => `Apple 健康上次同步：${when}`,
    syncSetup: '同步设置',
    notSynced: 'Apple 健康尚未同步',
    setUpSync: '设置同步',

    progress: '进度',
    legendBurned: '已燃烧（累计）',
    legendPace: '计划进度',
    legendProjection: '按你的平均值预测',
    legendGoal: '目标日期和千卡',
    chartLabel: '累计燃烧千卡与目标对比',
    chartGoal: (kcal, date) => `目标 · ${kcal} 千卡 · ${date}`,
    today: '今天',
    tipDay: n => `当天：<b>${n}</b> 千卡`,
    tipTotal: n => `累计：<b>${n}</b> 千卡`,
    tipNotYet: '尚未到达',
    tipPlan: n => `计划：${n} 千卡`,

    fatLabel: n => `剩余 ${n} 千卡脂肪`,
    allMelted: '全部融化！🎉',

    history: '历史记录',
    nothingLogged: '还没有记录',
    healthRow: 'Apple 健康 · 活动能量',
    byHand: '手动添加',
    deleteEntry: activity => `删除“${activity}”记录`,

    startDate: '开始日期',
    goalDate: '目标日期',
    goalKcal: '目标燃烧千卡',
    cancel: '取消',
    save: '保存',
    goalAfterStart: '目标日期必须晚于开始日期',

    'act.Walk': '步行', 'act.Run': '跑步', 'act.Cycling': '骑行', 'act.Gym': '健身', 'act.Swim': '游泳', 'act.Other': '其他',
    'chip.Walk': '步行', 'chip.Run': '跑步', 'chip.Cycling': '骑行', 'chip.Gym': '健身', 'chip.Swim': '游泳',
  },
};
