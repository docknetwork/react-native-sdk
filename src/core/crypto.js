
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

export const DEFAULT_KEY = '776fe87eec8c9ba8417beda00b23cf22f5e134d9644d0a195cd9e0b7373760c1';
export const SECURE_JSON_RPC = true;

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
