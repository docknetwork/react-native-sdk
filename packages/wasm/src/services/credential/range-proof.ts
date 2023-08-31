import {LegoProvingKeyUncompressed, LegoVerifyingKeyUncompressed, LegoProvingKey } from '@docknetwork/crypto-wasm-ts/lib/legosnark'
import {BoundCheckSnarkSetup} from '@docknetwork/crypto-wasm-ts/lib/bound-check';
import {initializeWasm} from '@docknetwork/crypto-wasm-ts/lib/index';

export async function createRangeProofPresentation() {
  await initializeWasm();

  // let snarkProvingKey: LegoProvingKeyUncompressed;
  // let snarkVerifyingKey: LegoVerifyingKeyUncompressed;
  //
  const pk:LegoProvingKey = BoundCheckSnarkSetup();
  // snarkProvingKey = pk.decompress();
  // snarkVerifyingKey = pk.getVerifyingKeyUncompressed();

  return true;
}
