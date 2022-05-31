import { Registration, Login } from "opaque-wasm";

const toBase64 = (data: Uint8Array) => {
  // @ts-expect-error automatic conversion just works
  return btoa(String.fromCharCode.apply(null, data));
};

const fromBase64 = (value: string) => {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
};

const registration = new Registration();
const login = new Login();

window._opaque = {};

window._opaque.registerInitialize = function (password: string) {
  const message = registration.start(password);
  return toBase64(message);
};

window._opaque.finishRegistration = function (challengeResponse: string) {
  const message = registration.finish(fromBase64(challengeResponse));
  return toBase64(message);
};

window._opaque.startLogin = function (password: string) {
  const message = login.start(password);
  return toBase64(message);
};

window._opaque.finishLogin = function (response: string) {
  const message = login.finish(fromBase64(response));
  return JSON.stringify({
    sessionKey: toBase64(login.getSessionKey()),
    exportKey: toBase64(login.getExportKey()),
    response: toBase64(message),
  });
};
