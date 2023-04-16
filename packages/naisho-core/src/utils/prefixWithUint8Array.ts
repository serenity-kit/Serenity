export function prefixWithUint8Array(
  value: string | Uint8Array,
  prefix: Uint8Array
): string | Uint8Array {
  if (typeof value === "string") {
    const encoder = new TextEncoder();
    const valueUint8Array = encoder.encode(value);
    const result = new Uint8Array(prefix.length + valueUint8Array.length);

    result.set(prefix);
    result.set(valueUint8Array, prefix.length);

    const decoder = new TextDecoder();
    return decoder.decode(result);
  } else {
    const result = new Uint8Array(prefix.length + value.length);

    result.set(prefix);
    result.set(value, prefix.length);

    return result;
  }
}
