import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  folderKey: string;
};

// Having a specific "document" context allows us to use have the same subkeyId
// for one folderKey and checking only the uniquness for this type.
export const documentDerivedKeyContext = "document";

export const createDocumentKey = (params: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per folderKey is a duplicate.
  return kdfDeriveFromKey({
    key: params.folderKey,
    context: documentDerivedKeyContext,
  });
};
