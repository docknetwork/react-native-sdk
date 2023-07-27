import axios from 'axios';
import {
  mockSubscanParamsFailure,
  mockSubscanRequestFailure,
  mockSubscanSuccess,
} from './axiosMocks';

describe('Subscan mock', () => {
  it('expect to return success response', async () => {
    mockSubscanSuccess();

    const res = await axios.post(
      'https://dock.api.subscan.io/api/scan/transfers',
      {
        address: '3Dj6YssQkpo1HVJ6Mkxjd25EwZNAeVgKCGtBp5u3RtdWX9y9',
        row: 50,
        page: 0,
      },
    );

    expect(res.status).toBe(200);
    expect(res.data.message).toBe('Success');
  });

  it('expect to return params failure response', async () => {
    mockSubscanParamsFailure();

    const res = await axios.post(
      'https://dock.api.subscan.io/api/scan/transfers',
      {
        address: '3Dj6YssQkpo1HVJ6Mkxjd25EwZNAeVgKCGtBp5u3RtdWX9y9',
        row: 50,
        page: 0,
      },
    );

    expect(res.status).toBe(200);
    expect(res.data.message).toBe('Params Error');
  });

  it('expect to return request failure response', async () => {
    mockSubscanRequestFailure();

    const error = await axios
      .post('https://dock.api.subscan.io/api/scan/transfers', {
        address: '3Dj6YssQkpo1HVJ6Mkxjd25EwZNAeVgKCGtBp5u3RtdWX9y9',
        row: 50,
        page: 0,
      })
      .catch(data => data);

    expect(error.response.status).toBe(429);
  });
});
