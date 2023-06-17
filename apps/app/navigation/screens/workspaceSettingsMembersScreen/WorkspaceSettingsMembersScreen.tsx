import * as workspaceChain from "@serenity-kit/workspace-chain";
import {
  encryptWorkspaceKeyForDevice,
  generateId,
} from "@serenity-tools/common";
import {
  Avatar,
  CenterContent,
  Description,
  Heading,
  InfoMessage,
  List,
  ListHeader,
  ListIconText,
  ListItem,
  ListText,
  SettingsContentWrapper,
  Spinner,
  View,
  tw,
  useIsDesktopDevice,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useState } from "react";
import sodium from "react-native-libsodium";
import MemberMenu from "../../../components/memberMenu/MemberMenu";
import { VerifyPasswordModal } from "../../../components/verifyPasswordModal/VerifyPasswordModal";
import { CreateWorkspaceInvitation } from "../../../components/workspace/CreateWorkspaceInvitation";
import { useWorkspace } from "../../../context/WorkspaceContext";
import {
  runRemoveMemberAndRotateWorkspaceKeyMutation,
  runWorkspaceDevicesQuery,
  useUpdateWorkspaceMemberRoleMutation,
} from "../../../generated/graphql";
import { useAuthenticatedAppContext } from "../../../hooks/useAuthenticatedAppContext";
import { workspaceSettingsLoadWorkspaceMachine } from "../../../machines/workspaceSettingsLoadWorkspaceMachine";
import { WorkspaceStackScreenProps } from "../../../types/navigationProps";
import { WorkspaceDeviceParing } from "../../../types/workspaceDevice";
import { getMainDevice } from "../../../utils/device/mainDeviceMemoryStore";
import { showToast } from "../../../utils/toast/showToast";

type UpdateMemberRoleInfo = {
  mainDeviceSigningPublicKey: string;
  role: workspaceChain.Role;
};

type RemoveMemberInfo = {
  mainDeviceSigningPublicKey: string;
  userId: string;
};

export default function WorkspaceSettingsMembersScreen(
  props: WorkspaceStackScreenProps<"WorkspaceSettingsMembers">
) {
  const isDesktopDevice = useIsDesktopDevice();

  const {
    workspaceId,
    lastChainEvent,
    workspaceChainState,
    fetchAndApplyNewWorkspaceChainEntries,
  } = useWorkspace();
  const { activeDevice } = useAuthenticatedAppContext();
  const [state] = useMachine(workspaceSettingsLoadWorkspaceMachine, {
    context: {
      workspaceId,
      navigation: props.navigation,
      activeDevice,
    },
  });

  const [, updateWorkspaceMemberRoleMutation] =
    useUpdateWorkspaceMemberRoleMutation();
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<
    RemoveMemberInfo | undefined
  >(undefined);

  const [
    isPasswordModalVisibleForMemberRoleUpdate,
    setIsPasswordModalVisibleForMemberRoleUpdate,
  ] = useState(false);
  const [memberRoleInfoToUpdate, setMemberRoleInfoToUpdate] = useState<
    UpdateMemberRoleInfo | undefined
  >(undefined);

  const updateMemberRole = async ({
    mainDeviceSigningPublicKey,
    role,
  }: UpdateMemberRoleInfo) => {
    const mainDevice = getMainDevice();
    if (mainDevice === null) {
      throw new Error("mainDevice is null");
    }

    if (lastChainEvent === null) {
      throw new Error("lastChainEvent is null");
    }

    const updateMemberEvent = workspaceChain.updateMember(
      workspaceChain.hashTransaction(lastChainEvent.transaction),
      {
        keyType: "ed25519",
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
      },
      mainDeviceSigningPublicKey,
      role
    );

    const updateWorkspaceResult = await updateWorkspaceMemberRoleMutation({
      input: {
        serializedWorkspaceChainEvent: JSON.stringify(updateMemberEvent),
        workspaceId: workspaceId,
      },
    });
    if (updateWorkspaceResult.error) {
      showToast("Failed to update the member role.", "error");
    }
    await fetchAndApplyNewWorkspaceChainEntries();
    setMemberRoleInfoToUpdate(undefined);
  };

  const updateMemberRolePreflight = (
    updateMemberRoleInfo: UpdateMemberRoleInfo
  ) => {
    const mainDevice = getMainDevice();
    if (mainDevice) {
      updateMemberRole(updateMemberRoleInfo);
      return;
    }
    setMemberRoleInfoToUpdate(updateMemberRoleInfo);
    setIsPasswordModalVisibleForMemberRoleUpdate(true);
  };

  const removeMember = async ({
    mainDeviceSigningPublicKey,
    userId,
  }: RemoveMemberInfo) => {
    const mainDevice = getMainDevice();
    if (mainDevice === null) {
      throw new Error("mainDevice is null");
    }

    if (lastChainEvent === null) {
      throw new Error("lastChainEvent is null");
    }

    const workspaceKeyString = sodium.to_base64(sodium.crypto_kdf_keygen());
    const workspaceKey = {
      id: generateId(),
      workspaceKey: workspaceKeyString,
    };

    const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [];
    let workspaceDeviceResult = await runWorkspaceDevicesQuery(
      { workspaceId },
      { requestPolicy: "network-only" }
    );
    if (
      !workspaceDeviceResult.data?.workspaceDevices?.nodes ||
      workspaceDeviceResult.data?.workspaceDevices?.nodes.length === 0
    ) {
      throw new Error("No devices found for workspace");
    }
    let workspaceDevices = workspaceDeviceResult.data?.workspaceDevices?.nodes;

    for (let device of workspaceDevices) {
      if (!device) {
        continue;
      }
      if (device.userId !== userId) {
        const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
          receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
          creatorDeviceEncryptionPrivateKey: activeDevice.encryptionPrivateKey!,
          workspaceKey: workspaceKey.workspaceKey,
        });
        deviceWorkspaceKeyBoxes.push({
          ciphertext,
          nonce,
          receiverDeviceSigningPublicKey: device.signingPublicKey,
        });
      }
    }

    const removeMemberEvent = workspaceChain.removeMember(
      workspaceChain.hashTransaction(lastChainEvent.transaction),
      {
        keyType: "ed25519",
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
      },
      mainDeviceSigningPublicKey
    );

    const removeMemberResult =
      await runRemoveMemberAndRotateWorkspaceKeyMutation(
        {
          input: {
            creatorDeviceSigningPublicKey: activeDevice.signingPublicKey,
            deviceWorkspaceKeyBoxes,
            revokedUserId: userId,
            workspaceId,
            serializedWorkspaceChainEvent: JSON.stringify(removeMemberEvent),
          },
        },
        { requestPolicy: "network-only" }
      );
    if (removeMemberResult.error) {
      showToast("Failed to remove the member.", "error");
    }
    await fetchAndApplyNewWorkspaceChainEntries();
    setMemberToRemove(undefined);
  };

  const removeMemberPreflight = (memberToRemove: RemoveMemberInfo) => {
    const mainDevice = getMainDevice();
    if (mainDevice) {
      removeMember(memberToRemove);
      return;
    }
    setMemberToRemove(memberToRemove);
    setIsPasswordModalVisible(true);
  };

  let currentUserIsAdmin = false;
  if (state.value === "loadWorkspaceSuccess" && workspaceChainState) {
    Object.entries(workspaceChainState.members).forEach(
      ([mainDeviceSigningPublicKey, memberInfo]) => {
        if (
          memberInfo.role === "ADMIN" &&
          mainDeviceSigningPublicKey ===
            state.context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.mainDeviceSigningPublicKey
        ) {
          currentUserIsAdmin = true;
        }
      }
    );
  }

  return (
    <>
      <SettingsContentWrapper
        title="Members"
        scrollViewTestID="member-settings--scroll-view"
      >
        {state.value !== "loadWorkspaceSuccess" ? (
          <CenterContent>
            {state.value === "loadWorkspaceFailed" ? (
              <InfoMessage variant="error">
                Failed to load workspace data. Please try again or contact
                support.
              </InfoMessage>
            ) : (
              <Spinner fadeIn />
            )}
          </CenterContent>
        ) : (
          <>
            {currentUserIsAdmin && (
              <>
                <View>
                  <Heading lvl={3} padded>
                    Invitations
                  </Heading>
                  <Description variant="form">
                    Send invitation links to new workspace members. Only Admins
                    can see and invite new members.{"\n"}New members must accept
                    your invitation within 2 days.
                  </Description>
                </View>
                <CreateWorkspaceInvitation />
              </>
            )}
            <Heading lvl={3} style={tw`mt-3`}>
              Members
            </Heading>

            <List
              data={
                workspaceChainState
                  ? Object.entries(workspaceChainState.members)
                  : []
              }
              emptyString={"No members available"}
              header={
                <ListHeader data={["Name", "Email", "Role"]} mainIsIconText />
              }
            >
              {workspaceChainState &&
                Object.entries(workspaceChainState.members).map(
                  ([mainDeviceSigningPublicKey, memberInfo]) => {
                    const member =
                      state.context.workspaceQueryResult?.data?.workspace?.members?.find(
                        (member) => {
                          return (
                            member.mainDeviceSigningPublicKey ===
                            mainDeviceSigningPublicKey
                          );
                        }
                      );

                    // TODO show a loading indicator here instead
                    if (!member) {
                      return null;
                    }

                    const adminUserId =
                      state.context.meWithWorkspaceLoadingInfoQueryResult?.data
                        ?.me?.id;
                    // TODO use the username when available
                    const username = member.username.slice(
                      0,
                      member.username.indexOf("@")
                    );
                    // TODO use initials when we have a username
                    const initials = username.substring(0, 1);
                    const email = member.username;

                    const allowEditing =
                      currentUserIsAdmin && member.userId !== adminUserId;

                    // capitalize by css doesn't work here as it will only affect the first letter
                    const roleName =
                      memberInfo.role.charAt(0).toUpperCase() +
                      memberInfo.role.slice(1).toLowerCase();

                    return (
                      <ListItem
                        testID={`workspace-member-row__${adminUserId}`}
                        key={member.userId}
                        mainItem={
                          <ListIconText
                            main={
                              username +
                              (member.userId === adminUserId ? " (you)" : "")
                            }
                            secondary={email}
                            avatar={
                              <Avatar size={isDesktopDevice ? "xs" : "sm"}>
                                {initials}
                              </Avatar>
                            }
                          />
                        }
                        secondaryItem={
                          <ListText secondary>{roleName}</ListText>
                        }
                        actionItem={
                          allowEditing ? (
                            <MemberMenu
                              memberId={member.userId}
                              role={memberInfo.role}
                              onUpdateRole={(role) => {
                                updateMemberRolePreflight({
                                  mainDeviceSigningPublicKey,
                                  role,
                                });
                              }}
                              onDeletePressed={() => {
                                removeMemberPreflight({
                                  mainDeviceSigningPublicKey,
                                  userId: member.userId,
                                });
                              }}
                            />
                          ) : null
                        }
                      />
                    );
                  }
                )}
            </List>
          </>
        )}
      </SettingsContentWrapper>

      <VerifyPasswordModal
        isVisible={isPasswordModalVisible}
        description="Creating a new workspace requires access to the main account and therefore verifying your password is required"
        onSuccess={() => {
          setIsPasswordModalVisible(false);
          if (memberToRemove) {
            removeMember(memberToRemove);
          }
        }}
        onCancel={() => {
          setMemberToRemove(undefined);
          setIsPasswordModalVisible(false);
        }}
      />

      <VerifyPasswordModal
        isVisible={isPasswordModalVisibleForMemberRoleUpdate}
        description="Updating a member role requires access to the main account and therefore verifying your password is required"
        onSuccess={() => {
          setIsPasswordModalVisibleForMemberRoleUpdate(false);
          if (memberRoleInfoToUpdate) {
            updateMemberRole(memberRoleInfoToUpdate);
          }
        }}
        onCancel={() => {
          setMemberRoleInfoToUpdate(undefined);
          setIsPasswordModalVisibleForMemberRoleUpdate(false);
        }}
      />
    </>
  );
}
