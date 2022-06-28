import { scalarType } from "nexus";

export const DateScalar = scalarType({
  name: "Date",
  serialize: (value) => (value as Date).toISOString(),
  parseValue: (value) => new Date(value as string | number),
  parseLiteral: (ast) => {
    if (ast.kind === "IntValue" || ast.kind === "StringValue") {
      const d = new Date(ast.value);
      if (!isNaN(d.valueOf())) {
        return d;
      }
    }
    throw new Error("Invalid date");
  },
  asNexusMethod: "date",
  sourceType: "Date",
});
