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
  Text,
  View,
  tw,
  useIsDesktopDevice,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import sodium from "react-native-libsodium";
import MemberMenu from "../../../components/memberMenu/MemberMenu";
import { VerifyPasswordModal } from "../../../components/verifyPasswordModal/VerifyPasswordModal";
import { CreateWorkspaceInvitation } from "../../../components/workspace/CreateWorkspaceInvitation";
import { useWorkspace } from "../../../context/WorkspaceContext";
import {
  Role as GraphQlRole,
  MeResult,
  Workspace,
  WorkspaceMember,
  runRemoveMembersAndRotateWorkspaceKeyMutation,
  runWorkspaceDevicesQuery,
  useUpdateWorkspaceMembersRolesMutation,
} from "../../../generated/graphql";
import { useAuthenticatedAppContext } from "../../../hooks/useAuthenticatedAppContext";
import { workspaceSettingsLoadWorkspaceMachine } from "../../../machines/workspaceSettingsLoadWorkspaceMachine";
import { WorkspaceStackScreenProps } from "../../../types/navigationProps";
import { WorkspaceDeviceParing } from "../../../types/workspaceDevice";
import { getMainDevice } from "../../../utils/device/mainDeviceMemoryStore";
import { getWorkspace } from "../../../utils/workspace/getWorkspace";

type Member = {
  userId: string;
  username: string;
  role: GraphQlRole;
  mainDeviceSigningPublicKey: string;
};

export default function WorkspaceSettingsMembersScreen(
  props: WorkspaceStackScreenProps<"WorkspaceSettingsMembers">
) {
  const { workspaceId, lastChainEvent, workspaceChainState } = useWorkspace();
  const { activeDevice } = useAuthenticatedAppContext();
  const [state] = useMachine(workspaceSettingsLoadWorkspaceMachine, {
    context: {
      workspaceId,
      navigation: props.navigation,
      activeDevice,
    },
  });

  const [, updateWorkspaceMembersRolesMutation] =
    useUpdateWorkspaceMembersRolesMutation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [memberLookup, setMemberLookup] = useState<{
    [username: string]: number;
  }>({});
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [usernameToRemove, setUsernameToRemove] = useState<string | undefined>(
    undefined
  );
  const [hasGraphqlError, setHasGraphqlError] = useState(false);
  const [graphqlError, setGraphqlError] = useState("");
  const isDesktopDevice = useIsDesktopDevice();

  useEffect(() => {
    if (
      state.value === "loadWorkspaceSuccess" &&
      state.context.workspaceQueryResult?.data?.workspace
    ) {
      updateWorkspaceData(
        state.context.meWithWorkspaceLoadingInfoQueryResult?.data?.me,
        // @ts-expect-error need to fix the generation
        state.context.workspaceQueryResult?.data?.workspace
      );
    }
  }, [state]);

  const updateWorkspaceData = async (
    me: MeResult | null | undefined,
    workspace: Workspace
  ) => {
    const members: WorkspaceMember[] = workspace.members || [];
    setMembers(members);
    const memberLookup = {} as { [username: string]: number };
    members.forEach((member: WorkspaceMember, row: number) => {
      memberLookup[member.userId] = row;
      if (member.userId === me?.id) {
        setIsAdmin(member.role === GraphQlRole.Admin);
      }
    });
    setMemberLookup(memberLookup);
  };

  const _updateWorkspaceMemberData = async (members: WorkspaceMember[]) => {
    // do graphql stuff
    const graphqlMembers: any[] = [];
    members.forEach((member: Member) => {
      graphqlMembers.push({
        userId: member.userId,
        role: member.role,
      });
    });
    const updateWorkspaceResult = await updateWorkspaceMembersRolesMutation({
      input: {
        id: workspaceId,
        members: graphqlMembers,
      },
    });
    if (updateWorkspaceResult.data?.updateWorkspaceMembersRoles?.workspace) {
      updateWorkspaceData(
        state.context.meWithWorkspaceLoadingInfoQueryResult?.data?.me,
        updateWorkspaceResult.data?.updateWorkspaceMembersRoles?.workspace
      );
    } else if (updateWorkspaceResult?.error) {
      setHasGraphqlError(true);
      setGraphqlError(updateWorkspaceResult?.error.message);
    }
  };

  const updateMember = async (
    member: WorkspaceMember,
    role: workspaceChain.Role
  ) => {
    const existingMemberRow = memberLookup[member.userId];
    if (existingMemberRow >= 0) {
      if (role === "ADMIN") {
        members[existingMemberRow].role = GraphQlRole.Admin;
      } else if (role === "EDITOR") {
        members[existingMemberRow].role = GraphQlRole.Editor;
      } else if (role === "VIEWER") {
        members[existingMemberRow].role = GraphQlRole.Viewer;
      } else if (role === "COMMENTER") {
        members[existingMemberRow].role = GraphQlRole.Commenter;
      }
      setMembers(members);
      await _updateWorkspaceMemberData(members);
    }
  };

  const removeMemberPreflight = (username: string) => {
    const mainDevice = getMainDevice();
    if (mainDevice) {
      removeMember(username);
      return;
    }
    setUsernameToRemove(username);
    setIsPasswordModalVisible(true);
  };

  const removeMember = async (username: string) => {
    const mainDevice = getMainDevice();
    if (mainDevice === null) {
      throw new Error("mainDevice is null");
    }

    if (lastChainEvent === null) {
      throw new Error("lastChainEvent is null");
    }

    setUsernameToRemove(username);
    const row = memberLookup[username];
    if (row >= 0) {
      const removingMember = members[row];
      members.splice(row, 1);
      setMembers(members);
      delete memberLookup[username];
      setMemberLookup(memberLookup);
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
      let workspaceDevices =
        workspaceDeviceResult.data?.workspaceDevices?.nodes;
      for (let device of workspaceDevices) {
        if (!device) {
          continue;
        }
        if (device.userId !== removingMember.userId) {
          const { ciphertext, nonce } = encryptWorkspaceKeyForDevice({
            receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
            creatorDeviceEncryptionPrivateKey:
              activeDevice.encryptionPrivateKey!,
            workspaceKey: workspaceKey.workspaceKey,
          });
          deviceWorkspaceKeyBoxes.push({
            ciphertext,
            nonce,
            receiverDeviceSigningPublicKey: device.signingPublicKey,
          });
        }
      }

      const member = members.find((member) => {
        return member.username === username;
      });
      if (member === null || member === undefined) {
        throw new Error("member is not defined");
      }

      const removeMemberEvent = workspaceChain.removeMember(
        workspaceChain.hashTransaction(lastChainEvent.transaction),
        {
          keyType: "ed25519",
          privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
          publicKey: sodium.from_base64(mainDevice.signingPublicKey),
        },
        sodium.to_base64(member.mainDeviceSigningPublicKey)
      );

      await runRemoveMembersAndRotateWorkspaceKeyMutation(
        {
          input: {
            creatorDeviceSigningPublicKey: activeDevice.signingPublicKey,
            deviceWorkspaceKeyBoxes,
            revokedUserId: [removingMember.userId],
            workspaceId,
            serializedWorkspaceChainEvent: JSON.stringify(removeMemberEvent),
          },
        },
        { requestPolicy: "network-only" }
      );
    }
    const workspace = await getWorkspace({
      deviceSigningPublicKey: activeDevice.signingPublicKey,
      workspaceId,
    });
    if (!workspace) {
      console.error("No workspace found");
      return;
    }
    updateWorkspaceData(
      state.context.meWithWorkspaceLoadingInfoQueryResult?.data?.me,
      workspace
    );
  };

  return (
    <>
      <SettingsContentWrapper
        title="Members"
        scrollViewTestID="member-settings--scroll-view"
      >
        {hasGraphqlError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{graphqlError}</Text>
          </View>
        )}
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
            {isAdmin && (
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
                <CreateWorkspaceInvitation workspaceId={workspaceId} />
              </>
            )}
            <Heading lvl={3} style={tw`mt-3`}>
              Members
            </Heading>

            <List
              data={members}
              emptyString={"No members available"}
              header={
                <ListHeader data={["Name", "Email", "Role"]} mainIsIconText />
              }
            >
              {workspaceChainState &&
                Object.entries(workspaceChainState.members).map(
                  ([mainDeviceSigningPublicKey, memberInfo]) => {
                    const member = members.find((member) => {
                      return (
                        member.mainDeviceSigningPublicKey ===
                        mainDeviceSigningPublicKey
                      );
                    });

                    if (!member) {
                      return null;
                    }

                    const adminUserId =
                      state.context.meWithWorkspaceLoadingInfoQueryResult?.data
                        ?.me?.id;
                    // TODO acutally use username when available
                    const username = member.username.slice(
                      0,
                      member.username.indexOf("@")
                    );
                    // TODO actually use initials when we have a username
                    const initials = username.substring(0, 1);
                    const email = member.username;

                    const allowEditing =
                      isAdmin && member.userId !== adminUserId;

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
                                updateMember(member, role);
                              }}
                              onDeletePressed={() => {
                                removeMemberPreflight(member.userId);
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
          if (usernameToRemove) {
            removeMember(usernameToRemove);
          }
        }}
        onCancel={() => {
          setUsernameToRemove(undefined);
          setIsPasswordModalVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  formError: {
    color: "red",
  },
  errorBanner: {
    backgroundColor: "red",
  },
  errorText: {
    color: "white",
  },
});
