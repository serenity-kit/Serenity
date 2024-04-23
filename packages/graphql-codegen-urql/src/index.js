const { concatAST, Kind } = require("graphql");
const { oldVisit } = require("@graphql-codegen/plugin-helpers");
const { CustomUrqlVisitor } = require("./CustomUrqlVisitor");

module.exports = {
  plugin(schema, documents, config, info) {
    const allAst = concatAST(documents.map((v) => v.document));
    const allFragments = [
      ...allAst.definitions
        .filter((d) => d.kind === Kind.FRAGMENT_DEFINITION)
        .map((fragmentDef) => ({
          node: fragmentDef,
          name: fragmentDef.name.value,
          onType: fragmentDef.typeCondition.name.value,
          isExternal: false,
        })),
      ...(config.externalFragments || []),
    ];

    const visitor = new CustomUrqlVisitor(schema, allFragments, config);
    const visitorResult = oldVisit(allAst, { leave: visitor });

    return {
      prepend: [
        "import { getUrqlClient } from '../utils/urqlClient/urqlClient';",
        "import canonicalize from 'canonicalize';",
        "import { fromCallback } from 'xstate';",
      ],
      content: [
        ...visitorResult.definitions.filter(
          (content) => typeof content === "string"
        ),
      ].join("\n"),
    };
  },
};
