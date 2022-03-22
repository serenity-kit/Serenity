import { Editor as SerenityEditor } from "@serenity-tools/editor";
import * as Y from "yjs";

const ydoc = new Y.Doc();

export default function Editor({}) {
  return <SerenityEditor ydoc={ydoc} />;
}
