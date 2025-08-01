import {assertRpcService} from '../test-utils';
import {validation} from './configs';
import {utilCryptoService as service} from './service';
import {UtilCryptoServiceRpc} from './service-rpc';

describe('UtilCryptoService', () => {
  it('ServiceRpc', () => {
    assertRpcService(UtilCryptoServiceRpc, service, validation);
  });

  describe('service', () => {
    it('mnemonicGenerate', () => {
      const result = service.mnemonicGenerate(12);
      expect(typeof result).toBe('string');
    });

    describe('isBase64', () => {
      it('expect to be base64', async () => {
        expect(await service.isBase64('dGVzdA==')).toBe(true);
        expect(
          await service.isBase64(
            'eyJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLWVuY3J5cHRlZCtqc29uIiwicHJvdGVjdGVkIjoiZXlKbGJtTWlPaUpZUXpJd1VDSjkiLCJyZWNpcGllbnRzIjpbeyJoZWFkZXIiOnsia2lkIjoiZGlkOmtleTp6Nk1raE43UEJqV2dTTVEyNEJlYmRwdnZ3OGZWUnY3bTZNSERxaXdUS296ekJnckojejZMU29qOXpqWmhBcDdNUFFjUndDMnludUJYdXk5YkVnVks1aDNzVFo5c01nMUdtIiwiYWxnIjoiRUNESC0xUFUrQTI1NktXIiwiZXBrIjp7Imt0eSI6Ik9LUCIsImNydiI6IlgyNTUxOSIsIngiOiJoLXE4elVXVkt2VE9GQWNYUVRRbllvckhBQlk0Y044ZVNkRy1yT0JjWlFvIn0sImFwdSI6IlpHbGtPbXRsZVRwNk5rMXJhRTQzVUVKcVYyZFRUVkV5TkVKbFltUndkblozT0daV1VuWTNiVFpOU0VSeGFYZFVTMjk2ZWtKbmNrb2plalpNVTI5cU9YcHFXbWhCY0RkTlVGRmpVbmRETW5sdWRVSllkWGs1WWtWblZrczFhRE56VkZvNWMwMW5NVWR0IiwiYXB2IjoiWkdsa09tdGxlVHA2TmsxcmFFNDNVRUpxVjJkVFRWRXlORUpsWW1Sd2RuWjNPR1pXVW5ZM2JUWk5TRVJ4YVhkVVMyOTZla0puY2tvamVqWk1VMjlxT1hwcVdtaEJjRGROVUZGalVuZERNbmx1ZFVKWWRYazVZa1ZuVmtzMWFETnpWRm81YzAxbk1VZHQiLCJza2lkIjoiZGlkOmtleTp6Nk1raE43UEJqV2dTTVEyNEJlYmRwdnZ3OGZWUnY3bTZNSERxaXdUS296ekJnckojejZMU29qOXpqWmhBcDdNUFFjUndDMnludUJYdXk5YkVnVks1aDNzVFo5c01nMUdtIn0sImVuY3J5cHRlZF9rZXkiOiJNSUxvRFFBWEFFV0xTamdSVnZ3WlduLXE4RUlBUGtCUURpNWEtZDJvX084NW12OERnUncyZHcifV0sIml2IjoiT2FLY21DbW9GTDZiLVRxcVluQ1NUMGFLSkhoUTUwSW4iLCJjaXBoZXJ0ZXh0IjoiTkx4UkkxZjhaNVpQNTVjZVVubHk3SVBKOWpvbXItYUk5RkhlNW9xZHQ5cmNTb3h3RC1CdHItSHdvWmZRZFlPbVRzVndEaVpoQmdmT0ZMeVgtMExlbDl1U3piYjk3SzljQ3h2djBDVnF5a1lNQmpaTno2QWtVek9uS1p0ZWRrWnE3UXFRb2ZNMXoyOEt4SXc5emdSaDNDcWJ0MmpPbTZiMUxfbnkwOWF0TXdob2hZdUpPVko0R2FBdTBBZXJDaURjaDZsNFVGbzU3U2FEdWFvZ3VoTGZ4eUMzZjRFbGVpYUFOcTdmWmhYOEV5ZkxELWpqaEY0RlZocUhXbk5aRTRRbm5JdHhlblRtWi02b0hETDNnaUJCTXFlaXJpcTFFcWpFM1JfVUVqVlJJclEzTmZwSmZqc3V4MnBpY0k5RXp5ZUhMQSIsInRhZyI6IkVDX2NnZzVWSVdfWUNYdno3MzgyUHcifQ',
          ),
        ).toBe(true);
      });

      it('expect to not be base64', async () => {
        expect(await service.isBase64('wrong value')).toBe(false);
        expect(await service.isBase64('Test')).toBe(false);
      });
    });
  });
});
