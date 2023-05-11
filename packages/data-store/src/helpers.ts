export function documentHasType(document: any, type: string) {
  if (Array.isArray(document.type)) {
    return document.type.includes(type);
  }

  return document.type === type;
}
