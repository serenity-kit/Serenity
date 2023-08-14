import {
  Avatar,
  hashToCollaboratorColor,
  Pressable,
  ReplyArea,
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
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { findVerifiedUserByDeviceSigningPublicKey } from "../../utils/findVerifiedUserByDeviceSigningPublicKey/findVerifiedUserByDeviceSigningPublicKey";
import CommentReply from "../commentReply/CommentReply";
import CommentsMenu from "../commentsMenu/CommentsMenu";

type Props = {
  comment: DecryptedComment;
  meId: string;
  meName: string;
};

export default function Comment({ comment, meId, meName }: Props) {
  const { users } = useWorkspace();
  const { commentsService } = usePage();
  const [state, send] = useActor(commentsService);
  const [isHovered, setIsHovered] = React.useState(false);
  const documentState = useEditorStore((state) => state.documentState);

  const commentCreator = findVerifiedUserByDeviceSigningPublicKey({
    users,
    signingPublicKey: comment.creatorDevice.signingPublicKey,
  });
  const isActiveComment = comment.id === state.context.highlightedComment?.id;
  const isMyComment = commentCreator?.userId === meId;

  const replyLength = comment.replies.length;
  const replyString = {
    0: "Reply ...",
    1: "1 Reply",
  };
  const replyPlaceholder = replyString[replyLength] || `${replyLength} Replies`;

  const submitButtonHeight = 7;

  const styles = StyleSheet.create({
    wrapper: tw`p-4 border-b border-gray-200`,
    textarea: tw`pb-${submitButtonHeight}`,
    submit: tw`absolute h-${submitButtonHeight} w-${submitButtonHeight} bottom-0.5 right-0.5`,
  });

  const hasError = documentState === "error";

  return (
    <Pressable
      key={comment.id}
      style={[
        styles.wrapper,
        isHovered && !isActiveComment && tw`bg-gray-150/70`,
        { cursor: isActiveComment ? "default" : "pointer" },
      ]}
      onPress={() => {
        send({ type: "HIGHLIGHT_COMMENT_FROM_SIDEBAR", commentId: comment.id });
      }}
      //@ts-expect-error native-base mismatch
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      testID={`comment-${comment.id}`}
    >
      <HStack alignItems="center">
        {/* new comment indicator */}
        {/* <View style={tw`w-4 -ml-4 flex-row justify-center`}>
            <View style={tw`h-1.5 w-1.5 rounded-full bg-primary-500`} />
          </View> */}

        <HStack alignItems="center" space="1.5">
          {commentCreator ? (
            <Avatar
              key={commentCreator.userId}
              color={hashToCollaboratorColor(commentCreator.userId)}
              size="xs"
              muted={!isActiveComment}
            >
              {commentCreator.email?.split("@")[0].substring(0, 1)}
            </Avatar>
          ) : (
            <Avatar color="arctic" size="xs" muted={!isActiveComment}>
              E
            </Avatar>
          )}

          <Text
            variant="xxs"
            bold
            style={tw`max-w-40 ${
              isActiveComment ? "text-gray-900" : "text-gray-700"
            }`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {commentCreator?.email || "External"}
          </Text>
        </HStack>
        {isMyComment && (isActiveComment || isHovered) ? (
          <View style={tw`ml-auto`}>
            <CommentsMenu
              onDeletePressed={() =>
                send({ type: "DELETE_COMMENT", commentId: comment.id })
              }
              commentId={comment.id}
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
        <Text variant="xs" testID={`comment-${comment.id}__text-content`}>
          {comment.text}
        </Text>
      </View>
      {isActiveComment ? (
        <>
          <View style={!hasError || replyLength > 0 ? tw`mt-2` : tw``}>
            {comment.replies.map((reply, i) => {
              if (!reply) return null;

              return (
                <CommentReply
                  key={reply.id}
                  reply={reply}
                  meId={meId}
                  commentId={comment.id}
                  naked={hasError && i + 1 === replyLength}
                />
              );
            })}
          </View>

          {!hasError ? (
            <HStack space="1.5">
              <Avatar color={hashToCollaboratorColor(meId)} size="xs">
                {meName?.split("@")[0].substring(0, 1)}
              </Avatar>

              {/* negative margin to align ReplyArea centered with Avatar on default
            without losing line-connection between replying Avatars */}
              <View style={tw`relative -mt-1.5`}>
                <ReplyArea
                  value={state.context.replyTexts[comment.id]}
                  onChangeText={(text) =>
                    send({
                      type: "UPDATE_REPLY_TEXT",
                      commentId: comment.id,
                      text,
                    })
                  }
                  style={styles.textarea}
                  onSubmitPress={() =>
                    send({ type: "CREATE_REPLY", commentId: comment.id })
                  }
                  testPrefix={`comment-${comment.id}`}
                />
              </View>
            </HStack>
          ) : null}
        </>
      ) : null}

      {!isActiveComment && (!hasError || (hasError && replyLength > 0)) ? (
        <Text
          variant="xxs"
          style={tw`pt-1 pl-0.5 ${
            replyLength >= 1 ? "text-primary-400" : "text-gray-600"
          }`}
        >
          {replyPlaceholder}
        </Text>
      ) : null}
    </Pressable>
  );
}
