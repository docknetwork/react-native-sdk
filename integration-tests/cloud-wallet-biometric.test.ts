import {
  enrollUserWithBiometrics,
  authenticateWithBiometrics,
  deriveKeyMappingVaultKeys,
  deriveBiometricEncryptionKey,
  encryptMasterKey,
  decryptMasterKey,
  initializeKeyMappingVault,
  recoverCloudWalletMasterKey
} from '@docknetwork/wallet-sdk-core/src/cloud-wallet';

const EDV_URL = process.env.EDV_URL || '';
const EDV_AUTH_KEY = process.env.EDV_AUTH_KEY || '';

// Helper to create mock biometric data
const createMockBiometricData = (userId = '123') => {
  return Buffer.from(JSON.stringify({
    type: 'fingerprint',
    id: userId,
    quality: 0.95,
    minutiae: Array(20).fill(0).map((_, i) => ({
      x: 100 + Math.floor(i / 4) * 20,
      y: 150 + (i % 4) * 20,
      angle: (i * 15) % 360,
      type: i % 3
    })),
    timestamp: Date.now()
  }));
};

describe('Biometric Authentication System', () => {
  beforeAll(async () => {
    if (!EDV_URL || !EDV_AUTH_KEY) {
      throw new Error("Missing required environment variables: EDV_URL and EDV_AUTH_KEY");
    }
  });

  describe('Key derivation and encryption', () => {
    it('should derive consistent keys from the same biometric data and email', async () => {
      const bioData = createMockBiometricData();
      const email = `user${new Date().getTime()}@example.com`;

      const keys1 = await deriveKeyMappingVaultKeys(bioData, email);
      const keys2 = await deriveKeyMappingVaultKeys(bioData, email);

      expect(keys1.hmacKey).toBe(keys2.hmacKey);
      expect(keys1.agreementKey).toMatchObject(keys2.agreementKey);
      expect(keys1.verificationKey).toMatchObject(keys2.verificationKey);
    });

    it('should derive different keys for different biometric data', async () => {
      const bioData1 = createMockBiometricData('123');
      const bioData2 = createMockBiometricData('456');
      const email = `user${new Date().getTime()}@example.com`;

      const keys1 = await deriveKeyMappingVaultKeys(bioData1, email);
      const keys2 = await deriveKeyMappingVaultKeys(bioData2, email);

      expect(keys1.hmacKey).not.toBe(keys2.hmacKey);
      expect(keys1.agreementKey).not.toBe(keys2.agreementKey);
      expect(keys1.verificationKey).not.toBe(keys2.verificationKey);
    });

    it('should encrypt and decrypt a master key correctly', async () => {
      const bioData = createMockBiometricData();
      const email = `user${new Date().getTime()}@example.com`;
      const masterKey = new Uint8Array(Buffer.from('test-master-key-for-encryption'));

      const { key, iv } = await deriveBiometricEncryptionKey(bioData, email);
      const encryptedKey = await encryptMasterKey(masterKey, key, iv);
      expect(encryptedKey).not.toStrictEqual(masterKey);

      const decryptedKey = await decryptMasterKey(encryptedKey, key, iv);
      expect(decryptedKey).toStrictEqual(masterKey);
    });

    it('should fail decryption with wrong biometric data', async () => {
      const email = `user${new Date().getTime()}@example.com`;
      const masterKey = new Uint8Array(Buffer.from('test-master-key-for-encryption'));

      const bioData1 = createMockBiometricData('123');
      const { key: key1, iv: iv1 } = await deriveBiometricEncryptionKey(bioData1, email);
      const encryptedKey = await encryptMasterKey(masterKey, key1, iv1);

      const bioData2 = createMockBiometricData('456');
      const { key: key2, iv: iv2 } = await deriveBiometricEncryptionKey(bioData2, email);

      await expect(decryptMasterKey(encryptedKey, key2, iv2)).rejects.toThrow('Decryption failed: Invalid key or corrupted data');
    });
  });

  describe('Enrollment process', () => {
    it('should successfully enroll a user with biometrics', async () => {
      const bioData = createMockBiometricData();
      const email = `user${new Date().getTime()}@example.com`;

      const result = await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData,
        email
      );

      expect(result.masterKey).toBeDefined();
      expect(result.mnemonic).toBeDefined();
      expect(result.mnemonic.split(' ').length).toBe(12);

      // Verify a document was inserted into the key mapping vault
      const edvService = await initializeKeyMappingVault(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData,
        email
      );

      const docs = await edvService.find({});
      expect(docs.documents).toBeDefined();
      expect(docs.documents.length).toBe(1);
      expect(docs.documents[0].content.id).toBeDefined();
      expect(docs.documents[0].content.encryptedKey).toBeDefined();
    });

    it('should handle enrollment with different biometric data and identifiers', async () => {
      const bioData1 = createMockBiometricData('123');
      const bioData2 = createMockBiometricData('456');
      const email1 = `user1-${new Date().getTime()}@example.com`;
      const email2 = `user2-${new Date().getTime()}@example.com`;

      const result1 = await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData1,
        email1
      );

      const result2 = await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData2,
        email2
      );

      expect(result1.masterKey).toBeDefined();
      expect(result2.masterKey).toBeDefined();
      expect(result1.masterKey).not.toBe(result2.masterKey);
    });

    it('should allow recovery using mnemonic after biometric enrollment', async () => {
      const bioData = createMockBiometricData();
      const email = `user${new Date().getTime()}@example.com`;

      const { masterKey, mnemonic } = await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData,
        email
      );

      const recoveredKey = await recoverCloudWalletMasterKey(mnemonic);
      expect(recoveredKey).toStrictEqual(masterKey);
    });
  });

  describe('Authentication process', () => {
    it('should successfully authenticate with correct biometric data', async () => {
      const bioData = createMockBiometricData();
      const email = `user${new Date().getTime()}@example.com`;

      const { masterKey: originalMasterKey } = await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData,
        email
      );

      const retrievedMasterKey = await authenticateWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData,
        email
      );

      expect(retrievedMasterKey).toStrictEqual(originalMasterKey);
    });

    it('should support multiple users with different biometric data', async () => {
      const bioData1 = createMockBiometricData('123');
      const bioData2 = createMockBiometricData('456');
      const email1 = `user1-${new Date().getTime()}@example.com`;
      const email2 = `user2-${new Date().getTime()}@example.com`;

      const result1 = await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData1,
        email1
      );

      const result2 = await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData2,
        email2
      );

      expect(result1.masterKey).not.toStrictEqual(result2.masterKey);

      const key1 = await authenticateWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData1,
        email1
      );

      const key2 = await authenticateWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData2,
        email2
      );

      expect(key1).toStrictEqual(result1.masterKey);
      expect(key2).toStrictEqual(result2.masterKey);
    });

    it('should handle multiple key mappings for the same email', async () => {
      const bioData1 = createMockBiometricData('123');
      const bioData2 = createMockBiometricData('456');
      const email = `user${new Date().getTime()}@example.com`;
      const { masterKey: enrollMasterKey1 } = await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData1,
        email
      );

      const { masterKey: enrollMasterKey2 } = await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData2,
        email
      );

      expect(enrollMasterKey1).not.toStrictEqual(enrollMasterKey2);

      const masterKey1 = await authenticateWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData1,
        email
      );

      const masterKey2 = await authenticateWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData2,
        email
      );

      expect(masterKey1).not.toStrictEqual(masterKey2);
    });

    it('should fail authentication with incorrect biometric data', async () => {
      const bioData1 = createMockBiometricData('123');
      const bioData2 = createMockBiometricData('456');
      const email = `user${new Date().getTime()}@example.com`;

      // Enroll with bioData1
      await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData1,
        email
      );

      // Try to authenticate with bioData2
      await expect(
        authenticateWithBiometrics(
          EDV_URL,
          EDV_AUTH_KEY,
          bioData2,
          email
        )
      ).rejects.toThrow('Authentication failed: Invalid identifier');
    });

    it('should fail authentication with incorrect identifier', async () => {
      const bioData = createMockBiometricData();
      const email = `user${new Date().getTime()}@example.com`;

      // Enroll first
      await enrollUserWithBiometrics(
        EDV_URL,
        EDV_AUTH_KEY,
        bioData,
        email
      );

      // Try to authenticate with wrong email
      await expect(
        authenticateWithBiometrics(
          EDV_URL,
          EDV_AUTH_KEY,
          bioData,
          'wrong@example.com'
        )
      ).rejects.toThrow('Authentication failed: Invalid identifier');
    });
  });
});
