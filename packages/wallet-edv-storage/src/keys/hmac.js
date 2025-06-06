import base64url from 'base64url';
import crypto from './crypto.js';
// Based on https://github.com/decentralized-identity/confidential-storage/blob/master/packages/data-vault-example/src/client/Sha256HmacKey2019/Sha256HmacKey2019.ts

export default class Sha256HmacKey2019 {
  constructor({id, algorithm, key}) {
    this.id = id;
    this.algorithm = algorithm;
    this.key = key;
    this.type = 'Sha256HmacKey2019';
  }

  static fromJwk(jwk) {
    if (jwk.kty !== 'oct') {
      throw new Error(`Unsupported kty: ${jwk.kty}`);
    }
    if (jwk.alg !== 'HS256') {
      throw new Error(`Unsupported alg: ${jwk.alg}`);
    }
    if (!jwk.k) {
      throw new Error(`Unsupported k: ${jwk.k}`);
    }
    return Sha256HmacKey2019.create(jwk.k);
  }

  // base64url encoded string.
  static async create(secret) {
    const algorithm = 'HS256';
    const extractable = true;
    const rawKey = base64url.toBuffer(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      rawKey,
      {name: 'HMAC', hash: {name: 'SHA-256'}},
      extractable,
      ['sign', 'verify'],
    );
    const fingerprint = await crypto.subtle.digest('SHA-256', rawKey);
    // https://tools.ietf.org/html/draft-multiformats-multibase-00
    // 'u' is base64url (no pad)
    // colons are not path safe, don't use them in indentifiers...
    const id = `u${base64url.encode(
      Buffer.concat([
        // https://github.com/multiformats/multicodec/blob/master/table.csv#L9
        // 0x12 is sha256
        Buffer.from('12', 'hex'),
        // sha256 digest of key
        Buffer.from(fingerprint),
      ]),
    )}`;
    const hmac = new Sha256HmacKey2019({id, algorithm, key});
    return hmac;
  }

  async sign({data}) {
    const {key} = this;
    const signature = new Uint8Array(
      await crypto.subtle.sign(key.algorithm, key, data),
    );
    return base64url.encode(Buffer.from(signature));
  }

  async verify({data, signature}) {
    const {key} = this;
    signature = base64url.decode(signature);
    return crypto.subtle.verify(key.algorithm, key, signature, data);
  }

  async toJson(exportPrivateKey = false) {
    const exported = {
      id: this.id,
      type: this.type,
    };
    if (exportPrivateKey) {
      const jwk = await crypto.subtle.exportKey('jwk', this.key);
      delete jwk.key_ops;
      delete jwk.ext;
      exported.privateKeyJwk = jwk;
    }
    return exported;
  }
}
