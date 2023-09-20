import {
  LegoProvingKeyUncompressed,
  LegoVerifyingKeyUncompressed,
  LegoProvingKey,
} from '@docknetwork/crypto-wasm-ts/lib/legosnark';
import {
  BBSSignatureParams,
  BBSCredential,
  BBSPlusSignatureParamsG1,
  BBSPlusCredential,
  MetaStatements,
  QuasiProofSpecG1,
  Statements,
  Statement,
  SetupParam,
  PresentationBuilder,
  BBSKeypair,
  CredentialSchema,
  initializeWasm,
  BBSPlusKeypairG2,
} from '@docknetwork/crypto-wasm-ts/lib';
import {BoundCheckSnarkSetup} from '@docknetwork/crypto-wasm-ts/lib/bound-check';
import VerifiablePresentation from '@docknetwork/sdk/verifiable-presentation';
import Presentation from '@docknetwork/sdk/presentation';
import {credentialService} from './service';
import credential from './range-proof-credential.json';
import {dockService} from '../dock';
import {NetworkManager} from '../../modules/network-manager';
import proofRequest from './proof-request.json';
import fs from 'fs';
import base64url from 'base64url';

export async function createRangeProofPresentation() {
  console.log('initialize dock');
  await dockService.init({
    address: 'wss://knox-1.dock.io',
  });

  console.log('initialize wasm');
  await initializeWasm();

  console.log('wasm initialized');

  // const cred = VerifiableCredential.fromJSON(credential);

  // const provingKey = BoundCheckSnarkSetup();

  // const provingKeyBytes: Uint8Array = provingKey.bytes;

  // const base64Data = Buffer.from(provingKeyBytes).toString('base64');

  // fs.writeFileSync('provingKey.data', base64Data);

  // console.log(provingKeyBytes);


  // provingKey.hex = stringToBytes(provingKey.hex);
  const [_credential] = await credentialService.deriveVCFromBBSPresentation({
    proofRequest,
    credentials: [
      {
        credential,
        attributesToReveal: ['id'],
      },
    ],
  });

  console.log(_credential);

  return true;
}

export const stringToBytes = (string: string): Uint8Array =>
  Uint8Array.from(Buffer.from(string, 'utf-8'));

/**
 *
 * @returns
 *
 * TODO
 * [x] - get bbs credential for testing
 * [] - generate presentation using the builder
 * [] - verify the presentation
 * [] - use range proofs
 * [] - verify range proofs presentation
 * [] - create logic to convert proof request into builder params
 */

// const snarkProvingKey: LegoProvingKeyUncompressed = provingKey.decompress();
// const builder = new PresentationBuilder();

// builder.addCredential(bbsCredential, keypair.pk);

//
// console.log(presentation)
