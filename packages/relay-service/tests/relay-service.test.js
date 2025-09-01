import axios from 'axios';
import {didcomm, RelayService, resolveDidcommMessage} from '../src';
import {generateSignedPayload, toBase64} from '../src/payloads';
import {ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC} from './mock-data';
import {didcommCreateEncrypted} from '../src/didcomm';
import {getDerivedAgreementKey} from '../src/didcomm';
import {blockchainService} from '@docknetwork/wallet-sdk-wasm/src/services/blockchain';

describe('Relay service', () => {
  beforeEach(() => {
    jest.spyOn(didcomm, 'encrypt').mockImplementationOnce(msg => msg);
    jest.spyOn(didcomm, 'decrypt').mockImplementationOnce(msg => msg);
    jest
      .spyOn(blockchainService, 'resolveDID')
      .mockImplementationOnce(msg => msg);
  });

  describe('generateSignedPayload', () => {
    it('expect to assert parameters', async () => {
      const error = await generateSignedPayload(null, null).catch(err => err);

      expect(error.toString()).toContain('AssertionError');
    });

    it('expect to generate signed payload for did:dock', async () => {
      const result = await generateSignedPayload(ALICE_KEY_PAIR_DOC, {
        limit: 20,
      });

      expect(result).toBeDefined();
    });

    it('expect to generate signed payload for did:key', async () => {
      const result = await generateSignedPayload(BOB_KEY_PAIR_DOC, {limit: 20});

      expect(result).toBeDefined();
    });
  });

  describe('sendMessage', () => {
    it('expect to assert parameters', async () => {
      const error = await RelayService.sendMessage({
        keyPairDoc: null,
        message: null,
        recipientDid: null,
      }).catch(err => err);

      expect(error.toString()).toContain('AssertionError');
    });

    it('expect to send message', async () => {
      const result = await RelayService.sendMessage({
        keyPairDoc: BOB_KEY_PAIR_DOC,
        message: 'Test',
        recipientDid: ALICE_KEY_PAIR_DOC.controller,
      });

      expect(result).toBeDefined();
    });
  });

  describe('getMessages', () => {
    it('expect to assert parameters', async () => {
      const error = await RelayService.getMessages({
        keyPairDocs: null,
      }).catch(err => err);

      expect(error.toString()).toContain('AssertionError');
    });

    it('expect to get messages', async () => {
      // Mock the blockchain service to avoid timeout
      jest
        .spyOn(
          require('@docknetwork/wallet-sdk-wasm/lib/services/blockchain/service')
            .blockchainService,
          'waitBlockchainReady',
        )
        .mockResolvedValue(true);

      jest.spyOn(axios, 'get').mockResolvedValue({
        data: [
          {
            to: BOB_KEY_PAIR_DOC.controller,
            msg: toBase64(JSON.stringify({test: 'test'})),
          },
        ],
      });

      const result = await RelayService.getMessages({
        keyPairDocs: [BOB_KEY_PAIR_DOC],
        limit: 20,
      });

      expect(result.length).toBeGreaterThanOrEqual(1);
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('registerDIDPushNotification', () => {
    it('expect to registerDIDPushNotification', async () => {
      jest.spyOn(axios, 'post').mockReturnValueOnce({data: ['test']});

      const result = await RelayService.registerDIDPushNotification({
        keyPairDocs: [BOB_KEY_PAIR_DOC],
        token: 'test',
      });

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('resolveDidcommMessage', () => {
    let didCommMessage;
    let payload;
    const jwtMessage =
      'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDpkb2NrOjVHNW42TkQ2djUyTDNXVVR1VEI5eGZwbWZUcnNFdlAyRHZRZTlmTkI1aU56cjNyWCNrZXlzLTEifQ.eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9pc3N1ZS1jcmVkZW50aWFsLzIuMC9pc3N1ZS1jcmVkZW50aWFsIiwic2VuZGVyRGlkIjoiZGlkOmRvY2s6NUc1bjZORDZ2NTJMM1dVVHVUQjl4ZnBtZlRyc0V2UDJEdlFlOWZOQjVpTnpyM3JYIiwicGF5bG9hZCI6eyJkb21haW4iOiJhcGkuZG9jay5pbyIsImNyZWRlbnRpYWxzIjpbeyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIseyJkayI6Imh0dHBzOi8vbGQuZG9jay5pby9jcmVkZW50aWFscyMiLCJCYXNpY0NyZWRlbnRpYWwiOiJkazpCYXNpY0NyZWRlbnRpYWwiLCJuYW1lIjoiZGs6bmFtZSIsImRlc2NyaXB0aW9uIjoiZGs6ZGVzY3JpcHRpb24iLCJsb2dvIjoiZGs6bG9nbyJ9XSwiaWQiOiJodHRwczovL2NyZWRzLXN0YWdpbmcuZG9jay5pby82MzU3Y2ZkZjI0NWNhNmJmYTdiODA1MDg4OGNmOGIwNzczZDc2NjkzYWU1YjBjYjIyZGIwYmI3ZWRlYWE2YjAxIiwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIkJhc2ljQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoidGVzdCJ9LCJpc3N1YW5jZURhdGUiOiIyMDIzLTA0LTI3VDE2OjA5OjUzLjI2NVoiLCJuYW1lIjoiQmFzaWMgQ3JlZGVudGlhbCIsImlzc3VlciI6eyJuYW1lIjoidGVzdCBzdGFnaW5nIiwiZGVzY3JpcHRpb24iOiIiLCJsb2dvIjoiIiwiaWQiOiJkaWQ6ZG9jazo1RzVuNk5ENnY1MkwzV1VUdVRCOXhmcG1mVHJzRXZQMkR2UWU5Zk5CNWlOenIzclgifSwicHJvb2YiOnsidHlwZSI6IkVkMjU1MTlTaWduYXR1cmUyMDE4IiwiY3JlYXRlZCI6IjIwMjMtMDQtMjdUMTY6Mjg6NDlaIiwidmVyaWZpY2F0aW9uTWV0aG9kIjoiZGlkOmRvY2s6NUc1bjZORDZ2NTJMM1dVVHVUQjl4ZnBtZlRyc0V2UDJEdlFlOWZOQjVpTnpyM3JYI2tleXMtMSIsInByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsImp3cyI6ImV5SmhiR2NpT2lKRlpFUlRRU0lzSW1JMk5DSTZabUZzYzJVc0ltTnlhWFFpT2xzaVlqWTBJbDE5Li5EYVJWSXZwYnN0R1dHdUxhc0l4M0REUzZ4dUdETFl1OWd4NHQxTExsTUFYXzZLSEdhdms5eHRGUVhlOWxhU2RyQXkzYWE1ZWE5UWtwWGQxdE9LeFVCUSJ9fV19fQ.v-xtRg9US1RDO9HfgJSa-UxIm5Zd2w-81IihtOyOyyaH713mUIa9FI34Yu1qfliFfklsQ1E7YCg_6bNKmoIzAg';
    const base64Message = JSON.stringify(
      'eyJwcm90ZWN0ZWQiOiJleUpoYkdjaU9pSllRekl3VUNKOSIsInJlY2lwaWVudHMiOlt7ImhlYWRlciI6eyJhbGciOiJFQ0RILTFQVStBMjU2S1ciLCJraWQiOiJkaWQ6a2V5Ono2TWtoTjdQQmpXZ1NNUTI0QmViZHB2dnc4ZlZSdjdtNk1IRHFpd1RLb3p6QmdySiN6NkxTb2o5empaaEFwN01QUWNSd0MyeW51Qlh1eTliRWdWSzVoM3NUWjlzTWcxR20iLCJlcGsiOnsia3R5IjoiT0tQIiwiY3J2IjoiWDI1NTE5IiwieCI6IkxzQnRaa3VaTFBITFU5YWpXaER4NGRNbWxJd3k3d295SnNFTlFFbkpiaXMifSwic2tpZCI6ImRpZDprZXk6ejZNa285OGJHdnpLRHZHYlJhZm5TTm5KWVNoU1hWcXJCZlp1ZFBaTXZYaGZYM0ZTI3o2TFNwcW50cG5aZFdKaERucDZiY3ZRM3B5SlZtU0VYdEtlUUI2SENxS29xQ0FtRSJ9LCJlbmNyeXB0ZWRfa2V5IjoidzRWajN3Y04zQVhMcmlEUkZ5MjFEelkwanI1bFFiN3l3dEpfZml3ZXR4cHptZ0ZtSFBJTE5RIn1dLCJjaXBoZXJ0ZXh0IjoiaGE1U0FxLU81Wks5YWtHSVlhQmpEWXNBVHdSWkJ5QmJHR1NQQ3RtVU52SGw4STlYbzFVQzdyR2Z4a1pPRG5PdHNwZWFaSENYSjl1T1N6Mjh4a0sxTUk2STkxRFZ3dUNHTVQycWlnT1laM3Mtd1JvZnRCU19TRVpLeUlXREN0cGZ2TzdWdXl2RWR3M240N2JOalRSaVR2VFg5VGEzbFdFRk1UVVFodUNLUE44dHJ5NjFsTWRIMjkxeTYzZ2ZyNzNPdGljX2pTY1E5eF93Y01Ield3WmtBLUdhSGFiaDJjYlVEQ2MwVC15LVFINkJBTzRXbllGbV9DNWl3ajJXY2tNclVVck1GVzQxRTNQeGVQSWo0anlYc3I3SDAzbnVBSEVWY2dFY3lOV01aSVI0VDRaaUNoNkd0dnBHcUFjdGpsbDhxd3Y5OGFQTkgxVENEa3BfTWNNUG1jekRhcGxlMzRCNFd3clFpNklDVnRhTWxCTEVKMGswMzVHSFR3bm9PWXV5TGdDYVJPQ1ItQkU4bWI3ekMtblZvZ2tIMHhXYVphYy1aUllmOVNNaWxXNGMtWGRTLVBFaFZKSTVGN1BYZS1BMVRvZ1RRWUt4cGd6LXd1cF9LaWRSSURuQW5nb2tpT0ZiVFNSalFxODFuNjM1bjZnSUEycWVHcWkzVFZMSFVsbkhicVpwMjlZbUhIVnQxNkM0MHFuWEJJVmZjdkxZdHl2VHlFQWRjbnQyYXE2VTdVck9NVWk4Q2xLUngzd2ZqbXN6MHVGa0tPTjE3Wmp6ZG1oTUZoQ1ZHSDJvUmc0eXFpTWE1MmFUd1JYeWh3dWpVS2gwNGtKRTVoU19sX0hxSlFKWlQ0QXpkaS1ZY1N3MnU5bXZ0WXpyLU9qY2pzVTI0aGpjSmZjRUdZWURRNTZoem5yWGZnY2xKbGZtX2YwSGpjWVNSaGFnUmFNSkstNkdRdUMzNHRWb0pSblFRUUlBSENRVTFnb05fMG9DdjVUVV9sdThCQ3pXdlU4NGh5T2xwS3BuRUtYc2RaMm5zbUcxLTlTRUhNYjQzUDhEQ0Q2T1NyRl9pN2dEVENzeG5TSHczbWJSUUdhcmhQSnNDNWNrdHZ1emRwSFE1UzAxaWc2UDNRVUc4Mjl1dmo5OFF5d0RHcUp1T1ZBQmlyS2F6QmpxaEE1aHhoaVVEVURPWEczU09faDVNZEZ4UFBBZGdjTV9hMHk0ZE1aelFlRDRzb1hLZ2dRTnpxT1dtNWJHTWo1aWp5R2N5bVJoWWI5UWdNdjlPbGhsOWs3ZEpudXNmQk04dEpJRGtKV3NWRjI0WThiZ3F6ZHhSUjdtZTFuendIYVZHVjN5X05ZbnQycERoTEJwN0dqSXBfckNaTEJVSnlfakpHaVZ5VVhHUTNZUDI4N1plTEtpSXJBWTB4Y2hDby1ZbHpaVVZ1eVNVUEdfSVpWUG44bjM1Z19uTXpUdTB0ZDViUmc5RTNsTWJjV3dIbWh2ejlramdFM0hDelU0WlJnUmQtMGF5dWxQZWRiWjJpeXVzYkpWY3BueDRwbElTbDVkSW80QlBEVkUwV1R4ZDI5cGQ1WVdEMTd1R0psbmExVXltakpGSUFpamVyVm1SZk41eEJFRXYxc1RUSjNMVC1iTEUyWGJVcHAzOUpLNURoZndBS2VMTHBaV2xxbXNJczRrTzVnUVlfVGF6bmFpWTZQWEVFMW5LWXpqUzBUX09UUWUzLVI4ZWlvV2RVY3JiR1FDZi0wN0NqMm1CUHFVbk5LNHAtRFFMMWIwN0NpYk5RODlBZlhsajg4bmxCZE1GT3k5SzNuOGhjVlJjcVA2MGxXVENKNkJtbTliV2NJMW5pU0Jxd3dQQWNzZzZ6N2ZRbUM3Sl9SNEFpM0c5d2x4akNlY1FIR2dwRlF4T2VpZ2JHSlhpWHJpSUZNd0QzNGpTTXlUSU9PTFB0MlVGckp5QVhPVFZMSWNKNERhYy1icllLNjQydUpsRGFPMnhtdVJaN2VFTlJKQ21GSVZCNThZRVZmOFhZNXRmUm1hQXE0djBDYlppQzlJZ0FUTnN0U3lzRFVVS245blpvd05HVV9Cak4zSXZQbU1rNWVqSG9BaXdNV3RXRWZObXN2azd4aVAtdldvbk5vRUpyeWQ5OFVkbmdFdDlGcy1HQkc3T01EemlBQUZlREw1V1RoaFVkTUNKRkZ2Ykk4NTAzcWFhQVItWE44NVRENEwybzZkbFcxS090ZlpUSFVxSmc9PSIsIml2IjoiX3d1VzVDZkVaZ3ZJWFc2MVcwMjBXRVQzd01ha1FZVnQiLCJ0YWciOiJVWXNqT0hwa3JGSjVuRVVBSnc0ei13PT0ifQ==',
    );
    const messageURL = 'https://relay.dock.io/read/644aa2c2c67d9c3566f30c86';

    beforeAll(async () => {
      payload = {test: 'test'};
      const keyAgreementKey = await getDerivedAgreementKey(BOB_KEY_PAIR_DOC);
      didCommMessage = await didcommCreateEncrypted({
        recipientDids: [BOB_KEY_PAIR_DOC.controller],
        type: 'test',
        senderDid: ALICE_KEY_PAIR_DOC.controller,
        payload,
        keyAgreementKey,
      });
    });

    it('expect to resolve JSON message', async () => {
      const result = await resolveDidcommMessage({
        message: {
          to: BOB_KEY_PAIR_DOC.controller,
          msg: toBase64(didCommMessage),
        },
        keyPairDocs: [BOB_KEY_PAIR_DOC],
      });

      expect(result.body).toStrictEqual(payload);
    });

    it('expect to handle JWT', async () => {
      const result = await resolveDidcommMessage({
        message: `${jwtMessage}`,
        keyPairDocs: [BOB_KEY_PAIR_DOC],
      });

      expect(result.body.credentials).toBeDefined();
    });

    it('expect to handle JWT with didcomm prefix', async () => {
      const result = await resolveDidcommMessage({
        message: `didcomm://${jwtMessage}`,
        keyPairDocs: [BOB_KEY_PAIR_DOC],
      });

      expect(result.body.credentials).toBeDefined();
    });

    it('expect to handle base64 message', async () => {
      const result = await resolveDidcommMessage({
        message: `${base64Message}`,
        keyPairDocs: [BOB_KEY_PAIR_DOC],
      });

      expect(result.body.credentials).toBeDefined();
    });

    it('expect to handle URL', async () => {
      // Mock the axios.get to return the JWT message
      const axiosMock = jest.spyOn(axios, 'get').mockResolvedValue({
        data: jwtMessage,
      });

      // Mock the JWT decode functionality to return an object with credentials
      const jwtDecodeMock = jest
        .spyOn(require('jwt-decode'), 'jwtDecode')
        .mockImplementation(() => ({
          payload: {
            credentials: [{id: 'test-credential'}],
          },
        }));

      const result = await RelayService.resolveDidcommMessage({
        message: `didcomm://${messageURL}`,
        keyPairDocs: [BOB_KEY_PAIR_DOC],
      });

      // Check that the result is properly returned
      expect(result).toBeDefined();
      expect(result.body).toBeDefined();

      axiosMock.mockRestore();
      jwtDecodeMock.mockRestore();
    });

    it('expect to handle base64 JSON', async () => {
      const result = await RelayService.resolveDidcommMessage({
        message: `didcomm://${toBase64(didCommMessage)}`,
        keyPairDocs: [BOB_KEY_PAIR_DOC],
      });

      expect(result.body).toStrictEqual(payload);
    });
  });
});
