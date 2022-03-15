import Editor from "../components/Editor";

import { View } from "@serenity-tools/ui";
import { RootTabScreenProps } from "../types";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"EditorScreen">) {
  return (
    <View>
      <Editor />
    </View>
  );
}
