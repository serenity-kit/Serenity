import { Registration, Login } from "opaque-wasm";

window._opaque = {};
window._opaque.registerInitialize = function (password: string) {
  const registration = new Registration();
  const message = registration.start(password);
  return message;
};
