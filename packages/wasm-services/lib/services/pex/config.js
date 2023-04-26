import assert from 'assert';

export const serviceName = 'credentials';
export const validation = {
  filterCredentials: (params: FilterCredentialsParams) => {
    assert(params.credentials, 'credentials is required');
    assert(params.presentationDefinition, 'presentationDefinition is required');
  },
  evaluatePresentation: (params: EvaluatePresentationParams) => {
    assert(params.presentation, 'presentation is required');
    assert(params.presentationDefinition, 'presentationDefinition is required');
  },
};

export type FilterCredentialsParams = {
  credentials: any[],
  presentationDefinition: any,
  holderDid: string,
};

export type EvaluatePresentationParams = {
  presentation: any,
  presentationDefinition: any,
};
