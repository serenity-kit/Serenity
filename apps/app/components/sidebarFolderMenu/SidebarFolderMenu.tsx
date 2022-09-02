import { IconButton, Menu, MenuButton, Shortcut, tw } from "@serenity-tools/ui";
import { useState } from "react";

type Props = {
  folderId: string;
  refetchFolders: () => void;
  onUpdateNamePress: () => void;
  onDeletePressed: () => void;
  onCreateFolderPress: () => void;
};

export default function SidebarFolderMenu(props: Props) {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

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
          testID={`sidebar-folder-menu--${props.folderId}__open`}
        ></IconButton>
      }
    >
      <MenuButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onCreateFolderPress();
        }}
        icon="folder-line"
        shortcut={<Shortcut letter="N" />}
        testID={`sidebar-folder-menu--${props.folderId}__create-subfolder`}
      >
        Create Folder
      </MenuButton>
      <MenuButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onUpdateNamePress();
        }}
        icon="font-size-2"
        shortcut={<Shortcut letter="R" />}
        testID={`sidebar-folder-menu--${props.folderId}__rename`}
      >
        Rename
      </MenuButton>
      <MenuButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onDeletePressed();
        }}
        icon="delete-bin-line"
        danger
        testID={`sidebar-folder-menu--${props.folderId}__delete`}
      >
        Delete
      </MenuButton>
    </Menu>
  );
}
