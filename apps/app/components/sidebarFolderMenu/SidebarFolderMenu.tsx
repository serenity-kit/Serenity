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
  folderId: string;
  refetchFolders: () => void;
  onUpdateNamePress: () => void;
};

export default function SidebarFolderMenu(props: Props) {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [, deleteFoldersMutation] = useDeleteDocumentsMutation();

  const deleteFolder = async (id: string) => {
    await deleteFoldersMutation({
      input: {
        ids: [id],
      },
    });
    props.refetchFolders();
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
          deleteFolder(props.folderId);
        }}
      >
        <Text variant="small">Delete</Text>
      </SidebarButton>
    </Menu>
  );
}
