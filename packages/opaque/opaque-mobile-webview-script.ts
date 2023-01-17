import "regenerator-runtime/runtime.js";
import { base64ToArrayBuffer } from "./src/base64ToArrayBuffer";
import { wasmBase64String } from "./src/opaque-wasm-base64";
import init, { Login, Registration } from "./vendor/opaque-wasm-web-build";

init(base64ToArrayBuffer(wasmBase64String));

const toBase64 = (data: Uint8Array) => {
  return btoa(String.fromCharCode.apply(null, [...data]));
};

const fromBase64 = (value: string) => {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
};

let registration: Registration | null = null;
let login: Login | null = null;

window.registerInitialize = function (id: string, password: string) {
  registration = new Registration();
  const message = registration.start(password);
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      id,
      result: toBase64(message),
    })
  );
};

window.finishRegistration = function (
  id: string,
  password: string,
  challengeResponse: string
) {
  if (registration === null) {
    throw new Error("Failed to initialize WebView Registration");
  }
  const message = registration.finish(password, fromBase64(challengeResponse));
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      id,
      result: {
        exportKey: toBase64(registration.getExportKey()),
        response: toBase64(message),
      },
    })
  );
};

window.startLogin = function (id: string, password: string) {
  login = new Login();
  const message = login.start(password);
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      id,
      result: toBase64(message),
    })
  );
};

window.finishLogin = function (id: string, password: string, response: string) {
  if (login === null) {
    throw new Error("Failed to initialize WebView Login");
  }
  const message = login.finish(password, fromBase64(response));
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      id,
      result: {
        sessionKey: toBase64(login.getSessionKey()),
        exportKey: toBase64(login.getExportKey()),
        response: toBase64(message),
      },
    })
  );
};
