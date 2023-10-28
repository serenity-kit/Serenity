import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { version, workspaceIntegrityProofDomainContext } from "./constants";
import { WorkspaceIntegrityData, WorkspaceIntegrityProof } from "./types";

type VerificationParams = {
  workspaceIntegrityData: WorkspaceIntegrityData;
  authorPublicKey: string;
  workspaceIntegrityProof: WorkspaceIntegrityProof;
  pastKnownWorkspaceIntegrityProof?: WorkspaceIntegrityProof;
};

export const isValidWorkspaceIntegrityProof = ({
  workspaceIntegrityData,
  authorPublicKey,
  workspaceIntegrityProof,
  pastKnownWorkspaceIntegrityProof,
}: VerificationParams): boolean => {
  try {
    // new proofs are not valid and the client must be updated
    if (workspaceIntegrityProof.version > version) return false;

    // new proof is not valid since the version decreased
    if (
      pastKnownWorkspaceIntegrityProof &&
      workspaceIntegrityProof.version < pastKnownWorkspaceIntegrityProof.version
    )
      return false;

    // new proof is not valid since the clock didn't get increased
    if (
      pastKnownWorkspaceIntegrityProof &&
      workspaceIntegrityProof.clock <= pastKnownWorkspaceIntegrityProof.clock
    )
      return false;

    const workspaceIntegrityDataString = canonicalize({
      ...workspaceIntegrityData,
      version: workspaceIntegrityProof.version,
    });
    if (!workspaceIntegrityDataString)
      throw new Error("Failed to canonicalize the workspaceParams");

    const regeneratedHash = sodium.to_base64(
      sodium.crypto_generichash(64, workspaceIntegrityDataString)
    );

    if (regeneratedHash !== workspaceIntegrityProof.hash) {
      return false;
    }

    const message = canonicalize({
      hash: workspaceIntegrityProof.hash,
      workspaceIntegrityProofDomainContext,
    });
    if (typeof message !== "string") {
      throw new Error(
        "Failed to canonicalize the workspaceIntegrity proof signature message"
      );
    }

    return sodium.crypto_sign_verify_detached(
      sodium.from_base64(workspaceIntegrityProof.hashSignature),
      message,
      sodium.from_base64(authorPublicKey)
    );
  } catch (error) {
    console.error(error);
    return false;
  }
};
