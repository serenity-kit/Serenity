import { LocalDevice } from "@serenity-tools/common";
import { AnyActorRef, assign, createMachine, spawn } from "xstate";
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
import { showToast } from "../../utils/toast/showToast";

type Params = {
  workspaceId?: string;
  activeDevice: LocalDevice | null;
};

interface Context {
  params: Params;
  meQueryResult?: MeQueryResult;
  meQueryError: boolean;
  meQueryActor?: AnyActorRef;
  workspacesQueryResult?: WorkspacesQueryResult;
  workspacesQueryError: boolean;
  workspacesQueryActor?: AnyActorRef;
  workspaceQueryResult?: WorkspaceQueryResult;
  workspaceQueryError: boolean;
  workspaceQueryActor?: AnyActorRef;
}

export const accountMenuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMDGqD2BXAdgFwFkwcsC0ALASxzAGIiBFLMAJwE8A6AVQAUARAIIAVAKIB9AEoiAylwAyQgNoAGALqJQABwyxKeShhwaQbRAFoAHAHYOAFgsBWAGxWHFgIzurLtwBoQAB6IDu5OHMoAzCHOAEwOAL7x-miYuITEpBTUdIzM7BwiEhIA8hIq6kgg2rr6hsamCJY29s6uHl4+Fv5BCCFhkdFOcYnJ6Nj4RCRkqFQ0tADqGCwA1rCaaHBMrJy8gqKSMvJKasbVegZGlQ1Ndo6dnt5t3cGh4VHusQlJICnj6VNZOaLFZrDawLb5QolMonSpnWqXUDXay3VpuB6dZ69V4DD5DL6jVITDLTWZ0YGrdaoMAQnb8YTiKSyBTlU46c51K7mFEte4dJ6BF79d6fEY-MZpSaZGbZBZLSkbWkFIqlVlw9kI+rc5p3NoYgU9PpvQbDb6-SUkwFgDgYTTEWgAYTkxWkIjVWg1F2MPXctjCcSsgacAE4LMpgzFA-4GjEIsoOMGIk53MGPm4LBErMGxebiQCZTQOKgADY6SC0Yo8EQAOXdVU9nNAPTMLnCrgc6eDHczvujiCcyjCtl9yhCo4cweUFhiOYleelZI4lAgxboIgAbsQ8AACdx1+FeyrNiIWCx2GLBqyx5Qp5RXiJ9hAn4Mcdxxxy2SKju8WRLfHAYBAcDGLm-wLtkbI1IeTbmLYSbnpe163vej6+hEdgOKO7gXk4rShgS4pEmBpLZEuK5gJBHKIoKjRJjEHBWBEwZDDhFifhGj6Ri+Ti2JO06xrYMSOBYTizkRUokYWtrEJRmpHuYMROGegmIXGyGxo+thWPGibJqmHanpm2ZmnOxFWkWpawJAsnQTRZiKcpF73jek4oSY-ZWMpI5jh2fEzn+QA */

  /** @xstate-layout N4IgpgJg5mDOIC5QEMDGqD2BXAdgFwFkwcsC0ALASxzAGIiBFLMAJwE8A6AVQAUARAIIAVAKIB9AEoiAylwAyQgNoAGALqJQABwyxKeShhwaQbRAFoAHAHYOAFgsBWAGxWHFgIzurLtwBoQAB6IDu5OHMoAzCHOAEwOAL7x-miYuITEpBTUdIzM7BwiEhIA8hIq6kgg2rr6hsamCJY29s6uHl4+Fv5BCCFhkdFOcYnJ6Nj4RCRkqFQ0tADqGCwA1rCaaHBMrJy8gqKSMvJKasbVegZGlQ1Ndo6dnt5t3cGh4VHusQlJICnj6VNZOaLFZrDawLb5QolMonSpnWqXUDXay3VpuB6dZ69V4DD5DL6jVITDLTWZ0YGrdaoMAQnb8YTiKSyBTlU46c51K7mFEte4dJ6BF79d6fEY-MZpSaZGbZBZLSkbWkFIqlVlw9kI+rc5p3NoYgU9PpvQbDb6-SUkwFgDgYTTEWgAYTkxWkIjVWg1F2MPXctjCcSsgacAE4LMpgzFA-4GjEIsoOMGIk53MGPm4LBErMGxebiQCZTQOKgADY6SC0Yo8EQAOXdVU9nNAPTMLnCrgc6eDHczvujiCcyjCtl9yhCo4cweUFhiOYleelZI4lAgxbodfhXsqzYiFgsdhiwasseUKeUR4ifYQO+DHHcccctkio7PFkS3xwGAgcGMuf+C+ybI1JuTbmLYSb7oex6nuel6+hEdgOKO7gHk4rShgS4pEn+pLZEuK5gIBHKIoKjRJjEHBWBEwZDChFiPhGl6RjeTi2JO06xrYMSOBYTizlhUo4YWtrEIRmpbuYMROHunGQXG0GxpethWPGibJqmHa7pm2ZmnO2FWkWpawJAonASRZiSdJB7niek4wSY-ZWNJI5jh2bEzm+QA */
  createMachine(
    {
      schema: {
        events: {} as
          | MeQueryServiceEvent
          | WorkspacesQueryServiceEvent
          | WorkspaceQueryServiceEvent
          | { type: "OPEN" | "CLOSE" },
        context: {} as Context,
      },
      tsTypes: {} as import("./accountMenuMachine.typegen").Typegen0,
      predictableActionArguments: true,
      context: {
        params: {
          activeDevice: null,
        },
        meQueryError: false,
        workspaceQueryError: false,
        workspacesQueryError: false,
      },
      initial: "closed",
      on: {
        "MeQuery.UPDATE_RESULT": {
          actions: [
            assign((_, event: MeQueryUpdateResultEvent) => {
              return {
                meQueryError: false,
                meQueryResult: event.result,
              };
            }),
          ],
        },
        "MeQuery.ERROR": {
          actions: ["showErrorToast", assign({ meQueryError: true })],
        },
        "WorkspacesQuery.UPDATE_RESULT": {
          actions: [
            assign((_, event: WorkspacesQueryUpdateResultEvent) => {
              return {
                workspacesQueryError: false,
                workspacesQueryResult: event.result,
              };
            }),
          ],
        },
        "WorkspacesQuery.ERROR": {
          actions: ["showErrorToast", assign({ workspacesQueryError: true })],
        },
        "WorkspaceQuery.UPDATE_RESULT": {
          actions: [
            assign((_, event: WorkspaceQueryUpdateResultEvent) => {
              return {
                workspaceQueryError: false,
                workspaceQueryResult: event.result,
              };
            }),
          ],
        },
        "WorkspaceQuery.ERROR": {
          actions: ["showErrorToast", assign({ workspaceQueryError: true })],
        },
      },
      states: {
        open: {
          entry: ["stopActors", "spawnActors"], // respawn to trigger a request
          on: { CLOSE: "closed" },
        },
        closed: {
          entry: ["stopActors", "spawnActors"], // respawn to trigger a request
          on: { OPEN: "open" },
        },
      },
      id: "accountMenuMachine",
    },
    {
      actions: {
        showErrorToast: (context) => {
          // makes sure the error toast is only shown once
          if (
            !context.meQueryError &&
            !context.workspaceQueryError &&
            !context.workspacesQueryError
          ) {
            showToast("Failed to load account menu data.", "error");
          }
        },
        spawnActors: assign((context) => {
          return {
            meQueryActor: spawn(meQueryService({}, 120000)), // poll only every 2 minutes
            workspaceQueryActor:
              context.params.activeDevice && context.params.workspaceId
                ? spawn(
                    workspaceQueryService(
                      {
                        id: context.params.workspaceId,
                        deviceSigningPublicKey:
                          context.params.activeDevice.signingPublicKey,
                      },
                      120000 // poll only every 2 minutes
                    )
                  )
                : undefined,
            workspacesQueryActor: context.params.activeDevice
              ? spawn(
                  workspacesQueryService(
                    {
                      deviceSigningPublicKey:
                        context.params.activeDevice.signingPublicKey,
                    },
                    120000 // poll only every 2 minutes
                  )
                )
              : undefined,
          };
        }),
        stopActors: (context) => {
          if (context.meQueryActor?.stop) {
            context.meQueryActor.stop();
          }
          if (context.workspaceQueryActor?.stop) {
            context.workspaceQueryActor.stop();
          }
          if (context.workspacesQueryActor?.stop) {
            context.workspacesQueryActor.stop();
          }
        },
      },
    }
  );
