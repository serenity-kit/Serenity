import { DrawerHeaderProps } from "@react-navigation/drawer";
import { Icon, Text, tw, useHasEditorSidebar } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useDocumentPathStore } from "../../utils/document/documentPathStore";
import { useDocumentStore } from "../../utils/document/documentStore";

type Props = DrawerHeaderProps & {
  children: any;
};

export function PageHeader(props: Props) {
  const documentPathList = useDocumentPathStore((state) => state.folders);
  const document = useDocumentStore((state) => state.document);
  const documentName = useDocumentStore((state) => state.documentName);
  const hasEditorSidebar = useHasEditorSidebar();

  return (
    <HStack space={0.5} alignItems="center">
      {hasEditorSidebar ? (
        documentPathList.map((folder) => (
          <HStack key={folder.id} alignItems="center" space={0.5}>
            <Text
              variant="xxs"
              muted
              style={tw`max-w-30 2xl:max-w-50`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {folder.name}
            </Text>
            <Icon name="arrow-right-s-line" color={tw.color("gray-600")} />
          </HStack>
        ))
      ) : (
        <Text variant="xxs" muted>
          ... /
        </Text>
      )}
      {document ? (
        <Text
          variant="xxs"
          bold={hasEditorSidebar}
          style={tw`max-w-35 sm:max-w-40 md:max-w-50 2xl:max-w-70`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {documentName}
        </Text>
      ) : null}
    </HStack>
  );
}
