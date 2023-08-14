// inspired by https://stackoverflow.com/a/46700791
export function notNull<TypeValue>(
  value: TypeValue | null
): value is TypeValue {
  return value !== null;
}
