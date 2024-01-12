import { verifyFolderNameSignature } from "@serenity-tools/common";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createFolder } from "../../../database/folder/createFolder";
import { getWorkspaceMemberDevicesProof } from "../../../database/workspace/getWorkspaceMemberDevicesProof";
import { formatFolder } from "../../../types/folder";
import { Folder } from "../../types/folder";
import { KeyDerivationTraceInput } from "../../types/keyDerivation";

export const CreateFolderInput = inputObjectType({
  name: "CreateFolderInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("nameCiphertext");
    t.nonNull.string("nameNonce");
    t.nonNull.string("signature");
    t.nonNull.string("workspaceKeyId");
    t.nonNull.string("subkeyId");
    t.nonNull.string("workspaceMemberDevicesProofHash");
    t.string("parentFolderId");
    t.nonNull.string("workspaceId");
    t.nonNull.field("keyDerivationTrace", { type: KeyDerivationTraceInput });
  },
});

export const CreateFolderResult = objectType({
  name: "CreateFolderResult",
  definition(t) {
    t.field("folder", { type: Folder });
  },
});

export const createFolderMutation = mutationField("createFolder", {
  type: CreateFolderResult,
  args: {
    input: nonNull(
      arg({
        type: CreateFolderInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }

    const workspaceMemberDevicesProof = await getWorkspaceMemberDevicesProof({
      workspaceId: args.input.workspaceId,
      userId: context.user.id,
    });

    let authorDeviceSigningPublicKey = context.session.deviceSigningPublicKey;
    const validSignature = verifyFolderNameSignature({
      ciphertext: args.input.nameCiphertext,
      nonce: args.input.nameNonce,
      signature: args.input.signature,
      authorSigningPublicKey: context.session.deviceSigningPublicKey,
      folderId: args.input.id,
      workspaceId: args.input.workspaceId,
      workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
      keyDerivationTrace: args.input.keyDerivationTrace,
    });

    if (!validSignature) {
      const validSignatureForMainDevice = verifyFolderNameSignature({
        ciphertext: args.input.nameCiphertext,
        nonce: args.input.nameNonce,
        signature: args.input.signature,
        authorSigningPublicKey: context.user.mainDeviceSigningPublicKey,
        folderId: args.input.id,
        workspaceId: args.input.workspaceId,
        workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
        keyDerivationTrace: args.input.keyDerivationTrace,
      });
      if (validSignatureForMainDevice) {
        authorDeviceSigningPublicKey = context.user.mainDeviceSigningPublicKey;
      } else {
        throw new Error("Invalid signature");
      }
    }

    const folder = await createFolder({
      userId: context.user.id,
      id: args.input.id,
      nameCiphertext: args.input.nameCiphertext,
      nameNonce: args.input.nameNonce,
      signature: args.input.signature,
      workspaceMemberDevicesProofHash:
        args.input.workspaceMemberDevicesProofHash,
      workspaceKeyId: args.input.workspaceKeyId,
      subkeyId: args.input.subkeyId,
      parentFolderId: args.input.parentFolderId || undefined,
      workspaceId: args.input.workspaceId,
      keyDerivationTrace: args.input.keyDerivationTrace,
      authorDeviceSigningPublicKey,
    });
    return { folder: formatFolder(folder) };
  },
});
