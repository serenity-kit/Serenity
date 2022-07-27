import React, { useState, useEffect } from "react";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import {
  Text,
  View,
  Button,
  Input,
  Checkbox,
  LabeledInput,
  Modal,
  tw,
  ModalHeader,
  ModalButtonFooter,
} from "@serenity-tools/ui";
import { WorkspaceDrawerScreenProps } from "../../types/navigation";
import {
  useUpdateWorkspaceMutation,
  useMeQuery,
  useDeleteWorkspacesMutation,
  WorkspaceQuery,
  WorkspaceQueryVariables,
  WorkspaceDocument,
} from "../../generated/graphql";
import { CreateWorkspaceInvitation } from "../../components/workspace/CreateWorkspaceInvitation";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";
import {
  removeLastUsedDocumentId,
  removeLastUsedWorkspaceId,
} from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { useClient } from "urql";
import { Workspace } from "../../types/workspace";
import { getActiveDevice } from "../../utils/device/getActiveDevice";

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

export default function WorkspaceSettingsScreen(
  props: WorkspaceDrawerScreenProps<"Settings">
) {
  const urqlClient = useClient();
  const workspaceId = useWorkspaceId();
  const [, deleteWorkspacesMutation] = useDeleteWorkspacesMutation();
  const [, updateWorkspaceMutation] = useUpdateWorkspaceMutation();
  const [meResult] = useMeQuery();
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberLookup, setMemberLookup] = useState<{
    [username: string]: number;
  }>({});
  const [isLoadingWorkspaceData, setIsLoadingWorkspaceData] =
    useState<boolean>(false);
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");
  const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] =
    useState<boolean>(false);
  const [deletingWorkspaceName, setDeletingWorkspaceName] =
    useState<string>("");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    (async () => {
      const device = await getActiveDevice();
      if (!device) {
        // TODO: handle this error
        console.error("No active device found");
        return;
      }
      const deviceSigningPublicKey: string = device?.signingPublicKey;
      // check if the user has access to this workspace
      const workspaceResult = await urqlClient
        .query<WorkspaceQuery, WorkspaceQueryVariables>(
          WorkspaceDocument,
          {
            id: workspaceId,
            deviceSigningPublicKey,
          },
          { requestPolicy: "network-only" }
        )
        .toPromise();
      if (workspaceResult.data?.workspace) {
        const worskpace = workspaceResult.data?.workspace;
        setWorkspace(workspace);
      } else {
        props.navigation.replace("WorkspaceNotFound");
        return;
      }
    })();
  }, [urqlClient, props.navigation]);

  const updateWorkspaceData = async (workspace: any) => {
    setIsLoadingWorkspaceData(true);
    const workspaceName = workspace.name || "";
    setWorkspaceName(workspaceName);
    const members = workspace.members || [];
    setMembers(members);
    const memberLookup = {} as { [username: string]: number };
    members.forEach((member: Member, row: number) => {
      memberLookup[member.userId] = row;
      if (member.userId === meResult.data?.me?.id) {
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
      removeLastUsedDocumentId(workspaceId);
      removeLastUsedWorkspaceId();
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
    if (updateWorkspaceResult.data?.updateWorkspace?.workspace) {
      updateWorkspaceData(
        updateWorkspaceResult.data?.updateWorkspace?.workspace
      );
    }
    setIsLoadingWorkspaceData(false);
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
        {!workspace ? (
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
                <WorkspaceMember
                  key={member.userId}
                  userId={member.userId}
                  username={member.username}
                  isAdmin={member.isAdmin}
                  adminUserId={meResult.data?.me?.id}
                  allowEditing={
                    isAdmin && member.userId !== meResult.data?.me?.id
                  }
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
                <ModalHeader>Delete Workspace?</ModalHeader>
                <Text>Type the name of this workspace: {workspaceName}</Text>
                <LabeledInput
                  label={"Workspace Name"}
                  onChangeText={setDeletingWorkspaceName}
                />
                <ModalButtonFooter
                  confirm={
                    <Button
                      disabled={deletingWorkspaceName !== workspaceName}
                      onPress={() => {
                        deleteWorkspace();
                      }}
                    >
                      Delete
                    </Button>
                  }
                />
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
