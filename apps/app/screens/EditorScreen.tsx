import Editor from "../components/editor/Editor";

import { View } from "@serenity-tools/ui";
import { RootTabScreenProps } from "../types";

export default function EditorScreen({
  navigation,
}: RootTabScreenProps<"EditorScreen">) {
  return (
    <View>
      <Editor />
    </View>
  );
}
