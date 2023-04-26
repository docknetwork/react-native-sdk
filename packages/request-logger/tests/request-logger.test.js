import {RequestLogger} from '../lib/request-logger';
import {getRealm} from '@docknetwork/wallet-sdk-wasm/lib/core/realm';
jest.mock('@docknetwork/wallet-sdk-wasm/lib/core/realm', () => {
  const realmFunctions = {
    write: jest.fn(callback => {
      callback();
    }),
    create: jest.fn(),
    delete: jest.fn(),
    objects: jest.fn(() => ({
      filtered: jest.fn(),
      toJSON: jest.fn(),
    })),
  };
  return {
    getRealm: () => realmFunctions,
    addSchema: jest.fn(),
    clearCacheData: jest.fn(),
  };
});
describe('Request logger', () => {
  it('expect to delete old logs before adding new log', () => {
    const realm = getRealm();
    const mockLog = {
      url: 'http://localhost',
      method: 'get',
      headers: {},
      body: {},
      response: {},
      status: 200,
    };
    RequestLogger.logRequest(mockLog);
    expect(realm.write).toBeCalled();
    expect(realm.delete).toBeCalled();
  });
  it('expect to log request', () => {
    const realm = getRealm();
    const mockLog = {
      url: 'http://localhost',
      method: 'get',
      headers: {},
      body: {},
      response: {},
      status: 200,
    };
    RequestLogger.logRequest(mockLog);
    expect(realm.write).toBeCalled();
    expect(realm.create).toBeCalledWith('RequestLog', {
      id: expect.any(String),
      createdAt: expect.any(String),
      url: 'http://localhost',
      method: 'get',
      headers: '{}',
      body: '{}',
      response: '{}',
      status: 200,
    });
  });
  it('expect to export log request', () => {
    const realm = getRealm();
    RequestLogger.exportLog();
    expect(realm.objects).toBeCalledWith('RequestLog');
  });
  it('expect to delete logs', () => {
    const realm = getRealm();
    RequestLogger.clearLogs();
    expect(realm.write).toBeCalled();
    expect(realm.delete).toBeCalled();
    expect(realm.objects).toBeCalledWith('RequestLog');
  });
});
