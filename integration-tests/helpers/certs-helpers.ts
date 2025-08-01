import assert from 'assert';
import axios from 'axios';

const certsApiURL = process.env.TESTING_API_URL || null;
const certsApiToken = process.env.CERTS_API_KEY;

assert(!!process.env.PROOF_TEMPLATE_FOR_ANY_CREDENTIAL, 'PROOF_TEMPLATE_FOR_ANY_CREDENTIAL is not set');

export const ProofTemplateIds = {
  ANY_CREDENTIAL: process.env.PROOF_TEMPLATE_FOR_ANY_CREDENTIAL
};

export function getCertsApiURL() {
  assert(!!certsApiURL, 'Certs API URL is not set');
  return certsApiURL;
}

export function getCertsApiToken(): string {
  assert(!!certsApiToken, 'Certs API token is not set');
  return certsApiToken;
}

export async function createProofRequest(templateId: string) {
  console.log('Requesting proof from Certs API');
  const {data} = await axios.post(
    `${getCertsApiURL()}/proof-templates/${templateId}/request`,
    {},
    {
      headers: {
        'DOCK-API-TOKEN': getCertsApiToken(),
      },
    },
  );

  if (!data.request.id) {
    data.request.id = data.id;
  }

  console.log('Proof request received');
  console.log(JSON.stringify(data, null, 2));

  return data;
}


export function issueCredential({subjectDID}) {
  console.log('Issuing credential for DID', subjectDID);

  return axios.post(
    `${certsApiURL}/credentials`,
    {
      anchor: false,
      persist: false,
      credential: {
        name: 'Test2',
        type: ['VerifiableCredential', 'BasicCredential'],
        issuer: 'did:dock:5GJeBeStWSxqyPGUJnERMFhm3wKcfCZP6nhqtoKyRAmq9FeU',
        issuanceDate: '2023-11-01T15:43:59.361Z',
        subject: {
          id: subjectDID,
          name: 'Test',
        },
      },
      algorithm: 'dockbbs+',
      distribute: true,
    },
    {
      headers: {
        'DOCK-API-TOKEN': process.env.CERTS_API_KEY,
        'Content-Type': 'application/json',
      },
    },
  );
}
