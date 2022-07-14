import React, { useRef } from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

let source = Platform.OS === "ios" ? require("./index.html") : { html: null };

export default function WebViewTest() {
  return null;
  // const webViewRef = useRef<WebView>(null);

  // return (
  //   <View style={{ height: 0, width: 0, overflow: "hidden" }}>
  //     <WebView ref={webViewRef} originWhitelist={["*"]} source={source} />
  //   </View>
  // );
}
