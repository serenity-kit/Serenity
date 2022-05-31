import {
  Icon,
  Menu,
  Pressable,
  SidebarButton,
  Text,
  tw,
} from "@serenity-tools/ui";
import { useState } from "react";

type Props = {
  folderId: string;
  refetchFolders: () => void;
  onUpdateNamePress: () => void;
  onDeletePressed: () => void;
  onCreateDocumentPress: () => void;
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
          props.onCreateDocumentPress();
        }}
      >
        <Text variant="small">Create Document</Text>
      </SidebarButton>
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
