import { IWallet } from '@docknetwork/wallet-sdk-core/lib/types';
import { closeWallet, getWallet } from './helpers/wallet-helpers';
import { getEcosystems, getVerifiers } from '@docknetwork/wallet-sdk-core/src/ecosystem-tools';

const biometricCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://ld.dock.io/security/bbs/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      ForSurBiometricEnrollment: 'dk:ForSurBiometricEnrollment',
      name: 'dk:name',
      biometric: 'dk:biometric',
      data: 'dk:data',
      created: 'dk:created',
      description: 'dk:description',
      logo: 'dk:logo',
    },
  ],
  id: 'https://creds-testnet.dock.io/5bc3af5b45b5cbb8e44b9c991bc477e35fcaa14423a5762d63d9c01717216d37',
  type: ['VerifiableCredential', 'ForSurBiometricEnrollment'],
  credentialSubject: {
    id: 'did:key:z6Mkv9oreVc641WshEzJDtnEc55yqh7w3oHeyhbRQz3mY4qm',
    name: 'Test',
    biometric: {
      id: '1234',
      data: 'test',
      created: '2023-11-01T15:43:59.361Z',
    },
  },
  issuanceDate: '2023-11-01T15:43:59.361Z',
  issuer: {
    name: 'Forsur',
    description: 'Forsur is the biometric provider.',
    logo: 'https://img.dock.io/80f154126a78bba321b413c3ffb8d4a7',
    id: 'did:dock:5HLbQLSmirNuZVRsdWKbsgdajw9QTGzSFJABSVzMT5EBj5sb',
  },
  name: 'Test2',
  cryptoVersion: '0.4.0',
  credentialSchema: {
    id: 'data:application/json;charset=utf-8,%7B%22%24schema%22%3A%22http%3A%2F%2Fjson-schema.org%2Fdraft-07%2Fschema%23%22%2C%22definitions%22%3A%7B%22encryptableCompString%22%3A%7B%22type%22%3A%22string%22%7D%2C%22encryptableString%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22properties%22%3A%7B%22%40context%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSchema%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSubject%22%3A%7B%22properties%22%3A%7B%22biometric%22%3A%7B%22properties%22%3A%7B%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22data%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22cryptoVersion%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22issuanceDate%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22issuer%22%3A%7B%22properties%22%3A%7B%22description%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22logo%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%2C%22proof%22%3A%7B%22properties%22%3A%7B%22%40context%22%3A%7B%22items%22%3A%5B%7B%22properties%22%3A%7B%22proof%22%3A%7B%22properties%22%3A%7B%22%40container%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22sec%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%2C%22type%22%3A%22array%22%7D%2C%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22proofPurpose%22%3A%7B%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%2C%22verificationMethod%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D',
    type: 'JsonSchemaValidator2018',
    parsingOptions: {
      useDefaults: false,
      defaultMinimumInteger: -4294967295,
      defaultMinimumDate: -17592186044415,
      defaultDecimalPlaces: 0,
    },
    version: '0.3.0',
  },
  proof: {
    '@context': [
      {
        sec: 'https://w3id.org/security#',
        proof: {
          '@id': 'sec:proof',
          '@type': '@id',
          '@container': '@graph',
        },
      },
      'https://ld.dock.io/security/bbs/v1',
    ],
    type: 'Bls12381BBS+SignatureDock2022',
    created: '2024-04-05T18:36:24Z',
    verificationMethod:
      'did:dock:5HLbQLSmirNuZVRsdWKbsgdajw9QTGzSFJABSVzMT5EBj5sb#keys-2',
    proofPurpose: 'assertionMethod',
    proofValue:
      'zZkYLjXYxgBK67sYA7AMUGsYUnHSSNVydDpwz5wkCgeD6GeUWfa15ct1ErcRyHJt3mML6W3tVfj3anG6W22pjeG4uaYkTJE2JooUEpzVwm9Vv2FXX8TbC3BUyt6rtsV1i5KbjpX6N7YY583mN1uya6Rv2B',
  },
};

describe('BBS+ presentations', () => {
  it('should fetch ecosystem tools for the given issuer', async () => {
    const wallet: IWallet = await getWallet();

    const result = await getEcosystems({
      issuerDID: biometricCredential.issuer.id,
      networkId: 'testnet',
    });

    console.log(result);

    /* output:
    {
        '0xc5671b2d1552db9b47a3501109ddbeb861a55fe3f7a0cb7a26791203abe9fcc8': {
          name: 'clarity partners',
          convener: 'did:dock:5GKaHgDoSzHpfR6aiXGu5F1oUYgXk8tHXMSNbZE2jdm9FAnT',
          govFramework: '0x68747470733a2f2f6170692d746573746e65742e646f636b2e696f2f74727573742d726567697374726965732f3078633536373162326431353532646239623437613335303131303964646265623836316135356665336637613063623761323637393132303361626539666363382f7075626c6963'
        }
    }
    */

    expect(
      result[
        '0xc5671b2d1552db9b47a3501109ddbeb861a55fe3f7a0cb7a26791203abe9fcc8'
      ].name,
    ).toBe('clarity partners');

  });

  it('should fetch verifiers for the given registry', async () => {

    const result = await getVerifiers({
      trustRegistryId: '0xc5671b2d1552db9b47a3501109ddbeb861a55fe3f7a0cb7a26791203abe9fcc8',
      schemaId: 'https://schema.dock.io/QuotientBankIdentity-V4-1708715398120.json',
      networkId: 'testnet',
    });

    console.log(result);

    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('did:dock:5CKsfvaE68mvRhdn3dDXG4KpWzuvaUNdBbiu6sFUuPK9rw66');

  });

  afterAll(() => closeWallet());
});
