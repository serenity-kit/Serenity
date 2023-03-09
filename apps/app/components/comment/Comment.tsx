import { hashToCollaboratorColor } from "@serenity-tools/common";
import {
  Avatar,
  Pressable,
  RawInput,
  SubmitButton,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useActor } from "@xstate/react";
import { formatDistanceToNow, parseJSON } from "date-fns";
import { HStack } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { usePage } from "../../context/PageContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { DecryptedComment } from "../../machines/commentsMachine";
import { getUserFromWorkspaceQueryResultByDeviceInfo } from "../../utils/getUserFromWorkspaceQueryResultByDeviceInfo/getUserFromWorkspaceQueryResultByDeviceInfo";
import CommentReply from "../commentReply/CommentReply";
import CommentsMenu from "../commentsMenu/CommentsMenu";

type Props = {
  comment: DecryptedComment;
  meId: string;
  meName: string;
};

export default function Comment({ comment, meId, meName }: Props) {
  const { workspaceQueryResult } = useWorkspace();
  const { commentsService } = usePage();
  const [state, send] = useActor(commentsService);
  const [isHovered, setIsHovered] = React.useState(false);

  const commentCreator = getUserFromWorkspaceQueryResultByDeviceInfo(
    workspaceQueryResult.data!,
    comment.creatorDevice
  );

  const isActiveComment = comment.id === state.context.highlightedCommentId;
  const isMyComment = commentCreator?.userId === meId;

  const styles = StyleSheet.create({
    wrapper: tw`p-4 border-b border-gray-200`,
  });

  return (
    <Pressable
      key={comment.id}
      style={[
        styles.wrapper,
        isActiveComment ? tw`bg-collaboration-honey/7` : undefined,
        { cursor: isActiveComment ? "default" : "pointer" },
      ]}
      onPress={() => {
        send({ type: "HIGHLIGHT_COMMENT_FROM_SIDEBAR", commentId: comment.id });
      }}
      //@ts-expect-error native-base mismatch
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
              size="xs"
            >
              {commentCreator.username?.split("@")[0].substring(0, 1)}
            </Avatar>
          ) : (
            <Avatar color="arctic" size="xs">
              E
            </Avatar>
          )}

          <Text variant="xxs" bold>
            {commentCreator?.username || "External"}
          </Text>
        </HStack>
        {isMyComment && (isActiveComment || isHovered) ? (
          <View style={tw`ml-auto`}>
            <CommentsMenu
              onDeletePressed={() =>
                send({ type: "DELETE_COMMENT", commentId: comment.id })
              }
            />
          </View>
        ) : null}
      </HStack>
      <View style={tw`pl-0.5 py-2`}>
        <Text variant="xxs" muted style={tw`mb-1.5`}>
          {formatDistanceToNow(parseJSON(comment.createdAt), {
            addSuffix: true,
          })}
        </Text>
        <Text variant="xs">{comment.text}</Text>
      </View>

      <View style={tw`mt-2`}>
        {comment.replies.map((reply) => {
          if (!reply) return null;

          return <CommentReply key={reply.id} reply={reply} meId={meId} />;
        })}
      </View>

      <HStack space="1.5">
        <Avatar color={hashToCollaboratorColor(meId)} size="xs">
          {meName?.split("@")[0].substring(0, 1)}
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
        onPress={() => send({ type: "CREATE_REPLY", commentId: comment.id })}
        style={tw`mt-1 self-end`}
      />
    </Pressable>
  );
}
