import "regenerator-runtime/runtime.js";

import { NativeBaseProvider } from "native-base";
import React from "react";
import ReactDOM from "react-dom";
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import * as Y from "yjs";
import { Editor } from "./Editor";
import { getEditorBottombarStateFromEditor } from "./getEditorBottombarStateFromEditor";
import { UpdateEditorParams } from "./types";
import { updateEditor } from "./updateEditor";

const ydoc = new Y.Doc();
window.ydoc = ydoc;
// must be initialized this way since injectedJavaScriptBeforeContentLoaded injects before these lines
window.isNew = window.isNew === undefined ? false : window.isNew;
window.editorEditable =
  window.editorEditable === undefined ? false : window.editorEditable;
window.userInfo = window.userInfo || { name: "Unknown user", color: "#000000" }; // should neber be an Unknown user

if (window.initialContent) {
  const update = new Uint8Array(window.initialContent);
  Y.applyUpdateV2(window.ydoc, update, "react-native-bridge");
}

const fileRequests: {
  [fileId: string]: {
    resolve: (value: string) => void;
    reject: (reason?: string) => void;
  };
} = {};

window.applyYjsUpdate = function (updateArray) {
  if (updateArray) {
    const update = new Uint8Array(updateArray);
    Y.applyUpdateV2(window.ydoc, update, "react-native-bridge");
  }
};
ydoc.on("update", (update: any, origin: string) => {
  if (window.ReactNativeWebView && origin !== "react-native-bridge") {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: "update", content: Array.from(update) })
    );
  }
});

const yAwareness = new Awareness(ydoc);
window.applyYAwarenessUpdate = function (update) {
  if (update) {
    const updateArray = new Uint8Array(update);
    applyAwarenessUpdate(yAwareness, updateArray, "react-native-bridge");
  }
};
yAwareness.on("update", ({ added, updated, removed }: any, origin: string) => {
  if (window.ReactNativeWebView && origin !== "react-native-bridge") {
    const changedClients = added.concat(updated).concat(removed);
    const update = encodeAwarenessUpdate(yAwareness, changedClients);

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "updateYAwareness",
        content: Array.from(update),
      })
    );
  }
});
yAwareness.setLocalStateField("user", {
  name: window.userInfo.name,
  color: window.userInfo.color,
});

const openDrawer = () => {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: "openDrawer" }));
};

const updateTitle = (title: string) => {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: "updateTitle", title })
  );
};

window.updateEditor = (paramsString: string) => {
  let decodedParamsString = paramsString;
  if (paramsString.startsWith("BASE64")) {
    decodedParamsString = atob(paramsString.slice(6));
  }
  const params: UpdateEditorParams = JSON.parse(decodedParamsString);
  updateEditor(window.editor, params);
};

window.blurEditor = () => {
  window.editor.commands.blur();
};

window.setEditorEditable = (editable: boolean) => {
  window.editorEditable = editable;
  renderEditor();
};

window.resolveImageRequest = (fileId, base64) => {
  const fileRequest = fileRequests[fileId];
  if (fileRequest) {
    fileRequest.resolve(base64);
  }
};

window.rejectImageRequest = (fileId, reason) => {
  const fileRequest = fileRequests[fileId];
  if (fileRequest) {
    fileRequest.reject(reason);
  }
};

let hasOpenCommentsSidebar = false;
window.updateHasOpenCommentsSidebar = (newHasOpenCommentsSidebar: boolean) => {
  hasOpenCommentsSidebar = newHasOpenCommentsSidebar;
};

const renderEditor = () => {
  const domContainer = document.querySelector("#editor");
  ReactDOM.render(
    <NativeBaseProvider>
      <Editor
        // TODO currently set to active all the time, would need a proper
        // setup for the error case on mobile
        documentState="active"
        editable={window.editorEditable}
        scrollIntoViewOnEditModeDelay={50}
        documentId={"dummyDocumentId"}
        yDocRef={{ current: ydoc }}
        yAwarenessRef={{ current: yAwareness }}
        openDrawer={openDrawer}
        updateTitle={updateTitle}
        isNew={window.isNew}
        onCreate={(params) => (window.editor = params.editor)}
        comments={[]}
        createComment={() => {}}
        highlightComment={(commentId, openSidebar) => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "highlightComment",
              content: { commentId, openSidebar },
            })
          );
        }}
        highlightedComment={null}
        hasOpenCommentsSidebar={() => {
          return hasOpenCommentsSidebar;
        }}
        encryptAndUploadFile={async () => {
          // TODO: implement
          return Promise.resolve({
            fileId: "dummyFileId",
            nonce: "dummynonce",
            key: "dummykey",
          });
        }}
        downloadAndDecryptFile={(params) => {
          const promise = new Promise<string>((resolve, reject) => {
            fileRequests[params.fileId] = { resolve, reject };
          });
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "requestImage", ...params })
          );
          return promise;
        }}
        onTransaction={({ editor }) => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "update-editor-toolbar-state",
              content: getEditorBottombarStateFromEditor(editor),
            })
          );
        }}
        shareOrSaveFile={({ contentAsBase64, mimeType, fileName }) => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "downloadFile",
              content: {
                contentAsBase64: contentAsBase64,
                mimeType,
                fileName,
              },
            })
          );
        }}
      />
    </NativeBaseProvider>,
    domContainer
  );
};

renderEditor();
