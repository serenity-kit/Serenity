import canonicalize from "canonicalize";
import { OperationResult } from "urql";
import { MeDocument, MeQuery, MeQueryVariables } from "../../generated/graphql";
import { getUrqlClient } from "../../utils/urqlClient/urqlClient";

/**
 * This service is used to query the me query every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the me query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export type MeQueryResult = OperationResult<MeQuery, MeQueryVariables>;

export type MeQueryServiceEvent =
  | {
      type: "UPDATE_RESULT";
      result: MeQueryResult;
    }
  | {
      type: "ERROR";
      result: MeQueryResult;
    };

type MeQueryServiceSubscribersEntry = {
  variables: MeQueryVariables;
  callbacks: ((event: MeQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type MeQueryServiceSubscribers = {
  [variables: string]: MeQueryServiceSubscribersEntry;
};

const meQueryServiceSubscribers: MeQueryServiceSubscribers = {};

const meQuery = (variablesString: string, variables: MeQueryVariables) => {
  getUrqlClient()
    .query<MeQuery, MeQueryVariables>(MeDocument, variables)
    .toPromise()
    .then((result) => {
      if (result.error) {
        meQueryServiceSubscribers[variablesString].callbacks.forEach(
          (callback) => {
            callback({ type: "ERROR", result: result });
          }
        );
      } else {
        meQueryServiceSubscribers[variablesString].callbacks.forEach(
          (callback) => {
            callback({ type: "UPDATE_RESULT", result });
          }
        );
      }
    });
};

export const meQueryService =
  (variables?: MeQueryVariables) => (callback, onReceive) => {
    const normalizedVariables = variables || {};
    const variablesString = canonicalize(variables || {}) as string;
    if (meQueryServiceSubscribers[variablesString]) {
      meQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      meQueryServiceSubscribers[variablesString] = {
        variables: normalizedVariables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    meQuery(variablesString, normalizedVariables);
    if (!meQueryServiceSubscribers[variablesString].intervalId) {
      meQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          meQuery(variablesString, normalizedVariables);
        },
        4000
      );
    }

    const intervalId = meQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        meQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        meQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };
