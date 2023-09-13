import {
  applyEnforceBounds,
  dateTimeToTimestamp,
  MAX_DATE_PLACEHOLDER,
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
    const min = dateTimeToTimestamp('1999-01-01T00:00:00.000Z');
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
    const min = 0;
    const max = dateTimeToTimestamp('1999-01-01T00:00:00.000Z');

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
    const min = dateTimeToTimestamp('2023-01-01T00:00:00.000Z');
    const max = dateTimeToTimestamp('2023-12-31T23:59:59.000Z');

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

  describe('dateTimeToTimestamp', () => {
    it('expect to return a Unix timestamp from a Date string', () => {
      const date = '2021-09-11T12:00:00.000Z'; // UTC time
      const expected = 1631361600;
      const result = dateTimeToTimestamp(date);
      expect(result).toBe(expected);
    });

    it('expect to return a Unix timestamp from a Date object', () => {
      const date = new Date('2021-09-11T12:00:00.000Z'); // UTC time
      const expected = 1631361600; // Unix timestamp for the above date
      const result = dateTimeToTimestamp(date);
      expect(result).toBe(expected);
    });

    it('expect to return a Unix timestamp from a Unix timestamp in milliseconds', () => {
      const date = 1631366400000; // Milliseconds since Unix epoch
      const expected = 1631366400;
      const result = dateTimeToTimestamp(date);
      expect(result).toBe(expected);
    });

    it('expect to throw an error for an invalid date', () => {
      const date = 'invalid-date';
      expect(() => dateTimeToTimestamp(date)).toThrow('Invalid date input');
    });
  });
});
