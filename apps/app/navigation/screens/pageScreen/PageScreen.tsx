import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useWindowDimensions } from "react-native";
import Page from "../../../components/page/Page";
import { useWorkspace } from "../../../context/WorkspaceContext";
import { useAuthenticatedAppContext } from "../../../hooks/useAuthenticatedAppContext";
import { WorkspaceDrawerScreenProps } from "../../../types/navigationProps";

import * as documentChain from "@serenity-kit/document-chain";
import { LocalDevice } from "@serenity-tools/common";
import { tw, useIsPermanentLeftSidebar } from "@serenity-tools/ui";
import { useActor, useInterpret, useMachine } from "@xstate/react";
import { Drawer } from "react-native-drawer-layout";
import sodium, { KeyPair } from "react-native-libsodium";
import CommentsSidebar from "../../../components/commentsSidebar/CommentsSidebar";
import { EditorLoading } from "../../../components/editorLoading/EditorLoading";
import { PageHeader } from "../../../components/page/PageHeader";
import { PageNoAccessError } from "../../../components/page/PageNoAccessError";
import { PageHeaderRight } from "../../../components/pageHeaderRight/PageHeaderRight";
import { commentsDrawerWidth } from "../../../constants";
import { PageProvider } from "../../../context/PageContext";
import { commentsMachine } from "../../../machines/commentsMachine";
import { getCurrentUserInfo } from "../../../store/currentUserInfoStore";
import { loadRemoteDocumentChain } from "../../../store/documentChainStore";
import {
  useCanComment,
  useCanEditDocumentsAndFolders,
} from "../../../store/workspaceChainStore";
import { updateLastOpenDocumentId } from "../../../store/workspaceStore";
import {
  getDocumentPath,
  useDocumentPathStore,
} from "../../../utils/document/documentPathStore";
import { useFolderKeyStore } from "../../../utils/folder/folderKeyStore";
import { useOpenFolderStore } from "../../../utils/folder/openFolderStore";
import { loadPageMachine } from "./loadPageMachine";

const ActualPageScreen = (
  props: WorkspaceDrawerScreenProps<"Page"> & {
    reloadPage: () => void;
  }
) => {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const pageId = props.route.params.pageId;
  const { activeDevice } = useAuthenticatedAppContext();
  const { workspaceId } = useWorkspace();
  const getFolderKey = useFolderKeyStore((state) => state.getFolderKey);
  const folderStore = useOpenFolderStore();
  const documentPathStore = useDocumentPathStore();
  let [latestDocumentChainState, setLatestDocumentChainState] = useState<
    documentChain.DocumentChainState | undefined
  >(undefined);
  const [isNew] = useState(props.route.params.isNew || false);

  const [state] = useMachine(loadPageMachine, {
    context: {
      workspaceId,
      documentId: pageId,
      navigation: props.navigation,
    },
  });

  const commentsService = useInterpret(commentsMachine, {
    context: {
      params: {
        pageId: props.route.params.pageId,
        activeDevice: activeDevice as LocalDevice,
      },
    },
  });
  const [commentsState, send] = useActor(commentsService);
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();

  const currentUserInfo = getCurrentUserInfo();
  if (!currentUserInfo) throw new Error("No current user");
  const canEditAndDocumentsFolders = useCanEditDocumentsAndFolders({
    workspaceId,
    mainDeviceSigningPublicKey: currentUserInfo.mainDeviceSigningPublicKey,
  });
  const canComment = useCanComment({
    workspaceId,
    mainDeviceSigningPublicKey: currentUserInfo.mainDeviceSigningPublicKey,
  });

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <PageHeaderRight
          toggleCommentsDrawer={() => {
            send({ type: "TOGGLE_SIDEBAR" });
          }}
          hasShareButton={canEditAndDocumentsFolders}
        />
      ),
      headerTitle: () => (
        <PageHeader
          toggleCommentsDrawer={() => {
            send({ type: "TOGGLE_SIDEBAR" });
          }}
          isOpenSidebar={commentsState.context.isOpenSidebar}
          hasNewComment={false} // TODO
        />
      ),
    });
  }, [commentsState]);

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

  useEffect(() => {
    updateLastOpenDocumentId({ documentId: pageId, workspaceId });
    updateDocumentFolderPath(pageId);

    // removing the isNew param right after the first render so users don't have it after a refresh
    if (state.matches("loadDocument")) {
      props.navigation.setParams({ isNew: undefined });
    }
  }, [pageId, workspaceId, props.navigation, state]);

  useEffect(() => {
    const fetchDocumentChain = async () => {
      const documentChain = await loadRemoteDocumentChain({
        documentId: pageId,
      });
      if (documentChain) {
        setLatestDocumentChainState(documentChain.state);
      }
    };

    fetchDocumentChain();
  }, []);

  const signatureKeyPair: KeyPair = useMemo(() => {
    return {
      publicKey: sodium.from_base64(activeDevice.signingPublicKey),
      privateKey: sodium.from_base64(activeDevice.signingPrivateKey!),
      keyType: "ed25519",
    };
  }, [activeDevice]);

  if (state.matches("hasNoAccess")) {
    return <PageNoAccessError />;
  } else if (state.matches("loadDocument") && latestDocumentChainState) {
    return (
      <PageProvider
        value={{
          pageId: props.route.params.pageId,
          commentsService,
          setActiveSnapshotAndCommentKeys: (params) => {
            send({
              ...params,
              type: "SET_ACTIVE_SNAPSHOT_AND_COMMENT_KEYS",
              activeSnapshot: params.snapshot,
            });
          },
        }}
      >
        <Drawer
          open={commentsState.context.isOpenSidebar}
          onOpen={() => {
            if (!commentsState.context.isOpenSidebar) {
              send({ type: "OPEN_SIDEBAR" });
            }
          }}
          onClose={() => {
            if (commentsState.context.isOpenSidebar) {
              send({ type: "CLOSE_SIDEBAR" });
            }
          }}
          renderDrawerContent={() => {
            return <CommentsSidebar canComment={canComment} />;
          }}
          drawerType="front"
          drawerPosition="right"
          overlayStyle={{
            display: "none",
          }}
          drawerStyle={{
            right: 0,
            width: commentsDrawerWidth,
            marginLeft: isPermanentLeftSidebar
              ? -commentsDrawerWidth
              : undefined,
            borderLeftWidth: 1,
            borderLeftColor: tw.color("gray-200"),
          }}
        >
          <Page
            {...props}
            // to force unmount and mount the page
            key={pageId}
            signatureKeyPair={signatureKeyPair}
            workspaceId={workspaceId}
            latestDocumentChainState={latestDocumentChainState}
            isNew={isNew}
          />
        </Drawer>
      </PageProvider>
    );
  } else {
    return <EditorLoading />;
  }
};

// By remounting the component we make sure that a fresh state machine gets started.
// As an alternative we could also have an action that resets the state machine,
// but with all the side-effects remounting seemed to be the stabler choice for now.
export default function PageScreen(props: WorkspaceDrawerScreenProps<"Page">) {
  const [reloadCounter, setReloadCounter] = useState(0);
  const reloadPage = useCallback(() => {
    setReloadCounter((counter) => counter + 1);
  }, [setReloadCounter]);
  const pageId = props.route.params.pageId;
  return (
    <ActualPageScreen
      key={`${pageId}-${reloadCounter}`}
      {...props}
      reloadPage={reloadPage}
    />
  );
}
