import { inputObjectType, objectType } from "nexus";
import { WorkspaceKeyBox } from "./workspace";

export const WorkspaceDeviceInput = inputObjectType({
  name: "WorkspaceDeviceInput",
  definition(t) {
    t.nonNull.string("receiverDeviceSigningPublicKey");
    t.nonNull.string("nonce");
    t.nonNull.string("ciphertext");
  },
});

export const MemberDeviceParingInput = inputObjectType({
  name: "MemberDeviceParingInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.list.nonNull.field("workspaceDevices", {
      type: WorkspaceDeviceInput,
    });
  },
});

export const WorkspaceDevicePairingInput = inputObjectType({
  name: "WorkspaceDevicePairingInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.list.nonNull.field("members", {
      type: MemberDeviceParingInput,
    });
  },
});

export const MemberWithWorkspaceKeyBoxes = objectType({
  name: "MemberWithWorkspaceKeyBoxes",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.list.nonNull.field("workspaceKeyBoxes", {
      type: WorkspaceKeyBox,
    });
  },
});

export const WorkspaceKeyWithMembers = objectType({
  name: "WorkspaceKeyWithMembers",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.int("generation");
    t.nonNull.list.nonNull.field("members", {
      type: MemberWithWorkspaceKeyBoxes,
    });
  },
});

export const WorkspaceWithWorkspaceKeys = objectType({
  name: "WorkspaceWithWorkspaceKeys",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.list.nonNull.field("workspaceKeys", {
      type: WorkspaceKeyWithMembers,
    });
  },
});
