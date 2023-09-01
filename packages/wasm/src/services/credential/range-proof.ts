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
  BBSKeypair,
} from '@docknetwork/crypto-wasm-ts/lib';
import {BoundCheckSnarkSetup} from '@docknetwork/crypto-wasm-ts/lib/bound-check';
import {initializeWasm} from '@docknetwork/crypto-wasm-ts/lib/index';

// Use presentation builder instead of low level implementation
// https://github.com/docknetwork/crypto-wasm-ts/blob/master/src/anonymous-credentials/presentation-builder.ts#L240.
// https://github.com/docknetwork/crypto-wasm-ts/blob/master/tests/anonymous-credentials/presentation.spec.ts#L932

// Low level implementation testing, we don't need to use it
const stringToBytes = (string: string): Uint8Array =>
  Uint8Array.from(Buffer.from(string, 'utf-8'));

function getRevealedUnrevealed(
  messages: Uint8Array[],
  revealedIndices: Set<number>,
): [Map<number, Uint8Array>, Map<number, Uint8Array>] {
  const revealedMsgs = new Map();
  const unrevealedMsgs = new Map();
  for (let i = 0; i < messages.length; i++) {
    if (revealedIndices.has(i)) {
      revealedMsgs.set(i, messages[i]);
    } else {
      unrevealedMsgs.set(i, messages[i]);
    }
  }

  return [revealedMsgs, unrevealedMsgs];
}

const earliestIssuance = 642709800000; // Timestamp of the earliest acceptable issuance, used as lower bound
const latestIssuance = 1588271400000; // Timestamp of the latest acceptable issuance, used as upper bound
const bornAfter = 642709800000; // Timestamp of the latest acceptable birth date, used as lower bound
const now = 1620585000000; // Timestamp as of now, i.e proof generation
const someDistantFuture = 1777746600000; // Timestamp from future

export async function createRangeProofPresentation() {
  await initializeWasm();

  const provingKey: LegoProvingKey = BoundCheckSnarkSetup();

  const snarkProvingKey: LegoProvingKeyUncompressed = provingKey.decompress();


  const attributes: Uint8Array[] = [];

  attributes.push(
    BBSSignature.encodeMessageForSigning(stringToBytes('John Smith')),
  ); // Name
  attributes.push(
    BBSSignature.encodeMessageForSigning(stringToBytes('123-456789-0')),
  ); // SSN
  attributes.push(
    BBSSignature.encodePositiveNumberForSigning(bornAfter + 100000),
  ); // Birth date as no. of milliseconds since epoch
  attributes.push(
    BBSSignature.encodePositiveNumberForSigning(earliestIssuance + 100000),
  ); // Issuance date as no. of milliseconds since epoch
  attributes.push(BBSSignature.encodePositiveNumberForSigning(now + 2000000)); // Expiration date as no. of milliseconds since epoch

  const messageCount = attributes.length;

  const sigParams: BBSSignatureParams =
    BBSSignatureParams.generate(messageCount);
  const sigKeypair1 = BBSKeypair.generate(sigParams);
  const sigSecretKey: BBSSecretKey = sigKeypair1.secretKey;
  const sigPublicKey: BBSPublicKey = sigKeypair1.publicKey;

  // Signer creates the signature and shares with prover
  const sig = BBSSignature.generate(attributes, sigSecretKey, sigParams, false);

  const proverSetupParams: SetupParam[] = [];
  proverSetupParams.push(
    SetupParam.legosnarkProvingKeyUncompressed(snarkProvingKey),
  );

  const revealedIndices = new Set<number>();
  revealedIndices.add(0);
  const [revealedAttrs, unrevealedAttrs] = getRevealedUnrevealed(
    attributes,
    revealedIndices,
  );

  const statement1 = Statement.bbsSignature(
    sigParams,
    sigPublicKey,
    revealedAttrs,
    false,
  );

  const statement2 = Statement.boundCheckProverFromSetupParamRefs(
    bornAfter,
    now,
    0,
  );
  // For proving issuance date was between `earliestIssuance` and `latestIssuance`
  const statement3 = Statement.boundCheckProverFromSetupParamRefs(
    earliestIssuance,
    latestIssuance,
    0,
  );
  // For proving expiration date was between `now` and `someDistantFuture`, i.e. its not expired as of now.
  const statement4 = Statement.boundCheckProverFromSetupParamRefs(
    now,
    someDistantFuture,
    0,
  );

  const proverStatements = new Statements(statement1);
  proverStatements.add(statement2);
  proverStatements.add(statement3);
  proverStatements.add(statement4);

  // For birth date attribute
  const witnessEq1 = new WitnessEqualityMetaStatement();
  witnessEq1.addWitnessRef(0, 2);
  witnessEq1.addWitnessRef(1, 0);

  // For issuance date attribute
  const witnessEq2 = new WitnessEqualityMetaStatement();
  witnessEq2.addWitnessRef(0, 3);
  witnessEq2.addWitnessRef(2, 0);

  // For expiration date attribute
  const witnessEq3 = new WitnessEqualityMetaStatement();
  witnessEq3.addWitnessRef(0, 4);
  witnessEq3.addWitnessRef(3, 0);

  const metaStatements = new MetaStatements();
  metaStatements.add(MetaStatement.witnessEquality(witnessEq1));
  metaStatements.add(MetaStatement.witnessEquality(witnessEq2));
  metaStatements.add(MetaStatement.witnessEquality(witnessEq3));

  const witnesses = new Witnesses();
  witnesses.add(Witness.bbsSignature(sig, unrevealedAttrs, false));
  witnesses.add(Witness.boundCheckLegoGroth16(attributes[2]));
  witnesses.add(Witness.boundCheckLegoGroth16(attributes[3]));
  witnesses.add(Witness.boundCheckLegoGroth16(attributes[4]));

  const proverProofSpec = new QuasiProofSpecG1(
    proverStatements,
    metaStatements,
    proverSetupParams,
  );

  const nonce = stringToBytes('a nonce');

  const proof = CompositeProofG1.generateUsingQuasiProofSpec(
    proverProofSpec,
    witnesses,
    nonce,
  );

  console.log(proof);

  verifyRangeProof({
    nonce,
    proof,
    provingKey,
    statement1,
    metaStatements: metaStatements.values,
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
