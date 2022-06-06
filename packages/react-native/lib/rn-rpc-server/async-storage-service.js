import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  rpcMethods = [
    StorageService.prototype.setItem,
    StorageService.prototype.getItem,
    StorageService.prototype.removeItem,
  ];

  constructor() {
    this.name = 'storage';
  }

  setItem(key, value): Promise<any> {
    return AsyncStorage.setItem(key, value);
  }

  removeItem(...args): Promise<any> {
    return AsyncStorage.removeItem(...args);
  }

  getItem(key): Promise<any> {
    if (!key) {
      return null;
    }

    if (key === 'dock-wallet2') {
      return JSON.stringify({
        'doc:d4bd8145-4a56-456e-9b78-71509184f6ed': {
          '@context': ['https://w3id.org/wallet/v1'],
          id: '6ee76a80-bdf2-4cf8-9647-4897ed6feadd',
          name: 'Account 1',
          type: 'Mnemonic',
          value:
            'toe crowd portion cook feel minute deny piece feel barrel member swarm',
        },
        'doc:74366f2f-a137-46f1-b661-be2956d9afb2': {
          '@context': ['https://w3id.org/wallet/v1'],
          id: '0a7d45d3-8ca4-41a2-93c8-d4bec5652376',
          name: 'mnemonic 1',
          type: 'Mnemonic',
          value:
            'exact next frown coconut exit pledge blind program film elephant wife clutch',
        },
        'doc:670ef0a2-c748-45ab-9515-460d907ba529': {
          '@context': ['https://w3id.org/wallet/v1'],
          id: '7e0b6479-59c8-4f76-95d5-d25f7413751f',
          name: 'mnemonic1 ',
          type: 'Mnemonic',
          value:
            'exact next frown coconut exit pledge blind program film elephant wife clutch',
        },
        'doc:497337c2-29fc-4a88-9b78-ee55abd0a500': {
          '@context': ['https://w3id.org/wallet/v1'],
          id: '37g1HpqrRjWozRxT5MCpqUDxHQtu2ASPy6yJRD5cqKRVBefS',
          type: 'Account',
          correlation: ['7e0b6479-59c8-4f76-95d5-d25f7413751f'],
          meta: {
            name: 'mnemonic1 ',
            keypairType: 'sr25519',
            derivationPath: '',
            hasBackup: true,
            balance: 0,
          },
        },
        'doc:069c5733-8516-4dff-aa91-cb3eefc3f16d': {
          '@context': ['https://w3id.org/wallet/v1'],
          id: '80f68f17-14a8-4f2d-9865-b1477e605115',
          name: 'test 33',
          type: 'KeyPair',
          value: {
            encoded:
              'MFMCAQEwBQYDK2VwBCIEIGhWQpGhRsLAOg8FFbvjUOOZ0UZZX2OJzIKhrTJ2Od1mKEidt13wS9Kxefy98pm/8w9an45To/IuYiKX7PlDyS6hIwMhAP4WQCN9VTz2Hn18GOwXw9ZhVZyCYQnbE5DcZeMamHYt',
            encoding: {
              content: ['pkcs8', 'sr25519'],
              type: ['none'],
              version: '3',
            },
            address: '3CH1Ce5k516MNoyJvRbq4CtuiSDisa8SF9JBqCcSYRAEzgUk',
            meta: {
              genesisHash:
                '0x17643cd935f8379c6683c74f739460be4ccc4e4c30b0183bdb2fb9973af242f1',
              isHardware: false,
              name: 'test 33',
              tags: [],
              whenCreated: 1654447770598,
            },
          },
        },
        'doc:d56aa925-2da8-469a-ab4b-c4878e19b9fc': {
          '@context': ['https://w3id.org/wallet/v1'],
          id: '3CH1Ce5k516MNoyJvRbq4CtuiSDisa8SF9JBqCcSYRAEzgUk',
          type: 'Account',
          correlation: ['80f68f17-14a8-4f2d-9865-b1477e605115'],
          meta: {name: 'test 33', hasBackup: true, balance: 0},
        },
        'doc:69cfaf57-4b04-40b4-9d2a-143c4f05a2e3': {
          '@context': ['https://w3id.org/wallet/v1'],
          id: 'dd3868e5-dab7-4e43-95ac-530a65ef8917',
          name: 'ACCOUNT NEW',
          type: 'Mnemonic',
          value:
            'surround cotton ecology happy artist opera alert resemble jewel jaguar risk rude',
        },
        'doc:729e40eb-e36c-460e-a85b-0f9ad2fbf199': {
          '@context': ['https://w3id.org/wallet/v1'],
          id: '3BcMTtyijuEQYBfSCR45jaZUCgEeCgLCNeJGZm336S638C7G',
          type: 'Account',
          correlation: ['dd3868e5-dab7-4e43-95ac-530a65ef8917'],
          meta: {
            name: 'ACCOUNT NEW',
            keypairType: 'sr25519',
            derivationPath: '',
            hasBackup: false,
            balance: 0,
          },
        },
      });
    }

    return AsyncStorage.getItem(key);
  }
}

export const storageService: StorageService = new StorageService();
