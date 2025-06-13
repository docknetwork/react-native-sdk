import {
  applyEnforceBounds,
  fetchProvingKey,
  isBase64OrDataUrl,
} from './bound-check';
import {PresentationBuilder} from '@docknetwork/crypto-wasm-ts/lib';
import proofRequest from './proof-request.json';
import { replaceResponseURL } from '@docknetwork/wallet-sdk-core/src/helpers';
import assert from 'assert';
import { MAX_DATE_PLACEHOLDER, MAX_NUMBER, MIN_DATE_PLACEHOLDER, MIN_NUMBER } from './pex-helpers';

const testAPIURL = process.env.TESTING_API_URL || null;

const createProofRequest = fields => ({
  qr: 'https://creds-example.dock.io/proof/7b66f17f-eac3-4d1f-9cee-40f2ab4baac8',
  id: '7b66f17f-eac3-4d1f-9cee-40f2ab4baac8',
  name: 'Range Proofs',
  nonce: '73c8a958c389534236d572ab9401457d',
  created: '2023-09-08T11:53:40.167Z',
  updated: '2023-09-08T11:53:40.167Z',
  verified: false,
  response_url:
    `${testAPIURL}/proof-requests/7b66f17f-eac3-4d1f-9cee-40f2ab4baac8/send-presentation`,
  request: {
    id: '7b66f17f-eac3-4d1f-9cee-40f2ab4baac8',
    input_descriptors: [
      {
        id: 'Credential 1',
        name: 'Range Proofs',
        purpose: 'Range Proofs',
        constraints: {
          fields,
        },
      },
    ],
  },
  type: 'proof-request',
});

const expectEnforceBoundsToHaveBeenCalledWithDate = (
  builder,
  credIdx,
  attributeName,
  min,
  max,
  provingKeyId,
  provingKey
) => {
  expect(builder.enforceBounds).toHaveBeenCalledWith(
    credIdx,
    attributeName,
    expect.any(Date),
    expect.any(Date),
    provingKeyId,
    provingKey
  );

  // Check if Dates actually have the time we expect them to have
  const callArgs = builder.enforceBounds.mock.calls[0];
  expect(callArgs[2].getTime()).toBe(new Date(min).getTime());
  expect(callArgs[3].getTime()).toBe(new Date(max).getTime());
};


describe('Bound check', () => {
  assert(testAPIURL, "Please configure the TESTING_API_URL env var.");

  const provingKey = {} as any;
  const provingKeyId = 'provingKeyId';
  let builder: PresentationBuilder;

  beforeEach(() => {
    builder = {
      enforceBounds: jest.fn(),
    } as any;
  });

  it('expect to create bound check for minimum date', () => {
    applyEnforceBounds({
      builder,
      selectedCredentials: [{
        credentialSubject: {
          dateEarned: '1999-01-01T00:00:00.000Z',
        },
      }],
      proofRequest: createProofRequest([
        {
          path: ['$.credentialSubject.dateEarned'],
          filter: {
            type: 'string',
            format: 'date-time',
            formatMinimum: '1999-01-01T00:00:00.000Z',
          },
          predicate: 'required',
        },
      ]),
      provingKey,
      provingKeyId,
    });

    const credIdx = 0;
    const attributeName = 'credentialSubject.dateEarned';
    const min = '1999-01-01T00:00:00.000Z';
    const max = MAX_DATE_PLACEHOLDER;

    expectEnforceBoundsToHaveBeenCalledWithDate(
      builder,
      credIdx,
      attributeName,
      min,
      max,
      provingKeyId,
      provingKey,
    )
  });

  it('expect to create bound check for maximum date', () => {
    applyEnforceBounds({
      builder,
      selectedCredentials: [{
        credentialSubject: {
          dateEarned: '1999-01-01T00:00:00.000Z',
        },
      }],
      proofRequest: createProofRequest([
        {
          path: ['$.credentialSubject.dateEarned'],
          filter: {
            type: 'string',
            format: 'date-time',
            formatMaximum: '1999-01-01T00:00:00.000Z',
          },
          predicate: 'required',
        },
      ]),
      provingKey,
      provingKeyId,
    });

    const credIdx = 0;
    const attributeName = 'credentialSubject.dateEarned';
    const min = MIN_DATE_PLACEHOLDER;
    const max = '1999-01-01T00:00:00.000Z';

    expectEnforceBoundsToHaveBeenCalledWithDate(
      builder,
      credIdx,
      attributeName,
      min,
      max,
      provingKeyId,
      provingKey,
    )
  });

  it('expect to create bound check for maximum date and minimum', () => {
    applyEnforceBounds({
      builder,
      selectedCredentials: [{
        expirationDate: '2023-06-01T00:00:00.000Z',
      }],
      proofRequest: createProofRequest([
        {
          path: ['$.expirationDate'],
          filter: {
            type: 'string',
            format: 'date-time',
            formatMaximum: '2023-12-31T23:59:59.000Z',
            formatMinimum: '2023-01-01T00:00:00.000Z',
          },
          predicate: 'required',
        },
      ]),
      provingKey,
      provingKeyId,
    });

    const credIdx = 0;
    const attributeName = 'expirationDate';
    const min = '2023-01-01T00:00:00.000Z';
    const max = '2023-12-31T23:59:59.000Z';

    expectEnforceBoundsToHaveBeenCalledWithDate(
      builder,
      credIdx,
      attributeName,
      min,
      max,
      provingKeyId,
      provingKey,
    )
  });

  it('expect to create bound check for maximum number', () => {
    applyEnforceBounds({
      builder,
      selectedCredentials: [{
        credentialSubject: {
          income: 20000,
        },
      }],
      proofRequest: createProofRequest([
        {
          path: ['$.credentialSubject.income'],
          filter: {
            type: 'number',
            formatMaximum: 20000,
          },
          predicate: 'required',
        },
      ]),
      provingKey,
      provingKeyId,
    });

    const credIdx = 0;
    const attributeName = 'credentialSubject.income';
    const min = MIN_NUMBER;
    const max = 20000;

    expect(builder.enforceBounds).toHaveBeenCalledWith(
      credIdx,
      attributeName,
      min,
      max,
      provingKeyId,
      provingKey,
    );
  });

  it('expect to create bound check for minimum number', () => {
    applyEnforceBounds({
      builder,
      selectedCredentials: [{
        credentialSubject: {
          income: 20000,
        },
      }],
      proofRequest: createProofRequest([
        {
          path: ['$.credentialSubject.income'],
          filter: {
            type: 'number',
            formatMinimum: 20000,
          },
          predicate: 'required',
        },
      ]),
      provingKey,
      provingKeyId,
    });

    const credIdx = 0;
    const attributeName = 'credentialSubject.income';
    const min = 20000;
    const max = MAX_NUMBER;

    expect(builder.enforceBounds).toHaveBeenCalledWith(
      credIdx,
      attributeName,
      min,
      max,
      provingKeyId,
      provingKey,
    );
  });

  it('expect to create bound check for minimum and maximum number', () => {
    applyEnforceBounds({
      builder,
      selectedCredentials: [{
        credentialSubject: {
          income: 20000,
        },
      }],
      proofRequest: createProofRequest([
        {
          path: ['$.credentialSubject.income'],
          filter: {
            type: 'number',
            formatMaximum: 20000,
            formatMinimum: 5000,
          },
          predicate: 'required',
        },
      ]),
      provingKey,
      provingKeyId,
    });

    const credIdx = 0;
    const attributeName = 'credentialSubject.income';
    const min = 5000;
    const max = 20000;

    expect(builder.enforceBounds).toHaveBeenCalledWith(
      credIdx,
      attributeName,
      min,
      max,
      provingKeyId,
      provingKey,
    );
  });

  it('expect to use proving key only on first enforce bounds call', () => {
    applyEnforceBounds({
      builder,
      selectedCredentials: [{
        credentialSubject: {
          dateEarned: '1999-01-01T00:00:00.000Z',
        },
      }],
      proofRequest: createProofRequest([
        {
          path: ['$.credentialSubject.dateEarned'],
          filter: {
            type: 'string',
            format: 'date-time',
            formatMaximum: '1999-01-01T00:00:00.000Z',
          },
          predicate: 'required',
        },
        {
          path: ['$.issuanceDate'],
          filter: {
            type: 'string',
            format: 'date-time',
            formatMaximum: '1999-01-01T00:00:00.000Z',
          },
          predicate: 'required',
        },
      ]),
      provingKey,
      provingKeyId,
    });

    const callArgs = (builder.enforceBounds as jest.Mock).mock.calls[1];
    expect(callArgs[callArgs.length - 1]).toBe(undefined);
  });

  it('expect to throw error for unsupported type', () => {
    expect(() =>
      applyEnforceBounds({
        builder,
        selectedCredentials: [{
          credentialSubject: {
            income: 20000,
          },
        }],
        proofRequest: createProofRequest([
          {
            path: ['$.credentialSubject.income'],
            filter: {
              type: 'string',
              formatMaximum: 20000,
            },
            predicate: 'required',
          },
        ]),
        provingKey,
        provingKeyId,
      }),
    ).toThrowError(
      'Unsupported format undefined and type string for enforce bounds',
    );
  });

  it('expect to fetch proving key', async () => {
    const updatedRequest = replaceResponseURL(proofRequest);
    const result = await fetchProvingKey(updatedRequest);

    console.log(result);
  });

  describe('isBase64OrDataUrl', () => {
    it('expect to return true for base64 string', async () => {
      expect(await isBase64OrDataUrl('SGVsbG8gV29ybGQ=')).toBe(true);
    });

    it('expect to return true for data URL', async () => {
      expect(await isBase64OrDataUrl('data:application/octet-stream;base64,base64string')).toBe(true);
    });

    it('expect to return false for other strings', async () => {
      expect(await isBase64OrDataUrl('http://workspace.truvera.io/some-key')).toBe(false);
    });
  });
});
