import assert from 'assert';
import {EventEmitter} from 'events';
import {Logger} from '../../core/logger';
import {dockService} from '../dock/service';

export const extrisicErrorsFilter = ({event}) => {
  return dockService.dock.api.events.system.ExtrinsicFailed.is(event);
};

export const mapEventToErrorMessage = ({event}) => {
  assert(!!event, 'event is required');

  const [error] = event.data;
  assert(!!error, 'error is required');

  if (error.isModule) {
    // for module errors, we have the section indexed, lookup
    const decoded = dockService.dock.api.registry.findMetaError(error.asModule);
    const {docs, method, section} = decoded;

    return `${section}.${method}: ${docs.join(' ')}`;
  }

  return error.toString();
};

export const getExtrinsicErrors = ({status, events}) =>
  events.filter(extrisicErrorsFilter).map(mapEventToErrorMessage);

export function signAndSend(account, extrinsic: any): EventEmitter {
  const emitter = new EventEmitter();

  function execute() {
    extrinsic
      .signAndSend(account, result => {
        const {status} = result;

        Logger.debug(`extrinsic update ${JSON.stringify(result)}`);

        if (status.isInBlock || status.isFinalized) {
          const errors = getExtrinsicErrors(result);

          if (!errors.length) {
            return emitter.emit('done', status.toHex());
          }

          emitter.emit('error', new Error(errors[0]));
          emitter.emit('errors', errors);
        } else if (status.isInvalid) {
          emitter.emit('error', new Error('Transaction status is invalid'));
        } else if (status.isDropped) {
          emitter.emit('error', new Error('Transaction status dropped'));
        } else if (status.isRetracted) {
          emitter.emit('error', new Error('Transaction status is retracted'));
        }
      })
      .catch(err => {
        emitter.emit('error', err);
      });
  }

  setTimeout(execute, 1);

  return emitter;
}
