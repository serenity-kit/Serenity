import { RouteProp, useRoute } from "@react-navigation/native";
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
import { useState } from "react";
import { StyleSheet } from "react-native";
import { useDocumentShareLinksQuery } from "../../generated/graphql";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext";
import { WorkspaceDrawerParamList } from "../../types/navigation";
import { createDocumentShareLink } from "../../utils/document/createDocumentShareLink";
import { notNull } from "../../utils/notNull/notNull";

const styles = StyleSheet.create({
  createShareLinkButton: tw`mb-8 self-start`,
});

const CLIPBOARD_NOTICE_TIMEOUT_SECONDS = 2;

export function PageShareModalContent() {
  const route = useRoute<RouteProp<WorkspaceDrawerParamList, "Page">>();
  const [documentShareLinksResult] = useDocumentShareLinksQuery({
    variables: { documentId: route.params.pageId },
  });
  const isDesktopDevice = useIsDesktopDevice();
  const { activeDevice } = useWorkspaceContext();

  const [isClipboardNoticeActive, setIsClipboardNoticeActive] = useState(false);
  const [selectedPageShareLinkToken, setSelectedPageShareLinkToken] = useState<
    string | null
  >(null);
  const [pageShareLink, setPageShareLink] = useState<string | null>(null);

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
      console.log(shareLinkData);
      setSelectedPageShareLinkToken(shareLinkData.token);
      setPageShareLink(shareLinkData.documentShareLink);
    } catch (error) {
      console.error(error.message);
    }
  };

  const copyInvitationText = () => {
    if (!pageShareLink) {
      return;
    }
    Clipboard.setString(pageShareLink);
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
              <View>
                <Text
                  variant="xs"
                  testID="workspaceInvitationInstructionsText"
                  selectable={selectedPageShareLinkToken !== null}
                >
                  {selectedPageShareLinkToken !== null
                    ? pageShareLink
                    : 'The share link will be generated here\nClick on "Create page share link" to generate a new link'}
                </Text>
                {selectedPageShareLinkToken !== null ? (
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
                            https://serenity.re/accept-workspace-invitation
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
