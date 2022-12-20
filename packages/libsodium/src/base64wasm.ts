import sodium from "libsodium-wrappers";

export const from_base64_to_string = (data: string): string => {
  return sodium.to_string(sodium.from_base64(data));
};
