import {
  Button,
  IconButton,
  Pressable,
  RawInput,
  ScrollView,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useActor } from "@xstate/react";
import { formatDistanceToNow, parseJSON } from "date-fns";
import { StyleSheet } from "react-native";
import { usePage } from "../../context/PageContext";

const CommentsSidebar: React.FC<{}> = () => {
  const { commentsService } = usePage();
  const [state, send] = useActor(commentsService);

  const styles = StyleSheet.create({
    header: tw`h-editor-sidebar-header px-4 border-b border-solid border-gray-200`,
    wrapper: tw`p-4`,
  });

  return (
    // grow-0 overrides default of ScrollView to keep the assigned width
    <ScrollView style={tw`w-sidebar grow-0 bg-gray-100`}>
      <Text>Comments WIP</Text>

      <View>
        {state.context.decryptedComments.map((comment) => {
          if (!comment) return null;
          return (
            <Pressable
              key={comment.id}
              style={[
                tw`border-b border-gray-200`,
                comment.id === state.context.highlightedCommentId
                  ? tw`bg-gray-200`
                  : undefined,
              ]}
              onPress={() => {
                send({ type: "HIGHLIGHT_COMMENT", commentId: comment.id });
              }}
            >
              <Text>{comment.text}</Text>
              <Text variant="xs">
                {formatDistanceToNow(parseJSON(comment.createdAt), {
                  addSuffix: true,
                })}
              </Text>
              <View>
                {comment.replies.map((reply) => {
                  if (!reply) return null;
                  return (
                    <View key={reply.id}>
                      <View>
                        <Text>{reply.text}</Text>
                        <Text variant="xs">
                          {formatDistanceToNow(parseJSON(reply.createdAt), {
                            addSuffix: true,
                          })}
                        </Text>
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
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default CommentsSidebar;
