const {
  ClientSideBaseVisitor,
} = require("@graphql-codegen/visitor-plugin-common");
const { pascalCase } = require("change-case-all");

const lowercaseFirstLetter = (value) => {
  return value.charAt(0).toLowerCase() + value.slice(1);
};

class CustomUrqlVisitor extends ClientSideBaseVisitor {
  buildPromise = (
    node,
    operationType,
    documentVariableName,
    operationResultType,
    operationVariablesTypes,
    hasRequiredVariables
  ) => {
    const operationName = this.convertName(node.name?.value ?? "", {
      suffix: this.getOperationSuffix(node, operationType),
      useTypesPrefix: false,
    });

    if (operationType === "Mutation") {
      return `
export const run${operationName} = async (variables: ${operationVariablesTypes}, options?: any) => {
  return await getUrqlClient()
    .mutation<${operationResultType}, ${operationVariablesTypes}>(
      ${documentVariableName},
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};`;
    }

    const lowerCaseOperationName = lowercaseFirstLetter(operationName);
    return `
export const run${operationName} = async (variables: ${operationVariablesTypes}, options?: any) => {
  return await getUrqlClient()
    .query<${operationResultType}, ${operationVariablesTypes}>(
      ${documentVariableName},
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type ${operationName}Result = Urql.OperationResult<${operationResultType}, ${operationVariablesTypes}>;

export type ${operationName}UpdateResultEvent = {
  type: "${operationName}.UPDATE_RESULT";
  result: ${operationName}Result;
};

export type ${operationName}ErrorEvent = {
  type: "${operationName}.ERROR";
  result: ${operationName}Result;
};

export type ${operationName}ServiceEvent = ${operationName}UpdateResultEvent | ${operationName}ErrorEvent;

type ${operationName}ServiceSubscribersEntry = {
  variables: ${operationName}Variables;
  callbacks: ((event: ${operationName}ServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type ${operationName}ServiceSubscribers = {
  [variables: string]: ${operationName}ServiceSubscribersEntry;
};

const ${lowerCaseOperationName}ServiceSubscribers: ${operationName}ServiceSubscribers = {};

const trigger${operationName} = (variablesString: string, variables: ${operationVariablesTypes}) => {
  getUrqlClient()
    .query<${operationName}, ${operationVariablesTypes}>(${documentVariableName}, variables)
    .toPromise()
    .then((result) => {
      ${lowerCaseOperationName}ServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "${operationName}.ERROR" : "${operationName}.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const ${lowerCaseOperationName}Service =
  (variables: ${operationVariablesTypes}, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (${lowerCaseOperationName}ServiceSubscribers[variablesString]) {
      ${lowerCaseOperationName}ServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      ${lowerCaseOperationName}ServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    trigger${operationName}(variablesString, variables);
    if (!${lowerCaseOperationName}ServiceSubscribers[variablesString].intervalId) {
      ${lowerCaseOperationName}ServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          trigger${operationName}(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = ${lowerCaseOperationName}ServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        ${lowerCaseOperationName}ServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        ${lowerCaseOperationName}ServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };

`;
  };

  buildOperation = (
    node,
    documentVariableName,
    operationType,
    operationResultType,
    operationVariablesTypes
  ) => {
    const promises = this.buildPromise(
      node,
      operationType,
      documentVariableName,
      operationResultType,
      operationVariablesTypes
    );

    return [promises].filter((entry) => entry).join("\n");
  };

  // see https://github.com/dotansimha/graphql-code-generator/blob/8473682c48559382b0a3edd4a494aeaf1c5b99ff/packages/plugins/other/visitor-plugin-common/src/client-side-base-visitor.ts#L653
  OperationDefinition(node) {
    this._collectedOperations.push(node);

    const documentVariableName = this.getOperationVariableName(node);

    const operationType = pascalCase(node.operation);
    const operationTypeSuffix = this.getOperationSuffix(node, operationType);

    const operationResultType = this.convertName(node, {
      suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
    });
    const operationVariablesTypes = this.convertName(node, {
      suffix: operationTypeSuffix + "Variables",
    });

    const hasRequiredVariables = this.checkVariablesRequirements(node);

    const additional = this.buildOperation(
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
      hasRequiredVariables
    );

    return [additional].filter((a) => a).join("\n");
  }
}

module.exports = {
  CustomUrqlVisitor,
};
