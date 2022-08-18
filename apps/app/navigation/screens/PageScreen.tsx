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
  useAttachDeviceToWorkspacesMutation,
  useUpdateDocumentNameMutation,
} from "../../generated/graphql";
import { WorkspaceDrawerScreenProps } from "../../types/navigation";
import { buildDeviceWorkspaceKeyBoxes } from "../../utils/device/buildDeviceWorkspaceKeyBoxes";
import { getActiveDevice } from "../../utils/device/getActiveDevice";
import { getDevices } from "../../utils/device/getDevices";
import { useDocumentStore } from "../../utils/document/documentStore";
import { setLastUsedDocumentId } from "../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { getWorkspace } from "../../utils/workspace/getWorkspace";

export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const workspaceId = useWorkspaceId();
  const documentStore = useDocumentStore();
  const pageId = props.route.params.pageId;
  const [, attachDeviceToWorkspacesMutation] =
    useAttachDeviceToWorkspacesMutation();
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
    const activeDevice = await getActiveDevice();
    if (!activeDevice) {
      // TODO: handle this error
      console.error("No active device found!");
      return;
    }
    const deviceSigningPublicKey = activeDevice.signingPublicKey;
    const devices = await getDevices({ urqlClient });
    if (!devices) {
      // TODO: handle this erros
      console.error("No devices found!");
      return;
    }
    const { existingWorkspaceDeviceWorkspaceKeyBoxes } =
      await buildDeviceWorkspaceKeyBoxes({
        workspaceId,
        devices,
      });
    await attachDeviceToWorkspacesMutation({
      input: {
        creatorDeviceSigningPublicKey: deviceSigningPublicKey,
        deviceWorkspaceKeyBoxes: existingWorkspaceDeviceWorkspaceKeyBoxes,
        receiverDeviceSigningPublicKey: deviceSigningPublicKey,
      },
    });
    const workspace = await getWorkspace({
      workspaceId,
      urqlClient,
      deviceSigningPublicKey: activeDevice?.signingPublicKey,
    });
    if (!workspace) {
      props.navigation.replace("WorkspaceNotFound");
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
