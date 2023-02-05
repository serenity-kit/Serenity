import { assign, createMachine, spawn } from "xstate";
import {
  MeQueryResult,
  meQueryService,
  MeQueryServiceEvent,
  MeQueryUpdateResultEvent,
} from "./meQueryService";

type Context = {
  result?: MeQueryResult;
  meQueryActor: any;
};

export const accountMenuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMDGqD2BXAdgFwFkwcsC0ALASxzADpKIAbMAYgGUAVAQQCUOBtAAwBdRKAAOGWJTyUMOMSAAeiALQAWAOy0AzAE4dARnUAOdYZODDOkwDYArABoQAT0QWdtTbfMmTmzQsAJh8AX1DnNExcQmJSCmo6BmYWAFUABQARLg4AUQB9Hly2VIAZARFFSWlZeUUVBHUg5zcEE0NaU3tbTXt2w29ek3CIkBwMCDhFKOx8IhIyVCoaKqkZOQUkZTU9e10DYzMLKxtNFrU9vSu9P3smoPV7A3DI9FnYhYSaeiYwVZqNvVEPZPLYrN0gk5XIggpoTLQDLZDHpDPY+iYdJo9CNQkA */
  createMachine(
    {
      schema: {
        events: {} as MeQueryServiceEvent,
        context: {} as Context,
      },
      tsTypes: {} as import("./accountMenuMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "idle",
      states: {
        idle: {
          entry: ["spawnMeQueryService"],
          on: {
            UPDATE_RESULT: {
              actions: [
                assign({
                  result: (_, event: MeQueryUpdateResultEvent) => event.result,
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
        spawnMeQueryService: assign({
          meQueryActor: () => {
            return spawn(meQueryService());
          },
        }),
      },
    }
  );
