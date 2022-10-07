import { useNavigation, useRoute } from "@react-navigation/native";
import { IconButton, tw, View } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useWindowDimensions } from "react-native";

type Props = {
  canGoBack: boolean;
  navigateTo?: "WorkspaceSettings" | "AccountSettings";
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
            // @ts-expect-error workspaceId is only defined in certain cases
            const workspaceId = route.params?.workspaceId || undefined;

            if (
              // When starting on a deep link you might run into a situation where
              // goBack would be the wrong action. E.g. you start on a deep link
              // in Account Devices Settings. If you go back you would end up in
              // Account Settings which is correct. But from there the goBack would
              // back to Account Devices Settings which is not correct. That's why
              // we need to handle this case explicitly.
              // We don't want it by default since goBack has the best default
              // behavior e.g. when going back on iOS you end up again in the open
              // drawer instead of the page where the drawer would close right away.
              route.name === "AccountSettings" &&
              navigation.getState().routes[0].name.startsWith("AccountSettings")
            ) {
              navigation.navigate("Root");
            } else if (
              // When starting on a deep link you might run into a situation where
              // goBack would be the wrong action. E.g. you start on a deep link
              // in Workspace Members Settings. If you go back you would end up in
              // Workspace Settings which is correct. But from there the goBack would
              // back to Workspace Members Settings which is not correct. That's why
              // we need to handle this case explicitly.
              // We don't want it by default since goBack has the best default
              // behavior e.g. when going back on iOS you end up again in the open
              // drawer instead of the page where the drawer would close right away.
              route.name === "WorkspaceSettings" &&
              navigation
                .getState()
                .routes[0].name.startsWith("WorkspaceSettings")
            ) {
              navigation.navigate("Workspace", {
                workspaceId,
                screen: "WorkspaceRoot",
              });
            } else if (navigateTo === "AccountSettings") {
              navigation.navigate("AccountSettings");
            } else if (navigateTo === "WorkspaceSettings" && workspaceId) {
              navigation.navigate("WorkspaceSettings", { workspaceId });
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
