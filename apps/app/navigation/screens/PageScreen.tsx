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

export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const workspaceId = useWorkspaceId();
  const documentStore = useDocumentStore();

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
        id: props.route.params.pageId,
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
    setLastUsedDocumentId(props.route.params.pageId, workspaceId);

    // removing the isNew param right after the first render so users don't have it after a refresh
    props.navigation.setParams({ isNew: undefined });
  }, [props.route.params.pageId]);

  return (
    <Page
      {...props}
      // to force unmount and mount the page
      key={props.route.params.pageId}
      updateTitle={updateTitle}
    />
  );
}
