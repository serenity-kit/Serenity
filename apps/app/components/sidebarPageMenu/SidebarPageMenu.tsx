import { IconButton, Menu, MenuButton, Shortcut, tw } from "@serenity-tools/ui";
import { useState } from "react";
import { useDeleteDocumentsMutation } from "../../generated/graphql";

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
        <IconButton
          accessibilityLabel="More options menu"
          name="more-line"
          color="gray-600"
          style={tw`p-2 md:p-0`}
          testID={`sidebar-document-menu--${props.documentId}__open`}
        ></IconButton>
      }
    >
      <MenuButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onUpdateNamePress();
        }}
        icon="font-size-2"
        shortcut={<Shortcut letter="R" />}
        testID={`sidebar-document-menu--${props.documentId}__rename`}
      >
        Rename
      </MenuButton>
      <MenuButton
        onPress={() => {
          setIsOpenMenu(false);
          deleteDocument(props.documentId);
        }}
        icon="delete-bin-line"
        danger
        testID={`sidebar-document-menu--${props.documentId}__delete`}
      >
        Delete
      </MenuButton>
    </Menu>
  );
}
