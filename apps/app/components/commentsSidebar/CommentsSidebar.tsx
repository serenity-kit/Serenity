import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { LocalDevice } from "@serenity-tools/common";
import {
  Button,
  RawInput,
  ScrollView,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { usePage } from "../../context/PageContext";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { commentsSidebarMachine } from "./commentsSidebarMachine";

const CommentsSidebar: React.FC<DrawerContentComponentProps> = () => {
  const { pageId } = usePage();
  const { activeDevice } = useAuthenticatedAppContext();
  const [state, send] = useMachine(commentsSidebarMachine, {
    context: { params: { pageId, activeDevice: activeDevice as LocalDevice } },
  });

  return (
    // grow-0 overrides default of ScrollView to keep the assigned width
    <ScrollView
      style={tw`w-sidebar grow-0 border-l border-gray-200 bg-gray-100`}
    >
      <Text>Comments WIP</Text>

      <View>
        <RawInput
          multiline
          value={state.context.commentText}
          onChangeText={(text) => send({ type: "UPDATE_COMMENT_TEXT", text })}
        />
        <Button onPress={() => send({ type: "CREATE_COMMENT" })}>
          Create Comment
        </Button>
      </View>

      <View>
        {state.context.decryptedComments.map((comment) => {
          if (!comment) return null;
          return (
            <View key={comment.id} style={tw`border-b border-gray-200`}>
              <Text>{comment.text}</Text>
              <Button
                size="sm"
                onPress={() =>
                  send({ type: "DELETE_COMMENT", commentId: comment.id })
                }
              >
                Delete Comment
              </Button>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default CommentsSidebar;
