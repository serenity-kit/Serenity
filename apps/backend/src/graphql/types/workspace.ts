import { inputObjectType, list, nonNull, objectType } from "nexus";
import { Device } from "./device";

export const MemberIdWithDevice = objectType({
  name: "WorkspaceIdWithDevices",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.list.nonNull.field("devices", { type: Device });
  },
});

export const WorkspaceIdWithMemberDevices = objectType({
  name: "WorkspaceIdWithMemberDevices",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.list.nonNull.field("members", { type: MemberIdWithDevice });
  },
});

export const WorkspaceKeyBox = objectType({
  name: "WorkspaceKeyBox",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("creatorDeviceSigningPublicKey");
    t.nonNull.string("nonce");
    t.nonNull.string("ciphertext");
  },
});

export const WorkspaceKey = objectType({
  name: "WorkspaceKey",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("workspaceId");
    t.nonNull.int("generation");
    t.field("workspaceKeyBox", {
      type: WorkspaceKeyBox,
    });
  },
});

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
    t.field("currentWorkspaceKey", {
      type: WorkspaceKey,
    });
    t.list.nonNull.field("workspaceKeys", { type: WorkspaceKey });
    t.list.nonNull.field("members", { type: WorkspaceMember });
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
