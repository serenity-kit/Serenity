import { useEffect, useRef } from "react";
import { Platform, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Text, View } from "@serenity-tools/ui";
import * as Y from "yjs";

export async function loadEditorSourceForAndroid() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const indexHtml = Asset.fromModule(require("../../assets/index.html"));
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
  Platform.OS !== "android"
    ? require("../../assets/index.html")
    : { html: null };

export default function Editor({}) {
  const webViewRef = useRef(null);
  const ydocRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    const initDoc = async () => {
      ydocRef.current = new Y.Doc();
      if (Platform.OS === "android") {
        editorSource = await loadEditorSourceForAndroid();
      }
    };
    initDoc();
  }, []);

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
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === "update") {
              const update = new Uint8Array(message.content);
              if (ydocRef.current) {
                Y.applyUpdate(ydocRef.current, update);
                console.log("apply update");
              }
              // const serializedYDoc = Y.encodeStateAsUpdate(yDocRef.current);
              // optimization: prevent update in case the content hasn't changed
              // if (deepEqual(serializedYDoc, contentRef.current)) return;
            }
          }}
          style={styles.webView}
          // Needed for .focus() to work
          keyboardDisplayRequiresUserAction={false}
          onLoad={() => {
            // debug for the editor
            // console.log(JSON.stringify(Array.apply([], contentRef.current)));
            // if (isNew) {
            //   webViewRef?.current.injectJavaScript(`
            //     document.querySelector(".ProseMirror").focus();
            //     true;
            //   `);
            // } else {
            //   webViewRef.current.injectJavaScript(`
            //     window.applyYjsUpdate(${JSON.stringify(
            //       Array.apply([], contentRef.current)
            //     )});
            //     true;
            //   `);
            // }
          }}
        />
      </View>
    </View>
  );
}
