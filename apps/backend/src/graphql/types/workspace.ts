import { inputObjectType, list, nonNull, objectType, scalarType } from "nexus";

export const WorkspaceMembersOutput = objectType({
  name: "WorkspaceMembersOutput",
  definition(t) {
    t.nonNull.string("userId");
    t.string("username");
    t.nonNull.boolean("isAdmin");
  },
});

export const Workspace = objectType({
  name: "Workspace",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
    t.list.nonNull.field("members", {
      type: WorkspaceMembersOutput,
    });
  },
});

export const WorkspaceMemberInput = inputObjectType({
  name: "WorkspaceMemberInput",
  definition(t) {
    t.nonNull.string("userId");
    t.nonNull.boolean("isAdmin");
  },
});

export const WorkspaceInput = inputObjectType({
  name: "WorkspaceInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.field("sharing", {
      type: list(WorkspaceMemberInput),
    });
  },
});

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

export const WorkspaceInvitation = objectType({
  name: "WorkspaceInvitation",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceId");
    t.nonNull.string("inviterUserId");
    t.field("expiresAt", { type: nonNull("Date") });
  },
});
