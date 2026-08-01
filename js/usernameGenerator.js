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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateUsername, mapEase, MIN_LENGTH, MAX_LENGTH, MIN_EASE, MAX_EASE };
}
