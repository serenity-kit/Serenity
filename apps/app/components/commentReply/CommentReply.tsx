import {
  Avatar,
  hashToCollaboratorColor,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { formatDistanceToNow, parseJSON } from "date-fns";
import { HStack } from "native-base";
import React from "react";
import { usePage } from "../../context/PageContext";
import { DecryptedReply } from "../../machines/commentsMachine";
import { getLocalUserByDeviceSigningPublicKey } from "../../store/userStore";
import CommentsMenu from "../commentsMenu/CommentsMenu";

type Props = {
  reply: DecryptedReply;
  meId: string;
  commentId: string;
  naked?: boolean;
};

export default function CommentReply({
  reply,
  meId,
  commentId,
  naked = false,
}: Props) {
  const { commentsService } = usePage();
  const [isHovered, setIsHovered] = React.useState(false);

  const replyCreator = getLocalUserByDeviceSigningPublicKey({
    signingPublicKey: reply.creatorDevice.signingPublicKey,
    includeExpired: true,
    includeRemoved: true,
  });

  const isMyReply = replyCreator?.id === meId;

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
              key={replyCreator.id}
              color={hashToCollaboratorColor(replyCreator.id)}
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
                commentsService.send({
                  type: "DELETE_REPLY",
                  replyId: reply.id,
                })
              }
            />
          </View>
        ) : null}
      </HStack>
      <View
        style={tw`ml-2.75 ${
          naked ? `pb-2 border-transparent` : `pb-4 border-gray-200`
        }  pl-4.25 border-l-2 border-solid`}
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
