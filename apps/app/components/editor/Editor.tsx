import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { Spinner, tw, View } from "@serenity-tools/ui";
import * as Y from "yjs";
import { EditorProps } from "./types";
import { source } from "../../webviews/editor/source";
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import {
  EditorBottomBar,
  EditorBottomBarProps,
} from "../editorBottomBar/EditorBottomBar";
import { EditorToolbarState, UpdateEditorParams } from "@serenity-tools/editor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

// // TODO see if this works instead on Android https://reactnativecode.com/react-native-webview-load-local-html-file/
// export async function loadEditorSourceForAndroid() {
//   const indexHtml = Asset.fromModule(require("../../assets/index.html"));
//   await indexHtml.downloadAsync();
//   // @ts-expect-error
//   const html = await FileSystem.readAsStringAsync(indexHtml.localUri);
//   return { html };
// }

type BottomBarWrapperProps = EditorBottomBarProps & {
  keyboardHeight: number;
  keyboardAnimationDuration: number;
};

const BottomBarWrapper = ({
  keyboardHeight,
  keyboardAnimationDuration,
  editorToolbarState,
  onUpdate,
}: BottomBarWrapperProps) => {
  const [bottom] = useState(new Animated.Value(0));

  console.log("keyboardHeight", keyboardHeight);
  console.log("keyboardAnimationDuration", keyboardAnimationDuration);

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
      <EditorBottomBar
        editorToolbarState={editorToolbarState}
        onUpdate={onUpdate}
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
  const dimensions = useWindowDimensions();
  const headerHeight = useHeaderHeight();

  const editorHeight = dimensions.height - headerHeight;

  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardAnimationDuration, setKeyboardAnimationDuration] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        setKeyboardAnimationDuration(event.duration);
        setKeyboardHeight(event.endCoordinates.height);
        setIsVisible(true);
      }
    );
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setIsVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const [editorToolbarState, setEditorToolbarState] =
    useState<EditorToolbarState>({
      isBold: false,
      isItalic: false,
    });

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
        // can be activated once there is `Done` button
        // hideKeyboardAccessoryView={true}
        // to avoid weird scrolling behaviour when the keyboard becomes active
        // scrollEnabled={Platform.OS === "macos" ? true : false}
        scrollEnabled={true}
        renderLoading={() => (
          <View style={tw`justify-center items-center flex-auto`}>
            <Spinner fadeIn size="lg" />
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
            setEditorToolbarState(message.content);
          }
        }}
        // style={[tw`flex-auto bg-primary-200`]}
        // containerStyle={{ flex: 0, height: editorHeight }}
        // Needed for .focus() to work
        keyboardDisplayRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={`
          window.isNew = ${isNewRef.current};
          window.initialContent = ${JSON.stringify(
            Array.apply([], Y.encodeStateAsUpdateV2(yDocRef.current))
          )};
          window.editorHeight = ${editorHeight};
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

      {isVisible && (
        <BottomBarWrapper
          keyboardHeight={keyboardHeight}
          keyboardAnimationDuration={keyboardAnimationDuration}
          editorToolbarState={editorToolbarState}
          onUpdate={(params: UpdateEditorParams) => {
            webViewRef.current?.injectJavaScript(`
          window.updateEditor(\`${JSON.stringify(params)}\`);
          true;
        `);
          }}
        />
      )}
    </>
  );
}
