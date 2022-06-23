import React, { useContext } from "react";

const workspaceIdContext = React.createContext<string>("");

export const WorkspaceIdProvider = workspaceIdContext.Provider;

export const useWorkspaceId = () => {
  return useContext(workspaceIdContext);
};
