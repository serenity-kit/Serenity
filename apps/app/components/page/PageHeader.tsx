import { DrawerHeaderProps } from "@react-navigation/drawer";
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

  return (
    <HStack space={0.5} alignItems="center">
      {documentPathList.map((folder) => (
        <HStack alignItems="center" space={0.5}>
          <Text key={folder.id} variant="xxs" muted>
            {folder.name}
          </Text>
          <Icon name="arrow-right-s-line" color={tw.color("gray-600")} />
        </HStack>
      ))}
      {document && (
        <Text variant="xxs" bold>
          {document.name}
        </Text>
      )}
    </HStack>
  );
}
