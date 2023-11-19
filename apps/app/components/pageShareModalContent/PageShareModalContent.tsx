import { useRoute } from "@react-navigation/native";
import * as documentChain from "@serenity-kit/document-chain";
import { notNull, ShareDocumentRole } from "@serenity-tools/common";
import {
  Button,
  Description,
  FormWrapper,
  Heading,
  IconButton,
  InfoMessage,
  List,
  ListHeader,
  ListItem,
  ListText,
  ModalHeader,
  Select,
  SelectItem,
  SharetextBox,
  Spinner,
  tw,
  useIsDesktopDevice,
  View,
} from "@serenity-tools/ui";
import * as Clipboard from "expo-clipboard";
import { HStack } from "native-base";
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import {
  runRemoveDocumentShareLinkMutation,
  useDocumentChainQuery,
  useDocumentShareLinksQuery,
} from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { getMainDevice } from "../../store/mainDeviceMemoryStore";
import { WorkspaceDrawerScreenProps } from "../../types/navigationProps";
import { createDocumentShareLink } from "../../utils/document/createDocumentShareLink";
import { useEditorStore } from "../../utils/editorStore/editorStore";
import { VerifyPasswordModal } from "../verifyPasswordModal/VerifyPasswordModal";

const styles = StyleSheet.create({
  createShareLinkButton: tw`self-start`,
});

const CLIPBOARD_NOTICE_TIMEOUT_SECONDS = 1;

export function PageShareModalContent() {
  const route = useRoute<WorkspaceDrawerScreenProps<"Page">["route"]>();
  const pageId = route.params.pageId;
  const [documentShareLinksResult, refetchDocumentShareLinks] =
    useDocumentShareLinksQuery({
      variables: { documentId: pageId },
    });
  const isDesktopDevice = useIsDesktopDevice();
  const [isClipboardNoticeActive, setIsClipboardNoticeActive] = useState(false);
  const [pageShareLink, setPageShareLink] = useState<string | null>(null);
  const documentShareLinks =
    documentShareLinksResult.data?.documentShareLinks?.nodes?.filter(notNull) ||
    [];
  const [sharingRole, setSharingRole] = useState<ShareDocumentRole>("VIEWER");
  const documentState = useEditorStore((state) => state.documentState);
  const snapshotKey = useEditorStore((state) => state.snapshotKey);
  const snapshotId = useEditorStore((state) => state.snapshotId);
  const [
    isPasswordModalVisibleForCreateShareLink,
    setIsPasswordModalVisibleForCreateShareLink,
  ] = useState(false);
  const [
    isPasswordModalVisibleForDeleteShareLink,
    setIsPasswordModalVisibleForDeleteShareLink,
  ] = useState(false);
  const [
    shareDeviceSigningPublicKeyToBeRemoved,
    setShareDeviceSigningPublicKeyToBeRemoved,
  ] = useState<null | string>(null);

  const [documentChainQueryResult, refetchDocumentChainQuery] =
    useDocumentChainQuery({
      variables: { documentId: pageId },
    });
  const { activeDevice } = useAuthenticatedAppContext();

  const { documentChainState, lastDocumentChainEvent } = useMemo(() => {
    if (documentChainQueryResult.data?.documentChain?.nodes) {
      let lastDocumentChainEvent: documentChain.DocumentChainEvent | null =
        null;

      const userChainResult = documentChain.resolveState({
        events: documentChainQueryResult.data.documentChain.nodes
          .filter(notNull)
          .map((event) => {
            const data = documentChain.DocumentChainEvent.parse(
              JSON.parse(event.serializedContent)
            );
            lastDocumentChainEvent = data;
            return data;
          }),
        knownVersion: documentChain.version,
      });
      return {
        documentChainState: userChainResult.currentState,
        lastDocumentChainEvent,
      };
    } else {
      return { documentChainState: null, lastDocumentChainEvent: null };
    }
  }, [documentChainQueryResult]);

  const createShareLinkPreflight = async (sharingRole: ShareDocumentRole) => {
    const mainDevice = getMainDevice();
    if (mainDevice) {
      await createShareLink(sharingRole);
      return;
    } else {
      setIsPasswordModalVisibleForCreateShareLink(true);
    }
  };

  const createShareLink = async (sharingRole: ShareDocumentRole) => {
    if (!activeDevice.encryptionPrivateKey) {
      console.error("active device doesn't have encryptionPrivateKey");
      return;
    }
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      throw new Error("No active main device available");
    }
    if (lastDocumentChainEvent === null) {
      throw new Error("Document chain not available");
    }
    if (snapshotKey === null) {
      throw new Error("snapshotKey not available");
    }
    if (snapshotId === null) {
      throw new Error("snapshotId not available");
    }

    try {
      const shareLinkData = await createDocumentShareLink({
        snapshotId,
        documentId: pageId,
        sharingRole,
        mainDevice,
        prevDocumentChainEvent: lastDocumentChainEvent,
        snapshotKey,
      });
      setPageShareLink(shareLinkData.documentShareLink);
      refetchDocumentChainQuery();
      refetchDocumentShareLinks();
    } catch (error) {
      console.error(error.message);
    }
  };

  const deleteShareLinkPreflight = async (
    shareDeviceSigningPublicKey: string
  ) => {
    const mainDevice = getMainDevice();
    if (mainDevice) {
      await deleteShareLink(shareDeviceSigningPublicKey);
      return;
    } else {
      setShareDeviceSigningPublicKeyToBeRemoved(shareDeviceSigningPublicKey);
      setIsPasswordModalVisibleForDeleteShareLink(true);
    }
  };

  const deleteShareLink = async (shareDeviceSigningPublicKey: string) => {
    const mainDevice = getMainDevice();
    if (!mainDevice) {
      throw new Error("No active main device available");
    }

    if (lastDocumentChainEvent === null) {
      throw new Error("Document chain not available");
    }

    const documentChainEvent = documentChain.removeShareDocumentDevice({
      authorKeyPair: {
        privateKey: mainDevice.signingPrivateKey,
        publicKey: mainDevice.signingPublicKey,
      },
      signingPublicKey: shareDeviceSigningPublicKey,
      prevEvent: lastDocumentChainEvent,
    });

    const removeDocumentShareLink = await runRemoveDocumentShareLinkMutation(
      {
        input: {
          serializedDocumentChainEvent: JSON.stringify(documentChainEvent),
        },
      },
      {}
    );
    if (!removeDocumentShareLink.data?.removeDocumentShareLink?.success) {
      console.error(
        removeDocumentShareLink.error?.message || "Could not remove share link"
      );
    }
    refetchDocumentChainQuery();
    refetchDocumentShareLinks();
  };

  const copyLinkText = async () => {
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
            <FormWrapper>
              <ModalHeader>Share a page</ModalHeader>
              <View testID="document-share-modal">
                <SharetextBox
                  testID="document-share-modal__share-link-text"
                  selectable={pageShareLink !== null}
                  onCopyPress={copyLinkText}
                  isClipboardNoticeActive={isClipboardNoticeActive}
                >
                  {pageShareLink !== null
                    ? pageShareLink
                    : 'The share link will be generated here\nClick on "Create page link" to generate a new link'}
                </SharetextBox>
                <HStack alignItems={"center"} style={tw`mb-4`} space={2}>
                  <Select
                    onValueChange={(value) => {
                      const newSharingRole = ShareDocumentRole.parse(value);
                      setSharingRole(newSharingRole);
                    }}
                    testID={`document-share-modal__select-role-menu`}
                    aria-label="Set sharing access level"
                    defaultValue="VIEWER"
                  >
                    <SelectItem label="Editor" value="EDITOR" />
                    <SelectItem label="Commenter" value="COMMENTER" />
                    <SelectItem label="Viewer" value="VIEWER" />
                  </Select>
                  <Button
                    onPress={() => {
                      createShareLinkPreflight(sharingRole);
                    }}
                    style={styles.createShareLinkButton}
                    testID="document-share-modal__create-share-link-button"
                    disabled={documentState !== "active"}
                    isLoading={documentState === "loading"}
                  >
                    Create page link
                  </Button>
                </HStack>
              </View>
              <View>
                <Heading lvl={3} padded>
                  Links
                </Heading>
                <Description variant="form">
                  sorted by time of creation.
                </Description>
              </View>
              <List
                data={documentShareLinks}
                emptyString={"No active share links"}
                header={<ListHeader data={["Page Share Links"]} />}
                testID="document-share-modal__share-links-list"
              >
                {documentChainState &&
                  Object.entries(documentChainState.devices).map(
                    ([signingPublicKey, documentShareLink]) => {
                      return (
                        <ListItem
                          key={signingPublicKey}
                          // onSelect={() => props.onSelect(documentShareLink.token)}
                          mainItem={
                            <>
                              <ListText style={[tw`w-1/2 md:w-2/3`]}>
                                https://serenity.re/page
                              </ListText>
                              <ListText>/</ListText>
                              <ListText style={[tw`w-1/2 md:w-1/4`]} bold>
                                {documentShareLinks.find(
                                  (link) =>
                                    link.deviceSigningPublicKey ===
                                    signingPublicKey
                                )?.token || "ERROR"}
                              </ListText>
                            </>
                          }
                          secondaryItem={
                            <ListText>
                              {documentShareLink.role.charAt(0).toUpperCase() +
                                documentShareLink.role.slice(1).toLowerCase()}
                            </ListText>
                          }
                          actionItem={
                            <IconButton
                              name={"delete-bin-line"}
                              color={isDesktopDevice ? "gray-900" : "gray-700"}
                              onPress={() => {
                                deleteShareLinkPreflight(signingPublicKey);
                              }}
                            />
                          }
                        />
                      );
                    }
                  )}
              </List>
            </FormWrapper>
          )}
          <VerifyPasswordModal
            isVisible={isPasswordModalVisibleForCreateShareLink}
            description="Creating a share link requires access to the main account and therefore verifying your password is required"
            onSuccess={() => {
              setIsPasswordModalVisibleForCreateShareLink(false);
              createShareLink(sharingRole);
            }}
            onCancel={() => {
              setIsPasswordModalVisibleForCreateShareLink(false);
            }}
          />
          <VerifyPasswordModal
            isVisible={isPasswordModalVisibleForDeleteShareLink}
            description="Deleting a share link requires access to the main account and therefore verifying your password is required"
            onSuccess={() => {
              if (shareDeviceSigningPublicKeyToBeRemoved === null) {
                throw new Error(
                  "ShareDeviceSigningPublicKeyToBeRemoved not defined"
                );
              }
              setIsPasswordModalVisibleForDeleteShareLink(false);
              deleteShareLink(shareDeviceSigningPublicKeyToBeRemoved);
            }}
            onCancel={() => {
              setIsPasswordModalVisibleForDeleteShareLink(false);
            }}
          />
        </>
      )}
    </>
  );
}
