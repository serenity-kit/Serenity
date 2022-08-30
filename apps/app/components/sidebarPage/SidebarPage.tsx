import { useFocusRing } from "@react-native-aria/focus";
import { useLinkProps } from "@react-navigation/native";
import {
  createDocumentKey,
  decryptDocumentTitle,
  encryptDocumentTitle,
  recreateDocumentKey,
} from "@serenity-tools/common";
import {
  Icon,
  InlineInput,
  Pressable,
  Text,
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
import { useDocumentStore } from "../../utils/document/documentStore";
import { getFolderKey } from "../../utils/folder/getFolderKey";
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
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("Decrypting...");
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();
  const document = useDocumentStore((state) => state.document);
  const documentStore = useDocumentStore();
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
      setDocumentTitle("Decryption error");
    }
  };

  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const { depth = 0 } = props;

  const updateDocumentName = async (name: string) => {
    const folderKeyData = await getFolderKey({
      folderId: props.parentFolderId,
      workspaceId: props.workspaceId,
      urqlClient,
    });
    const documentKeyData = await createDocumentKey({
      folderKey: folderKeyData.key,
    });
    const encryptedDocumentTitle = await encryptDocumentTitle({
      title: name,
      key: documentKeyData.key,
    });
    const updateDocumentNameResult = await updateDocumentNameMutation({
      input: {
        id: props.documentId,
        name,
        encryptedName: encryptedDocumentTitle.ciphertext,
        encryptedNameNonce: encryptedDocumentTitle.publicNonce,
        subkeyId: documentKeyData.subkeyId,
      },
    });
    if (updateDocumentNameResult.data?.updateDocumentName?.document) {
      // TODO show notification
      const document =
        updateDocumentNameResult.data.updateDocumentName.document;
      documentStore.update(document, urqlClient);
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
            _web: { style: { outlineWidth: 0, flexGrow: 1 } },
          }}
        >
          <HStack
            alignItems="center"
            style={tw`py-3 md:py-1.5 pl-${5 + depth} md:pl-2.5`}
          >
            <Icon
              name="page"
              size={5}
              mobileSize={8}
              color={tw.color("gray-600")}
            />
            {isEditing ? (
              <InlineInput
                onCancel={() => {
                  setIsEditing(false);
                }}
                onSubmit={updateDocumentName}
                value={documentTitle}
                style={tw`ml-0.5 w-${maxWidth}`}
              />
            ) : (
              <Text
                variant="small"
                style={[tw`pl-1.5 max-w-${maxWidth}`]}
                numberOfLines={1}
                ellipsizeMode="tail"
                bold={document?.id === props.documentId}
              >
                {documentTitle}
              </Text>
            )}
          </HStack>
        </Pressable>

        {(isHovered || !isDesktopDevice) && (
          <HStack alignItems="center" space={1} style={tw`pr-3 md:pr-2`}>
            <SidebarPageMenu
              documentId={props.documentId}
              refetchDocuments={props.onRefetchDocumentsPress}
              onUpdateNamePress={() => {
                setIsEditing(true);
              }}
            />
          </HStack>
        )}
      </HStack>
    </View>
  );
}
