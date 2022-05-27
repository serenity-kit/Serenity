import {
  Text,
  tw,
  View,
  Button,
  Input,
  Icon,
  Menu,
  ScrollView,
  SidebarButton,
  Checkbox,
  Pressable,
  Link,
  EditorSidebarIcon,
  LabeledInput,
  SidebarLink,
  SidebarDivider,
  Modal,
  Avatar,
  AvatarGroup,
} from "@serenity-tools/ui";
import { Columns, Column, Tiles } from "@mobily/stacks";
import React, { useState } from "react";
import { useWindowDimensions } from "react-native";
import { VStack, HStack } from "native-base";

export default function DesignSystemScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [showModal, setShowModal] = useState(false);
  const [isOpenPopover, setIsOpenPopover] = useState(false);

  return (
    <ScrollView style={tw`px-4 py-6`}>
      <Text style={tw`mb-4 h2`}>Text</Text>
      <Text variant="large">large Text</Text>
      <Text>regular Text</Text>
      <Text variant="small">small Text</Text>
      <Text variant="xs">xs Text</Text>
      <Text variant="xxs">xxs Text</Text>
      <Text variant="large" bold>
        bold large Text
      </Text>
      <Text bold>bold regular Text</Text>
      <Text variant="small" bold>
        bold small Text
      </Text>
      <Text variant="xs" bold>
        bold xs Text
      </Text>
      <Text variant="xxs" bold>
        bold xxs Text
      </Text>
      <Text variant="large" muted>
        muted large Text
      </Text>
      <Text muted>muted regular Text</Text>
      <Text variant="small" muted>
        muted small Text
      </Text>
      <Text variant="xs" muted>
        muted xs Text
      </Text>
      <Text variant="xxs" muted>
        muted xxs Text
      </Text>
      <Text style={tw`mt-6 mb-4 h2`}>Button</Text>
      <Text>Default Button</Text>
      <Button>Login</Button>
      <Text>Disabled Button</Text>
      <Button disabled>Login</Button>
      <Text>Secondary Button</Text>
      <Button variant="secondary">Login</Button>
      <Text>Disabled Secondary Button</Text>
      <Button variant="secondary" disabled>
        Login
      </Button>
      <Text>Small Button</Text>
      <Button size="small">Login</Button>

      <Text style={tw`mt-6 mb-4 h2`}>Input</Text>
      <VStack space={4}>
        <Input />
        <LabeledInput label={"Input"} />
        <LabeledInput label={"Input w/ Value"} value="jane@example.com" />
        <LabeledInput
          label={"Input w/ Placeholder"}
          placeholder="Enter your email …"
        />
        <LabeledInput
          label={"Input Disabled"}
          value="jane@example.com"
          disabled
        />
        <LabeledInput
          label={"Input Disabled"}
          placeholder="Enter your email …"
          disabled
        />
      </VStack>

      <Text style={tw`mt-6 mb-4 h2`}>Avatar</Text>
      <Text style={tw`mt-4 mb-1`}>Sizing</Text>
      <HStack space={2} alignItems="center">
        <Avatar bg="primary.500" size={"xs"}>
          XS
        </Avatar>
        <Avatar bg="primary.500" size={"sm"}>
          SM
        </Avatar>
        <Avatar bg="primary.500" size={"md"}>
          MD
        </Avatar>
        <Avatar bg="primary.500" size={"lg"}>
          LG
        </Avatar>
        <Avatar bg="primary.500" size={"xl"}>
          XL
        </Avatar>
        <Avatar bg="primary.500" size={"2xl"}>
          2XL
        </Avatar>
      </HStack>
      <Text style={tw`mt-4 mb-1`}>Avatar Group</Text>
      <AvatarGroup max={8} _avatar={{ size: "sm" }}>
        <Avatar bg="primary.700">SK</Avatar>
        <Avatar bg="primary.500">AN</Avatar>
        <Avatar bg="primary.300">NG</Avatar>
        <Avatar bg="yellow.300">NG</Avatar>
        <Avatar bg="green.300">NG</Avatar>
      </AvatarGroup>
      <Text style={tw`mt-4 mb-1`}>Avatar Group with max 3 shown</Text>
      <AvatarGroup max={3} _avatar={{ size: "sm" }}>
        <Avatar bg="green.400">BE</Avatar>
        <Avatar bg="yellow.400">AN</Avatar>
        <Avatar bg="orange.400">NG</Avatar>
        <Avatar bg="yellow.300">NG</Avatar>
        <Avatar bg="green.300">NG</Avatar>
      </AvatarGroup>

      <Text style={tw`mt-6 mb-4 h2`}>SidebarButton</Text>
      <SidebarButton>
        <Text variant="small">Hallo</Text>
      </SidebarButton>
      <SidebarButton disabled>
        <Text variant="small">Hallo</Text>
      </SidebarButton>

      <Text style={tw`mt-6 mb-4 h2`}>Menu</Text>
      <View style={tw`flex flex-row`}>
        <Menu
          placement="bottom left"
          style={tw`w-60`}
          offset={8}
          isOpen={isOpenPopover}
          onChange={setIsOpenPopover}
          trigger={
            <Pressable
              accessibilityLabel="More options menu"
              style={tw`flex flex-row`}
            >
              <Text>Open Menu</Text>
              <Icon name="arrow-down-s-fill" />
            </Pressable>
          }
        >
          <View style={tw`py-1 px-4`}>
            <Text variant="small" muted>
              jane@example.com
            </Text>
          </View>
          <SidebarDivider collapsed />
          <SidebarButton
            onPress={() => {
              setIsOpenPopover(false);
              alert("Hello");
            }}
          >
            <Text variant="small">Hello</Text>
          </SidebarButton>
        </Menu>
      </View>

      <Text style={tw`mt-6 mb-4 h2`}>Link</Text>
      <Text>
        This is a link to{" "}
        <Link to={{ screen: "EncryptDecryptImageTest" }}>
          Encrypt / Decrypt Image
        </Link>
      </Text>
      <Text muted>
        This is a link to{" "}
        <Link to={{ screen: "EncryptDecryptImageTest" }}>
          Encrypt / Decrypt Image
        </Link>
      </Text>
      <Text bold>
        This is a link to{" "}
        <Link to={{ screen: "EncryptDecryptImageTest" }}>
          Encrypt / Decrypt Image
        </Link>
      </Text>
      <Text variant="xxs">
        This is a link to{" "}
        <Link to={{ screen: "EncryptDecryptImageTest" }}>
          Encrypt / Decrypt Image
        </Link>
      </Text>

      <Text style={tw`mt-6 mb-4 h2`}>SidebarLink</Text>
      <SidebarLink to={{ screen: "EncryptDecryptImageTest" }}>
        <Text>Encrypt / Decrypt Image</Text>
      </SidebarLink>

      <Text style={tw`mt-6 mb-4 h2`}>Modal (work in progress)</Text>
      <Modal isVisible={showModal} onBackdropPress={() => setShowModal(false)}>
        <View style={tw`bg-white border-gray-800 max-w-60 m-auto`}>
          <Text>Hello World</Text>
          <SidebarLink to={{ screen: "EncryptDecryptImageTest" }}>
            <Text>Encrypt / Decrypt Image</Text>
          </SidebarLink>
        </View>
      </Modal>
      <Button
        onPress={() => {
          setShowModal(true);
        }}
      >
        Open Modal
      </Button>

      <Text style={tw`mt-6 mb-4 h2`}>Checkbox</Text>
      <Checkbox value="test" accessibilityLabel="This is a dummy checkbox" />
      <Checkbox
        value="test"
        accessibilityLabel="This is a dummy checkbox"
        defaultIsChecked
      >
        <Text>
          Software Development{" "}
          <Link to={{ screen: "EncryptDecryptImageTest" }}>
            Encrypt / Decrypt Image
          </Link>
        </Text>
      </Checkbox>
      <Checkbox
        value="test"
        accessibilityLabel="This is a dummy checkbox"
        isDisabled
      />
      <Checkbox
        value="test"
        accessibilityLabel="This is a dummy checkbox"
        isDisabled
        isChecked
      />

      <Text style={tw`mt-6 mb-4 h2`}>Editor Icons</Text>
      <EditorSidebarIcon name="bold" />
      <EditorSidebarIcon name="bold" isActive />

      <Text style={tw`mt-6 mb-4 h2`}>Icons</Text>
      <Text style={tw`mb-1`}>Marks</Text>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="bold" />
        <Icon name="code-view" />
        <Icon name="italic" />
        <Icon name="link" />
        <Icon name="link-m" />
        <Icon name="strikethrough" />
        <Icon name="underline" />
      </Tiles>
      <Text style={tw`mt-4 mb-1`}>Nodes</Text>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="at-line" />
        <Icon name="code-s-slash-line" />
        <Icon name="double-quotes-l" />
        <Icon name="heading" />
        <Icon name="h-1" />
        <Icon name="h-2" />
        <Icon name="h-3" />
        <Icon name="h-4" />
        <Icon name="h-5" />
        <Icon name="h-6" />
        <Icon name="indent-decrease" />
        <Icon name="indent-increase" />
        <Icon name="list-check" />
        <Icon name="list-check-2" />
        <Icon name="list-ordered" />
        <Icon name="list-unordered" />
        <Icon name="paragraph" />
        <Icon name="table-2" />
        <Icon name="text" />
      </Tiles>
      <Text style={tw`mt-4 mb-1`}>Extension</Text>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="font-color" />
      </Tiles>
      <Text style={tw`mt-4 mb-1`}>Editor Custom</Text>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="attachment-2" />
        <Icon name="font-size-2" />
        <Icon name="format-clear" />
        <Icon name="functions" />
        <Icon name="hashtag" />
        <Icon name="page-separator" />
        <Icon name="separator" />
      </Tiles>
      <Text style={tw`mt-4 mb-1`}>UI</Text>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="add-line" />
        <Icon name="archive-fill" />
        <Icon name="archive-line" />
        <Icon name="arrow-down-s-fill" />
        <Icon name="arrow-down-s-line" />
        <Icon name="arrow-go-back-fill" />
        <Icon name="arrow-go-back-line" />
        <Icon name="arrow-go-forward-fill" />
        <Icon name="arrow-go-forward-line" />
        <Icon name="arrow-right-s-line" />
        <Icon name="arrow-right-s-fill" />
        <Icon name="arrow-up-down-line" />
        <Icon name="bookmark-fill" />
        <Icon name="bookmark-line" />
        <Icon name="book-open-line" />
        <Icon name="calendar-check-fill" />
        <Icon name="chat-1-line" />
        <Icon name="chat-4-line" />
        <Icon name="check-line" />
        <Icon name="close-circle-fill" />
        <Icon name="cup-line" />
        <Icon name="cursor" />
        <Icon name="delete-bin-line" />
        <Icon name="double-arrow-left" />
        <Icon name="double-arrow-right" />
        <Icon name="download-line" />
        <Icon name="emotion-line" />
        <Icon name="file-add-fill" />
        <Icon name="file-add-line" />
        <Icon name="file-copy-line" />
        <Icon name="file-line" />
        <Icon name="file-search-line" />
        <Icon name="file-transfer-line" />
        <Icon name="folder-fill" />
        <Icon name="folder-line" />
        <Icon name="folder-music-line" />
        <Icon name="history-line" />
        <Icon name="image-2-line" />
        <Icon name="image-line" />
        <Icon name="more" />
        <Icon name="more-2-line" />
        <Icon name="more-line" />
        <Icon name="movie-line" />
        <Icon name="plus" />
        <Icon name="printer-line" />
        <Icon name="question-mark" />
        <Icon name="search-line" />
        <Icon name="settings-4-line" />
        <Icon name="stars-s-fill" />
        <Icon name="serenity-feather" />
      </Tiles>
      <Text style={tw`mt-4 mb-1`}>Icons resized</Text>
      <Columns space={4} alignY="center" alignX="left">
        <Column width="content">
          <Icon name="list-unordered" size={16} />
        </Column>
        <Column width="content">
          <Icon name="list-unordered" size={32} />
        </Column>
      </Columns>
      <Text style={tw`mt-4 mb-1`}>Icons coloured</Text>
      <Icon name="list-check-2" color={tw.color("primary-500")} />
    </ScrollView>
  );
}
