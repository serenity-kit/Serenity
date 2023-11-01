// inspired by https://stackoverflow.com/a/46700791
export function notUndefined<TypeValue>(
  value: TypeValue | undefined
): value is TypeValue {
  return value !== undefined;
}
