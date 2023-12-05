import { deriveSessionAuthorization } from "@serenity-tools/common";
import { devtoolsExchange } from "@urql/devtools";
import { authExchange } from "@urql/exchange-auth";
import { cacheExchange } from "@urql/exchange-graphcache";
import { Client, createClient, fetchExchange } from "urql";
import * as SessionKeyStore from "../../store/sessionKeyStore/sessionKeyStore";
import { getEnvironmentUrls } from "../getEnvironmentUrls/getEnvironmentUrls";

const unauthenticatedOperation = [
  "startRegistration",
  "finishRegistration",
  "startLogin",
  "finishLogin",
];

const exchanges = [
  cacheExchange({
    keys: {
      CreatorDevice: () => null, // since it has no unique key
      UnauthorizedMemberResult: () => null, // since it has no unique key
      PendingWorkspaceInvitationResult: () => null, // since it is just an id
      KeyDerivationTrace: () => null, // should not be normalized
      KeyDerivationTraceEntry: () => null, // should not be normalized
      WorkspaceKeyByDocumentIdResult: () => null, // should not be normalized
      WorkspaceChainEvent: () => null, // should not be normalized
      DocumentChainEvent: () => null, // should not be normalized
      UserChainEvent: () => null, // should not be normalized
      EncryptedWebDeviceResult: () => null, // should not be normalized
      WorkspaceMemberDevicesProofContent: () => null, // should not be normalized
      WorkspaceMemberDevicesProof: () => null, // should not be normalized
      // @ts-expect-error the type seems to be wrong,
      DocumentShareLinkForSharePage: (shareLink) => shareLink.token,
      // @ts-expect-error the type seems to be wrong,
      MainDeviceResult: (mainDevice) => {
        return mainDevice.signingPublicKey;
      },
      // @ts-expect-error the type seems to be wrong
      Device: (device) => {
        return device.signingPublicKey;
      },
      Session: () => null,
      // @ts-expect-error the type seems to be wrong
      DocumentShareLink: (documentShareLink) => {
        return documentShareLink.token;
      },
    },
  }),
  authExchange(async (utils) => {
    const sessionKey = await SessionKeyStore.getSessionKey();

    return {
      willAuthError: (operation) => {
        // detect the unauthenticated mutations and let this operations through
        return (
          sessionKey !== null ||
          !(
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
          )
        );
      },
      didAuthError: () => false,
      refreshAuth: async () => {},
      addAuthToOperation: (operation) => {
        if (sessionKey) {
          const sessionAuthorization = deriveSessionAuthorization({
            sessionKey,
          }).authorization;
          return utils.appendHeaders(operation, {
            Authorization: sessionAuthorization,
          });
        }
        return operation;
      },
    };
  }),
  fetchExchange,
];

const createUrqlClient = () => {
  const { graphqlEndpoint } = getEnvironmentUrls();

  return createClient({
    url: graphqlEndpoint,
    requestPolicy: "cache-and-network",
    exchanges:
      process.env.NODE_ENV === "development"
        ? [devtoolsExchange, ...exchanges]
        : exchanges,
  });
};

let urqlClient: Client = createUrqlClient();

export const getUrqlClient = () => urqlClient;

export const recreateClient = () => {
  urqlClient = createUrqlClient();
  return urqlClient;
};
