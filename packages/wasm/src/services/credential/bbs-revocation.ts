import {
  Accumulator,
  PositiveAccumulator,
  AccumulatorPublicKey,
  dockAccumulatorParams,
  MembershipWitness,
} from '@docknetwork/crypto-wasm-ts';
import dock from '@docknetwork/sdk';

import {hexToU8a} from '@polkadot/util';

const trimHexID = id => {
  if (id.substr(0, 2) !== '0x') {
    return id;
  }

  return id.substr(2);
};

export const getIsRevoked = async (
  registryId,
  revocationIndex,
  membershipWitness,
) => {
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

  const encodedRevId = Accumulator.encodePositiveNumberAsAccumulatorMember(
    Number(revocationIndex),
  );

  const publicKey = await dock.accumulatorModule.getPublicKeyByHexDid(
    queriedAccumulator.keyRef[0],
    queriedAccumulator.keyRef[1],
  );

  const params = dockAccumulatorParams();
  const pk = new AccumulatorPublicKey(hexToU8a(publicKey.bytes));

  try {
    return !accumulator.verifyMembershipWitness(
      encodedRevId,
      new MembershipWitness(hexToU8a(membershipWitness)),
      pk,
      params,
    );
  } catch (err) {
    console.error(err);
    return false;
  }
};
