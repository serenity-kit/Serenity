import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { version, workspaceMemberDevicesProofDomainContext } from "./constants";
import { WorkspaceMemberDevicesProofData } from "./types";

type Params = {
  workspaceMemberDevicesProofData: WorkspaceMemberDevicesProofData;
  authorKeyPair: sodium.KeyPair;
};

export const createWorkspaceMemberDevicesProof = ({
  workspaceMemberDevicesProofData,
  authorKeyPair,
}: Params) => {
  const workspaceMemberDevicesProofDataWithVersion = {
    ...workspaceMemberDevicesProofData,
    version,
  };
  const workspaceDataString = canonicalize(
    workspaceMemberDevicesProofDataWithVersion
  );

  if (!workspaceDataString)
    throw new Error("Failed to canonicalize the workspaceParams");
  const hash = sodium.to_base64(
    sodium.crypto_generichash(64, workspaceDataString)
  );

  const message = canonicalize({
    hash,
    workspaceMemberDevicesProofDomainContext,
  });
  if (typeof message !== "string") {
    throw new Error(
      "Failed to canonicalize the workspaceMemberDevicesProof proof signature message"
    );
  }
  const hashSignature = sodium.to_base64(
    sodium.crypto_sign_detached(message, authorKeyPair.privateKey)
  );
  return {
    hash,
    hashSignature,
    version,
    clock: workspaceMemberDevicesProofData.clock,
  };
};