import {
  IconButton,
  Menu,
  SidebarButton,
  SidebarDivider,
  Text,
  tw,
} from "@serenity-tools/ui";
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
        ></IconButton>
      }
    >
      <SidebarButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onCreateFolderPress();
        }}
      >
        <Text variant="small">Create Folder</Text>
      </SidebarButton>
      <SidebarButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onUpdateNamePress();
        }}
      >
        <Text variant="small">Change Name</Text>
      </SidebarButton>
      <SidebarDivider collapsed />
      <SidebarButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onDeletePressed();
        }}
      >
        <Text variant="small">Delete</Text>
      </SidebarButton>
    </Menu>
  );
}
