import { objectType } from "nexus";

export const WorkspaceMemberDevicesProofContent = objectType({
  name: "WorkspaceMemberDevicesProofContent",
  definition(t) {
    t.nonNull.string("hash");
    t.nonNull.string("hashSignature");
    t.nonNull.int("version");
    t.nonNull.int("clock");
  },
});

export const WorkspaceMemberDevicesProof = objectType({
  name: "WorkspaceMemberDevicesProof",
  definition(t) {
    t.nonNull.string("serializedData");
    t.nonNull.field("proof", { type: WorkspaceMemberDevicesProofContent });
    t.nonNull.string("workspaceId");
  },
});