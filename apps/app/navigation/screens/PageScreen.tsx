import { WorkspaceDrawerScreenProps } from "../../types";
import Page from "../../components/page/Page";

export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  if (!props.route.params?.pageId) {
    // should never happen
    return null;
  }

  return (
    <Page
      {...props}
      pageId={props.route.params.pageId}
      // to force unmount and mount the page
      key={props.route.params.pageId}
    />
  );
}
