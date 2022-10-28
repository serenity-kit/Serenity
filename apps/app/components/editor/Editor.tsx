import { useEffect, useRef, useState } from "react";
import { Animated, Keyboard } from "react-native";
import { WebView } from "react-native-webview";
// import { Asset } from "expo-asset";
// import * as FileSystem from "expo-file-system";
import {
  EditorBottombarState,
  UpdateEditorParams,
} from "@serenity-tools/editor";
import {
  CenterContent,
  Spinner,
  useHasEditorSidebar,
} from "@serenity-tools/ui";
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import * as Y from "yjs";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { downloadFileBase64Bytes } from "../../utils/file/downloadFileBase64Bytes";
import { source } from "../../webviews/editor/source";
import {
  EditorBottombar,
  EditorBottombarProps,
} from "../editorBottombar/EditorBottombar";
import { encryptAndUpload } from "./encryptAndUpload";
import { initialEditorBottombarState } from "./initialEditorBottombarState";
import { EditorProps } from "./types";

// // TODO see if this works instead on Android https://reactnativecode.com/react-native-webview-load-local-html-file/
// export async function loadEditorSourceForAndroid() {
//   const indexHtml = Asset.fromModule(require("../../assets/index.html"));
//   await indexHtml.downloadAsync();
//   // @ts-expect-error
//   const html = await FileSystem.readAsStringAsync(indexHtml.localUri);
//   return { html };
// }

type BottombarWrapperProps = EditorBottombarProps & {
  keyboardHeight: number;
  keyboardAnimationDuration: number;
};

const BottombarWrapper = ({
  keyboardHeight,
  keyboardAnimationDuration,
  editorBottombarState,
  onUpdate,
  encryptAndUpload,
}: BottombarWrapperProps) => {
  const [bottom] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(bottom, {
      useNativeDriver: false,
      toValue: keyboardHeight,
      duration: keyboardAnimationDuration,
      delay: 0,
    }).start();
  }, []);

  return (
    <Animated.View style={{ bottom }}>
      <EditorBottombar
        editorBottombarState={editorBottombarState}
        onUpdate={onUpdate}
        encryptAndUpload={encryptAndUpload}
      />
    </Animated.View>
  );
};

export default function Editor({
  yDocRef,
  yAwarenessRef,
  openDrawer,
  updateTitle,
  isNew,
}: EditorProps) {
  const webViewRef = useRef<WebView>(null);
  // leveraging a ref here since the injectedJavaScriptBeforeContentLoaded
  // seem to not inject the initial isNew, but the current value
  const isNewRef = useRef<boolean>(isNew);
  const [isEditorBottombarVisible, setIsEditorBottombarVisible] =
    useState(false);
  const hasEditorSidebar = useHasEditorSidebar();

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardAnimationDuration, setKeyboardAnimationDuration] = useState(0);
  const store = useEditorStore();

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        setKeyboardAnimationDuration(event.duration);
        setKeyboardHeight(event.endCoordinates.height);
        setIsEditorBottombarVisible(true);
        store.setIsInEditingMode(true);
      }
    );
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setIsEditorBottombarVisible(false);
      store.setIsInEditingMode(false);
    });

    store.subscribeToBlurTrigger(() => {
      webViewRef.current?.injectJavaScript(`
        window.blurEditor();
        true;
      `);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      store.removeAllSubscribers();
    };
  }, []);

  const [editorBottombarState, setEditorBottombarState] =
    useState<EditorBottombarState>(initialEditorBottombarState);

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

  yAwarenessRef.current.on(
    "update",
    ({ added, updated, removed }, origin: string) => {
      const changedClients = added.concat(updated).concat(removed);
      const update = encodeAwarenessUpdate(
        yAwarenessRef.current,
        changedClients
      );

      webViewRef.current?.injectJavaScript(`
        window.applyYAwarenessUpdate(${JSON.stringify(
          Array.apply([], update)
        )});
        true;
      `);
    }
  );

  return (
    <>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={source}
        startInLoadingState={true}
        // avoid showing the form next/prev & Done button on iOS
        // when the keyboard is shown
        hideKeyboardAccessoryView={true}
        scrollEnabled={false}
        renderLoading={() => (
          <CenterContent>
            <Spinner fadeIn size="lg" />
          </CenterContent>
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
              console.log("apply update");
            }
          }
          if (message.type === "updateYAwareness") {
            const update = new Uint8Array(message.content);
            if (yAwarenessRef.current) {
              applyAwarenessUpdate(
                yAwarenessRef.current,
                update,
                "mobile-webview"
              );
            }
          }
          if (message.type === "update-editor-toolbar-state") {
            setEditorBottombarState(message.content);
          }
          if (message.type === "requestImage") {
            try {
              const result = await downloadFileBase64Bytes({ ...message });
              webViewRef.current?.injectJavaScript(`
                window.resolveImageRequest("${message.fileId}", "${result}");
                true;
              `);
            } catch (err) {
              console.error("Image download error:", err);
              webViewRef.current?.injectJavaScript(`
                window.rejectImageRequest("${message.fileId}", "Failed to download and decrypt the image");
                true;
              `);
            }
          }
        }}
        // Needed for .focus() to work
        keyboardDisplayRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={`
          window.isNew = ${isNewRef.current};
          window.initialContent = ${JSON.stringify(
            Array.apply([], Y.encodeStateAsUpdateV2(yDocRef.current))
          )};
          true; // this is required, or you'll sometimes get silent failures
        `}
        onLoad={() => {
          // debug for the editor
          // console.log(JSON.stringify(Array.apply([], contentRef.current)));
          // if (isNew) {
          //   webViewRef?.current.injectJavaScript(`
          //     document.querySelector(".ProseMirror").focus();
          //     true;
          //   `);
          // } else {
          // }
          // webViewRef.current?.injectJavaScript(`
          //     window.applyYjsUpdate(${JSON.stringify(
          //       Array.apply([], Y.encodeStateAsUpdateV2(yDocRef.current))
          //     )});
          //     true;
          //   `);
        }}
      />

      {!hasEditorSidebar && isEditorBottombarVisible ? (
        <BottombarWrapper
          keyboardHeight={keyboardHeight}
          keyboardAnimationDuration={keyboardAnimationDuration}
          editorBottombarState={editorBottombarState}
          onUpdate={(params: UpdateEditorParams) => {
            webViewRef.current?.injectJavaScript(`
          window.updateEditor(\`${JSON.stringify(params)}\`);
          true;
        `);
          }}
          encryptAndUpload={encryptAndUpload}
        />
      ) : null}
    </>
  );
}
