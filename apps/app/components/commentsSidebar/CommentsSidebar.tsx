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
import { usePage } from "../../context/PageContext";

const CommentsSidebar: React.FC<{}> = () => {
  const { commentsService } = usePage();
  const [state, send] = useActor(commentsService);

  return (
    // grow-0 overrides default of ScrollView to keep the assigned width
    <ScrollView
      style={tw`w-sidebar grow-0 border-l border-gray-200 bg-gray-100`}
    >
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
              testID={`comment-${comment.id}`}
            >
              <Text testID={`comment-${comment.id}__text-content`}>
                {comment.text}
              </Text>
              <Text variant="xs">
                {formatDistanceToNow(parseJSON(comment.createdAt), {
                  addSuffix: true,
                })}
              </Text>
              <View>
                {comment.replies.map((reply) => {
                  if (!reply) return null;
                  return (
                    <View
                      key={reply.id}
                      testID={`comment-${comment.id}__comment-reply-${reply.id}`}
                    >
                      <View>
                        <Text
                          testID={`comment-${comment.id}__comment-reply-${reply.id}--text-content`}
                        >
                          {reply.text}
                        </Text>
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
                        testID={`comment-${comment.id}__comment-reply-${reply.id}--delete-reply-button`}
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
                testID={`comment-${comment.id}__reply-input`}
              />
              <Button
                size="sm"
                onPress={() =>
                  send({ type: "CREATE_REPLY", commentId: comment.id })
                }
                testID={`comment-${comment.id}__save-reply-button`}
              >
                Add Reply
              </Button>

              <IconButton
                name="delete-bin-line"
                onPress={() =>
                  send({ type: "DELETE_COMMENT", commentId: comment.id })
                }
                testID={`comment-${comment.id}__delete-button`}
              />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default CommentsSidebar;
