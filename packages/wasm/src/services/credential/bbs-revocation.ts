import {
  Accumulator,
  PositiveAccumulator,
  AccumulatorPublicKey,
  dockAccumulatorParams,
  VBMembershipWitness,
  VBWitnessUpdateInfo,
  Encoder,
} from '@docknetwork/crypto-wasm-ts';
import dock from '@docknetwork/sdk';

import {hexToU8a} from '@polkadot/util';

const trimHexID = id => {
  if (id.substr(0, 2) !== '0x') {
    return id;
  }

  return id.substr(2);
};

// "-32000: Client error: UnknownBlock: State already discarded for BlockId::Hash(<hash>)"
// This means that the node has discarded old blocks to preserve space. This should not happen with a full node
const UnknownBlockErrorCode = -32000;

async function updateMembershipWitness({
  credential,
  membershipWitness,
  registryId,
  blockNo,
}) {
  const revocationId = credential.credentialStatus.revocationId;
  const member = Accumulator.encodePositiveNumberAsAccumulatorMember(
    Number(revocationId),
  );

  let updates = [];
  try {
    updates = await dock.accumulatorModule.getUpdatesFromBlock(
      registryId,
      blockNo,
    );
  } catch (err) {
    if (err.code === UnknownBlockErrorCode) {
      console.error(err);
      updates = [];
    } else {
      throw err;
    }
  }

  const additions = [];
  const removals = [];

  if (updates.length && updates[0].additions !== null) {
    for (const a of updates[0].additions) {
      additions.push(hexToU8a(a));
    }
  }

  if (updates.length && updates[0].removals !== null) {
    for (const a of updates[0].removals) {
      removals.push(hexToU8a(a));
    }
  }

  const queriedWitnessInfo = new VBWitnessUpdateInfo(
    hexToU8a(updates[0].witnessUpdateInfo),
  );
  const witness = new VBMembershipWitness(hexToU8a(membershipWitness));

  witness.updateUsingPublicInfoPostBatchUpdate(
    member,
    additions,
    removals,
    queriedWitnessInfo,
  );

  return witness;
}

export const getWitnessDetails = async (credential, _membershipWitness) => {
  let witness = _membershipWitness;
  let blockNo;

  try {
    ({blockNo, witness} = JSON.parse(_membershipWitness));
  } catch (err) {
    console.error(err);
  }
  
  const {credentialStatus} = credential;
  const registryId = credentialStatus?.id.replace('dock:accumulator:', '');
  const revocationIndex = credentialStatus.revocationId;

  const queriedAccumulator = await dock.accumulatorModule.getAccumulator(
    registryId,
    false,
  );

  if (!queriedAccumulator) {
    throw new Error('Accumulator not found');
  }

  const accumulator = PositiveAccumulator.fromAccumulated(
    hexToU8a(queriedAccumulator.accumulated),
  );

  const encodedRevId = Encoder.defaultEncodeFunc()(revocationIndex.toString());

  const publicKey = await dock.accumulatorModule.getPublicKeyByHexDid(
    queriedAccumulator.keyRef[0],
    queriedAccumulator.keyRef[1],
  );

  const params = dockAccumulatorParams();
  const pk = new AccumulatorPublicKey(hexToU8a(publicKey.bytes));

  let membershipWitness = new VBMembershipWitness(
    hexToU8a(witness),
  );

  if(blockNo){
    try {
      const updatedWitness = await updateMembershipWitness({
        credential,
        membershipWitness: witness,
        registryId,
        blockNo,
      });
      membershipWitness = updatedWitness;

    } catch (err) {
      console.error(err);
    }
  }

  return {
    encodedRevId,
    membershipWitness,
    pk,
    params,
    accumulator,
  };
};

export const getIsRevoked = async (credential, _membershipWitness) => {
  const {encodedRevId, membershipWitness, pk, params, accumulator} =
    await getWitnessDetails(credential, _membershipWitness);

  try {
    return !accumulator.verifyMembershipWitness(
      encodedRevId,
      membershipWitness,
      pk,
      params,
    );
  } catch (err) {
    console.error(err);
    return false;
  }
};
