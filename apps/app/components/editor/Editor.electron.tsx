import { Text, View } from "@serenity-tools/ui";
import { Editor as SerenityEditor } from "@serenity-tools/editor";
import { EditorProps } from "./types";

export default function Editor({
  documentId,
  yDocRef,
  yAwarenessRef,
  openDrawer,
  isNew,
}: EditorProps) {
  return (
    <View>
      <Text>Electron Editor</Text>
      <SerenityEditor
        documentId={documentId}
        yDocRef={yDocRef}
        yAwarenessRef={yAwarenessRef}
        openDrawer={openDrawer}
        isNew={isNew}
      />
    </View>
  );
}
