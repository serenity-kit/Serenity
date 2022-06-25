import { DrawerHeaderProps } from "@react-navigation/drawer";
import { Text, View } from "@serenity-tools/ui";
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
    <HStack space={2} alignItems="center">
      {documentPathList.map((folder) => (
        <Text key={folder.id}>
          <Text>{folder.name}</Text>
          {/* TOOD: use a right chevron icon */}
          <Text> &gt;</Text>
        </Text>
      ))}
      {document && <Text bold>{document.name}</Text>}
    </HStack>
  );
}
