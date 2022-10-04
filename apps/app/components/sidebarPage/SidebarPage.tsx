import { useFocusRing } from "@react-native-aria/focus";
import { useLinkProps } from "@react-navigation/native";
import {
  decryptDocumentTitle,
  encryptDocumentTitle,
  recreateDocumentKey,
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
import { useClient } from "urql";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext";
import { useActiveDocumentInfoStore } from "../../utils/document/activeDocumentInfoStore";
import { getFolderKey } from "../../utils/folder/getFolderKey";
import { getWorkspace } from "../../utils/workspace/getWorkspace";
import SidebarPageMenu from "../sidebarPageMenu/SidebarPageMenu";

type Props = ViewProps & {
  documentId: string;
  workspaceId: string;
  parentFolderId: string;
  encryptedName?: string | null;
  encryptedNameNonce?: string | null;
  subkeyId?: number | null;
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
  const document = useActiveDocumentInfoStore((state) => state.document);
  const updateActiveDocumentInfoStore = useActiveDocumentInfoStore(
    (state) => state.update
  );
  const urqlClient = useClient();
  const linkProps = useLinkProps({
    to: {
      screen: "Workspace",
      params: {
        workspaceId: props.workspaceId,
        screen: "Page",
        params: {
          pageId: props.documentId,
        },
      },
    },
  });

  useEffect(() => {
    decryptTitle();
  }, [props.encryptedName, props.subkeyId]);

  const decryptTitle = async () => {
    if (!props.subkeyId || !props.encryptedName || !props.encryptedNameNonce) {
      setDocumentTitle("Untitled");
      return;
    }
    try {
      const folderKeyData = await getFolderKey({
        folderId: props.parentFolderId,
        workspaceId: props.workspaceId,
        urqlClient,
        activeDevice,
      });
      const documentKeyData = await recreateDocumentKey({
        folderKey: folderKeyData.key,
        subkeyId: props.subkeyId,
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

  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const { depth = 0 } = props;

  const updateDocumentName = async (name: string) => {
    const workspace = await getWorkspace({
      workspaceId: props.workspaceId,
      urqlClient,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    const folderKeyData = await getFolderKey({
      folderId: props.parentFolderId,
      workspaceId: props.workspaceId,
      urqlClient,
      activeDevice,
    });
    const documentKeyData = await recreateDocumentKey({
      folderKey: folderKeyData.key,
      subkeyId: document?.subkeyId!,
    });
    const encryptedDocumentTitle = await encryptDocumentTitle({
      title: name,
      key: documentKeyData.key,
    });
    const updateDocumentNameResult = await updateDocumentNameMutation({
      input: {
        id: props.documentId,
        encryptedName: encryptedDocumentTitle.ciphertext,
        encryptedNameNonce: encryptedDocumentTitle.publicNonce,
        workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
        subkeyId: documentKeyData.subkeyId,
      },
    });
    if (updateDocumentNameResult.data?.updateDocumentName?.document) {
      // TODO show notification
      const document =
        updateDocumentNameResult.data.updateDocumentName.document;
      updateActiveDocumentInfoStore(document, activeDevice);
    } else {
      // TODO: show error: couldn't update folder name
      // refetch to revert back to actual name
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
                  onSubmit={updateDocumentName}
                  value={documentTitle}
                  style={tw`ml-0.5 w-${maxWidth}`}
                  testID={`sidebar-document--${props.documentId}__edit-name`}
                />
              ) : (
                <SidebarText
                  style={[tw`pl-2 md:pl-1.5 max-w-${maxWidth}`]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  bold={document?.id === props.documentId}
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
            documentId={props.documentId}
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
