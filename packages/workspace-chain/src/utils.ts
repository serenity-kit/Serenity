import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import { workspaceChainDomainContext } from "./constants";
import {
  UpdateChainWorkspaceChainEvent,
  WorkspaceChainEvent,
  WorkspaceChainState,
} from "./types";

export const hashTransaction = (transaction) => {
  const value = canonicalize(transaction);
  if (!value) throw new Error("Failed to hash the transaction");
  return sodium.to_base64(sodium.crypto_generichash(64, value));
};

export const isValidCreateChainEvent = (event: WorkspaceChainEvent) => {
  if (event.transaction.type !== "create" || event.prevHash !== null) {
    return false;
  }

  const hash = hashTransaction(event.transaction);
  const message = canonicalize({
    prevHash: null,
    hash,
  });
  if (typeof message !== "string") {
    throw new Error("Could not canonicalize hashes");
  }

  return event.authors.every((author) => {
    return sodium.crypto_sign_verify_detached(
      sodium.from_base64(author.signature),
      workspaceChainDomainContext + message,
      sodium.from_base64(author.publicKey)
    );
  });
};

export const allAuthorsAreValidAdmins = (
  state: WorkspaceChainState,
  event: UpdateChainWorkspaceChainEvent
) => {
  return event.authors.every((author) => {
    if (!state.members.hasOwnProperty(author.publicKey)) {
      return false;
    }
    if (state.members[author.publicKey].role !== "ADMIN") {
      return false;
    }
    return true;
  });
};

export const getAdminCount = (state: WorkspaceChainState) => {
  let adminCount = 0;
  Object.keys(state.members).forEach((memberKey) => {
    if (state.members[memberKey].role === "ADMIN") {
      adminCount = adminCount + 1;
    }
  });
  return adminCount;
};

export const isValidAdminDecision = (
  state: WorkspaceChainState,
  event: UpdateChainWorkspaceChainEvent
) => {
  if (!allAuthorsAreValidAdmins(state, event)) {
    return false;
  }
  if (event.authors.length > 0) {
    return true;
  }
  // Mode where a majority is needed:
  //
  // const adminCount = getAdminCount(state);
  // if (event.authors.length > adminCount / 2) {
  //   return true;
  // }
  return false;
};
