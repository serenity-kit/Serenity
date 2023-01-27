import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { WebViewSource } from "react-native-webview/lib/WebViewTypes";

type PromiseCallbacks = {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
};

declare global {
  var _opaque: any;
}

let counter = 0;
const promisesStorage: { [key: string]: PromiseCallbacks } = {};

export default function OpaqueBridge({ source }: { source: WebViewSource }) {
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

    global._opaque.finishRegistration = (
      password: string,
      challengeResponse: string
    ) => {
      counter++;
      const promise = new Promise((resolve, reject) => {
        promisesStorage[counter.toString()] = { resolve, reject };
      });
      webViewRef.current?.injectJavaScript(`
        window.finishRegistration("${counter}", "${password}", "${challengeResponse}");
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

    global._opaque.finishLogin = (password: string, response: string) => {
      counter++;
      const promise = new Promise((resolve, reject) => {
        promisesStorage[counter.toString()] = { resolve, reject };
      });
      webViewRef.current?.injectJavaScript(`
        window.finishLogin("${counter}", "${password}", "${response}");
        true;
      `);
      return promise;
    };
  }, []);

  return (
    <View style={{ height: 0, width: 0, overflow: "hidden" }}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={source}
        onMessage={async (event) => {
          const message = JSON.parse(event.nativeEvent.data);
          if (promisesStorage[message.id]) {
            promisesStorage[message.id].resolve(message.result);
            delete promisesStorage[message.id];
          }
        }}
      />
    </View>
  );
}
