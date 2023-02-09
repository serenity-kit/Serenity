import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Button, ScrollView, Text, tw, View } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { usePage } from "../../context/PageContext";
import { commentsSidebarMachine } from "./commentsSidebarMachine";

const CommentsSidebar: React.FC<DrawerContentComponentProps> = () => {
  const { pageId } = usePage();
  const [state, send] = useMachine(commentsSidebarMachine, {
    context: { params: { pageId } },
  });

  return (
    // grow-0 overrides default of ScrollView to keep the assigned width
    <ScrollView
      style={tw`w-sidebar grow-0 border-l border-gray-200 bg-gray-100`}
    >
      <Text>Comments WIP</Text>

      <View>
        <Button
          onPress={() =>
            send({ type: "CREATE_COMMENT", comment: { body: "test" } })
          }
        >
          Create Comment
        </Button>
      </View>

      <View>
        {state.context.commentsByDocumentIdQueryResult?.data?.commentsByDocumentId?.nodes?.map(
          (comment) => {
            if (!comment) return null;
            return (
              <View key={comment.id}>
                <Text>{comment.id}</Text>
              </View>
            );
          }
        )}
      </View>
    </ScrollView>
  );
};

export default CommentsSidebar;
