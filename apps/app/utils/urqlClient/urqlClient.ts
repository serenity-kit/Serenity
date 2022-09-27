import { devtoolsExchange } from "@urql/devtools";
import { authExchange } from "@urql/exchange-auth";
import { cacheExchange } from "@urql/exchange-graphcache";
import Constants from "expo-constants";
import { createClient, dedupExchange, fetchExchange } from "urql";
import * as SessionKeyStore from "../authentication/sessionKeyStore";

type AuthState = {
  sessionKey: string;
};

const unauthenticatedOperation = [
  "startRegistration",
  "finishRegistration",
  "startLogin",
  "finishLogin",
];

const exchanges = [
  dedupExchange,
  cacheExchange({
    keys: {
      WorkspaceMember: () => null, // since it has no unique key
      CreatorDevice: () => null, // since it has no unique key
      UnauthorizedMembersResult: () => null, // since it has no unique key
      // @ts-expect-error the type seems to be wrong
      MainDeviceResult: (mainDevice) => {
        return mainDevice.signingPublicKey;
      },
      // @ts-expect-error the type seems to be wrong
      Device: (device) => {
        return device.signingPublicKey;
      },
    },
  }),
  authExchange<AuthState>({
    // if it fails it will run getAuth again and see if the client already logged in in the meantime
    willAuthError: ({ operation, authState }) => {
      if (!authState) {
        // detect the unauthenticated mutations and let this operations through
        return !(
          operation.kind === "mutation" &&
          operation.query.definitions.some((definition) => {
            return (
              definition.kind === "OperationDefinition" &&
              definition.selectionSet.selections.some((node) => {
                return (
                  node.kind === "Field" &&
                  unauthenticatedOperation.includes(node.name.value)
                );
              })
            );
          })
        );
      }

      return false;
    },
    getAuth: async ({ authState }) => {
      if (!authState) {
        // check for login
        try {
          const sessionKey = await SessionKeyStore.getSessionKey();
          if (sessionKey) {
            return { sessionKey };
          }
        } catch (err) {
          // TODO: explain why fetching the sessionKey failed
          console.error(err);
        }
      }

      return null;
    },
    addAuthToOperation: ({ authState, operation }) => {
      if (!authState || !authState.sessionKey) {
        return operation;
      }
      const fetchOptions =
        typeof operation.context.fetchOptions === "function"
          ? operation.context.fetchOptions()
          : operation.context.fetchOptions || {};

      return {
        ...operation,
        context: {
          ...operation.context,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              Authorization: authState.sessionKey,
            },
          },
        },
      };
    },
  }),
  fetchExchange,
];

const createUrqlClient = () =>
  createClient({
    url: Constants.manifest?.extra?.apiUrl,
    requestPolicy: "cache-and-network",
    exchanges:
      process.env.NODE_ENV === "development"
        ? [devtoolsExchange, ...exchanges]
        : exchanges,
  });

export let urqlClient = createUrqlClient();

export const recreateClient = () => {
  urqlClient = createUrqlClient();
  return urqlClient;
};