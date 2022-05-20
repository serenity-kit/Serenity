import {
  Icon,
  Menu,
  Pressable,
  SidebarButton,
  Text,
  tw,
} from "@serenity-tools/ui";
import { useDeleteDocumentsMutation } from "../../generated/graphql";
import { useState } from "react";

type Props = {
  documentId: string;
  refetchDocuments: () => void;
  onUpdateNamePress: () => void;
};

export default function DocumentMenu(props: Props) {
  const [isOpenDocumentMenu, setIsOpenDocumentMenu] = useState(false);
  const [, deleteDocumentsMutation] = useDeleteDocumentsMutation();

  const deleteDocument = async (id: string) => {
    await deleteDocumentsMutation({
      input: {
        ids: [id],
      },
    });
    props.refetchDocuments();
  };

  return (
    <Menu
      placement="bottom"
      style={tw`w-60`}
      offset={8}
      crossOffset={80}
      isOpen={isOpenDocumentMenu}
      onChange={setIsOpenDocumentMenu}
      trigger={
        <Pressable
          accessibilityLabel="More options menu"
          style={tw`flex flex-row`}
        >
          <Icon name="more-line" />
        </Pressable>
      }
    >
      <SidebarButton onPress={props.onUpdateNamePress}>
        <Text variant="small">Change Name</Text>
      </SidebarButton>
      <SidebarButton
        onPress={() => {
          setIsOpenDocumentMenu(false);
          deleteDocument(props.documentId);
        }}
      >
        <Text variant="small">Delete</Text>
      </SidebarButton>
    </Menu>
  );
}
