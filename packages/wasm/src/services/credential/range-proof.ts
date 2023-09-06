import {
  LegoProvingKeyUncompressed,
  LegoVerifyingKeyUncompressed,
  LegoProvingKey,
} from '@docknetwork/crypto-wasm-ts/lib/legosnark';
import {
  BBSSignature,
  BBSSignatureParams,
  BBSSecretKey,
  WitnessEqualityMetaStatement,
  BBSPublicKey,
  Witnesses,
  MetaStatements,
  QuasiProofSpecG1,
  MetaStatement,
  CompositeProofG1,
  Statements,
  Witness,
  Statement,
  SetupParam,
  PresentationBuilder,
  BBSKeypair,
} from '@docknetwork/crypto-wasm-ts/lib';
import {BoundCheckSnarkSetup} from '@docknetwork/crypto-wasm-ts/lib/bound-check';
import {initializeWasm} from '@docknetwork/crypto-wasm-ts/lib/index';

/**
 * 
 * @returns 
 * 
 * TODO
 * [] - get bbs credential for testing
 * [] - generate presentation using the builder
 * [] - use range proofs
 * [] - verify range proofs presentation
 * [] - create logic to convert proof request into builder params
 */
export async function createRangeProofPresentation() {
  await initializeWasm();

  const provingKey: LegoProvingKey = BoundCheckSnarkSetup();

  const snarkProvingKey: LegoProvingKeyUncompressed = provingKey.decompress();

  const builder = new PresentationBuilder();

  const nonce = stringToBytes('a nonce');

  const presentation = {};


  verifyRangeProof({
    nonce,
    presentation,
    provingKey,
  });

  return true;
}

function verifyRangeProof({
  nonce,
  proof,
  provingKey,
  statement1,
  metaStatements,
}: {
  nonce: Uint8Array;
  proof: CompositeProofG1;
  provingKey: LegoProvingKey;
  statement1: Uint8Array;
  metaStatements: Uint8Array[];
}) {
  const snarkVerifyingKey: LegoVerifyingKeyUncompressed =
    provingKey.getVerifyingKeyUncompressed();

  const verifierSetupParams: SetupParam[] = [];
  verifierSetupParams.push(
    SetupParam.legosnarkVerifyingKeyUncompressed(snarkVerifyingKey),
  );

  // For verifying birth date was after `bornAfter`
  const statement5 = Statement.boundCheckVerifierFromSetupParamRefs(
    bornAfter,
    now,
    0,
  );
  // For verifying issuance date was between `earliestIssuance` and `latestIssuance`
  const statement6 = Statement.boundCheckVerifierFromSetupParamRefs(
    earliestIssuance,
    latestIssuance,
    0,
  );
  // For verifying expiration date was between `now` and `someDistantFuture`, i.e. its not expired as of now.
  const statement7 = Statement.boundCheckVerifierFromSetupParamRefs(
    now,
    someDistantFuture,
    0,
  );

  const verifierStatements = new Statements();
  verifierStatements.add(statement1);
  verifierStatements.add(statement5);
  verifierStatements.add(statement6);
  verifierStatements.add(statement7);

  const _metaStatements = new MetaStatements();

  metaStatements.forEach(metaStatement => {
    _metaStatements.add(metaStatement);
  });

  const verifierProofSpec = new QuasiProofSpecG1(
    verifierStatements,
    _metaStatements,
    verifierSetupParams,
  );

  const result = proof.verifyUsingQuasiProofSpec(verifierProofSpec, nonce);

  console.log(result);
}
