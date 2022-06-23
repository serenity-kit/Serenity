import { DrawerHeaderProps } from "@react-navigation/drawer";
import { Text, View } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useDocumentPathStore } from "../../utils/document/documentPathStore";
import { useDocumentNameStore } from "../../utils/document/documentNameStore";

type Props = DrawerHeaderProps & {
  children: any;
};

export function PageHeader(props: Props) {
  const documentPathList = useDocumentPathStore((state) => state.folders);
  const documentName = useDocumentNameStore((state) => state.name);

  return (
    <HStack space={2} alignItems="center">
      {documentPathList.map((folder) => (
        <Text>
          <Text key={folder.id}>{folder.name}</Text>
          {/* TOOD: use a right chevron icon */}
          <Text> &gt;</Text>
        </Text>
      ))}
      <Text bold>{documentName}</Text>
    </HStack>
  );
}
