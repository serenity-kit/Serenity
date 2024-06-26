import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
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
import { useCallback, useEffect, useState } from "react";
import sodium from "react-native-libsodium";
import MemberMenu from "../../../components/memberMenu/MemberMenu";
import { VerifyPasswordModal } from "../../../components/verifyPasswordModal/VerifyPasswordModal";
import { CreateWorkspaceInvitation } from "../../../components/workspace/CreateWorkspaceInvitation";
import { useWorkspace } from "../../../context/WorkspaceContext";
import {
  runRemoveMemberAndRotateWorkspaceKeyMutation,
  useUpdateWorkspaceMemberRoleMutation,
} from "../../../generated/graphql";
import { useAuthenticatedAppContext } from "../../../hooks/useAuthenticatedAppContext";
import { workspaceSettingsLoadWorkspaceMachine } from "../../../machines/workspaceSettingsLoadWorkspaceMachine";
import { getCurrentUserInfo } from "../../../store/currentUserInfoStore";
import { getMainDevice } from "../../../store/mainDeviceMemoryStore";
import { loadRemoteUserChainsForWorkspace } from "../../../store/userChainStore";
import { getLocalUserByDeviceSigningPublicKey } from "../../../store/userStore";
import {
  loadRemoteWorkspaceChain,
  useCanEditWorkspace,
  useLocalLastWorkspaceChainEvent,
} from "../../../store/workspaceChainStore";
import { loadRemoteWorkspaceMemberDevicesProofQuery } from "../../../store/workspaceMemberDevicesProofStore";
import { WorkspaceStackScreenProps } from "../../../types/navigationProps";
import { showToast } from "../../../utils/toast/showToast";
import { rotateWorkspaceKey } from "../../../utils/workspace/rotateWorkspaceKey";

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
  const [, updateState] = useState<any>();
  const forceRender = useCallback(() => updateState({}), []);

  const isDesktopDevice = useIsDesktopDevice();
  const { workspaceId } = useWorkspace();
  const lastWorkspaceChainEvent = useLocalLastWorkspaceChainEvent({
    workspaceId,
  });
  const { activeDevice } = useAuthenticatedAppContext();
  const [state] = useMachine(workspaceSettingsLoadWorkspaceMachine, {
    input: {
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
    if (!lastWorkspaceChainEvent) {
      throw new Error("Missing workspace chain data");
    }
    const updateMemberEvent = workspaceChain.updateMember(
      workspaceChain.hashTransaction(lastWorkspaceChainEvent.event.transaction),
      {
        keyType: "ed25519",
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
      },
      mainDeviceSigningPublicKey,
      role
    );

    const lastWorkspaceMemberDevicesProof =
      await loadRemoteWorkspaceMemberDevicesProofQuery({ workspaceId });

    const workspaceMemberDevicesProof =
      workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
        authorKeyPair: {
          privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
          publicKey: sodium.from_base64(mainDevice.signingPublicKey),
          keyType: "ed25519",
        },
        workspaceMemberDevicesProofData: {
          ...lastWorkspaceMemberDevicesProof.data,
          clock: lastWorkspaceMemberDevicesProof.clock + 1,
          workspaceChainHash: workspaceChain.hashTransaction(
            updateMemberEvent.transaction
          ),
        },
      });

    const updateWorkspaceResult = await updateWorkspaceMemberRoleMutation({
      input: {
        serializedWorkspaceChainEvent: JSON.stringify(updateMemberEvent),
        serializedWorkspaceMemberDevicesProof: JSON.stringify(
          workspaceMemberDevicesProof
        ),
        workspaceId: workspaceId,
      },
    });
    if (updateWorkspaceResult.error) {
      showToast("Failed to update the member role.", "error");
    }
    await loadRemoteWorkspaceChain({ workspaceId });
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
    if (!lastWorkspaceChainEvent) {
      throw new Error("Missing workspace chain data");
    }

    const { deviceWorkspaceKeyBoxes, workspaceKey } = await rotateWorkspaceKey({
      workspaceId,
      activeDevice,
      userToRemoveId: userId,
    });

    const removeMemberEvent = workspaceChain.removeMember(
      workspaceChain.hashTransaction(lastWorkspaceChainEvent.event.transaction),
      {
        keyType: "ed25519",
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
      },
      mainDeviceSigningPublicKey
    );

    const lastWorkspaceMemberDevicesProof =
      await loadRemoteWorkspaceMemberDevicesProofQuery({ workspaceId });

    const newUserChainHashes = {
      ...lastWorkspaceMemberDevicesProof.data.userChainHashes,
    };
    delete newUserChainHashes[userId];
    const workspaceMemberDevicesProof =
      workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
        authorKeyPair: {
          privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
          publicKey: sodium.from_base64(mainDevice.signingPublicKey),
          keyType: "ed25519",
        },
        workspaceMemberDevicesProofData: {
          ...lastWorkspaceMemberDevicesProof.data,
          userChainHashes: newUserChainHashes,
          clock: lastWorkspaceMemberDevicesProof.clock + 1,
          workspaceChainHash: workspaceChain.hashTransaction(
            removeMemberEvent.transaction
          ),
        },
      });

    const removeMemberResult =
      await runRemoveMemberAndRotateWorkspaceKeyMutation(
        {
          input: {
            creatorDeviceSigningPublicKey: activeDevice.signingPublicKey,
            deviceWorkspaceKeyBoxes,
            workspaceId,
            workspaceKeyId: workspaceKey.id,
            serializedWorkspaceChainEvent: JSON.stringify(removeMemberEvent),
            serializedWorkspaceMemberDevicesProof: JSON.stringify(
              workspaceMemberDevicesProof
            ),
          },
        },
        { requestPolicy: "network-only" }
      );
    if (removeMemberResult.error) {
      showToast("Failed to remove the member.", "error");
    }
    await loadRemoteWorkspaceChain({ workspaceId });
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

  useEffect(() => {
    // TODO better to build a hook for this
    const fetchMembers = async () => {
      await loadRemoteUserChainsForWorkspace({ workspaceId });
      forceRender();
    };
    fetchMembers();
  }, []);

  const currentUserInfo = getCurrentUserInfo();
  if (!currentUserInfo) throw new Error("No current user");
  const canEditWorkspace = useCanEditWorkspace({
    workspaceId,
    mainDeviceSigningPublicKey: currentUserInfo.mainDeviceSigningPublicKey,
  });

  const activeWorkspaceMembers = lastWorkspaceChainEvent?.state.members
    ? Object.entries(lastWorkspaceChainEvent.state.members).map(
        ([mainDeviceSigningPublicKey, member]) => {
          const user = getLocalUserByDeviceSigningPublicKey({
            signingPublicKey: mainDeviceSigningPublicKey,
          });
          if (user) {
            return { ...user, role: member.role, addedBy: member.addedBy };
          } else {
            return {
              mainDeviceSigningPublicKey,
              role: member.role,
              addedBy: member.addedBy,
              username: undefined,
              id: undefined,
            };
          }
        }
      )
    : null;

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
            {canEditWorkspace && (
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
              data={activeWorkspaceMembers ? activeWorkspaceMembers : []}
              emptyString={"No members available"}
              header={
                <ListHeader data={["Name", "Email", "Role"]} mainIsIconText />
              }
            >
              {activeWorkspaceMembers &&
                activeWorkspaceMembers.map((member) => {
                  // TODO show a loading indicator here instead
                  if (!member) {
                    return null;
                  }

                  const adminUserId =
                    state.context.meWithWorkspaceLoadingInfoQueryResult?.data
                      ?.me?.id;
                  // TODO use the username when available
                  const displayName = member.username
                    ? member.username.slice(0, member.username.indexOf("@"))
                    : "Unknown";
                  // TODO use initials when we have a username
                  const initials = displayName.substring(0, 1);
                  const username = member.username;

                  const allowEditing =
                    canEditWorkspace && member.id !== adminUserId;

                  // capitalize by css doesn't work here as it will only affect the first letter
                  const roleName =
                    member.role.charAt(0).toUpperCase() +
                    member.role.slice(1).toLowerCase();

                  return (
                    <ListItem
                      testID={`workspace-member-row__${adminUserId}`}
                      key={member.mainDeviceSigningPublicKey}
                      mainItem={
                        <ListIconText
                          main={
                            displayName +
                            (member.id === adminUserId ? " (you)" : "")
                          }
                          secondary={username}
                          avatar={
                            <Avatar size={isDesktopDevice ? "xs" : "sm"}>
                              {initials}
                            </Avatar>
                          }
                        />
                      }
                      secondaryItem={<ListText secondary>{roleName}</ListText>}
                      actionItem={
                        allowEditing ? (
                          <MemberMenu
                            memberId={member.id || "unknown"}
                            role={member.role}
                            onUpdateRole={(role) => {
                              updateMemberRolePreflight({
                                mainDeviceSigningPublicKey:
                                  member.mainDeviceSigningPublicKey,
                                role,
                              });
                            }}
                            onDeletePressed={() => {
                              removeMemberPreflight({
                                mainDeviceSigningPublicKey:
                                  member.mainDeviceSigningPublicKey,
                                userId: member.id || "unknown",
                              });
                            }}
                          />
                        ) : null
                      }
                    />
                  );
                })}
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
