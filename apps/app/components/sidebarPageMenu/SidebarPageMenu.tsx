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

export default function SidebarPageMenu(props: Props) {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
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
      isOpen={isOpenMenu}
      onChange={setIsOpenMenu}
      trigger={
        <Pressable
          accessibilityLabel="More options menu"
          style={tw`flex flex-row`}
        >
          <Icon name="more-line" />
        </Pressable>
      }
    >
      <SidebarButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onUpdateNamePress();
        }}
      >
        <Text variant="small">Change Name</Text>
      </SidebarButton>
      <SidebarButton
        onPress={() => {
          setIsOpenMenu(false);
          deleteDocument(props.documentId);
        }}
      >
        <Text variant="small">Delete</Text>
      </SidebarButton>
    </Menu>
  );
}
