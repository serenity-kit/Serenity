import React, { useState } from "react";

import { Text, View, Button, Input } from "@serenity-tools/ui";
import { RootStackScreenProps } from "../../types";
import { useDeleteWorkspacesMutation } from "../../generated/graphql";
import { useRoute } from "@react-navigation/native";

export default function WorkspaceSettingsScreen(props) {
  const route = useRoute<RootStackScreenProps<"Workspace">["route"]>();
  const workspaceId = route.params.workspaceId;
  const [, deleteWorkspacesMutation] = useDeleteWorkspacesMutation();
  // const [, updateWorkspaceMutation] = useUpdateWorkspacesMutation();
  const [workspaceName, setWorkspaceName] = useState("");

  // TODO: get current workspace details

  const deleteWorkspace = async () => {
    const deleteWorkspaceResult = await deleteWorkspacesMutation({
      input: {
        ids: [workspaceId],
      },
    });
    console.log({ deleteWorkspaceResult });
    if (deleteWorkspaceResult.data?.deleteWorkspaces?.status) {
      alert("Workspace deleted");
    }
  };

  const updateWorkspaceName = async () => {
    // const updateWorkspaceResult = await updateWorkspaceMutation({
    //   input: {
    //     id: workspaceId,
    //     name: workspaceName,
    //   },
    // });
    // console.log({updateWorkspaceResult})
    // setWorkspaceName(updateWorkspaceResult.data.updateWorkspace.name);
  };

  return (
    <View>
      <Text>Workspace Settings.</Text>
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
    </View>
  );
}
