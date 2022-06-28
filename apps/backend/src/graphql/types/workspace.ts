import { inputObjectType, list, nonNull, objectType } from "nexus";

export const WorkspaceMember = objectType({
  name: "WorkspaceMember",
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
      type: WorkspaceMember,
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

export const WorkspaceInvitation = objectType({
  name: "WorkspaceInvitation",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceId");
    t.nonNull.string("inviterUserId");
    t.nonNull.string("inviterUsername");
    t.string("workspaceName");
    t.field("expiresAt", { type: nonNull("Date") });
  },
});
