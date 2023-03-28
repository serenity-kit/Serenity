import canonicalize from "canonicalize";
import sodium from "react-native-libsodium";
import {
  DefaultTrustChainEvent,
  TrustChainEvent,
  TrustChainState,
} from "./types";

export const hashTransaction = (transaction) => {
  return sodium.to_base64(
    sodium.crypto_generichash(64, canonicalize(transaction)!)
  );
};

export const isValidCreateChainEvent = (event: TrustChainEvent) => {
  if (event.transaction.type !== "create" || event.prevHash !== null) {
    return false;
  }
  if (
    Object.keys(event.transaction.lockboxPublicKeys).length !==
    event.authors.length
  ) {
    return false;
  }
  const lockboxPublicKeys = event.transaction.lockboxPublicKeys;
  const hash = hashTransaction(event.transaction);
  return event.authors.every((author) => {
    if (!lockboxPublicKeys.hasOwnProperty(author.publicKey)) {
      return false;
    }
    return sodium.crypto_sign_verify_detached(
      sodium.from_base64(author.signature),
      hash,
      sodium.from_base64(author.publicKey)
    );
  });
};

export const allAuthorsAreValidAdmins = (
  state: TrustChainState,
  event: DefaultTrustChainEvent
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

export const getAdminCount = (state: TrustChainState) => {
  let adminCount = 0;
  Object.keys(state.members).forEach((memberKey) => {
    if (state.members[memberKey].role === "ADMIN") {
      adminCount = adminCount + 1;
    }
  });
  return adminCount;
};

export const isValidAdminDecision = (
  state: TrustChainState,
  event: DefaultTrustChainEvent
) => {
  if (!allAuthorsAreValidAdmins(state, event as DefaultTrustChainEvent)) {
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
