

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
    '@context': string,
    type: DocumentType,
    id: string,
    value?: any,
    name?: string,
    correlation?: any[],
}