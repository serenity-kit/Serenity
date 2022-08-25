import {
  createDocumentKey,
  encryptDocumentTitle,
} from "@serenity-tools/common";
import { useEffect, useLayoutEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useClient } from "urql";
import Page from "../../components/page/Page";
import { PageHeader } from "../../components/page/PageHeader";
import { PageHeaderRight } from "../../components/pageHeaderRight/PageHeaderRight";
import { useAuthentication } from "../../context/AuthenticationContext";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";
import {
  DocumentDocument,
  DocumentQuery,
  DocumentQueryVariables,
  useUpdateDocumentNameMutation,
} from "../../generated/graphql";
import { WorkspaceDrawerScreenProps } from "../../types/navigation";

import { useDocumentStore } from "../../utils/document/documentStore";
import { getFolderKey } from "../../utils/folder/getFolderKey";
import { setLastUsedDocumentId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";

export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const workspaceId = useWorkspaceId();
  const documentStore = useDocumentStore();
  const pageId = props.route.params.pageId;
  const { sessionKey } = useAuthentication();
  const urqlClient = useClient();

  const navigateAwayIfUserDoesntHaveAccess = async (
    workspaceId: string,
    docId: string
  ) => {
    if (!sessionKey) {
      // TODO: handle this error
      console.error("No sessionKey found. Probably you aren't logged in!");
      return;
    }
    const documentResult = await urqlClient
      .query<DocumentQuery, DocumentQueryVariables>(
        DocumentDocument,
        { id: docId },
        {
          // better to be safe here and always refetch
          requestPolicy: "network-only",
        }
      )
      .toPromise();
    if (
      documentResult.error?.message === "[GraphQL] Document not found" ||
      documentResult.error?.message === "[GraphQL] Unauthorized"
    ) {
      props.navigation.replace("Workspace", {
        workspaceId,
        screen: "NoPageExists",
      });
      return;
    }
    return true;
  };

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: PageHeaderRight,
      headerTitle: PageHeader,
      headerTitleAlign: "left",
    });
  }, []);

  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const updateTitle = async (title: string) => {
    const folderKeyData = await getFolderKey({
      folderId: documentStore.document?.parentFolderId!,
      workspaceId: documentStore.document?.workspaceId!,
      urqlClient,
    });
    const documentKeyData = await createDocumentKey({
      folderKey: folderKeyData.key,
    });
    const encryptedDocumentTitle = await encryptDocumentTitle({
      title,
      key: documentKeyData.key,
    });
    const updateDocumentNameResult = await updateDocumentNameMutation({
      input: {
        id: pageId,
        name: title,
        encryptedName: encryptedDocumentTitle.ciphertext,
        encryptedNameNonce: encryptedDocumentTitle.publicNonce,
        subkeyId: documentKeyData.subkeyId,
      },
    });
    if (updateDocumentNameResult.data?.updateDocumentName?.document) {
      const document =
        updateDocumentNameResult.data.updateDocumentName.document;
      documentStore.update(document, urqlClient);
    }
  };

  useEffect(() => {
    setLastUsedDocumentId(pageId, workspaceId);
    // removing the isNew param right after the first render so users don't have it after a refresh
    props.navigation.setParams({ isNew: undefined });
    (async () => {
      if (pageId) {
        await navigateAwayIfUserDoesntHaveAccess(workspaceId, pageId);
      }
    })();
  }, [pageId]);

  return (
    <Page
      {...props}
      // to force unmount and mount the page
      key={pageId}
      updateTitle={updateTitle}
    />
  );
}
