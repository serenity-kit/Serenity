import { WorkspaceDrawerScreenProps } from "../../types/navigation";
import Page from "../../components/page/Page";
import { useWindowDimensions } from "react-native";
import { PageHeaderRight } from "../../components/pageHeaderRight/PageHeaderRight";
import { useEffect, useLayoutEffect } from "react";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";
import { PageHeader } from "../../components/page/PageHeader";
import { setLastUsedDocumentId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";
import { useDocumentStore } from "../../utils/document/documentStore";
import {
  DocumentQuery,
  DocumentQueryVariables,
  DocumentDocument,
} from "../../generated/graphql";
import { useClient } from "urql";

export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const workspaceId = useWorkspaceId();
  const documentStore = useDocumentStore();
  const pageId = props.route.params.pageId;
  const urqlClient = useClient();

  const doesUserHaveAccess = async (docId: string) => {
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
    console.log({ documentResult });
    if (documentResult.error?.message === "[GraphQL] Document not found") {
      return false;
    }
    return true;
  };

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: PageHeaderRight,
      headerTitle: PageHeader,
    });
  }, []);

  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const updateTitle = async (title: string) => {
    const updateDocumentNameResult = await updateDocumentNameMutation({
      input: {
        id: pageId,
        name: title,
      },
    });
    if (updateDocumentNameResult.data?.updateDocumentName?.document) {
      const document =
        updateDocumentNameResult.data.updateDocumentName.document;
      documentStore.update(document);
    }
  };

  useEffect(() => {
    setLastUsedDocumentId(pageId, workspaceId);
    props.navigation.setParams({ isNew: undefined });
    (async () => {
      if (pageId) {
        const hasAccess = await doesUserHaveAccess(pageId);
        console.log({ hasAccess });
        if (!hasAccess) {
          props.navigation.replace("Workspace", {
            workspaceId,
            screen: "NoPageExists",
          });
        }
      }
      // removing the isNew param right after the first render so users don't have it after a refresh
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
