import hkdf from 'futoin-hkdf';
import {
  EDVHTTPStorageInterface,
  EDVWallet,
} from '@docknetwork/universal-wallet';
import {Ed25519VerificationKey2018} from '@digitalbazaar/ed25519-verification-key-2018';
import {Ed25519VerificationKey2020} from '@digitalbazaar/ed25519-verification-key-2020';
import {X25519KeyAgreementKey2020} from '@digitalbazaar/x25519-key-agreement-key-2020';

import Sha256HmacKey2019 from './keys/hmac.js';
import CapabilityInvoker from './keys/capability-invoker.js';

export function deriveEDVKey(baseKey, salt) {
  const HKDF_LENGTH = 32;
  const HKDF_HASH = 'SHA-256';
  return hkdf(baseKey, HKDF_LENGTH, {salt, hash: HKDF_HASH});
}

export async function deriveKeyAgreementKey(masterKeypair) {
  const keyDoc = await masterKeypair.export({
    publicKey: true,
    privateKey: true,
  });
  const verificationKey2020 =
    await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({
      keyPair: keyDoc,
    });
  const agreementKey =
    await X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
      keyPair: verificationKey2020,
    });
  return agreementKey;
}

export async function createOrGetEDVWallet(
  edvKeyBuffer,
  edvUrl,
  edvAuthKey,
  referenceId,
) {
  // Create a HMAC and master ed25519 keypair for the client's EDV
  const hmac = await Sha256HmacKey2019.create(edvKeyBuffer.toString('utf8'));
  const masterKeypair = await Ed25519VerificationKey2018.generate({
    seed: edvKeyBuffer,
  });
  masterKeypair.id = `did:key:${masterKeypair.fingerprint()}#${masterKeypair.fingerprint()}`;
  masterKeypair.controller = `did:key:${masterKeypair.fingerprint()}`;

  // Derive key agreement keys and create invocation signer
  const {controller} = masterKeypair;
  const keyAgreementKey = await deriveKeyAgreementKey(masterKeypair);

  const invocationSigner = new CapabilityInvoker(masterKeypair);
  const keys = {
    keyAgreementKey,
    hmac,
  };

  // Create a storage interface to check if the EDV has been created yet
  const storageInterface = new EDVHTTPStorageInterface({
    url: edvUrl,
    defaultHeaders: {
      DockAuth: edvAuthKey,
    },
    invocationSigner,
    keys,
  });

  // Check for legacy EDVs with "primary" as reference ID
  let walletId;
  const existingConfigLegacy = await storageInterface.findConfigFor(
    controller,
    'primary',
  );
  if (!existingConfigLegacy && referenceId) {
    const existingConfig = await storageInterface.findConfigFor(
      controller,
      referenceId,
    );
    if (!existingConfig) {
      walletId = await storageInterface.createEdv({
        sequence: 0, // on init the sequence must be 0 and is required
        referenceId,
        controller,
        headers: {
          DockAuth: edvAuthKey,
        },
      });
    } else {
      walletId = existingConfig.id;
    }
  } else {
    walletId = existingConfigLegacy.id;
  }

  // Create a wallet instance for this EDV/wallet ID
  const wallet = new EDVWallet(walletId, {
    keys,
    invocationSigner,
    defaultHeaders: {
      DockAuth: edvAuthKey,
    },
  });

  return wallet;
}
