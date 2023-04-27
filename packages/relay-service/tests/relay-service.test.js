import axios from 'axios';
import {didcomm, RelayService, resolveDidcommMessage} from '../lib';
import {generateSignedPayload, toBase64} from '../lib/payloads';
import {ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC} from './mock-data';
import {didcommCreateEncrypted} from '../lib/didcomm';
import {getDerivedAgreementKey} from '../lib/didcomm';

describe('Relay service', () => {
  beforeEach(() => {
    jest.spyOn(didcomm, 'encrypt').mockImplementationOnce(msg => msg);
    jest.spyOn(didcomm, 'decrypt').mockImplementationOnce(msg => msg);
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
      jest.spyOn(axios, 'get').mockReturnValueOnce({
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
    });
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

    it('expect to handle URL', async () => {
      const axiosMock = jest.spyOn(axios, 'get').mockImplementation(() => {
        return Promise.resolve({
          data: jwtMessage,
        });
      });

      const result = await RelayService.resolveDidcommMessage({
        message: `didcomm://${messageURL}`,
        keyPairDocs: [BOB_KEY_PAIR_DOC],
      });

      expect(result.body.credentials).toBeDefined();

      axiosMock.mockRestore();
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
