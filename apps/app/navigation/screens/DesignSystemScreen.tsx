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
  DesignSystemHeading as Heading,
  DesignSystemExampleArea as DSExampleArea,
  DesignSystemMono as DSMono,
  WorkspaceAvatar,
  collaborationColors,
  LinkExternal,
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

  const IconTile = (props) => {
    return (
      <CenterContent style={tw`w-30 h-20`}>
        <Icon name={props.name} size={6} />
        <Text variant="xxs" muted style={tw`mt-2 capitalize`}>
          {props.name.replace(/-./g, (x) => x[1].toUpperCase())}
        </Text>
      </CenterContent>
    );
  };

  const TilesFiller = (props) => {
    return (
      <>
        <View style={tw`flex-auto w-30 h-0`} />
        <View style={tw`flex-auto w-30 h-0`} />
        <View style={tw`flex-auto w-30 h-0`} />
        <View style={tw`flex-auto w-30 h-0`} />
        <View style={tw`flex-auto w-30 h-0`} />
      </>
    );
  };

  const h4Styles = tw`mt-8 -mb-4`;

  // TODO use structural elements
  return (
    <ScrollSafeAreaView>
      <View style={tw`w-full max-w-4xl mx-auto px-4 pt-2 pb-6`}>
        <Heading lvl={1}>Avatar</Heading>
        <Text>
          An{" "}
          <DSMono variant={"component"} size="medium">
            Avatar
          </DSMono>{" "}
          component represents an object or entity.
        </Text>
        <Heading lvl={4} style={h4Styles}>
          Properties
        </Heading>
        <Heading lvl={3}>Sizes</Heading>
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
          <HStack space={2} alignItems="center" style={tw`pr-2`}>
            <Avatar size={"xs"}>BE</Avatar>
            <Avatar size={"sm"}>NG</Avatar>
            <Avatar size={"md"}>AB</Avatar>
            <Avatar size={"lg"}>SK</Avatar>
            <Avatar size={"xl"}>AD</Avatar>
            <Avatar size={"2xl"}>HG</Avatar>
          </HStack>
        </DSExampleArea>
        <Heading lvl={3}>Styling</Heading>
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
        <Heading lvl={3}>Grouping</Heading>
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
        <Heading lvl={4} style={h4Styles}>
          Related components
        </Heading>
        <Heading lvl={2}>WorkspaceAvatar</Heading>
        <Text variant="small">
          The <DSMono variant="component">WorkspaceAvatar</DSMono> should be
          used for all workspace related representation.
        </Text>
        <Text variant="small" style={tw`mt-1`}>
          Set one of the many coloring options with the{" "}
          <DSMono variant="property">customColor</DSMono> property.
        </Text>
        <DSExampleArea>
          {collaborationColors.map((color) => {
            return <WorkspaceAvatar customColor={color} />;
          })}
        </DSExampleArea>

        <Heading lvl={1}>BoxShadow</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="medium">
            BoxShadow
          </DSMono>{" "}
          component can be used to establish a hierarchy between other content.
          It controls the size of the shadow applied to the surface.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="small">
          You can raise a component up to three levels by using the{" "}
          <DSMono variant="property">elevation</DSMono> property.
        </Text>
        <DSExampleArea>
          <HStack space={3} style={tw`pr-2`}>
            {elevationLevels.map((level) => {
              return (
                <BoxShadow elevation={level} rounded key={`shadow_${level}`}>
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
        </DSExampleArea>

        <Heading lvl={1}>Button</Heading>
        <Text>
          The{" "}
          <DSMono variant={"component"} size="medium">
            Button
          </DSMono>{" "}
          component is used to trigger an action or event, such as submitting a
          form, opening a Dialog, canceling an action, or performing a delete
          operation.
        </Text>
        <Heading lvl={4} style={h4Styles}>
          Properties
        </Heading>
        <Heading lvl={3}>Variants</Heading>
        <Text variant="small">
          Use the <DSMono variant="property">variant</DSMono> property to
          display either a <DSMono variant={"type"}>primary</DSMono> or{" "}
          <DSMono variant={"type"}>secondary</DSMono> Button.
        </Text>
        <DSExampleArea>
          <Button>Login</Button>
          <Button variant="secondary">Login</Button>
        </DSExampleArea>
        <Heading lvl={3}>Sizes</Heading>
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
        <Heading lvl={3}>Loading State</Heading>
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
        <Heading lvl={4} style={h4Styles}>
          Basic usage
        </Heading>
        <Heading lvl={3}>Primary Button</Heading>
        <Text variant="small">
          Primary Buttons are high-emphasis, they contain actions that are
          important to our app.
        </Text>
        <DSExampleArea>
          <Button>Login</Button>
          <Button disabled>Login</Button>
          <Button isLoading>Login</Button>
        </DSExampleArea>
        <Heading lvl={3}>Secondary Button</Heading>
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
        <Heading lvl={4} style={h4Styles}>
          Related components
        </Heading>
        <Heading lvl={2}>IconButton</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="medium">
            IconButtons
          </DSMono>{" "}
          are commonly found in the{" "}
          <DSMono variant="context">PageHeader</DSMono> and it's siblings, as
          well as in the <DSMono variant="context">Sidebar</DSMono>.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text>
          <DSMono variant="component">IconButtons</DSMono> require their{" "}
          <DSMono variant="property">name</DSMono> property which uses the{" "}
          <DSMono variant={"type"}>IconNames</DSMono> type, just like the{" "}
          <DSMono variant="component">Icon</DSMono> component.
        </Text>
        <DSExampleArea>
          <IconButton name="add-line" color="gray-800" />
          <IconButton name="more-line" color="gray-800" />
          <IconButton name="file-add-line" color="gray-800" />
        </DSExampleArea>
        <Heading lvl={3}>Sizes</Heading>
        <Text variant="small">
          The <DSMono variant="component">IconButton</DSMono> comes in two sizes
          which for now only affects the clickable/hovered area.
        </Text>
        <Text variant="small">
          The default is regular, to make it a bit bigger use the{" "}
          <DSMono variant="property">large</DSMono> property.
        </Text>
        <DSExampleArea>
          <IconButton name="double-arrow-left" color="gray-800" />
          <IconButton name="double-arrow-right" color="gray-800" />
          <IconButton name="double-arrow-left" color="gray-800" large />
          <IconButton name="double-arrow-right" color="gray-800" large />
        </DSExampleArea>
        <Heading lvl={3}>Styling</Heading>
        <Text variant="small">
          As with <DSMono variant="component">Icons</DSMono> you can use the{" "}
          <DSMono variant="property">color</DSMono> property to style it, but
          for now we only support <DSMono variant="type">gray-400</DSMono> to{" "}
          <DSMono variant="type">gray-800</DSMono>.
        </Text>
        <DSExampleArea>
          <IconButton name="menu" color="gray-400" large />
          <IconButton name="image-line" color="gray-500" large />
          <IconButton name="settings-4-line" color="gray-600" large />
          <IconButton name="double-arrow-left" color="gray-700" large />
          <IconButton name="double-arrow-right" color="gray-800" large />
        </DSExampleArea>
        <Heading lvl={3}>Label</Heading>
        <Text variant="small">
          An <DSMono variant="component">IconButton</DSMono> can have a{" "}
          <DSMono variant="property">label</DSMono> to make it more explicit and
          fitting in context's like the{" "}
          <DSMono variant="component">Menu</DSMono> .
        </Text>
        <DSExampleArea>
          <IconButton name="plus" large label="New workspace" />
        </DSExampleArea>
        <Heading lvl={3}>Usage</Heading>
        <Text variant="small">
          <DSMono variant="component">IconButtons</DSMono> are for now used to
          toggle certain elements - such as the navigation{" "}
          <DSMono variant="context">Sidebar</DSMono> on mobile or{" "}
          <DSMono variant="context">Menus</DSMono> - or as trigger for common
          actions - like creating a new page.
        </Text>
        <DSExampleArea>
          <VStack
            style={tw`w-80 md:w-sidebar py-4 border border-gray-200 bg-gray-100`}
          >
            <SidebarButton>
              <View style={tw`w-full flex flex-row justify-between`}>
                <HStack alignItems={"center"}>
                  <View>
                    <Icon
                      name="arrow-right-filled"
                      color={tw.color("gray-600")}
                      mobileSize={5}
                    />
                  </View>
                  <View style={tw`-ml-0.5`}>
                    <Icon name="folder" size={5} mobileSize={8} />
                  </View>
                  <Text
                    variant="small"
                    style={tw`ml-1.5 max-w-32`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Getting Started
                  </Text>
                </HStack>
                <HStack alignItems="center" space={2}>
                  <Icon name="more-line" color={tw.color("gray-600")}></Icon>
                  <Icon
                    name="file-add-line"
                    color={tw.color("gray-600")}
                  ></Icon>
                </HStack>
              </View>
            </SidebarButton>
            <SidebarButton>
              <View style={tw`w-full flex flex-row justify-between`}>
                <HStack alignItems={"center"}>
                  <View>
                    <Icon
                      name="arrow-right-filled"
                      color={tw.color("gray-600")}
                      mobileSize={5}
                    />
                  </View>
                  <View style={tw`-ml-0.5`}>
                    <Icon name="folder" size={5} mobileSize={8} />
                  </View>
                  <Text
                    variant="small"
                    style={tw`ml-1.5 max-w-32`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Notes
                  </Text>
                </HStack>
                <HStack alignItems="center" space={2}>
                  <Icon name="more-line" color={tw.color("gray-600")}></Icon>
                  <Icon
                    name="file-add-line"
                    color={tw.color("gray-600")}
                  ></Icon>
                </HStack>
              </View>
            </SidebarButton>
          </VStack>
        </DSExampleArea>
        <Text style={tw`mt-4`} variant="xxs" muted>
          TBD: They are later also used to toggle buttons that allow a single
          choice to be selected or deselected, such as adding or removing a star
          to an item.
        </Text>

        <Heading lvl={1}>CenterContent</Heading>
        <Text>
          With the{" "}
          <DSMono variant="component" size="medium">
            CenterContent
          </DSMono>{" "}
          component you can easily center a child element vertically and
          horizontally within the available space.
        </Text>
        <Heading lvl={3}>Basic</Heading>
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
        <Heading lvl={3}>Background</Heading>
        <Text variant="small">
          To add a background like in{" "}
          <DSMono variant={"context"}>Login/Register</DSMono> to it just add the{" "}
          <DSMono variant="property">serenityBg</DSMono> property.
        </Text>
        <View
          style={tw`h-80 mt-4 border border-gray-200 md:border-white rounded overflow-hidden`}
        >
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

        <Heading lvl={1}>Checkbox</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="medium">
            Checkbox
          </DSMono>{" "}
          allows the user to select one or more items from a set.
        </Text>
        <Heading lvl={3} style={tw`-mb-2.5`}>
          Basic
        </Heading>
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
        <Heading lvl={3}>Label</Heading>
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

        <Heading lvl={1}>EditorBottombar</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="medium">
            EditorBottombar
          </DSMono>{" "}
          is used on small devices to show all of our Editors functionality,
          which are held in our <DSMono variant="context">EditorSidebar</DSMono>{" "}
          on larger screens.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="small">
          The <DSMono variant="component">EditorBottombarButton</DSMono> is used
          to toggle <Mono>marks</Mono> and <Mono>nodes</Mono> of the editor, and
          also to show hidden functions &#40;wip&#41; due to limits of available
          space on mobile.
        </Text>
        <DSExampleArea>
          <EditorBottombarButton name="arrow-down-s-line" />
          <EditorBottombarButton name="text" />
          <EditorBottombarButton name="list-unordered" />
        </DSExampleArea>
        <Heading lvl={3}>States</Heading>
        <Text variant="small">
          To show a <Mono>mark</Mono> or <Mono>node</Mono> is active use the{" "}
          <DSMono variant="property">isActive</DSMono> property of the{" "}
          <DSMono variant="component">EditorBottombarButton</DSMono>.
        </Text>
        <DSExampleArea>
          <EditorBottombarButton name="arrow-down-s-line" />
          <EditorBottombarButton name="text" />
          <EditorBottombarButton name="list-unordered" isActive />
        </DSExampleArea>
        <Heading lvl={3}>Divider</Heading>
        <Text variant="small">
          To section the different functionalities you can use the{" "}
          <DSMono variant="component">EditorBottombarDivider</DSMono>.
        </Text>
        <DSExampleArea>
          <EditorBottombarButton name="bold" />
          <EditorBottombarButton name="italic" />
          <EditorBottombarButton name="code-view" />
          <EditorBottombarButton name="link" isActive />
          <EditorBottombarDivider />
          <EditorBottombarButton name="list-unordered" />
          <EditorBottombarButton name="list-ordered" />
          <EditorBottombarButton name="list-check-2" />
        </DSExampleArea>

        <Heading lvl={1}>EditorSidebar</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="medium">
            EditorSidebar
          </DSMono>{" "}
          is used on large devices to show all of our Editors functionality.
        </Text>
        <Text>
          For smaller devices we use the{" "}
          <DSMono variant="context">EditorBottombar</DSMono>.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="small">
          The <DSMono variant="component">EditorSidebarIcon</DSMono> is used to
          make it easier for users to find <Mono>marks</Mono> and{" "}
          <Mono>nodes</Mono> of the editor in the{" "}
          <DSMono variant="component">EditorSidebar</DSMono>.
        </Text>
        <DSExampleArea>
          <EditorSidebarIcon name="bold" />
          <EditorSidebarIcon name="italic" />
          <EditorSidebarIcon name="code-view" />
        </DSExampleArea>
        <Heading lvl={3}>States</Heading>
        <Text variant="small">
          To show a <Mono>mark</Mono> or <Mono>node</Mono> is active use the{" "}
          <DSMono variant="property">isActive</DSMono> property of the{" "}
          <DSMono variant="component">EditorSidebarIcon</DSMono>
        </Text>
        <DSExampleArea>
          <EditorSidebarIcon name="bold" isActive />
          <EditorSidebarIcon name="italic" isActive />
          <EditorSidebarIcon name="code-view" />
        </DSExampleArea>
        <Heading lvl={3}>Usage</Heading>
        <Text variant="small">
          The <DSMono variant="component">EditorSidebarIcon</DSMono> is usually
          the first child of a{" "}
          <DSMono variant="component">SidebarButton</DSMono> followed by a{" "}
          <DSMono variant="component">Text</DSMono> component to make the
          functionality more descriptive.
        </Text>
        <DSExampleArea>
          <VStack style={tw`w-sidebar py-4 border border-gray-200 bg-gray-100`}>
            <SidebarButton>
              <EditorSidebarIcon name="bold" />
              <Text variant="small">Bold</Text>
            </SidebarButton>
            <SidebarButton>
              <EditorSidebarIcon name="italic" />
              <Text variant="small">Italic</Text>
            </SidebarButton>
            <SidebarButton>
              <EditorSidebarIcon name="code-view" isActive />
              <Text variant="small" bold>
                Code
              </Text>
            </SidebarButton>
          </VStack>
        </DSExampleArea>
        <Heading lvl={3}>Divider</Heading>
        <Text variant="small">
          To section the different functionalities you can use the generic{" "}
          <DSMono variant="component">SidebarDivider</DSMono>.
        </Text>
        <DSExampleArea>
          <VStack style={tw`w-sidebar py-4 border border-gray-200 bg-gray-100`}>
            <SidebarButton>
              <EditorSidebarIcon name="code-s-slash-line" isActive />
              <Text variant="small" bold>
                Codeblock
              </Text>
            </SidebarButton>
            <SidebarDivider></SidebarDivider>
            <SidebarButton>
              <EditorSidebarIcon name="list-unordered" />
              <Text variant="small">Bullet-List</Text>
            </SidebarButton>
            <SidebarButton>
              <EditorSidebarIcon name="list-ordered" />
              <Text variant="small">Numbered-List</Text>
            </SidebarButton>
          </VStack>
        </DSExampleArea>

        <Heading lvl={1}>Icons</Heading>
        <Text>
          We mostly use{" "}
          <DSMono variant="component" size="medium">
            Icons
          </DSMono>{" "}
          from{" "}
          <LinkExternal
            variant="medium"
            href="https://remixicon.com/"
            style={tw`text-gray-700`}
          >
            remixicon
          </LinkExternal>{" "}
          but some are even more fancy and custom made by our lovely Designer,
          so have a look at{" "}
          <LinkExternal
            variant="medium"
            href="https://www.figma.com/"
            style={tw`text-gray-700`}
          >
            Figma
          </LinkExternal>{" "}
          to see what she is up to ;-&#41;
        </Text>
        <Heading lvl={3}>Sizes</Heading>
        <Text variant="small">
          You can scale Icons with the <DSMono variant="property">size</DSMono>{" "}
          property. If you want to add a different size for smaller Devices,
          also set <DSMono variant="property">mobileSize</DSMono> .
        </Text>
        <DSExampleArea>
          <Icon name="check-line" />
          <Icon name="check-line" size={6} mobileSize={8} />
          <Icon name="check-line" size={8} mobileSize={10} />
          <Icon name="check-line" size={10} mobileSize={12} />
          <Icon name="check-line" size={12} mobileSize={14} />
        </DSExampleArea>
        <Heading lvl={3}>Styling</Heading>
        <Text variant="small">
          Icons don't have a style property, but you can still dye them with the{" "}
          <DSMono variant="property">color</DSMono> property.
        </Text>
        <Text variant="small" style={tw`mt-4`}>
          For now you can either put in a{" "}
          <DSMono variant="type">HEX-string</DSMono> directly, or pass one of
          our custom colors by using <DSMono variant="type">tw.color</DSMono>.
        </Text>
        <DSExampleArea>
          <Icon name="list-check-2" size={8} color={tw.color("primary-200")} />
          <Icon name="list-check-2" size={8} color={tw.color("primary-300")} />
          <Icon name="list-check-2" size={8} color={tw.color("primary-400")} />
          <Icon name="list-check-2" size={8} color={tw.color("primary-500")} />
          <Icon name="list-check-2" size={8} color={tw.color("primary-600")} />
          <Icon
            name="list-check-2"
            size={8}
            color={tw.color("collaboration-purple")}
          />
          <Icon
            name="list-check-2"
            size={8}
            color={tw.color("collaboration-raspberry")}
          />
          <Icon
            name="list-check-2"
            size={8}
            color={tw.color("collaboration-orange")}
          />
          <Icon
            name="list-check-2"
            size={8}
            color={tw.color("collaboration-honey")}
          />
          <Icon
            name="list-check-2"
            size={8}
            color={tw.color("collaboration-emerald")}
          />
        </DSExampleArea>
        <Heading lvl={3}>Set</Heading>
        <Text variant="small">
          Below is a list of all of the{" "}
          <DSMono variant="component">Icons</DSMono> in the library, along with
          the corresponding component names, divided in their most common
          usages:
        </Text>
        <DSExampleArea vertical center>
          <Heading lvl={3} style={tw`text-center mt-4 mb-0`}>
            Marks
          </Heading>
          <HStack flexWrap="wrap">
            <IconTile name="bold" />
            <IconTile name="code-view" />
            <IconTile name="italic" />
            <IconTile name="link" />
            <IconTile name="link-m" />
            <IconTile name="strikethrough" />
            <IconTile name="underline" />
            <TilesFiller />
          </HStack>
          <Heading lvl={3} style={tw`text-center m-0`}>
            Nodes
          </Heading>
          <HStack flexWrap="wrap">
            <IconTile name="at-line" />
            <IconTile name="code-s-slash-line" />
            <IconTile name="double-quotes-l" />
            <IconTile name="heading" />
            <IconTile name="h-1" />
            <IconTile name="h-2" />
            <IconTile name="h-3" />
            <IconTile name="h-4" />
            <IconTile name="h-5" />
            <IconTile name="h-6" />
            <IconTile name="indent-decrease" />
            <IconTile name="indent-increase" />
            <IconTile name="list-check" />
            <IconTile name="list-check-2" />
            <IconTile name="list-ordered" />
            <IconTile name="list-unordered" />
            <IconTile name="paragraph" />
            <IconTile name="table-2" />
            <IconTile name="text" />
            <TilesFiller />
          </HStack>
          <Heading lvl={3} style={tw`text-center m-0`}>
            Extension
          </Heading>
          <HStack flexWrap="wrap">
            <IconTile name="font-color" />
          </HStack>
          <Heading lvl={3} style={tw`text-center m-0`}>
            Editor Custom
          </Heading>
          <HStack flexWrap="wrap">
            <IconTile name="attachment-2" />
            <IconTile name="font-size-2" />
            <IconTile name="format-clear" />
            <IconTile name="functions" />
            <IconTile name="hashtag" />
            <IconTile name="page-separator" />
            <IconTile name="separator" />
            <TilesFiller />
          </HStack>
          <Heading lvl={3} style={tw`text-center m-0`}>
            UI
          </Heading>
          <HStack flexWrap="wrap">
            <IconTile name="add-line" />
            <IconTile name="archive-fill" />
            <IconTile name="archive-line" />
            <IconTile name="arrow-down-filled" />
            <IconTile name="arrow-down-s-fill" />
            <IconTile name="arrow-down-s-line" />
            <IconTile name="arrow-go-back-fill" />
            <IconTile name="arrow-go-back-line" />
            <IconTile name="arrow-go-forward-fill" />
            <IconTile name="arrow-go-forward-line" />
            <IconTile name="arrow-right-s-line" />
            <IconTile name="arrow-right" />
            <IconTile name="arrow-right-filled" />
            <IconTile name="arrow-up-down-line" />
            <IconTile name="bookmark-fill" />
            <IconTile name="bookmark-line" />
            <IconTile name="book-open-line" />
            <IconTile name="calendar-check-fill" />
            <IconTile name="chat-1-line" />
            <IconTile name="chat-4-line" />
            <IconTile name="check-line" />
            <IconTile name="close-circle-fill" />
            <IconTile name="command-line" />
            <IconTile name="cup-line" />
            <IconTile name="cursor" />
            <IconTile name="delete-bin-line" />
            <IconTile name="double-arrow-left" />
            <IconTile name="double-arrow-right" />
            <IconTile name="download-line" />
            <IconTile name="emotion-line" />
            <IconTile name="external-link-line" />
            <IconTile name="file-add-fill" />
            <IconTile name="file-add-line" />
            <IconTile name="file-copy-line" />
            <IconTile name="file-line" />
            <IconTile name="file-search-line" />
            <IconTile name="file-transfer-line" />
            <IconTile name="folder-fill" />
            <IconTile name="folder-line" />
            <IconTile name="folder-music-line" />
            <IconTile name="history-line" />
            <IconTile name="image-2-line" />
            <IconTile name="image-line" />
            <IconTile name="information-fill" />
            <IconTile name="information-line" />
            <IconTile name="more" />
            <IconTile name="more-2-line" />
            <IconTile name="more-line" />
            <IconTile name="movie-line" />
            <IconTile name="plus" />
            <IconTile name="printer-line" />
            <IconTile name="question-mark" />
            <IconTile name="search-line" />
            <IconTile name="settings-4-line" />
            <IconTile name="stars-s-fill" />
            <IconTile name="serenity-feather" />
            <IconTile name="warning-fill" />
            <TilesFiller />
          </HStack>
          <Heading lvl={3} style={tw`text-center m-0`}>
            Sidebar
          </Heading>
          <HStack flexWrap="wrap">
            <IconTile name="folder" />
            <IconTile name="page" />
          </HStack>
        </DSExampleArea>

        <Heading lvl={1}>Info Messages</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="medium">
            InfoMessage
          </DSMono>{" "}
          component is used to show feedback to the user about an action or
          state.
        </Text>
        <Heading lvl={3}>Variants</Heading>
        <Text variant="small">
          Use the <DSMono variant="property">variant</DSMono> property to
          display either an <DSMono variant={"type"}>info</DSMono> or{" "}
          <DSMono variant={"type"}>error</DSMono> Message.
        </Text>
        <DSExampleArea vertical stackWidth={80}>
          <InfoMessage>
            The verification code is prefilled on staging.
          </InfoMessage>
          <InfoMessage variant="error">
            Unfortunately your registration request failed due a network error.
            Please try again later.
          </InfoMessage>
        </DSExampleArea>
        <Heading lvl={3}>Icons</Heading>
        <Text variant="small">
          You can add a for now predefined Icon to the message by adding the{" "}
          <DSMono variant="property">icon</DSMono> property.
        </Text>
        <DSExampleArea vertical stackWidth={80}>
          <InfoMessage icon>
            The verification code is prefilled on staging.
          </InfoMessage>
          <InfoMessage variant="error" icon>
            Unfortunately your registration request failed due a network error.
            Please try again later.
          </InfoMessage>
        </DSExampleArea>

        <Heading lvl={1}>Input</Heading>
        <Text>
          An{" "}
          <DSMono variant="component" size="medium">
            Input
          </DSMono>{" "}
          lets users enter and edit text.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="small">
          The basic <DSMono variant="component">Input</DSMono> component is
          minimal in styling and features, as it is used as a building block for
          the <DSMono variant="component">LabeledInput</DSMono> component.
        </Text>
        <DSExampleArea>
          <Input />
        </DSExampleArea>
        <Heading lvl={4} style={h4Styles}>
          Commonly used
        </Heading>
        <Heading lvl={2}>Labeled Input</Heading>
        <Text variant="small">
          <DSMono variant="component">LabeledInput</DSMono>s share all the{" "}
          <DSMono variant="component">InputProps</DSMono> and are used in all
          the forms of our application. You can easily add a{" "}
          <DSMono variant="property">label</DSMono> via property.
        </Text>
        <DSExampleArea vertical>
          <LabeledInput
            label={"Email"}
            value="jane@example.com"
            keyboardType="email-address"
            placeholder="Enter your email …"
            autoCapitalize="none"
          />
          <LabeledInput
            label={"Password"}
            secureTextEntry
            placeholder="Enter your password …"
          />
          <LabeledInput
            label={"Verification Key"}
            value="70909qer798q7987q"
            disabled
          />
        </DSExampleArea>
        <Heading lvl={3}>Hints</Heading>
        <Text variant="small">
          You can use a <DSMono variant="property">hint</DSMono> to add
          information you want the user to have regarding this input.
        </Text>
        <DSExampleArea vertical>
          <LabeledInput
            label={"Password"}
            secureTextEntry
            value="password1234"
            placeholder="Enter your password …"
          />
          <LabeledInput
            label={"Verification Key"}
            value="70909qer798q7987q"
            disabled
            hint="We have already prefilled this field with your key."
          />
        </DSExampleArea>

        <Heading lvl={1}>Link</Heading>
        <Text>
          The{" "}
          <DSMono variant={"component"} size={"medium"}>
            Link
          </DSMono>{" "}
          is an accessible element for navigation inside the application.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="small">
          The component adjusts to the{" "}
          <DSMono variant="property">variant</DSMono> of the parenting{" "}
          <DSMono variant="component">Text</DSMono> component in{" "}
          <DSMono variant="type">size</DSMono> and{" "}
          <DSMono variant="type">font-family</DSMono> as well as when said
          parent is set to <DSMono variant="property">bold</DSMono>.
        </Text>
        <Text variant="small" style={tw`mt-2`}>
          Notice though the color stays the same no matter if the parent{" "}
          <DSMono variant="component">Text</DSMono> is set to be{" "}
          <DSMono variant="property">muted</DSMono> or the color is changed, to
          ensure a consistent and distinguishable look &amp; feel of all{" "}
          <DSMono variant={"component"}>Links</DSMono> in our application.
        </Text>
        <DSExampleArea vertical>
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
        </DSExampleArea>
        <Heading lvl={4} style={h4Styles}>
          Related components
        </Heading>
        <Heading lvl={2}>Link External</Heading>
        <Text variant="small">
          The <DSMono variant={"component"}>LinkExternal</DSMono> component is
          used for links outside of our application.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="small">
          In comparison to the <DSMono variant={"component"}>Link</DSMono>{" "}
          component it is an independent element which accepts all properties of
          the <DSMono variant={"component"}>Text</DSMono> component. Therefore
          it is not adjusting to it's contexts variant and properties.
        </Text>
        <DSExampleArea vertical>
          <Text variant="xxs">
            This is an xxs Text and here a default{" "}
            <LinkExternal href="https://www.figma.com/">link</LinkExternal> to
            somewhere else
          </Text>
          <Text variant="xxs" bold>
            But I can easily give the{" "}
            <LinkExternal href="https://www.figma.com/" variant="xxs" bold>
              link
            </LinkExternal>{" "}
            the same styling as it's parent as they share the same properties
          </Text>
        </DSExampleArea>
        <Heading lvl={3}>Icon</Heading>
        <Text variant="small">
          The component can be marked with an additional Icon via the{" "}
          <DSMono variant="property">icon</DSMono> property if we explicitly
          need to tell the user that they will leave the application context.
        </Text>
        <DSExampleArea vertical>
          <Text variant="xxs">
            For further info check out our{" "}
            <LinkExternal variant="xxs" href="https://www.serenity.li" icon>
              knowledgebase
            </LinkExternal>
          </Text>
          <Text variant="xs">
            For further info check out our{" "}
            <LinkExternal variant="xs" href="https://www.serenity.li" icon>
              knowledgebase
            </LinkExternal>
          </Text>
          <Text variant="small">
            For further info check out our{" "}
            <LinkExternal variant="small" href="https://www.serenity.li" icon>
              knowledgebase
            </LinkExternal>
          </Text>
          <Text variant="medium">
            For further info check out our{" "}
            <LinkExternal variant="medium" href="https://www.serenity.li" icon>
              knowledgebase
            </LinkExternal>
          </Text>
          <Text variant="large">
            For further info check out our{" "}
            <LinkExternal variant="large" href="https://www.serenity.li" icon>
              knowledgebase
            </LinkExternal>
          </Text>
        </DSExampleArea>

        <Heading lvl={1}>Menu</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="medium">
            Menu
          </DSMono>{" "}
          component shows a list of actions that a user can take.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="small">
          Elements as the <DSMono variant="component">MenuButton</DSMono>{" "}
          component represent the actions of the{" "}
          <DSMono variant="component">Menu</DSMono> .
        </Text>
        <DSExampleArea>
          <BoxShadow elevation={2} rounded>
            <VStack style={tw`py-1.5 bg-white rounded overflow-hidden`}>
              <MenuButton>Create Folder</MenuButton>
              <MenuButton>Rename</MenuButton>
            </VStack>
          </BoxShadow>
        </DSExampleArea>
        <Heading lvl={3}>Divider</Heading>
        <Text variant="small">
          To section the different functionalities you can use the{" "}
          <DSMono variant="component">SidebarDivider</DSMono> with added{" "}
          <DSMono variant="property">collapsed</DSMono> property.
        </Text>
        <DSExampleArea>
          <BoxShadow elevation={2} rounded>
            <VStack style={tw`py-1.5 bg-white rounded overflow-hidden`}>
              <MenuButton>Create Folder</MenuButton>
              <MenuButton>Rename</MenuButton>
              <SidebarDivider collapsed />
              <MenuButton>Delete</MenuButton>
            </VStack>
          </BoxShadow>
        </DSExampleArea>
        <Heading lvl={3}>Icons</Heading>
        <Text variant="small">
          Usually all <DSMono variant="component">MenuButton</DSMono>s should
          have set an <DSMono variant="property">icon</DSMono> to make it easier
          for the user to understand and learn the common actions of the
          application.
        </Text>
        <Text variant="small" style={tw`mt-2`}>
          Add the optional property <DSMono variant="property">danger</DSMono>{" "}
          to show the user irreversible actions.
        </Text>
        <DSExampleArea>
          <BoxShadow elevation={2} rounded>
            <VStack style={tw`w-50 py-1.5 bg-white rounded overflow-hidden`}>
              <MenuButton icon="folder-line">Create Folder</MenuButton>
              <MenuButton icon="font-size-2">Rename</MenuButton>
              <SidebarDivider collapsed />
              <MenuButton icon="delete-bin-line" danger>
                Delete
              </MenuButton>
            </VStack>
          </BoxShadow>
        </DSExampleArea>
        <Heading lvl={3}>Trigger</Heading>
        <Text variant="small">
          To add an opening element to a{" "}
          <DSMono variant="component">Menu</DSMono> just pass a clickable
          element via the <DSMono variant="property">trigger</DSMono> property.
          Although any element would work we commonly use{" "}
          <DSMono variant="component">Icon</DSMono>s as triggers.
        </Text>
        <DSExampleArea>
          <Menu
            placement="bottom left"
            style={tw`w-60`}
            offset={8}
            isOpen={isOpenPopover}
            onChange={setIsOpenPopover}
            trigger={
              <IconButton
                accessibilityLabel="More options menu"
                name="more-line"
                color="gray-600"
                style={tw`p-2 md:p-0`}
              ></IconButton>
            }
          >
            <MenuButton
              onPress={() => {
                setIsOpenPopover(false);
              }}
              icon="folder-line"
            >
              Create Folder
            </MenuButton>
            <MenuButton
              onPress={() => {
                setIsOpenPopover(false);
              }}
              icon="font-size-2"
            >
              Rename
            </MenuButton>
            <SidebarDivider collapsed />
            <MenuButton
              onPress={() => {
                setIsOpenPopover(false);
              }}
              icon="delete-bin-line"
              danger
            >
              Delete
            </MenuButton>
          </Menu>
        </DSExampleArea>

        <Heading lvl={4} style={h4Styles}>
          Advanced usage
        </Heading>
        <Heading lvl={3}>Shortcuts</Heading>
        <Text variant="small">
          To add keyboard shortcuts to one of your actions just add a{" "}
          <DSMono variant="component">Shortcut</DSMono> component via{" "}
          <DSMono variant="property">shortcut</DSMono> .
        </Text>
        <Text variant="small" style={tw`mt-2 text-left`}>
          To avoid accidents don't put a shortcut on a{" "}
          <DSMono variant="context">dangerous</DSMono> action.
        </Text>
        <DSExampleArea>
          <BoxShadow elevation={2} rounded>
            <VStack style={tw`w-50 py-1.5 bg-white rounded overflow-hidden`}>
              <MenuButton icon="folder-line" shortcut={<Shortcut letter="N" />}>
                Create Folder
              </MenuButton>
              <MenuButton icon="font-size-2" shortcut={<Shortcut letter="R" />}>
                Rename
              </MenuButton>
              <SidebarDivider collapsed />
              <MenuButton icon="delete-bin-line" danger>
                Delete
              </MenuButton>
            </VStack>
          </BoxShadow>
        </DSExampleArea>
        <Heading lvl={3}>Links and more</Heading>
        <Text variant={"small"}>
          Besides the <DSMono variant="component">MenuButton</DSMono> you can
          also use a <DSMono variant="component">SidebarLink</DSMono> as one of
          the Menu-actions. Just be sure to give it a{" "}
          <DSMono variant="type">p-menu-item</DSMono> class passed via the{" "}
          <DSMono variant="property">style</DSMono> property to mimic the look
          of MenuButtons.
        </Text>
        <DSExampleArea>
          <BoxShadow elevation={2} rounded>
            <VStack style={tw`w-50 py-1.5 bg-white rounded overflow-hidden`}>
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
                <Text variant="xs">Notes</Text>
              </SidebarLink>
              <SidebarLink to={{ screen: "Login" }} style={tw`p-menu-item`}>
                <WorkspaceAvatar customColor="honey" />
                <Text variant="xs">Project X</Text>
              </SidebarLink>
              <View style={tw`pl-2 pr-3 py-1.5`}>
                <IconButton name="plus" label="New workspace" />
              </View>

              <SidebarDivider collapsed />
              <MenuButton>Logout</MenuButton>
            </VStack>
          </BoxShadow>
        </DSExampleArea>

        <Heading lvl={1}>Modal (work in progress)</Heading>
        <Text>
          The <DSMono variant="component">Modal</DSMono> is a Dialog on top of
          an overlay used to show content that requires user interaction.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="small">
          As the <DSMono variant="component">Modal</DSMono> is used for explicit
          user interaction it is necessary to provide at least one Button. To
          ensure consistent user experience they should be added as children of
          the
          <DSMono variant="component">ModalButtonFooter</DSMono> component.
        </Text>
        <Text variant="small" style={tw`mt-2`}>
          This component requires to be passed a{" "}
          <DSMono variant="component">Button</DSMono> via the Footers{" "}
          <DSMono variant="property">confirm</DSMono> property. To add a{" "}
          <DSMono variant="property">cancel</DSMono> action pass a Button to the
          Footers <DSMono variant="property">confirm</DSMono> property.
        </Text>
        <DSExampleArea style={tw`bg-gray-900/50 items-center`} vertical center>
          <Box>
            <Text variant="small">
              Something has happened and I just wanted to let you know
              explicitly and not just by a Toast.
            </Text>
            <ModalButtonFooter
              confirm={<Button variant="primary">Confirm</Button>}
            />
          </Box>
        </DSExampleArea>
        <Heading lvl={3}>Header</Heading>
        <Text variant="small">
          A <DSMono variant="component">Modal</DSMono> doesn't require a header,{" "}
          but can be added by using the{" "}
          <DSMono variant="component">ModalHeader</DSMono> component.
        </Text>
        <DSExampleArea style={tw`bg-gray-900/50 items-center`} vertical center>
          <Box>
            <ModalHeader>Delete Workspace ?</ModalHeader>
            <Text variant="small">
              Are you sure you want to delete the workspace{" "}
              <Text variant="small" bold>
                “Paula's Workspace”
              </Text>
              with all its pages and folders? You can't undo this action.
            </Text>
            <ModalButtonFooter
              cancel={<Button variant="secondary">Keep workspace</Button>}
              confirm={<Button variant="primary">Delete</Button>}
            />
          </Box>
        </DSExampleArea>
        <Heading lvl={3}>Trigger</Heading>
        <Text variant="small">
          Our Modals are commonly triggered by{" "}
          <DSMono variant="component">Buttons</DSMono> ,{" "}
          <DSMono variant="component">IconButtons</DSMono> and{" "}
          <DSMono variant="component">Menu</DSMono> actions.
        </Text>
        <DSExampleArea>
          <IconButton
            onPress={() => {
              setShowModal(true);
            }}
            size="medium"
            label="New workspace"
            name="plus"
            style={tw`bold`}
          />
          <Modal
            isVisible={showModal}
            onBackdropPress={() => setShowModal(false)}
          >
            <ModalHeader>Create a workspace</ModalHeader>
            <LabeledInput
              label={"Workspace Name"}
              value="Surf &amp; Chill Co."
              hint="This is the name of your organization, team or private notes. You can invite team members afterwards."
            />
            <ModalButtonFooter
              cancel={
                <Button variant="secondary" onPress={() => setShowModal(false)}>
                  Cancel
                </Button>
              }
              confirm={<Button variant="primary">Create Workspace</Button>}
            />
          </Modal>
        </DSExampleArea>

        {/* ---------------------------------- insert here ------------------------------------------------ */}

        <Heading lvl={1}>SidebarButton</Heading>
        <SidebarButton>
          <Text variant="small">Hallo</Text>
        </SidebarButton>
        <SidebarButton disabled>
          <Text variant="small">Hallo</Text>
        </SidebarButton>

        <Heading lvl={1}>SidebarLink</Heading>
        <SidebarLink to={{ screen: "EncryptDecryptImageTest" }}>
          <WorkspaceAvatar />
          <Text>Encrypt / Decrypt Image</Text>
        </SidebarLink>

        <Heading lvl={1}>Spinner</Heading>
        <VStack space={3}>
          <Spinner />
          <Spinner size="lg" />
          <Spinner fadeIn size="lg" />
        </VStack>

        <Heading lvl={1}>Text</Heading>
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

        <Heading lvl={1}>Toast</Heading>
        <Button
          onPress={() => {
            counter = counter + 1;
            showToast(`This is a message ${counter}`);
          }}
        >
          Add Toast
        </Button>

        <Heading lvl={1}>Tooltip</Heading>
        <HStack>
          <Tooltip label="This is a tip!" placement="right">
            <IconButton name="file-add-line" color="gray-500" large />
          </Tooltip>
        </HStack>
      </View>
    </ScrollSafeAreaView>
  );
}
