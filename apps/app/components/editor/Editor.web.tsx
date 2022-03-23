import { Editor as SerenityEditor } from "@serenity-tools/editor";
import { useState } from "react";
import * as Y from "yjs";
import { EditorProps } from "./types";

export default function Editor({ serializedYdoc }: EditorProps) {
  const [ydoc] = useState(() => {
    const ydoc = new Y.Doc();
    Y.applyUpdateV2(ydoc, serializedYdoc);
    return ydoc;
  });

  return <SerenityEditor ydoc={ydoc} />;
}
