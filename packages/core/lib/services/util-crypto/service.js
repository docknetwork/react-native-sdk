import assert from 'assert';
import {EventEmitter, once} from 'events';

import {validation, SumParams} from './configs';

export class ExampleService {
  
  rpcMethods = [
    ExampleService.prototype.sum,
  ];

  constructor() {
      
  }

  sum(params: SumParams) {
    validation.sum(params);

    return params.number1 + params.number2;
  }
}


export const exampleService:ExampleService = new ExampleService();

