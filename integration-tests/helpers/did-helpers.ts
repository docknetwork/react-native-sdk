import {getAllDocuments, getWallet} from './wallet-helpers';

const isDID = doc => doc.privateKeyMultibase && doc.controller;
const isDIDResolution = doc => doc.type === 'DIDResolutionResponse';

export async function getDIDKeyPairs() {
  const documents: any[] = await getAllDocuments();
  const dids = documents.filter(isDID);

  return dids.map(item => item.value);
}

export async function getDIDResolutions() {
  const documents: any[] = await getAllDocuments();
  const didResolutions = documents.filter(isDIDResolution);
  return didResolutions;
}

export async function createDID() {
  const wallet = getWallet();
  return null;
}
