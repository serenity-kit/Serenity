import React from "react";
import {
  EditorBottombarDivider,
  EditorSidebarHeader,
  ScrollView,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useActor } from "@xstate/react";
import { HStack } from "native-base";
import { StyleSheet } from "react-native";
import { usePage } from "../../context/PageContext";
import { useMeQuery } from "../../generated/graphql";
import Comment from "../comment/Comment";

const CommentsSidebar: React.FC<{}> = () => {
  const { commentsService } = usePage();
  const [meResult] = useMeQuery();
  const [state] = useActor(commentsService);

  const me = meResult.data?.me;
  if (!me) return null;

  const comments = state.context.decryptedComments;

  const styles = StyleSheet.create({
    header: tw`justify-between`,
    wrapper: tw`p-4 border-b border-gray-200`,
  });

  return (
    // grow-0 overrides default of ScrollView to keep the assigned width
    <ScrollView style={tw`w-sidebar grow-0 bg-gray-100`}>
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

      <View>
        {state.context.decryptedComments.map((comment) => {
          if (!comment) return null;

          return (
            <Comment
              key={`comment_${comment.id}`}
              comment={comment}
              meId={me.id}
              meName={me.username}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

export default CommentsSidebar;
