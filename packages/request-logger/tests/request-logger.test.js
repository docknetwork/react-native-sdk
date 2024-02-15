import {getLocalStorage} from '@docknetwork/wallet-sdk-data-store/src';
import {RequestLogger} from '../lib/request-logger';
import {setV1LocalStorage} from '@docknetwork/wallet-sdk-data-store/src/migration/migration1/v1-data-store';

describe('Request logger', () => {
  beforeAll(() => {
    setV1LocalStorage(global.localStorage);
  });
  // it('expect to delete old logs before adding new log', () => {
  //   const realm = getRealm();
  //   const mockLog = {
  //     url: 'http://localhost',
  //     method: 'get',
  //     headers: {},
  //     body: {},
  //     response: {},
  //     status: 200,
  //   };
  //   RequestLogger.logRequest(mockLog);
  //   expect(realm.write).toBeCalled();
  //   expect(realm.delete).toBeCalled();
  // });
  it('expect to log request', async () => {
    const mockLog = {
      url: 'http://localhost',
      method: 'get',
      headers: {},
      body: {},
      response: {},
      status: 200,
    };
    await RequestLogger.logRequest(mockLog);
    expect(getLocalStorage().setItem).toBeCalled();
  });
  it('expect to export log request', () => {
    RequestLogger.exportLog();
    expect(getLocalStorage().getItem).toBeCalledWith('logs');
  });
  it('expect to delete logs', () => {
    RequestLogger.clearLogs();
    expect(getLocalStorage().removeItem).toBeCalledWith('logs');
  });
});
