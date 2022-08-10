import {Wallet, WalletEvents} from './wallet';
import walletJson from '../test/fixtures/wallet-backup.json';
import {mockDockService} from '../services/test-utils';
import {getTestWallet} from '../test/setup-test-state';

describe('ApiModule', () => {
  let unmockDockService;

  beforeAll(async () => {
    unmockDockService = await mockDockService();
  });

  describe('new wallet', () => {
    let wallet: Wallet;

    beforeAll(async () => {
      wallet = await getTestWallet();
      await wallet.ensureNetwork();
    });

    it('is correct default params set', () => {
      expect(wallet.walletId).toBe('wallet');
    });

    it('query', async () => {
      const accounts = await wallet.query({
        type: 'account',
      });

      expect(accounts.length).toBe(0);
    });

    it('Expect document to be added', async () => {
      const accounts = await wallet.query({
        type: 'KeyringPair',
      });

      expect(accounts.length).toBe(3);
    });

    it('Expect document to be removed', async () => {
      const document = await wallet.add({
        type: 'Account',
        name: 'cocomelon',
      });

      await wallet.remove(document.id);

      const doc = await wallet.getDocumentById(document.id);

      expect(doc).toBeUndefined();
    });

    afterAll(async () => {
      await wallet.close();
    });
  });

  describe('existing wallet', () => {
    it('Expect to import wallet from backup file', async () => {
      const password = 'test';

      const wallet = await Wallet.create({
        walletId: 'test',
      });

      wallet.eventManager.emit = jest.fn();

      await wallet.importWallet({
        json: walletJson,
        password,
      });

      expect(wallet.eventManager.emit).toBeCalledWith(
        WalletEvents.walletImported,
      );

      const docs = await wallet.query();
      expect(docs.length).toBe(5);

      const addressDoc = docs.find(doc => doc.type === 'Address');

      expect(addressDoc.value).toBe(
        '3AABk8Q165Cj4NpeCZdHH7JGYmDKUg7sZvSiiDD8SpBrABbg',
      );
      expect(addressDoc.name).toBe('test');

      const keypairDoc = docs.find(doc => doc.type === 'KeyringPair');
      expect(keypairDoc.value.encoded).toBe(
        'MFMCAQEwBQYDK2VwBCIEIBA7v8oTxWqoUyV4dcXmxxcunhPWnEaw/W3CKcs2phBX8nxkJ21hUAySYJqVCiy/wcHwFjs7jPbop/vybbW9tM6hIwMhAKBqjm44EQyuODy9HTc61R3oylegEPPGaRyNMlGFO/Fi',
      );

      const mnemonicDoc = docs.find(doc => doc.type === 'Mnemonic');
      expect(mnemonicDoc.value).toBe(
        'tenant jaguar icon flock prosper leave island illegal topple pig axis cactus',
      );
    });
    it('expect to get documents from encrypted wallets', async () => {
      const wallet = await Wallet.create({
        walletId: 'test',
      });
      const encryptedJSONWallet = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/wallet/v1',
        ],
        id: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh#encrypted-wallet',
        type: ['VerifiableCredential', 'EncryptedWallet'],
        issuer: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
        issuanceDate: '2022-07-19T20:59:44.798Z',
        credentialSubject: {
          id: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
          encryptedWalletContents: {
            protected: 'eyJlbmMiOiJYQzIwUCJ9',
            recipients: [
              {
                header: {
                  kid: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh#z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
                  alg: 'ECDH-ES+A256KW',
                  epk: {
                    kty: 'OKP',
                    crv: 'X25519',
                    x: '-ABoa59NY2qVI66NZ8EbqxCwp02sft5onyKhfa2yfUU',
                  },
                  apu: '-ABoa59NY2qVI66NZ8EbqxCwp02sft5onyKhfa2yfUU',
                  apv: 'ZGlkOmtleTp6NkxTalRiUkVUSmpVQ0RpUW9wYmVDZ1pLUmlzeTdtZGNod2lNQlBUUWt0Y2liR2gjejZMU2pUYlJFVEpqVUNEaVFvcGJlQ2daS1Jpc3k3bWRjaHdpTUJQVFFrdGNpYkdo',
                },
                encrypted_key:
                  'Mmf6YGug9bL-L4bi2UwS9R8nUk6bJmgVKJvP2_a0BwsjxtxBN0ly6w',
              },
            ],
            iv: '-u0i0V9ENM3rUwxj-Yv_7jd3veFLzVEO',
            ciphertext:
              'jahwvff1Afy19A9C4kP51nno-14Ea7m-omq39JGlG5_qmmEgrBcd0KsStpfDFKj4gMRR8izsALXqKz78vzhCRTd3RNa5rNOKbzfT3HALRkn1y7n6RlSRRZ0MKuBP9JVg49opLSqAIJ9j64Ebj2KhXALX6Wbv1h9FhAIhIxGkZJZDgKFQmpI54IGKS-J4_19gE2IcJrt7nYb_jXa9VwmmPbH-GDUFGVVbk3uoGCIcpxPSTiwEn7RSC2iSb_kARyOb7ft5546TKiODN-98QMV7lQTn4kZ59RqgC2w7rwDui85He_X21z0GcK9Ipkg5tRm5U7GNqzZtT3Ev952VOUW960istZ6s5gMpcngv0YMGBqnboYqHC3Uq22-ZRM7ya1ijJOi-UD0ozdGNrLs6kdAQWlvrGh7NAnpEdpBfxq_2CuxLZxTI8TGXfpXH39Njc_L3241AISN7HyTrHsoA2F0QIoIE6njMcxaqQy8OWeWYJD7jAhiWMCE-M5UGUbgJUB5BpUV4Q_hndQqL_c5YVf2Fbc98_8vVwtsUeqbMB97qgN3Pq3du00N7rJ7zs9SNuO3D_2A9KD9Y7tN7QywXA565HQC2k-OJpkVqsRDsihWpn3qtTMaSu0OKJS6rKeugSNE6VlsGFC_PoD_6qx3FpcAPsl5_3MDuE-aZBden_iMfUkdXKxZFrkYbc2bLMekoQwa3gfrjBc4EoN9aPbIux3dqS8nBS6-31UCIMkfEv6OmKmm0_wIm-CeMUM8BW9EgGk_9k9kOySZbTQ5VxwomOLWHundKCFTp_I3adoobUORpbxl9LivFqX0T47w5ktblOMUiTMSzgmI4WbGYrvi4otb33vH88aRc_WneCeoSuWFnCUih2R8xBNqhqIESIB1zTqYnVlaENTNZXIRfw7qSatT6i7pnkaBygp059LeBJCkG79V0yB_ZnNTHX3oTViHHNfFmTpeuT7puhWFBkgQnLzr0zdc03hyjVNA99BhR3dz1gjL3TP8TgaYG6LLS2h-6HeLYRX8uDi-SmVU1hIvWR11l6dbzcQrj4b5cjMbbHvyxaegaXCNB5LPLRxg03z1Z74faueBRfWb3l2z_slbAhmJK2KJe9evl47_Fd5RgVAjbxRqwwFAAyUtzKtyHGZhUN7lJrOFATl89mzpGNg0Qt3lTC7rfzCD0xFWruC7PZnw7lCI8aNsPnNMG-2En-JE1eTyMUyG9um7ernec_AUqqntf7JjvNbjQO_PBu6qsOAsaKWbx1DxgEOFa-LPT7NGzBPr13pMFjIoiOXmLUexAl_LuZyEJuyjtfijSepZ6pYEKPQvAFMyNFBO-Og-jRoHaw78mVsoNV2jURkVwDfFuTeA_it5Xk00zgRGra3z1WELN8r-VWBewlj69H7ui4GF0PWZNEG5nxxZbmmrZgvj-Zqv9oCKHC60El2jX2KMniXiBXW-wcoh5pqT4P4dMOqkLdtpOtFvdWW0cQBJEdGcccfWdd0NUIhr0pSL3tfJ5yPxke8kTpHuwIb7Dbb55nqYDpyU-3hdx1QJtTFcCT2EottF0XDx1nrmLM9t_ZpZRx06tOOhK-CQLYNouqaMkpIEuW-utycHuS6qW-dNX95b15r3z1wuLxBA7CxgjYHmswedWnvMNshEIcTLAAYHttSsUVRBVLNVllqKs9swEN2Klq1L0d8iW3KGkpiGfrPpVeobcwB9E2sPIZyjNPwxlQboVAU8evbuk6e4slGTJwnz0VvDpRDtqM9Kz0ndIcuaOoB9he57zi037Aup8C2G8_qATcBhka7SHfP8XJdlDjz7cU5ACl2Mt0FH1C6HPBJj_FKbWLxjPgM17vfeDqgI_R6Du05kTFpQuwyqtnXYk10bd-M50jIWfrlrX-pdSObjolCVEtuUt2lZvZahe0r2bg87Zbk3eFU9bI8eVtdosvSGtP9ZrKfe5BjrfMAC0XsKfWwoKT0JXznXD0Brw11PBQwsslusQOPI6HqskmmaE3NCkKB9a2Wnzs1eO1_Ompqbx_J7uoBphNMzlnrOQL74UVRifDqTFc_o0-rhp3EaXnlDnuOCbYwbOO7Ah3jX5OdU49Vnm-VHIB5_MAtYeEonVaMdSyXa1LXboy-LespvK9P7x1Zfnk5FW9SQCEa1cp7_dXD4h5ho7shKTzPLxbFShKQ_twsoP7JeMdZd1MNCtt_7B9Be-uRfGPwV2XQijME0xtq_8OMhbxFAJh-6MLVZqqKlDSw',
            tag: 'kKoF2f10Da0kBqX2brBZug',
          },
        },
      };
      const docs = await wallet.getDocumentsFromEncryptedWallet({
        encryptedJSONWallet,
        password: 'test',
      });
      expect(docs.length).toBe(2);
    });
    it('expect to get documents from encrypted wallets with incorrect params', async () => {
      const wallet = await Wallet.create({
        walletId: 'test',
      });
      const encryptedJSONWallet = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://w3id.org/wallet/v1',
        ],
        id: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh#encrypted-wallet',
        type: ['VerifiableCredential', 'EncryptedWallet'],
        issuer: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
        issuanceDate: '2022-07-19T20:59:44.798Z',
        credentialSubject: {
          id: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
          encryptedWalletContents: {
            protected: 'eyJlbmMiOiJYQzIwUCJ9',
            recipients: [
              {
                header: {
                  kid: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh#z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
                  alg: 'ECDH-ES+A256KW',
                  epk: {
                    kty: 'OKP',
                    crv: 'X25519',
                    x: '-ABoa59NY2qVI66NZ8EbqxCwp02sft5onyKhfa2yfUU',
                  },
                  apu: '-ABoa59NY2qVI66NZ8EbqxCwp02sft5onyKhfa2yfUU',
                  apv: 'ZGlkOmtleTp6NkxTalRiUkVUSmpVQ0RpUW9wYmVDZ1pLUmlzeTdtZGNod2lNQlBUUWt0Y2liR2gjejZMU2pUYlJFVEpqVUNEaVFvcGJlQ2daS1Jpc3k3bWRjaHdpTUJQVFFrdGNpYkdo',
                },
                encrypted_key:
                  'Mmf6YGug9bL-L4bi2UwS9R8nUk6bJmgVKJvP2_a0BwsjxtxBN0ly6w',
              },
            ],
            iv: '-u0i0V9ENM3rUwxj-Yv_7jd3veFLzVEO',
            ciphertext:
              'jahwvff1Afy19A9C4kP51nno-14Ea7m-omq39JGlG5_qmmEgrBcd0KsStpfDFKj4gMRR8izsALXqKz78vzhCRTd3RNa5rNOKbzfT3HALRkn1y7n6RlSRRZ0MKuBP9JVg49opLSqAIJ9j64Ebj2KhXALX6Wbv1h9FhAIhIxGkZJZDgKFQmpI54IGKS-J4_19gE2IcJrt7nYb_jXa9VwmmPbH-GDUFGVVbk3uoGCIcpxPSTiwEn7RSC2iSb_kARyOb7ft5546TKiODN-98QMV7lQTn4kZ59RqgC2w7rwDui85He_X21z0GcK9Ipkg5tRm5U7GNqzZtT3Ev952VOUW960istZ6s5gMpcngv0YMGBqnboYqHC3Uq22-ZRM7ya1ijJOi-UD0ozdGNrLs6kdAQWlvrGh7NAnpEdpBfxq_2CuxLZxTI8TGXfpXH39Njc_L3241AISN7HyTrHsoA2F0QIoIE6njMcxaqQy8OWeWYJD7jAhiWMCE-M5UGUbgJUB5BpUV4Q_hndQqL_c5YVf2Fbc98_8vVwtsUeqbMB97qgN3Pq3du00N7rJ7zs9SNuO3D_2A9KD9Y7tN7QywXA565HQC2k-OJpkVqsRDsihWpn3qtTMaSu0OKJS6rKeugSNE6VlsGFC_PoD_6qx3FpcAPsl5_3MDuE-aZBden_iMfUkdXKxZFrkYbc2bLMekoQwa3gfrjBc4EoN9aPbIux3dqS8nBS6-31UCIMkfEv6OmKmm0_wIm-CeMUM8BW9EgGk_9k9kOySZbTQ5VxwomOLWHundKCFTp_I3adoobUORpbxl9LivFqX0T47w5ktblOMUiTMSzgmI4WbGYrvi4otb33vH88aRc_WneCeoSuWFnCUih2R8xBNqhqIESIB1zTqYnVlaENTNZXIRfw7qSatT6i7pnkaBygp059LeBJCkG79V0yB_ZnNTHX3oTViHHNfFmTpeuT7puhWFBkgQnLzr0zdc03hyjVNA99BhR3dz1gjL3TP8TgaYG6LLS2h-6HeLYRX8uDi-SmVU1hIvWR11l6dbzcQrj4b5cjMbbHvyxaegaXCNB5LPLRxg03z1Z74faueBRfWb3l2z_slbAhmJK2KJe9evl47_Fd5RgVAjbxRqwwFAAyUtzKtyHGZhUN7lJrOFATl89mzpGNg0Qt3lTC7rfzCD0xFWruC7PZnw7lCI8aNsPnNMG-2En-JE1eTyMUyG9um7ernec_AUqqntf7JjvNbjQO_PBu6qsOAsaKWbx1DxgEOFa-LPT7NGzBPr13pMFjIoiOXmLUexAl_LuZyEJuyjtfijSepZ6pYEKPQvAFMyNFBO-Og-jRoHaw78mVsoNV2jURkVwDfFuTeA_it5Xk00zgRGra3z1WELN8r-VWBewlj69H7ui4GF0PWZNEG5nxxZbmmrZgvj-Zqv9oCKHC60El2jX2KMniXiBXW-wcoh5pqT4P4dMOqkLdtpOtFvdWW0cQBJEdGcccfWdd0NUIhr0pSL3tfJ5yPxke8kTpHuwIb7Dbb55nqYDpyU-3hdx1QJtTFcCT2EottF0XDx1nrmLM9t_ZpZRx06tOOhK-CQLYNouqaMkpIEuW-utycHuS6qW-dNX95b15r3z1wuLxBA7CxgjYHmswedWnvMNshEIcTLAAYHttSsUVRBVLNVllqKs9swEN2Klq1L0d8iW3KGkpiGfrPpVeobcwB9E2sPIZyjNPwxlQboVAU8evbuk6e4slGTJwnz0VvDpRDtqM9Kz0ndIcuaOoB9he57zi037Aup8C2G8_qATcBhka7SHfP8XJdlDjz7cU5ACl2Mt0FH1C6HPBJj_FKbWLxjPgM17vfeDqgI_R6Du05kTFpQuwyqtnXYk10bd-M50jIWfrlrX-pdSObjolCVEtuUt2lZvZahe0r2bg87Zbk3eFU9bI8eVtdosvSGtP9ZrKfe5BjrfMAC0XsKfWwoKT0JXznXD0Brw11PBQwsslusQOPI6HqskmmaE3NCkKB9a2Wnzs1eO1_Ompqbx_J7uoBphNMzlnrOQL74UVRifDqTFc_o0-rhp3EaXnlDnuOCbYwbOO7Ah3jX5OdU49Vnm-VHIB5_MAtYeEonVaMdSyXa1LXboy-LespvK9P7x1Zfnk5FW9SQCEa1cp7_dXD4h5ho7shKTzPLxbFShKQ_twsoP7JeMdZd1MNCtt_7B9Be-uRfGPwV2XQijME0xtq_8OMhbxFAJh-6MLVZqqKlDSw',
            tag: 'kKoF2f10Da0kBqX2brBZug',
          },
        },
      };

      await expect(
        wallet.getDocumentsFromEncryptedWallet({
          encryptedJSONWallet,
          password: '1test',
        }),
      ).rejects.toThrowError(
        'No matching recipient found for key agreement key.',
      );
    });
  });

  afterAll(async () => {
    await unmockDockService();
  });
});
