import { Text, View } from "@serenity-tools/ui";
import { EditorProps } from "./types";

export default function Editor({
  documentId,
  yDocRef,
  yAwarenessRef,
  openDrawer,
  updateTitle,
  isNew,
}: EditorProps) {
  return (
    <View>
      <Text>Electron Editor</Text>
      {/* <SerenityEditor
        documentId={documentId}
        yDocRef={yDocRef}
        yAwarenessRef={yAwarenessRef}
        openDrawer={openDrawer}
        updateTitle={updateTitle}
        isNew={isNew}
      /> */}
    </View>
  );
}
