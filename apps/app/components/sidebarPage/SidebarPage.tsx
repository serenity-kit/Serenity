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
import {
  runUpdateDocumentNameMutation,
  useDocumentQuery,
} from "../../generated/graphql";
import { useWorkspaceContext } from "../../hooks/useWorkspaceContext";
import { useActiveDocumentInfoStore } from "../../utils/document/activeDocumentInfoStore";
import { buildKeyDerivationTrace } from "../../utils/folder/buildKeyDerivationTrace";
import { useFolderKeyStore } from "../../utils/folder/folderKeyStore";
import { getFolder } from "../../utils/folder/getFolder";
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
  const activeDocument = useActiveDocumentInfoStore((state) => state.document);
  const updateActiveDocumentInfoStore = useActiveDocumentInfoStore(
    (state) => state.update
  );
  const getFolderKey = useFolderKeyStore((state) => state.getFolderKey);
  const [document] = useDocumentQuery({ variables: { id: props.documentId } });

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
    if (document.data?.document?.id) {
      decryptTitle();
    }
  }, [props.encryptedName, props.subkeyId, document.data?.document?.id]);

  const decryptTitle = async () => {
    if (!props.subkeyId || !props.encryptedName || !props.encryptedNameNonce) {
      // this case can happen when the document is created but the title is not yet set
      setDocumentTitle("Untitled");
      return;
    }
    try {
      const folder = await getFolder({ id: props.parentFolderId });
      const folderKey = await getFolderKey({
        folderId: folder.id,
        workspaceKeyId:
          document.data?.document?.nameKeyDerivationTrace?.workspaceKeyId,
        workspaceId: props.workspaceId,
        folderSubkeyId: folder.subkeyId,
        activeDevice,
      });
      const documentKeyData = await recreateDocumentKey({
        folderKey,
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
  const { depth = 0 } = props;

  const updateDocumentName = async (name: string) => {
    const workspace = await getWorkspace({
      workspaceId: props.workspaceId,
      deviceSigningPublicKey: activeDevice.signingPublicKey,
    });
    if (!workspace?.currentWorkspaceKey) {
      // TODO: handle error in UI
      console.error("Workspace or workspaceKeys not found");
      return;
    }
    const folder = await getFolder({ id: props.parentFolderId });
    const folderKeyString = await getFolderKey({
      folderId: folder.id,
      workspaceKeyId: workspace.currentWorkspaceKey.id,
      workspaceId: props.workspaceId,
      folderSubkeyId: folder.subkeyId,
      activeDevice,
    });
    const documentKeyData = await recreateDocumentKey({
      folderKey: folderKeyString,
      subkeyId: document.data?.document?.subkeyId!,
    });
    const encryptedDocumentTitle = await encryptDocumentTitle({
      title: name,
      key: documentKeyData.key,
    });
    const nameKeyDerivationTrace = await buildKeyDerivationTrace({
      workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
      folderId: document.data?.document?.parentFolderId!,
    });
    const updateDocumentNameResult = await runUpdateDocumentNameMutation(
      {
        input: {
          id: props.documentId,
          encryptedName: encryptedDocumentTitle.ciphertext,
          encryptedNameNonce: encryptedDocumentTitle.publicNonce,
          workspaceKeyId: workspace?.currentWorkspaceKey?.id!,
          subkeyId: documentKeyData.subkeyId,
          nameKeyDerivationTrace,
        },
      },
      {}
    );
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
