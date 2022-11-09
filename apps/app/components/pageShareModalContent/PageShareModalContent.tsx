import { createSnapshot } from "@naisho/core";
import { RouteProp, useRoute } from "@react-navigation/native";
import { createSnapshotKey } from "@serenity-tools/common";
import sodium, { KeyPair } from "@serenity-tools/libsodium";
import {
  Button,
  IconButton,
  InfoMessage,
  List,
  ListHeader,
  ListItem,
  ListText,
  Spinner,
  Text,
  Tooltip,
  tw,
  useIsDesktopDevice,
  View,
} from "@serenity-tools/ui";
import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { v4 as uuidv4 } from "uuid";
import {
  runRemoveDocumentShareLinkMutation,
  useDocumentShareLinksQuery,
} from "../../generated/graphql";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext";
import { WorkspaceDrawerParamList } from "../../types/navigation";
import { useActiveDocumentInfoStore } from "../../utils/document/activeDocumentInfoStore";
import { buildSnapshotDeviceKeyBoxes } from "../../utils/document/buildSnapshotDeviceKeyBoxes";
import { createDocumentShareLink } from "../../utils/document/createDocumentShareLink";
import { deriveFolderKey } from "../../utils/folder/deriveFolderKeyData";
import { notNull } from "../../utils/notNull/notNull";
import { getWorkspace } from "../../utils/workspace/getWorkspace";

const styles = StyleSheet.create({
  createShareLinkButton: tw`mb-8 self-start`,
  shareLinkWrapperBase: tw`relative mb-2 py-4 px-5 border rounded`,
  shareLinkWrapperActive: tw`bg-primary-100/40 border-primary-200`,
  shareLinkWrapperInactive: tw`bg-gray-100 border-gray-200`,
  shareLinkTextActive: tw`text-primary-900`,
  shareLinkTextInactive: tw`text-gray-400`,
});

const CLIPBOARD_NOTICE_TIMEOUT_SECONDS = 1;

export function PageShareModalContent() {
  const route = useRoute<RouteProp<WorkspaceDrawerParamList, "Page">>();
  const [documentShareLinksResult, refetchDocumentShareLinks] =
    useDocumentShareLinksQuery({
      variables: { documentId: route.params.pageId },
    });
  const isDesktopDevice = useIsDesktopDevice();
  const { activeDevice } = useWorkspaceContext();
  const signatureKeyPair: KeyPair = useMemo(() => {
    return {
      publicKey: sodium.from_base64(activeDevice.signingPublicKey),
      privateKey: sodium.from_base64(activeDevice.signingPrivateKey!),
      keyType: "ed25519",
    };
  }, [activeDevice]);

  const [isClipboardNoticeActive, setIsClipboardNoticeActive] = useState(false);
  const [pageShareLink, setPageShareLink] = useState<string | null>(null);
  const activeDocument = useActiveDocumentInfoStore((state) => state.document);
  const documentShareLinks =
    documentShareLinksResult.data?.documentShareLinks?.nodes?.filter(notNull) ||
    [];

  const createShareLink = async () => {
    if (!activeDevice.encryptionPrivateKey) {
      console.error("active device doesn't have encryptionPrivateKey");
      return;
    }
    const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
      activeDevice;
    try {
      const shareLinkData = await createDocumentShareLink({
        documentId: route.params.pageId,
        creatorDevice,
        creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
      });
      setPageShareLink(shareLinkData.documentShareLink);
      refetchDocumentShareLinks();
    } catch (error) {
      console.error(error.message);
    }
  };

  const removeShareLink = async (token: string) => {
    if (!activeDocument) {
      console.error("document not found");
      return;
    }
    const workspace = await getWorkspace({
      workspaceId: activeDocument.workspaceId!,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace) {
      console.error("workspace not found");
      return;
    }
    if (!workspace.currentWorkspaceKey) {
      console.error("No workspace key found for this workspace");
      return;
    }
    const keyTrace = await deriveFolderKey({
      folderId: activeDocument?.parentFolderId!,
      workspaceId: activeDocument?.workspaceId!,
      workspaceKeyId: workspace.currentWorkspaceKey?.id,
      activeDevice,
    });
    const snapshotKeyData = await createSnapshotKey({
      folderKey: keyTrace.folderKeyData.key,
    });
    // FIXME: grab the latest content for the snapshot
    const content = "";
    const snapshot = await createSnapshot(
      content,
      {
        docId: route.params.pageId,
        pubKey: sodium.to_base64(signatureKeyPair.publicKey),
        snapshotId: uuidv4(),
      },
      sodium.from_base64(snapshotKeyData.key),
      signatureKeyPair
    );
    const snapshotDeviceKeyBoxes = await buildSnapshotDeviceKeyBoxes({
      snapshotKey: snapshotKeyData.key,
      workspaceId: workspace.id,
      creatorDevice: activeDevice,
    });
    const removeDocumentShareLink = await runRemoveDocumentShareLinkMutation(
      {
        input: {
          token,
          creatorDevice: {
            signingPublicKey: activeDevice.signingPublicKey,
            encryptionPublicKey: activeDevice.encryptionPublicKey,
            encryptionPublicKeySignature:
              activeDevice.encryptionPublicKeySignature!,
          },
          snapshot,
          snapshotDeviceKeyBoxes,
        },
      },
      {}
    );
    if (!removeDocumentShareLink.data?.removeDocumentShareLink?.success) {
      console.error(
        removeDocumentShareLink.error?.message || "Could not remove share link"
      );
    }
    refetchDocumentShareLinks();
  };

  const copyInvitationText = async () => {
    if (!pageShareLink) {
      return;
    }
    await Clipboard.setStringAsync(pageShareLink);
    setIsClipboardNoticeActive(true);
    setTimeout(() => {
      setIsClipboardNoticeActive(false);
    }, CLIPBOARD_NOTICE_TIMEOUT_SECONDS * 1000);
  };

  return (
    <>
      {documentShareLinksResult.fetching ? (
        <Spinner fadeIn />
      ) : (
        <>
          {documentShareLinksResult.error ? (
            <InfoMessage variant="error">
              Failed to fetch the page share links. Please try again later.
            </InfoMessage>
          ) : (
            <>
              <View
                style={[
                  styles.shareLinkWrapperBase,
                  pageShareLink
                    ? styles.shareLinkWrapperActive
                    : styles.shareLinkWrapperInactive,
                ]}
              >
                <Text
                  variant="xs"
                  testID="workspaceInvitationInstructionsText"
                  selectable={pageShareLink !== null}
                  style={[
                    pageShareLink
                      ? styles.shareLinkTextActive
                      : styles.shareLinkTextInactive,
                  ]}
                >
                  {pageShareLink !== null
                    ? pageShareLink
                    : 'The share link will be generated here\nClick on "Create page share link" to generate a new link'}
                </Text>
                {pageShareLink !== null ? (
                  <View style={tw`absolute right-3 top-3`}>
                    <Tooltip
                      label={
                        isClipboardNoticeActive
                          ? "Copying..."
                          : "Copy to clipboard"
                      }
                      placement={"left"}
                    >
                      <IconButton
                        name="file-copy-line"
                        color={"primary-300"}
                        transparent
                        onPress={copyInvitationText}
                        isLoading={isClipboardNoticeActive}
                      />
                    </Tooltip>
                  </View>
                ) : null}
              </View>
              <Button
                onPress={createShareLink}
                style={styles.createShareLinkButton}
              >
                Create Page Link
              </Button>
              <List
                data={documentShareLinks}
                emptyString={"No active share links"}
                header={<ListHeader data={["Page Share Links"]} />}
              >
                {documentShareLinks.map((documentShareLink) => {
                  return (
                    <ListItem
                      key={documentShareLink.token}
                      // onSelect={() => props.onSelect(documentShareLink.token)}
                      mainItem={
                        <>
                          <ListText style={[tw`w-1/2 md:w-2/3`]}>
                            https://serenity.re/page
                          </ListText>
                          <ListText>/</ListText>
                          <ListText style={[tw`w-1/2 md:w-1/4`]} bold>
                            {documentShareLink.token}
                          </ListText>
                        </>
                      }
                      actionItem={
                        <IconButton
                          name={"delete-bin-line"}
                          color={isDesktopDevice ? "gray-900" : "gray-700"}
                          onPress={() => {
                            // TODO delete documentShareLink
                            removeShareLink(documentShareLink.token);
                          }}
                        />
                      }
                    />
                  );
                })}
              </List>
            </>
          )}
        </>
      )}
    </>
  );
}
