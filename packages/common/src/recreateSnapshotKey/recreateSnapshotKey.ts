import { snapshotDerivedKeyContext } from "../createSnapshotKey/createSnapshotKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  folderKey: string;
  subkeyId: number;
};

export const recreateSnapshotKey = async ({ folderKey, subkeyId }: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per folderKey is a duplicate.
  return await kdfDeriveFromKey({
    key: folderKey,
    context: snapshotDerivedKeyContext,
    subkeyId: subkeyId,
  });
};
