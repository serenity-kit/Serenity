import { useFocusRing } from "@react-native-aria/focus";
import { useNavigation } from "@react-navigation/native";
import {
  decryptWorkspaceInfo,
  decryptWorkspaceKey,
} from "@serenity-tools/common";
import {
  HorizontalDivider,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuLink,
  Pressable,
  Spinner,
  Text,
  View,
  WorkspaceAvatar,
  tw,
  useIsDesktopDevice,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { HStack } from "native-base";
import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { initiateLogout } from "../../navigation/screens/logoutInProgressScreen/LogoutInProgressScreen";
import { getMainDevice } from "../../store/mainDeviceMemoryStore";
import * as workspaceStore from "../../store/workspaceStore";
import { OS } from "../../utils/platform/platform";
import { VerifyPasswordModal } from "../verifyPasswordModal/VerifyPasswordModal";
import { accountMenuMachine } from "./accountMenuMachine";

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
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const isDesktopDevice = useIsDesktopDevice();
  const navigation = useNavigation();
  const { activeDevice } = useAppContext();
  const [state, send] = useMachine(accountMenuMachine, {
    context: {
      params: { workspaceId, activeDevice },
    },
  });
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const workspacesQueryResult = state.context.workspacesQueryResult;
  const { workspaces } = workspaceStore.useLocalWorkspaces();

  const logout = () => {
    initiateLogout();
    // making sure there are screens hanging around that would re-render
    // on logout and cause issues
    navigation.reset({
      index: 0,
      routes: [{ name: "LogoutInProgress" }],
    });
  };

  const logoutPreflight = () => {
    send("CLOSE");
    const mainDevice = getMainDevice();
    if (mainDevice) {
      logout();
      return;
    }
    setIsPasswordModalVisible(true);
  };

  let workspaceName = "";
  if (state.context.workspaceQueryResult?.data?.workspace) {
    const workspaceData = state.context.workspaceQueryResult.data.workspace;

    if (
      workspaceData.infoCiphertext &&
      workspaceData.infoNonce &&
      workspaceData.infoWorkspaceKey?.workspaceKeyBox &&
      activeDevice
    ) {
      // TODO verify that creator
      // needs a workspace key chain with a main device!
      const workspaceKey = decryptWorkspaceKey({
        ciphertext: workspaceData.infoWorkspaceKey?.workspaceKeyBox?.ciphertext,
        nonce: workspaceData.infoWorkspaceKey?.workspaceKeyBox?.nonce,
        creatorDeviceEncryptionPublicKey:
          workspaceData.infoWorkspaceKey?.workspaceKeyBox?.creatorDevice
            .encryptionPublicKey,
        receiverDeviceEncryptionPrivateKey: activeDevice?.encryptionPrivateKey,
        workspaceId: workspaceData.id,
        workspaceKeyId: workspaceData.infoWorkspaceKey?.id,
      });
      const decryptedWorkspaceInfo = decryptWorkspaceInfo({
        ciphertext: workspaceData.infoCiphertext,
        nonce: workspaceData.infoNonce,
        key: workspaceKey,
      });
      if (
        decryptedWorkspaceInfo &&
        typeof decryptedWorkspaceInfo.name === "string"
      ) {
        workspaceName = decryptedWorkspaceInfo.name as string;
      }
    }
  }

  return (
    <>
      <Menu
        bottomSheetModalProps={{
          snapPoints: [
            // 50 is the height of a single workspace item
            180 +
              (workspacesQueryResult?.data?.workspaces?.nodes?.length || 1) *
                50,
          ],
        }}
        popoverProps={{
          placement: "bottom left",
          // we could solve this via additional margin but that's kinda hacky and messes with the BoxShadow component
          // style={tw`ml-4`}
          offset: 2,
          // can never be more than half the trigger width !! should be something like 16+24+8+labellength*12-24
          // or we only use the icon as the trigger (worsens ux)
          crossOffset: 120,
        }}
        isOpen={state.matches("open")}
        onChange={(isOpen) => {
          if (activeDevice && isOpen) {
            workspaceStore.loadRemoteWorkspaces({ activeDevice });
          }
          send(isOpen ? "OPEN" : "CLOSE");
        }}
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
              space={isDesktopDevice ? 2 : 3}
              alignItems="center"
              style={[
                tw`py-0.5 md:py-1.5 pr-2`,
                isFocusVisible && tw`se-inset-focus-mini`,
              ]}
            >
              <WorkspaceAvatar size={isDesktopDevice ? "xs" : "sm"} />
              <Text
                variant={isDesktopDevice ? "xs" : "md"}
                bold
                style={tw`-mr-1 max-w-30 text-gray-900`} // -mr needed for icon spacing, max-w needed for ellipsis
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {workspaceId ? workspaceName : "No workspace"}
              </Text>
              <Icon name="arrow-up-down-s-line" color={"gray-400"} />
            </HStack>
          </Pressable>
        }
      >
        <MenuLink
          to={{ screen: "AccountSettings" }}
          onPress={(event) => {
            send("CLOSE");
            if (OS === "ios") {
              event.preventDefault();
              navigation.navigate("AccountSettings");
            }
          }}
          icon={<Icon name={"user-settings-line"} color="gray-600" />}
          testID={`${testIdPrefix}account-menu--account-settings`}
        >
          {state.context.meQueryResult?.data?.me?.username}
        </MenuLink>

        {workspaces.length >= 1 ? (
          workspaces.map((workspace) => {
            return (
              <MenuLink
                key={workspace.id}
                to={{
                  screen: "Workspace",
                  params: {
                    workspaceId: workspace.id,
                    screen: "WorkspaceDrawer",
                    params: {
                      screen: "WorkspaceRoot",
                    },
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
            );
          })
        ) : (
          <View style={tw`pl-5 py-3.5`}>
            <Spinner
              style={tw`items-start`}
              size={isDesktopDevice ? "sm" : "lg"}
            />
          </View>
        )}

        {isDesktopDevice ? (
          <View style={tw`pl-1.5 pr-3 py-1.5`}>
            <IconButton
              onPress={() => {
                send("CLOSE");
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
              send("CLOSE");
              openCreateWorkspace();
            }}
            iconName="plus"
          >
            Create workspace
          </MenuButton>
        )}

        <HorizontalDivider collapsed />
        <MenuButton
          onPress={() => {
            logoutPreflight();
          }}
          testID={`${testIdPrefix}account-menu--logout`}
        >
          Logout
        </MenuButton>
      </Menu>
      <VerifyPasswordModal
        isVisible={isPasswordModalVisible}
        description="Logging out requires access to the main account and therefore verifying your password is required"
        onSuccess={() => {
          logout();
        }}
        onCancel={() => {
          setIsPasswordModalVisible(false);
        }}
      />
    </>
  );
}
