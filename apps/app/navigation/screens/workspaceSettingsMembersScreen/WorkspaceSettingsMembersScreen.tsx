import {
  Button,
  CenterContent,
  Checkbox,
  InfoMessage,
  Spinner,
  Text,
  tw,
  View,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { VerifyPasswordModal } from "../../../components/verifyPasswordModal/VerifyPasswordModal";
import { CreateWorkspaceInvitation } from "../../../components/workspace/CreateWorkspaceInvitation";
import { useWorkspaceId } from "../../../context/WorkspaceIdContext";
import {
  MeResult,
  RemoveMembersAndRotateWorkspaceKeyDocument,
  RemoveMembersAndRotateWorkspaceKeyMutation,
  RemoveMembersAndRotateWorkspaceKeyMutationVariables,
  useUpdateWorkspaceMembersRolesMutation,
  Workspace,
  WorkspaceMember,
} from "../../../generated/graphql";
import { useInterval } from "../../../hooks/useInterval";
import { useWorkspaceContext } from "../../../hooks/useWorkspaceContext";
import { workspaceSettingsLoadWorkspaceMachine } from "../../../machines/workspaceSettingsLoadWorkspaceMachine";
import { WorkspaceDrawerScreenProps } from "../../../types/navigation";
import { WorkspaceDeviceParing } from "../../../types/workspaceDevice";
import { createAndEncryptWorkspaceKeyForDevice } from "../../../utils/device/createAndEncryptWorkspaceKeyForDevice";
import { getMainDevice } from "../../../utils/device/mainDeviceMemoryStore";
import { getUrqlClient } from "../../../utils/urqlClient/urqlClient";
import {
  addNewMembersIfNecessary,
  secondsBetweenNewMemberChecks,
} from "../../../utils/workspace/addNewMembersIfNecessary";
import { deriveCurrentWorkspaceKey } from "../../../utils/workspace/deriveCurrentWorkspaceKey";
import { getWorkspace } from "../../../utils/workspace/getWorkspace";
import { getWorkspaceDevices } from "../../../utils/workspace/getWorkspaceDevices";

type Member = {
  userId: string;
  username: string;
  isAdmin: boolean;
};

function WorkspaceMemberRow({
  userId,
  username,
  isAdmin,
  allowEditing,
  adminUserId,
  onAdminStatusChange,
  onDeletePress,
}) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <View
      style={styles.memberListItem}
      testID={`workspace-member-row__${adminUserId}`}
    >
      <Text style={styles.memberListItemLabel}>
        {username}
        {userId === adminUserId && (
          <Text style={workspaceMemberStyles.adminLabel}>(You)</Text>
        )}
      </Text>
      <View style={workspaceMemberStyles.checkboxContainer}>
        <Checkbox
          defaultIsChecked={isAdmin}
          isDisabled={!allowEditing}
          onChange={onAdminStatusChange}
          value={username}
          testID={`workspace-member-row__${userId}--isAdmin`}
        >
          <Text>Admin</Text>
        </Checkbox>
        {allowEditing && (
          <Button
            onPress={onDeletePress}
            testID={`workspace-member-row__${userId}--remove`}
          >
            Remove
          </Button>
        )}
      </View>
    </View>
  );
}

const workspaceMemberStyles = StyleSheet.create({
  memberListItem: {
    flexGrow: 1,
  },
  memberListItemLabel: {
    flexGrow: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminLabel: {
    fontStyle: "italic",
  },
});

export default function WorkspaceSettingsMembersScreen(
  props: WorkspaceDrawerScreenProps<"Settings"> & { children?: React.ReactNode }
) {
  let workspaceId = useWorkspaceId();
  if (workspaceId === "") {
    const params = props.route.params! as { workspaceId: string };
    workspaceId = params.workspaceId;
  }
  const { activeDevice } = useWorkspaceContext();
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

  useInterval(() => {
    if (activeDevice) {
      addNewMembersIfNecessary({ activeDevice });
    }
  }, secondsBetweenNewMemberChecks * 1000);

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
        setIsAdmin(member.isAdmin);
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
        isAdmin: member.isAdmin,
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
    isMemberAdmin: boolean
  ) => {
    const existingMemberRow = memberLookup[member.userId];
    if (existingMemberRow >= 0) {
      members[existingMemberRow].isAdmin = isMemberAdmin;
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
      const workspaceKey = await deriveCurrentWorkspaceKey({
        workspaceId,
        activeDevice,
      });

      const deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[] = [];
      // TODO: getWorkspaceDevices gets all devices attached to a workspace
      let workspaceDevices = await getWorkspaceDevices({
        workspaceId,
      });
      if (!workspaceDevices || workspaceDevices.length === 0) {
        throw new Error("No devices found for workspace");
      }
      for (let device of workspaceDevices) {
        if (!device) {
          continue;
        }
        if (device.userId !== removingMember.userId) {
          const { ciphertext, nonce } =
            await createAndEncryptWorkspaceKeyForDevice({
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

      await getUrqlClient()
        .mutation<
          RemoveMembersAndRotateWorkspaceKeyMutation,
          RemoveMembersAndRotateWorkspaceKeyMutationVariables
        >(
          RemoveMembersAndRotateWorkspaceKeyDocument,
          {
            input: {
              revokedUserIds: [removingMember.userId],
              workspaceId,
              creatorDeviceSigningPublicKey: activeDevice.signingPublicKey,
              deviceWorkspaceKeyBoxes,
            },
          },
          { requestPolicy: "network-only" }
        )
        .toPromise();
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
      {hasGraphqlError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{graphqlError}</Text>
        </View>
      )}
      <View style={tw`mt-20 px-4`}>
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
            <View>
              <Text style={tw`mt-6 mb-4 font-700 text-xl text-center`}>
                Invitations
              </Text>
              {isAdmin && (
                <View>
                  <CreateWorkspaceInvitation
                    workspaceId={workspaceId}
                    onWorkspaceInvitationCreated={(
                      workspaceInvitation: any
                    ) => {
                      // do nothing
                    }}
                  />
                  <Text style={tw`mt-6 mb-4 font-700 text-xl text-center`}>
                    Members
                  </Text>
                </View>
              )}
              {members.map((member: any) => (
                <WorkspaceMemberRow
                  key={member.userId}
                  userId={member.userId}
                  username={member.username}
                  isAdmin={member.isAdmin}
                  adminUserId={
                    state.context.meWithWorkspaceLoadingInfoQueryResult?.data
                      ?.me?.id
                  }
                  allowEditing={
                    isAdmin &&
                    member.userId !==
                      state.context.meWithWorkspaceLoadingInfoQueryResult?.data
                        ?.me?.id
                  }
                  onAdminStatusChange={(isMemberAdmin: boolean) => {
                    updateMember(member, isMemberAdmin);
                  }}
                  onDeletePress={() => {
                    removeMemberPreflight(member.userId);
                  }}
                />
              ))}
              {isAdmin ? (
                <>
                  <Text style={styles.memberListItemLabel}>
                    You are an admin of this workspace
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.memberListItemLabel}>
                    You are not an admin of this workspace
                  </Text>
                </>
              )}
            </View>
          </>
        )}
      </View>
      <VerifyPasswordModal
        isVisible={isPasswordModalVisible}
        description="Creating a new workspace requires access to the main account and therefore verifying your password is required"
        onSuccess={() => {
          setIsPasswordModalVisible(false);
          if (usernameToRemove) {
            removeMember(usernameToRemove);
          }
        }}
        onBackdropPress={() => {
          setUsernameToRemove(undefined);
          setIsPasswordModalVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  memberListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberListItemLabel: {
    flexGrow: 1,
  },
  addMemberContainer: {
    flexDirection: "row",
  },
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
