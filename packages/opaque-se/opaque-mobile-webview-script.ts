import { Registration, Login } from "opaque-wasm";

window.registerInitialize = function (id: string, password: string) {
  const registration = new Registration();
  const message = registration.start(password);
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      id,
      result: message,
    })
  );
};
