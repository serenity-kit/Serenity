import { IconButton, Menu, MenuButton, tw } from "@serenity-tools/ui";
import { useState } from "react";

type Props = {
  onDeletePressed: () => void;
  commentId: string;
  commentReplyId?: string | undefined;
};

const getTestIdFragment = (
  commentId: string,
  commentReplyId?: string
): string => {
  if (commentReplyId) {
    return `comment-${commentId}__comment-reply-${commentReplyId}`;
  }
  return `comment-${commentId}`;
};

export default function CommentsMenu(props: Props) {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const testIdFragment = getTestIdFragment(
    props.commentId,
    props.commentReplyId
  );

  return (
    <Menu
      isOpen={isOpenMenu}
      onChange={setIsOpenMenu}
      trigger={
        <IconButton
          aria-label="Comments options menu"
          name="more-line"
          color="gray-700"
          style={tw`p-2 md:p-0`}
          testID={`${testIdFragment}__menu`}
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
        testID={`${testIdFragment}__delete-button`}
      >
        Delete
      </MenuButton>
    </Menu>
  );
}
