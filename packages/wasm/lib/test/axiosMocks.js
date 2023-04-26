import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import successData from './fixtures/subscan-success.json';
import paramsFailure from './fixtures/subscan-failure.json';
import requestFailure from './fixtures/subscan-too-many-requests.json';

const mockAdapter = new MockAdapter(axios);

export function mockSubscanSuccess() {
  mockAdapter
    .onPost('https://dock.api.subscan.io/api/scan/transfers')
    .replyOnce(200, successData);
}

export function mockSubscanParamsFailure() {
  mockAdapter
    .onPost('https://dock.api.subscan.io/api/scan/transfers')
    .replyOnce(200, paramsFailure);
}

export function mockSubscanRequestFailure() {
  mockAdapter
    .onPost('https://dock.api.subscan.io/api/scan/transfers')
    .replyOnce(429, requestFailure);
}
