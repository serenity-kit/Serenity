import { useFocusRing } from "@react-native-aria/focus";
import { useNavigation } from "@react-navigation/native";
import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuLink,
  Pressable,
  SidebarDivider,
  Text,
  tw,
  useIsDesktopDevice,
  useIsPermanentLeftSidebar,
  View,
  WorkspaceAvatar,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { Platform } from "react-native";
import { useAppContext } from "../../context/AppContext";
import {
  useMeQuery,
  useWorkspaceQuery,
  useWorkspacesQuery,
} from "../../generated/graphql";
import { clearDeviceAndSessionStorage } from "../../utils/authentication/clearDeviceAndSessionStorage";
import { userWorkspaceKeyStore } from "../../utils/workspace/workspaceKeyStore";

type Props = {
  workspaceId?: string;
  openCreateWorkspace: () => void;
  testID?: string;
};

export default function AccountMenu({
  workspaceId,
  openCreateWorkspace,
  testID,
}: Props) {
  const testIdPrefix = testID ? `${testID}__` : "";
  const [isOpenAccountMenu, setIsOpenAccountMenu] = useState(false);
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const isDesktopDevice = useIsDesktopDevice();
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const navigation = useNavigation();
  const { activeDevice, updateAuthentication } = useAppContext();
  const [meResult] = useMeQuery();
  const [workspaceResult] = useWorkspaceQuery({
    variables: {
      id: workspaceId,
      // fine since the query would not fire if pause is active
      deviceSigningPublicKey: activeDevice?.signingPublicKey!,
    },
    pause: !workspaceId || !activeDevice,
  });
  const [workspacesResult] = useWorkspacesQuery({
    // fine since the query would not fire if pause is active
    variables: { deviceSigningPublicKey: activeDevice?.signingPublicKey! },
    pause: !activeDevice,
  });
  const clearWorkspaceKeyStore = userWorkspaceKeyStore((state) => state.clear);

  return (
    <Menu
      placement="bottom left"
      // we could solve this via additional margin but that's kinda hacky and messes with the BoxShadow component
      // style={tw`ml-4`}
      offset={2}
      // can never be more than half the trigger width !! should be something like 16+24+8+labellength*12-24
      // or we only use the icon as the trigger (worsens ux)
      crossOffset={120}
      isOpen={isOpenAccountMenu}
      onChange={setIsOpenAccountMenu}
      trigger={
        <Pressable
          accessibilityLabel="More options menu"
          {...focusRingProps}
          // disable default outline styles
          // @ts-expect-error - web only
          _focusVisible={{ _web: { style: { outlineStyle: "none" } } }}
          testID={`${testIdPrefix}account-menu--trigger`}
        >
          <HStack
            space={isPermanentLeftSidebar ? 2 : 3}
            alignItems="center"
            style={[
              tw`py-0.5 md:py-1.5 pr-2`,
              isFocusVisible && tw`se-inset-focus-mini`,
            ]}
          >
            <WorkspaceAvatar size={isPermanentLeftSidebar ? "xs" : "sm"} />
            <Text
              variant={isPermanentLeftSidebar ? "xs" : "md"}
              bold
              style={tw`-mr-1 max-w-30 text-gray-900`} // -mr needed for icon spacing, max-w needed for ellipsis
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {workspaceId
                ? workspaceResult.data?.workspace?.name || " "
                : "No workspace"}
            </Text>
            <Icon name="arrow-up-down-s-line" color={"gray-400"} />
          </HStack>
        </Pressable>
      }
    >
      <MenuLink
        to={{ screen: "AccountSettings" }}
        onPress={(event) => {
          setIsOpenAccountMenu(false);
          if (Platform.OS === "ios") {
            event.preventDefault();
            navigation.navigate("AccountSettings");
          }
        }}
        icon={<Icon name={"user-settings-line"} color="gray-600" />}
      >
        {meResult?.data?.me?.username}
      </MenuLink>

      {workspacesResult?.data?.workspaces?.nodes &&
      workspacesResult.data.workspaces.nodes.length >= 1
        ? workspacesResult.data.workspaces.nodes.map((workspace) =>
            workspace === null || workspace === undefined ? null : (
              <MenuLink
                key={workspace.id}
                to={{
                  screen: "Workspace",
                  params: {
                    workspaceId: workspace.id,
                    screen: "WorkspaceRoot",
                  },
                }}
                icon={
                  <WorkspaceAvatar
                    customColor={"honey"}
                    key={`avatar_${workspace.id}`}
                    size="xxs"
                  />
                }
              >
                {workspace.name}
              </MenuLink>
            )
          )
        : null}

      {isDesktopDevice ? (
        <View style={tw`pl-1.5 pr-3 py-1.5`}>
          <IconButton
            onPress={() => {
              setIsOpenAccountMenu(false);
              openCreateWorkspace();
            }}
            name="plus"
            label="Create workspace"
            testID={`${testIdPrefix}account-menu--create-workspace`}
          />
        </View>
      ) : (
        <MenuButton
          onPress={() => {
            setIsOpenAccountMenu(false);
            openCreateWorkspace();
          }}
          iconName="plus"
        >
          Create workspace
        </MenuButton>
      )}

      <SidebarDivider collapsed />
      <MenuButton
        onPress={async () => {
          try {
            setIsOpenAccountMenu(false);
            navigation.navigate("LogoutInProgress");
            clearDeviceAndSessionStorage(clearWorkspaceKeyStore);
            await updateAuthentication(null);
          } catch (error) {
            alert(
              "Failed to destroy the local data. Please login and try again."
            );
          } finally {
            navigation.navigate("Login");
          }
        }}
        testID={`${testIdPrefix}account-menu--logout`}
      >
        Logout
      </MenuButton>
    </Menu>
  );
}
