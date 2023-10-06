import { useFocusEffect } from "@react-navigation/native";
import * as userChain from "@serenity-kit/user-chain";
import { notNull } from "@serenity-tools/common";
import { CenterContent, Text } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import { useAppContext } from "../../../context/AppContext";
import {
  runLogoutMutation,
  runUserChainQuery,
} from "../../../generated/graphql";
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
        let lastChainEvent: userChain.UserChainEvent | null = null;
        if (userChainQueryResult.data?.userChain?.nodes) {
          userChain.resolveState({
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
          });
        }

        if (!lastChainEvent) {
          throw new Error("lastChainEvent not available");
        }

        const event = userChain.removeDevice({
          authorKeyPair: {
            privateKey: mainDevice.signingPrivateKey,
            publicKey: mainDevice.signingPublicKey,
          },
          signingPublicKey: activeDevice.signingPublicKey,
          prevEvent: lastChainEvent,
        });

        const logoutResult = await runLogoutMutation(
          { input: { serializedUserChainEvent: JSON.stringify(event) } },
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
