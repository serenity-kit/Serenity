import {
  EditorBottombarDivider,
  EditorSidebarHeader,
  Icon,
  ScrollView,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useActor } from "@xstate/react";
import { HStack } from "native-base";
import React, { useRef } from "react";
import { ScrollView as RNScrollView, StyleSheet } from "react-native";
import { usePage } from "../../context/PageContext";
import { useMeQuery } from "../../generated/graphql";
import Comment from "../comment/Comment";

function takeUntil<T>(array: T[], predicate: (value: T) => boolean): T[] {
  const result: T[] = [];

  for (const value of array) {
    if (predicate(value)) {
      return result;
    }
    result.push(value);
  }

  return result;
}

const CommentsSidebar: React.FC = () => {
  const { commentsService } = usePage();
  const [meResult] = useMeQuery();
  const [state] = useActor(commentsService);

  const scrollViewRef = useRef<RNScrollView>(null);
  const commentScrollHeightsRef = useRef<{ id: string; height: number }[]>([]);

  const scrollToCommentId = (commentId: string, animated: boolean) => {
    const scrollTop = takeUntil(
      commentScrollHeightsRef.current,
      (item) => item.id === commentId
    ).reduce((acc, item) => acc + item.height, 0);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        // the 50 is the fixed height header in the scrollview
        y: scrollTop + 50,
        animated,
      });
    }
  };

  commentsService.onTransition((state) => {
    if (state.context.isOpenSidebar && scrollViewRef.current) {
      if (
        state.event.type === "HIGHLIGHT_COMMENT" &&
        state.context.highlightedCommentId
      ) {
        scrollToCommentId(state.context.highlightedCommentId, true);
      } else if (
        state.event.type === "OPEN_SIDEBAR" ||
        state.event.type === "TOGGLE_SIDEBAR"
      ) {
        // should alays immediately scroll to top once the scrollbar opens
        // and now highlighted comment is set
        if (state.context.highlightedCommentId) {
          scrollToCommentId(state.context.highlightedCommentId, false);
        } else {
          scrollViewRef.current.scrollTo({
            y: 0,
            animated: false,
          });
        }
      }
    }
  });

  const me = meResult.data?.me;
  if (!me) return null;

  const comments = state.context.decryptedComments;

  const styles = StyleSheet.create({
    header: tw`justify-between`,
    wrapper: tw`p-4 border-b border-gray-200`,
  });

  return (
    // grow-0 overrides default of ScrollView to keep the assigned width
    <ScrollView style={tw`w-sidebar grow-0 bg-gray-100`} ref={scrollViewRef}>
      <EditorSidebarHeader style={styles.header}>
        <Text variant="xs" bold>
          Comments
        </Text>
        <HStack alignItems={"center"} style={tw`-mr-1`}>
          <Text variant="xxs" muted style={tw`p-1`}>
            Open
          </Text>
          <EditorBottombarDivider style={tw`h-4 border-r border-gray-600`} />
          <Text variant="xxs" muted style={tw`p-1`}>
            Resolved
          </Text>
        </HStack>
      </EditorSidebarHeader>

      {comments.length >= 1 ? (
        <View>
          {comments.map((comment) => {
            if (!comment) return null;

            return (
              <View
                key={comment.id}
                onLayout={(event) => {
                  commentScrollHeightsRef.current.push({
                    id: comment.id,
                    height: event.nativeEvent.layout.height,
                  });
                  console.log(
                    "commentScrollHeightsRef.current",
                    commentScrollHeightsRef.current
                  );
                }}
              >
                <Comment comment={comment} meId={me.id} meName={me.username} />
              </View>
            );
          })}
        </View>
      ) : (
        <HStack space={3} style={tw`p-4`}>
          <View style={tw``}>
            <Icon name="chat-1-line-message" color={"gray-500"} size={5} />
          </View>
          <Text variant="xs" muted>
            Add suggestions, questions or appreciations by marking a
            text-passage or image and then clicking on the comment icon in the
            floating menu.
          </Text>
        </HStack>
      )}
    </ScrollView>
  );
};

export default CommentsSidebar;
