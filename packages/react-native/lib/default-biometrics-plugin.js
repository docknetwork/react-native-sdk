import axios from 'axios';


function hasProofOfBiometrics(proofRequest) {
  // need to define which property will define that
  // it should be handled by certs maybe
}

// example key, TODO: move this to env variables
const DOCK_API_KEY = '<some-api-key>';

async function issueBiometricsVC() {
  // vcData
  const vcSubject = {
      timestamp: Date.now(),
      biometricsIdentifier: '123', // useSomeDeviceIdentifierhere() // use a device identifier
  }


  const options = {
  method: 'POST',
    url: 'https://***REMOVED***/credentials',
    headers: {
        'Content-Type': 'application/json',
        'DOCK-API-TOKEN': 
    },
    data: {
        anchor: false,
        persist: false,
        credential: {
        name: 'Biometrics Credential',
        type: ['VerifiableCredential', 'BiometricsCredential'],
        issuer: 'did:dock:5GJeBeStWSxqyPGUJnERMFhm3wKcfCZP6nhqtoKyRAmq9FeU',
        issuanceDate: '2024-01-09T19:14:04.108Z',
        subject: vcSubject,
        },
        algorithm: 'dockbbs+',
    },
  };

  const vc = await axios.request(options).then(function (response) {
    return response.data;
  });


  // mock-biometric check, use react-native

  return vc;
}

export const defaultBiometricsPlugin = {
  hasProofOfBiometrics,
  issueBiometricsVC,
};
