import React, { useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { WebView } from "react-native-webview";

export default function OpaqueBridge() {
  const webViewRef = useRef(null);

  return (
    <View>
      <WebView
        ref={webViewRef}
        style={{
          backgroundColor: "yellow",
          width: 300,
          height: 300,
        }}
        source={{ uri: "https://ubiquitous-sable-e71d57.netlify.app/" }}
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
