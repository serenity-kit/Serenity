import { useFocusEffect } from "@react-navigation/native";
import { LocalDevice, ShareDocumentRole } from "@serenity-tools/common";
import {
  CenterContent,
  InfoMessage,
  Spinner,
  tw,
  useIsPermanentLeftSidebar,
} from "@serenity-tools/ui";
import { useActorRef, useMachine, useSelector } from "@xstate/react";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Drawer } from "react-native-drawer-layout";
import sodium, { KeyPair } from "react-native-libsodium";
import CommentsSidebar from "../../../components/commentsSidebar/CommentsSidebar";
import { PageHeader } from "../../../components/page/PageHeader";
import { PageHeaderRight } from "../../../components/pageHeaderRight/PageHeaderRight";
import { SharePage } from "../../../components/sharePage/SharePage";
import { commentsDrawerWidth } from "../../../constants";
import { PageProvider } from "../../../context/PageContext";
import { commentsMachine } from "../../../machines/commentsMachine";
import { SharePageDrawerScreenProps } from "../../../types/navigationProps";
import { sharePageScreenMachine } from "./sharePageScreenMachine";

type SharePageContainerProps =
  SharePageDrawerScreenProps<"SharePageContent"> & {
    documentId: string;
    shareDevice: LocalDevice;
    reloadPage: () => void;
    workspaceId: string;
    websocketSessionKey: string;
    role: ShareDocumentRole;
  };

const SharePageContainer: React.FC<SharePageContainerProps> = ({
  documentId,
  route,
  navigation,
  shareDevice,
  reloadPage,
  workspaceId,
  websocketSessionKey,
  role,
}) => {
  const signatureKeyPair: KeyPair = useMemo(() => {
    return {
      publicKey: sodium.from_base64(shareDevice.signingPublicKey),
      privateKey: sodium.from_base64(shareDevice.signingPrivateKey!),
      keyType: "ed25519",
    };
  }, [shareDevice]);

  const commentsService = useActorRef(commentsMachine, {
    input: {
      workspaceId,
      pageId: route.params.pageId,
      shareLinkToken: route.params.token,
      activeDevice: shareDevice,
    },
  });
  const commentsState = useSelector(commentsService, (state) => state);
  const isPermanentLeftSidebar = useIsPermanentLeftSidebar();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <PageHeaderRight
          toggleCommentsDrawer={() => {
            commentsService.send({ type: "TOGGLE_SIDEBAR" });
          }}
          hasShareButton={false}
        />
      ),
      headerTitle: () => (
        <PageHeader
          toggleCommentsDrawer={() => {
            commentsService.send({ type: "TOGGLE_SIDEBAR" });
          }}
          isOpenSidebar={commentsState.context.isOpenSidebar}
          hasNewComment={false} // not active for share links
        />
      ),
    });
  }, [commentsState]);

  return (
    <PageProvider
      value={{
        pageId: route.params.pageId,
        commentsService,
        setActiveSnapshotAndCommentKeys: (params) => {
          commentsService.send({
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
            commentsService.send({ type: "OPEN_SIDEBAR" });
          }
        }}
        onClose={() => {
          if (commentsState.context.isOpenSidebar) {
            commentsService.send({ type: "CLOSE_SIDEBAR" });
          }
        }}
        renderDrawerContent={() => {
          return <CommentsSidebar canComment={false} />;
        }}
        drawerType="front"
        drawerPosition="right"
        overlayStyle={{
          display: "none",
        }}
        drawerStyle={{
          right: 0,
          width: commentsDrawerWidth,
          marginLeft: isPermanentLeftSidebar ? -commentsDrawerWidth : undefined,
          borderLeftWidth: 1,
          borderLeftColor: tw.color("gray-200"),
        }}
      >
        <SharePage
          navigation={navigation}
          route={route}
          // to force unmount and mount the page
          key={documentId}
          signatureKeyPair={signatureKeyPair}
          websocketSessionKey={websocketSessionKey}
          workspaceId={workspaceId}
          reloadPage={reloadPage}
          role={role}
          token={route.params.token}
          shareLinkDevice={shareDevice}
        />
      </Drawer>
    </PageProvider>
  );
};

function ActualSharePageScreen(
  props: {
    reloadPage: () => void;
  } & SharePageDrawerScreenProps<"SharePageContent">
) {
  const [key] = useState(window.location.hash.split("=")[1]);
  const [state, send] = useMachine(sharePageScreenMachine, {
    input: {
      shareLinkDeviceKey: key,
      documentId: props.route.params.pageId,
      token: props.route.params.token,
    },
  });

  useFocusEffect(() => {
    send({ type: "start" });
  });

  if (state.value !== "done" && state.value !== "decryptDeviceFail") {
    return (
      <CenterContent>
        <Spinner fadeIn />
      </CenterContent>
    );
  } else if (state.value === "decryptDeviceFail") {
    return (
      <CenterContent>
        <InfoMessage variant="error" testID="document-share-error">
          Failed decrypting document access. Please ask for a new share link.
          <br />
          Reason: {state.value}.
        </InfoMessage>
      </CenterContent>
    );
  } else if (
    state.context.device &&
    state.context.documentShareLinkQueryResult?.data?.documentShareLink
  ) {
    return (
      <SharePageContainer
        documentId={props.route.params.pageId}
        navigation={props.navigation}
        route={props.route}
        shareDevice={state.context.device}
        reloadPage={props.reloadPage}
        workspaceId={
          state.context.documentShareLinkQueryResult.data.documentShareLink
            .workspaceId
        }
        websocketSessionKey={
          state.context.documentShareLinkQueryResult.data.documentShareLink
            .websocketSessionKey
        }
        role={
          state.context.documentShareLinkQueryResult.data.documentShareLink.role
        }
      />
    );
  } else {
    throw new Error("Invalid UI state");
  }
}

export default function SharePageScreen(
  props: SharePageDrawerScreenProps<"SharePageContent">
) {
  const pageId = props.route.params.pageId;
  const [reloadCounter, setReloadCounter] = useState(0);
  const reloadPage = useCallback(() => {
    setReloadCounter((counter) => counter + 1);
  }, [setReloadCounter]);
  return (
    <ActualSharePageScreen
      key={`${pageId}-${reloadCounter}`}
      {...props}
      reloadPage={reloadPage}
    />
  );
}
