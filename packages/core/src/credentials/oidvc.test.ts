import {
  acquireOpenIDCredentialFromURI,
  getAuthURL,
  decodeRequestJWT,
  getPresentationSubmision,
} from './oidvc'; // replace with your actual file path
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';
import {MetadataClient} from '@sphereon/oid4vci-client';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import {pexService} from '@docknetwork/wallet-sdk-wasm/src/services/pex';

jest.mock('@docknetwork/wallet-sdk-wasm/src/services/credential');
jest.mock('@sphereon/oid4vci-client');
jest.mock('jwt-decode');
jest.mock('axios');
jest.mock('@docknetwork/wallet-sdk-wasm/src/services/pex');

describe('acquireOpenIDCredentialFromURI', () => {
  const didProvider: any = {
    getDIDKeyPairs: jest.fn(),
  };

  const uri = 'https://example.com/credential';

  beforeEach(() => {
    didProvider.getDIDKeyPairs.mockResolvedValue([{id: 'did:example:123'}]);
    (credentialServiceRPC.acquireOIDCredential as jest.Mock).mockResolvedValue({
      credential: 'fake-credential',
    });
  });

  it('should acquire OID credential without authorization URL', async () => {
    const response = await acquireOpenIDCredentialFromURI({didProvider, uri});
    expect(didProvider.getDIDKeyPairs).toHaveBeenCalled();
    expect(credentialServiceRPC.acquireOIDCredential).toHaveBeenCalledWith({
      uri,
      holderKeyDocument: {id: 'did:example:123'},
    });
    expect(response).toBe('credential');
  });

  it('should acquire OID credential with authorization URL', async () => {
    const getAuthCode = jest.fn().mockResolvedValue('auth-code');
    (credentialServiceRPC.acquireOIDCredential as jest.Mock).mockResolvedValueOnce({
      authorizationURL: 'https://example.com/auth',
    });

    const response = await acquireOpenIDCredentialFromURI({
      didProvider,
      uri,
      getAuthCode,
    });
    expect(getAuthCode).toHaveBeenCalledWith('https://example.com/auth');
    expect(credentialServiceRPC.acquireOIDCredential).toHaveBeenCalledWith({
      uri,
      holderKeyDocument: {id: 'did:example:123'},
      authorizationCode: 'auth-code',
    });
    expect(response).toBe('credential');
  });
});

describe('getAuthURL', () => {
  it('should generate an auth URL', async () => {
    const uri = 'https://example.com?client_id=fake-client';
    const metadata = {
      authorizationServerMetadata: {
        request_object_signing_alg_values_supported: ['RS256'],
      },
      authorization_endpoint: 'https://auth.example.com/authorize',
    };
    (MetadataClient.retrieveAllMetadata as jest.Mock).mockResolvedValue(metadata);

    const result = await getAuthURL(uri);
    expect(MetadataClient.retrieveAllMetadata).toHaveBeenCalledWith(
      'fake-client',
    );
    expect(result).toContain('https://auth.example.com/authorize?');
    expect(result).toContain('client_id=dock-wallet');
    expect(result).toContain('redirect_uri=dockwallet://vp');
  });
});

describe('decodeRequestJWT', () => {
  it('should decode JWT from the request URI', async () => {
    const uri = 'https://example.com?request_uri=https://example.com/jwt';
    const jwt = 'some-jwt';
    const decodedJWT = {sub: '1234567890', name: 'Testing', admin: true};
    (axios.get as jest.Mock).mockResolvedValue({data: jwt});
    (jwtDecode as jest.Mock).mockReturnValue(decodedJWT);

    const result = await decodeRequestJWT(uri);
    expect(axios.get).toHaveBeenCalledWith('https://example.com/jwt');
    expect(jwtDecode).toHaveBeenCalledWith(jwt);
    expect(result).toEqual(decodedJWT);
  });
});

describe('getPresentationSubmision', () => {
  it('should get presentation submission', async () => {
    const credentials = [{id: 'credential-1'}];
    const presentationDefinition = {id: 'presentation-definition-1'};
    const holderDID = 'did:example:123';
    const presentationSubmission = {definition_id: 'presentation-submission-1'};

    (pexService.presentationFrom as jest.Mock).mockResolvedValue({
      presentation_submission: presentationSubmission,
    });

    const result = await getPresentationSubmision({
      credentials,
      presentationDefinition,
      holderDID,
    });

    expect(pexService.presentationFrom).toHaveBeenCalledWith({
      presentationDefinition,
      credentials,
      holderDID,
    });
    expect(result).toEqual(presentationSubmission);
  });
});
