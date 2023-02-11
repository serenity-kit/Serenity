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
            <View key={comment.id}>
              <Text>{comment.text}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

// By remounting the component we make sure that a fresh state machine gets started.
// As an alternative we could also have an action that resets the state machine,
// but with all the side-effects remounting seemed to be the stabler choice for now.
const CommentsSidebarWrapper: React.FC<DrawerContentComponentProps> = (
  props
) => {
  const { pageId } = usePage();
  return <CommentsSidebar key={pageId} {...props} />;
};

export default CommentsSidebarWrapper;
