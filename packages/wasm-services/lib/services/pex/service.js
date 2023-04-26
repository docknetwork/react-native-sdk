import {
  serviceName,
  validation,
  EvaluatePresentationParams,
  FilterCredentialsParams,
} from './config';
import {PEX} from '@sphereon/pex';

const pex: PEX = new PEX();

class PEXService {
  constructor() {
    this.name = serviceName;
  }

  rpcMethods = [
    PEXService.prototype.filterCredentials,
    PEXService.prototype.evaluatePresentation,
  ];

  filterCredentials(params: FilterCredentialsParams) {
    validation.filterCredentials(params);
    const {credentials, presentationDefinition, holderDid} = params;
    const result = pex.selectFrom(
      presentationDefinition,
      credentials,
      holderDid,
    );

    return result;
  }

  evaluatePresentation(params: EvaluatePresentationParams) {
    validation.evaluatePresentation(params);
    const {presentation, presentationDefinition} = params;
    const result = pex.evaluatePresentation(
      presentationDefinition,
      presentation,
    );

    return result;
  }
}

export const pexService = new PEXService();
