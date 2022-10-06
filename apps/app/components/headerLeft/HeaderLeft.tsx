import { useNavigation, useRoute } from "@react-navigation/native";
import { IconButton, tw, View } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useWindowDimensions } from "react-native";

type Props = {
  canGoBack: boolean;
  defaultNavigateTo?: "WorkspaceSettings" | "AccountSettings" | "WorkspaceRoot";
};

export function HeaderLeft({ canGoBack, defaultNavigateTo }: Props) {
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
            // back to Account Device Settings which is not correct. That's we
            // need special conditions based on the previous routes.

            // @ts-expect-error workspaceId is only defined in certain cases
            const workspaceId = route.params?.workspaceId || undefined;
            if (defaultNavigateTo === "AccountSettings") {
              navigation.navigate("AccountSettings");
            } else if (
              defaultNavigateTo === "WorkspaceSettings" &&
              workspaceId
            ) {
              navigation.navigate("WorkspaceSettings", { workspaceId });
            } else if (
              defaultNavigateTo === "WorkspaceRoot" &&
              workspaceId &&
              // This is a special case to have better UX.
              // We prefer canGoBack over defaultNavigateTo, but have to make sure
              // in case the go back would go to a settings screen we need to
              // overwrite the back behaviour.
              // in order to make sure we go back to the open drawer on mobile
              // rather then redirect to the workspace root which feels
              // broken on Mobile devices.
              navigation
                .getState()
                .routes[0].name.startsWith("WorkspaceSettings")
            ) {
              navigation.navigate("Workspace", {
                workspaceId,
                screen: "WorkspaceRoot",
              });
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
