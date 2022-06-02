import React, { useState, useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Text, View, Button } from "@serenity-tools/ui";
import {
  useWorkspacesQuery,
  useCreateWorkspaceMutation,
} from "../../generated/graphql";
import { CreateWorkspaceModal } from "../../components/workspace/CreateWorkspaceModal";

export default function NoWorkspaceScreen({ navigation }) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [, createWorkspaceMutation] = useCreateWorkspaceMutation();
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [workspacesResult, refetchWorkspacesResult] = useWorkspacesQuery();
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState(false);

  const onWorkspaceCreated = (workspace: { id: string }) => {
    navigation.navigate("Workspace", {
      workspaceId: workspace.id,
      screen: "Dashboard",
    });
    setShowCreateWorkspaceModal(false);
  };

  return (
    <>
      {hasGraphqlError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{graphqlError}</Text>
        </View>
      )}
      <View style={styles.container}>
        <Text style={styles.title}>
          No workspace available. TODO (link to create one)
        </Text>
        <Button
          onPress={() => {
            setShowCreateWorkspaceModal(true);
          }}
          disabled={isLoading}
        >
          Create workspace
        </Button>
      </View>
      <CreateWorkspaceModal
        isVisible={showCreateWorkspaceModal}
        onBackdropPress={() => setShowCreateWorkspaceModal(false)}
        onWorkspaceCreated={onWorkspaceCreated}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  errorBanner: {
    backgroundColor: "red",
  },
  errorText: {
    color: "white",
  },
});
