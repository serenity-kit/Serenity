import { WorkspaceDrawerScreenProps } from "../../types";
import Page from "../../components/page/Page";
import { useWindowDimensions } from "react-native";
import { PageHeaderRight } from "../../components/pageHeaderRight/PageHeaderRight";
import { useLayoutEffect } from "react";

export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: PageHeaderRight,
    });
  }, []);

  if (!props.route.params?.pageId) {
    // should never happen
    return null;
  }

  return (
    <Page
      {...props}
      // to force unmount and mount the page
      key={props.route.params.pageId}
    />
  );
}
