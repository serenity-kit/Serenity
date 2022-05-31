import React, { useRef, useEffect } from "react";
import { Platform } from "react-native";
import { WebView } from "react-native-webview";

type PromiseCallbacks = {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
};

declare global {
  var _opaque: any;
}

let editorSource =
  Platform.OS !== "android" ? require("../dist/index.html") : { html: null };

let counter = 0;
const promisesStorage: { [key: string]: PromiseCallbacks } = {};

export default function OpaqueBridge() {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    global._opaque = {};

    global._opaque.registerInitialize = (password: string) => {
      counter++;
      const promise = new Promise((resolve, reject) => {
        promisesStorage[counter.toString()] = { resolve, reject };
      });
      webViewRef.current?.injectJavaScript(`
        window.registerInitialize("${counter}", "${password}");
        true;
      `);
      return promise;
    };

    global._opaque.finishRegistration = (challengeResponse: string) => {
      counter++;
      const promise = new Promise((resolve, reject) => {
        promisesStorage[counter.toString()] = { resolve, reject };
      });
      webViewRef.current?.injectJavaScript(`
        window.registerInitialize("${counter}", "${challengeResponse}");
        true;
      `);
      return promise;
    };

    global._opaque.startLogin = (password: string) => {
      counter++;
      const promise = new Promise((resolve, reject) => {
        promisesStorage[counter.toString()] = { resolve, reject };
      });
      webViewRef.current?.injectJavaScript(`
        window.startLogin("${counter}", "${password}");
        true;
      `);
      return promise;
    };

    global._opaque.finishLogin = (response: string) => {
      counter++;
      const promise = new Promise((resolve, reject) => {
        promisesStorage[counter.toString()] = { resolve, reject };
      });
      webViewRef.current?.injectJavaScript(`
        window.finishLogin("${counter}", "${response}");
        true;
      `);
      return promise;
    };
  }, []);

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={["*"]}
      source={editorSource}
      onMessage={async (event) => {
        const message = JSON.parse(event.nativeEvent.data);
        if (promisesStorage[message.id]) {
          promisesStorage[message.id].resolve(message.result);
          delete promisesStorage[message.id];
        }
      }}
    />
  );
}
