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
window.isNew = window.isNew === undefined ? false : window.isNew;
window.username = window.username || "Unknown user";
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
yAwareness.setLocalStateField("user", { name: window.username });

const openDrawer = () => {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: "openDrawer" }));
};

const updateTitle = (title: string) => {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: "updateTitle", title })
  );
};

window.updateEditor = (paramsString: string) => {
  const params: UpdateEditorParams = JSON.parse(paramsString);
  updateEditor(window.editor, params);
};

window.blurEditor = () => {
  window.editor.commands.blur();
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

const domContainer = document.querySelector("#editor");
ReactDOM.render(
  <NativeBaseProvider>
    <Editor
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
