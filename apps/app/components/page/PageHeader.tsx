import { DrawerHeaderProps } from "@react-navigation/drawer";
import { useHasEditorSidebar } from "@serenity-tools/editor/hooks/useHasEditorSidebar";
import { Icon, Text, tw } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useDocumentPathStore } from "../../utils/document/documentPathStore";
import { useDocumentStore } from "../../utils/document/documentStore";

type Props = DrawerHeaderProps & {
  children: any;
};

export function PageHeader(props: Props) {
  const documentPathList = useDocumentPathStore((state) => state.folders);
  const document = useDocumentStore((state) => state.document);
  const hasEditorSidebar = useHasEditorSidebar();

  return (
    <HStack space={0.5} alignItems="center">
      {hasEditorSidebar ? (
        documentPathList.map((folder) => (
          <HStack key={folder.id} alignItems="center" space={0.5}>
            <Text variant="xxs" muted>
              {folder.name}
            </Text>
            <Icon name="arrow-right-s-line" color={tw.color("gray-600")} />
          </HStack>
        ))
      ) : (
        <Text variant="xxs" muted>
          .. /
        </Text>
      )}
      {document ? (
        <Text variant="xxs" bold={hasEditorSidebar} muted={!hasEditorSidebar}>
          {document.name}
        </Text>
      ) : null}
    </HStack>
  );
}
