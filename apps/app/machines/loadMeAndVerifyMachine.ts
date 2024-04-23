import { assign, fromPromise, setup } from "xstate";
import { MeQuery, runMeQuery } from "../generated/graphql";

export type MeQueryResult = {
  data?: MeQuery;
  error?: {
    networkError?: any;
  };
};

type Input = {
  navigation: any;
};

type Context = {
  navigation: any;
  meQueryResult?: MeQueryResult;
};

export const loadMeAndVerifyMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBZMBBAdhAGpgBOAlgGYCeAdGpuflAMQSr5i1MBuqA1l0pgALgGMAFjkSgADqljkR5DjJAAPRAGYATAFZaARgDsxgAwBOCwA4zOy7uMAaENW3GLtawDYL33QAs3v56wQC+YS4M2HiEJBQ09BgQTKxkpKiktLLI6CKUmQC2tMLiUmBq8orKqkgaiAEetFrGARZmAY0dFoZ6Lm4IOhYBXgHWATrW5h3WVhFRyTgExGRUdNGQLJUKSir4apoI4wbGWhMT1vbGwc6uiDrGBrO+AXoPvXqGAVrzINFLcVWiUo6HIyAArqQwCx1LARHkuOhKCIyAAKexmMwAShY-1iKwSdBBYMhFTqVV2tVAhz0j2afkMukMPk6Zj6d0GJlory01jOQT0bL5egikRA+FQEDgajxy3iaySjGY22qewOiEM3h0tAsvL0uksZmC-luA3sngseiCFmurR0Xx0PzFssBhMVUogKsp+zqh2unneHjM1itLTO-QaWq8+i0mtjbT0b1+LoJCuJEKhXpqPupiGMhkMOqC1zsn1DEcG9to3hMutM30u+e8ycW+PliV46GQ5AgAGU4IoqSAKdn1QhDB0zLQjQWvt4zLGjRX9VOQ95ZomAl9TiLna25UC6Dwuz3+7BBznhztR76NZZCxYdPYtL57Ho-N4Ky+DL5TN5jD4VhWE6CyYACqY0Fmaq3uOvI6nqBrtMaLQVoyxg6v+bQFg876PLuERAA */
  setup({
    types: {} as {
      context: Context;
      input: Input;
    },
    guards: {
      hasNoNetworkError: ({ event }) => {
        return !event.data?.error?.networkError;
      },
      isValidSession: ({ context }) => {
        return Boolean(context.meQueryResult?.data?.me?.id);
      },
    },
    actions: {
      redirectToLogin: ({ context }) => {
        context.navigation.replace("Login", {});
      },
    },
    actors: {
      fetchMe: fromPromise(() => {
        return runMeQuery({});
      }),
    },
  }).createMachine({
    context: ({ input }) => ({
      navigation: input.navigation,
    }),
    initial: "loading",
    states: {
      loading: {
        invoke: {
          src: "fetchMe",
          id: "fetchMe",
          onDone: [
            {
              actions: assign({
                meQueryResult: ({ event }) => event.output,
              }),
              guard: "hasNoNetworkError",
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
            guard: "isValidSession",
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
  });
