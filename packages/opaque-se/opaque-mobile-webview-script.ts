import { Registration, Login } from "opaque-wasm";

const toText = (data: Uint8Array) => {
  // @ts-expect-error automatic conversion just works
  return btoa(String.fromCharCode.apply(null, data));
};

window.registerInitialize = function (id: string, password: string) {
  const registration = new Registration();
  const message = registration.start(password);
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      id,
      result: toText(message),
    })
  );
};
