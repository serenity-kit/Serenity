import React, { useRef } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { WebView } from "react-native-webview";

let editorSource =
  Platform.OS !== "android" ? require("../dist/index.html") : { html: null };

export default function OpaqueBridge() {
  const webViewRef = useRef(null);

  return (
    <View>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={editorSource}
        onError={(e) => alert("ee")}
        onMessage={async (event) => {
          alert("SUCCESS");
        }}
      />
      <Pressable
        onPress={() => {
          webViewRef.current?.injectJavaScript(`
        window.registerInitialize("aa", "bb");
        true;
      `);
        }}
      >
        <Text>RUN</Text>
      </Pressable>
    </View>
  );
}
