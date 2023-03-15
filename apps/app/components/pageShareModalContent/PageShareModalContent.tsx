import { useRoute } from "@react-navigation/native";
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
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import sodium, { KeyPair } from "react-native-libsodium";
import {
  Role,
  runRemoveDocumentShareLinkMutation,
  useDocumentShareLinksQuery,
} from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { WorkspaceDrawerScreenProps } from "../../types/navigationProps";
import { createDocumentShareLink } from "../../utils/document/createDocumentShareLink";
import { notNull } from "../../utils/notNull/notNull";

const styles = StyleSheet.create({
  createShareLinkButton: tw`self-start`,
  shareLinkWrapperBase: tw`relative mb-2 py-4 px-5 border rounded`,
  shareLinkWrapperActive: tw`bg-primary-100/40 border-primary-200`,
  shareLinkWrapperInactive: tw`bg-gray-100 border-gray-200`,
  shareLinkTextActive: tw`text-primary-900`,
  shareLinkTextInactive: tw`text-gray-400`,
  createShareLinkOptions: tw`flex-row justify-between items-center mb-4`,
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
  const { activeDevice } = useAuthenticatedAppContext();
  const signatureKeyPair: KeyPair = useMemo(() => {
    return {
      publicKey: sodium.from_base64(activeDevice.signingPublicKey),
      privateKey: sodium.from_base64(activeDevice.signingPrivateKey!),
      keyType: "ed25519",
    };
  }, [activeDevice]);

  const [isClipboardNoticeActive, setIsClipboardNoticeActive] = useState(false);
  const [pageShareLink, setPageShareLink] = useState<string | null>(null);
  const documentShareLinks =
    documentShareLinksResult.data?.documentShareLinks?.nodes?.filter(notNull) ||
    [];
  const [sharingRole, _setSharingRole] = useState(Role.Viewer);

  const setSharingRole = (role: string) => {
    // admin sharing is disallowed
    if (role === "editor") {
      _setSharingRole(Role.Editor);
    } else if (role === "commenter") {
      _setSharingRole(Role.Commenter);
    } else if (role === "viewer") {
      _setSharingRole(Role.Viewer);
    } else {
      console.error("Unknown role: ", role);
      _setSharingRole(Role.Viewer);
    }
  };

  const getSharingRoleText = (role: Role) => {
    if (role === Role.Admin) {
      return "Admin";
    } else if (role === Role.Editor) {
      return "Editor";
    } else if (role === Role.Commenter) {
      return "Commenter";
    } else if (role === Role.Viewer) {
      return "Viewer";
    }
    return "Unknown";
  };

  const createShareLink = async (sharingRole: Role) => {
    if (!activeDevice.encryptionPrivateKey) {
      console.error("active device doesn't have encryptionPrivateKey");
      return;
    }
    const { encryptionPrivateKey, signingPrivateKey, ...creatorDevice } =
      activeDevice;
    try {
      const shareLinkData = await createDocumentShareLink({
        documentId: pageId,
        sharingRole,
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
    const removeDocumentShareLink = await runRemoveDocumentShareLinkMutation(
      { input: { token } },
      {}
    );
    if (!removeDocumentShareLink.data?.removeDocumentShareLink?.success) {
      console.error(
        removeDocumentShareLink.error?.message || "Could not remove share link"
      );
    }
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
                <View style={styles.createShareLinkOptions}>
                  <Select
                    onValueChange={(value: Role) => {
                      setSharingRole(value);
                    }}
                    testID={`document-share-modal__select-role-menu`}
                    accessibilityLabel="Set sharing access level"
                    defaultValue="viewer"
                  >
                    <SelectItem label="Editor" value="editor" />
                    <SelectItem label="Commenter" value="commenter" />
                    <SelectItem label="Viewer" value="viewer" />
                  </Select>
                  <Button
                    onPress={() => {
                      createShareLink(sharingRole);
                    }}
                    style={styles.createShareLinkButton}
                    testID="document-share-modal__create-share-link-button"
                  >
                    Create page link
                  </Button>
                </View>
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
                      secondaryItem={
                        <ListText>
                          {getSharingRoleText(documentShareLink.role)}
                        </ListText>
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
            </FormWrapper>
          )}
        </>
      )}
    </>
  );
}
