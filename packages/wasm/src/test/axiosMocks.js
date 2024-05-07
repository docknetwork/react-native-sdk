import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import successData from './fixtures/subscan-success.json';
import paramsFailure from './fixtures/subscan-failure.json';
import requestFailure from './fixtures/subscan-too-many-requests.json';
import {SUBSCAN_TRANSFER_URL} from '../core/subscan';

const mockAdapter = new MockAdapter(axios);

export function mockSubscanSuccess() {
  mockAdapter.onPost(SUBSCAN_TRANSFER_URL).replyOnce(200, successData);
}

export function mockSubscanParamsFailure() {
  mockAdapter.onPost(SUBSCAN_TRANSFER_URL).replyOnce(200, paramsFailure);
}

export function mockSubscanRequestFailure() {
  mockAdapter.onPost(SUBSCAN_TRANSFER_URL).replyOnce(429, requestFailure);
}
