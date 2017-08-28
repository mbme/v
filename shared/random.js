/* eslint-disable no-continue */
import { capitalize, createArray } from './utils'

// TODO handle few separators in a row
// TODO handle exceptions Dr. Mr. Mrs. etc

function isSeparator(char) {
  return char === '.' || char === '?' || char === '!'
}

function isPunctuation(char) {
  return char === ',' || char === ';'
}

export function getSentences(text) {
  const sentences = []

  let sentenceStart = 0
  for (let i = 0; i < text.length; i += 1) {
    if (isSeparator(text[i])) {
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
    i += 1

    if (char === ' ') {
      if (word.length) {
        words.push(word)
        word = ''
      }
      continue
    }

    if (isPunctuation(char) || isSeparator(char)) {
      if (word.length) {
        words.push(word)
        word = ''
      }

      words.push(char)
      continue
    }

    word += char
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

function genSentence(stats, maxWords) {
  let word = pickWord(stats.starts)
  let sentence = capitalize(word)
  let wordsCount = 0

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
      wordsCount += 1
    }

    ended = pickWord(stats.ends) === word
    if (maxWords && wordsCount === maxWords) {
      ended = true
    }
  }

  return sentence + pickWord(stats.separators)
}

function genParagraph(stats, minSentences = 1, maxSentences = 10) {
  return createArray(randomInt(minSentences, maxSentences), () => genSentence(stats)).join(' ')
}

function genText(stats, minParagraphs, maxParagraphs) {
  return createArray(randomInt(minParagraphs, maxParagraphs), () => genParagraph(stats)).join('\n')
}

export function createTextGenerator(corpus) {
  const stats = calculateTextStats(corpus)

  return {
    generateText(minParagpahs = 1, maxParagraphs = 7) {
      return genText(stats, minParagpahs, maxParagraphs)
    },

    generateSentence() {
      return genSentence(stats, randomInt(2, 7))
    },
  }
}
