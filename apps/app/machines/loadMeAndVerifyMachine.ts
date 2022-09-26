import { assign, createMachine } from "xstate";
import { MeQuery } from "../generated/graphql";
import { fetchMe } from "../graphql/fetchUtils/fetchMe";

export type MeQueryResult = {
  data?: MeQuery;
  error?: {
    networkError?: any;
  };
};

type Context = {
  navigation: any;
  meQueryResult?: MeQueryResult;
};

export const loadMeAndVerifyMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBJAdgSwBc91kARdA9AOjUzxygGIJUcwr6A3VAa3YDMwBAMYALALJhEoAA6pYhPK2kgAHogDMAJgCsVAIwB2QwAYAnGYAcJree2GANCACemw2aqWAbGa-aALF5+OkEAvqFOtNj4RCTklDQYEPRMYABOaahpVDLIFPxZALZUgiISUkggcgpEypXqCP7uVBqG-mYm-k2dZvo6Tq4IWmb+nv6W-lqWpp2WFuGRSbiKcRTUUZCMKtWKdaANE3qGGpOTlraGQY4uiFqGenM+-jp3fTr6-hoLIFHLsWRrEroPDIACuaTAjFUsEoBHY6H4cLSAApbCYTABKRi-GLEAEJfjAsEQ7byXY4FQNHT3Fq+fTafTeLomfo3IZGKjPDSWE6BHQsnk6cIREA4VAQOAqHErfHrJIpUk1JQU+qIfReLRUMzcnTacwmIJ+a6DWweMw6QJmS5tLQfLRfEXS-7xOWYSCK8mUxCXDyvdwmSwW1onAaIQKa8669UaD7ml7fJ14l1AkHgiqyMm1FX7b36fRawKXGzvIOhoa2qheIza4yfc6GdUJpa41YJLgkPAQADKcAUeyqmeVXoQ+k6JioBrzHy8JhjBrLuvHga8cx0Fo+xyFjubMuTnA73d7Q8qOyzw9HvS1WlsGh8th0vi8Zdveh8xi8hm8FgsDsWmD+SZrB6Z6qiO3JajqeodIarRlvShhah+7Q8hq2q2l4wqhEAA */
  createMachine(
    {
      context: { navigation: null } as Context,
      tsTypes: {} as import("./loadMeAndVerifyMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loading",
      states: {
        loading: {
          invoke: {
            src: "fetchMe",
            id: "fetchMe",
            onDone: [
              {
                actions: assign({
                  meQueryResult: (_, event) => event.data,
                }),
                cond: "hasNoNetworkError",
                target: "loaded",
              },
              {
                target: "failure",
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
          always: [
            {
              cond: "isValidSession",
              target: "validSession",
            },
            {
              target: "invalidSession",
            },
          ],
        },
        failure: {
          after: {
            "2000": {
              target: "loading",
            },
          },
        },
        invalidSession: {
          entry: "redirectToLogin",
          type: "final",
        },
        validSession: {
          type: "final",
        },
      },
      id: "loadInitialData",
    },
    {
      guards: {
        // @ts-ignore need to properly type this event
        hasNoNetworkError: (context, event: { data: QueryResult }) => {
          return !event.data?.error?.networkError;
        },
        isValidSession: (context) => {
          return Boolean(context.meQueryResult?.data?.me?.id);
        },
      },
      actions: {
        redirectToLogin: (context) => {
          context.navigation.replace("Login", {});
        },
      },
      services: {
        fetchMe: (context) => {
          return fetchMe();
        },
      },
    }
  );
