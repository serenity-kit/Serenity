import { documentDerivedKeyContext } from "../createDocumentTitleKey/createDocumentTitleKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  snapshotKey: string;
  subkeyId: string;
};

export const recreateDocumentTitleKey = (params: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per folderKey is a duplicate.
  return kdfDeriveFromKey({
    key: params.snapshotKey,
    context: documentDerivedKeyContext,
    subkeyId: params.subkeyId,
  });
};
