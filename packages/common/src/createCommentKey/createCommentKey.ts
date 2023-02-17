import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  snapshotKey: string;
};

// Having a specific "comment_" context allows us to use have the same subkeyId
// for one document and checking only the uniquness for this type.
export const commentDerivedKeyContext = "comment_";

export const createCommentKey = (params: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per documentNameKey is a duplicate.
  return kdfDeriveFromKey({
    key: params.snapshotKey,
    context: commentDerivedKeyContext,
  });
};
