import { Text, View } from "@serenity-tools/ui";
import { Editor as SerenityEditor } from "@serenity-tools/editor";
import * as Y from "yjs";

const ydoc = new Y.Doc();

export default function Editor({}) {
  return (
    <View>
      <Text>Electron Editor</Text>
      <SerenityEditor ydoc={ydoc} />
    </View>
  );
}
