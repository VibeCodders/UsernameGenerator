/**
 * Core username generation logic, kept free of any DOM dependencies
 * so it can be reused (e.g. unit tested) outside the browser.
 */

const MIN_LENGTH = 1;
const MAX_LENGTH = 20;
const MIN_EASE = 1;
const MAX_EASE = 500;

// Per-language letter pools and clusters.
// - vowels / consonantsByReadFreq: ordered most common -> rarest (orthographic
//   frequency), used to trim the pool as "easy to read" increases past 100.
// - consonantsBySayEase: ordered easiest -> hardest to pronounce, used to trim
//   the pool as "easy to say" increases past 100. Distinct from read frequency
//   since "common on the page" isn't the same as "easy to say out loud".
// - clusters: whitelist of real onset clusters, ordered easiest -> hardest, so
//   it can be progressively narrowed the same way as the letter pools.
const LANGUAGES = {
  en: {
    vowels: ['a', 'e', 'i', 'o', 'u'],
    consonantsByReadFreq: ['n', 'r', 't', 's', 'l', 'd', 'c', 'm', 'p', 'h', 'g', 'b', 'f', 'y', 'w', 'k', 'v', 'x', 'z', 'j', 'q'],
    consonantsBySayEase: ['m', 'n', 'l', 'r', 's', 't', 'd', 'p', 'b', 'f', 'g', 'h', 'k', 'v', 'w', 'y', 'c', 'j', 'x', 'q', 'z'],
    clusters: ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'sc', 'sk', 'tw', 'ch', 'sh', 'th', 'wh'],
  },
  it: {
    vowels: ['a', 'e', 'i', 'o', 'u'],
    consonantsByReadFreq: ['r', 'n', 't', 'l', 's', 'c', 'd', 'p', 'm', 'v', 'g', 'b', 'f', 'z', 'h', 'q'],
    consonantsBySayEase: ['m', 'n', 'l', 'r', 't', 's', 'd', 'p', 'b', 'v', 'f', 'c', 'g', 'z', 'q', 'h'],
    clusters: ['br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'bl', 'cl', 'fl', 'gl', 'pl', 'sl', 'sm', 'sn', 'sp', 'st', 'sv', 'sb', 'sc', 'sd', 'sf', 'sg', 'sq', 'sr', 'gn', 'ch', 'gh'],
  },
};

const DEFAULT_LANGUAGE = 'en';
const MIN_VOWEL_POOL = 2;
const MIN_CONSONANT_POOL = 5;
const MIN_CLUSTER_POOL = 3;

function getLanguage(language) {
  return LANGUAGES[language] || LANGUAGES[DEFAULT_LANGUAGE];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Splits the 1-MAX_EASE slider range into two drivers:
// - structural (1-100): same role as the original algorithm — probability of
//   random letters vs. vowel/consonant pattern, and of attempting a cluster.
// - trim (0-1): how aggressively the letter/cluster pools get narrowed down
//   to only the most common/easiest entries as the value climbs past 100.
function splitEase(value) {
  const v = clamp(Math.floor(value) || MIN_EASE, MIN_EASE, MAX_EASE);
  return {
    structural: Math.min(v, 100),
    trim: clamp(v - 100, 0, MAX_EASE - 100) / (MAX_EASE - 100),
  };
}

// Drops the rarest/hardest entries off the tail of a frequency/ease-ordered
// pool, never going below minSize.
function trimPool(orderedPool, trim, minSize) {
  const droppable = orderedPool.length - minSize;
  if (droppable <= 0) return orderedPool;
  const dropCount = Math.floor(trim * droppable);
  return orderedPool.slice(0, orderedPool.length - dropCount);
}

function randomChar(chars) {
  return chars[Math.floor(Math.random() * chars.length)];
}

function generateUsername(length = 8, easyRead = 70, easySay = 70, language = DEFAULT_LANGUAGE) {
  length = clamp(Math.floor(length) || MIN_LENGTH, MIN_LENGTH, MAX_LENGTH);

  const lang = getLanguage(language);
  const read = splitEase(easyRead);
  const say = splitEase(easySay);

  const readFactor = (100 - read.structural) / 100;
  const sayFactor = (100 - say.structural) / 100;

  const vowels = trimPool(lang.vowels, read.trim, MIN_VOWEL_POOL);
  const readConsonants = trimPool(lang.consonantsByReadFreq, read.trim, MIN_CONSONANT_POOL);
  const sayConsonants = trimPool(lang.consonantsBySayEase, say.trim, MIN_CONSONANT_POOL);
  // Consonants actually used for generation must be easy on both axes at once.
  const consonants = readConsonants.filter((c) => sayConsonants.includes(c));
  const consonantPool = consonants.length >= MIN_CONSONANT_POOL ? consonants : readConsonants;
  const clusters = trimPool(lang.clusters, say.trim, MIN_CLUSTER_POOL);
  const letters = [...vowels, ...readConsonants];

  let username = '';
  let nextChar = Math.random() < 0.6 ? 'consonant' : 'vowel';

  for (let i = 0; i < length; i++) {
    if (Math.random() < readFactor) {
      username += randomChar(letters);
      nextChar = Math.random() < 0.6 ? 'consonant' : 'vowel';
      continue;
    }

    if (nextChar === 'vowel') {
      username += randomChar(vowels);
      nextChar = Math.random() < 0.9 ? 'consonant' : 'vowel';
      continue;
    }

    const clusterChance = sayFactor * 0.3;
    if (Math.random() < clusterChance && i < length - 1) {
      username += randomChar(clusters);
      i++;
      nextChar = 'vowel';
    } else {
      username += randomChar(consonantPool);
      const vowelChance = 0.85 * (read.structural / 100) + 0.05;
      nextChar = Math.random() < vowelChance ? 'vowel' : 'consonant';
    }
  }

  return username.slice(0, length).toLowerCase();
}

const LEET_MAP = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7' };

function toCamelCase(username) {
  if (username.length < 2) return username;
  const splitAt = Math.max(1, Math.floor(username.length / 2));
  return (
    username.slice(0, splitAt) +
    username[splitAt].toUpperCase() +
    username.slice(splitAt + 1)
  );
}

function toLeet(username) {
  return username
    .split('')
    .map((ch) => (LEET_MAP[ch] && Math.random() < 0.7 ? LEET_MAP[ch] : ch))
    .join('');
}

function withNumbers(username) {
  const digits = 1 + Math.floor(Math.random() * 3);
  let suffix = '';
  for (let i = 0; i < digits; i++) {
    suffix += Math.floor(Math.random() * 10);
  }
  return username + suffix;
}

function withUnderscore(username) {
  if (username.length < 4) return username + '_' + Math.floor(Math.random() * 100);
  const splitAt = Math.max(1, Math.floor(username.length / 2));
  return username.slice(0, splitAt) + '_' + username.slice(splitAt);
}

// Applies a cosmetic style on top of a base pronounceable username.
// 'plain' returns the username unchanged (lowercase, as generated).
function applyStyle(username, style = 'plain') {
  switch (style) {
    case 'numbers':
      return withNumbers(username);
    case 'leet':
      return toLeet(username);
    case 'underscore':
      return withUnderscore(username);
    case 'camelCase':
      return toCamelCase(username);
    case 'plain':
    default:
      return username;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateUsername,
    applyStyle,
    splitEase,
    LANGUAGES,
    MIN_LENGTH,
    MAX_LENGTH,
    MIN_EASE,
    MAX_EASE,
  };
}
