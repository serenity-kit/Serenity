import { useAppContext } from "../context/AppContext";
import { useMeQuery } from "../generated/graphql";

export const useAuthenticatedAppContext = () => {
  const [meResult] = useMeQuery();
  const { activeDevice, sessionKey, updateActiveDevice, updateAuthentication } =
    useAppContext();

  // all workspace components should be wrapped with the higher order component
  // checking for an active device and session and redirect if they are not available
  if (!activeDevice) {
    throw new Error("No activeDevice available");
  }
  if (!sessionKey) {
    throw new Error("No sessionKey available");
  }

  return {
    activeDevice,
    sessionKey,
    updateActiveDevice,
    updateAuthentication,
    me: meResult.data?.me,
  };
};
