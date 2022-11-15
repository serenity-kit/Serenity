import {
  createDocumentKey,
  encryptDocumentTitle,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import Page from "../../../components/page/Page";
import { PageHeader } from "../../../components/page/PageHeader";
import { PageHeaderRight } from "../../../components/pageHeaderRight/PageHeaderRight";
import { useWorkspaceId } from "../../../context/WorkspaceIdContext";
import {
  Document,
  runUpdateDocumentNameMutation,
} from "../../../generated/graphql";
import { useWorkspaceContext } from "../../../hooks/useWorkspaceContext";
import { WorkspaceDrawerScreenProps } from "../../../types/navigationProps";

import sodium, { KeyPair } from "@serenity-tools/libsodium";
import { CenterContent, InfoMessage, Spinner } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useActiveDocumentInfoStore } from "../../../utils/document/activeDocumentInfoStore";
import {
  getDocumentPath,
  useDocumentPathStore,
} from "../../../utils/document/documentPathStore";
import { getDocument } from "../../../utils/document/getDocument";
import { buildKeyDerivationTrace } from "../../../utils/folder/buildKeyDerivationTrace";
import { useFolderKeyStore } from "../../../utils/folder/folderKeyStore";
import { getFolder } from "../../../utils/folder/getFolder";
import { useOpenFolderStore } from "../../../utils/folder/openFolderStore";
import { setLastUsedDocumentId } from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { getWorkspace } from "../../../utils/workspace/getWorkspace";
import { loadPageMachine } from "./loadPageMachine";

const PageRemountWrapper = (props: WorkspaceDrawerScreenProps<"Page">) => {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const pageId = props.route.params.pageId;
  const { activeDevice } = useWorkspaceContext();
  const workspaceId = useWorkspaceId();
  const updateActiveDocumentInfoStore = useActiveDocumentInfoStore(
    (state) => state.update
  );
  const getFolderKey = useFolderKeyStore((state) => state.getFolderKey);
  const folderStore = useOpenFolderStore();
  const documentPathStore = useDocumentPathStore();

  const [state] = useMachine(loadPageMachine, {
    context: {
      workspaceId,
      documentId: pageId,
      navigation: props.navigation,
    },
  });

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: PageHeaderRight,
      headerTitle: PageHeader,
      headerTitleAlign: "center",
    });
  }, []);

  const updateDocumentFolderPath = async (docId: string) => {
    const documentPath = await getDocumentPath(docId);
    const openFolderIds = folderStore.folderIds;
    if (!documentPath) {
      return;
    }
    documentPath.forEach((folder) => {
      if (folder) {
        openFolderIds.push(folder.id);
      }
    });
    folderStore.update(openFolderIds);
    documentPathStore.update(documentPath, activeDevice, getFolderKey);
  };

  const updateTitle = async (title: string) => {
    let document: Document | undefined | null = undefined;
    const workspace = await getWorkspace({
      workspaceId,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace?.currentWorkspaceKey) {
      // TODO: handle error in UI
      console.error("Workspace or workspaceKeys not found");
      return;
    }
    document = await getDocument({
      documentId: pageId,
    });
    // this is necessary to propagate document name update to the sidebar and header
    await updateActiveDocumentInfoStore(document, activeDevice);
    if (document?.id !== pageId) {
      console.error("document ID doesn't match page ID");
      return;
    }
    const folder = await getFolder({ id: document.parentFolderId! });
    const folderKeyString = await getFolderKey({
      folderId: folder.id!,
      workspaceId: document.workspaceId!,
      workspaceKeyId: workspace.currentWorkspaceKey.id,
      folderSubkeyId: folder.subkeyId,
      activeDevice,
    });
    let documentSubkeyId = 0;
    let documentKey = "";
    if (document?.subkeyId) {
      documentSubkeyId = document.subkeyId;
      const documentKeyData = await recreateDocumentKey({
        folderKey: folderKeyString,
        subkeyId: document.subkeyId,
      });
      documentKey = documentKeyData.key;
    } else {
      const documentKeyData = await createDocumentKey({
        folderKey: folderKeyString,
      });
      documentSubkeyId = documentKeyData.subkeyId;
      documentKey = documentKeyData.key;
    }
    const encryptedDocumentTitle = await encryptDocumentTitle({
      title,
      key: documentKey,
    });
    const nameKeyDerivationTrace = await buildKeyDerivationTrace({
      folderId: document.parentFolderId!,
      workspaceKeyId: workspace.currentWorkspaceKey.id,
    });
    const updateDocumentNameResult = await runUpdateDocumentNameMutation(
      {
        input: {
          id: pageId,
          encryptedName: encryptedDocumentTitle.ciphertext,
          encryptedNameNonce: encryptedDocumentTitle.publicNonce,
          workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
          subkeyId: documentSubkeyId,
          nameKeyDerivationTrace,
        },
      },
      {}
    );
    if (updateDocumentNameResult.data?.updateDocumentName?.document) {
      const updatedDocument =
        updateDocumentNameResult.data.updateDocumentName.document;
      await updateActiveDocumentInfoStore(updatedDocument, activeDevice);
    }
  };

  useEffect(() => {
    setLastUsedDocumentId(pageId, workspaceId);
    updateDocumentFolderPath(pageId);

    // removing the isNew param right after the first render so users don't have it after a refresh
    if (state.matches("loadDocument")) {
      props.navigation.setParams({ isNew: undefined });
    }
  }, [pageId, workspaceId, props.navigation, state]);

  const signatureKeyPair: KeyPair = useMemo(() => {
    return {
      publicKey: sodium.from_base64(activeDevice.signingPublicKey),
      privateKey: sodium.from_base64(activeDevice.signingPrivateKey!),
      keyType: "ed25519",
    };
  }, [activeDevice]);

  if (state.matches("hasNoAccess")) {
    return (
      <CenterContent>
        <InfoMessage variant="error">
          This page does not exist or you don't have access anymore.
        </InfoMessage>
      </CenterContent>
    );
  } else if (state.matches("loadDocument")) {
    return (
      <Page
        {...props}
        // to force unmount and mount the page
        key={pageId}
        updateTitle={updateTitle}
        signatureKeyPair={signatureKeyPair}
        workspaceId={workspaceId}
      />
    );
  } else {
    return (
      <CenterContent>
        <Spinner fadeIn />
      </CenterContent>
    );
  }
};

// By remounting the component we make sure that a fresh state machine gets started.
// As an alternative we could also have an action that resets the state machine,
// but with all the side-effects remounting seemed to be the stabler choice for now.
export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  const pageId = props.route.params.pageId;
  return <PageRemountWrapper key={pageId} {...props} />;
}
