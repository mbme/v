/* eslint-disable no-continue */
import { capitalize, createArray } from './utils'

// TODO handle few separators in a row

const SKIP_WORDS = ['dr.', 'mr.', 'mrs.']

function hasSkipWordAt(text, pos) {
  for (let i = 0; i < SKIP_WORDS.length; i += 1) {
    const word = SKIP_WORDS[i]
    if (pos + 1 < word.length) {
      continue
    }

    const skipWord = text.substring((pos + 1) - word.length, pos + 1).toLowerCase()
    if (skipWord === word) {
      return true
    }
  }

  return false
}

function isSeparator(char) {
  return char === '.' || char === '?' || char === '!'
}

function isPunctuation(char) {
  return char === ',' || char === ';' || char === ':'
}

export function getSentences(text) {
  const sentences = []

  let sentenceStart = 0
  for (let i = 0; i < text.length; i += 1) {
    if (isSeparator(text[i]) && !hasSkipWordAt(text, i)) {
      sentences.push(text.substring(sentenceStart, i + 1).trim())
      sentenceStart = i + 1
    }
  }

  if (!sentences.length) {
    sentences.push(text.trim())
  }

  return sentences
}

export function getWords(sentence) {
  const words = []

  let i = 0
  let word = ''
  while (i < sentence.length) {
    const char = sentence[i]

    if (char === ' ') {
      if (word.length) {
        words.push(word)
        word = ''
      }

      i += 1
      continue
    }

    if (isPunctuation(char) || (isSeparator(char) && !hasSkipWordAt(sentence, i))) {
      if (word.length) {
        words.push(word)
        word = ''
      }

      words.push(char)
      i += 1
      continue
    }

    word += char
    i += 1
  }

  if (word.length) {
    words.push(word)
  }

  return words.map(w => w.toLowerCase())
}

function calculateTextStats(text) {
  const dict = {}
  const separators = {}

  // 1. count words
  const sentences = getSentences(text)
  sentences.forEach((sentence) => {
    const words = getWords(sentence)

    const lastWord = words[words.length - 1]
    if (isSeparator(lastWord)) {
      separators[lastWord] = (separators[lastWord] || 0) + 1
      words.splice(words.length - 1, 1, lastWord.substring(0, lastWord.length - 1)) // remove separator from last word
    }

    words.forEach((word, index) => {
      const stats = dict[word] || { next: {}, nextWords: 0, start: 0, end: 0 }
      dict[word] = stats

      if (index === 0) {
        stats.start += 1
      }

      if (index === words.length - 1) {
        stats.end += 1
      }

      if (index < words.length - 1) {
        const nextWord = words[index + 1]
        stats.next[nextWord] = (stats.next[nextWord] || 0) + 1
        stats.nextWords += 1
      }
    })
  })

  // 2. calculate stats
  const stats = {
    starts: [],
    ends: [],
    separators: [],
    words: {},
  }

  Object.entries(dict).forEach(([word, wordStats]) => {
    if (wordStats.start > 0) {
      stats.starts.push([word, wordStats.start / sentences.length])
    }

    if (wordStats.end > 0) {
      stats.ends.push([word, wordStats.end / sentences.length])
    }


    stats.words[word] = Object.entries(wordStats.next).map(([nextWord, usages]) => [nextWord, usages / wordStats.nextWords])
  })
  Object.entries(separators).forEach(([separator, usages]) => {
    stats.separators.push([separator, usages / sentences.length])
  })

  return stats
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) // eslint-disable-line no-mixed-operators
}

/**
 * wordsDistribution: [[word, probability]]
 */
function pickWord(wordsDistribution) {
  if (!wordsDistribution.length) {
    return null
  }

  const wordProb = Math.random()
  let [word, distribution] = wordsDistribution[0]

  if (distribution > wordProb) {
    return word
  }

  for (let i = 1; i < wordsDistribution.length; i += 1) {
    word = wordsDistribution[i][0]
    distribution += wordsDistribution[i][1]

    if (distribution > wordProb) {
      return word
    }
  }

  return word
}

function genSentence(stats) {
  let word = pickWord(stats.starts)
  let sentence = capitalize(word)

  let ended = pickWord(stats.ends) === word

  while (!ended) {
    word = pickWord(stats.words[word])

    if (!word) {
      ended = true
      continue
    }

    if (isPunctuation(word)) {
      sentence += word
    } else {
      sentence += ' ' + word
    }

    ended = pickWord(stats.ends) === word
  }

  return sentence + pickWord(stats.separators)
}

function genParagraph(stats, sentences) {
  return createArray(sentences, () => genSentence(stats)).join(' ')
}

function genText(stats, paragraphs) {
  return createArray(
    paragraphs,
    () => genParagraph(stats, randomInt(1, 10)),
  ).join('\n')
}

export function createTextGenerator(corpus) {
  const stats = calculateTextStats(corpus)

  return {
    generateText(minParagpahs = 1, maxParagraphs = 7) {
      return genText(stats, randomInt(minParagpahs, maxParagraphs))
    },

    generateSentence(minWords = 1, maxWords = 20, maxTries = 100) {
      let sentence = genSentence(stats)

      for (let tries = 0; tries < maxTries; tries += 1) {
        const words = sentence.split(' ')
        if (words.length >= minWords && words.length <= maxWords) {
          return sentence
        }

        sentence = genSentence(stats)
      }

      return sentence
    },
  }
}
