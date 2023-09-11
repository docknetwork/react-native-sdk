import {LegoProvingKey} from '@docknetwork/crypto-wasm-ts/lib/legosnark';
import {PresentationBuilder} from '@docknetwork/crypto-wasm-ts/lib';
import {isBase64} from '@polkadot/util-crypto';

interface Filter {
  type: string;
  format: string;
  formatMaximum?: string;
  formatMinimum?: string;
}

interface Field {
  path: string[];
  filter: Filter;
  predicate: string;
}

interface Constraints {
  fields: Field[];
}

interface InputDescriptor {
  id: string;
  name: string;
  purpose: string;
  constraints: Constraints;
}

interface Request {
  id: string;
  input_descriptors: InputDescriptor[];
}

interface ProofRequest {
  qr: string;
  id: string;
  name: string;
  nonce: string;
  created: string;
  updated: string;
  verified: boolean;
  response_url: string;
  request: Request;
  type: string;
  boundCheckSnarkKey?: string;
}

/**
 * Receive a presentation builder and a proof request template
 * Convert the proof request template into enforce bound calls on the presentation builder
 * @param param0
 */
export function applyEnforceBounds({
  builder,
  proofRequest,
  provingKeyId,
  provingKey,
}: {
  builder: PresentationBuilder,
  proofRequest: ProofRequest,
  provingKeyId: string,
  provingKey: LegoProvingKey,
}) {
  proofRequest.request.input_descriptors.forEach(inputDescriptor => {
    inputDescriptor.constraints.fields.forEach((field: Field) => {
      const {formatMaximum, formatMinimum, format, type} = field.filter || {};

      if (!formatMaximum && !formatMinimum) {
        return;
      }

      let max;
      let min;

      if (format === 'date-time') {
        max = formatMaximum
          ? dateTimeToTimestamp(formatMaximum)
          : MAX_DATE_PLACEHOLDER;
        min = formatMinimum ? dateTimeToTimestamp(formatMinimum) : 0;
      } else if (type === 'number') {
        max = formatMaximum || MAX_NUMBER;
        min = formatMinimum || 0;
      } else {
        throw new Error(
          `Unsupported format ${format} and type ${type} for enforce bounds`,
        );
      }

      const attributeName = field.path.join('.').replace('$.', '');

      builder.enforceBounds(
        0,
        attributeName,
        min,
        max,
        provingKeyId,
        provingKey,
      );
    });
  });

  return true;
}

export function dateTimeToTimestamp(date: string | number | Date): number {
  const newDate = new Date(date);

  if (isNaN(newDate.getTime())) {
    throw new Error('Invalid date input');
  }

  return Math.floor(newDate.getTime() / 1000);
}

export async function fetchProvingKey(proofRequest: ProofRequest) {
  let provingKey: LegoProvingKey;
  let blob: Uint8Array;

  if (isBase64(proofRequest.boundCheckSnarkKey)) {
    const base64Data = proofRequest.boundCheckSnarkKey;
    blob = Buffer.from(base64Data, 'base64');
  } else {
    const response = await fetch(proofRequest.boundCheckSnarkKey);
    const arrayBuffer = await response.arrayBuffer();
    blob = new Uint8Array(arrayBuffer);
  }

  provingKey = new LegoProvingKey(blob);

  return {provingKey, provingKeyId: 'key0'};
}

export const MAX_DATE_PLACEHOLDER = 884541351600000;
export const MAX_NUMBER = Math.pow(100, 9);

export const hasProvingKey = (proofRequest: ProofRequest) =>
  !!proofRequest.boundCheckSnarkKey;
