// @ts-nocheck
import {serviceName, validation} from './config';
import {
  Accumulator,
  VB_ACCUMULATOR_22 as AccumulatorType,
  WitnessUpdatePublicInfo,
  MembershipWitness,
} from '@docknetwork/crypto-wasm-ts';
import {OpenID4VCIClientV1_0_13} from '@sphereon/oid4vci-client';
import {Alg} from '@sphereon/oid4vci-common';
import {getKeypairFromDoc} from '@docknetwork/universal-wallet/methods/keypairs';
import {hexToU8a} from '@docknetwork/credential-sdk/utils';
import {
  VerifiablePresentation,
  Presentation,
  verifyCredential,
  verifyPresentation,
  VerifiableCredential,
  getSuiteFromKeyDoc,
} from '@docknetwork/credential-sdk/vc';
import {PEX} from '@sphereon/pex';
import {keyDocToKeypair} from './utils';
import {blockchainService, getDock} from '../blockchain/service';
import {
  applyEnforceBounds,
  hasProvingKey,
  fetchProvingKey,
} from './bound-check';
import assert from 'assert';
import axios from 'axios';
import {getIsRevoked, getWitnessDetails} from './bbs-revocation';
import {getPexRequiredAttributes} from './pex-helpers';
import {didService} from '../dids/service';

const pex: PEX = new PEX();

export function isBBSPlusCredential(credential) {
  return (
    (typeof credential?.proof?.type === 'string' &&
      credential.proof.type.includes('BBS+SignatureDock')) ||
    (Array.isArray(credential['@context']) &&
      credential['@context'].find(
        context => typeof context === 'string' && context.indexOf('bbs') > -1,
      ))
  );
}

export function isKvacCredential(credential) {
  return (
    typeof credential?.proof?.type === 'string' &&
    credential.proof.type.toLowerCase().includes('bbdt16')
  );
}

export function isAnnonymousCredential(credential) {
  return isBBSPlusCredential(credential) || isKvacCredential(credential);
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
    CredentialService.prototype.isKvacCredential,
    CredentialService.prototype.acquireOIDCredential,
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
    let shouldSkipSigning = false;
    for (const signedVC of credentials) {
      vp.addCredential(signedVC);
      shouldSkipSigning = shouldSkipSigning || isAnnonymousCredential(signedVC);
    }

    if (!shouldSkipSigning) {
      vp.setHolder(keyDoc.controller);
    }

    const keyPair = getKeypairFromDoc(keyDoc);
    keyPair.signer = keyPair.signer();
    const suite = await getSuiteFromKeyDoc(keyPair);

    if (shouldSkipSigning) {
      return vp.toJSON();
    }

    return vp.sign(suite, challenge, domain, blockchainService.resolver);
  }

  async verifyPresentation({ presentation, options }: any) {
    return verifyPresentation(presentation, options);
  }

  async verifyCredential(params) {
    validation.verifyCredential(params);
    const {credential, membershipWitness} = params;
    const result = await verifyCredential(credential, {
      resolver: blockchainService.resolver,
      revocationApi: {dock: blockchainService.dock},
    });

    const {credentialStatus} = credential;

    if (result.verified && credentialStatus?.id) {
      try {
        const isRevoked = await getIsRevoked(credential, membershipWitness);

        if (isRevoked) {
          result.verified = false;
          result.error = 'revocation check: the credential is revoked';
        }
      } catch (err) {
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

  isKvacCredential(params) {
    const {credential} = params;
    return isKvacCredential(credential);
  }

  async acquireOIDCredential({
    uri,
    authorizationCode,
    holderKeyDocument,
  }: {
    uri: string;
    authorizationCode?: string;
    holderKeyDocument: any;
  }): Promise<any> {
    const searchParams = new URL(uri).searchParams;
    const params = new URLSearchParams(searchParams);

    const client = await OpenID4VCIClientV1_0_13.fromURI({
      uri: uri,
      clientId: 'dock.wallet',
      authorizationRequest: {
        redirectUri: 'dock-wallet://credentials/callback',
        clientId: 'dock.wallet',
      },
    });

    const format = 'ldp_vc';
    const { scope }  = client.getCredentialsSupported()[0];
    const scopeSplit = scope.split(':');
    const credentialTypes = scopeSplit[scopeSplit.length - 1];

    let code;

    if (client.credentialOffer?.preAuthorizedCode) {
      code = client.credentialOffer?.preAuthorizedCode;
    } else {
      if (authorizationCode) {
        code = authorizationCode;
      } else {
        return {
          authorizationURL: client.authorizationURL,
        };
      }
    }

    await client.acquireAccessToken({
      code,
    });

    try {
      const response = await client.acquireCredentials({
        credentialTypes,
        proofCallbacks: {
          signCallback: async args => {
            // use service method here
            const jwt = await didService.createSignedJWT({
              payload: args.payload,
              privateKeyDoc: holderKeyDocument,
              headerInput: args.header,
            });

            return jwt;
          },
        },
        context: 'truverawallet',
        format: format,
        alg: Alg.EdDSA,
        kid: holderKeyDocument.id,
      });

      return {
        credential: response.credential,
      };
    } catch (err) {
      console.error(err);
    }
  }

  async createBBSPresentation(params) {
    validation.createBBSPresentation(params);
    const {credentials} = params;

    const bbsPlusPresentation = new Presentation();
    for (const {credential, attributesToReveal} of credentials) {
      const idx = await bbsPlusPresentation.addCredentialToPresent(credential, {
        resolver: blockchainService.resolver,
      });
      if (Array.isArray(attributesToReveal) && attributesToReveal.length > 0) {
        await bbsPlusPresentation.addAttributeToReveal(idx, attributesToReveal);
      }
    }
    return bbsPlusPresentation.createPresentation();
  }

  getAccumulatorId({credential}) {
    assert(!!credential, `credential is required`);
    if (!credential?.credentialStatus) {
      return null;
    }

    return credential?.credentialStatus.id;
  }

  async getAccumulatorData({credential}) {
    assert(!!credential, `credential is required`);
    const accumulatorId = await this.getAccumulatorId({credential});

    if (!accumulatorId) {
      return null;
    }

    return blockchainService.dock.accumulatorModule.getAccumulator(
      accumulatorId,
      false,
    );
  }

  /**
   * Fetch the latest accumulator witness updates for a given credential and membership witness
   * The witness is generated by the issuer when the credential is created and is stored in the wallet when the credential is imported
   *
   * @param param0
   */
  async updateMembershipWitness({credential, membershipWitnessJSON}) {
    const revocationId = credential.credentialStatus.revocationId;
    const member =
      Accumulator.encodePositiveNumberAsAccumulatorMember(revocationId);
    let updates = [];
    try {
      updates = await dock.accumulatorModule.getUpdatesFromBlock(
        accumulatorId,
        accumulator.lastModified,
      );
    } catch (err) {
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

    const queriedWitnessInfo = new WitnessUpdatePublicInfo(
      hexToU8a(updates[0].witnessUpdateInfo),
    );
    const witness = MembershipWitness.fromJSON(membershipWitnessJSON);
    witness.updateUsingPublicInfoPostBatchUpdate(
      member,
      additions,
      removals,
      queriedWitnessInfo,
    );

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
        resolver: blockchainService.resolver,
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
      pexRequiredAttributes = getPexRequiredAttributes(
        proofRequest.request,
        selectedCredentials,
      );
    }

    let idx = 0;
    for (const {attributesToReveal, witness, credential} of credentials) {
      const attributesToSkip = descriptorBounds[idx]
        ? descriptorBounds[idx].map(bound => bound.attributeName)
        : [];
      const filteredAttributes = attributesToReveal.filter(
        attribute => !attributesToSkip.includes(attribute),
      );
      const _pexRequiredAttributes = pexRequiredAttributes[idx] || [];

      _pexRequiredAttributes.forEach(attr => {
        if (!filteredAttributes.includes(attr)) {
          filteredAttributes.push(attr);
        }
      });

      if (Array.isArray(filteredAttributes) && filteredAttributes.length > 0) {
        presentation.addAttributeToReveal(idx, filteredAttributes);
      }

      if (witness) {
        const details = await getWitnessDetails(credential, witness);
        const chainModule =
          credential.credentialStatus.id.indexOf('dock:accumulator') === 0
            ? blockchainService.modules.accumulator.modules[0]
            : blockchainService.modules.accumulator.modules[
                blockchainService.modules.accumulator.modules.length - 1
              ];
        const accumulatorModuleClass = chainModule.constructor;

        presentation.presBuilder.addAccumInfoForCredStatus(
          idx,
          details.membershipWitness,
          accumulatorModuleClass.accumulatedFromHex(
            details.accumulator.accumulated,
            AccumulatorType.VBPos,
          ),
          details.pk,
          details.params,
        );
      }

      idx++;
    }

    const credentialsFromPresentation = await presentation.deriveCredentials(
      options,
    );

    return credentialsFromPresentation;
  }

  async testRangeProof() {
    console.log('test');
  }
}

export const credentialService = new CredentialService();
