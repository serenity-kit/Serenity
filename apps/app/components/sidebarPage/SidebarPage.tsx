import { useFocusRing } from "@react-native-aria/focus";
import { useLinkProps } from "@react-navigation/native";
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
import { StyleSheet } from "react-native";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { getCurrentUserInfo } from "../../store/currentUserInfoStore";
import {
  createOrReplaceDocument,
  loadRemoteDocumentName,
  useLocalDocumentName,
} from "../../store/documentStore";
import { useCanEditDocumentsAndFolders } from "../../store/workspaceChainStore";
import { useActiveDocumentStore } from "../../utils/document/activeDocumentStore";
import { updateDocumentName } from "../../utils/document/updateDocumentName";
import { OS } from "../../utils/platform/platform";
import { showToast } from "../../utils/toast/showToast";
import SidebarPageMenu from "../sidebarPageMenu/SidebarPageMenu";

type Props = ViewProps & {
  documentId: string;
  workspaceId: string;
  parentFolderId: string;
  depth?: number;
  onRefetchDocumentsPress: () => void;
};

export default function SidebarPage(props: Props) {
  const isDesktopDevice = useIsDesktopDevice();
  const { activeDevice } = useAuthenticatedAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();
  const activeDocumentId = useActiveDocumentStore(
    (state) => state.activeDocumentId
  );

  const documentName = useLocalDocumentName({ documentId: props.documentId });

  const currentUserInfo = getCurrentUserInfo();
  if (!currentUserInfo) throw new Error("No current user");
  const canEditAndDocumentsFolders = useCanEditDocumentsAndFolders({
    workspaceId: props.workspaceId,
    mainDeviceSigningPublicKey: currentUserInfo.mainDeviceSigningPublicKey,
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

  const { depth = 0 } = props;

  useEffect(() => {
    loadRemoteDocumentName({
      documentId: props.documentId,
      workspaceId: props.workspaceId,
      activeDevice,
    });
  }, [props.documentId, props.workspaceId, activeDevice]);

  const updateDocumentTitle = async (name: string) => {
    try {
      createOrReplaceDocument({
        documentId: props.documentId,
        name,
      });
      await updateDocumentName({
        documentId: props.documentId,
        workspaceId: props.workspaceId,
        name,
        activeDevice,
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to update the document name", "error");
      // revert to old name
      loadRemoteDocumentName({
        documentId: props.documentId,
        workspaceId: props.workspaceId,
        activeDevice,
      });
    }
    setIsEditing(false);
  };

  const styles = StyleSheet.create({
    page: tw``,
    hover: tw`bg-gray-200`,
    focusVisible:
      OS === "web" || OS === "electron" ? tw`se-inset-focus-mini` : {},
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
                  value={documentName}
                  style={tw`ml-0.5 w-${maxWidth}`}
                  testID={`sidebar-document--${props.documentId}__edit-name`}
                />
              ) : (
                <SidebarText
                  style={[tw`pl-2 md:pl-1.5 max-w-${maxWidth}`]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  bold={activeDocumentId === props.documentId}
                  testID={`sidebar-document--${props.documentId}`}
                >
                  {documentName}
                </SidebarText>
              )}
            </HStack>
          </View>
        </Pressable>

        {canEditAndDocumentsFolders && (
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
              documentTitle={documentName}
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
