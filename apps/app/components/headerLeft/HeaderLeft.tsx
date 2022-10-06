import { useNavigation, useRoute } from "@react-navigation/native";
import { IconButton, tw, View } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useWindowDimensions } from "react-native";

type Props = {
  canGoBack: boolean;
  defaultNavigate:
    | "WorkspaceSettings"
    | "AccountSettings"
    | "WorkspaceRoot"
    | "Root";
};

export function HeaderLeft({ canGoBack, defaultNavigate }: Props) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <HStack alignItems={"center"}>
      <View style={tw`web:pl-3`}>
        <IconButton
          onPress={() => {
            if (canGoBack) {
              navigation.goBack();
            } else {
              // this case only happens if you directly navigate to a screen via a deep link on a mobile device

              // @ts-expect-error workspaceId is only defined in certain cases
              const workspaceId = route.params?.workspaceId || undefined;
              if (defaultNavigate === "AccountSettings") {
                navigation.navigate("AccountSettings");
              } else if (
                defaultNavigate === "WorkspaceSettings" &&
                workspaceId
              ) {
                navigation.navigate("WorkspaceSettings", { workspaceId });
              } else if (defaultNavigate === "WorkspaceRoot" && workspaceId) {
                navigation.navigate("Workspace", {
                  workspaceId,
                  screen: "WorkspaceRoot",
                });
              } else {
                navigation.navigate("Root");
              }
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
