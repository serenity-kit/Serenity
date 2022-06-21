import {
  Icon,
  IconButton,
  Menu,
  SidebarButton,
  Text,
  tw,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
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
        px={3}
        py={2}
      >
        <Icon name="folder-line" />
        <Text variant="xs">Create Folder</Text>
      </SidebarButton>
      <SidebarButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onUpdateNamePress();
        }}
        px={3}
        py={2}
      >
        <Icon name="font-size-2" />
        <Text variant="xs">Rename</Text>
        {/* TODO extract as Shortcut */}
        <HStack alignItems="center" style={tw`ml-auto`}>
          <Icon name="command-line" size={12} color={tw.color("gray-400")} />
          <Text variant="xs" style={tw`text-gray-400`} bold>
            R
          </Text>
        </HStack>
      </SidebarButton>
      <SidebarButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onDeletePressed();
        }}
        px={3}
        py={2}
      >
        <Icon name="delete-bin-line" color={tw.color("error-500")} />
        <Text variant="xs" style={tw`text-error-500`}>
          Delete
        </Text>
      </SidebarButton>
    </Menu>
  );
}
