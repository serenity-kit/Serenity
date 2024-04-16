import { LocalDevice } from "@serenity-tools/common";
import { AnyActorRef, assign, setup, stopChild } from "xstate";
import {
  MeQueryResult,
  MeQueryServiceEvent,
  WorkspaceQueryResult,
  WorkspaceQueryServiceEvent,
  WorkspacesQueryResult,
  WorkspacesQueryServiceEvent,
  meQueryService,
  workspaceQueryService,
  workspacesQueryService,
} from "../../generated/graphql";
import { showToast } from "../../utils/toast/showToast";

type Input = {
  workspaceId?: string;
  activeDevice: LocalDevice | null;
};

interface Context {
  params: Input;
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
  setup({
    types: {} as {
      context: Context;
      input: Input;
      events:
        | MeQueryServiceEvent
        | WorkspacesQueryServiceEvent
        | WorkspaceQueryServiceEvent
        | { type: "OPEN" | "CLOSE" };
      children: {
        meQueryService: "meQueryService";
        workspacesQueryService: "workspacesQueryService";
        workspaceQueryService: "workspaceQueryService";
      };
    },
    actors: {
      meQueryService,
      workspacesQueryService,
      workspaceQueryService,
    },
    actions: {
      showErrorToast: ({ context }) => {
        // makes sure the error toast is only shown once
        if (
          !context.meQueryError &&
          !context.workspaceQueryError &&
          !context.workspacesQueryError
        ) {
          showToast("Failed to load account menu data.", "error");
        }
      },
      spawnActors: assign(({ context, spawn }) => {
        return {
          meQueryActor: spawn("meQueryService", {
            id: "meQueryService",
            input: { variables: {}, intervalInMs: 120000 },
          }), // poll only every 2 minutes
          workspaceQueryActor:
            context.params.activeDevice && context.params.workspaceId
              ? spawn("workspaceQueryService", {
                  id: "workspaceQueryService",
                  input: {
                    variables: {
                      id: context.params.workspaceId,
                      deviceSigningPublicKey:
                        context.params.activeDevice.signingPublicKey,
                    },
                    intervalInMs: 120000, // poll only every 2 minutes
                  },
                })
              : undefined,
          workspacesQueryActor: context.params.activeDevice
            ? spawn("workspacesQueryService", {
                id: "workspacesQueryService",
                input: {
                  variables: {
                    deviceSigningPublicKey:
                      context.params.activeDevice.signingPublicKey,
                  },
                  intervalInMs: 120000, // poll only every 2 minutes
                },
              })
            : undefined,
        };
      }),
      stopActors: () => {
        stopChild("meQueryService");
        stopChild("workspaceQueryService");
        stopChild("workspacesQueryService");
      },
    },
  }).createMachine({
    context: ({ input }) => ({
      params: {
        activeDevice: input.activeDevice,
        workspaceId: input.workspaceId,
      },
      meQueryError: false,
      workspaceQueryError: false,
      workspacesQueryError: false,
    }),
    initial: "closed",
    on: {
      "MeQuery.UPDATE_RESULT": {
        actions: [
          assign(({ event }) => {
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
          assign(({ event }) => {
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
          assign(({ event }) => {
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
  });
