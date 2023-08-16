function isURL(str) {
  try {
    // eslint-disable-next-line no-new
    new URL(str);
    return true;
  } catch (err) {
    return false;
  }
}

export function getJSONOrUrl(data) {}
