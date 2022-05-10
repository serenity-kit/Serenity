import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { Text, View, Button, Input, Checkbox, tw } from "@serenity-tools/ui";
import { RootStackScreenProps, WorkspaceDrawerScreenProps } from "../../types";
import { useDeleteWorkspacesMutation } from "../../generated/graphql";
import {
  useWorkspaceQuery,
  useUpdateWorkspaceMutation,
} from "../../generated/graphql";

type Member = {
  username: string;
  isAdmin: boolean;
};

function WorkspaceMember({
  username,
  isAdmin,
  allowEditing,
  adminUsername,
  onAdminStatusChange,
  onDeletePress,
}) {
  return (
    <View style={styles.memberListItem}>
      <Text style={styles.memberListItemLabel}>
        {username}
        {username === adminUsername && (
          <Text style={workspaceMemberStyles.adminLabel}>(You)</Text>
        )}
      </Text>
      <View style={workspaceMemberStyles.checkboxContainer}>
        <Checkbox
          defaultIsChecked={isAdmin}
          isDisabled={!allowEditing}
          onChange={onAdminStatusChange}
          value={username}
        />
        <Text>Admin</Text>
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

export default function WorkspaceSettingsScreen(
  props: WorkspaceDrawerScreenProps<"Settings">
) {
  const workspaceId = props.route.path?.split("/")[2] || ""; // should never be undefined
  const [workspaceResult, refetchWorkspaceResult] = useWorkspaceQuery({
    variables: {
      id: workspaceId,
    },
  });
  const [, deleteWorkspacesMutation] = useDeleteWorkspacesMutation();
  const [, updateWorkspaceMutation] = useUpdateWorkspaceMutation();
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [newMemberName, _setNewMemberName] = useState<string>("");
  const [isNewMemberAdmin, setIsNewMemberAdmin] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberLookup, setMemberLookup] = useState<{
    [username: string]: number;
  }>({});
  const [isInvalidUsernameError, setIsInvalidUsernameError] =
    useState<boolean>(false);
  const [isLoadingWorkspaceData, setIsLoadingWorkspaceData] =
    useState<boolean>(false);
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");

  // TODO: get username from login data
  const username = "user";

  useEffect(() => {
    if (
      !workspaceResult.fetching &&
      workspaceResult.data &&
      workspaceResult.data.workspace
    ) {
      console.log({ workspaceResult });
      updateWorkspaceData(workspaceResult.data.workspace);
    } else if (workspaceResult.error) {
      setHasGraphqlError(true);
      setGraphqlError(workspaceResult.error.message || "");
    }
  }, [workspaceResult.fetching]);

  const updateWorkspaceData = async (workspace: any) => {
    console.log({ workspace });
    setIsLoadingWorkspaceData(true);
    const workspaceName = workspace.name || "";
    setWorkspaceName(workspaceName);
    const members = workspace.members || [];
    setMembers(members);
    const memberLookup = {} as { [username: string]: number };
    members.forEach((member: Member, row: number) => {
      memberLookup[member.username] = row;
      if (member.username === username) {
        setIsAdmin(member.isAdmin);
      }
    });
    setMemberLookup(memberLookup);
    setIsLoadingWorkspaceData(false);
  };

  const deleteWorkspace = async () => {
    const confirmedWorkspaceName = window.prompt(
      `Type the name of this workspace: ${workspaceName}`
    );
    if (confirmedWorkspaceName === workspaceName) {
      setIsLoadingWorkspaceData(true);
      setHasGraphqlError(false);
      const deleteWorkspaceResult = await deleteWorkspacesMutation({
        input: {
          ids: [workspaceId],
        },
      });
      console.log({ deleteWorkspaceResult });
      if (deleteWorkspaceResult.data?.deleteWorkspaces?.status) {
        alert("Workspace deleted");
        props.navigation.navigate("Root");
      } else if (deleteWorkspaceResult?.error) {
        setHasGraphqlError(true);
        setGraphqlError(deleteWorkspaceResult?.error.message);
      }
      setIsLoadingWorkspaceData(false);
    } else {
      window.alert("Invalid workspace name");
    }
  };

  const updateWorkspaceName = async () => {
    setIsLoadingWorkspaceData(true);
    const updateWorkspaceResult = await updateWorkspaceMutation({
      input: {
        id: workspaceId,
        name: workspaceName,
      },
    });
    console.log({ updateWorkspaceResult });
    if (workspaceResult.data && workspaceResult.data.workspace) {
      updateWorkspaceData(
        updateWorkspaceResult.data?.updateWorkspace?.workspace
      );
    }
    setIsLoadingWorkspaceData(false);
  };

  const setNewMemberName = (newMemberName: string) => {
    let isInvalidUsernameError = false;
    if (newMemberName == username) {
      isInvalidUsernameError = true;
    }
    // TODO: check if username exists, from list of connected users
    setIsInvalidUsernameError(isInvalidUsernameError);
    _setNewMemberName(newMemberName);
  };

  const _updateWorkspaceMemberData = async (members: Member[]) => {
    setIsLoadingWorkspaceData(true);
    // do graphql stuff
    const graphqlMembers: any[] = [];
    members.forEach((member: Member) => {
      graphqlMembers.push({
        username: member.username,
        isAdmin: member.isAdmin,
      });
    });
    const updateWorkspaceResult = await updateWorkspaceMutation({
      input: {
        id: workspaceId,
        members: graphqlMembers,
      },
    });
    console.log({ updateWorkspaceResult });
    if (updateWorkspaceResult.data?.updateWorkspace?.workspace) {
      updateWorkspaceData(
        updateWorkspaceResult.data?.updateWorkspace?.workspace
      );
    } else if (updateWorkspaceResult?.error) {
      setHasGraphqlError(true);
      setGraphqlError(updateWorkspaceResult?.error.message);
    }
    setIsLoadingWorkspaceData(false);
  };

  const addMember = async (member: Member) => {
    const existingMemberRow = memberLookup[member.username];
    if (existingMemberRow >= 0) {
      members.splice(existingMemberRow, 1);
      delete memberLookup[username];
    }
    members.push(member);
    memberLookup[member.username] = members.length - 1;
    setMembers(members);
    setMemberLookup(memberLookup);
    await _updateWorkspaceMemberData(members);
  };

  const updateMember = async (member: Member, isMemberAdmin: boolean) => {
    const existingMemberRow = memberLookup[member.username];
    if (existingMemberRow >= 0) {
      members[existingMemberRow].isAdmin = isMemberAdmin;
      console.log({ members });
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
        <Text style={tw`mt-6 mb-4 font-700 text-xl text-center`}>
          Workspace Settings
        </Text>
        {workspaceResult.fetching ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <View>
              <Text style={tw`mt-6 mb-4 font-700 text-xl text-center`}>
                Change Name
              </Text>
              <Input
                placeholder="Workspace name"
                value={workspaceName}
                onChangeText={setWorkspaceName}
                editable={isAdmin && !isLoadingWorkspaceData}
              />
              {isAdmin && (
                <Button
                  onPress={updateWorkspaceName}
                  disabled={isLoadingWorkspaceData}
                >
                  Update
                </Button>
              )}
            </View>
            <View>
              <Text style={tw`mt-6 mb-4 font-700 text-xl text-center`}>
                Members
              </Text>
              <View>
                <View style={styles.addMemberContainer}>
                  <Input
                    placeholder="New member name"
                    value={newMemberName}
                    onChangeText={setNewMemberName}
                  />
                  <Checkbox
                    accessibilityLabel="Is member an admin"
                    onChange={(isNewMemberAdmin) => {
                      setIsNewMemberAdmin(isNewMemberAdmin);
                    }}
                    value={username}
                  />
                  <Text>Admin</Text>
                  <Button
                    onPress={() => {
                      const member = {
                        username: newMemberName,
                        isAdmin: isNewMemberAdmin,
                      };
                      addMember(member);
                    }}
                    disabled={!newMemberName}
                  >
                    Add
                  </Button>
                </View>
                {isInvalidUsernameError && (
                  <Text style={styles.formError}>Invalid username</Text>
                )}
              </View>
              {members.map((member: any) => (
                <WorkspaceMember
                  key={member.username}
                  username={member.username}
                  isAdmin={member.isAdmin}
                  adminUsername={username}
                  allowEditing={isAdmin && member.username !== username}
                  onAdminStatusChange={(isMemberAdmin: boolean) => {
                    updateMember(member, isMemberAdmin);
                  }}
                  onDeletePress={() => {
                    removeMember(member.username);
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
            {isAdmin && (
              <Button onPress={deleteWorkspace}>Delete Workspace</Button>
            )}
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
