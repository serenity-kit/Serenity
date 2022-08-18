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
  CenterContent,
  Box,
  Mono,
  DesignSystemHeader as DSHeader,
  DesignSystemSubHeader as DSSubHeader,
  DesignSystemExampleArea as DSExampleArea,
  DesignSystemMono as DSMono,
  WorkspaceAvatar,
  collaborationColors,
} from "@serenity-tools/ui";
import { Columns, Column, Tiles } from "@mobily/stacks";
import React, { useState } from "react";
import { useWindowDimensions, StyleSheet } from "react-native";
import { VStack, HStack } from "native-base";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "../../utils/toast/showToast";

let counter = 0;

export default function DesignSystemScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [showModal, setShowModal] = useState(false);
  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const elevationLevels: BoxShadowLevels[] = [0, 1, 2, 3];

  // TODO use structural elements

  // TODO header, subheader etc. or variants (h1, h2, h3 ... ??)
  return (
    <ScrollSafeAreaView>
      <View style={tw`w-full max-w-4xl mx-auto px-4 pt-2 pb-6`}>
        <DSHeader>Avatar</DSHeader>
        <Text>
          An{" "}
          <DSMono variant={"component"} size="medium">
            Avatar
          </DSMono>{" "}
          component represents an object or entity.
        </Text>
        <DSSubHeader>Sizes</DSSubHeader>
        <Text variant="small">
          With the <DSMono variant="property">size</DSMono> property you can use
          the Avatar in 6 different sizes: <DSMono variant={"type"}>xs</DSMono>{" "}
          , <DSMono variant={"type"}>sm</DSMono> ,{" "}
          <DSMono variant={"type"}>md</DSMono> ,{" "}
          <DSMono variant={"type"}>lg</DSMono> ,{" "}
          <DSMono variant={"type"}>xl</DSMono> , or{" "}
          <DSMono variant={"type"}>2xl</DSMono> .
        </Text>
        <Text variant="small" style={tw`mt-1`}>
          The initials will size automatically.
        </Text>
        <DSExampleArea>
          <HStack
            space={2}
            alignItems="center"
            style={tw`pr-2 overflow-scroll sm:overflow-visible`}
          >
            <Avatar size={"xs"}>BE</Avatar>
            <Avatar size={"sm"}>NG</Avatar>
            <Avatar size={"md"}>AB</Avatar>
            <Avatar size={"lg"}>SK</Avatar>
            <Avatar size={"xl"}>AD</Avatar>
            <Avatar size={"2xl"}>HG</Avatar>
          </HStack>
        </DSExampleArea>

        <DSSubHeader>Styling</DSSubHeader>
        <Text variant="small" style={tw`mt-1`}>
          Set one of the many coloring options with the{" "}
          <DSMono variant="property">customColor</DSMono> property.
        </Text>
        <DSExampleArea>
          <Avatar customColor="arctic">BE</Avatar>
          <Avatar customColor="lavender">NG</Avatar>
          <Avatar customColor="rose">AB</Avatar>
          <Avatar customColor="honey">SK</Avatar>
          <Avatar customColor="emerald">AD</Avatar>
        </DSExampleArea>

        <DSSubHeader>Grouping</DSSubHeader>
        <Text variant="small">
          The <DSMono variant="component">AvatarGroup</DSMono> lets you stack
          Avatars. Use the <DSMono variant="property">max</DSMono> property to
          limit the number of Avatars.
        </Text>
        <DSExampleArea>
          <AvatarGroup max={3} _avatar={{ size: "sm" }}>
            <Avatar customColor="arctic">SK</Avatar>
            <Avatar customColor="lavender">NG</Avatar>
            <Avatar customColor="rose">AN</Avatar>
            <Avatar customColor="honey">NG</Avatar>
            <Avatar customColor="sky">NG</Avatar>
          </AvatarGroup>
        </DSExampleArea>

        <DSSubHeader>Workspace Variation</DSSubHeader>
        <Text variant="small">
          The <DSMono variant="component">WorkspaceAvatar</DSMono> should be
          used for all workspace related representation.
        </Text>
        <Text variant="small" style={tw`mt-1`}>
          Set one of the many coloring options with the{" "}
          <DSMono variant="property">customColor</DSMono> property.
        </Text>
        <DSExampleArea style={tw`overflow-scroll sm:overflow-visible`}>
          {collaborationColors.map((color) => {
            return <WorkspaceAvatar customColor={color} />;
          })}
        </DSExampleArea>

        <DSHeader>Button</DSHeader>
        <Text>
          The{" "}
          <DSMono variant={"component"} size="medium">
            Button
          </DSMono>{" "}
          component is used to trigger an action or event, such as submitting a
          form, opening a Dialog, canceling an action, or performing a delete
          operation.
        </Text>
        <Text variant={"xs"} bold style={tw`mt-6 -mb-3 text-primary-400`}>
          Properties
        </Text>
        <DSSubHeader>Variants</DSSubHeader>
        <Text variant="small">
          Use the <DSMono variant="property">variant</DSMono> property to
          display either a <DSMono variant={"type"}>primary</DSMono> or{" "}
          <DSMono variant={"type"}>secondary</DSMono> Button.
        </Text>
        <DSExampleArea>
          <Button>Login</Button>
          <Button variant="secondary">Login</Button>
        </DSExampleArea>
        <DSSubHeader>Sizes</DSSubHeader>
        <Text variant="small">
          For larger or smaller Buttons, use the{" "}
          <DSMono variant="property">size</DSMono> property. You can set it to{" "}
          <DSMono variant={"type"}>small</DSMono> ,{" "}
          <DSMono variant={"type"}>medium</DSMono> , or{" "}
          <DSMono variant={"type"}>large</DSMono> .
        </Text>
        <DSExampleArea>
          <Button size="small">Login</Button>
          <Button size="medium">Login</Button>
          <Button size="large">Login</Button>
        </DSExampleArea>
        <DSSubHeader>Loading State</DSSubHeader>
        <Text variant="small">
          Buttons also support an <DSMono variant="property">isLoading</DSMono>{" "}
          property, which shows a loading indicator, while disabling the button,
          as well.
        </Text>
        <DSExampleArea>
          <Button size="small" isLoading>
            Login
          </Button>
          <Button size="medium" isLoading>
            Login
          </Button>
          <Button size="large" isLoading>
            Login
          </Button>
        </DSExampleArea>
        <Text variant={"xs"} bold style={tw`mt-8 -mb-3 text-primary-400`}>
          Basic usage
        </Text>
        <DSSubHeader>Primary Button</DSSubHeader>
        <Text variant="small">
          Primary Buttons are high-emphasis, they contain actions that are
          important to our app.
        </Text>
        <DSExampleArea>
          <Button>Login</Button>
          <Button disabled>Login</Button>
          <Button isLoading>Login</Button>
        </DSExampleArea>
        <DSSubHeader>Secondary Button</DSSubHeader>
        <Text variant="small">
          Secondary Buttons are typically used for less-pronounced actions,
          including canceling.
        </Text>
        <DSExampleArea>
          <Button variant={"secondary"}>Cancel</Button>
          <Button variant={"secondary"} disabled>
            Cancel
          </Button>
          <Button variant={"secondary"} isLoading>
            Cancel
          </Button>
        </DSExampleArea>

        <DSHeader>CenterContent</DSHeader>
        <Text>
          With the <DSMono variant="component">CenterContent</DSMono> component
          you can easily center a child element vertically and horizontally
          within the available space.
        </Text>
        <DSSubHeader>Basic</DSSubHeader>
        <Text variant="small">
          The basic version doesn't need any properties and silently centers
          it's content.
        </Text>
        <View
          style={tw`h-40 mt-4 border border-gray-200 rounded overflow-hidden`}
        >
          <CenterContent>
            <Avatar size={"md"}>AV</Avatar>
          </CenterContent>
        </View>
        <DSSubHeader>Background</DSSubHeader>
        <Text variant="small">
          To add a background like in Login/Register to it just add the{" "}
          <DSMono variant="property">serenityBg</DSMono> property.
        </Text>
        <View style={tw`h-80 mt-4 rounded overflow-hidden`}>
          <CenterContent serenityBg>
            <Box style={tw`text-center`}>
              <Text bold>Can not connect to a network</Text>
              <Text muted variant="small">
                Unfortunately your registration request failed due a network
                error. Please try again later.
              </Text>
              <Button style={tw`self-center`}>Try Again</Button>
            </Box>
          </CenterContent>
        </View>

        <DSHeader>Checkbox</DSHeader>
        <Text>
          The <DSMono variant="component">Checkbox</DSMono> allows the user to
          select one or more items from a set.
        </Text>
        <DSSubHeader style={tw`-mb-2.5`}>Basic component</DSSubHeader>
        <DSExampleArea>
          <Checkbox
            value="test"
            accessibilityLabel="This is a dummy checkbox"
          />
          <Checkbox
            value="test"
            accessibilityLabel="This is a dummy checkbox"
            defaultIsChecked
          />
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
        </DSExampleArea>
        <DSSubHeader>Label</DSSubHeader>
        <Text variant="small">
          You can provide a Label by just including a{" "}
          <DSMono variant="component">Text</DSMono> element inside your
          Checkbox.
        </Text>
        <DSExampleArea>
          <Checkbox
            value="test"
            accessibilityLabel="This is a dummy checkbox"
            defaultIsChecked
          >
            <Text variant="small">
              I accept our{" "}
              <Link to={{ screen: "EncryptDecryptImageTest" }}>
                Encrypt / Decrypt Image
              </Link>{" "}
              test
            </Text>
          </Checkbox>
        </DSExampleArea>

        <DSHeader>EditorBottombar</DSHeader>
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

        <DSHeader>Editor Icons</DSHeader>
        <VStack space={3}>
          <EditorSidebarIcon name="bold" />
          <EditorSidebarIcon name="bold" isActive />
        </VStack>

        <DSHeader>Elevation</DSHeader>
        <HStack
          space={3}
          style={tw`pt-2 pb-4 pr-2 overflow-scroll sm:overflow-visible`}
        >
          {elevationLevels.map((level) => {
            return (
              <BoxShadow elevation={level} rounded>
                <HStack
                  style={tw`h-24 w-24 bg-white rounded`}
                  alignItems="center"
                  justifyContent="center"
                  key={`shadow_${level}`}
                >
                  <Text variant="xxs" muted>
                    elevation {level}
                  </Text>
                </HStack>
              </BoxShadow>
            );
          })}
        </HStack>

        <DSHeader style={tw`mb-0`}>Icons</DSHeader>
        <DSSubHeader>Marks</DSSubHeader>
        <Tiles style={tw`max-w-lg`} space={4} columns={10}>
          <Icon name="bold" />
          <Icon name="code-view" />
          <Icon name="italic" />
          <Icon name="link" />
          <Icon name="link-m" />
          <Icon name="strikethrough" />
          <Icon name="underline" />
        </Tiles>
        <DSSubHeader>Nodes</DSSubHeader>
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
        <DSSubHeader>Extension</DSSubHeader>
        <Tiles style={tw`max-w-lg`} space={4} columns={10}>
          <Icon name="font-color" />
        </Tiles>
        <DSSubHeader>Editor Custom</DSSubHeader>
        <Tiles style={tw`max-w-lg`} space={4} columns={10}>
          <Icon name="attachment-2" />
          <Icon name="font-size-2" />
          <Icon name="format-clear" />
          <Icon name="functions" />
          <Icon name="hashtag" />
          <Icon name="page-separator" />
          <Icon name="separator" />
        </Tiles>
        <DSSubHeader>UI</DSSubHeader>
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
        <DSSubHeader>Sidebar</DSSubHeader>
        <Tiles style={tw`max-w-lg`} space={4} columns={10}>
          <Icon name="folder" />
          <Icon name="page" />
        </Tiles>
        <DSSubHeader>Icons resized</DSSubHeader>
        <Columns space={4} alignY="center" alignX="left">
          <Column width="content">
            <Icon name="list-unordered" />
          </Column>
          <Column width="content">
            <Icon name="list-unordered" size={8} mobileSize={9} />
          </Column>
        </Columns>
        <DSSubHeader>Icons coloured</DSSubHeader>
        <Icon name="list-check-2" color={tw.color("primary-500")} />

        <DSHeader style={tw`mb-0`}>Info Messages</DSHeader>
        <DSSubHeader>Info</DSSubHeader>
        <VStack space={2} style={tw`max-w-90`}>
          <InfoMessage>
            The verification code is prefilled on staging.
          </InfoMessage>
          <InfoMessage icon>
            The verification code is prefilled on staging.
          </InfoMessage>
        </VStack>
        <DSSubHeader>Error</DSSubHeader>
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

        <DSHeader>Icon Button</DSHeader>
        <HStack alignItems="center" space={4}>
          <IconButton name="add-line" color="gray-500" />
          <IconButton name="menu" color="gray-800" large />
        </HStack>

        <DSHeader>Input</DSHeader>
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

        <DSHeader>Link</DSHeader>
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

        <DSHeader>Menu</DSHeader>
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
              <WorkspaceAvatar customColor="emerald" />
              <Text variant="xs">Happy Workspace</Text>
            </SidebarLink>
            <SidebarLink to={{ screen: "Login" }} style={tw`p-menu-item`}>
              <WorkspaceAvatar customColor="lavender" />
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

        <DSHeader>Modal (work in progress)</DSHeader>
        <Modal
          isVisible={showModal}
          onBackdropPress={() => setShowModal(false)}
        >
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

        <DSHeader>SidebarButton</DSHeader>
        <SidebarButton>
          <Text variant="small">Hallo</Text>
        </SidebarButton>
        <SidebarButton disabled>
          <Text variant="small">Hallo</Text>
        </SidebarButton>

        <DSHeader>SidebarLink</DSHeader>
        <SidebarLink to={{ screen: "EncryptDecryptImageTest" }}>
          <WorkspaceAvatar />
          <Text>Encrypt / Decrypt Image</Text>
        </SidebarLink>

        <DSHeader>Spinner</DSHeader>
        <VStack space={3}>
          <Spinner />
          <Spinner size="lg" />
          <Spinner fadeIn size="lg" />
        </VStack>

        <DSHeader>Text</DSHeader>
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

        <DSHeader>Toast</DSHeader>
        <Button
          onPress={() => {
            counter = counter + 1;
            showToast(`This is a message ${counter}`);
          }}
        >
          Add Toast
        </Button>

        <DSHeader>Tooltip</DSHeader>
        <HStack>
          <Tooltip label="This is a tip!" placement="right">
            <IconButton name="file-add-line" color="gray-500" large />
          </Tooltip>
        </HStack>
      </View>
    </ScrollSafeAreaView>
  );
}
