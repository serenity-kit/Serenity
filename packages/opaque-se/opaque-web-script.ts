import { Registration, Login } from "opaque-wasm";

const toText = (data: Uint8Array) => {
  // @ts-expect-error automatic conversion just works
  return btoa(String.fromCharCode.apply(null, data));
};

window._opaque = {};
window._opaque.registerInitialize = function (password: string) {
  const registration = new Registration();
  const message = registration.start(password);
  return toText(message);
};
