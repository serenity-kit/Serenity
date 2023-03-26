import { IconButton, Menu, MenuButton, tw } from "@serenity-tools/ui";
import { useState } from "react";

type Props = {
  onSharePressed: () => void;
  onCommentsPressed: () => void;
};

export default function PageHeaderRightMenu(props: Props) {
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  return (
    <Menu
      {...props}
      bottomSheetModalProps={{
        snapPoints: [180],
      }}
      popoverProps={{
        placement: "bottom left",
        offset: 6,
        style: tw`w-60`,
      }}
      isOpen={isOpenMenu}
      onChange={setIsOpenMenu}
      trigger={
        <IconButton
          accessibilityLabel="More options menu"
          size={"xl"}
          name="more-line"
          color="gray-700"
          style={tw`p-2`}
        ></IconButton>
      }
    >
      <MenuButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onSharePressed();
        }}
        iconName={"share-line"}
      >
        Share
      </MenuButton>
      <MenuButton
        onPress={() => {
          setIsOpenMenu(false);
          props.onCommentsPressed();
        }}
        iconName={"chat-4-line"}
      >
        Comments
      </MenuButton>
    </Menu>
  );
}
