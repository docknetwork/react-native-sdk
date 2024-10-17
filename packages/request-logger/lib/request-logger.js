// import {getRealm} from '@docknetwork/wallet-sdk-wasm/src/core/realm';

import assert from 'assert';
import {v4 as uuidv4} from 'uuid';
import { getLocalStorage } from '@docknetwork/wallet-sdk-data-store/lib';


async function getAllLogs() {
  try {
    const data = await getLocalStorage().getItem('logs');
    return JSON.parse(data);
  } catch(err) {
    return [];
  }
}

async function appendLog(log) {
  try {
    const data = await getAllLogs();
    data.push(log);
    await getLocalStorage().setItem('logs', JSON.stringify(data));
  } catch(err) {
    console.error(err);
  }
}

export const RequestLogger = (function () {
  const exportLog = async () => {
    return getAllLogs();
  };
  // Revisit this logic as part of https://dock-team.atlassian.net/browse/DCKM-313
  // const subtractMonths = (numOfMonths, date = new Date()) => {
  //   date.setMonth(date.getMonth() - numOfMonths);
  //   return date;
  // };
  // const deleteOldLogs = () => {
    // realm.write(() => {
    //   const oldLogsToClear = realm
    //     .objects('RequestLog')
    //     .filtered('createdAt <= $0', oneMonthAgo);
    //   realm.delete(oldLogsToClear);
    // });
  // };
  const logRequest = ({
    status,
    url,
    method,
    headers = {},
    body = {},
    response,
  }) => {
    assert(typeof url === 'string', 'invalid url');
    assert(typeof method === 'string', 'invalid method');
    // Revisit this logic as part of https://dock-team.atlassian.net/browse/DCKM-313
    // deleteOldLogs();
    const id = uuidv4();

    const log = {
      id,
      url,
      method,
      status,
      headers: JSON.stringify(headers),
      body: JSON.stringify(body),
      response: JSON.stringify(response),
      createdAt: new Date().toISOString(),
    };

    appendLog(log);

    return id;
  };
  const clearLogs = () => {
    getLocalStorage().removeItem('logs');
  };
  return {
    exportLog,
    logRequest,
    clearLogs,
  };
})();
