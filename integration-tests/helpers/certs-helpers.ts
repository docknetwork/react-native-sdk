import assert from 'assert';
import axios from 'axios';

const certsApiURL = process.env.TESTING_API_URL || null;
const certsApiToken = process.env.CERTS_API_KEY;

export const ANY_CREDENTIAL_TEMPLATE_ID =
  '61146961-e1b2-4c08-bbc9-2bc9fd815575';

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
