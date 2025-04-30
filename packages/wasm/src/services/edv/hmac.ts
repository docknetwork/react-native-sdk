import * as base64url from 'base64url-universal';
import crypto from '@docknetwork/universal-wallet/crypto';

export default class HMAC {
  key: CryptoKey;
  id: string;
  type: string;
  algorithm: string;

  constructor({
    id,
    type,
    algorithm,
    key,
  }: {
    id: string;
    type: string;
    algorithm: string;
    key: CryptoKey;
  }) {
    this.id = id;
    this.type = type;
    this.algorithm = algorithm;
    this.key = key;
  }

  static async generateKey() {
    const key = await crypto.subtle.generateKey(
      {
        name: 'HMAC',
        hash: {name: 'SHA-256'},
      },
      true,
      ['sign', 'verify'],
    );

    return key;
  }

  static async deriveKey(baseKey: Uint8Array) {
    const key = await crypto.subtle.importKey(
      'raw',
      baseKey,
      {name: 'HMAC', hash: {name: 'SHA-256'}},
      true,
      ['sign', 'verify'],
    );

    return key;
  }

  static async exportKey(key: CryptoKey) {
    const rawKey = await crypto.subtle.exportKey('raw', key);
    return base64url.encode(Buffer.from(rawKey));
  }

  static async importKey(encodedKey: string) {
    const rawKey = base64url.decode(encodedKey);
    const key = await crypto.subtle.importKey(
      'raw',
      rawKey,
      {name: 'HMAC', hash: {name: 'SHA-256'}},
      true,
      ['sign', 'verify'],
    );
    

    return key;
  }
  m;

  static async create({
    id = 'urn:hmac:cloud-wallet',
    key,
  }: {
    id?: string;
    key: CryptoKey | string;
  }) {
    let cryptoKey: CryptoKey;

    if (typeof key === 'string') {
      cryptoKey = await HMAC.importKey(key);
    } else {
      cryptoKey = key;
    }

    const type = 'Sha256HmacKey2019';
    const algorithm = 'HS256';
    return new HMAC({
      id,
      type,
      algorithm,
      key: cryptoKey,
    });
  }

  async sign({data}: {data: Uint8Array | ArrayBuffer}) {
    const signature = await crypto.subtle.sign('HMAC', this.key, data);

    return base64url.encode(Buffer.from(signature));
  }

  async verify({
    data,
    signature,
  }: {
    data: Uint8Array | ArrayBuffer;
    signature: string;
  }) {
    const decodedSignature = base64url.decode(signature);
    return crypto.subtle.verify('HMAC', this.key, decodedSignature, data);
  }
}
