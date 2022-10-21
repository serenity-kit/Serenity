import { useFocusEffect } from "@react-navigation/native";
import { CenterContent, Text } from "@serenity-tools/ui";
import { useWindowDimensions } from "react-native";
import { useAppContext } from "../../../context/AppContext";
import { RootStackScreenProps } from "../../../types/navigation";
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
  const { updateAuthentication } = useAppContext();

  useFocusEffect(() => {
    async function logout() {
      // Protect against direct links to this screen. The logout should only happen
      // if it was initiated by the user by clicking the logout button.
      if (!logoutInitiated) {
        navigation.navigate("Root");
        return;
      }
      try {
        clearDeviceAndSessionStorage(clearWorkspaceKeyStore);
        await updateAuthentication(null);
      } catch {
        alert("Failed to destroy the local data. Please login and try again.");
      } finally {
        logoutInitiated = false;
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
