import { hashToCollaboratorColor } from "@serenity-tools/common";
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
import { useActor } from "@xstate/react";
import { formatDistanceToNow, parseJSON } from "date-fns";
import { HStack } from "native-base";
import { StyleSheet } from "react-native";
import { usePage } from "../../context/PageContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getUserFromWorkspaceQueryResultByDeviceInfo } from "../../utils/getUserFromWorkspaceQueryResultByDeviceInfo/getUserFromWorkspaceQueryResultByDeviceInfo";

const CommentsSidebar: React.FC<{}> = () => {
  const { workspaceQueryResult } = useWorkspace();
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

          const commentCreator = getUserFromWorkspaceQueryResultByDeviceInfo(
            workspaceQueryResult.data!,
            comment.creatorDevice
          );

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
                {/* <View style={tw`w-4 -ml-4 flex-row justify-center`}>
                  <View style={tw`h-1.5 w-1.5 rounded-full bg-primary-500`} />
                </View> */}

                <HStack alignItems="center" space="1.5">
                  {/* TODO if comment has been read change color to gray-400 */}
                  {commentCreator ? (
                    <Avatar
                      key={commentCreator.userId}
                      color={hashToCollaboratorColor(commentCreator.userId)}
                    >
                      {commentCreator.username?.split("@")[0].substring(0, 1)}
                    </Avatar>
                  ) : (
                    <Avatar color="arctic" size="xs">
                      E
                    </Avatar>
                  )}

                  <Text variant="xs" bold>
                    {commentCreator?.username || "External"}
                  </Text>
                </HStack>
                {/* <IconButton name="more-line" style={tw`ml-auto`} /> */}
              </HStack>
              <View style={tw`pl-0.5 py-2`}>
                <Text variant="xxs" muted style={tw`mb-1.5`}>
                  {formatDistanceToNow(parseJSON(comment.createdAt), {
                    addSuffix: true,
                  })}
                </Text>
                <Text variant="sm">{comment.text}</Text>
              </View>

              <View style={tw`mt-2`}>
                {comment.replies.map((reply) => {
                  if (!reply) return null;

                  const replyCreator =
                    getUserFromWorkspaceQueryResultByDeviceInfo(
                      workspaceQueryResult.data!,
                      reply.creatorDevice
                    );
                  return (
                    <View key={reply.id}>
                      <HStack alignItems="center">
                        <HStack alignItems="center" space="1.5">
                          {/* TODO if comment has been read change color to gray-400 */}
                          {replyCreator ? (
                            <Avatar
                              key={replyCreator.userId}
                              color={hashToCollaboratorColor(
                                replyCreator.userId
                              )}
                            >
                              {replyCreator.username
                                ?.split("@")[0]
                                .substring(0, 1)}
                            </Avatar>
                          ) : (
                            <Avatar color="arctic" size="xs">
                              E
                            </Avatar>
                          )}
                          <Text variant="xs" bold>
                            {replyCreator?.username || "External"}
                          </Text>
                        </HStack>
                        {/* <IconButton name="more-line" style={tw`ml-auto`} /> */}
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
                {/* TODO use active user for reply */}
                {/* <Avatar color="rose" size="xs">
                  FO
                </Avatar> */}
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
