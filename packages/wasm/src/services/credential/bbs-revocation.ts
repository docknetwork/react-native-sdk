import {
  Accumulator,
  PositiveAccumulator,
  AccumulatorPublicKey,
  dockAccumulatorParams,
  VBMembershipWitness,
  VBWitnessUpdateInfo,
  Encoder,
} from '@docknetwork/crypto-wasm-ts';
// @ts-ignore
import {hexToU8a} from '@docknetwork/credential-sdk/utils';

import {
  blockchainService,
} from '../blockchain/service';

const trimHexID = id => {
  if (id.substr(0, 2) !== '0x') {
    return id;
  }

  return id.substr(2);
};

export const getWitnessDetails = async (credential, _membershipWitness) => {
  let witness = _membershipWitness;
  let blockNo;

  try {
    ({witness, blockNo} = JSON.parse(_membershipWitness));
  } catch (err) {
    console.error(err);
  }

  const {credentialStatus} = credential;
  const registryId = credentialStatus?.id;
  const revocationIndex = credentialStatus.revocationId;

  const queriedAccumulator =
    await blockchainService.modules.accumulator.getAccumulator(
      registryId,
      false,
    );

  if (!queriedAccumulator) {
    throw new Error('Accumulator not found');
  }

  const accumulator = PositiveAccumulator.fromAccumulated(
    queriedAccumulator.accumulated.bytes,
  );

  const encodedRevId = Encoder.defaultEncodeFunc()(revocationIndex.toString());

  const publicKey = await blockchainService.modules.accumulator.getPublicKey(
    queriedAccumulator.keyRef[0],
    queriedAccumulator.keyRef[1],
  );

  const params = dockAccumulatorParams();
  const pk = new AccumulatorPublicKey(publicKey.bytes);

  const membershipWitness = new VBMembershipWitness(hexToU8a(witness));

  try {
    const credentialStatusId = credential.credentialStatus.id;
    const accumulatorId = blockchainService
      .getTypesForDIDOrAccumulator(credentialStatusId)
      .AccumulatorId.from(credentialStatusId);

    const history =
      await blockchainService.modules.accumulator.accumulatorHistory(
        accumulatorId,
      );

    const blockNoIndex = history.updates.findIndex(
      update => update.id.toString() === blockNo,
    );

    const nextBlockNo = history.updates[blockNoIndex + 1]?.id?.toString();

    if (nextBlockNo) {
      await blockchainService.modules.accumulator.updateWitness(
        registryId,
        encodedRevId,
        membershipWitness,
        nextBlockNo,
        queriedAccumulator.lastModified,
      );
    }
  } catch (err) {
    console.error(err);
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
