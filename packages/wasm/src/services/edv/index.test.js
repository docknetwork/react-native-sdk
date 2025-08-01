import base64url from 'base64url-universal';

import {assertRpcService} from '../test-utils';
import {validation} from './configs';
import {edvService as service} from './service';
import {EDVServiceRpc} from './service-rpc';

describe('EDVService', () => {
  it('ServiceRpc', () => {
    assertRpcService(EDVServiceRpc, service, validation);
  });

  describe('service', () => {
    beforeAll(async () => {});

    describe('generateKeys', () => {
      it('should generate EDV keys', async () => {
        const keys = await service.generateKeys();

        expect(keys.agreementKey).toBeDefined();
        expect(keys.hmacKey).toBeDefined();
        expect(keys.verificationKey).toBeDefined();
      });
    });

    describe('deriveKeys', () => {
      it('should derive EDV keys', async () => {
        const testMasterKey = new Uint8Array(
          base64url.decode('0O+9vxwb3Zo/9AVcQfVeQ59wvgcYUVH/mTye6islspM='),
        );
        const derivedTestAgreementKey =
          '{"id":"did:key:z6Mkt1paLGw6VqRCTmqjpbiP9fxLVHJb8k97zERL6TcWr9Ru#z6LSojEubzYtAGCBE7Mwwks7J3Gttsrd1c9EXcDuNjthwVQj","controller":"did:key:z6Mkt1paLGw6VqRCTmqjpbiP9fxLVHJb8k97zERL6TcWr9Ru","type":"X25519KeyAgreementKey2020","publicKeyMultibase":"z6LSojEubzYtAGCBE7Mwwks7J3Gttsrd1c9EXcDuNjthwVQj","privateKeyMultibase":"z3weoV5H5DppQ7pjABoopaiDFN6zH3SokESte2Jte87YNXgg"}';
        const derivedTestHmacKey =
          '0O-9vxwb3Zo_9AVcQfVeQ59wvgcYUVH_mTye6islspM';
        const derivedTestVerificationKey =
          '{"id":"did:key:z6Mkt1paLGw6VqRCTmqjpbiP9fxLVHJb8k97zERL6TcWr9Ru#z6Mkt1paLGw6VqRCTmqjpbiP9fxLVHJb8k97zERL6TcWr9Ru","controller":"did:key:z6Mkt1paLGw6VqRCTmqjpbiP9fxLVHJb8k97zERL6TcWr9Ru","type":"Ed25519VerificationKey2018","publicKeyBase58":"EZZXk2gfAHvjMH1392kYJaQLfi2jirtmJDWQGBeVvveX","privateKeyBase58":"5BHUEjDDbDzQKnveM9qXXXmRqwTtmBvumTY2xZXN61x8dvZHgzsDaTpkVqkE4LSoMLcV6yDRhxcv7mMTzdaJ21pX"}';
        const {agreementKey, hmacKey, verificationKey} =
          await service.deriveKeys(testMasterKey);

        expect(hmacKey).toBeDefined();
        expect(hmacKey).toBe(derivedTestHmacKey);
        expect(verificationKey).toBeDefined();
        expect(JSON.stringify(verificationKey)).toBe(
          derivedTestVerificationKey,
        );
        expect(agreementKey).toBeDefined();
        expect(JSON.stringify(agreementKey)).toBe(derivedTestAgreementKey);
      });
    });
  });
});
