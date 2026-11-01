const { Filter } = require('bad-words')

const englishFilter = new Filter()

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

// GAGOOO -> gago
const normalize = text => String(text)
    .toLowerCase()
    .replace(/[013457@$]/g, char => LOOKALIKES[char])
    .replace(/([a-z])\1+/g, '$1')

// Buong salita lang, para hindi mag-match ang gaga sa gagawin.
// Pwedeng may space, dot, dash o star sa pagitan ng letra (t.a.n.g.a, tang ina),
// at pwedeng may -ng/-g sa dulo (gagong, tangang).
const tagalogPatterns = TAGALOG_WORDS.map(word => {
    const letters = normalize(word).replace(/\s+/g, '').split('').join('[\\s.*_-]*')
    return new RegExp(`(?:^|[^a-z])${letters}(?:n?g)?(?![a-z])`)
})

const isProfane = text => {
    if (englishFilter.isProfane(String(text))) return true

    const normalized = normalize(text)
    return tagalogPatterns.some(pattern => pattern.test(normalized))
}

module.exports = { isProfane }
