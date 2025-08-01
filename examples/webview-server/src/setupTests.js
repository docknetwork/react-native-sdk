// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Global polyfills for wallet SDK
if (typeof globalThis === 'undefined') {
  global.globalThis = global;
}

// TextEncoder/TextDecoder polyfills
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Crypto polyfill
if (typeof crypto === 'undefined') {
  const nodeCrypto = require('crypto');
  global.crypto = {
    getRandomValues: nodeCrypto.randomBytes,
    subtle: nodeCrypto.webcrypto?.subtle
  };
}
