import { assign, createMachine } from "xstate";
import { MeDocument, MeQuery, MeQueryVariables } from "../generated/graphql";
import { urqlClient } from "../utils/urqlClient/urqlClient";

const fetchMeWithWorkspaceLoadingInfo = async (context) => {
  const result = await urqlClient
    .query<MeQuery, MeQueryVariables>(
      MeDocument,
      {},
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  return result;
};

export const loadInitialDataMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBJAdgSwBc91kARdA9AOjUzxygGIJUcwr6A3VAa3YDMwBAMYALALQBbMAHVComagBOPWAAd0wsABkMEelFz9UiUGtSxCeVqZAAPRACYAjAHYqAFmcA2AKzOABmcPV1cAgIBOAGYAGhAAT0QADgiqQI8vV0cPSICogMcAX0K42mx8IhJySho9A0YwJSVlKjVkCmMlSSpBEQlpOQIFZVUNLV06BiMTJBBzSyIbWYcERwD3H2dfV29o72ckxySkuMTVpKpvJOcIryiPJNckgIzi0r1cKyqKajLIRgASgBRABiwIAygAJWzzKxLUArfIeKgvB4ve4pRwRRyxBKIA7I7IBbweI7eEnBPxvEBlT6VMg-HroPDIACuSjAgKBABUAQBNGEWOE4WwrRy+Ki3ZzZbzhZw3XxRZynJxrTy+K5JKL5WXkjzeYolEA4VAQOC2WkVYgMmplAyChbWEXLRABFUIXypCLe71K8WOLJRJLUy1fG2-PSQB3C0WIbbOKiPbbXCLHXbE93bKi+FxJPzhVxKrKuEMfK3fGr8ZlsjnRxbOhGIXbIiL+UIeCLBFIeXzuxzZS6BQvom5bAqlzB063VdB1p2xhDibLu8QeKJUfI58nejWuTsGw1AA */
  createMachine({
    context: { result: null },
    tsTypes: {} as import("./loadInitialData.typegen").Typegen0,
    predictableActionArguments: true,
    initial: "loading",
    states: {
      loading: {
        invoke: {
          src: fetchMeWithWorkspaceLoadingInfo,
          id: "fetch-meWithWorkspaceLoadingInfo",
          onDone: [
            {
              actions: assign({
                result: (_, event) => {
                  console.log("EVENT:", event);
                  return event.data;
                },
              }),
              target: "loaded",
            },
          ],
          onError: [
            {
              target: "failure",
            },
          ],
        },
      },
      loaded: {
        on: {
          REFRESH: {
            target: "loading",
          },
        },
      },
      failure: {
        on: {
          RETRY: {
            target: "loading",
          },
        },
      },
    },
    id: "loadInitialData",
  });
