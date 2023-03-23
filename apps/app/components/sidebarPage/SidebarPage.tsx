import { useFocusRing } from "@react-native-aria/focus";
import { useLinkProps } from "@react-navigation/native";
import { decryptDocumentTitle } from "@serenity-tools/common";
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
import { runSnapshotQuery, useDocumentQuery } from "../../generated/graphql";
import { useAuthenticatedAppContext } from "../../hooks/useAuthenticatedAppContext";
import { useDocumentTitleStore } from "../../utils/document/documentTitleStore";
import { updateDocumentName } from "../../utils/document/updateDocumentName";
import { getWorkspace } from "../../utils/workspace/getWorkspace";
import SidebarPageMenu from "../sidebarPageMenu/SidebarPageMenu";

type Props = ViewProps & {
  documentId: string;
  workspaceId: string;
  parentFolderId: string;
  nameCiphertext: string;
  nameNonce: string;
  subkeyId: number;
  depth?: number;
  onRefetchDocumentsPress: () => void;
};

export default function SidebarPage(props: Props) {
  const isDesktopDevice = useIsDesktopDevice();
  const { activeDevice } = useAuthenticatedAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("decrypting…");
  const { isFocusVisible, focusProps: focusRingProps }: any = useFocusRing();
  const documentTitleStore = useDocumentTitleStore();
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

  const decryptTitle = async () => {
    try {
      const document = documentResult.data?.document;
      if (!document) {
        throw new Error("Unable to retrieve document!");
      }
      const snapshotResult = await runSnapshotQuery({
        documentId: document.id,
      });
      if (!snapshotResult.data?.snapshot) {
        throw new Error(
          snapshotResult.error?.message || "Unable to retrieve snapshot!"
        );
      }
      const snapshot = snapshotResult.data.snapshot;
      if (!snapshotResult.data?.snapshot) {
        throw new Error(
          snapshotResult.error?.message || "Unable to retrieve snapshot!"
        );
      }
      const workspace = await getWorkspace({
        workspaceId: props.workspaceId,
        deviceSigningPublicKey: activeDevice.signingPublicKey,
      });
      if (!workspace?.workspaceKeys) {
        throw new Error("No workspace key for this workspace and device");
      }
      let documentWorkspaceKey: any = undefined;
      for (const workspaceKey of workspace.workspaceKeys!) {
        if (workspaceKey.id === snapshot.keyDerivationTrace.workspaceKeyId) {
          documentWorkspaceKey = workspaceKey;
        }
      }
      if (!documentWorkspaceKey?.workspaceKeyBox) {
        throw new Error("Document workspace key not found");
      }
      const documentTitle = decryptDocumentTitle({
        ciphertext: props.nameCiphertext,
        nonce: props.nameNonce,
        activeDevice,
        subkeyId: props.subkeyId,
        snapshot: {
          keyDerivationTrace: snapshot.keyDerivationTrace,
        },
        workspaceKeyBox: documentWorkspaceKey.workspaceKeyBox,
      });
      setDocumentTitle(documentTitle);
      documentTitleStore.updateDocumentTitle({
        documentId: document.id,
        title: documentTitle,
      });
    } catch (error) {
      console.error(error);
      setDocumentTitle("decryption error");
    }
  };
  const { depth = 0 } = props;

  useEffect(() => {
    if (documentResult.data?.document?.id) {
      decryptTitle();
    }
  }, [props.nameCiphertext, props.subkeyId, documentResult.data?.document?.id]);

  const updateDocumentTitle = async (name: string) => {
    const document = documentResult.data?.document;
    if (!document) {
      console.error("Document not loaded");
      return;
    }
    try {
      await updateDocumentName({
        documentId: document.id,
        workspaceId: document.workspaceId,
        name,
        activeDevice,
      });
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
                  bold={
                    documentTitleStore?.activeDocumentId === props.documentId
                  }
                  testID={`sidebar-document--${props.documentId}`}
                >
                  {documentTitleStore?.activeDocumentId === props.documentId
                    ? documentTitleStore.activeDocumentTitle ?? "Untitled"
                    : documentTitle}
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
