const GROUP_BY = ['day', 'week', 'month']
const DEFAULT_DAYS = 30
// Isang taon ng days; para mabasa pa ang chart
const MAX_PERIODS = 366

// String lang ang dates; sa math lang ginagawang UTC midnight
// para hindi magbago dahil sa timezone ng server
const toDate = value => new Date(`${value}T00:00:00Z`)
const toKey = date => date.toISOString().slice(0, 10)

const addDays = (value, days) => {
    const date = toDate(value)
    date.setUTCDate(date.getUTCDate() + days)
    return toKey(date)
}

// Reject ang 2026-13-01 at 2026-02-30 (nagro-roll over yan sa March 2)
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

const todayIn = timezone => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())

// Monday ang simula ng week, katulad ng $dateTrunc startOfWeek
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

// Nililista lahat ng period para may 0 ang walang order
exports.parseSalesRange = (query) => {
    const { groupBy = 'day', timezone = 'UTC' } = query

    if (!GROUP_BY.includes(groupBy)) {
        return { error: `groupBy must be one of: ${GROUP_BY.join(', ')}` }
    }
    if (!isValidTimezone(timezone)) {
        return { error: 'timezone must be a time zone name such as Asia/Manila' }
    }

    const endDate = query.endDate || todayIn(timezone)
    const startDate = query.startDate || (isValidDate(endDate) ? addDays(endDate, 1 - DEFAULT_DAYS) : endDate)

    for (const [name, value] of Object.entries({ startDate, endDate })) {
        if (!isValidDate(value)) return { error: `${name} must be a real date in YYYY-MM-DD format` }
    }
    if (startDate > endDate) {
        return { error: 'startDate cannot be after endDate' }
    }

    // key = _id sa aggregation; clamped sa range ang start/end para sa labels
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
