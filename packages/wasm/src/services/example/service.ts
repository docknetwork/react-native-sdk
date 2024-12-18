// @ts-nocheck
import {SumParams, validation} from './configs';

export class ExampleService {
  rpcMethods = [ExampleService.prototype.sum];

  constructor() {
    this.name = 'example';
  }

  sum(params: SumParams) {
    validation.sum(params);

    return params.number1 + params.number2;
  }
}

export const exampleService: ExampleService = new ExampleService();
