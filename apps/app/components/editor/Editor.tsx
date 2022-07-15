import { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Text, tw, View } from "@serenity-tools/ui";
import * as Y from "yjs";
import { EditorProps } from "./types";
import { source } from "../../webviews/editor/source";

// // TODO see if this works instead on Android https://reactnativecode.com/react-native-webview-load-local-html-file/
// export async function loadEditorSourceForAndroid() {
//   const indexHtml = Asset.fromModule(require("../../assets/index.html"));
//   await indexHtml.downloadAsync();
//   // @ts-expect-error
//   const html = await FileSystem.readAsStringAsync(indexHtml.localUri);
//   return { html };
// }

export default function Editor({
  yDocRef,
  openDrawer,
  updateTitle,
  isNew,
}: EditorProps) {
  const webViewRef = useRef<WebView>(null);

  // useEffect(() => {
  //   const initEditor = async () => {
  //     if (Platform.OS === "android") {
  //       editorSource = await loadEditorSourceForAndroid();
  //     }
  //   };
  //   initEditor();
  // }, []);

  yDocRef.current.on("updateV2", (update: any, origin: string) => {
    if (origin === "naisho-remote") {
      // TODO invesitgate if the scripts need to be cleaned up to avoid polluting
      // the document with a lot of script tags
      // send to webview

      webViewRef.current?.injectJavaScript(`
        window.applyYjsUpdate(${JSON.stringify(Array.apply([], update))});
        true;
      `);
    }
  });

  return (
    <SafeAreaView style={tw`bg-white flex-auto`}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={source}
        startInLoadingState={true}
        // can be activated once there is `Done` button
        // hideKeyboardAccessoryView={true}
        // to avoid weird scrolling behaviour when the keyboard becomes active
        // scrollEnabled={Platform.OS === "macos" ? true : false}
        scrollEnabled={true}
        renderLoading={() => (
          <View style={tw`bg-white flex-auto`}>
            <Text>Loading</Text>
          </View>
        )}
        onMessage={async (event) => {
          // event.persist();
          const message = JSON.parse(event.nativeEvent.data);
          if (message.type === "openDrawer") {
            openDrawer();
          }
          if (message.type === "updateTitle") {
            updateTitle(message.title);
          }
          if (message.type === "update") {
            const update = new Uint8Array(message.content);
            if (yDocRef.current) {
              // TODO switch to applyUpdateV2
              Y.applyUpdate(yDocRef.current, update, "mobile-webview");
              console.log("apply update", update);
            }
          }
        }}
        style={tw`bg-white flex-auto`}
        // Needed for .focus() to work
        keyboardDisplayRequiresUserAction={false}
        onLoad={() => {
          // TODO apply isNew for new documents

          // debug for the editor
          // console.log(JSON.stringify(Array.apply([], contentRef.current)));
          // if (isNew) {
          //   webViewRef?.current.injectJavaScript(`
          //     document.querySelector(".ProseMirror").focus();
          //     true;
          //   `);
          // } else {
          // }

          webViewRef.current?.injectJavaScript(`
              window.applyYjsUpdate(${JSON.stringify(
                Array.apply([], Y.encodeStateAsUpdateV2(yDocRef.current))
              )});
              true;
            `);
        }}
      />
    </SafeAreaView>
  );
}
