import {
  Avatar,
  EditorBottombarDivider,
  EditorSidebarHeader,
  IconButton,
  Pressable,
  RawInput,
  ScrollView,
  SubmitButton,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useActor } from "@xstate/react";
import { formatDistanceToNow, parseJSON } from "date-fns";
import { StyleSheet } from "react-native";
import { usePage } from "../../context/PageContext";

const CommentsSidebar: React.FC<{}> = () => {
  const { commentsService } = usePage();
  const [state, send] = useActor(commentsService);

  const styles = StyleSheet.create({
    header: tw`justify-between`,
    wrapper: tw`p-4 border-b border-gray-200`,
  });

  return (
    // grow-0 overrides default of ScrollView to keep the assigned width
    <ScrollView style={tw`w-sidebar grow-0 bg-gray-100`}>
      <EditorSidebarHeader style={styles.header}>
        <Text variant="sm" bold>
          Comments
        </Text>
        <HStack alignItems={"center"} style={tw`-mr-1`}>
          <Text variant="xxs" muted style={tw`p-1`}>
            Open
          </Text>
          <EditorBottombarDivider
            style={tw`h-4 border-r-1.5 border-gray-600`}
          />
          <Text variant="xxs" muted style={tw`p-1`}>
            Resolved
          </Text>
        </HStack>
      </EditorSidebarHeader>

      <View>
        {state.context.decryptedComments.map((comment) => {
          if (!comment) return null;

          const isActiveComment =
            comment.id === state.context.highlightedCommentId;

          return (
            <Pressable
              key={comment.id}
              style={[
                styles.wrapper,
                isActiveComment ? tw`bg-collaboration-honey/7` : undefined,
                { cursor: isActiveComment ? "default" : "pointer" },
              ]}
              onPress={() => {
                send({ type: "HIGHLIGHT_COMMENT", commentId: comment.id });
              }}
            >
              <HStack alignItems="center">
                {/* new comment indicator */}
                <View style={tw`w-4 -ml-4 flex-row justify-center`}>
                  <View style={tw`h-1.5 w-1.5 rounded-full bg-primary-500`} />
                </View>

                <HStack alignItems="center" space="1.5">
                  {/* TODO if comment has been read change color to gray-400 */}
                  <Avatar color="arctic" size="xs">
                    KD
                  </Avatar>
                  <Text variant="xs" bold>
                    Karen Doe
                  </Text>
                  <Text variant="xxs" muted>
                    {formatDistanceToNow(parseJSON(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </Text>
                </HStack>
              </HStack>
              <Text variant="sm" style={tw`py-2`}>
                {comment.text}
              </Text>
              {/* <Text variant="xs" style={tw`text-primary-500`}>
                Reply...
              </Text> */}

              <View style={tw`mt-2`}>
                {comment.replies.map((reply) => {
                  if (!reply) return null;
                  return (
                    <View key={reply.id}>
                      <HStack alignItems="center">
                        <HStack alignItems="center" space="1.5">
                          {/* TODO if comment has been read change color to gray-400 */}
                          <Avatar color="emerald" size="xs">
                            ND
                          </Avatar>
                          <Text variant="xs" bold>
                            Norman Dean
                          </Text>
                        </HStack>
                        <IconButton name="more-line" style={tw`ml-auto`} />
                      </HStack>
                      <View
                        style={tw`ml-2.75 pb-2 pl-4.25 border-l-2 border-solid border-gray-200`}
                      >
                        <Text variant="xxs" muted style={tw`mt-1 mb-1.5`}>
                          {formatDistanceToNow(parseJSON(reply.createdAt), {
                            addSuffix: true,
                          })}
                        </Text>
                        <Text variant="sm">{reply.text}</Text>
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

              <HStack space="1.5">
                <Avatar color="emerald" size="xs">
                  PE
                </Avatar>
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
                  _stack={{
                    height: 16,
                    flexShrink: 1,
                  }}
                />
              </HStack>

              <SubmitButton
                disabled={
                  state.context.replyTexts[comment.id] === undefined ||
                  state.context.replyTexts[comment.id] === ""
                }
                size="sm"
                onPress={() =>
                  send({ type: "CREATE_REPLY", commentId: comment.id })
                }
                style={tw`mt-1 self-end`}
              />

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
