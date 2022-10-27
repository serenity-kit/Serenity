import { concatAST, Kind } from "graphql";
import { oldVisit } from "@graphql-codegen/plugin-helpers";
import { CustomUrqlVisitor } from "./CustomUrqlVisitor";

// import { pipe, subscribe } from "wonka";
// useEffect(() => {
//   // https://github.com/FormidableLabs/urql/blob/d45789f5b71c674eb4c4dc76c42f2142427ce408/docs/api/core.md#clientquery
//   pipe(
//     client.query(MeDocument, {}),
//     subscribe((result) => {
//       console.log(result); // OperationResult
//     })
//   );
// }, []);
//

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
      ],
      content: [
        ...visitorResult.definitions.filter(
          (content) => typeof content === "string"
        ),
      ].join("\n"),
    };
  },
};
