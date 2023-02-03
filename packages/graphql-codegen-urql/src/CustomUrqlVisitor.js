const {
  ClientSideBaseVisitor,
} = require("@graphql-codegen/visitor-plugin-common");
const { pascalCase } = require("change-case-all");

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
export const run${operationName} = async (variables: ${operationVariablesTypes}, options: any) => {
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
};`;
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
