import {
  applyEnforceBounds,
  MAX_DATE_PLACEHOLDER,
  MIN_DATE_PLACEHOLDER,
  MAX_NUMBER,
} from './bound-check';
import {PresentationBuilder} from '@docknetwork/crypto-wasm-ts/lib';

const createProofRequest = fields => ({
  qr: 'https://***REMOVED***/proof/7b66f17f-eac3-4d1f-9cee-40f2ab4baac8',
  id: '7b66f17f-eac3-4d1f-9cee-40f2ab4baac8',
  name: 'Range Proofs',
  nonce: '73c8a958c389534236d572ab9401457d',
  created: '2023-09-08T11:53:40.167Z',
  updated: '2023-09-08T11:53:40.167Z',
  verified: false,
  response_url:
    'https://***REMOVED***/proof-requests/7b66f17f-eac3-4d1f-9cee-40f2ab4baac8/send-presentation',
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

describe('Bound check', () => {
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

    expect(builder.enforceBounds).toHaveBeenCalledWith(
      credIdx,
      attributeName,
      min,
      max,
      provingKeyId,
      provingKey,
    );
  });

  it('expect to create bound check for maximum date', () => {
    applyEnforceBounds({
      builder,
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

    expect(builder.enforceBounds).toHaveBeenCalledWith(
      credIdx,
      attributeName,
      min,
      max,
      provingKeyId,
      provingKey,
    );
  });

  it('expect to create bound check for maximum date and minimum', () => {
    applyEnforceBounds({
      builder,
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

    expect(builder.enforceBounds).toHaveBeenCalledWith(
      credIdx,
      attributeName,
      min,
      max,
      provingKeyId,
      provingKey,
    );
  });

  it('expect to create bound check for maximum number', () => {
    applyEnforceBounds({
      builder,
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
    const min = 0;
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

  it('expect to throw error for unsupported type', () => {
    expect(() =>
      applyEnforceBounds({
        builder,
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
});
