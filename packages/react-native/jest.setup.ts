import {Buffer} from 'buffer';

// Use globalThis for compatibility with Node.js v18 and later
globalThis.Buffer = globalThis.Buffer || Buffer;

// Keep global for compatibility with Node.js v17
if (typeof global !== 'undefined') {
  (global as any).Buffer = (global as any).Buffer || Buffer;
}

import '@testing-library/jest-dom';
import {JSDOM} from 'jsdom';

const cfg = {url: 'http://localhost'};
const dom = new JSDOM('', cfg);
(global as any).window = dom.window;
(global as any).document = dom.window.document;

require('./sdk-setup');
