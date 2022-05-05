import { Text, View } from "@serenity-tools/ui";
import { useDocumentPreviewsQuery } from "../../generated/graphql";
import DevDashboardScreen from "./DevDashboardScreen";

export default function DashboardScreen(props) {
  const [{ data, fetching, error }] = useDocumentPreviewsQuery();
  return (
    <View>
      <Text>Documents</Text>
      {fetching ? (
        <Text>Loading...</Text>
      ) : data?.documentPreviews?.nodes ? (
        data?.documentPreviews?.nodes.map((documentPreview) => {
          return (
            <Text key={documentPreview?.documentId}>
              Document: {documentPreview?.documentId}
            </Text>
          );
        })
      ) : null}

      <DevDashboardScreen {...props} />
    </View>
  );
}
