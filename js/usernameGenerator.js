/**
 * Core username generation logic, kept free of any DOM dependencies
 * so it can be reused (e.g. unit tested) outside the browser.
 */

const VOWELS = 'aeiou';
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

const MIN_LENGTH = 1;
const MAX_LENGTH = 20;
const MIN_EASE = 1;
const MAX_EASE = 300;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Maps the 1-300 slider range onto an effective 1-200 scale:
// values above 100 give a diminishing "extra boost" instead of a 1:1 increase.
function mapEase(value) {
  if (value <= 100) return value;
  return 100 + (value - 100) / 2;
}

function randomChar(chars) {
  return chars[Math.floor(Math.random() * chars.length)];
}

function generateUsername(length = 8, easyRead = 70, easySay = 70) {
  length = clamp(Math.floor(length) || MIN_LENGTH, MIN_LENGTH, MAX_LENGTH);
  easyRead = mapEase(clamp(Math.floor(easyRead) || MIN_EASE, MIN_EASE, MAX_EASE));
  easySay = mapEase(clamp(Math.floor(easySay) || MIN_EASE, MIN_EASE, MAX_EASE));

  const readFactor = (100 - Math.min(easyRead, 100)) / 100;
  const sayFactor = (100 - Math.min(easySay, 100)) / 100;

  let username = '';
  let nextChar = Math.random() < 0.6 ? 'consonant' : 'vowel';

  for (let i = 0; i < length; i++) {
    if (Math.random() < readFactor) {
      username += randomChar(LETTERS);
      nextChar = Math.random() < 0.6 ? 'consonant' : 'vowel';
      continue;
    }

    if (nextChar === 'vowel') {
      username += randomChar(VOWELS);
      nextChar = Math.random() < 0.9 ? 'consonant' : 'vowel';
      continue;
    }

    const clusterChance = sayFactor * 0.3;
    if (Math.random() < clusterChance && i < length - 1) {
      username += randomChar(CONSONANTS);
      i++;
      username += randomChar(CONSONANTS);
      nextChar = 'vowel';
    } else {
      username += randomChar(CONSONANTS);
      const vowelChance = 0.85 * (Math.min(easyRead, 100) / 100) + 0.05;
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
    mapEase,
    MIN_LENGTH,
    MAX_LENGTH,
    MIN_EASE,
    MAX_EASE,
  };
}
