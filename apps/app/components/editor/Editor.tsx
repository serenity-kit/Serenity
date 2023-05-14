import { useEffect, useMemo, useRef, useState } from "react";
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
import sodium, { base64_variants } from "react-native-libsodium";
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import * as Y from "yjs";
import { usePage } from "../../context/PageContext";
import { editorToolbarService } from "../../machines/editorToolbarMachine";
import { DocumentState } from "../../types/documentState";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { createDownloadAndDecryptFileFunction } from "../../utils/file/createDownloadAndDecryptFileFunction";
import { createEncryptAndUploadFileFunction } from "../../utils/file/createEncryptAndUploadFileFunction";
import { shareFile } from "../../utils/shareFile/shareFile";
import { showToast } from "../../utils/toast/showToast";
import { source } from "../../webviews/editor/source";
import {
  EditorBottombar,
  EditorBottombarProps,
} from "../editorBottombar/EditorBottombar";
import { EditorLoading } from "../editorLoading/EditorLoading";
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
  documentState: DocumentState;
};

const BottombarWrapper = ({
  keyboardHeight,
  keyboardAnimationDuration,
  editorBottombarState,
  onUpdate,
  encryptAndUploadFile,
  documentState,
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
        encryptAndUploadFile={encryptAndUploadFile}
        documentState={documentState}
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
  documentId,
  documentLoaded,
  workspaceId,
  userInfo,
  editable,
  documentState,
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
  const setIsInEditingMode = useEditorStore(
    (state) => state.setIsInEditingMode
  );
  const { commentsService } = usePage();

  const [webviewLoaded, setWebviewLoaded] = useState(false);

  const encryptAndUploadFile = useMemo(() => {
    return createEncryptAndUploadFileFunction({
      workspaceId,
      documentId,
    });
  }, [workspaceId, documentId]);

  const downloadAndDecryptFile = useMemo(() => {
    return createDownloadAndDecryptFileFunction({
      workspaceId,
      documentId,
    });
  }, [workspaceId, documentId]);

  useEffect(() => {
    if (!webviewLoaded) {
      return;
    }

    const showSubscription = Keyboard.addListener(
      "keyboardWillShow",
      (event) => {
        setKeyboardAnimationDuration(event.duration);
        setKeyboardHeight(event.endCoordinates.height);
        setIsEditorBottombarVisible(true);
        setIsInEditingMode(true);
      }
    );
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setIsEditorBottombarVisible(false);
      setIsInEditingMode(false);
    });

    store.subscribeToBlurTrigger(() => {
      webViewRef.current?.injectJavaScript(`
        window.blurEditor();
        true;
      `);
    });

    const onEventListener = (args) => {
      let params: UpdateEditorParams | null = null;
      if (args.type === "UNDO") {
        params = { variant: "undo" };
      } else if (args.type === "REDO") {
        params = { variant: "redo" };
      }
      if (params) {
        webViewRef.current?.injectJavaScript(`
          window.updateEditor(\`${JSON.stringify(params)}\`);
          true;
        `);
      }
    };

    editorToolbarService.onEvent(onEventListener);

    commentsService.onChange((context) => {
      const { decryptedComments, highlightedComment, isOpenSidebar } = context;

      const commentsJson = JSON.stringify({
        variant: "update-comments",
        params: {
          decryptedComments,
          highlightedComment,
        },
      });

      webViewRef.current?.injectJavaScript(`
        window.updateEditor("BASE64${sodium.to_base64(
          commentsJson,
          base64_variants.ORIGINAL
        )}");
        true;
      `);

      webViewRef.current?.injectJavaScript(`
        window.updateHasOpenCommentsSidebar(${isOpenSidebar});
        true;
      `);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      store.removeAllSubscribers();
      editorToolbarService.off(onEventListener);
    };
  }, [webviewLoaded]);

  useEffect(() => {
    console.log("editable: ", editable);
    webViewRef.current?.injectJavaScript(`
      window.setEditorEditable(${editable});
      true;
    `);
  }, [editable]);

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

      // make sure updates are applied to the editor even if the
      // webview is not ready yet by applying them delayed
      const applyUpdateToEditor = (update, count) => {
        if (webViewRef.current) {
          webViewRef.current?.injectJavaScript(`
            window.applyYjsUpdate(${JSON.stringify(Array.apply([], update))});
            true;
          `);
        } else if (count > 100) {
          showToast(
            "Failed to apply updates to editor. Please reload the app.",
            "error"
          );
        } else {
          setTimeout(() => {
            applyUpdateToEditor(update, count + 1);
          }, 200);
        }
      };
      applyUpdateToEditor(update, 0);
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

  if (!documentLoaded) {
    return <EditorLoading />;
  }

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
            editorToolbarService.send("updateToolbarState", {
              toolbarState: message.content,
            });
          }
          if (message.type === "requestImage") {
            try {
              const result = await downloadAndDecryptFile({ ...message });
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
          if (message.type === "downloadFile") {
            const { contentAsBase64, fileName, mimeType } = message.content;
            shareFile({ contentAsBase64, mimeType, fileName });
          }
          if (message.type === "highlightComment") {
            const { commentId, openSidebar } = message.content;
            commentsService.send({
              type: "HIGHLIGHT_COMMENT_FROM_EDITOR",
              commentId,
              openSidebar,
            });
          }
        }}
        // Needed for .focus() to work
        keyboardDisplayRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={`
          window.isNew = ${isNewRef.current};
          window.initialContent = ${JSON.stringify(
            Array.apply([], Y.encodeStateAsUpdateV2(yDocRef.current))
          )};
          window.userInfo = {
            name: "${userInfo.name}",
            color: "${userInfo.color}"
          };
          window.editorEditable = ${editable};
          true; // this is required, or you'll sometimes get silent failures
        `}
        onLoad={() => {
          setWebviewLoaded(true);
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
          encryptAndUploadFile={encryptAndUploadFile}
          documentState={documentState}
        />
      ) : null}
    </>
  );
}
