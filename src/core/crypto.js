
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

export const DEFAULT_KEY = process.env.ENCRYPTION_KEY || process.env.REACT_APP_ENCRYPTION_KEY;
export const SECURE_JSON_RPC = true;

console.log(`encryption key`, DEFAULT_KEY);

let key = Buffer.from(DEFAULT_KEY, 'hex');
const iv = crypto.randomBytes(16);

export function encryptData(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {iv: iv.toString('hex'), encryptedData: encrypted.toString('hex')};
}

export function decryptData(text) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
