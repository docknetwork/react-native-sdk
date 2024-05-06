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
import Presentation from '@docknetwork/sdk/presentation';
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
import { getIsRevoked, getWitnessDetails } from './bbs-revocation';
import { getPexRequiredAttributes } from './pex-helpers';

const pex: PEX = new PEX();

export function isBBSPlusCredential(credential) {
  return (
    (typeof credential?.proof?.type === 'string' &&
      (credential.proof.type.includes('BBS+SignatureDock')) ||
    (Array.isArray(credential['@context']) && credential['@context'].find(context => typeof context === 'string' && context.indexOf('bbs') > -1)))
  );
}

export function isBDDTCredential(credential) {
  return (
    (typeof credential?.proof?.type === 'string' && credential.proof.type === 'Bls12381BDDT16MACDock2024')
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
    CredentialService.prototype.deriveVCFromPresentation,
    CredentialService.prototype.isBBSPlusCredential,
    CredentialService.prototype.isBDDTCredential,
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
    
    if (isBBS) {
      return vp.toJSON();
    }

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
      try {
        const isRevoked = await getIsRevoked(credential, membershipWitness);

        if (isRevoked) {
          result.verified = false;
          result.error = 'revocation check: the credential is revoked';
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

  isBDDTCredential(params) {
    const {credential} = params;
    return isBDDTCredential(credential);
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
      return null;
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

  async deriveVCFromPresentation(params) {
    validation.deriveVCFromPresentation(params);
    const {credentials, options = {}, proofRequest} = params;
    const presentation = new Presentation();
    const selectedCredentials = credentials.map(({credential}) => credential);
    let descriptorBounds = [];

    for (const {credential} of credentials) {
      await presentation.addCredentialToPresent(credential, {
        resolver: dockService.resolver,
      });
    }

    if (proofRequest && hasProvingKey(proofRequest)) {
      const {provingKey, provingKeyId} = await fetchProvingKey(proofRequest);
      descriptorBounds = applyEnforceBounds({
        builder: presentation.presBuilder,
        proofRequest,
        provingKey,
        provingKeyId,
        selectedCredentials,
      });
    }

    let pexRequiredAttributes = [];
    if (proofRequest?.request) {
      pexRequiredAttributes = getPexRequiredAttributes(proofRequest.request, selectedCredentials);
    }

    let idx = 0;
    for (const {attributesToReveal, witness, credential} of credentials) {
      const attributesToSkip = descriptorBounds[idx] ? descriptorBounds[idx].map((bound) => bound.attributeName) : [];
      const filteredAttributes = attributesToReveal.filter((attribute) => !attributesToSkip.includes(attribute));
      const _pexRequiredAttributes = pexRequiredAttributes[idx] || [];

      _pexRequiredAttributes.forEach((attr) => {
        if (!filteredAttributes.includes(attr)) {
          filteredAttributes.push(attr);
        }
      });

      if (Array.isArray(filteredAttributes) && filteredAttributes.length > 0) {
        presentation.addAttributeToReveal(idx, filteredAttributes);
      }

      if (witness) {
        const details = await getWitnessDetails(credential, witness);
        presentation.presBuilder.addAccumInfoForCredStatus(idx, details.membershipWitness, details.accumulator.accumulated, details.pk, details.params);
      }

      idx++;
    }

    const credentialsFromPresentation =
      await presentation.deriveCredentials(options);

    return credentialsFromPresentation;
  }

  async testRangeProof() {
    console.log('test');
  }
}

export const credentialService = new CredentialService();
