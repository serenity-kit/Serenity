import { useFocusEffect } from "@react-navigation/native";
import { CenterContent, Text } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import { useAppContext } from "../../../context/AppContext";
import { runLogoutMutation } from "../../../generated/graphql";
import { RootStackScreenProps } from "../../../types/navigationProps";
import { clearDeviceAndSessionStorage } from "../../../utils/authentication/clearDeviceAndSessionStorage";
import { userWorkspaceKeyStore } from "../../../utils/workspace/workspaceKeyStore";

let logoutInitiated = false;

export const initiateLogout = () => {
  logoutInitiated = true;
};

export default function LogoutInProgress({
  navigation,
}: RootStackScreenProps<"LogoutInProgress">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const clearWorkspaceKeyStore = userWorkspaceKeyStore((state) => state.clear);
  const { updateAuthentication, sessionKey, activeDevice } = useAppContext();

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
        const logoutResult = await runLogoutMutation({}, {});
        remoteCleanupSuccessful = logoutResult.data?.logout?.success || false;
        clearDeviceAndSessionStorage(clearWorkspaceKeyStore);
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
