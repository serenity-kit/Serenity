import { Text, View } from "@serenity-tools/ui";
import { Editor as SerenityEditor } from "@serenity-tools/editor";
import * as Y from "yjs";
import { EditorProps } from "./types";
import { useState } from "react";

export default function Editor({ serializedYdoc }: EditorProps) {
  const [ydoc] = useState(() => {
    const ydoc = new Y.Doc();
    Y.applyUpdateV2(ydoc, serializedYdoc);
    return ydoc;
  });
  return (
    <View>
      <Text>Electron Editor</Text>
      <SerenityEditor ydoc={ydoc} />
    </View>
  );
}
