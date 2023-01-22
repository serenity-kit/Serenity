export const base64_to_url_safe_base64 = (value: string) => {
  return value.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
};

export const url_safe_base64_to_base64 = (value: string) => {
  let newValue = value.replaceAll("-", "+").replaceAll("_", "/");
  while (newValue.length % 4) {
    newValue += "=";
  }
  return newValue;
};

export default {
  base64_to_url_safe_base64,
  url_safe_base64_to_base64,
};
