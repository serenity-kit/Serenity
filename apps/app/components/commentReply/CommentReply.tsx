import {
  Avatar,
  hashToCollaboratorColor,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useActor } from "@xstate/react";
import { formatDistanceToNow, parseJSON } from "date-fns";
import { HStack } from "native-base";
import React from "react";
import { usePage } from "../../context/PageContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { DecryptedReply } from "../../machines/commentsMachine";
import { getUserFromWorkspaceQueryResultByDeviceInfo } from "../../utils/getUserFromWorkspaceQueryResultByDeviceInfo/getUserFromWorkspaceQueryResultByDeviceInfo";
import CommentsMenu from "../commentsMenu/CommentsMenu";

type Props = {
  reply: DecryptedReply;
  meId: string;
  commentId: string;
};

export default function CommentReply({ reply, meId, commentId }: Props) {
  const { workspaceQueryResult } = useWorkspace();
  const { commentsService } = usePage();
  const [, send] = useActor(commentsService);
  const [isHovered, setIsHovered] = React.useState(false);

  const replyCreator = getUserFromWorkspaceQueryResultByDeviceInfo(
    workspaceQueryResult.data!,
    reply.creatorDevice
  );

  const isMyReply = replyCreator?.userId === meId;

  return (
    <View
      //@ts-expect-error as Views usually not have a hover
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      testID={`comment-${commentId}__comment-reply-${reply.id}`}
    >
      <HStack alignItems="center">
        <HStack alignItems="center" space="1.5">
          {/* TODO if comment has been read change color to gray */}
          {replyCreator ? (
            <Avatar
              key={replyCreator.userId}
              color={hashToCollaboratorColor(replyCreator.userId)}
              size="xs"
            >
              {replyCreator.username?.split("@")[0].substring(0, 1)}
            </Avatar>
          ) : (
            <Avatar color="arctic" size="xs">
              E
            </Avatar>
          )}
          <Text
            variant="xxs"
            bold
            style={tw`max-w-40`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {replyCreator?.username || "External"}
          </Text>
        </HStack>
        {isMyReply && isHovered ? (
          <View style={tw`ml-auto`}>
            <CommentsMenu
              commentId={commentId}
              commentReplyId={reply.id}
              onDeletePressed={() =>
                send({
                  type: "DELETE_REPLY",
                  replyId: reply.id,
                })
              }
            />
          </View>
        ) : null}
      </HStack>
      <View
        style={tw`ml-2.75 pb-4 pl-4.25 border-l-2 border-solid border-gray-200`}
      >
        <Text variant="xxs" muted style={tw`mt-1 mb-1.5`}>
          {formatDistanceToNow(parseJSON(reply.createdAt), {
            addSuffix: true,
          })}
        </Text>
        <Text
          variant="xs"
          testID={`comment-${commentId}__comment-reply-${reply.id}--text-content`}
        >
          {reply.text}
        </Text>
      </View>
    </View>
  );
}
