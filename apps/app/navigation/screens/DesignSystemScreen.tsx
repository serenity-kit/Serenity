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
  ModalHeader,
  ModalButtonFooter,
  IconButton,
  MenuButton,
  Shortcut,
  Tooltip,
  Spinner,
  BoxShadow,
  BoxShadowLevels,
  InfoMessage,
  ScrollSafeAreaView,
  EditorBottombarButton,
  EditorBottombarDivider,
} from "@serenity-tools/ui";
import { Columns, Column, Tiles } from "@mobily/stacks";
import React, { useState } from "react";
import { useWindowDimensions, StyleSheet } from "react-native";
import { VStack, HStack } from "native-base";
import { theme } from "../../../../tailwind.config";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";

let counter = 0;

export default function DesignSystemScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [showModal, setShowModal] = useState(false);
  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const collabColors = Object.keys(theme.colors.collaboration);
  const elevationLevels: BoxShadowLevels[] = [0, 1, 2, 3];

  const styles = StyleSheet.create({
    header: tw`mt-12 mb-4 text-2xl`,
    subHeader: tw`mt-4 mb-2`,
  });

  // TODO extract into ui as components
  const DesignSystemHeader = (props) => {
    return (
      <Text variant="large" style={[styles.header, props.style]} bold>
        {props.children}
      </Text>
    );
  };

  const DesignSystemSubHeader = (props) => {
    return (
      <Text variant="small" style={[styles.subHeader, props.style]} muted>
        {props.children}
      </Text>
    );
  };

  // TODO refactor order
  return (
    <ScrollSafeAreaView style={tw`px-4 py-6`}>
      <DesignSystemHeader style={tw`mt-6`}>EditorBottombar</DesignSystemHeader>
      <HStack space={2} alignItems="center">
        <EditorBottombarButton name="arrow-down-s-line" />
        <EditorBottombarButton name="text" />
        <EditorBottombarButton name="list-unordered" />
        <EditorBottombarDivider />
        <EditorBottombarButton name="image-2-line" />
        <EditorBottombarButton name="at-line" />
        <EditorBottombarButton name="chat-1-line" />
        <EditorBottombarDivider />
        <EditorBottombarButton name="link" isActive />
      </HStack>
      <DesignSystemHeader style={tw`mb-0`}>Info Messages</DesignSystemHeader>
      <DesignSystemSubHeader>Info</DesignSystemSubHeader>
      <VStack space={2} style={tw`max-w-90`}>
        <InfoMessage>
          The verification code is prefilled on staging.
        </InfoMessage>
        <InfoMessage icon>
          The verification code is prefilled on staging.
        </InfoMessage>
      </VStack>
      <DesignSystemSubHeader>Error</DesignSystemSubHeader>
      <VStack space={2} style={tw`max-w-90`}>
        <InfoMessage variant="error">
          Unfortunately your registration request failed due a network error.
          Please try again later.
        </InfoMessage>
        <InfoMessage variant="error" icon>
          Unfortunately your registration request failed due a network error.
          Please try again later.
        </InfoMessage>
      </VStack>
      <DesignSystemHeader>Tooltip</DesignSystemHeader>
      <HStack>
        <Tooltip label="This is a tip!" placement="right">
          <IconButton name="file-add-line" color="gray-500" large />
        </Tooltip>
      </HStack>
      <Text variant="large" style={tw`mt-12 mb-4 text-2xl`} bold>
        Elevation
      </Text>
      <HStack space={3} style={tw`pt-2 pb-4 pr-2 overflow-scroll`}>
        {elevationLevels.map((level) => {
          return (
            <BoxShadow elevation={level} rounded>
              <HStack
                style={tw`h-24 w-24 bg-white rounded`}
                alignItems="center"
                justifyContent="center"
              >
                <Text variant="xxs" muted>
                  elevation {level}
                </Text>
              </HStack>
            </BoxShadow>
          );
        })}
      </HStack>
      <DesignSystemHeader>Text</DesignSystemHeader>
      <Text variant="large">large Text</Text>
      <Text>regular Text</Text>
      <Text variant="small">small Text</Text>
      <Text variant="xs">xs Text</Text>
      <Text variant="xxs">xxs Text</Text>
      <Text style={tw`pt-4`} variant="large" bold>
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
      <Text style={tw`pt-4`} variant="large" muted>
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
      <DesignSystemHeader>Icon Button</DesignSystemHeader>
      <HStack alignItems="center" space={4}>
        <IconButton name="add-line" color="gray-500" />
        <IconButton name="menu" color="gray-800" large />
      </HStack>
      <DesignSystemHeader style={tw`mb-0`}>Button</DesignSystemHeader>
      <DesignSystemSubHeader>Default Button</DesignSystemSubHeader>
      <Button>Login</Button>
      <DesignSystemSubHeader>Disabled Button</DesignSystemSubHeader>
      <Button disabled>Login</Button>
      <DesignSystemSubHeader>Loading Button</DesignSystemSubHeader>
      <Button isLoading>Login</Button>
      <DesignSystemSubHeader>Secondary Button</DesignSystemSubHeader>
      <Button variant="secondary">Login</Button>
      <DesignSystemSubHeader>Disabled Secondary Button</DesignSystemSubHeader>
      <Button variant="secondary" disabled>
        Login
      </Button>
      <DesignSystemSubHeader>Loading Secondary Button</DesignSystemSubHeader>
      <Button variant="secondary" isLoading>
        Login
      </Button>
      <DesignSystemSubHeader>Button sizes</DesignSystemSubHeader>
      <VStack space="2">
        <Button size="small">Small</Button>
        <Button size="medium">Medium</Button>
        <Button size="large">Large</Button>
      </VStack>
      <DesignSystemSubHeader>Loading Button sizes</DesignSystemSubHeader>
      <VStack space="2">
        <Button size="small" isLoading>
          Login
        </Button>
        <Button size="medium" isLoading>
          Login
        </Button>
        <Button size="large" isLoading>
          Login
        </Button>
      </VStack>

      <DesignSystemHeader>Input</DesignSystemHeader>
      <VStack space={4}>
        <Input />
        <LabeledInput label={"Input"} />
        <LabeledInput
          label={"Input w/ Value"}
          value="jane@example.com"
          hint="Here you can put information you want the user to have regarding this input."
        />
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

      <DesignSystemHeader>Toast</DesignSystemHeader>
      <Button
        onPress={() => {
          counter = counter + 1;
          Toast.show(`This is a message ${counter}`, {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
            backgroundColor: tw.color("gray-900"),
            opacity: 1,
            containerStyle: tw`py-3 px-8`,
            textStyle: tw`text-xs inter-regular`,
          });
        }}
      >
        Add Toast
      </Button>

      <DesignSystemHeader style={tw`mb-0`}>Avatar</DesignSystemHeader>
      <DesignSystemSubHeader>Sizing</DesignSystemSubHeader>
      <HStack space={2} alignItems="center" style={tw`pr-2 overflow-scroll`}>
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

      <DesignSystemSubHeader>Avatar Group</DesignSystemSubHeader>
      <AvatarGroup max={8} _avatar={{ size: "sm" }}>
        <Avatar bg="collaboration.arctic">BE</Avatar>
        <Avatar bg="collaboration.lavender">NG</Avatar>
        <Avatar bg="collaboration.rose">AN</Avatar>
        <Avatar bg="collaboration.honey">NG</Avatar>
        <Avatar bg="collaboration.sky">NG</Avatar>
        <Avatar bg={tw.color(`collaboration-terracotta`)}>NG</Avatar>
      </AvatarGroup>
      <DesignSystemSubHeader>
        Avatar Group with max 3 shown
      </DesignSystemSubHeader>
      <AvatarGroup max={3} _avatar={{ size: "sm" }}>
        <Avatar bg="collaboration.arctic">SK</Avatar>
        <Avatar bg="collaboration.lavender">NG</Avatar>
        <Avatar bg="collaboration.rose">AN</Avatar>
        <Avatar bg="collaboration.honey">NG</Avatar>
        <Avatar bg="collaboration.sky">NG</Avatar>
      </AvatarGroup>

      <DesignSystemSubHeader>
        Collaboration Colors - Workspace Style
      </DesignSystemSubHeader>
      <HStack space={4} style={tw`pb-3 pr-2 overflow-scroll`}>
        {collabColors.map((color) => {
          return (
            <Avatar
              borderRadius={4}
              size="xs"
              bg={tw.color(`collaboration-${color}`)}
              key={`avatar_${color}`}
            >
              <Icon
                name="serenity-feather"
                color={tw.color("black/40")}
                size={5}
                mobileSize={6}
              />
            </Avatar>
          );
        })}
      </HStack>

      <DesignSystemHeader>SidebarButton</DesignSystemHeader>
      <SidebarButton>
        <Text variant="small">Hallo</Text>
      </SidebarButton>
      <SidebarButton disabled>
        <Text variant="small">Hallo</Text>
      </SidebarButton>

      <DesignSystemHeader>Menu</DesignSystemHeader>
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
          <View style={tw`p-menu-item`}>
            <Text variant="xxs" muted bold>
              jane@example.com
            </Text>
          </View>
          <SidebarLink
            to={{ screen: "EncryptDecryptImageTest" }}
            style={tw`p-menu-item`}
          >
            <Avatar
              borderRadius={4}
              size="xs"
              bg={tw.color(`collaboration-emerald`)}
            >
              <Icon
                name="serenity-feather"
                color={tw.color("black/35")}
                size={5}
                mobileSize={6}
              />
            </Avatar>
            <Text variant="xs">Happy Workspace</Text>
          </SidebarLink>
          <SidebarLink to={{ screen: "Login" }} style={tw`p-menu-item`}>
            <Avatar
              borderRadius={4}
              size="xs"
              bg={tw.color(`collaboration-arctic`)}
            >
              <Icon
                name="serenity-feather"
                color={tw.color("black/35")}
                size={5}
                mobileSize={6}
              />
            </Avatar>
            <Text variant="xs">Funny Bunny</Text>
          </SidebarLink>
          <View style={tw`pl-2 pr-3 py-1.5`}>
            <IconButton
              onPress={() => {
                setIsOpenPopover(false);
                alert("You are awesome !");
              }}
              name="plus"
              label="Create awesomeness"
            />
          </View>

          <SidebarDivider collapsed />
          <MenuButton
            onPress={() => {
              setIsOpenPopover(false);
            }}
            icon="emotion-line"
            shortcut={<Shortcut letter="H" />}
          >
            Hello
          </MenuButton>
          <MenuButton
            onPress={() => {
              setIsOpenPopover(false);
              alert("Danger !!");
            }}
            icon="delete-bin-line"
            danger
          >
            Danger
          </MenuButton>
        </Menu>
      </View>

      <DesignSystemHeader>Link</DesignSystemHeader>
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

      <DesignSystemHeader>SidebarLink</DesignSystemHeader>
      <SidebarLink to={{ screen: "EncryptDecryptImageTest" }}>
        <Avatar
          borderRadius={4}
          size="xs"
          bg={tw.color(`collaboration-arctic`)}
        >
          <Icon name="serenity-feather" color={tw.color("black/35")} />
        </Avatar>
        <Text>Encrypt / Decrypt Image</Text>
      </SidebarLink>

      <DesignSystemHeader>Modal (work in progress)</DesignSystemHeader>
      <Modal isVisible={showModal} onBackdropPress={() => setShowModal(false)}>
        <ModalHeader>This is the header</ModalHeader>
        <LabeledInput
          label={"Label of the Input"}
          value="While typi"
          hint="Here you can put information you want the user to have regarding this input."
        />
        <ModalButtonFooter
          cancel={
            <Button variant="secondary" onPress={() => setShowModal(false)}>
              Cancel
            </Button>
          }
          confirm={<Button variant="primary">Confirm</Button>}
        />
      </Modal>
      <Button
        onPress={() => {
          setShowModal(true);
        }}
        variant="primary"
        size="small"
      >
        Open Modal
      </Button>

      <DesignSystemHeader>Spinner</DesignSystemHeader>
      <VStack space={3}>
        <Spinner />
        <Spinner size="lg" />
        <Spinner fadeIn size="lg" />
      </VStack>

      <DesignSystemHeader>Checkbox</DesignSystemHeader>
      <VStack space={3}>
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
      </VStack>

      <DesignSystemHeader>Editor Icons</DesignSystemHeader>
      <VStack space={3}>
        <EditorSidebarIcon name="bold" />
        <EditorSidebarIcon name="bold" isActive />
      </VStack>

      <DesignSystemHeader style={tw`mb-0`}>Icons</DesignSystemHeader>
      <DesignSystemSubHeader>Marks</DesignSystemSubHeader>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="bold" />
        <Icon name="code-view" />
        <Icon name="italic" />
        <Icon name="link" />
        <Icon name="link-m" />
        <Icon name="strikethrough" />
        <Icon name="underline" />
      </Tiles>
      <DesignSystemSubHeader>Nodes</DesignSystemSubHeader>
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
      <DesignSystemSubHeader>Extension</DesignSystemSubHeader>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="font-color" />
      </Tiles>
      <DesignSystemSubHeader>Editor Custom</DesignSystemSubHeader>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="attachment-2" />
        <Icon name="font-size-2" />
        <Icon name="format-clear" />
        <Icon name="functions" />
        <Icon name="hashtag" />
        <Icon name="page-separator" />
        <Icon name="separator" />
      </Tiles>
      <DesignSystemSubHeader>UI</DesignSystemSubHeader>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="add-line" />
        <Icon name="archive-fill" />
        <Icon name="archive-line" />
        <Icon name="arrow-down-filled" />
        <Icon name="arrow-down-s-fill" />
        <Icon name="arrow-down-s-line" />
        <Icon name="arrow-go-back-fill" />
        <Icon name="arrow-go-back-line" />
        <Icon name="arrow-go-forward-fill" />
        <Icon name="arrow-go-forward-line" />
        <Icon name="arrow-right-s-line" />
        <Icon name="arrow-right" />
        <Icon name="arrow-right-filled" />
        <Icon name="arrow-up-down-line" />
        <Icon name="bookmark-fill" />
        <Icon name="bookmark-line" />
        <Icon name="book-open-line" />
        <Icon name="calendar-check-fill" />
        <Icon name="chat-1-line" />
        <Icon name="chat-4-line" />
        <Icon name="check-line" />
        <Icon name="close-circle-fill" />
        <Icon name="command-line" />
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
        <Icon name="information-fill" />
        <Icon name="information-line" />
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
        <Icon name="warning-fill" />
      </Tiles>
      <DesignSystemSubHeader>Sidebar</DesignSystemSubHeader>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="folder" />
        <Icon name="page" />
      </Tiles>
      <DesignSystemSubHeader>Icons resized</DesignSystemSubHeader>
      <Columns space={4} alignY="center" alignX="left">
        <Column width="content">
          <Icon name="list-unordered" />
        </Column>
        <Column width="content">
          <Icon name="list-unordered" size={8} mobileSize={9} />
        </Column>
      </Columns>
      <DesignSystemSubHeader>Icons coloured</DesignSystemSubHeader>
      <Icon name="list-check-2" color={tw.color("primary-500")} />
    </ScrollSafeAreaView>
  );
}
