import axios from 'axios';
import assert from 'assert';

// Sentry implementation will be injected by the wallet-app
let sentryCaptureException: any = error => {
  console.error(error);
};

export function setSentryCaptureException(impl: any) {
  sentryCaptureException = impl;
}

export function captureException(error) {
  if (sentryCaptureException) {
    sentryCaptureException(error);
  }
}


export const WalletDocumentTypes = {
  // This is used to store encrypted DIDComm messasges recieved from relay service
  DIDCommMessage: 'DIDCommMessage',
};

function isURL(str) {
  try {
    // eslint-disable-next-line no-new
    new URL(str);
    return true;
  } catch (err) {
    return false;
  }
}

export function getJSONFromURL(url: string) {
  return axios
    .get(url)
    .then(res => res.data)
    .catch(err => {
      console.error(`Error fetching ${url}`, err);
    });
}

export function getJSON(jsonOrURL: string | any) {
  assert(!!jsonOrURL, 'jsonOrURL is required');

  if (typeof jsonOrURL === 'object') {
    return jsonOrURL;
  }

  if (typeof jsonOrURL === 'string') {
    if (isURL(jsonOrURL)) {
      console.log(`Fetching ${jsonOrURL}`);
      return getJSONFromURL(jsonOrURL);
    } else {
      return JSON.parse(jsonOrURL);
    }
  }

  throw new Error(`Invalid data ${jsonOrURL}`);
}

export function replaceResponseURL(templateRequest){
  assert(process.env.TESTING_API_URL, "Please configure the TESTING_API_URL env var.");

  if (templateRequest?.response_url){
    templateRequest.response_url = templateRequest.response_url.replace("${TESTING_API_URL}", process.env.TESTING_API_URL);
  }

  return templateRequest;
}
