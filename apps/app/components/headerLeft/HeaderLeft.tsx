import { useNavigation, useRoute } from "@react-navigation/native";
import { IconButton, tw, View } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useWindowDimensions } from "react-native";

type Props = {
  canGoBack: boolean;
  navigateTo?: "WorkspaceSettings" | "AccountSettings" | "WorkspaceRoot";
};

export function HeaderLeft({ canGoBack, navigateTo }: Props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <HStack alignItems={"center"}>
      <View style={tw`web:pl-3`}>
        <IconButton
          onPress={() => {
            // When starting on a deep link you might run into a situation where
            // goBack would be the wrong action. E.g. you start on a deep link
            // in Account Device Settings. If you go back you would end up in
            // Account Settings which is correct. But from there the goBack would
            // back to Account Device Settings which is not correct.
            // That's why we enforce back button navigation using the navigateTo
            // props.

            if (navigateTo) {
              // @ts-expect-error workspaceId is only defined in certain cases
              const workspaceId = route.params?.workspaceId || undefined;
              if (navigateTo === "AccountSettings") {
                navigation.navigate("AccountSettings");
              } else if (navigateTo === "WorkspaceSettings" && workspaceId) {
                navigation.navigate("WorkspaceSettings", { workspaceId });
              } else if (navigateTo === "WorkspaceRoot" && workspaceId) {
                navigation.navigate("Workspace", {
                  workspaceId,
                  screen: "WorkspaceRoot",
                });
              }
            } else if (canGoBack) {
              navigation.goBack();
            } else {
              navigation.navigate("Root");
            }
          }}
          name="arrow-left-line"
          color={"gray-900"}
          size={"lg"}
        />
      </View>
    </HStack>
  );
}
