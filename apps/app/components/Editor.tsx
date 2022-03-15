import { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Text } from "@serenity-tools/ui";

export async function loadEditorSourceForAndroid() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const indexHtml = Asset.fromModule(require("../assets/index.html"));
  await indexHtml.downloadAsync();
  // @ts-expect-error
  const html = await FileSystem.readAsStringAsync(indexHtml.localUri);
  return { html };
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
  },
  webView: {
    height: "100%",
    width: "100%",
  },
});

let editorSource =
  Platform.OS !== "android" ? require("../assets/index.html") : { html: null };

export default function Editor({}) {
  const webViewRef = useRef(null);

  useEffect(() => {
    const initDoc = async () => {
      if (Platform.OS === "android") {
        editorSource = await loadEditorSourceForAndroid();
      }
    };
    initDoc();
  }, []);

  console.log(editorSource);

  return (
    <View>
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={editorSource}
          startInLoadingState={true}
          // can be activated once there is `Done` button
          // hideKeyboardAccessoryView={true}
          // to avoid weird scrolling behaviour when the keyboard becomes active
          scrollEnabled={Platform.OS === "macos" ? true : false}
          renderLoading={() => (
            <View style={styles.container}>
              <Text>Loading</Text>
            </View>
          )}
          onMessage={async (event) => {
            // event.persist();
          }}
          style={styles.webView}
          // Needed for .focus() to work
          keyboardDisplayRequiresUserAction={false}
          onLoad={() => {}}
        />
      </View>
    </View>
  );
}
