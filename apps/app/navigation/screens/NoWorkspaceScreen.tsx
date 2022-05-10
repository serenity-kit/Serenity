import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { Text, View, Button } from "@serenity-tools/ui";
import { useCreateWorkspaceMutation } from "../../generated/graphql";
import { v4 as uuidv4 } from "uuid";

export default function NoWorkspaceScreen({ navigation }) {
  const [, createWorkspaceMutation] = useCreateWorkspaceMutation();
  const [hasGraphqlError, setHasGraphqlError] = useState<boolean>(false);
  const [graphqlError, setGraphqlError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createWorkspace = async () => {
    setIsLoading(true);
    setHasGraphqlError(false);
    const name =
      window.prompt("Enter a workspace name") || uuidv4().substring(0, 8);
    if (name && name.length > 0) {
      const id = uuidv4();
      const createWorkspaceResult = await createWorkspaceMutation({
        input: {
          name,
          id,
        },
      });
      if (createWorkspaceResult.data?.createWorkspace?.workspace) {
        navigation.navigate("Workspace", {
          workspaceId: createWorkspaceResult.data.createWorkspace.workspace.id,
        });
      } else if (createWorkspaceResult.error) {
        setHasGraphqlError(true);
        setGraphqlError(createWorkspaceResult.error.message);
      }
    }
    setIsLoading(false);
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
            createWorkspace();
          }}
          disabled={isLoading}
        >
          Create workspace
        </Button>
      </View>
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
