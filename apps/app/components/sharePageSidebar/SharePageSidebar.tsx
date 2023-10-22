import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  IconButton,
  tw,
  useIsDesktopDevice,
  useIsPermanentLeftSidebar,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import AccountMenu from "../accountMenu/AccountMenu";

export default function SharePageSidebar(props: DrawerContentComponentProps) {
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const isDesktopDevice = useIsDesktopDevice();

  return (
    // TODO override for now until we find out where the pt-1 comes from
    <DrawerContentScrollView
      {...props}
      style={[
        tw`bg-gray-100 -mt-1 pb-4`,
        isDesktopDevice &&
          !isPermanentLeftSidebar &&
          tw`border-r border-gray-200`,
      ]}
    >
      <HStack
        alignItems="center"
        justifyContent="space-between"
        style={[
          tw`h-12 pr-2.5 pl-5 md:px-4`,
          !isDesktopDevice && tw`border-b border-gray-200`,
        ]}
      >
        <AccountMenu
          openCreateWorkspace={() => {
            props.navigation.navigate("Onboarding");
          }}
          testID="general"
        />
        {!isPermanentLeftSidebar && (
          <IconButton
            onPress={() => {
              props.navigation.closeDrawer();
            }}
            name="double-arrow-left"
            size={isDesktopDevice ? "md" : "xl"}
          ></IconButton>
        )}
      </HStack>
    </DrawerContentScrollView>
  );
}
