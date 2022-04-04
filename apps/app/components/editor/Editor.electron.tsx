import { Text, View } from "@serenity-tools/ui";
import { Editor as SerenityEditor } from "@serenity-tools/editor";
import { EditorProps } from "./types";

export default function Editor({ yDocRef }: EditorProps) {
  return (
    <View>
      <Text>Electron Editor</Text>
      <SerenityEditor yDocRef={yDocRef} />
    </View>
  );
}
