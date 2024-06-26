import {
  EditorSidebarHeader,
  EmptyMessage,
  Text,
  VerticalDivider,
  tw,
} from "@serenity-tools/ui";
import { useSelector } from "@xstate/react";
import { HStack } from "native-base";
import React, { useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import { usePage } from "../../context/PageContext";
import { useMeQuery } from "../../generated/graphql";
import Comment from "../comment/Comment";

const styles = StyleSheet.create({
  header: tw`justify-between`,
  wrapper: tw`p-4 border-b border-gray-200`,
});

const Header: React.FC = () => {
  return (
    <EditorSidebarHeader style={styles.header}>
      <Text variant="xs" bold>
        Comments
      </Text>
      <HStack alignItems={"center"} style={tw`-mr-1`}>
        <Text variant="xxs" muted style={tw`p-1`}>
          Open
        </Text>
        <VerticalDivider style={tw`h-4 border-r border-gray-500`} />
        <Text variant="xxs" muted style={tw`p-1`}>
          Resolved
        </Text>
      </HStack>
    </EditorSidebarHeader>
  );
};

const EmptyState: React.FC = () => {
  return (
    <EmptyMessage iconName="chat-4-line-message">
      Add suggestions, questions or appreciations by marking a text-passage or
      image and then clicking on the comment icon in the floating menu.
    </EmptyMessage>
  );
};

type Props = {
  canComment: boolean;
};

const CommentsSidebar: React.FC<Props> = ({ canComment }) => {
  const { commentsService } = usePage();
  const [meResult] = useMeQuery();
  const state = useSelector(commentsService, (state) => state);
  const comments = state.context.decryptedComments;
  const flatListRef = useRef<FlatList>(null);

  commentsService.on("HIGHLIGHT_COMMENT_FROM_EDITOR", (event) => {
    const snapshot = commentsService.getSnapshot();
    if (
      snapshot.context.isOpenSidebar &&
      state.context.highlightedComment?.id &&
      flatListRef.current
    ) {
      const index = comments.findIndex(
        (comment) => comment.id === state.context.highlightedComment?.id
      );
      if (index === -1) return; // in case the list isn't yet loaded
      flatListRef.current.scrollToIndex({
        index,
        // in case sidebar opens and highlighted at the same time
        // @ts-expect-error types are wrong
        animated: !Boolean(event.openSidebar),
        viewPosition: 0,
      });
    }
  });

  commentsService.on("OPEN_SIDEBAR", (event) => {
    const snapshot = commentsService.getSnapshot();
    if (snapshot.context.isOpenSidebar && flatListRef.current) {
      // should alays immediately scroll to top once the scrollbar opens
      // and now highlighted comment is set
      if (state.context.highlightedComment?.id) {
        const index = comments.findIndex(
          (comment) => comment.id === state.context.highlightedComment?.id
        );
        if (index === -1) return; // in case the list isn't yet loaded
        flatListRef.current.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0,
        });
      } else {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    }
  });

  commentsService.on("TOGGLE_SIDEBAR", (event) => {
    const snapshot = commentsService.getSnapshot();
    if (snapshot.context.isOpenSidebar && flatListRef.current) {
      // should alays immediately scroll to top once the scrollbar opens
      // and now highlighted comment is set
      if (state.context.highlightedComment?.id) {
        const index = comments.findIndex(
          (comment) => comment.id === state.context.highlightedComment?.id
        );
        if (index === -1) return; // in case the list isn't yet loaded
        flatListRef.current.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0,
        });
      } else {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    }
  });

  const me = meResult.data?.me || { id: "unknown", username: "Unknown" };

  return (
    <FlatList
      ListHeaderComponent={Header}
      ListEmptyComponent={EmptyState}
      // grow-0 overrides default of ScrollView to keep the assigned width
      style={tw`w-sidebar grow-0 bg-gray-100`}
      ref={flatListRef}
      data={comments}
      renderItem={({ item }) => {
        return (
          <Comment
            comment={item}
            meId={me.id}
            meName={me.username}
            canComment={canComment}
          />
        );
      }}
      keyExtractor={(comment) => comment.id}
      onScrollToIndexFailed={async (info) => {
        // TODO should there be a delay here and cancel the scroll after x tries?
        await new Promise((resolve) => setTimeout(resolve, 200));
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
        });
      }}
    />
  );
};

export default CommentsSidebar;
