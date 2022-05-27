import { inputObjectType, list, objectType } from "nexus";

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
