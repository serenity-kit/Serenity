import { WorkspaceDrawerScreenProps } from "../../types";
import Page from "../../components/page/Page";
import { useWindowDimensions } from "react-native";
import { PageHeaderRight } from "../../components/pageHeaderRight/PageHeaderRight";
import { useEffect, useLayoutEffect } from "react";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";
import { PageHeader } from "../../components/page/PageHeader";
import { setLastUsedDocumentId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";

export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const workspaceId = useWorkspaceId();

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: PageHeaderRight,
      headerTitle: PageHeader,
    });
  }, []);

  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const updateTitle = (title: string) => {
    updateDocumentNameMutation({
      input: {
        id: props.route.params.pageId,
        name: title,
      },
    });
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
