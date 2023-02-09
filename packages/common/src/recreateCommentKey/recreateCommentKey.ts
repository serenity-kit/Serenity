import { commentDerivedKeyContext } from "../createCommentKey/createCommentKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  documentNameKey: string;
  subkeyId: number;
};

export const recreateCommentKey = (params: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per documentNameKey is a duplicate.
  return kdfDeriveFromKey({
    key: params.documentNameKey,
    context: commentDerivedKeyContext,
    subkeyId: params.subkeyId,
  });
};
