import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { version, workspaceIntegrityProofDomainContext } from "./constants";
import { WorkspaceIntegrityData } from "./types";

type Params = {
  workspaceIntegrityData: WorkspaceIntegrityData;
  authorKeyPair: sodium.KeyPair;
};

export const createWorkspaceIntegrityProof = ({
  workspaceIntegrityData,
  authorKeyPair,
}: Params) => {
  const workspaceIntegrityDataWithVersion = {
    ...workspaceIntegrityData,
    version,
  };
  const workspaceDataString = canonicalize(workspaceIntegrityDataWithVersion);
  if (!workspaceDataString)
    throw new Error("Failed to canonicalize the workspaceParams");
  const hash = sodium.to_base64(
    sodium.crypto_generichash(64, workspaceDataString)
  );

  const message = canonicalize({ hash, workspaceIntegrityProofDomainContext });
  if (typeof message !== "string") {
    throw new Error(
      "Failed to canonicalize the workspaceIntegrity proof signature message"
    );
  }
  const hashSignature = sodium.to_base64(
    sodium.crypto_sign_detached(message, authorKeyPair.privateKey)
  );
  return {
    hash,
    hashSignature,
    version,
    clock: workspaceIntegrityData.clock,
  };
};
