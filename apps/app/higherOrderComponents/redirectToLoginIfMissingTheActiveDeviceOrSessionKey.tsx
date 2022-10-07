import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../context/AppContext";

export const redirectToLoginIfMissingTheActiveDeviceOrSessionKey =
  (Component) => (props) => {
    const navigation = useNavigation();
    const { activeDevice, sessionKey } = useAppContext();
    if (!activeDevice || !sessionKey) {
      navigation.navigate("Login");
      return null;
    }

    return <Component {...props} />;
  };
