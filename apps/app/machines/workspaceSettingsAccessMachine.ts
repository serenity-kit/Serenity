import { createMachine } from "xstate";
import {
  loadInitialDataMachine,
  MeWithWorkspaceLoadingInfoQueryResult,
} from "./loadInitialData";

type Context = {
  workspaceId: string;
  navigation: any;
  lastUsedDocumentId?: string;
  meWithWorkspaceLoadingInfoQueryResult: MeWithWorkspaceLoadingInfoQueryResult;
};

export const workspaceSettingsAccessMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCB1VAnA1rAA7oDGYAymAC7UCWAdlLAHRqaNQCSDd16yACLp+AYgioGYFowBuqfNPYQefOgOH8AsmQAWjMIlBFUsNZKMgAHogBMtgIwsHAFgcB2BwGYvABgCcDgBsLu7uADQgAJ6IDra+LP7uABwhLv4ArC4uyb5etgC+BZHKOATEZJQ09Eysypyq-EIi6KJguLh4LETIIgBmeAC2bBgqvPQaLTqk+lKWJmb0FkjWsV7+LKG+uUHJtkFhDsnJkTEItu4bDtdBjgcZ1w7+RcUgDKgQcJaleIQk5FRaJw6qMGuNJvx5qZzAxLDYEC5bKdEMkNv5ku57Hl-EEDukHEUSqMyn9KoCaswRphycCoYs6MtQPCcskWBl3Plkn4cv5MkjorFXIlLgEfMdbMlQoVXj9yv8qkDanSYXDYicBQgjixfDq8g8-O4XgUgA */
  createMachine(
    {
      schema: {
        context: {} as Context,
      },
      context: { navigation: null } as Context,
      tsTypes:
        {} as import("./workspaceSettingsAccessMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loadingInitialData",
      states: {
        loadingInitialData: {
          invoke: {
            src: "loadInitialDataMachine",
            id: "loadInitialDataMachine",
            data: (context) => {
              return {
                returnOtherWorkspaceIfNotFound: false,
                returnOtherDocumentIfNotFound: true,
                workspaceId: context.workspaceId,
                navigation: context.navigation,
              };
            },
            onDone: [
              {
                target: "loadSettings",
              },
            ],
            onError: [{}],
          },
        },
        loadSettings: {
          type: "final",
        },
      },
      id: "loadWorkspaceSettings",
    },
    {
      services: {
        loadInitialDataMachine,
      },
    }
  );
