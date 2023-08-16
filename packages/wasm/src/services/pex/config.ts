import assert from 'assert';

export const serviceName = 'pex';
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
  credentials: any[];
  presentationDefinition: any;
  holderDIDs: string[];
};

export type EvaluatePresentationParams = {
  presentation: any;
  presentationDefinition: any;
};
