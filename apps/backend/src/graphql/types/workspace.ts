import { enumType, inputObjectType, list, nonNull, objectType } from "nexus";
import { CreatorDevice, Device, MinimalDevice } from "./device";

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
    t.nonNull.field("creatorDevice", { type: CreatorDevice });
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
    t.list.nonNull.field("workspaceKeyBoxes", {
      type: WorkspaceKeyBox,
    });
  },
});

export const MemberRoleEnum = enumType({
  name: "Role",
  members: {
    ADMIN: "ADMIN",
    EDITOR: "EDITOR",
    COMMENTER: "COMMENTER",
    VIEWER: "VIEWER",
  },
});

export const WorkspaceMember = objectType({
  name: "WorkspaceMember",
  definition(t) {
    t.nonNull.string("userId");
    t.string("username");
    t.nonNull.field("role", { type: MemberRoleEnum });
    t.list.nonNull.field("devices", { type: MinimalDevice });
  },
});

export const Workspace = objectType({
  name: "Workspace",
  definition(t) {
    t.nonNull.string("id");
    t.string("name");
    t.string("idSignature");
    t.string("infoCiphertext");
    t.string("infoNonce");
    t.string("infoWorkspaceKeyId");
    t.field("infoWorkspaceKey", { type: WorkspaceKey });
    t.list.nonNull.field("members", { type: WorkspaceMember });
    t.list.nonNull.field("workspaceKeys", { type: WorkspaceKey });
    t.field("currentWorkspaceKey", { type: WorkspaceKey });
  },
});

export const WorkspaceLoadingInfo = objectType({
  name: "WorkspaceLoadingInfo",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.boolean("isAuthorized");
    t.nonNull.field("role", { type: MemberRoleEnum });
    t.string("documentId");
  },
});

export const WorkspaceMemberInput = inputObjectType({
  name: "WorkspaceMemberInput",
  definition(t) {
    t.nonNull.string("userId");
    t.nonNull.field("role", { type: MemberRoleEnum });
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
    t.nonNull.string("invitationDataSignature");
    t.nonNull.string("invitationSigningPublicKey");
    t.nonNull.field("role", { type: MemberRoleEnum });
    t.string("workspaceName");
    t.field("expiresAt", { type: nonNull("Date") });
  },
});
