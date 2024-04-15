import {JSONPath} from '@astronautlabs/jsonpath';

export const EPSILON_NUMBER = 0.0001;
export const EPSILON_INT = 1;

export const MAX_DATE_PLACEHOLDER = 884541351600000;
export const MIN_DATE_PLACEHOLDER = -17592186044415;
export const MAX_NUMBER = 100 ** 9;
export const MIN_NUMBER = -4294967295;

/*
  PEX Filter rules:
    greater-than - Use the exclusiveMinimum descriptor
    less-than - Use the exclusiveMaximum descriptor
    greater-than or equal-to - Use the minimum descriptor
    less-than or equal-to - Use the maximum descriptor
*/

function correctFieldPath(path) {
  // NOTE: may not work for advanced jsonpath selectors, needs investigation
  return path.replace('$.', '');
}

function getAttributeName({field, selectedCredentials, index}) {
  let attributeName;
  if (Array.isArray(field.path) && field.path.length > 1) {
    const selectedCredential = selectedCredentials[index];
    if (!selectedCredential) {
      throw new Error(`Expected selected credential at index ${index}`);
    }

    // Must find a path that matches in selectedcredential, and choose that for bounds
    const pathCount = field.path.length;
    for (let i = 0; i < pathCount; i++) {
      const path = field.path[i];
      const paths = JSONPath.paths(selectedCredential, path);
      if (paths.length) {
        // First come first served
        attributeName = correctFieldPath(JSONPath.stringify(paths[0]));
        break;
      }
    }
  } else {
    attributeName = correctFieldPath(
      Array.isArray(field.path) ? field.path[0] : field.path,
    );
  }

  return attributeName;
}

export function pexToBounds(pexRequest, selectedCredentials = []) {
  const descriptorBounds = [];

  // One list of bounds per descriptor/credential
  pexRequest.input_descriptors.forEach((inputDescriptor, index) => {
    const bounds = [];
    inputDescriptor.constraints.fields.forEach(field => {
      const {
        exclusiveMaximum,
        exclusiveMinimum,
        formatMaximum,
        formatMinimum,
        maximum,
        minimum,
        format,
        type,
      } = field.filter || {};

      let max =
        maximum === undefined
          ? formatMaximum === undefined
            ? exclusiveMaximum
            : formatMaximum
          : maximum;

      let min =
        minimum === undefined
          ? formatMinimum === undefined
            ? exclusiveMinimum
            : formatMinimum
          : minimum;

      if (max === undefined && min === undefined) {
        return;
      }

      // Get min/max bounds values, if using exclusive we must apply an epsilon so equality isnt true
      if (format === 'date-time' || format === 'date') {
        max = new Date(max === undefined ? MAX_DATE_PLACEHOLDER : max);
        min = new Date(min === undefined ? MIN_DATE_PLACEHOLDER : min);
      } else if (type === 'number') {
        max =
          max === undefined
            ? MAX_NUMBER
            : exclusiveMaximum === undefined
            ? max
            : max - EPSILON_NUMBER;
        min =
          min === undefined
            ? MIN_NUMBER
            : exclusiveMinimum === undefined
            ? min
            : min + EPSILON_NUMBER;
      } else if (type === 'integer') {
        max =
          max === undefined
            ? MAX_NUMBER
            : exclusiveMaximum === undefined
            ? max
            : max - EPSILON_INT;
        min =
          min === undefined
            ? MIN_NUMBER
            : exclusiveMinimum === undefined
            ? min
            : min + EPSILON_INT;
      } else {
        throw new Error(
          `Unsupported format ${format} and type ${type} for enforce bounds`,
        );
      }

      const attributeName = getAttributeName({
        field,
        selectedCredentials,
        index,
      });

      bounds.push({
        attributeName,
        min,
        max,
      });
    });

    descriptorBounds.push(bounds);
  });

  return descriptorBounds;
}

const attributesToSkip = [
  /^type/,
  /^issuer/,
  /^@context/,
  /^proof/,
  /^credentialSchema/,
];

const shouldSkipAttribute = attributeName =>
  attributesToSkip.some(regex => regex.test(attributeName));

export function getPexRequiredAttributes(pexRequest, selectedCredentials = []) {
  return pexRequest.input_descriptors
    .map((inputDescriptor, index) => {
      return inputDescriptor.constraints.fields
        .filter(field => {
          if (field.filter) {
            return false;
          }

          try {
            if (!selectedCredentials[index]) {
              return false;
            }

            const paths = Array.isArray(field.path)
              ? field.path.flatMap(singlePath =>
                  JSONPath.paths(selectedCredentials[index], singlePath),
                )
              : JSONPath.paths(selectedCredentials[index], field.path);

            return paths.length !== 0;
          } catch (error) {
            console.log(field);
            console.error(error);
            return false;
          }
        })
        .map(field => getAttributeName({field, selectedCredentials, index}))
        .filter(attributeName => {
          return !shouldSkipAttribute(attributeName);
        });
    })
    .filter(requiredAttributes => requiredAttributes.length > 0);
}
