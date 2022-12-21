import {
  IconButton,
  Menu,
  MenuButton,
  SidebarDivider,
  tw,
} from "@serenity-tools/ui";
import { useState } from "react";
import { Role } from "../../generated/graphql";

type Props = {
  memberId: string;
  role: Role;
  onUpdateRole: (role: Role) => void;
  onDeletePressed: () => void;
};

export default function MemberMenu(props: Props) {
  const { memberId, role, ...rest } = props;
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  return (
    <Menu
      {...rest}
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
          testID={`member-menu--${memberId}__open`}
          accessibilityLabel="More options menu"
          name="more-line"
          color="gray-700"
          style={tw`p-2 md:p-0`}
        ></IconButton>
      }
    >
      <MenuButton
        testID={`member-menu--${memberId}__make-editor`}
        onPress={() => {
          setIsOpenMenu(false);
          props.onUpdateRole(Role.Editor);
        }}
        iconName={"check-line"}
        hideIcon={role !== Role.Editor}
      >
        Editor
      </MenuButton>
      <MenuButton
        testID={`member-menu--${memberId}__make-admin`}
        onPress={() => {
          setIsOpenMenu(false);
          props.onUpdateRole(Role.Admin);
        }}
        iconName={"check-line"}
        hideIcon={role !== Role.Admin}
      >
        Admin
      </MenuButton>
      <SidebarDivider collapsed />
      <MenuButton
        testID={`member-menu--${memberId}__delete`}
        onPress={() => {
          setIsOpenMenu(false);
          props.onDeletePressed();
        }}
        iconName="delete-bin-line"
        danger
      >
        Delete
      </MenuButton>
    </Menu>
  );
}
