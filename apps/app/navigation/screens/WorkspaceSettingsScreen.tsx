import React, { useState, useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Text,
  View,
  Button,
  Input,
  Checkbox,
  LabeledInput,
  Modal,
  tw,
} from "@serenity-tools/ui";
import { RootStackScreenProps, WorkspaceDrawerScreenProps } from "../../types";
import {
  useWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useMeQuery,
  useDeleteWorkspacesMutation,
  useUserIdFromUsernameQuery,
} from "../../generated/graphql";

type Member = {
  userId: string;
  username: string;
  isAdmin: boolean;
};

function WorkspaceMember({
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
  const [meResult] = useMeQuery();
  const [newMemberName, _setNewMemberName] = useState<string>("");
  const [userIdFromUsernameResult, refetchUserIdFromUsernameResult] =
    useUserIdFromUsernameQuery({
      variables: {
        username: newMemberName,
      },
    });
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [newMemberUserId, _setNewMemberUserId] = useState<string>("");
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
  const [myUserId, setMyUserId] = useState<string>("");
  const [myUsername, setMyUsername] = useState<string>("");
  const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] =
    useState<boolean>(false);
  const [deletingWorkspaceName, setDeletingWorkspaceName] =
    useState<string>("");

  useEffect(() => {
    if (
      !workspaceResult.fetching &&
      workspaceResult.data &&
      workspaceResult.data.workspace
    ) {
      updateWorkspaceData(workspaceResult.data.workspace);
    } else if (workspaceResult.error) {
      setHasGraphqlError(true);
      setGraphqlError(workspaceResult.error.message || "");
    }
  }, [workspaceResult.fetching]);

  useEffect(() => {
    if (meResult.data && meResult.data.me) {
      if (meResult.data.me) {
        setMyUserId(meResult.data.me.id);
        setMyUsername(meResult.data.me.username);
      } else {
        // TODO: error! Couldn't fetch user
      }
    }
  }, [meResult]);

  useEffect(() => {
    updateNewMemberNameInput(userIdFromUsernameResult);
  }, [userIdFromUsernameResult]);

  const updateNewMemberNameInput = (userIdFromUsernameResult: any) => {
    if (newMemberName.length === 0) {
      setIsInvalidUsernameError(false);
      return;
    }
    if (newMemberName === myUsername) {
      setIsInvalidUsernameError(true);
      return;
    }
    if (
      userIdFromUsernameResult.data &&
      userIdFromUsernameResult.data.userIdFromUsername
    ) {
      _setNewMemberUserId(userIdFromUsernameResult.data.userIdFromUsername.id);
      setIsInvalidUsernameError(false);
    } else if (userIdFromUsernameResult.error) {
      setIsInvalidUsernameError(true);
      _setNewMemberUserId("");
    }
  };

  const updateWorkspaceData = async (workspace: any) => {
    console.log(workspace);
    setIsLoadingWorkspaceData(true);
    const workspaceName = workspace.name || "";
    setWorkspaceName(workspaceName);
    const members = workspace.members || [];
    setMembers(members);
    const memberLookup = {} as { [username: string]: number };
    members.forEach((member: Member, row: number) => {
      memberLookup[member.userId] = row;
      console.log(myUserId);
      console.log(member.userId);
      if (member.userId === myUserId) {
        setIsAdmin(member.isAdmin);
      }
    });
    setMemberLookup(memberLookup);
    setIsLoadingWorkspaceData(false);
  };

  const deleteWorkspace = async () => {
    if (deletingWorkspaceName !== workspaceName) {
      // display an error
      return;
    }
    setIsLoadingWorkspaceData(true);
    setHasGraphqlError(false);
    const deleteWorkspaceResult = await deleteWorkspacesMutation({
      input: {
        ids: [workspaceId],
      },
    });
    if (deleteWorkspaceResult.data?.deleteWorkspaces?.status) {
      alert("Workspace deleted");
      props.navigation.navigate("Root");
    } else if (deleteWorkspaceResult?.error) {
      setHasGraphqlError(true);
      setGraphqlError(deleteWorkspaceResult?.error.message);
    }
    setIsLoadingWorkspaceData(false);
    setShowDeleteWorkspaceModal(false);
  };

  const updateWorkspaceName = async () => {
    setIsLoadingWorkspaceData(true);
    const updateWorkspaceResult = await updateWorkspaceMutation({
      input: {
        id: workspaceId,
        name: workspaceName,
      },
    });
    if (workspaceResult.data && workspaceResult.data.workspace) {
      updateWorkspaceData(
        updateWorkspaceResult.data?.updateWorkspace?.workspace
      );
    }
    setIsLoadingWorkspaceData(false);
  };

  const setNewMemberName = (newMemberName: string) => {
    // try to find the userId for the new member
    // if the query returns an error, set the invalid username error

    _setNewMemberName(newMemberName);
    if (newMemberName.length === 0) {
      setIsInvalidUsernameError(true);
      return;
    }
  };

  const _updateWorkspaceMemberData = async (members: Member[]) => {
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
        updateWorkspaceResult.data?.updateWorkspace?.workspace
      );
    } else if (updateWorkspaceResult?.error) {
      setHasGraphqlError(true);
      setGraphqlError(updateWorkspaceResult?.error.message);
    }
    setIsLoadingWorkspaceData(false);
  };

  const addMember = async (member: Member) => {
    const existingMemberRow = memberLookup[member.userId];
    if (existingMemberRow >= 0) {
      members.splice(existingMemberRow, 1);
      delete memberLookup[member.userId];
    }
    members.push(member);
    memberLookup[member.userId] = members.length - 1;
    setMembers(members);
    setMemberLookup(memberLookup);
    await _updateWorkspaceMemberData(members);
  };

  const updateMember = async (member: Member, isMemberAdmin: boolean) => {
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
              {isAdmin && (
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
                      value={myUsername}
                    />
                    <Text>Admin</Text>
                    <Button
                      onPress={() => {
                        const member = {
                          userId: newMemberUserId,
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
              )}
              {members.map((member: any) => (
                <WorkspaceMember
                  key={member.userId}
                  userId={member.userId}
                  username={member.username}
                  isAdmin={member.isAdmin}
                  adminUserId={myUserId}
                  allowEditing={isAdmin && member.userId !== myUserId}
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
            {isAdmin && (
              <Button onPress={() => setShowDeleteWorkspaceModal(true)}>
                Delete Workspace
              </Button>
            )}
            {isAdmin && (
              <Modal
                isVisible={showDeleteWorkspaceModal}
                onBackdropPress={() => setShowDeleteWorkspaceModal(false)}
              >
                <View style={tw`bg-white border-gray-800 max-w-60 m-auto`}>
                  <Text>Type the name of this workspace: {workspaceName}</Text>
                  <LabeledInput
                    label={"Workspace Name"}
                    onChangeText={setDeletingWorkspaceName}
                  />
                  <Button
                    disabled={deletingWorkspaceName !== workspaceName}
                    onPress={() => {
                      deleteWorkspace();
                    }}
                  >
                    Delete Workspace
                  </Button>
                </View>
              </Modal>
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
