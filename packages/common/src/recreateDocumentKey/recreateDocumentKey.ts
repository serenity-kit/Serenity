import { derivedKeyContext } from "../createDocumentKey/createDocumentKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  folderKey: string;
  subkeyId: number;
};

export const recreateDocumentKey = async (params: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per folderKey is a duplicate.
  return await kdfDeriveFromKey({
    key: params.folderKey,
    context: derivedKeyContext,
    subkeyId: params.subkeyId,
  });
};
