import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { ScrollView, Text, tw } from "@serenity-tools/ui";

const CommentsSidebar: React.FC<DrawerContentComponentProps> = () => {
  return (
    // grow-0 overrides default of ScrollView to keep the assigned width
    <ScrollView
      style={tw`w-sidebar grow-0 border-l border-gray-200 bg-gray-100`}
    >
      <Text>Comments</Text>
    </ScrollView>
  );
};

export default CommentsSidebar;
