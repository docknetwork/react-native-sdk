import axios from 'axios';
import assert from 'assert';

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
  return axios.get(url).then(res => res.data);
}

export function getJSON(jsonOrURL: string | any) {
  assert(!!jsonOrURL, 'jsonOrURL is required');

  if (typeof jsonOrURL === 'object') {
    return jsonOrURL;
  }

  if (typeof jsonOrURL === 'string' && isURL(jsonOrURL)) {
    return getJSONFromURL(jsonOrURL);
  }

  throw new Error(`Invalid data ${jsonOrURL}`);
}
