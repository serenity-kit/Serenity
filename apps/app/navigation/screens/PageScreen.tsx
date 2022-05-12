import { WorkspaceDrawerScreenProps } from "../../types";
import Page from "../../components/page/Page";
import { useWindowDimensions } from "react-native";
import { PageHeaderRight } from "../../components/pageHeaderRight/PageHeaderRight";

export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  if (!props.route.params?.pageId) {
    // should never happen
    return null;
  }

  props.navigation.setOptions({
    headerRight: PageHeaderRight,
  });

  return (
    <Page
      {...props}
      pageId={props.route.params.pageId}
      // to force unmount and mount the page
      key={props.route.params.pageId}
    />
  );
}
