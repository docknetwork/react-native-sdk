// @ts-nocheck
import {
  serviceName,
  validation,
  EvaluatePresentationParams,
  FilterCredentialsParams,
} from './config';
import {PEX} from '@sphereon/pex';

const pex: PEX = new PEX();


function removeOptionalAttribute(presentationDefinition) {
  presentationDefinition.input_descriptors.forEach(inputDescriptor => {
    if (inputDescriptor.constraints && inputDescriptor.constraints.fields) {
      inputDescriptor.constraints.fields = inputDescriptor.constraints.fields.filter(field => field.optional === undefined);
    }
  });

  return presentationDefinition;
}

class PEXService {
  name: string;

  constructor() {
    this.name = serviceName;
  }

  rpcMethods = [
    PEXService.prototype.filterCredentials,
    PEXService.prototype.evaluatePresentation,
  ];

  filterCredentials(params: FilterCredentialsParams) {
    validation.filterCredentials(params);
    const {credentials, presentationDefinition, holderDIDs} = params;
    const result = pex.selectFrom(
      removeOptionalAttribute(presentationDefinition),
      credentials,
      holderDIDs,
    );

    return result;
  }

  evaluatePresentation(params: EvaluatePresentationParams) {
    validation.evaluatePresentation(params);
    const {presentation, presentationDefinition} = params;
    const result = pex.evaluatePresentation(
      removeOptionalAttribute(presentationDefinition),
      presentation,
    );

    return result;
  }
}

export const pexService = new PEXService();
