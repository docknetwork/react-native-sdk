import {blockchainService} from '../blockchain/service';

import {trustRegistryService as service} from './service';
import {
  TEST_SCHEMA_METADATA,
  TEST_TRUST_REGISTRIES,
  mockDockService,
} from '../test-utils';

describe('TrustRegistryService', () => {
  let unmockDockService;

  beforeAll(async () => {
    unmockDockService = await mockDockService();
  });

  it('should successfully fetch trust registries', async () => {
    const params = {
      schemaId: 'some-schema-id',
      issuerDID: 'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
      verifierDID: 'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
    };
    const result = await service.getTrustRegistries(params);

    const queryObject =
      blockchainService.dock.trustRegistry.registriesInfo.mock.calls[0][0];
    expect(queryObject.issuers.AnyOf).toHaveLength(1);
    expect(queryObject.verifiers.AnyOf).toHaveLength(1);
    expect(queryObject.schemaIds.AnyOf[0]).toEqual(
      '0x719455878946440f05937aba69d20a84ef32a2e254a03be324d72bf81d37d19b',
    );
    expect(result).toEqual(TEST_TRUST_REGISTRIES);
  });

  it('should successfully fetch trust registry verifiers', async () => {
    const trustRegistryId =
      '0xc255301bad77eab2a86760a80dfac734d85f1378b95671b169e3a519aa7eadd2';
    const params = {
      schemaId: 'some-schema-id',
      issuerDID: 'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
      trustRegistryId,
    };
    const result = await service.getTrustRegistryVerifiers(params);
    const queryObject =
      blockchainService.dock.trustRegistry.registrySchemasMetadata.mock
        .calls[0][0];

    expect(
      blockchainService.dock.trustRegistry.registrySchemasMetadata.mock
        .calls[0][1],
    ).toEqual(trustRegistryId);
    expect(queryObject.issuers.AnyOf).toHaveLength(1);
    expect(queryObject.schemaIds[0]).toEqual(
      '0x719455878946440f05937aba69d20a84ef32a2e254a03be324d72bf81d37d19b',
    );

    expect(result).toEqual(
      TEST_SCHEMA_METADATA[
        '0x719455878946440f05937aba69d20a84ef32a2e254a03be324d72bf81d37d19b'
      ].verifiers,
    );
  });

  afterAll(async () => {
    await unmockDockService();
  });
});
