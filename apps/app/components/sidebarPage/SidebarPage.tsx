import { useFocusRing } from "@react-native-aria/focus";
import { useLinkProps } from "@react-navigation/native";
import {
  decryptDocumentTitle,
  recreateSnapshotKey,
} from "@serenity-tools/common";
import {
  Icon,
  InlineInput,
  Pressable,
  SidebarText,
  tw,
  useIsDesktopDevice,
  View,
  ViewProps,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { KeyDerivationTrace, useDocumentQuery } from "../../generated/graphql";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext";
import { useActiveDocumentInfoStore } from "../../utils/document/activeDocumentInfoStore";
import { updateDocumentName } from "../../utils/document/updateDocumentName";
import { deriveFolderKey } from "../../utils/folder/deriveFolderKeyData";
import { useFolderKeyStore } from "../../utils/folder/folderKeyStore";
import SidebarPageMenu from "../sidebarPageMenu/SidebarPageMenu";

type Props = ViewProps & {
  documentId: string;
  workspaceId: string;
  parentFolderId: string;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  subkeyId?: number | null;
  nameKeyDerivationTrace: KeyDerivationTrace;
  depth?: number;
  onRefetchDocumentsPress: () => void;
};

export default function SidebarPage(props: Props) {
  const isDesktopDevice = useIsDesktopDevice();
  const { activeDevice } = useWorkspaceContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("decrypting…");
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();
  const activeDocument = useActiveDocumentInfoStore((state) => state.document);
  const updateActiveDocumentInfoStore = useActiveDocumentInfoStore(
    (state) => state.update
  );
  const getFolderKey = useFolderKeyStore((state) => state.getFolderKey);
  const [documentResult] = useDocumentQuery({
    variables: { id: props.documentId },
  });

  const linkProps = useLinkProps({
    to: {
      screen: "Workspace",
      params: {
        workspaceId: props.workspaceId,
        screen: "WorkspaceDrawer",
        params: {
          screen: "Page",
          params: {
            pageId: props.documentId,
          },
        },
      },
    },
  });

  useEffect(() => {
    if (documentResult.data?.document?.id) {
      decryptTitle();
    }
  }, [props.encryptedName, props.subkeyId, documentResult.data?.document?.id]);

  const decryptTitle = async () => {
    if (!props.encryptedName || !props.encryptedNameNonce) {
      // this case can happen when the document is created but the title is not yet set
      setDocumentTitle("Untitled");
      return;
    }
    try {
      const document = documentResult.data?.document;
      if (!document) {
        console.log("Unable to retrieve document!");
        return;
      }
      // TODO: optimize this by using the `getFolderKey()` function
      // so that we don't need to load each folder multiple times
      const folderKeyData = await deriveFolderKey({
        folderId: props.parentFolderId,
        activeDevice,
        keyDerivationTrace: props.nameKeyDerivationTrace,
      });
      const folderKey = folderKeyData[folderKeyData.length - 1].key;
      const documentKeyData = await recreateSnapshotKey({
        folderKey: folderKey,
        subkeyId: props.nameKeyDerivationTrace.subkeyId,
      });
      const documentTitle = await decryptDocumentTitle({
        key: documentKeyData.key,
        ciphertext: props.encryptedName,
        publicNonce: props.encryptedNameNonce,
      });
      setDocumentTitle(documentTitle);
    } catch (error) {
      console.error(error);
      setDocumentTitle("decryption error");
    }
  };
  const { depth = 0 } = props;

  const updateDocumentTitle = async (name: string) => {
    const document = documentResult.data?.document;
    if (!document) {
      console.error("Document not loaded");
      return;
    }
    try {
      const updatedDocument = await updateDocumentName({
        document,
        name,
        activeDevice,
      });
      // FIXME: do we update this when it's not the active document?
      updateActiveDocumentInfoStore(updatedDocument, activeDevice);
    } catch (error) {
      console.error(error);
    }
    setIsEditing(false);
  };

  const styles = StyleSheet.create({
    page: tw``,
    hover: tw`bg-gray-200`,
    focusVisible: Platform.OS === "web" ? tw`se-inset-focus-mini` : {},
  });

  const maxWidthBase = isDesktopDevice ? 32 : 44;
  const maxWidth = maxWidthBase - depth * 2;

  return (
    <View
      style={[
        styles.page,
        props.style,
        isHovered && styles.hover,
        isFocusVisible && styles.focusVisible,
      ]}
      // @ts-expect-error as views usually don't have hover
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <HStack>
        <Pressable
          {...linkProps}
          {...focusRingProps} // needed so focus is shown on view-wrapper
          style={[
            tw`grow-1 pl-${7 + depth * 3}`, // needed so clickable area is as large as possible
          ]}
          // disable default outline styles and add 1 overridden style manually (grow)
          _focusVisible={{
            _web: { style: { outlineStyle: "none", flexGrow: 1 } },
          }}
        >
          <View style={tw`pl-${6 + depth} md:pl-2.5`}>
            <HStack
              alignItems="center"
              style={[
                tw`py-2 md:py-1.5`,
                !isDesktopDevice && tw`border-b border-gray-200`,
              ]}
            >
              <View style={!isDesktopDevice && tw`-ml-1`}>
                <Icon name="page" size={5} mobileSize={8} color={"gray-600"} />
              </View>
              {isEditing ? (
                <InlineInput
                  onCancel={() => {
                    setIsEditing(false);
                  }}
                  onSubmit={updateDocumentTitle}
                  value={documentTitle}
                  style={tw`ml-0.5 w-${maxWidth}`}
                  testID={`sidebar-document--${props.documentId}__edit-name`}
                />
              ) : (
                <SidebarText
                  style={[tw`pl-2 md:pl-1.5 max-w-${maxWidth}`]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  bold={activeDocument?.id === props.documentId}
                  testID={`sidebar-document--${props.documentId}`}
                >
                  {documentTitle}
                </SidebarText>
              )}
            </HStack>
          </View>
        </Pressable>

        <HStack
          alignItems="center"
          space={1}
          style={[
            tw`pr-4 md:pr-2 ${isHovered || !isDesktopDevice ? "" : "hidden"}`,
            !isDesktopDevice && tw`border-b border-gray-200`,
          ]}
        >
          <SidebarPageMenu
            workspaceId={props.workspaceId}
            documentId={props.documentId}
            documentTitle={documentTitle}
            refetchDocuments={props.onRefetchDocumentsPress}
            onUpdateNamePress={() => {
              setIsEditing(true);
            }}
          />
        </HStack>
      </HStack>
    </View>
  );
}
