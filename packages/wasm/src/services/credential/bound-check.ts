import {BoundCheckSnarkSetup} from '@docknetwork/crypto-wasm-ts/lib/bound-check';
import {
  LegoProvingKeyUncompressed,
  LegoVerifyingKeyUncompressed,
  LegoProvingKey,
} from '@docknetwork/crypto-wasm-ts/lib/legosnark';
import {PresentationBuilder} from '@docknetwork/crypto-wasm-ts/lib';
import {isBase64} from '@polkadot/util-crypto';
import base64url from 'base64url';

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
  builder: PresentationBuilder;
  proofRequest: ProofRequest;
  provingKeyId: string;
  provingKey: LegoProvingKey;
}) {
  let skipProvingKey = false;

  proofRequest.request.input_descriptors.forEach(inputDescriptor => {
    inputDescriptor.constraints.fields.forEach((field: Field) => {
      const {formatMaximum, formatMinimum, format, type} = field.filter || {};

      if (!formatMaximum && !formatMinimum) {
        return;
      }

      let max;
      let min;

      if (format === 'date-time' || format === 'date') {
        max = new Date(formatMaximum || MAX_DATE_PLACEHOLDER);
        min = new Date(formatMinimum || MIN_DATE_PLACEHOLDER);
      } else if (type === 'number') {
        max = formatMaximum || MAX_NUMBER;
        min = formatMinimum || 0;
      } else {
        throw new Error(
          `Unsupported format ${format} and type ${type} for enforce bounds`
        )
      }

      const attributeName = field.path.join('.').replace('$.', '');

      console.log('enforceBounds', {
        attributeName,
        min,
        max,
      });

      builder.enforceBounds(
        0,
        attributeName,
        min,
        max,
        provingKeyId,
        !skipProvingKey && provingKey,
      );

      // Proving key will be used only for the first enforce bounds call
      skipProvingKey = true;
    });
  });

  return true;
}

export async function fetchBlobFromUrl(url: string): Promise<Uint8Array> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    throw new Error(`Error fetching proving key: ${err.message}`);
  }
}

export function blobFromBase64(base64String: string): Uint8Array {
  const cleanedBase64 = base64String.replace(
    /^data:application\/octet-stream;base64,/,
    '',
  );
  return base64url.toBuffer(cleanedBase64);
}

export function isBase64OrDataUrl(str: string): boolean {
  return isBase64(str) || (str as string).indexOf('data:application/octet-stream') > -1;
}

export async function fetchProvingKey(proofRequest: ProofRequest) {
  let blob: Uint8Array;
  
  if (isBase64OrDataUrl(proofRequest.boundCheckSnarkKey)) {
    console.log('Is base64');
    blob = blobFromBase64(proofRequest.boundCheckSnarkKey);
  } else {
    console.log('is not base64');
    blob = await fetchBlobFromUrl(proofRequest.boundCheckSnarkKey);
  }

  const provingKey = new LegoProvingKey(blob);
  return { provingKey, provingKeyId: 'key0' };
}

export const MAX_DATE_PLACEHOLDER = 884541351600000;
export const MIN_DATE_PLACEHOLDER = -62167219200000;
export const MAX_NUMBER = Math.pow(100, 9);

export const hasProvingKey = (proofRequest: ProofRequest) =>
  !!proofRequest.boundCheckSnarkKey;
