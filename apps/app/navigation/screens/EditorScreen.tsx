import Editor from "../../components/editor/Editor";
import { useLayoutEffect, useRef, useState } from "react";
import * as Y from "yjs";

import { tw, View } from "@serenity-tools/ui";
import { WorkspaceDrawerScreenProps } from "../../types";
import { useWindowDimensions } from "react-native";
import { PageHeaderRight } from "../../components/pageHeaderRight/PageHeaderRight";

/*
Hello World

Of course we support bold text.
*/
const editorContentAsYjsUpdateV2 = Uint8Array.from([
  0, 3, 0, 3, 9, 39, 249, 209, 213, 139, 28, 11, 250, 149, 168, 215, 5, 1, 150,
  197, 184, 197, 4, 186, 149, 168, 215, 5, 214, 197, 184, 197, 4, 1, 186, 149,
  168, 215, 5, 214, 197, 184, 197, 4, 12, 28, 0, 2, 28, 0, 94, 56, 2, 42, 2, 18,
  2, 250, 1, 2, 66, 0, 3, 0, 68, 16, 2, 26, 16, 8, 72, 8, 88, 40, 6, 32, 96, 62,
  8, 88, 24, 41, 7, 1, 1, 0, 132, 0, 196, 0, 135, 0, 7, 0, 4, 0, 134, 0, 132, 0,
  134, 0, 132, 0, 7, 1, 4, 0, 135, 1, 7, 0, 4, 0, 199, 0, 7, 0, 4, 0, 132, 2,
  198, 204, 1, 179, 1, 100, 101, 102, 97, 117, 108, 116, 112, 97, 114, 97, 103,
  114, 97, 112, 104, 33, 72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
  112, 97, 114, 97, 103, 114, 97, 112, 104, 79, 102, 32, 99, 111, 117, 114, 115,
  101, 32, 119, 101, 32, 115, 117, 112, 112, 111, 114, 116, 32, 98, 111, 108,
  100, 98, 111, 108, 100, 32, 116, 101, 120, 116, 98, 111, 108, 100, 46, 112,
  97, 103, 101, 112, 97, 114, 97, 103, 114, 97, 112, 104, 72, 101, 108, 108,
  111, 32, 87, 111, 114, 108, 100, 112, 97, 114, 97, 103, 114, 97, 112, 104,
  112, 97, 114, 97, 103, 114, 97, 112, 104, 79, 102, 32, 99, 111, 112, 97, 114,
  97, 103, 114, 97, 112, 104, 79, 102, 32, 99, 111, 117, 114, 115, 101, 32, 119,
  101, 32, 115, 117, 112, 112, 111, 114, 116, 32, 98, 111, 108, 100, 32, 116,
  101, 120, 116, 46, 98, 111, 108, 100, 98, 111, 108, 100, 98, 111, 108, 100,
  98, 111, 108, 100, 7, 9, 1, 11, 9, 21, 4, 9, 4, 1, 4, 9, 11, 73, 0, 5, 9, 13,
  8, 4, 6, 68, 2, 7, 1, 0, 0, 3, 1, 0, 0, 11, 3, 6, 3, 6, 3, 6, 67, 0, 6, 3, 6,
  1, 14, 3, 12, 0, 118, 0, 126, 3, 0, 14, 0, 118, 0, 126, 118, 0, 126, 2, 249,
  232, 234, 133, 14, 1, 2, 13, 214, 162, 220, 162, 2, 2, 0, 7, 33, 1,
]);

export default function EditorScreen({
  navigation,
}: WorkspaceDrawerScreenProps<"Editor">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: PageHeaderRight,
    });
  }, []);

  const [yDoc] = useState(() => {
    const yDoc = new Y.Doc();
    Y.applyUpdateV2(yDoc, editorContentAsYjsUpdateV2);
    // yDoc.on("updateV2", () => {
    //   console.log("yDoc updateV2");
    //   console.log(JSON.stringify(Array.from(Y.encodeStateAsUpdateV2(yDoc))));
    // });
    return yDoc;
  });
  const yDocRef = useRef(yDoc);
  console.log("yDocRef", yDocRef.current);

  return (
    <Editor
      documentId={"096f7289-d765-41ef-9f07-dc8252ced299"}
      yDocRef={yDocRef}
      openDrawer={navigation.openDrawer}
      isNew={false}
      updateTitle={() => undefined}
    />
  );
}
