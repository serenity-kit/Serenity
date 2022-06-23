import { useRoute } from "@react-navigation/native";
import { Spinner, tw, View } from "@serenity-tools/ui";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useClient } from "urql";
import { useWorkspaceId } from "../../context/WorkspaceIdContext";
import {
  FirstDocumentDocument,
  FirstDocumentQuery,
  FirstDocumentQueryVariables,
} from "../../generated/graphql";
import { WorkspaceDrawerScreenProps } from "../../types";

export default function WorkspaceRootScreen(
  props: WorkspaceDrawerScreenProps<"WorkspaceRoot">
) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const urqlClient = useClient();
  const workspaceId = useWorkspaceId();

  useEffect(() => {
    (async () => {
      // query first folder and then the first document to navigate there
      const firstDocumentResult = await urqlClient
        .query<FirstDocumentQuery, FirstDocumentQueryVariables>(
          FirstDocumentDocument,
          { workspaceId },
          { requestPolicy: "network-only" } // better to be safe here and always refetch
        )
        .toPromise();

      if (firstDocumentResult.data?.firstDocument?.id) {
        props.navigation.replace("Workspace", {
          workspaceId,
          screen: "Page",
          params: {
            pageId: firstDocumentResult.data?.firstDocument?.id,
          },
        });
      } else {
        props.navigation.replace("Workspace", {
          workspaceId: workspaceId,
          screen: "NoPageExists",
        });
      }
    })();
  }, [urqlClient, props.navigation]);

  return (
    <View style={tw`justify-center items-center flex-auto`}>
      <Spinner fadeIn size="lg" />
    </View>
  );
}
