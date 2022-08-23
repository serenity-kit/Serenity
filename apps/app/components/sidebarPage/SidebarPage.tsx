import { useFocusRing } from "@react-native-aria/focus";
import { useLinkProps } from "@react-navigation/native";
import {
  createDocumentKey,
  encryptDocumentTitle,
  folderDerivedKeyContext,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
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
import { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { useClient } from "urql";
import { useUpdateDocumentNameMutation } from "../../generated/graphql";
import { getDevices } from "../../utils/device/getDevices";
import { useDocumentStore } from "../../utils/document/documentStore";
import { getFolder } from "../../utils/folder/getFolder";
import { getWorkspaceKey } from "../../utils/workspace/getWorkspaceKey";
import SidebarPageMenu from "../sidebarPageMenu/SidebarPageMenu";

type Props = ViewProps & {
  documentId: string;
  workspaceId: string;
  folderSubkeyId?: number;
  documentName: string;
  depth?: number;
  onRefetchDocumentsPress: () => void;
};

export default function SidebarPage(props: Props) {
  const isDesktopDevice = useIsDesktopDevice();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();
  const { depth = 0 } = props;

  const updateDocumentName = async (name: string) => {
    const devices = await getDevices({ urqlClient });
    if (!devices) {
      console.error("No devices found!");
      return;
    }
    let workspaceKey = "";
    try {
      workspaceKey = await getWorkspaceKey({
        workspaceId: props.workspaceId,
        devices,
        urqlClient,
      });
    } catch (error: any) {
      // TODO: handle device not registered error
      console.error(error);
      return;
    }
    const folderKeyResult = await kdfDeriveFromKey({
      key: workspaceKey,
      context: folderDerivedKeyContext,
      subkeyId: props.folderSubkeyId,
    });
    const documentKeyData = await createDocumentKey({
      folderKey: folderKeyResult.key,
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
      const parentFolder = await getFolder({
        id: document?.parentFolderId!,
        urqlClient,
      });
      const folderKeyData = await kdfDeriveFromKey({
        key: workspaceKey,
        context: folderDerivedKeyContext,
        subkeyId: parentFolder.subKeyId!,
      });
      documentStore.update(document, folderKeyData.key);
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

  const maxWidth = 32 - depth * 2;

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
                value={props.documentName}
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
                {props.documentName}
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
