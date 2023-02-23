import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import Page from "../../../components/page/Page";
import { useWorkspace } from "../../../context/WorkspaceContext";
import { useAuthenticatedAppContext } from "../../../hooks/useAuthenticatedAppContext";
import { WorkspaceDrawerScreenProps } from "../../../types/navigationProps";

import { LocalDevice } from "@serenity-tools/common";
import {
  CenterContent,
  InfoMessage,
  Spinner,
  tw,
  useIsPermanentLeftSidebar,
} from "@serenity-tools/ui";
import { useActor, useInterpret, useMachine } from "@xstate/react";
import { Drawer } from "react-native-drawer-layout";
import sodium, { KeyPair } from "react-native-libsodium";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommentsSidebar from "../../../components/commentsSidebar/CommentsSidebar";
import { PageHeader } from "../../../components/page/PageHeader";
import { PageHeaderRight } from "../../../components/pageHeaderRight/PageHeaderRight";
import { PageProvider, usePage } from "../../../context/PageContext";
import { commentsMachine } from "../../../machines/commentsMachine";
import { useActiveDocumentInfoStore } from "../../../utils/document/activeDocumentInfoStore";
import {
  getDocumentPath,
  useDocumentPathStore,
} from "../../../utils/document/documentPathStore";
import { getDocument } from "../../../utils/document/getDocument";
import { updateDocumentName } from "../../../utils/document/updateDocumentName";
import { useFolderKeyStore } from "../../../utils/folder/folderKeyStore";
import { useOpenFolderStore } from "../../../utils/folder/openFolderStore";
import { setLastUsedDocumentId } from "../../../utils/lastUsedWorkspaceAndDocumentStore/lastUsedWorkspaceAndDocumentStore";
import { loadPageMachine } from "./loadPageMachine";

const drawerWidth = 240;

const ActualPageScreen = (props: WorkspaceDrawerScreenProps<"Page">) => {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const { pageId } = usePage();
  const { activeDevice } = useAuthenticatedAppContext();
  const { workspaceId } = useWorkspace();
  const updateActiveDocumentInfoStore = useActiveDocumentInfoStore(
    (state) => state.update
  );
  const getFolderKey = useFolderKeyStore((state) => state.getFolderKey);
  const folderStore = useOpenFolderStore();
  const documentPathStore = useDocumentPathStore();

  const [state] = useMachine(loadPageMachine, {
    context: {
      workspaceId,
      documentId: pageId,
      navigation: props.navigation,
    },
  });

  const [open, setOpen] = useState(false);
  const commentsService = useInterpret(commentsMachine, {
    context: {
      params: {
        pageId: props.route.params.pageId,
        activeDevice: activeDevice as LocalDevice,
      },
    },
  });
  const [, send] = useActor(commentsService);
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: PageHeaderRight,
      headerTitle: () => (
        <PageHeader
          toggleCommentsDrawer={() => {
            setOpen((prevOpen) => !prevOpen);
          }}
        />
      ),
    });
  }, []);

  const updateDocumentFolderPath = async (docId: string) => {
    const documentPath = await getDocumentPath(docId);
    const openFolderIds = folderStore.folderIds;
    if (!documentPath) {
      return;
    }
    documentPath.forEach((folder) => {
      if (folder) {
        openFolderIds.push(folder.id);
      }
    });
    folderStore.update(openFolderIds);
    documentPathStore.update(documentPath, activeDevice, getFolderKey);
  };

  const updateTitle = async (title: string) => {
    const document = await getDocument({
      documentId: pageId,
    });
    // this is necessary to propagate document name update to the sidebar and header
    await updateActiveDocumentInfoStore(document, activeDevice);
    if (document?.id !== pageId) {
      console.error("document ID doesn't match page ID");
      return;
    }
    try {
      const updatedDocument = await updateDocumentName({
        document,
        name: title,
        activeDevice,
      });
      await updateActiveDocumentInfoStore(updatedDocument, activeDevice);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setLastUsedDocumentId(pageId, workspaceId);
    updateDocumentFolderPath(pageId);

    // removing the isNew param right after the first render so users don't have it after a refresh
    if (state.matches("loadDocument")) {
      props.navigation.setParams({ isNew: undefined });
    }
  }, [pageId, workspaceId, props.navigation, state]);

  const signatureKeyPair: KeyPair = useMemo(() => {
    return {
      publicKey: sodium.from_base64(activeDevice.signingPublicKey),
      privateKey: sodium.from_base64(activeDevice.signingPrivateKey!),
      keyType: "ed25519",
    };
  }, [activeDevice]);

  if (state.matches("hasNoAccess")) {
    return (
      <CenterContent>
        <InfoMessage variant="error">
          This page does not exist or you don't have access anymore.
        </InfoMessage>
      </CenterContent>
    );
  } else if (state.matches("loadDocument")) {
    return (
      <PageProvider
        value={{
          pageId: props.route.params.pageId,
          commentsService,
          setActiveSnapshotAndCommentKeys: (activeSnapshot, commentKeys) => {
            send({
              type: "SET_ACTIVE_SNAPSHOT_AND_COMMENT_KEYS",
              activeSnapshot,
              commentKeys,
            });
          },
        }}
      >
        <Drawer
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          renderDrawerContent={() => {
            return <CommentsSidebar />;
          }}
          drawerType="front"
          drawerPosition="right"
          overlayStyle={{
            display: "none",
          }}
          drawerStyle={{
            width: drawerWidth,
            marginLeft: isPermanentLeftSidebar ? -drawerWidth : undefined,
            borderLeftWidth: 1,
            borderLeftColor: tw.color("gray-200"),
          }}
        >
          <Page
            {...props}
            // to force unmount and mount the page
            key={pageId}
            updateTitle={updateTitle}
            signatureKeyPair={signatureKeyPair}
            workspaceId={workspaceId}
          />
        </Drawer>
      </PageProvider>
    );
  } else {
    return (
      <CenterContent>
        <Spinner fadeIn />
      </CenterContent>
    );
  }
};

// By remounting the component we make sure that a fresh state machine gets started.
// As an alternative we could also have an action that resets the state machine,
// but with all the side-effects remounting seemed to be the stabler choice for now.
export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  const pageId = props.route.params.pageId;
  return <ActualPageScreen key={pageId} {...props} />;
}
