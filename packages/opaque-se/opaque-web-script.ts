import { Registration, Login } from "opaque-wasm";

const toBase64 = (data: Uint8Array) => {
  // @ts-expect-error automatic conversion just works
  return btoa(String.fromCharCode.apply(null, data));
};

const fromBase64 = (value: string) => {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
};

const registration = new Registration();

window._opaque = {};

window._opaque.registerInitialize = function (password: string) {
  const message = registration.start(password);
  return toBase64(message);
};

window._opaque.finishRegistration = function (challengeResponse: string) {
  const message = registration.finish(fromBase64(challengeResponse));
  return toBase64(message);
};
