import * as workspaceChain from "@serenity-kit/workspace-chain";
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
  workspaceChainState: workspaceChain.WorkspaceChainState | null;
  lastChainEvent: workspaceChain.WorkspaceChainEvent | null;
  fetchAndApplyNewWorkspaceChainEntries: () => Promise<void>;
};

const workspaceContext = React.createContext<WorkspaceContext>({
  workspaceId: "",
  workspaceQueryResult: {
    fetching: true,
    stale: false,
    data: undefined,
    error: undefined,
  },
  // TODO refactor to either have null or a nested valid object
  workspaceChainState: null,
  lastChainEvent: null,
  fetchAndApplyNewWorkspaceChainEntries: () => Promise.resolve(),
});

export const WorkspaceProvider = workspaceContext.Provider;

export const useWorkspace = () => {
  return useContext(workspaceContext);
};
