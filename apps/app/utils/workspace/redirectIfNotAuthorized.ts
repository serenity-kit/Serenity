import { Client } from "urql";
import { isWorkspaceAuthorized } from "./isWorkspaceAuthorized";

export type Props = {
  urqlClient: Client;
  workspaceId: string;
  navigation: any;
};
export const redirectIfNotAuthorized = async ({
  urqlClient,
  workspaceId,
  navigation,
}: Props) => {
  const isAuthorized = await isWorkspaceAuthorized({
    urqlClient,
    workspaceId,
  });
  if (!isAuthorized) {
    navigation.navigate("Workspace", {
      workspaceId,
      screen: "WorkspaceNotDecrypted",
    });
    return;
  }
};
