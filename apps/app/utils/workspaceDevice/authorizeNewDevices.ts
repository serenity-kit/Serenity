import { Client } from "urql";
import {
  AttachDevicesToWorkspacesDocument,
  AttachDevicesToWorkspacesMutation,
  AttachDevicesToWorkspacesMutationVariables,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { createWorkspaceMemberDevices } from "./createWorkspaceMemberDevices";
import { getUnauthorizedWorkspaceDevices } from "./getUnauthorizedWorkspaceDevices";

export type Props = {
  urqlClient: Client;
  activeDevice: Device;
};
export const authorizeNewDevices = async ({
  urqlClient,
  activeDevice,
}: Props) => {
  const unauthorizedWorkspaceDevices = await getUnauthorizedWorkspaceDevices({
    urqlClient,
  });
  if (
    !unauthorizedWorkspaceDevices ||
    unauthorizedWorkspaceDevices.length === 0
  ) {
    // nothing to do
    return;
  }
  const workspaceMemberDevices = await createWorkspaceMemberDevices({
    unauthorizedWorkspaceDevices,
    urqlClient,
    activeDevice,
  });
  await urqlClient
    .mutation<
      AttachDevicesToWorkspacesMutation,
      AttachDevicesToWorkspacesMutationVariables
    >(
      AttachDevicesToWorkspacesDocument,
      {
        input: {
          creatorDeviceSigningPublicKey: activeDevice?.signingPublicKey!,
          workspaceMemberDevices,
        },
      },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();
};
