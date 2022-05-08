import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { Text, View, Button, Input } from "@serenity-tools/ui";
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

export default function WorkspaceSettingsScreen(
  props: WorkspaceDrawerScreenProps<"Settings">
) {
  const workspaceId = props.route.path?.split("/")[2] || ""; // should never be undefined
  const [workspaceResult, refetchWorkspaceResult] = useWorkspaceQuery();
  const [, deleteWorkspacesMutation] = useDeleteWorkspacesMutation();
  const [, updateWorkspaceMutation] = useUpdateWorkspaceMutation();
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [newMemberName, setNewMemberName] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (
      !workspaceResult.fetching &&
      workspaceResult.data &&
      workspaceResult.data.workspace
    ) {
      updateWorkspaceData(workspaceResult.data.workspace);
    }
  }, [workspaceResult.fetching]);

  const updateWorkspaceData = async (workspace: any) => {
    const workspaceName = workspace.name || "";
    setWorkspaceName(workspaceName);
    const members = workspace.members || [];
    setMembers(members);
  };

  const deleteWorkspace = async () => {
    const deleteWorkspaceResult = await deleteWorkspacesMutation({
      input: {
        ids: [workspaceId],
      },
    });
    console.log({ deleteWorkspaceResult });
    if (deleteWorkspaceResult.data?.deleteWorkspaces?.status) {
      alert("Workspace deleted");
      props.navigation.navigate("Root");
    }
  };

  const updateWorkspaceName = async () => {
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
  };

  const addMember = async (username: string) => {};

  const removeMember = async (username: string) => {};

  return (
    <View>
      <Text>Workspace Settings.</Text>
      {workspaceResult.fetching ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Button onPress={deleteWorkspace}>Delete Workspace</Button>
          <View>
            <Text>Change Name</Text>
            <Input
              placeholder="Workspace name"
              value={workspaceName}
              onChangeText={setWorkspaceName}
            />
            <Button onPress={updateWorkspaceName}>Update</Button>
          </View>
          <View>
            <Text>Members</Text>
            <View style={styles.addMemberContainer}>
              <Input
                placeholder="New member name"
                value={newMemberName}
                onChangeText={setNewMemberName}
              />
              <Text>Admin</Text>
              <Button
                onPress={() => {
                  addMember(newMemberName);
                }}
                disabled={!newMemberName}
              >
                Add
              </Button>
            </View>
            {members.map((member: any) => (
              <View key={member.username} style={styles.memberListItem}>
                <Text style={styles.memberListItemLabel}>
                  {member.username}
                </Text>

                <Text>{member.isAdmin ? "Admin" : "Not Admin"}</Text>
                <Button
                  onPressIn={() => {
                    removeMember(member.username);
                  }}
                >
                  Remove
                </Button>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
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
});
