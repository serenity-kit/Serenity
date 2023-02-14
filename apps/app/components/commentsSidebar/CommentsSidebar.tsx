import { DrawerContentComponentProps } from "@react-navigation/drawer";
import {
  Button,
  IconButton,
  RawInput,
  ScrollView,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useActor } from "@xstate/react";
import { usePage } from "../../context/PageContext";

const CommentsSidebar: React.FC<DrawerContentComponentProps> = () => {
  const { commentsService } = usePage();
  const [state, send] = useActor(commentsService);

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
              <View>
                {comment.replies.map((reply) => {
                  if (!reply) return null;
                  return (
                    <View key={reply.id}>
                      <View>
                        <Text>{reply.text}</Text>
                      </View>
                      <IconButton
                        name="delete-bin-line"
                        onPress={() =>
                          send({ type: "DELETE_REPLY", replyId: reply.id })
                        }
                      />
                    </View>
                  );
                })}
              </View>
              <RawInput
                multiline
                value={state.context.replyTexts[comment.id]}
                onChangeText={(text) =>
                  send({
                    type: "UPDATE_REPLY_TEXT",
                    commentId: comment.id,
                    text,
                  })
                }
              />
              <Button
                size="sm"
                onPress={() =>
                  send({ type: "CREATE_REPLY", commentId: comment.id })
                }
              >
                Add Reply
              </Button>

              <IconButton
                name="delete-bin-line"
                onPress={() =>
                  send({ type: "DELETE_COMMENT", commentId: comment.id })
                }
              />
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
