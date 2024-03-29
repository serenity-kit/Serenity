import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  snapshotKey: string;
};

// Having a specific "doctitle" context allows us to use have the same subkeyId
// for one folderKey and checking only the uniquness for this type.
export const documentDerivedKeyContext = "doctitle";

export const createDocumentTitleKey = (params: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per folderKey is a duplicate.
  return kdfDeriveFromKey({
    key: params.snapshotKey,
    context: documentDerivedKeyContext,
  });
};
