// English. The reference language: every other language file must have the same keys (checked in tests.html).

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default {
  code: 'en', flag: '🇬🇧', name: 'English', locale: 'en-GB',
  strings: {
    title: 'Burn Goal',
    language: 'Language',
    date: (day, month) => `${day} ${MON[month]}`,
    kcal: n => `${n} kcal`,
    minutes: n => `${n} min`,

    goal: 'Goal',
    leftSub: kg => `kcal of fat left to melt · ≈ ${kg} kg`,
    ahead: n => `${n} kcal ahead of pace`,
    behind: n => `${n} kcal behind pace`,
    daysLeft: 'days left',
    perDay: 'kcal / day',
    burnedToday: 'burned today',

    addPlaceholder: '+ kcal burned',
    addLabel: 'Add kcal burned by hand',
    meltIt: 'Melt it',
    added: n => `−${n} kcal 🔥`,
    confirmBig: n => `Add ${n} kcal burned today by hand? That's more than a marathon.`,

    synced: n => `Synced ${n} day${n === 1 ? '' : 's'} from Apple Health`,
    syncEmpty: 'Apple Health link had no readable days',
    lastSynced: when => `Apple Health last synced ${when}`,
    syncSetup: 'Sync setup',
    notSynced: 'Apple Health not synced yet',
    setUpSync: 'Set up sync',

    progress: 'Progress',
    legendBurned: 'Burned (cumulative)',
    legendPace: 'Planned pace',
    legendProjection: 'Projection at your average',
    legendGoal: 'Goal date & kcal',
    chartLabel: 'Cumulative kcal burned versus goal',
    chartGoal: (kcal, date) => `Goal · ${kcal} kcal · ${date}`,
    today: 'Today',
    tipDay: n => `That day: <b>${n}</b> kcal`,
    tipTotal: n => `Total: <b>${n}</b> kcal`,
    tipNotYet: 'Not yet',
    tipPlan: n => `Plan: ${n} kcal`,

    fatLabel: n => `${n} kcal of fat left`,
    allMelted: 'All melted! 🎉',

    history: 'History',
    nothingLogged: 'Nothing logged yet',
    healthRow: 'Apple Health · Active Energy',
    byHand: 'added by hand',
    deleteEntry: activity => `Delete ${activity} entry`,

    startDate: 'Start date',
    goalDate: 'Goal date',
    goalKcal: 'Goal kcal to burn',
    cancel: 'Cancel',
    save: 'Save',
    goalAfterStart: 'Goal date must be after the start date',

    // Stored activity names (history) and the quick-add chip wording
    'act.Walk': 'Walk', 'act.Run': 'Run', 'act.Cycling': 'Cycling', 'act.Gym': 'Gym', 'act.Swim': 'Swim', 'act.Other': 'Other',
    'chip.Walk': 'Walk', 'chip.Run': 'Run', 'chip.Cycling': 'Ride', 'chip.Gym': 'Gym', 'chip.Swim': 'Swim',
  },
};
