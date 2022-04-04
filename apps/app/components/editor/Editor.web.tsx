import { Editor as SerenityEditor } from "@serenity-tools/editor";
import { EditorProps } from "./types";

export default function Editor({ yDocRef }: EditorProps) {
  console.log(yDocRef.current);
  return <SerenityEditor yDocRef={yDocRef} />;
}
