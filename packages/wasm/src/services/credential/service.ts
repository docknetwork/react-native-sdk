// @ts-nocheck
import {serviceName, validation} from './config';
import {
  Accumulator,
  PositiveAccumulator,
  dockAccumulatorParams,
  VB_ACCUMULATOR_22 as AccumulatorType,
  WitnessUpdatePublicInfo,
  MembershipWitness,
} from '@docknetwork/crypto-wasm-ts';
import {
  getDockRevIdFromCredential,
} from '@docknetwork/sdk/utils/revocation';
import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import {getKeypairFromDoc} from '@docknetwork/universal-wallet/methods/keypairs';
import {getSuiteFromKeyDoc} from '@docknetwork/sdk/utils/vc/helpers';
import VerifiablePresentation from '@docknetwork/sdk/verifiable-presentation';
import BbsPlusPresentation from '@docknetwork/sdk/presentation';
import {verifyCredential} from '@docknetwork/sdk/utils/vc/credentials';
import {PEX} from '@sphereon/pex';
import {keyDocToKeypair} from './utils';
import {dockService, getDock} from '../dock/service';
import {
  applyEnforceBounds,
  hasProvingKey,
  fetchProvingKey,
} from './bound-check';
import assert from 'assert';
import axios from 'axios';
import { getIsRevoked } from './bbs-revocation';

const pex: PEX = new PEX();

export function isBBSPlusCredential(credential) {
  return (
    (typeof credential?.proof?.type === 'string' &&
      (credential.proof.type.includes('BBS+SignatureDock')) ||
    (Array.isArray(credential['@context']) && credential['@context'].find(context => typeof context === 'string' && context.indexOf('bbs') > -1)))
  );
}

class CredentialService {
  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    CredentialService.prototype.generateCredential,
    CredentialService.prototype.signCredential,
    CredentialService.prototype.createPresentation,
    CredentialService.prototype.verifyCredential,
    CredentialService.prototype.createBBSPresentation,
    CredentialService.prototype.deriveVCFromBBSPresentation,
    CredentialService.prototype.isBBSPlusCredential,
  ];
  generateCredential(params = {}) {
    validation.generateCredential(params);
    const {subject} = params;
    const vc = new VerifiableCredential();

    vc.addType('DockAuthCredential');
    vc.addContext({
      dk: 'https://ld.dock.io/credentials#',
      DockAuthCredential: 'dk:DockAuthCredential',
    });
    if (subject) {
      vc.setSubject(subject);
      vc.addContext({
        state: 'dk:state',
      });
    }
    return vc;
  }
  async signCredential(params) {
    validation.signCredential(params);
    const {vcJson, keyDoc} = params;
    const verifiableCredential = new VerifiableCredential();
    verifiableCredential.setFromJSON(vcJson);
    const kp = getKeypairFromDoc(keyDoc);

    kp.signer = kp.signer();
    const suite = await getSuiteFromKeyDoc(kp);
    verifiableCredential.setIssuer(keyDoc.controller);

    await verifiableCredential.sign(suite);

    return verifiableCredential;
  }
  async createPresentation(params) {
    validation.createPresentation(params);
    const {credentials, keyDoc, challenge, id, domain} = params;
    const vp = new VerifiablePresentation(id);
    let isBBS;
    for (const signedVC of credentials) {
      vp.addCredential(signedVC);
      isBBS = isBBS || isBBSPlusCredential(signedVC);
    }

    if (!isBBS) {
      vp.setHolder(keyDoc.controller);
    }

    keyDoc.keypair = keyDocToKeypair(keyDoc, getDock());
    return vp.sign(keyDoc, challenge, domain, dockService.resolver);
  }
  async verifyCredential(params) {
    validation.verifyCredential(params);
    const {credential, membershipWitness} = params;
    const result = await verifyCredential(credential, {
      resolver: dockService.resolver,
      revocationApi: {dock: getDock()},
    });

    const {credentialStatus} = credential;

    if (result.verified && credentialStatus?.id) {
      const regId = credentialStatus?.id.replace('dock:accumulator:', '');

      try {
        const isRevoked = await getIsRevoked(regId, credentialStatus.revocationId, membershipWitness);

        if (isRevoked) {
          result.verified = false;
          result.error = 'Revoked';
        }
      } catch(err) {
        console.log('Unable to get revocation status');
        console.error(err);
      }
    }
    
    return result;
  }

  filterCredentials(params) {
    const {credentials, presentationDefinition, holderDid} = params;
    const result = pex.selectFrom(
      presentationDefinition,
      credentials,
      holderDid,
    );

    return result;
  }

  evaluatePresentation(params) {
    const {presentation, presentationDefinition} = params;
    const result = pex.evaluatePresentation(
      presentationDefinition,
      presentation,
    );

    return result;
  }

  isBBSPlusCredential(params) {
    const {credential} = params;
    return isBBSPlusCredential(credential);
  }

  async createBBSPresentation(params) {
    validation.createBBSPresentation(params);
    const {credentials} = params;

    const bbsPlusPresentation = new BbsPlusPresentation();
    for (const {credential, attributesToReveal} of credentials) {
      const idx = await bbsPlusPresentation.addCredentialToPresent(credential, {
        resolver: dockService.resolver,
      });
      if (Array.isArray(attributesToReveal) && attributesToReveal.length > 0) {
        await bbsPlusPresentation.addAttributeToReveal(idx, attributesToReveal);
      }
    }
    return bbsPlusPresentation.createPresentation();
  }

  getAccumulatorId({ credential }) {
    assert(!!credential, `credential is required`);
    if (!credential?.credentialStatus) {
      return null;
    }

    return credential?.credentialStatus.id.replace('dock:accumulator:', '');
  }

  async getAccumulatorData({ credential }) {
    assert(!!credential, `credential is required`);
    const accumulatorId = await this.getAccumulatorId({ credential });

    if (!accumulatorId) {
      return null
    }

    return getDock().accumulatorModule.getAccumulator(accumulatorId, false);
  }

  /**
   * Fetch the latest accumulator witness updates for a given credential and membership witness
   * The witness is generated by the issuer when the credential is created and is stored in the wallet when the credential is imported
   * 
   * @param param0 
   */
  async updateMembershipWitness({ credential, membershipWitnessJSON }) {
    const revocationId = credential.credentialStatus.revocationId;
    const member = Accumulator.encodePositiveNumberAsAccumulatorMember(revocationId);
    let updates = [];
    try {
      updates = await dock.accumulatorModule.getUpdatesFromBlock(accumulatorId, accumulator.lastModified);
    } catch(err) {
      if (err.code === -32000) {
        console.error(err);
        // "-32000: Client error: UnknownBlock: State already discarded for BlockId::Hash(<hash>)"
        // This means that the node has discarded old blocks to preserve space. This should not happen with a full node
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

    const queriedWitnessInfo = new WitnessUpdatePublicInfo(hexToU8a(updates[0].witnessUpdateInfo));
    const witness = MembershipWitness.fromJSON(membershipWitnessJSON);
    witness.updateUsingPublicInfoPostBatchUpdate(member, additions, removals, queriedWitnessInfo);

    return witness.toJSON();
  }

  async deriveVCFromBBSPresentation(params) {
    validation.deriveVCFromBBSPresentation(params);
    const {credentials, options = {}, proofRequest} = params;
    const bbsPlusPresentation = new BbsPlusPresentation();
    const selectedCredentials = credentials.map(({credential}) => credential);
    let descriptorBounds = [];

    for (const {credential} of credentials) {
      await bbsPlusPresentation.addCredentialToPresent(credential, {
        resolver: dockService.resolver,
      });
    }

    if (proofRequest && hasProvingKey(proofRequest)) {
      const {provingKey, provingKeyId} = await fetchProvingKey(proofRequest);
      descriptorBounds = applyEnforceBounds({
        builder: bbsPlusPresentation.presBuilder,
        proofRequest,
        provingKey,
        provingKeyId,
        selectedCredentials,
      });
    }

    let idx = 0;
    for (const {attributesToReveal, witness} of credentials) {
      const attributesToSkip = descriptorBounds[idx] ? descriptorBounds[idx].map((bound) => bound.attributeName) : [];
      const filteredAttributes = attributesToReveal.filter((attribute) => !attributesToSkip.includes(attribute));

      if (Array.isArray(filteredAttributes) && filteredAttributes.length > 0) {
        bbsPlusPresentation.addAttributeToReveal(idx, filteredAttributes);
      }

      const accumulatorId = this.getAccumulatorId({ credential: credentials[0].credential });

      if (accumulatorId) {
        const accumulator = await this.getAccumulatorData({ credential: credentials[0].credential });
        if (witness) {
          const accumulator3Pk = new Uint8Array(accumulator.publicKey);
          bbsPlusPresentation.presBuilder.addAccumInfoForCredStatus(idx, witness, accumulator.accumulated, accumulator3Pk);
        } 
      }

      idx++;
    }

    const credentialsFromPresentation =
      await bbsPlusPresentation.deriveCredentials(options);
    return credentialsFromPresentation.map(credentialJSON => {
      credentialJSON['@context'].push('https://ld.dock.io/security/bbs/v1');
      return VerifiableCredential.fromJSON(credentialJSON);
    });
  }

  async testRangeProof() {
    console.log('test');
  }
}

export const credentialService = new CredentialService();
