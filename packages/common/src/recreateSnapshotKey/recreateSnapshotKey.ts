import { snapshotDerivedKeyContext } from "../createSnapshotKey/createSnapshotKey";
import { kdfDeriveFromKey } from "../kdfDeriveFromKey/kdfDeriveFromKey";

type Params = {
  folderKey: string;
  subkeyId: string;
};

export const recreateSnapshotKey = ({ folderKey, subkeyId }: Params) => {
  // TODO On the client and on the backend we should check no
  // subkeyId per folderKey is a duplicate.
  return kdfDeriveFromKey({
    key: folderKey,
    context: snapshotDerivedKeyContext,
    subkeyId: subkeyId,
  });
};
