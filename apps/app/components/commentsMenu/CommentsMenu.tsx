import { IconButton, Menu, MenuButton, tw } from "@serenity-tools/ui";
import { useState } from "react";

type Props = { onDeletePressed: () => void };

export default function CommentsMenu(props: Props) {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  return (
    <Menu
      isOpen={isOpenMenu}
      onChange={setIsOpenMenu}
      trigger={
        <IconButton
          accessibilityLabel="Comments options menu"
          name="more-line"
          color="gray-700"
          style={tw`p-2 md:p-0`}
        ></IconButton>
      }
      bottomSheetModalProps={{
        snapPoints: [140],
      }}
      popoverProps={{
        placement: "bottom right",
        offset: 2,
        style: tw`w-40`,
      }}
    >
      {/* <MenuButton iconName={"pencil-line"}>Edit</MenuButton>
      <MenuButton iconName={"check-line"}>Mark as read</MenuButton> */}
      <MenuButton
        iconName={"delete-bin-line"}
        onPress={() => {
          setIsOpenMenu(false);
          props.onDeletePressed();
        }}
        danger
      >
        Delete
      </MenuButton>
    </Menu>
  );
}
