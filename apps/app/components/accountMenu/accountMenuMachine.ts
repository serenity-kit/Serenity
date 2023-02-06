import { assign, createMachine, spawn } from "xstate";
import {
  MeQueryResult,
  meQueryService,
  MeQueryServiceEvent,
  MeQueryUpdateResultEvent,
  WorkspaceQueryResult,
  workspaceQueryService,
  WorkspaceQueryServiceEvent,
  WorkspaceQueryUpdateResultEvent,
  WorkspacesQueryResult,
  workspacesQueryService,
  WorkspacesQueryServiceEvent,
  WorkspacesQueryUpdateResultEvent,
} from "../../generated/graphql";
import { Device } from "../../types/Device";

type Params = {
  workspaceId?: string;
  activeDevice: Device | null;
};

type Context = {
  params: Params;
  meQueryResult?: MeQueryResult;
  meQueryActor?: any;
  workspacesQueryResult?: WorkspacesQueryResult;
  workspacesQueryActor?: any;
  workspaceQueryResult?: WorkspaceQueryResult;
  workspaceQueryActor?: any;
};

export const accountMenuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMDGqD2BXAdgFwFkwcsC0ALASxzADpKIAbMAYgGUAVAQQCUOBtAAwBdRKAAOGWJTyUMOMSAAeiALQAWAOy0AzAE4dARnUAOdYZODDOkwDYArABoQAT0QWdtTbfMmTmzQsAJh8AX1DnNExcQmJSCmo6BmYWAFUABQARLg4AUQB9Hly2VIAZARFFSWlZeUUVBHUg5zcEE0NaU3tbTXt2w29ek3CIkBwMCDhFKOx8IhIyVCoaKqkZOQUkZTU9e10DYzMLKxtNFrU9vSu9P3smoPV7A3DI9FnYhYSaeiYwVZqNvVEPZPLYrN0gk5XIggpoTLQDLZDHpDPY+iYdJo9CNQkA */
  createMachine(
    {
      schema: {
        events: {} as
          | MeQueryServiceEvent
          | WorkspacesQueryServiceEvent
          | WorkspaceQueryServiceEvent,
        context: {} as Context,
      },
      tsTypes: {} as import("./accountMenuMachine.typegen").Typegen0,
      predictableActionArguments: true,
      context: {
        params: {
          activeDevice: null,
        },
      },
      initial: "idle",
      states: {
        idle: {
          entry: ["spawnActors"],
          on: {
            "MeQuery.UPDATE_RESULT": {
              actions: [
                assign({
                  meQueryResult: (_, event: MeQueryUpdateResultEvent) =>
                    event.result,
                }),
              ],
            },
            "WorkspacesQuery.UPDATE_RESULT": {
              actions: [
                assign({
                  workspacesQueryResult: (
                    _,
                    event: WorkspacesQueryUpdateResultEvent
                  ) => event.result,
                }),
              ],
            },
            "WorkspaceQuery.UPDATE_RESULT": {
              actions: [
                assign({
                  workspaceQueryResult: (
                    _,
                    event: WorkspaceQueryUpdateResultEvent
                  ) => event.result,
                }),
              ],
            },
          },
        },
      },
      id: "accountMenuMachine",
    },
    {
      actions: {
        spawnActors: assign({
          meQueryActor: () => {
            return spawn(meQueryService({}));
          },
          workspacesQueryActor: (context) => {
            return context.params.activeDevice
              ? spawn(
                  workspacesQueryService({
                    deviceSigningPublicKey:
                      context.params.activeDevice.signingPublicKey,
                  })
                )
              : null;
          },
          workspaceQueryActor: (context) => {
            return context.params.activeDevice && context.params.workspaceId
              ? spawn(
                  workspaceQueryService({
                    id: context.params.workspaceId,
                    deviceSigningPublicKey:
                      context.params.activeDevice.signingPublicKey,
                  })
                )
              : null;
          },
        }),
      },
    }
  );
