import {
  AttachDevicesToWorkspacesDocument,
  AttachDevicesToWorkspacesMutation,
  AttachDevicesToWorkspacesMutationVariables,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { getUrqlClient } from "../urqlClient/urqlClient";
import { createWorkspaceMemberDevices } from "./createWorkspaceMemberDevices";
import { getUnauthorizedWorkspaceDevices } from "./getUnauthorizedWorkspaceDevices";

export type Props = {
  activeDevice: Device;
};
export const authorizeNewDevices = async ({ activeDevice }: Props) => {
  const unauthorizedWorkspaceDevices = await getUnauthorizedWorkspaceDevices(
    {}
  );
  if (
    !unauthorizedWorkspaceDevices ||
    unauthorizedWorkspaceDevices.length === 0
  ) {
    // nothing to do
    console.log("No unauthorized devices found");
    return;
  }
  const workspaceMemberDevices = await createWorkspaceMemberDevices({
    unauthorizedWorkspaceDevices,
    activeDevice,
  });
  await getUrqlClient()
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
