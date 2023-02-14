import { KeyDerivationTrace2 } from "@naisho/core";
import {
  commentDerivedKeyContext,
  createCommentKey,
  documentDerivedKeyContext,
  LocalDevice,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { getDocument } from "../../utils/document/getDocument";
import { createFolderKeyDerivationTrace } from "../../utils/folder/createFolderKeyDerivationTrace";
import { deriveFolderKey } from "../../utils/folder/deriveFolderKeyData";
import { getWorkspace } from "../../utils/workspace/getWorkspace";

type Params = {
  documentId: string;
  activeDevice: LocalDevice;
};

export const createCommentKeyAndKeyDerivationTrace = async ({
  documentId,
  activeDevice,
}: Params) => {
  const document = await getDocument({
    documentId,
  });
  const workspace = await getWorkspace({
    workspaceId: document.workspaceId!,
    deviceSigningPublicKey: activeDevice!.signingPublicKey,
  });
  const folderKeyChainData = await deriveFolderKey({
    folderId: document.parentFolderId!,
    workspaceId: document.workspaceId!,
    keyDerivationTrace: document.nameKeyDerivationTrace,
    activeDevice,
  });

  const folderKey = folderKeyChainData[folderKeyChainData.length - 2];
  const documentKeyData = recreateDocumentKey({
    folderKey: folderKey.key,
    subkeyId: document.nameKeyDerivationTrace.subkeyId,
  });

  const commentKey = createCommentKey({
    documentNameKey: documentKeyData.key,
  });

  const folderKeyDerivationTrace = await createFolderKeyDerivationTrace({
    folderId: document.parentFolderId!,
    workspaceKeyId: workspace!.currentWorkspaceKey!.id,
  });

  const keyDerivationTrace: KeyDerivationTrace2 = {
    ...folderKeyDerivationTrace,
    trace: [
      ...folderKeyDerivationTrace.trace,
      {
        parentId:
          folderKeyDerivationTrace.trace[
            folderKeyDerivationTrace.trace.length - 1
          ].entryId,
        subkeyId: documentKeyData.subkeyId,
        entryId: document.id,
        context: documentDerivedKeyContext,
      },
      {
        parentId: document.id,
        subkeyId: commentKey.subkeyId,
        entryId: "TODO", // id should be created on the client
        context: commentDerivedKeyContext,
      },
    ],
  };

  return {
    commentKey,
    keyDerivationTrace,
  };
};
