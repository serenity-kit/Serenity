import {
  createDocumentKey,
  encryptDocumentTitle,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { useEffect, useLayoutEffect } from "react";
import { useWindowDimensions } from "react-native";
import Page from "../../../components/page/Page";
import { PageHeader } from "../../../components/page/PageHeader";
import { PageHeaderRight } from "../../../components/pageHeaderRight/PageHeaderRight";
import { useWorkspaceId } from "../../../context/WorkspaceIdContext";
import {
  Document,
  useUpdateDocumentNameMutation,
} from "../../../generated/graphql";
import { useWorkspaceContext } from "../../../hooks/useWorkspaceContext";
import { WorkspaceDrawerScreenProps } from "../../../types/navigation";

import { CenterContent, InfoMessage, Spinner } from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { useActiveDocumentInfoStore } from "../../../utils/document/activeDocumentInfoStore";
import { getDocument } from "../../../utils/document/getDocument";
import { getFolderKey } from "../../../utils/folder/getFolderKey";
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
  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();

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

  const updateTitle = async (title: string) => {
    let document: Document | undefined | null = undefined;
    const workspace = await getWorkspace({
      workspaceId,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    document = await getDocument({
      documentId: pageId,
    });
    // this is necessary to propagate document name update to the sidebar and header
    await updateActiveDocumentInfoStore(document, activeDevice);
    if (document?.id !== pageId) {
      console.error("document ID doesn't match page ID");
      return;
    }
    const folderKeyData = await getFolderKey({
      folderId: document?.parentFolderId!,
      workspaceId: document?.workspaceId!,
      activeDevice,
    });
    let documentSubkeyId = 0;
    let documentKey = "";
    if (document?.subkeyId) {
      documentSubkeyId = document.subkeyId;
      const documentKeyData = await recreateDocumentKey({
        folderKey: folderKeyData.key,
        subkeyId: document.subkeyId,
      });
      documentKey = documentKeyData.key;
    } else {
      const documentKeyData = await createDocumentKey({
        folderKey: folderKeyData.key,
      });
      documentSubkeyId = documentKeyData.subkeyId;
      documentKey = documentKeyData.key;
    }
    const encryptedDocumentTitle = await encryptDocumentTitle({
      title,
      key: documentKey,
    });
    const updateDocumentNameResult = await updateDocumentNameMutation({
      input: {
        id: pageId,
        encryptedName: encryptedDocumentTitle.ciphertext,
        encryptedNameNonce: encryptedDocumentTitle.publicNonce,
        workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
        subkeyId: documentSubkeyId,
      },
    });
    if (updateDocumentNameResult.data?.updateDocumentName?.document) {
      const updatedDocument =
        updateDocumentNameResult.data.updateDocumentName.document;
      await updateActiveDocumentInfoStore(updatedDocument, activeDevice);
    }
  };

  useEffect(() => {
    setLastUsedDocumentId(pageId, workspaceId);
    // removing the isNew param right after the first render so users don't have it after a refresh
    if (state.matches("loadDocument")) {
      props.navigation.setParams({ isNew: undefined });
    }
  }, [pageId, workspaceId, props.navigation, state]);

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
