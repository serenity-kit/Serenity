alert("BB");

import { Registration, Login } from "opaque-wasm";

// const toBase64 = (data: Uint8Array) => {
//   return btoa(String.fromCharCode.apply(null, [...data]));
// };

// const fromBase64 = (value: string) => {
//   return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
// };

const registration = new Registration();
// const login = new Login();

// alert("register on window");

window.registerInitialize = function (id: string, password: string) {
  // const message = registration.start(password);
  // window.ReactNativeWebView.postMessage(
  //   JSON.stringify({
  //     id,
  //     result: toBase64(message),
  //   })
  // );
};

// window.finishRegistration = function (id: string, challengeResponse: string) {
//   // const message = registration.finish(fromBase64(challengeResponse));
//   // window.ReactNativeWebView.postMessage(
//   //   JSON.stringify({
//   //     id,
//   //     result: {
//   //       exportKey: toBase64(registration.getExportKey()),
//   //       response: toBase64(message),
//   //     },
//   //   })
//   // );
// };

// window.startLogin = function (id: string, password: string) {
//   // const message = login.start(password);
//   // window.ReactNativeWebView.postMessage(
//   //   JSON.stringify({
//   //     id,
//   //     result: toBase64(message),
//   //   })
//   // );
// };

// window.finishLogin = function (id: string, response: string) {
//   // const message = login.finish(fromBase64(response));
//   // window.ReactNativeWebView.postMessage(
//   //   JSON.stringify({
//   //     id,
//   //     result: {
//   //       sessionKey: toBase64(login.getSessionKey()),
//   //       exportKey: toBase64(login.getExportKey()),
//   //       response: toBase64(message),
//   //     },
//   //   })
//   // );
// };
