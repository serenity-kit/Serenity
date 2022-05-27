import React, { useRef, useEffect } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { WebView } from "react-native-webview";

let editorSource =
  Platform.OS !== "android" ? require("../dist/index.html") : { html: null };

let counter = 0;
const resolveStorage = {};

export default function OpaqueBridge() {
  const webViewRef = useRef(null);

  useEffect(() => {
    global._opaque = {};
    global._opaque.registerInitialize = (password: string) => {
      counter++;
      const promise = new Promise((resolve) => {
        resolveStorage[counter] = resolve;
      });
      webViewRef.current?.injectJavaScript(`
        window.registerInitialize("${counter}", "${password}");
        true;
      `);
      return promise;
    };
  }, []);

  return (
    <View>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={editorSource}
        onMessage={async (event) => {
          const message = JSON.parse(event.nativeEvent.data);
          if (resolveStorage[message.id]) {
            resolveStorage[message.id](message.result);
          }
        }}
      />
      <Pressable
        onPress={async () => {
          const x = await global._opaque.registerInitialize("aa");
          console.log(x);
        }}
      >
        <Text>RUN</Text>
      </Pressable>
    </View>
  );
}
