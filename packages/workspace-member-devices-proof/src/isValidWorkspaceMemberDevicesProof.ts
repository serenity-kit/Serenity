import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { version, workspaceMemberDevicesProofDomainContext } from "./constants";
import {
  WorkspaceMemberDevicesProof,
  WorkspaceMemberDevicesProofData,
} from "./types";

type VerificationParams = {
  workspaceMemberDevicesProofData: WorkspaceMemberDevicesProofData;
  authorPublicKey: string;
  workspaceMemberDevicesProof: WorkspaceMemberDevicesProof;
  pastKnownWorkspaceMemberDevicesProof?: WorkspaceMemberDevicesProof;
};

export const isValidWorkspaceMemberDevicesProof = ({
  workspaceMemberDevicesProofData,
  authorPublicKey,
  workspaceMemberDevicesProof,
  pastKnownWorkspaceMemberDevicesProof,
}: VerificationParams): boolean => {
  try {
    // new proofs are not valid and the client must be updated
    if (workspaceMemberDevicesProof.version > version) return false;

    // new proof is not valid since the version decreased
    if (
      pastKnownWorkspaceMemberDevicesProof &&
      workspaceMemberDevicesProof.version <
        pastKnownWorkspaceMemberDevicesProof.version
    )
      return false;

    // new proof is not valid since the clock didn't get increased
    if (
      pastKnownWorkspaceMemberDevicesProof &&
      workspaceMemberDevicesProof.clock <=
        pastKnownWorkspaceMemberDevicesProof.clock
    )
      return false;

    const workspaceMemberDevicesProofDataString = canonicalize({
      ...workspaceMemberDevicesProofData,
      version: workspaceMemberDevicesProof.version,
    });
    if (!workspaceMemberDevicesProofDataString)
      throw new Error("Failed to canonicalize the workspaceParams");

    const regeneratedHash = sodium.to_base64(
      sodium.crypto_generichash(64, workspaceMemberDevicesProofDataString)
    );

    if (regeneratedHash !== workspaceMemberDevicesProof.hash) {
      return false;
    }

    return sodium.crypto_sign_verify_detached(
      sodium.from_base64(workspaceMemberDevicesProof.hashSignature),
      workspaceMemberDevicesProofDomainContext +
        workspaceMemberDevicesProof.hash,
      sodium.from_base64(authorPublicKey)
    );
  } catch (error) {
    console.error(error);
    return false;
  }
};
