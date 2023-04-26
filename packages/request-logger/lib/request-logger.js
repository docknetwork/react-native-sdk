import {getRealm} from '@docknetwork/wallet-sdk-wasm-services/lib/core/realm';
import assert from 'assert';
import {v4 as uuidv4} from 'uuid';
export const RequestLogger = (function () {
  const exportLog = () => {
    const realm = getRealm();
    return realm.objects('RequestLog').toJSON();
  };
  const subtractMonths = (numOfMonths, date = new Date()) => {
    date.setMonth(date.getMonth() - numOfMonths);
    return date;
  };
  const deleteOldLogs = () => {
    const realm = getRealm();
    const oneMonthAgo = subtractMonths(1);

    realm.write(() => {
      const oldLogsToClear = realm
        .objects('RequestLog')
        .filtered('createdAt <= $0', oneMonthAgo);
      realm.delete(oldLogsToClear);
    });
  };
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
    deleteOldLogs();
    const id = uuidv4();
    const realm = getRealm();

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

    realm.write(() => {
      realm.create('RequestLog', log);
    });
    return id;
  };
  const clearLogs = () => {
    const realm = getRealm();
    realm.write(() => {
      realm.delete(realm.objects('RequestLog'));
    });
  };
  return {
    exportLog,
    logRequest,
    clearLogs,
  };
})();
