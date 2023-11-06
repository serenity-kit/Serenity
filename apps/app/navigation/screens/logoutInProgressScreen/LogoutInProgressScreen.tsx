import { useFocusEffect } from "@react-navigation/native";
import * as userChain from "@serenity-kit/user-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { notNull, notUndefined } from "@serenity-tools/common";
import { CenterContent, Text } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import sodium from "react-native-libsodium";
import { useAppContext } from "../../../context/AppContext";
import {
  runLogoutMutation,
  runUserChainQuery,
  runWorkspaceMemberDevicesProofsQuery,
} from "../../../generated/graphql";
import {
  getWorkspaceChainEventByHash,
  loadRemoteWorkspaceChain,
} from "../../../store/workspaceChainStore";
import { RootStackScreenProps } from "../../../types/navigationProps";
import { clearDeviceAndSessionStorage } from "../../../utils/authentication/clearDeviceAndSessionStorage";
import { getMainDevice } from "../../../utils/device/mainDeviceMemoryStore";

let logoutInitiated = false;

export const initiateLogout = () => {
  logoutInitiated = true;
};

export default function LogoutInProgress({
  navigation,
}: RootStackScreenProps<"LogoutInProgress">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const { updateAuthentication, activeDevice } = useAppContext();

  useFocusEffect(() => {
    async function logout() {
      // Protect against direct links to this screen. The logout should only happen
      // if it was initiated by the user by clicking the logout button.
      if (!logoutInitiated) {
        navigation.navigate("Root");
        return;
      }
      logoutInitiated = false;

      let localCleanupSuccessful = false;
      let remoteCleanupSuccessful = false;
      try {
        const mainDevice = getMainDevice();
        if (!mainDevice) {
          throw new Error("Main device not available");
        }

        if (!activeDevice) {
          throw new Error("activeDevice not available");
        }

        const userChainQueryResult = await runUserChainQuery({});
        let userChainState: userChain.UserChainState | null = null;
        let lastChainEvent: userChain.UserChainEvent | null = null;
        if (userChainQueryResult.data?.userChain?.nodes) {
          userChainState = userChain.resolveState({
            events: userChainQueryResult.data.userChain.nodes
              .filter(notNull)
              .map((event) => {
                const data = userChain.UserChainEvent.parse(
                  JSON.parse(event.serializedContent)
                );
                lastChainEvent = data;
                return data;
              }),
            knownVersion: userChain.version,
          }).currentState;
        }

        if (!lastChainEvent || !userChainState) {
          throw new Error("lastChainEvent or userChainState not available");
        }

        const workspaceMemberDevicesProofsQueryResult =
          await runWorkspaceMemberDevicesProofsQuery({});

        if (
          !workspaceMemberDevicesProofsQueryResult.data
            ?.workspaceMemberDevicesProofs?.nodes
        ) {
          throw new Error("Failed to fetch workspaceMemberDevicesProofs");
        }

        const event = userChain.removeDevice({
          authorKeyPair: {
            privateKey: mainDevice.signingPrivateKey,
            publicKey: mainDevice.signingPublicKey,
          },
          signingPublicKey: activeDevice.signingPublicKey,
          prevEvent: lastChainEvent,
        });
        const newUserChainState = userChain.applyEvent({
          state: userChainState,
          event,
          knownVersion: userChain.version,
        });

        const newWorkspaceMemberDevicesProofs: {
          workspaceId: string;
          serializedWorkspaceMemberDevicesProof: string;
        }[] = [];
        for (const entry of workspaceMemberDevicesProofsQueryResult.data.workspaceMemberDevicesProofs.nodes
          .filter(notNull)
          .filter(notUndefined)) {
          const data =
            workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData.parse(
              JSON.parse(entry.serializedData)
            );

          // load latest workspace chain entries and check if the workspace chain event is included
          // to verify that the server is providing this or a newer workspace chain
          const { state } = await loadRemoteWorkspaceChain({
            workspaceId: entry.workspaceId,
          });
          const workspaceChainEvent = getWorkspaceChainEventByHash({
            hash: data.workspaceChainHash,
            workspaceId: entry.workspaceId,
          });
          if (!workspaceChainEvent) {
            throw new Error(
              "Workspace chain event not found in the current workspace chain"
            );
          }

          const isValid =
            workspaceMemberDevicesProofUtil.isValidWorkspaceMemberDevicesProof({
              authorPublicKey: entry.authorMainDeviceSigningPublicKey,
              workspaceMemberDevicesProof: entry.proof,
              workspaceMemberDevicesProofData: data,
            });
          if (!isValid) {
            throw new Error("Invalid workspace member devices proof");
          }

          const newProof =
            workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
              authorKeyPair: {
                privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
                publicKey: sodium.from_base64(mainDevice.signingPublicKey),
                keyType: "ed25519",
              },
              workspaceMemberDevicesProofData: {
                clock: data.clock + 1,
                userChainHashes: {
                  ...data.userChainHashes,
                  [newUserChainState.id]: newUserChainState.eventHash,
                },
                workspaceChainHash: state.lastEventHash,
              },
            });
          newWorkspaceMemberDevicesProofs.push({
            workspaceId: entry.workspaceId,
            serializedWorkspaceMemberDevicesProof: JSON.stringify(newProof),
          });
        }

        const logoutResult = await runLogoutMutation(
          {
            input: {
              serializedUserChainEvent: JSON.stringify(event),
              workspaceMemberDevicesProofs: newWorkspaceMemberDevicesProofs,
            },
          },
          {}
        );
        remoteCleanupSuccessful = logoutResult.data?.logout?.success || false;
        await clearDeviceAndSessionStorage();
        await updateAuthentication(null);
        localCleanupSuccessful = true;
      } catch (err) {
        console.error(err);
      } finally {
        if (!localCleanupSuccessful && !remoteCleanupSuccessful) {
          alert(
            "Failed to logout on the server and cleanup the local session data. Please reload and try again."
          );
        } else if (localCleanupSuccessful && !remoteCleanupSuccessful) {
          alert(
            "Failed to logout on the server and but removed local session data. Please login from another device and remove the device manually from the account settings."
          );
        } else if (!localCleanupSuccessful && remoteCleanupSuccessful) {
          alert(
            "Failed to cleanup the local session data but logged out on the server. Please login and try again to log out on this device."
          );
        }
        navigation.navigate("Login");
      }
    }

    logout();
  });

  return (
    <CenterContent>
      <Text>Logging out …</Text>
    </CenterContent>
  );
}
