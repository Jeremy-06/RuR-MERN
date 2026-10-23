const GROUP_BY = ['day', 'week', 'month']
const DEFAULT_DAYS = 30
// One year of days; also keeps the chart readable
const MAX_PERIODS = 366

// Calendar dates stay 'YYYY-MM-DD' strings and are only turned into UTC midnights for math,
// so the server's own time zone never shifts them
const toDate = value => new Date(`${value}T00:00:00Z`)
const toKey = date => date.toISOString().slice(0, 10)

const addDays = (value, days) => {
    const date = toDate(value)
    date.setUTCDate(date.getUTCDate() + days)
    return toKey(date)
}

// Rejects 2026-13-01 and also 2026-02-30, which Date would roll over to March 2
const isValidDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = toDate(value)
    return !isNaN(date) && toKey(date) === value
}

const isValidTimezone = timezone => {
    if (typeof timezone !== 'string') return false
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone })
        return true
    } catch {
        return false
    }
}

// Today's date where the admin is, e.g. 2026-10-24 in Asia/Manila
const todayIn = timezone => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())

// First day of the day, week (Monday, like MongoDB's $dateTrunc with startOfWeek) or month a date is in
const periodStart = (value, groupBy) => {
    if (groupBy === 'week') return addDays(value, -((toDate(value).getUTCDay() + 6) % 7))
    if (groupBy === 'month') return `${value.slice(0, 8)}01`
    return value
}

const nextPeriod = (value, groupBy) => {
    if (groupBy === 'week') return addDays(value, 7)
    if (groupBy === 'month') {
        const date = toDate(value)
        date.setUTCMonth(date.getUTCMonth() + 1)
        return toKey(date)
    }
    return addDays(value, 1)
}

// Checks the sales query and lists every period in the range, so periods without orders can be shown as 0.
// Returns { error } or { startDate, endDate, groupBy, timezone, periods }
exports.parseSalesRange = (query) => {
    const { groupBy = 'day', timezone = 'UTC' } = query

    if (!GROUP_BY.includes(groupBy)) {
        return { error: `groupBy must be one of: ${GROUP_BY.join(', ')}` }
    }
    if (!isValidTimezone(timezone)) {
        return { error: 'timezone must be a time zone name such as Asia/Manila' }
    }

    // Without dates, show the last 30 days
    const endDate = query.endDate || todayIn(timezone)
    const startDate = query.startDate || (isValidDate(endDate) ? addDays(endDate, 1 - DEFAULT_DAYS) : endDate)

    for (const [name, value] of Object.entries({ startDate, endDate })) {
        if (!isValidDate(value)) return { error: `${name} must be a real date in YYYY-MM-DD format` }
    }
    if (startDate > endDate) {
        return { error: 'startDate cannot be after endDate' }
    }

    // key matches the _id the aggregation groups by; start/end are clamped to the range for labels
    const periods = []
    for (let key = periodStart(startDate, groupBy); key <= endDate; key = nextPeriod(key, groupBy)) {
        if (periods.length === MAX_PERIODS) {
            return { error: `The range has more than ${MAX_PERIODS} ${groupBy}s; pick a shorter range or a larger grouping` }
        }
        const lastDay = addDays(nextPeriod(key, groupBy), -1)
        periods.push({
            key,
            start: key < startDate ? startDate : key,
            end: lastDay > endDate ? endDate : lastDay,
        })
    }

    return { startDate, endDate, groupBy, timezone, periods }
}
