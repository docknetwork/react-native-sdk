import assert from 'assert';
import crypto from 'crypto';

export const DEFAULT_KEY =
  process.env.ENCRYPTION_KEY || process.env.REACT_APP_ENCRYPTION_KEY;
export const SECURE_JSON_RPC = process.env.ENCRYPTION_ENABLED;

if (SECURE_JSON_RPC) {
  assert(DEFAULT_KEY, 'ENCRYPTION_KEY is required');
}

let key = SECURE_JSON_RPC && Buffer.from(DEFAULT_KEY, 'hex');

const iv = crypto.randomBytes(16);

export function encryptData(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {iv: iv.toString('hex'), encryptedData: encrypted.toString('hex')};
}

export function decryptData(text) {
  let dIv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), dIv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
