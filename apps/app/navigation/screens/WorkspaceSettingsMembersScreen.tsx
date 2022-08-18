import { Button, Checkbox, Text, tw, View } from "@serenity-tools/ui";
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useClient } from "urql";
import { CreateWorkspaceInvitation } from "../../components/workspace/CreateWorkspaceInvitation";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";
import {
  MeDocument, MeQuery,
  MeQueryVariables, MeResult, useUpdateWorkspaceMutation, Workspace, WorkspaceMember
} from "../../generated/graphql";
import { WorkspaceDrawerScreenProps } from "../../types/navigation";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { attachDeviceToWorkspaces } from "../../utils/workspace/attachDeviceToWorkspaces";
import { getWorkspace } from "../../utils/workspace/getWorkspace";

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
    <View style={styles.memberListItem}>
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
        >
          <Text>Admin</Text>
        </Checkbox>
        {allowEditing && <Button onPress={onDeletePress}>Remove</Button>}
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
  props: WorkspaceDrawerScreenProps<"Settings">
) {
  const urqlClient = useClient();
  const workspaceId = useWorkspaceId();
  const [, updateWorkspaceMutation] = useUpdateWorkspaceMutation();
  const [me, setMe] = useState<MeResult | null>();
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [memberLookup, setMemberLookup] = useState<{
    [username: string]: number;
  }>({});
  const [isLoadingWorkspaceData, setIsLoadingWorkspaceData] =
    useState<boolean>(false);
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  const getMe = async () => {
    const meResult = await urqlClient
      .query<MeQuery, MeQueryVariables>(MeDocument, undefined, {
        requestPolicy: "network-only",
      })
      .toPromise();
    if (meResult.error) {
      throw new Error(meResult.error.message);
    }
    setMe(meResult.data?.me);
    return meResult.data?.me;
  };

  useEffect(() => {
    (async () => {
      const me = await getMe();
      const device = await getActiveDevice();
      if (!device) {
        // TODO: handle this error
        console.error("No active device found");
        return;
      }
      try {
        await attachDeviceToWorkspaces({ workspaceId, urqlClient });
      } catch (error) {
        // TOOD: handle error
        console.error(error);
        return;
      }
      const workspace = await getWorkspace({
        urqlClient,
        deviceSigningPublicKey: device.signingPublicKey,
      });
      if (workspace) {
        setWorkspace(workspace);
        updateWorkspaceData(me, workspace);
      } else {
        props.navigation.replace("WorkspaceNotFound");
        return;
      }
    })();
  }, [urqlClient, props.navigation]);

  const updateWorkspaceData = async (
    me: MeResult | null | undefined,
    workspace: Workspace
  ) => {
    setIsLoadingWorkspaceData(true);
    const workspaceName = workspace.name || "";
    setWorkspaceName(workspaceName);
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
    setIsLoadingWorkspaceData(false);
  };

  const _updateWorkspaceMemberData = async (members: WorkspaceMember[]) => {
    setIsLoadingWorkspaceData(true);
    // do graphql stuff
    const graphqlMembers: any[] = [];
    members.forEach((member: Member) => {
      graphqlMembers.push({
        userId: member.userId,
        isAdmin: member.isAdmin,
      });
    });
    const updateWorkspaceResult = await updateWorkspaceMutation({
      input: {
        id: workspaceId,
        members: graphqlMembers,
      },
    });
    if (updateWorkspaceResult.data?.updateWorkspace?.workspace) {
      updateWorkspaceData(
        me,
        updateWorkspaceResult.data?.updateWorkspace?.workspace
      );
    } else if (updateWorkspaceResult?.error) {
      setHasGraphqlError(true);
      setGraphqlError(updateWorkspaceResult?.error.message);
    }
    setIsLoadingWorkspaceData(false);
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

  const removeMember = async (username: string) => {
    const row = memberLookup[username];
    if (row >= 0) {
      members.splice(row, 1);
      setMembers(members);
      delete memberLookup[username];
      setMemberLookup(memberLookup);
    }
    await _updateWorkspaceMemberData(members);
  };

  return (
    <>
      {hasGraphqlError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{graphqlError}</Text>
        </View>
      )}
      <View style={tw`mt-20 px-4`}>
        {workspace === null ? (
          <Text>Loading...</Text>
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
                  adminUserId={me?.id}
                  allowEditing={isAdmin && member.userId !== me?.id}
                  onAdminStatusChange={(isMemberAdmin: boolean) => {
                    updateMember(member, isMemberAdmin);
                  }}
                  onDeletePress={() => {
                    removeMember(member.userId);
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
