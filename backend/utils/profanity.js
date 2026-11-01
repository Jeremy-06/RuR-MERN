const { Filter } = require('bad-words')

// Malinis na salita na nasa listahan o nagiging bad word pag na-normalize
const CLEAN_WORDS = new Set([
    'knob', 'knobs', 'screw', 'screwing', 'flange', 'orifice', 'pawn', 'balls', 'god',
    'cox', 'hoar', 'perse', 'preteen', 'pule', 's hit',
    'sheet', 'booboo', 'tangga', 'titig',
])

// Hindi isinama ang mild words (bwisit, lintik, hayop, leche)
// kasi lumalabas din sa normal na reviews
const TAGALOG_WORDS = [
    'putangina', 'putang ina', 'puta', 'pota', 'potangina', 'putragis', 'punyeta',
    'tangina', 'tang ina', 'tanginamo', 'taena', 'tangna', 'kingina', 'kinginamo',
    'bwakanangina', 'bwakananginamo', 'puking ina', 'pakyu', 'pak yu', 'pakshet', 'shet',
    'gago', 'gaga', 'gagu', 'tanga', 'bobo', 'ulol', 'ulul', 'tarantado', 'tarantada',
    'kupal', 'siraulo', 'sira ulo', 'hinayupak', 'hindot', 'pokpok',
    'kantot', 'kantutan', 'iyot', 'jakol', 'salsal', 'tite', 'titi', 'burat', 'bayag',
    'puke', 'puki', 'pekpek', 'tamod', 'libog', 'malibog', 'tsupa', 'chupa',
]

// Stand-ins: g4g0 -> gago, $het -> shet
const LOOKALIKES = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' }

// GAGOOO -> gago. Tinatandaan ang pinanggalingan ng bawat letra para original ang ma-mask.
const normalize = text => {
    let normalized = ''
    const origin = []

    for (let i = 0; i < text.length; i++) {
        const lower = text[i].toLowerCase()
        const char = LOOKALIKES[lower] || lower[0]
        if (/[a-z]/.test(char) && char === normalized.at(-1)) {
            origin.at(-1).end = i + 1
            continue
        }
        normalized += char
        origin.push({ start: i, end: i + 1 })
    }

    return { normalized, origin }
}

const longestFirst = words => [...new Set(words)].sort((a, b) => b.length - a.length)

// Listahan lang ng bad-words ang gamit, hindi clean(): nawawala ang underscore,
// lumulusot ang sh!t, at may state ang regex kaya pwedeng hindi ma-mask ang kasunod na review
const englishWords = new Filter().list
    .map(word => word.toLowerCase())
    .filter(word => !CLEAN_WORDS.has(word))
const englishPattern = new RegExp(
    `(?<!\\w)(?:${longestFirst(englishWords).map(word => word.replace(/\W/g, '\\$&')).join('|')})(?!\\w)`,
    'gi'
)

const SEPARATOR = '[\\s.*_-]+'

// Tatlong anyo: buo (tanga), hiwa-hiwa kada letra (t.a.n.g.a), at listed na dalawang salita
// (tang ina). Bawal ang ibang hati para hindi mag-match ang normal na "po ta" o "ta nga".
const tagalogForms = word => {
    const letters = word.replace(/\s+/g, '')
    const forms = [letters, letters.split('').join(SEPARATOR)]
    return word.includes(' ') ? [...forms, word.split(' ').join(SEPARATOR)] : forms
}

// Buong salita lang, para hindi mag-match ang gaga sa gagawin.
// Pwedeng may -ng/-g sa dulo (gagong, tangang).
const tagalogWords = TAGALOG_WORDS.map(word => normalize(word).normalized)
const tagalogPattern = new RegExp(
    `(?<![a-z])(?:${longestFirst(tagalogWords).flatMap(tagalogForms).join('|')})(?:n?g)?(?![a-z])`,
    'g'
)

const englishMatches = text => [...text.matchAll(englishPattern)]
    .map(match => ({ start: match.index, end: match.index + match[0].length }))

const tagalogMatches = text => {
    const { normalized, origin } = normalize(text)

    return [...normalized.matchAll(tagalogPattern)]
        .map(match => ({ start: origin[match.index].start, end: origin[match.index + match[0].length - 1].end }))
}

// Numero lang ang 7171 kahit mabasa bilang titi
const isBadMatch = (text, { start, end }) => {
    const word = text.slice(start, end).toLowerCase()
    return /[a-z]/.test(word) && !CLEAN_WORDS.has(word)
}

// Parehong haba ang stars kaya hindi gumagalaw ang mga sumunod na match
const maskProfanity = text => [...englishMatches(text), ...tagalogMatches(text)]
    .filter(match => isBadMatch(text, match))
    .reduce((masked, { start, end }) => masked.slice(0, start) + '*'.repeat(end - start) + masked.slice(end), text)

module.exports = { maskProfanity }
