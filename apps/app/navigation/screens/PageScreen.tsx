import { WorkspaceDrawerScreenProps } from "../../types";
import Page from "../../components/page/Page";
import { useWindowDimensions } from "react-native";
import { PageHeaderRight } from "../../components/pageHeaderRight/PageHeaderRight";
import { useLayoutEffect } from "react";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";

export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: PageHeaderRight,
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

  if (!props.route.params?.pageId) {
    // should never happen
    return null;
  }

  return (
    <Page
      {...props}
      // to force unmount and mount the page
      key={props.route.params.pageId}
      updateTitle={updateTitle}
    />
  );
}
