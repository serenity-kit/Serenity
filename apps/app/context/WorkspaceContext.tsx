import React, { useContext } from "react";
import { UseQueryState } from "urql";
import { Exact, InputMaybe, WorkspaceQuery } from "../generated/graphql";

type WorkspaceContext = {
  workspaceId: string;
  workspaceQueryResult: UseQueryState<
    WorkspaceQuery,
    Exact<{
      id?: InputMaybe<string> | undefined;
      deviceSigningPublicKey: string;
    }>
  >;
};

const workspaceContext = React.createContext<WorkspaceContext>({
  workspaceId: "",
  workspaceQueryResult: {
    fetching: true,
    stale: false,
    data: undefined,
    error: undefined,
  },
});

export const WorkspaceProvider = workspaceContext.Provider;

export const useWorkspace = () => {
  return useContext(workspaceContext);
};
