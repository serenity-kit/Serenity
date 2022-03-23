import Editor from "../components/editor/Editor";

import { View } from "@serenity-tools/ui";
import { RootTabScreenProps } from "../types";

/*
Hello World!

Of course we support bold text.
*/
const editorContentAsYjsUpdateV2 = Uint8Array.from([
  0, 3, 0, 3, 1, 6, 249, 209, 213, 139, 28, 11, 11, 0, 2, 28, 0, 94, 56, 2, 42,
  2, 18, 2, 1, 32, 21, 7, 1, 4, 0, 132, 0, 196, 0, 135, 0, 7, 0, 4, 0, 134, 0,
  132, 0, 134, 0, 132, 102, 90, 100, 101, 102, 97, 117, 108, 116, 112, 97, 114,
  97, 103, 114, 97, 112, 104, 69, 68, 73, 84, 79, 82, 32, 99, 111, 110, 116,
  101, 110, 116, 33, 72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 112,
  97, 114, 97, 103, 114, 97, 112, 104, 79, 102, 32, 99, 111, 117, 114, 115, 101,
  32, 119, 101, 32, 115, 117, 112, 112, 111, 114, 116, 32, 98, 111, 108, 100,
  98, 111, 108, 100, 32, 116, 101, 120, 116, 98, 111, 108, 100, 46, 7, 9, 14, 1,
  11, 9, 21, 4, 9, 4, 1, 3, 1, 0, 0, 4, 3, 6, 3, 6, 0, 1, 12, 0, 118, 0, 126, 1,
  249, 232, 234, 133, 14, 1, 2, 13,
]);

export default function EditorScreen({
  navigation,
}: RootTabScreenProps<"EditorScreen">) {
  return (
    <View>
      <Editor serializedYdoc={editorContentAsYjsUpdateV2} />
    </View>
  );
}
