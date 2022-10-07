import { Login, Registration } from "opaque-wasm";

const toBase64 = (data: Uint8Array) => {
  return btoa(String.fromCharCode.apply(null, [...data]));
};

const fromBase64 = (value: string) => {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
};

let registration = new Registration();
let login = new Login();

window._opaque = {};

window._opaque.registerInitialize = function (password: string) {
  registration = new Registration();
  const message = registration.start(password);
  return toBase64(message);
};

window._opaque.finishRegistration = function (challengeResponse: string) {
  const message = registration.finish(fromBase64(challengeResponse));
  return {
    exportKey: toBase64(registration.getExportKey()),
    response: toBase64(message),
  };
};

window._opaque.startLogin = function (password: string) {
  login = new Login();
  const message = login.start(password);
  return toBase64(message);
};

window._opaque.finishLogin = function (response: string) {
  const message = login.finish(fromBase64(response));
  return {
    sessionKey: toBase64(login.getSessionKey()),
    exportKey: toBase64(login.getExportKey()),
    response: toBase64(message),
  };
};
