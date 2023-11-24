import { commentDerivedKeyContext } from "../createCommentKey/createCommentKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  snapshotKey: string;
  subkeyId: string;
};

export const recreateCommentKey = (params: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per snapshotKey is a duplicate.
  return kdfDeriveFromKey({
    key: params.snapshotKey,
    context: commentDerivedKeyContext,
    subkeyId: params.subkeyId,
  });
};
