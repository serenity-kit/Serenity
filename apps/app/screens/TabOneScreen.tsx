import Editor from "../components/Editor";

import { View } from "../components/Themed";
import { RootTabScreenProps } from "../types";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  return (
    <View>
      <Editor />
    </View>
  );
}
