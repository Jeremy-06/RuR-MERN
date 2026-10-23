const { Filter } = require('bad-words')

// English words come from bad-words
const englishFilter = new Filter()

// Tagalog curse words, insults and vulgar terms. Mild words that also show up in normal
// reviews (bwisit, lintik, hayop, leche) are left out on purpose.
const TAGALOG_WORDS = [
    // Putang ina and its spellings
    'putangina', 'putang ina', 'puta', 'pota', 'potangina', 'putragis', 'punyeta',
    'tangina', 'tang ina', 'tanginamo', 'taena', 'tangna', 'kingina', 'kinginamo',
    'bwakanangina', 'bwakananginamo', 'puking ina', 'pakyu', 'pak yu', 'pakshet', 'shet',
    // Insults
    'gago', 'gaga', 'gagu', 'tanga', 'bobo', 'ulol', 'ulul', 'tarantado', 'tarantada',
    'kupal', 'siraulo', 'sira ulo', 'hinayupak', 'hindot', 'pokpok',
    // Vulgar terms
    'kantot', 'kantutan', 'iyot', 'jakol', 'salsal', 'tite', 'titi', 'burat', 'bayag',
    'puke', 'puki', 'pekpek', 'tamod', 'libog', 'malibog', 'tsupa', 'chupa',
]

// Number and symbol stand-ins: g4g0 -> gago, $het -> shet
const LOOKALIKES = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' }

// Lowercases, swaps look-alikes and squeezes repeated letters: GAGOOO -> gago
const normalize = text => String(text)
    .toLowerCase()
    .replace(/[013457@$]/g, char => LOOKALIKES[char])
    .replace(/([a-z])\1+/g, '$1')

// Each word must stand alone (no letters right before or after), so gaga does not match gagawin.
// Spaces, dots, dashes or stars may sit between its letters (t.a.n.g.a, tang ina), and a Tagalog
// linker -ng/-g may follow (gagong, tangang).
const tagalogPatterns = TAGALOG_WORDS.map(word => {
    const letters = normalize(word).replace(/\s+/g, '').split('').join('[\\s.*_-]*')
    return new RegExp(`(?:^|[^a-z])${letters}(?:n?g)?(?![a-z])`)
})

const isProfane = text => {
    if (englishFilter.isProfane(String(text))) return true

    const normalized = normalize(text)
    return tagalogPatterns.some(pattern => pattern.test(normalized))
}

module.exports = { isProfane, TAGALOG_WORDS }
