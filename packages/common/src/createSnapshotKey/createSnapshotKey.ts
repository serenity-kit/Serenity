import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  folderKey: string;
};

// Having a specific "snapshot" context allows us to use have the same subkeyId
// for one folderKey and checking only the uniquness for this type.
export const snapshotDerivedKeyContext = "snapshot";

export const createSnapshotKey = async ({ folderKey }: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per folderKey is a duplicate.
  return await kdfDeriveFromKey({
    key: folderKey,
    context: snapshotDerivedKeyContext,
  });
};
