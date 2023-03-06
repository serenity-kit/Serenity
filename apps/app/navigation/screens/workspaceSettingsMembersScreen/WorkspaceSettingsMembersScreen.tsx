import { encryptWorkspaceKeyForDevice } from "@serenity-tools/common";
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
  tw,
  useIsDesktopDevice,
  View,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import MemberMenu from "../../../components/memberMenu/MemberMenu";
import { VerifyPasswordModal } from "../../../components/verifyPasswordModal/VerifyPasswordModal";
import { CreateWorkspaceInvitation } from "../../../components/workspace/CreateWorkspaceInvitation";
import { useWorkspace } from "../../../context/WorkspaceContext";
import {
  MeResult,
  Role,
  runRemoveMembersAndRotateWorkspaceKeyMutation,
  runWorkspaceDevicesQuery,
  useUpdateWorkspaceMembersRolesMutation,
  Workspace,
  WorkspaceMember,
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
  role: Role;
};

export default function WorkspaceSettingsMembersScreen(
  props: WorkspaceStackScreenProps<"WorkspaceSettingsMembers">
) {
  const { workspaceId } = useWorkspace();
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
        setIsAdmin(member.role === Role.Admin);
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

  const updateMember = async (member: WorkspaceMember, role: Role) => {
    const existingMemberRow = memberLookup[member.userId];
    if (existingMemberRow >= 0) {
      members[existingMemberRow].role = role;
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
        id: uuidv4(),
        workspaceKey: workspaceKeyString,
      };

      const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [];
      let workspaceDeviceResult = await runWorkspaceDevicesQuery(
        {
          workspaceId,
        },
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

      await runRemoveMembersAndRotateWorkspaceKeyMutation(
        {
          input: {
            creatorDeviceSigningPublicKey: activeDevice.signingPublicKey,
            deviceWorkspaceKeyBoxes,
            revokedUserIds: [removingMember.userId],
            workspaceId,
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
                    your invitation within 3 days.
                  </Description>
                </View>
                <CreateWorkspaceInvitation
                  workspaceId={workspaceId}
                  onWorkspaceInvitationCreated={(workspaceInvitation: any) => {
                    // do nothing
                  }}
                />
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
              {members.map((member: any) => {
                const adminUserId =
                  state.context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
                    ?.id;
                // TODO acutally use username when available
                const username = member.username.slice(
                  0,
                  member.username.indexOf("@")
                );
                // TODO actually use initials when we have a username
                const initials = username.substring(0, 1);
                const email = member.username;

                const allowEditing = isAdmin && member.userId !== adminUserId;

                // capitalize by css doesn't work here as it will only affect the first letter
                const roleName =
                  member.role.charAt(0).toUpperCase() +
                  member.role.slice(1).toLowerCase();

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
                    secondaryItem={<ListText secondary>{roleName}</ListText>}
                    actionItem={
                      allowEditing ? (
                        <MemberMenu
                          memberId={member.userId}
                          role={member.role}
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
