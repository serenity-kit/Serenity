import { Editor as SerenityEditor } from "@serenity-tools/editor";
import { EditorProps } from "./types";

export default function Editor({ yDocRef, yAwarenessRef }: EditorProps) {
  return <SerenityEditor yDocRef={yDocRef} yAwarenessRef={yAwarenessRef} />;
}
