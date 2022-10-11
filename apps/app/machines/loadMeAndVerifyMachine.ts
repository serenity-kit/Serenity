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
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBZMBBAdhAGpgBOAlgGYCeAdGpuflAMQSr5i1MBuqA1l0pgALgGMAFjkSgADqljkR5DjJAAPRAGYATAFZaARgDsxgAwBOCwA4zOy7uMAaENW3GLtawDYL33QAs3v56wQC+YS4M2HiEJBQ09BgQTKxkpKiktLLI6CKUmQC2tMLiUmBq8orKqkgaiAEetFrGARZmAY0dFoZ6Lm4IOhYBXgHWATrW5h3WVhFRyTgExGRUdNGQLJUKSir4apoI4wbGWhMT1vbGwc6uiDrGBrO+AXoPvXqGAVrzINFLcVWiUo6HIyAArqQwCx1LARHkuOhKCIyAAKexmMwAShY-1iKwSdBBYMhFTqVV2tVAhz0j2afkMukMPk6Zj6d0GJlory01jOQT0bL5egikRA+FQEDgajxy3iaySjGY22qewOiEM3h0tAsvL0uksZmC-luA3sngseiCFmurR0Xx0PzFssBhMVUogKsp+zqh2unneHjM1itLTO-QaWq8+i0mtjbT0b1+LoJCuJEKhXpqPupiGMhkMOqC1zsn1DEcG9to3hMutM30u+e8ycW+PliV46GQ5AgAGU4IoqSAKdn1QhDB0zLQjQWvt4zLGjRX9VOQ95ZomAl9TiLna25UC6Dwuz3+7BBznhztR76NZZCxYdPYtL57Ho-N4Ky+DL5TN5jD4VhWE6CyYACqY0Fmaq3uOvI6nqBrtMaLQVoyxg6v+bQFg876PLuERAA */
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
      id: "loadMeAndVerify",
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
