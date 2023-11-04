import * as documentChain from "@serenity-kit/document-chain";
import {
  LocalDevice,
  SerenitySnapshotPublicData,
  ShareDocumentRole,
  decryptSnapshotKey,
} from "@serenity-tools/common";
import { useYjsSync } from "@serenity-tools/secsync";
import {
  Button,
  Description,
  Modal,
  ModalButtonFooter,
  ModalHeader,
  Text,
  View,
  tw,
  useHasEditorSidebar,
} from "@serenity-tools/ui";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import sodium, { KeyPair } from "react-native-libsodium";
import { Awareness } from "y-protocols/awareness";
import * as Yjs from "yjs";
import Editor from "../../components/editor/Editor";
import { usePage } from "../../context/PageContext";
import { runDocumentShareLinkSnapshotKeyBoxQuery } from "../../generated/graphql";
import { DocumentState } from "../../types/documentState";
import { SharePageDrawerScreenProps } from "../../types/navigationProps";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { getEnvironmentUrls } from "../../utils/getEnvironmentUrls/getEnvironmentUrls";
import { showToast } from "../../utils/toast/showToast";
import { PageLoadingError } from "../page/PageLoadingError";
import { PageNoAccessError } from "../page/PageNoAccessError";

type Props = SharePageDrawerScreenProps<"SharePageContent"> & {
  signatureKeyPair: KeyPair;
  reloadPage: () => void;
  websocketSessionKey: string;
  workspaceId: string;
  role: ShareDocumentRole;
  token: string;
  shareLinkDevice: LocalDevice;
};

export const SharePage: React.FC<Props> = ({
  navigation,
  route,
  signatureKeyPair,
  reloadPage,
  websocketSessionKey,
  workspaceId,
  role,
  token,
  shareLinkDevice,
}) => {
  const { pageId: docId, setActiveSnapshotAndCommentKeys } = usePage();
  const yDocRef = useRef<Yjs.Doc>(new Yjs.Doc());
  const [documentLoadedOnceFromRemote, setDocumentLoadedOnceFromRemote] =
    useState(false);
  const [passedDocumentLoadingTimeout, setPassedDocumentLoadingTimeout] =
    useState(false);
  const syncState = useEditorStore((state) => state.syncState);
  const setSyncState = useEditorStore((state) => state.setSyncState);
  const setDocumentState = useEditorStore((state) => state.setDocumentState);
  const setSnapshotKey = useEditorStore((state) => state.setSnapshotKey);
  const setSnapshotId = useEditorStore((state) => state.setSnapshotId);
  const [isClosedErrorModal, setIsClosedErrorModal] = useState(false);
  const ephemeralUpdateErrorsChangedAt = useRef<Date | null>(null);
  const hasEditorSidebar = useHasEditorSidebar();

  const { websocketOrigin } = getEnvironmentUrls();

  const [state, , , yAwareness] = useYjsSync({
    yDoc: yDocRef.current,
    documentId: docId,
    signatureKeyPair,
    websocketHost: websocketOrigin,
    websocketSessionKey,
    getNewSnapshotData: async () => {
      // share page user can't create new snapshots
      throw new Error("Share link client can't create new snapshots");
    },
    getSnapshotKey: async (snapshotProofInfo) => {
      if (!snapshotProofInfo) {
        throw new Error(
          "SnapshotProofInfo not provided when trying to derive a new key"
        );
      }

      const runDocumentShareLinkSnapshotKeyBoxQueryResult =
        await runDocumentShareLinkSnapshotKeyBoxQuery({
          token,
          snapshotId: snapshotProofInfo.snapshotId,
        });

      const snapshotKeyBox =
        runDocumentShareLinkSnapshotKeyBoxQueryResult.data
          ?.documentShareLinkSnapshotKeyBox;
      if (!snapshotKeyBox) {
        throw new Error("Snapshot key box not found");
      }

      const snapshotKey = decryptSnapshotKey({
        ciphertext: snapshotKeyBox.ciphertext,
        nonce: snapshotKeyBox.nonce,
        documentId: docId,
        snapshotId: snapshotProofInfo.snapshotId,
        creatorDeviceEncryptionPublicKey:
          snapshotKeyBox.creatorDevice.encryptionPublicKey,
        receiverDeviceEncryptionPrivateKey:
          shareLinkDevice.encryptionPrivateKey,
      });

      setSnapshotId(snapshotProofInfo.snapshotId);
      setSnapshotKey(sodium.from_base64(snapshotKey));
      setActiveSnapshotAndCommentKeys(
        {
          id: snapshotProofInfo.snapshotId,
          key: snapshotKey,
        },
        {}
      );

      return sodium.from_base64(snapshotKey);
    },
    shouldSendSnapshot: () => {
      // share page link users are not supposed to create new snapshots
      return false;
    },
    isValidClient: async (signingPublicKey: string) => {
      // The client doesn't and shouldn't know about the workspace members
      return true;
    },
    additionalAuthenticationDataValidations: {
      snapshot: SerenitySnapshotPublicData,
    },
    logging: "error",
    sodium,
  });

  const yAwarenessRef = useRef<Awareness>(yAwareness);
  let documentChainStateRef = useRef<documentChain.DocumentChainState>();
  let lastDocumentChainEventRef = useRef<documentChain.DocumentChainEvent>();

  useEffect(() => {
    setTimeout(() => {
      setPassedDocumentLoadingTimeout(true);
    }, 6000);

    return () => {};
  }, []);

  useEffect(() => {
    if (state.context._documentDecryptionState === "complete") {
      setDocumentLoadedOnceFromRemote(true);
    }
  }, [state.context._documentDecryptionState]);

  useEffect(() => {
    if (state.context._ephemeralMessageReceivingErrors.length > 0) {
      const now = new Date(); // Current date and time
      const fiveMinInMs = 60000 * 5;
      const fiveMinsAgo = new Date(now.getTime() - fiveMinInMs);

      if (
        ephemeralUpdateErrorsChangedAt.current === null ||
        ephemeralUpdateErrorsChangedAt.current < fiveMinsAgo
      ) {
        showToast(
          "Can't load or decrypt real-time data from collaborators",
          "info",
          { duration: 15000 }
        );
      }
      ephemeralUpdateErrorsChangedAt.current = new Date();
    }
    // TODO since they are limited to a max length, the length will not be good enough
  }, [state.context._ephemeralMessageReceivingErrors.length]);

  useEffect(() => {
    if (state.matches("failed")) {
      setSyncState({
        variant: "error",
        documentDecryptionState: state.context._documentDecryptionState,
        documentLoadedFromLocalDb: false,
      });
    } else if (
      state.matches("disconnected") ||
      (state.matches("connecting") && state.context._websocketRetries > 1)
    ) {
      if (syncState.variant === "online") {
        // TODO check for desktop app since there changes will also be stored locally
        if (Platform.OS === "web") {
          showToast(
            "You went offline. Your pending changes will be lost unless you reconnect.",
            "error",
            { duration: 30000 }
          );
        } else {
          showToast(
            "You went offline. Your pending changes will be stored locally and synced when you reconnect.",
            "info",
            { duration: 15000 }
          );
        }
      }
      setSyncState({
        variant: "offline",
        pendingChanges: state.context._pendingChangesQueue.length,
      });
    } else {
      setSyncState({ variant: "online" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.value,
    state.context._websocketRetries,
    state.context._pendingChangesQueue.length,
    setSyncState,
  ]);

  const documentLoaded =
    state.context._documentDecryptionState === "complete" ||
    documentLoadedOnceFromRemote;

  let documentState: DocumentState = "loading";
  if (state.matches("failed")) {
    documentState = "error";
  } else if (documentLoaded) {
    documentState = "active";
  }

  useEffect(() => {
    setDocumentState(documentState);
  }, [documentState, setDocumentState]);

  if (state.matches("noAccess")) {
    return <PageNoAccessError />;
  }

  if (
    passedDocumentLoadingTimeout &&
    !documentLoaded &&
    state.context._documentDecryptionState === "pending"
  ) {
    return <PageLoadingError reloadPage={reloadPage} />;
  }

  return (
    <>
      <Modal
        isVisible={!isClosedErrorModal && state.matches("failed")}
        onBackdropPress={() => {
          setIsClosedErrorModal(true);
        }}
      >
        <ModalHeader>
          Failed to load or decrypt {documentLoaded ? "update" : "the page"}
        </ModalHeader>
        <Description variant="modal">
          {documentLoaded
            ? "Incoming page updates couldn't be loaded or decrypted."
            : "The entire page could not be loaded or decrypted, but as much content as possible has been restored."}
        </Description>
        <Description variant="modal">
          {
            "Editing has been disabled, but you still can select and copy the content."
          }
        </Description>
        <Description variant="modal">
          {documentLoaded
            ? "Please save your recent changes and try to reload the page. If the problem persists, please contact support."
            : "Please try to reload the page. If the problem persists, please contact support."}
        </Description>
        <ModalButtonFooter
          confirm={
            <Button
              onPress={() => {
                setIsClosedErrorModal(true);
              }}
              variant="primary"
            >
              Close dialog
            </Button>
          }
          cancel={
            <Button
              onPress={() => {
                reloadPage();
              }}
              variant="secondary"
            >
              Reload page
            </Button>
          }
        />
      </Modal>
      {!hasEditorSidebar && syncState.variant === "offline" ? (
        <View style={tw`bg-gray-200 py-2`}>
          <Text variant="xs" style={tw`mx-auto`}>
            You’re offline. Changes will sync next time you are online.
          </Text>
        </View>
      ) : null}
      <Editor
        editable={false} // until we add EDITOR sharing
        // editable={!state.matches("failed")}
        documentId={docId}
        workspaceId={workspaceId}
        yDocRef={yDocRef}
        yAwarenessRef={yAwarenessRef}
        // openDrawer={navigation.openDrawer}
        openDrawer={() => undefined}
        updateTitle={() => undefined}
        isNew={false}
        documentLoaded={documentLoaded || state.matches("failed")}
        documentState={documentState}
      />
    </>
  );
};
