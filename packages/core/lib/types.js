

export type KeypairType = 'sr25519' | 'ed25519' |  'ecdsa';

export type DocumentType =
| 'Mnemonic'
| 'KeyringPair'
| 'Address'
| 'Currency'
| 'VerifiableCredential'
| 'Key'
| 'DID'
| 'generic';


export type WalletDocument = {
  context?: string[],
  id?: any,
  name: any,
  type: DocumentType,
  value: any,
};
