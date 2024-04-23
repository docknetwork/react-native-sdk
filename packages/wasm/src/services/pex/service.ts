// @ts-nocheck
import {
  serviceName,
  validation,
  EvaluatePresentationParams,
  FilterCredentialsParams,
} from './config';
import {PEX} from '@sphereon/pex';

const pex: PEX = new PEX();

/**
 * @sphereon/pex is not able to handle optional attributes in the presentation definition
 * https://github.com/Sphereon-Opensource/PEX/issues/150
 * Any optional attribute in the presentation definition will cause the library to throw an error
 * This function removes the optional attribute from the presentation definition
 * This is a temporary workaround until the issue is fixed in the @sphereon/pex library
 **/
export function removeOptionalAttribute(presentationDefinition) {
  presentationDefinition.input_descriptors.forEach(inputDescriptor => {
    if (!inputDescriptor.constraints?.fields?.length) {
      return;
    }
    // Filter the optional fields
    // If we include those fields, it might exclude few credentials from the resulsts
    // e.g: Expiration date as optional, a credenntial without expiration date should be included
    inputDescriptor.constraints.fields =
      inputDescriptor.constraints.fields.filter(
        field => field.optional !== true,
      );

    // Removes the optinal attributes from the fields
    // It applies in case optional: false
    // The field is required, but pex doesn't support the attribute
    inputDescriptor.constraints.fields.forEach(field => {
      if (field.optional !== undefined) {
        delete field.optional;
      }
    });

    // There is a case where ALL fields are optional
    // If we remove all fields, it will cause an error with PEX
    // So, we add a placeholder field to avoid the error
    if (inputDescriptor.constraints.fields.length === 0) {
      inputDescriptor.constraints.fields.push({
        path: '$.id',
      });
    }
  });

  if (!presentationDefinition.id) {
    presentationDefinition.id = 'id';
  }

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
