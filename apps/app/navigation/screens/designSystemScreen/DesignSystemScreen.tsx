import {
  Avatar,
  AvatarGroup,
  Box,
  BoxShadow,
  BoxShadowLevels,
  Button,
  CenterContent,
  Checkbox,
  colors,
  Description,
  DesignSystemExampleArea as DSExampleArea,
  DesignSystemHeading as Heading,
  DesignSystemMono as DSMono,
  EditorBottombarButton,
  EditorBottombarDivider,
  EditorSidebarIcon,
  Heading as UIHeading,
  Icon,
  IconButton,
  InfoMessage,
  Input,
  Link,
  LinkExternal,
  Menu,
  MenuButton,
  MenuLink,
  Modal,
  ModalButtonFooter,
  ModalHeader,
  Mono,
  RawInput,
  ScrollSafeAreaView,
  Shortcut,
  SidebarButton,
  SidebarDivider,
  SidebarIconLeft,
  SidebarLink,
  SidebarText,
  Spinner,
  Text,
  TextArea,
  Tooltip,
  tw,
  View,
  WorkspaceAvatar,
} from "@serenity-tools/ui";
import { HStack, VStack } from "native-base";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { showToast } from "../../../utils/toast/showToast";
import * as Clipboard from "expo-clipboard";

let counter = 0;

export default function DesignSystemScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing
  const [showModal, setShowModal] = useState(false);
  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const [isClipboardNoticeActive, setIsClipboardNoticeActive] = useState(false);
  const [pageShareLink, setPageShareLink] = useState<string>("");
  const elevationLevels: BoxShadowLevels[] = [0, 1, 2, 3];
  const collaborationColors = Object.keys(colors.collaboration) as any;

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

  const copyTextAreaText = async () => {
    if (!pageShareLink) {
      return;
    }
    await Clipboard.setStringAsync(pageShareLink);
    setIsClipboardNoticeActive(true);
    setTimeout(() => {
      setIsClipboardNoticeActive(false);
    }, 1000);
  };

  // fakes filling elements into container to hinder the last wrapping children to grow and center themselves
  const TilesFiller = (props) => {
    return (
      <>
        <View style={tw`flex-auto w-30 h-0`} />
        <View style={tw`flex-auto w-30 h-0`} />
        <View style={tw`flex-auto w-30 h-0`} />
        <View style={tw`flex-auto w-30 h-0`} />
        <View style={tw`flex-auto w-30 h-0`} />
        <View style={tw`flex-auto w-30 h-0`} />
      </>
    );
  };

  const DSTiles = (props) => {
    return (
      <HStack {...props} flexWrap={"wrap"}>
        {props.children}
        <TilesFiller />
      </HStack>
    );
  };

  const DSMarker = (props) => {
    return (
      <View
        {...props}
        style={tw`-my-1.5 -mx-2 py-1.5 px-2 border border-dashed border-gray-200`}
      >
        {props.children}
      </View>
    );
  };

  // DesignSystemScreen specific
  const h4Styles = tw`mt-8 -mb-4`;

  return (
    <ScrollSafeAreaView>
      <View style={tw`w-full max-w-4xl mx-auto px-4 pt-2 pb-12`}>
        <Heading lvl={1}>Avatar</Heading>
        <Text>
          An{" "}
          <DSMono variant={"component"} size="md">
            Avatar
          </DSMono>{" "}
          component represents an object or entity.
        </Text>
        <Heading lvl={4} style={h4Styles}>
          Properties
        </Heading>
        <Heading lvl={3}>Sizes</Heading>
        <Text variant="sm">
          With the <DSMono variant="property">size</DSMono> property you can use
          the Avatar in 7 different sizes: <DSMono variant={"type"}>xxs</DSMono>{" "}
          , <DSMono variant={"type"}>xs</DSMono> ,{" "}
          <DSMono variant={"type"}>sm</DSMono> ,{" "}
          <DSMono variant={"type"}>md</DSMono> ,{" "}
          <DSMono variant={"type"}>lg</DSMono> ,{" "}
          <DSMono variant={"type"}>xl</DSMono> , or{" "}
          <DSMono variant={"type"}>2xl</DSMono> .
        </Text>
        <Text variant="sm" style={tw`mt-1`}>
          The initials will size automatically.
        </Text>
        <DSExampleArea>
          <HStack space={2} alignItems="center" style={tw`pr-2`}>
            <Avatar size={"xxs"}>BE</Avatar>
            <Avatar size={"xs"}>BE</Avatar>
            <Avatar size={"sm"}>NG</Avatar>
            <Avatar size={"md"}>AB</Avatar>
            <Avatar size={"lg"}>SK</Avatar>
            <Avatar size={"xl"}>AD</Avatar>
            <Avatar size={"2xl"}>HG</Avatar>
          </HStack>
        </DSExampleArea>
        <Heading lvl={3}>Styling</Heading>
        <Text variant="sm">
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
        <Text variant="sm">
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
        <Text variant="sm">
          The <DSMono variant="component">WorkspaceAvatar</DSMono> should be
          used for all workspace related representation.
        </Text>
        <Heading lvl={3}>Sizes</Heading>
        <Text variant="sm">
          We use three <DSMono variant="property">size</DSMono>s for now, for
          the active Workspace inside the{" "}
          <DSMono variant="context">Sidebar</DSMono>s we use{" "}
          <DSMono variant="type">xs</DSMono> for desktop and{" "}
          <DSMono variant="type">sm</DSMono> for mobile, and{" "}
          <DSMono variant="type">xxs</DSMono> for selects in Menus.
        </Text>
        <DSExampleArea>
          <WorkspaceAvatar size={"xxs"} />
          <WorkspaceAvatar size={"xs"} />
          <WorkspaceAvatar size={"sm"} />
        </DSExampleArea>
        <Heading lvl={3}>Styling</Heading>
        <Text variant="sm">
          Set one of the many coloring options with the{" "}
          <DSMono variant="property">customColor</DSMono> property.
        </Text>
        <DSExampleArea>
          {collaborationColors.map((color) => {
            return <WorkspaceAvatar key={color} customColor={color} />;
          })}
        </DSExampleArea>

        <Heading lvl={1}>BoxShadow</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="md">
            BoxShadow
          </DSMono>{" "}
          component can be used to establish a hierarchy between other content.
          It controls the size of the shadow applied to the surface.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          You can raise a component up to three levels by using the{" "}
          <DSMono variant="property">elevation</DSMono> property.
        </Text>
        <DSExampleArea>
          <HStack space={4} style={tw`pr-2`}>
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
          <DSMono variant={"component"} size="md">
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
        <Text variant="sm">
          Use the <DSMono variant="property">variant</DSMono> property to
          display either a <DSMono variant={"type"}>primary</DSMono>,{" "}
          <DSMono variant={"type"}>secondary</DSMono>, or{" "}
          <DSMono variant={"type"}>danger</DSMono> Button.
        </Text>
        <DSExampleArea>
          <Button>Login</Button>
          <Button variant="secondary">Login</Button>
        </DSExampleArea>
        <Heading lvl={3}>Sizes</Heading>
        <Text variant="sm">
          For larger or smaller Buttons, use the{" "}
          <DSMono variant="property">size</DSMono> property. You can set it to{" "}
          <DSMono variant={"type"}>sm</DSMono> ,{" "}
          <DSMono variant={"type"}>md</DSMono> , or{" "}
          <DSMono variant={"type"}>lg</DSMono> .
        </Text>
        <DSExampleArea>
          <Button size="sm">Login</Button>
          <Button size="md">Login</Button>
          <Button size="lg">Login</Button>
        </DSExampleArea>
        <Heading lvl={3}>Loading State</Heading>
        <Text variant="sm">
          Buttons also support an <DSMono variant="property">isLoading</DSMono>{" "}
          property, which shows a loading indicator, while disabling the button,
          as well.
        </Text>
        <DSExampleArea>
          <Button size="sm" isLoading>
            Login
          </Button>
          <Button size="md" isLoading>
            Login
          </Button>
          <Button size="lg" isLoading>
            Login
          </Button>
        </DSExampleArea>
        <Heading lvl={4} style={h4Styles}>
          Basic usage
        </Heading>
        <Heading lvl={3}>Primary Button</Heading>
        <Text variant="sm">
          Primary Buttons are high-emphasis, they contain actions that are
          important to our app.
        </Text>
        <DSExampleArea>
          <Button>Login</Button>
          <Button disabled>Login</Button>
          <Button isLoading>Login</Button>
        </DSExampleArea>
        <Heading lvl={3}>Secondary Button</Heading>
        <Text variant="sm">
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
        <Heading lvl={3}>Danger Button</Heading>
        <Text variant="sm">
          Danger Buttons are typically used for actions which are irreversible
          like deleting an element.
        </Text>
        <DSExampleArea>
          <Button variant={"danger"}>Delete</Button>
          <Button variant={"danger"} disabled>
            Delete
          </Button>
          <Button variant={"danger"} isLoading>
            Delete
          </Button>
        </DSExampleArea>
        <Heading lvl={4} style={h4Styles}>
          Related components
        </Heading>
        <Heading lvl={2}>IconButton</Heading>
        <Text variant="sm">
          The <DSMono variant="component">IconButtons</DSMono> are commonly
          found in the <DSMono variant="context">PageHeader</DSMono> and it's
          siblings, as well as in the <DSMono variant="context">Sidebar</DSMono>
          .
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
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
        <Text variant="sm">
          The <DSMono variant="component">IconButton</DSMono> comes in two sizes
          which for now only affects the clickable/hovered area.
        </Text>
        <Text variant="sm">
          The default is regular, to make it a bit bigger use the{" "}
          <DSMono variant="property">lg</DSMono> property.
        </Text>
        <DSExampleArea>
          <IconButton name="double-arrow-left" color="gray-800" />
          <IconButton name="double-arrow-right" color="gray-800" />
          <IconButton name="double-arrow-left" color="gray-800" size="lg" />
          <IconButton name="double-arrow-right" color="gray-800" size="lg" />
        </DSExampleArea>
        <Heading lvl={3}>Styling</Heading>
        <Text variant="sm">
          As with <DSMono variant="component">Icons</DSMono> you can use the{" "}
          <DSMono variant="property">color</DSMono> property to style it, but
          for now we only support <DSMono variant="type">gray-400</DSMono> to{" "}
          <DSMono variant="type">gray-800</DSMono>.
        </Text>
        <DSExampleArea>
          <IconButton name="menu" color="gray-400" size="lg" />
          <IconButton name="image-line" color="gray-500" size="lg" />
          <IconButton name="settings-4-line" color="gray-600" size="lg" />
          <IconButton name="double-arrow-left" color="gray-700" size="lg" />
          <IconButton name="double-arrow-right" color="gray-800" size="lg" />
        </DSExampleArea>
        <Text variant="sm" style={tw`pt-4`}>
          By adding the <DSMono variant="property">transparent</DSMono> property
          the background-color for hovering and pressing will derive itself from
          the set <DSMono variant="property">color</DSMono> which should be used
          for special cases only.
        </Text>
        <DSExampleArea>
          <IconButton name="menu" color="primary-400" size="lg" transparent />
          <IconButton
            name="image-line"
            color="primary-500"
            size="lg"
            transparent
          />
          <IconButton
            name="settings-4-line"
            color="primary-600"
            size="lg"
            transparent
          />
          <IconButton
            name="double-arrow-left"
            color="primary-700"
            size="lg"
            transparent
          />
        </DSExampleArea>
        <Heading lvl={3}>Label</Heading>
        <Text variant="sm">
          An <DSMono variant="component">IconButton</DSMono> can have a{" "}
          <DSMono variant="property">label</DSMono> to make it more explicit and
          fitting in context's like the{" "}
          <DSMono variant="component">Menu</DSMono> .
        </Text>
        <DSExampleArea>
          <IconButton name="plus" size="lg" label="New workspace" />
        </DSExampleArea>
        <Heading lvl={3}>Usage</Heading>
        <Text variant="sm">
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
                      color={"gray-600"}
                      mobileSize={5}
                      blub={"collaboration-orange"}
                    />
                  </View>
                  <View style={tw`-ml-0.5`}>
                    <Icon name="folder" size={5} mobileSize={8} />
                  </View>
                  <Text
                    variant="sm"
                    style={tw`ml-1.5 max-w-32`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Getting Started
                  </Text>
                </HStack>
                <HStack alignItems="center" space={2}>
                  <Icon name="more-line" color={"gray-600"}></Icon>
                  <Icon name="file-add-line" color={"gray-600"}></Icon>
                </HStack>
              </View>
            </SidebarButton>
            <SidebarButton>
              <View style={tw`w-full flex flex-row justify-between`}>
                <HStack alignItems={"center"}>
                  <View>
                    <Icon
                      name="arrow-right-filled"
                      color={"gray-600"}
                      mobileSize={5}
                    />
                  </View>
                  <View style={tw`-ml-0.5`}>
                    <Icon name="folder" size={5} mobileSize={8} />
                  </View>
                  <Text
                    variant="sm"
                    style={tw`ml-1.5 max-w-32`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Notes
                  </Text>
                </HStack>
                <HStack alignItems="center" space={2}>
                  <Icon name="more-line" color={"gray-600"}></Icon>
                  <Icon name="file-add-line" color={"gray-600"}></Icon>
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
          <DSMono variant="component" size="md">
            CenterContent
          </DSMono>{" "}
          component you can easily center a child element vertically and
          horizontally within the available space.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
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
        <Text variant="sm">
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
              <Text muted variant="sm">
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
          <DSMono variant="component" size="md">
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
        <Text variant="sm">
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
            <Text variant="sm">
              I accept our{" "}
              <Link to={{ screen: "EncryptDecryptImageTest" }}>
                Encrypt / Decrypt Image
              </Link>{" "}
              test
            </Text>
          </Checkbox>
        </DSExampleArea>

        <Heading lvl={1}>Descriptions</Heading>
        <Text>
          A{" "}
          <DSMono variant={"component"} size="md">
            Description
          </DSMono>{" "}
          component adds further information to a form or modal.
        </Text>

        <Heading lvl={3}>Variants</Heading>
        <Text variant="sm">
          Depending on the use-case the{" "}
          <DSMono variant="property">variant</DSMono> property is set to either:{" "}
          <DSMono variant={"type"}>login</DSMono> ,{" "}
          <DSMono variant={"type"}>modal</DSMono> , or{" "}
          <DSMono variant={"type"}>form</DSMono> , which differ in size and
          color.
        </Text>

        <DSExampleArea
          style={tw`mb-4 py-12 bg-primary-900 items-center`}
          vertical
          center
          label={"login"}
        >
          <Box plush>
            <View style={tw`text-center`}>
              <UIHeading lvl={1} padded center>
                Create your Account
              </UIHeading>
              <DSMarker>
                <Description variant={"login"}>
                  Type in your email and choose a password.
                  {"\n"}
                  No credit card required.
                </Description>
              </DSMarker>
            </View>
            <Input
              label={"Email"}
              keyboardType="email-address"
              placeholder="Enter your email …"
              autoCapitalize="none"
            />
            <Input
              label={"Password"}
              secureTextEntry
              placeholder="Enter your password …"
            />
            <Checkbox
              value={"hasAcceptedTerms"}
              accessibilityLabel="This is the terms and condition checkbox"
            >
              <Text variant="xs" muted>
                Yes, I do agree to Serenity's{" "}
                <LinkExternal
                  variant="xs"
                  href="https://www.serenity.re/en/notes/terms-of-service"
                >
                  terms of services
                </LinkExternal>{" "}
                and{" "}
                <LinkExternal
                  variant="xs"
                  href="https://www.serenity.re/en/notes/privacy-policy"
                >
                  privacy policy
                </LinkExternal>
                .
              </Text>
            </Checkbox>
            <Button style={tw`w-full`}>Register</Button>
          </Box>
        </DSExampleArea>

        <DSExampleArea
          style={tw`mb-4 py-12 bg-gray-900/30 items-center`}
          vertical
          center
          label={"modal"}
        >
          <Box>
            <ModalHeader>Delete workspace ?</ModalHeader>
            <DSMarker>
              <Description variant="modal">
                Are you sure you want to delete the workspace “Paula's
                Workspace” with all its pages and folders? You can't undo this
                action.
              </Description>
            </DSMarker>
            <ModalButtonFooter
              cancel={<Button variant="secondary">Keep</Button>}
              confirm={<Button variant="danger">Delete workspace</Button>}
            />
          </Box>
        </DSExampleArea>

        <DSExampleArea
          style={tw`py-12 bg-gray-900/30 items-center`}
          vertical
          center
          label={"form"}
        >
          <BoxShadow elevation={1} rounded>
            <View style={tw`bg-white rounded overflow-hidden`}>
              <HStack>
                <VStack
                  style={tw`w-sidebar py-4 border border-gray-200 bg-gray-100`}
                >
                  <UIHeading lvl={4} style={tw`px-4`} padded>
                    Account Settings
                  </UIHeading>
                  <SidebarLink
                    to={{ screen: "EncryptDecryptImageTest" }}
                    iconName="user-line"
                  >
                    Profile
                  </SidebarLink>
                  <SidebarLink
                    to={{ screen: "EncryptDecryptImageTest" }}
                    iconName="device-line"
                  >
                    Devices
                  </SidebarLink>
                  <SidebarDivider style={tw`my-2`} />
                  <SidebarLink
                    to={{ screen: "EncryptDecryptImageTest" }}
                    iconName="history-line"
                  >
                    Workspace Settings
                  </SidebarLink>
                </VStack>
                <View>
                  <View style={tw`py-4.5 px-10 border-b border-gray-200`}>
                    <UIHeading lvl={2}>Devices</UIHeading>
                  </View>
                  <View style={tw`pt-8 pb-5 px-10`}>
                    <UIHeading lvl={3} padded>
                      Manage Devices
                    </UIHeading>
                    <DSMarker>
                      <Description variant={"form"}>
                        The following list shows all the devices which are
                        currently linked to your account.
                      </Description>
                    </DSMarker>
                    <Text style={tw`mt-5`}>...</Text>
                  </View>
                </View>
              </HStack>
            </View>
          </BoxShadow>
        </DSExampleArea>
        <Text style={tw`mt-4`} variant="xxs" muted>
          All variants shown in their context, marked with a dashed outline -
          documentation only - for reasons of clarity and comprehensibility.
        </Text>

        <Heading lvl={1}>EditorBottombar</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="md">
            EditorBottombar
          </DSMono>{" "}
          is used on small devices to show all of our Editors functionality,
          which are held in our <DSMono variant="context">EditorSidebar</DSMono>{" "}
          on larger screens.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
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
        <Text variant="sm">
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
        <Text variant="sm">
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
          <DSMono variant="component" size="md">
            EditorSidebar
          </DSMono>{" "}
          is used on large devices to show all of our Editors functionality.
        </Text>
        <Text>
          For smaller devices we use the{" "}
          <DSMono variant="context">EditorBottombar</DSMono>.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
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
        <Text variant="sm">
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
        <Text variant="sm">
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
              <Text variant="sm">Bold</Text>
            </SidebarButton>
            <SidebarButton>
              <EditorSidebarIcon name="italic" />
              <Text variant="sm">Italic</Text>
            </SidebarButton>
            <SidebarButton>
              <EditorSidebarIcon name="code-view" isActive />
              <Text variant="sm" bold>
                Code
              </Text>
            </SidebarButton>
          </VStack>
        </DSExampleArea>
        <Heading lvl={3}>Divider</Heading>
        <Text variant="sm">
          To section the different functionalities you can use the generic{" "}
          <DSMono variant="component">SidebarDivider</DSMono>.
        </Text>
        <DSExampleArea>
          <VStack style={tw`w-sidebar py-4 border border-gray-200 bg-gray-100`}>
            <SidebarButton>
              <EditorSidebarIcon name="code-s-slash-line" isActive />
              <Text variant="sm" bold>
                Codeblock
              </Text>
            </SidebarButton>
            <SidebarDivider></SidebarDivider>
            <SidebarButton>
              <EditorSidebarIcon name="list-unordered" />
              <Text variant="sm">Bullet-List</Text>
            </SidebarButton>
            <SidebarButton>
              <EditorSidebarIcon name="list-ordered" />
              <Text variant="sm">Numbered-List</Text>
            </SidebarButton>
          </VStack>
        </DSExampleArea>

        <Heading lvl={1}>Headings</Heading>
        <Text>
          <DSMono variant={"component"} size="md">
            Headings
          </DSMono>{" "}
          are used as titles for pages, context, form-sections and lists.
        </Text>
        <Heading lvl={3}>Levels</Heading>
        <Text variant="sm">
          For now we use levels <DSMono variant={"type"}>1</DSMono> to{" "}
          <DSMono variant={"type"}>4</DSMono> set via the
          <DSMono variant="property">lvl</DSMono> property.
        </Text>
        <DSExampleArea vertical>
          <UIHeading lvl={1}>Create your Account</UIHeading>
          <UIHeading lvl={2}>Devices</UIHeading>
          <UIHeading lvl={3}>Manage Devices</UIHeading>
          <UIHeading lvl={4}>Folders</UIHeading>
          <UIHeading lvl={4} accessibilityOnly>
            Folders
          </UIHeading>
        </DSExampleArea>
        <Heading lvl={3}>Spacing</Heading>
        <Text variant="sm">
          Depending on the useage you might want to add a little space between
          the Heading and the following element.{"\n"}If the following element
          is any variation of a <DSMono variant={"component"}>Text</DSMono>{" "}
          component - Text, Description, e.g. - use the{" "}
          <DSMono variant={"property"}>padded</DSMono> property to set a bottom
          margin and keep the applications look &amp; feel nice and consistent.
        </Text>
        <DSExampleArea vertical>
          <View>
            <UIHeading lvl={1} padded>
              Create your Account
            </UIHeading>
            <Description variant="login">
              Type in your email and choose a password.
              {"\n"}
              No credit card required.
            </Description>
          </View>
          <View>
            <UIHeading lvl={2} padded>
              Profile
            </UIHeading>
            <Text variant="sm">
              We do not have a use-case for this with lvl-2 but that's what it
              could look like.
            </Text>
          </View>
          <View>
            <UIHeading lvl={3} padded>
              Manage Devices
            </UIHeading>
            <Description variant={"form"}>
              The following list shows all the devices which are currently
              linked to your account.
            </Description>
          </View>
          <View>
            <VStack
              style={tw`w-sidebar py-4 border border-gray-200 bg-gray-100`}
            >
              <UIHeading lvl={4} style={tw`px-4`} padded>
                Formats
              </UIHeading>
              <SidebarButton>
                <EditorSidebarIcon name="bold" />
                <Text variant="sm">Bold</Text>
              </SidebarButton>
              <SidebarButton>
                <EditorSidebarIcon name="italic" />
                <Text variant="sm">Italic</Text>
              </SidebarButton>
              <SidebarButton>
                <EditorSidebarIcon name="code-view" isActive />
                <Text variant="sm" bold>
                  Code
                </Text>
              </SidebarButton>
            </VStack>
          </View>
        </DSExampleArea>
        <Heading lvl={3}>Accessibility</Heading>
        <Text variant="sm">
          To enhance the accessibility of our application, A{" "}
          <DSMono variant="component">Heading</DSMono> can also be added hidden
          by setting the <DSMono variant={"property"}>accessibilityOnly</DSMono>{" "}
          property. With this we can ensure neatly structured guides even if we
          don't need them as a visual aid.
        </Text>

        <Heading lvl={1}>Icons</Heading>
        <Text>
          We mostly use{" "}
          <DSMono variant="component" size="md">
            Icons
          </DSMono>{" "}
          from{" "}
          <LinkExternal
            variant="md"
            href="https://remixicon.com/"
            style={tw`text-gray-700`}
          >
            remixicon
          </LinkExternal>{" "}
          but some are even more fancy and custom made by our lovely Designer,
          so have a look at{" "}
          <LinkExternal
            variant="md"
            href="https://www.figma.com/"
            style={tw`text-gray-700`}
          >
            Figma
          </LinkExternal>{" "}
          to see what she is up to ;-&#41;
        </Text>
        <Heading lvl={3}>Sizes</Heading>
        <Text variant="sm">
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
        <Text variant="sm">
          Icons don't have a style property, but you can still dye them with the{" "}
          <DSMono variant="property">color</DSMono> property.
        </Text>
        <Text variant="sm" style={tw`mt-4`}>
          You can use all of our custom colors defined for the application by
          typing the name and if necessary the hue value:{" "}
          <DSMono variant="type">collaboration-honey</DSMono>,
          <DSMono variant="type">white</DSMono> , or{" "}
          <DSMono variant="type">gray-500</DSMono> for example.
        </Text>
        <DSExampleArea>
          <Icon name="list-check-2" size={8} color={"primary-200"} />
          <Icon name="list-check-2" size={8} color={"primary-300"} />
          <Icon name="list-check-2" size={8} color={"primary-400"} />
          <Icon name="list-check-2" size={8} color={"primary-500"} />
          <Icon name="list-check-2" size={8} color={"primary-600"} />
          <Icon name="list-check-2" size={8} color={"collaboration-purple"} />
          <Icon
            name="list-check-2"
            size={8}
            color={"collaboration-raspberry"}
          />
          <Icon name="list-check-2" size={8} color={"collaboration-orange"} />
          <Icon name="list-check-2" size={8} color={"collaboration-honey"} />
          <Icon name="list-check-2" size={8} color={"collaboration-emerald"} />
        </DSExampleArea>
        <Heading lvl={3}>Set</Heading>
        <Text variant="sm">
          Below is a list of all of the{" "}
          <DSMono variant="component">Icons</DSMono> in the library, along with
          the corresponding component names, divided in their most common
          usages:
        </Text>
        <DSExampleArea vertical center>
          <Heading lvl={3}>Commands</Heading>
          <DSTiles>
            <IconTile name="indent-decrease" />
            <IconTile name="indent-increase" />
          </DSTiles>
          <Heading lvl={3}>Marks</Heading>
          <DSTiles>
            <IconTile name="bold" />
            <IconTile name="code-view" />
            <IconTile name="italic" />
            <IconTile name="link" />
            <IconTile name="link-m" />
            <IconTile name="strikethrough" />
            <IconTile name="underline" />
          </DSTiles>
          <Heading lvl={3}>Nodes</Heading>
          <DSTiles>
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
            <IconTile name="list-check-2" />
            <IconTile name="list-check" />
            <IconTile name="list-ordered" />
            <IconTile name="list-unordered" />
            <IconTile name="paragraph" />
            <IconTile name="text" />
            <IconTile name="table-2" />
          </DSTiles>
          <Heading lvl={3}>Extension</Heading>
          <DSTiles>
            <IconTile name="font-color" />
          </DSTiles>
          <Heading lvl={3}>Editor custom</Heading>
          <DSTiles>
            <IconTile name="arrow-go-back-line" />
            <IconTile name="arrow-go-forward-line" />
            <IconTile name="arrow-up-down-s-line" />
            <IconTile name="attachment-2" />
            <IconTile name="font-size-2" />
            <IconTile name="format-clear" />
            <IconTile name="functions" />
            <IconTile name="hashtag" />
            <IconTile name="page-separator" />
            <IconTile name="separator" />
            <IconTile name="calendar-check-fill" />
            <IconTile name="image-2-line" />
            <IconTile name="image-line" />
            <IconTile name="movie-line" />
            <IconTile name="folder-music-line" />
            <IconTile name="emotion-line" />
          </DSTiles>
          <Heading lvl={3}>Navigation</Heading>
          <DSTiles>
            <IconTile name="double-arrow-left" />
            <IconTile name="double-arrow-right" />
            <IconTile name="arrow-right-s-line" />
            <IconTile name="arrow-down-s-line" />
            <IconTile name="arrow-up-down-line" />
            <IconTile name="more-line" />
            <IconTile name="more-2-fill" />
            <IconTile name="more-2-line" />
          </DSTiles>
          <Heading lvl={3}>Actions</Heading>
          <DSTiles>
            <IconTile name="check-line" />
            <IconTile name="close-circle-fill" />
            <IconTile name="add-line" />
            <IconTile name="settings-4-line" />
            <IconTile name="user-line" />
            <IconTile name="user-settings-line" />
            <IconTile name="group-line" />
            <IconTile name="computer-line" />
            <IconTile name="device-line" />
            <IconTile name="window-line" />
            <IconTile name="download-line" />
            <IconTile name="printer-line" />
            <IconTile name="search-line" />
            <IconTile name="share-line" />
            <IconTile name="share-box-line" />
            <IconTile name="stars-s-fill" />
            <IconTile name="delete-bin-line" />
            <IconTile name="history-line" />
            <IconTile name="cup-line" />
            <IconTile name="question-mark" />
            <IconTile name="file-copy-line" />
            <IconTile name="chat-1-line" />
            <IconTile name="chat-4-line" />
            <IconTile name="pencil-line" />
            <IconTile name="error-warning-line" />
          </DSTiles>
          <Heading lvl={3}>Page &amp; Folder</Heading>
          <DSTiles>
            <IconTile name="archive-line" />
            <IconTile name="archive-fill" />
            <IconTile name="file-transfer-line" />
            <IconTile name="file-search-line" />
            <IconTile name="book-open-line" />
            <IconTile name="folder-line" />
            <IconTile name="folder-fill" />
            <IconTile name="bookmark-line" />
            <IconTile name="bookmark-fill" />
            <IconTile name="file-line" />
            <IconTile name="file-add-line" />
            <IconTile name="file-add-fill" />
          </DSTiles>
          <Heading lvl={3}>Custom</Heading>
          <DSTiles>
            <IconTile name="plus" />
            <IconTile name="more" />
            <IconTile name="cursor" />
            <IconTile name="arrow-right-filled" />
            <IconTile name="arrow-down-filled" />
            <IconTile name="serenity-feather" />
          </DSTiles>
          <Heading lvl={3}>UI</Heading>
          <DSTiles>
            <IconTile name="command-line" />
            <IconTile name="external-link-line" />
            <IconTile name="information-line" />
          </DSTiles>
          <Heading lvl={3}>Sidebar</Heading>
          <DSTiles>
            <IconTile name="folder" />
            <IconTile name="page" />
          </DSTiles>
          <Heading lvl={3}>Rest</Heading>
          <DSTiles>
            {/* in use */}
            <IconTile name="warning-fill" />

            {/* really needed as we have others ?? */}
            <IconTile name="arrow-down-s-fill" />
            <IconTile name="arrow-go-back-fill" />
            <IconTile name="arrow-go-forward-fill" />
            <IconTile name="arrow-right" />
            <IconTile name="information-fill" />
          </DSTiles>
        </DSExampleArea>

        <Heading lvl={1}>Info Messages</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="md">
            InfoMessage
          </DSMono>{" "}
          component is used to show feedback to the user about an action or
          state.
        </Text>
        <Heading lvl={3}>Variants</Heading>
        <Text variant="sm">
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
        <Text variant="sm">
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
          <DSMono variant="component" size="md">
            Input
          </DSMono>{" "}
          lets users enter and edit text.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          The basic <DSMono variant="component">RawInput</DSMono> component is
          minimal in styling and features, as it is used as a building block for
          the actual <DSMono variant="component">Input</DSMono> component.
        </Text>
        <DSExampleArea>
          <RawInput />
        </DSExampleArea>
        <Heading lvl={4} style={h4Styles}>
          Commonly used
        </Heading>
        <Heading lvl={2}>Input</Heading>
        <Text variant="sm">
          <DSMono variant="component">Input</DSMono>s share all the{" "}
          <DSMono variant="component">RawInputProps</DSMono> and are used in all
          the forms of our application. You can easily add a{" "}
          <DSMono variant="property">label</DSMono> via property.
        </Text>
        <DSExampleArea vertical>
          <Input
            label={"Email"}
            value="jane@example.com"
            keyboardType="email-address"
            placeholder="Enter your email …"
            autoCapitalize="none"
          />
          <Input
            label={"Password"}
            secureTextEntry
            placeholder="Enter your password …"
          />
          <Input
            label={"Verification Key"}
            value="70909qer798q7987q"
            isDisabled
          />
        </DSExampleArea>
        <Heading lvl={3}>Helper Text</Heading>
        <Text variant="sm">
          The <DSMono variant="property">helperText</DSMono> can be used to show
          additional help when the user is focused on the input, which is
          especially helpful for errors.
        </Text>
        <DSExampleArea vertical>
          <Input
            label={"Email"}
            value="jane@example.com"
            keyboardType="email-address"
            placeholder="Enter your email …"
            autoCapitalize="none"
            helperText="helper Text"
          />
          <Input
            label={"Password"}
            secureTextEntry
            value="foo"
            placeholder="Enter your password …"
            helperText="min 8 characters"
            isInvalid
          />
        </DSExampleArea>
        <Heading lvl={3}>Hints</Heading>
        <Text variant="sm">
          You can use a <DSMono variant="property">hint</DSMono> to add
          information you want the user to have regarding this input.
        </Text>
        <DSExampleArea vertical>
          <Input
            label={"Password"}
            secureTextEntry
            value="password1234"
            placeholder="Enter your password …"
          />
          <Input
            label={"Verification Key"}
            value="70909qer798q7987q"
            isDisabled
            hint="We have already prefilled this field with your key."
          />
        </DSExampleArea>

        <Heading lvl={1}>Link</Heading>
        <Text>
          The{" "}
          <DSMono variant={"component"} size={"md"}>
            Link
          </DSMono>{" "}
          is an accessible element for navigation inside the application.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          The component adjusts to the{" "}
          <DSMono variant="property">variant</DSMono> of the parenting{" "}
          <DSMono variant="component">Text</DSMono> component in{" "}
          <DSMono variant="type">size</DSMono> and{" "}
          <DSMono variant="type">font-family</DSMono> as well as when said
          parent is set to <DSMono variant="property">bold</DSMono>.
        </Text>
        <Text variant="sm" style={tw`mt-2`}>
          Notice though the color stays the same no matter if the parent{" "}
          <DSMono variant="component">Text</DSMono> is set to be{" "}
          <DSMono variant="property">muted</DSMono> or the color is changed, to
          ensure a consistent and distinguishable look &amp; feel of all{" "}
          <DSMono variant={"component"}>Links</DSMono> in our application.
        </Text>
        <DSExampleArea vertical>
          <Text variant="sm">
            This is a link to{" "}
            <Link to={{ screen: "EncryptDecryptImageTest" }}>
              Encrypt / Decrypt Image
            </Link>
          </Text>
          <Text variant="sm" muted>
            This is a link to{" "}
            <Link to={{ screen: "EncryptDecryptImageTest" }}>
              Encrypt / Decrypt Image
            </Link>
          </Text>
          <Text variant="sm" bold>
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
        <Text variant="sm">
          The <DSMono variant={"component"}>LinkExternal</DSMono> component is
          used for links outside of our application.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
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
        <Text variant="sm">
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
          <Text variant="sm">
            For further info check out our{" "}
            <LinkExternal variant="sm" href="https://www.serenity.li" icon>
              knowledgebase
            </LinkExternal>
          </Text>
          <Text variant="md">
            For further info check out our{" "}
            <LinkExternal variant="md" href="https://www.serenity.li" icon>
              knowledgebase
            </LinkExternal>
          </Text>
          <Text variant="lg">
            For further info check out our{" "}
            <LinkExternal variant="lg" href="https://www.serenity.li" icon>
              knowledgebase
            </LinkExternal>
          </Text>
        </DSExampleArea>

        <Heading lvl={1}>Menu</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="md">
            Menu
          </DSMono>{" "}
          component shows a list of actions that a user can take.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          Elements as the <DSMono variant="component">MenuButton</DSMono>{" "}
          component represent the actions of the{" "}
          <DSMono variant="component">Menu</DSMono> .
        </Text>
        <DSExampleArea>
          <BoxShadow elevation={2} rounded>
            <VStack style={tw`py-1.5 bg-white rounded overflow-hidden`}>
              <MenuButton>Create folder</MenuButton>
              <MenuButton>Rename</MenuButton>
            </VStack>
          </BoxShadow>
        </DSExampleArea>
        <Heading lvl={3}>Divider</Heading>
        <Text variant="sm">
          To section the different functionalities you can use the{" "}
          <DSMono variant="component">SidebarDivider</DSMono> with added{" "}
          <DSMono variant="property">collapsed</DSMono> property.
        </Text>
        <DSExampleArea>
          <BoxShadow elevation={2} rounded>
            <VStack style={tw`py-1.5 bg-white rounded overflow-hidden`}>
              <MenuButton>Create folder</MenuButton>
              <MenuButton>Rename</MenuButton>
              <SidebarDivider collapsed />
              <MenuButton>Delete</MenuButton>
            </VStack>
          </BoxShadow>
        </DSExampleArea>
        <Heading lvl={3}>Icons</Heading>
        <Text variant="sm">
          Usually all <DSMono variant="component">MenuButton</DSMono>s should
          have set an <DSMono variant="property">icon</DSMono> to make it easier
          for the user to understand and learn the common actions of the
          application.
        </Text>
        <Text variant="sm" style={tw`mt-2`}>
          Add the optional property <DSMono variant="property">danger</DSMono>{" "}
          to show the user irreversible actions.
        </Text>
        <DSExampleArea>
          <BoxShadow elevation={2} rounded>
            <VStack style={tw`w-50 py-1.5 bg-white rounded overflow-hidden`}>
              <MenuButton iconName="folder-line">Create folder</MenuButton>
              <MenuButton iconName="font-size-2">Rename</MenuButton>
              <SidebarDivider collapsed />
              <MenuButton iconName="delete-bin-line" danger>
                Delete
              </MenuButton>
            </VStack>
          </BoxShadow>
        </DSExampleArea>
        <Heading lvl={3}>Trigger</Heading>
        <Text variant="sm">
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
              iconName="folder-line"
            >
              Create folder
            </MenuButton>
            <MenuButton
              onPress={() => {
                setIsOpenPopover(false);
              }}
              iconName="font-size-2"
            >
              Rename
            </MenuButton>
            <SidebarDivider collapsed />
            <MenuButton
              onPress={() => {
                setIsOpenPopover(false);
              }}
              iconName="delete-bin-line"
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
        <Text variant="sm">
          To add keyboard shortcuts to one of your actions just add a{" "}
          <DSMono variant="component">Shortcut</DSMono> component via{" "}
          <DSMono variant="property">shortcut</DSMono> .
        </Text>
        <Text variant="sm" style={tw`mt-2 text-left`}>
          To avoid accidents don't put a shortcut on a{" "}
          <DSMono variant="context">dangerous</DSMono> action.
        </Text>
        <DSExampleArea>
          <BoxShadow elevation={2} rounded>
            <VStack style={tw`w-50 py-1.5 bg-white rounded overflow-hidden`}>
              <MenuButton
                iconName="folder-line"
                shortcut={<Shortcut letter="N" />}
              >
                Create folder
              </MenuButton>
              <MenuButton
                iconName="font-size-2"
                shortcut={<Shortcut letter="R" />}
              >
                Rename
              </MenuButton>
              <SidebarDivider collapsed />
              <MenuButton iconName="delete-bin-line" danger>
                Delete
              </MenuButton>
            </VStack>
          </BoxShadow>
        </DSExampleArea>
        <Heading lvl={3}>Links and more</Heading>
        <Text variant={"sm"}>
          Besides the <DSMono variant="component">MenuButton</DSMono> you can
          also use a <DSMono variant="component">MenuLink</DSMono> as one of the
          Menu-actions. Just be sure to give it a{" "}
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

              <MenuLink
                to={{ screen: "EncryptDecryptImageTest" }}
                icon={<WorkspaceAvatar customColor="emerald" size={"xxs"} />}
              >
                Notes
              </MenuLink>
              <MenuLink
                to={{ screen: "Login" }}
                icon={<WorkspaceAvatar customColor="honey" size={"xxs"} />}
              >
                Project X
              </MenuLink>
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
          The{" "}
          <DSMono variant="component" size="md">
            Modal
          </DSMono>{" "}
          is a Dialog on top of an overlay used to show content that requires
          user interaction.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          As the <DSMono variant="component">Modal</DSMono> is used for explicit
          user interaction it is necessary to provide at least one Button. To
          ensure consistent user experience they should be added as children of
          the
          <DSMono variant="component">ModalButtonFooter</DSMono> component.
        </Text>
        <Text variant="sm" style={tw`mt-2`}>
          This component requires to be passed a{" "}
          <DSMono variant="component">Button</DSMono> via the Footers{" "}
          <DSMono variant="property">confirm</DSMono> property. To add a{" "}
          <DSMono variant="property">cancel</DSMono> action pass a Button to the
          Footers <DSMono variant="property">confirm</DSMono> property.
        </Text>
        <DSExampleArea
          style={tw`py-12 bg-gray-900/30 items-center`}
          vertical
          center
        >
          <Box>
            <Text variant="sm">
              Something has happened and I just wanted to let you know
              explicitly and not just by a Toast.
            </Text>
            <ModalButtonFooter
              confirm={<Button variant="primary">Confirm</Button>}
            />
          </Box>
        </DSExampleArea>
        <Heading lvl={3}>Header</Heading>
        <Text variant="sm">
          A <DSMono variant="component">Modal</DSMono> doesn't require a header,{" "}
          but can be added by using the{" "}
          <DSMono variant="component">ModalHeader</DSMono> component.
        </Text>
        <DSExampleArea
          style={tw`py-12 bg-gray-900/30 items-center`}
          vertical
          center
        >
          <Box>
            <ModalHeader>Delete workspace ?</ModalHeader>
            <Text variant="sm">
              Are you sure you want to delete the workspace{" "}
              <Text variant="sm" bold>
                “Paula's Workspace”
              </Text>
              with all its pages and folders? You can't undo this action.
            </Text>
            <ModalButtonFooter
              cancel={<Button variant="secondary">Keep</Button>}
              confirm={<Button variant="danger">Delete workspace</Button>}
            />
          </Box>
        </DSExampleArea>
        <Heading lvl={3}>Trigger</Heading>
        <Text variant="sm">
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
            label="New workspace"
            name="plus"
          />
          <Modal
            isVisible={showModal}
            onBackdropPress={() => setShowModal(false)}
          >
            <ModalHeader>Create a workspace</ModalHeader>
            <Input
              label={"Workspace name"}
              value="Surf &amp; Chill Co."
              hint="This is the name of your organization, team or private notes. You can invite team members afterwards."
            />
            <ModalButtonFooter
              cancel={
                <Button variant="secondary" onPress={() => setShowModal(false)}>
                  Cancel
                </Button>
              }
              confirm={<Button variant="primary">Create workspace</Button>}
            />
          </Modal>
        </DSExampleArea>

        <Heading lvl={1}>Sidebar</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="md">
            Sidebar
          </DSMono>{" "}
          is the applications navigational element. It is always present on{" "}
          <DSMono variant="base">desktop</DSMono> and accessible via an upper
          left IconButton on smaller devices.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          You can either use <DSMono variant="component">SidebarButton</DSMono>s
          to trigger actions or <DSMono variant="component">SidebarLink</DSMono>
          s to provide access to destinations in our app.
        </Text>
        <DSExampleArea>
          <VStack style={tw`w-sidebar py-4 border border-gray-200 bg-gray-100`}>
            <SidebarButton>
              <SidebarIconLeft name="search-line" />
              <SidebarText>Search...</SidebarText>
            </SidebarButton>
            <SidebarLink
              to={{ screen: "EncryptDecryptImageTest" }}
              iconName="history-line"
            >
              Recently edited
            </SidebarLink>
            <SidebarLink
              to={{ screen: "EncryptDecryptImageTest" }}
              iconName="settings-4-line"
            >
              Settings
            </SidebarLink>
          </VStack>
        </DSExampleArea>
        <Heading lvl={3}>Divider</Heading>
        <Text variant="sm">
          To section the different elements you can use the{" "}
          <DSMono variant="component">SidebarDivider</DSMono>.
        </Text>
        <DSExampleArea>
          <VStack style={tw`w-sidebar py-4 border border-gray-200 bg-gray-100`}>
            <SidebarLink
              to={{ screen: "EncryptDecryptImageTest" }}
              iconName="history-line"
            >
              Recently edited
            </SidebarLink>
            <SidebarLink
              to={{ screen: "EncryptDecryptImageTest" }}
              iconName="settings-4-line"
            >
              Settings
            </SidebarLink>
            <SidebarDivider />
            <HStack
              justifyContent="space-between"
              alignItems="center"
              style={tw`ml-4 mr-5 mb-4 md:mr-2`}
            >
              <Text variant={"xxs"} bold>
                Folders
              </Text>
            </HStack>
            <SidebarButton>
              <View style={tw`w-full flex flex-row justify-between`}>
                <HStack alignItems={"center"}>
                  <View>
                    <Icon
                      name="arrow-right-filled"
                      color={"gray-600"}
                      mobileSize={5}
                    />
                  </View>
                  <View style={tw`-ml-0.5`}>
                    <Icon name="folder" size={5} mobileSize={8} />
                  </View>
                  <Text
                    variant="sm"
                    style={tw`ml-1.5 max-w-32`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Getting Started
                  </Text>
                </HStack>
                <HStack alignItems="center" space={2}>
                  <Icon name="more-line" color={"gray-600"}></Icon>
                  <Icon name="file-add-line" color={"gray-600"}></Icon>
                </HStack>
              </View>
            </SidebarButton>
          </VStack>
        </DSExampleArea>

        <Heading lvl={1}>Spinner</Heading>
        <Text>
          A{" "}
          <DSMono variant={"component"} size="md">
            Spinner
          </DSMono>{" "}
          provides a visual cue that an action is processing awaiting a course
          of change or a result.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          To enable a fading effect add the property{" "}
          <DSMono variant="property">fadeIn</DSMono> .
        </Text>
        <DSExampleArea>
          <Spinner fadeIn />
        </DSExampleArea>
        <Heading lvl={3}>Sizes</Heading>
        <Text variant="sm">
          With the <DSMono variant="property">size</DSMono> property you can
          display a Spinner in two different sizes:{" "}
          <DSMono variant={"type"}>sm</DSMono> or{" "}
          <DSMono variant={"type"}>lg</DSMono> .
        </Text>
        <DSExampleArea>
          <Spinner size="sm" />
          <Spinner size="lg" />
        </DSExampleArea>

        <Heading lvl={1}>Text</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="md">
            Text
          </DSMono>{" "}
          component makes it easy to apply a default set of font weights and
          sizes in our application.
        </Text>
        <Heading lvl={3}>Sizes</Heading>
        <Text variant="sm">
          Our typographic scale has a limited set of type sizes that work well
          together along with the layout grid.
        </Text>
        <Text variant="sm">
          To change the type use the <DSMono variant="property">variant</DSMono>{" "}
          property and choose one of the 5 types:{" "}
          <DSMono variant={"type"}>xxs</DSMono> ,{" "}
          <DSMono variant={"type"}>xs</DSMono> ,{" "}
          <DSMono variant={"type"}>sm</DSMono> ,{" "}
          <DSMono variant={"type"}>md</DSMono> , or{" "}
          <DSMono variant={"type"}>lg</DSMono> .
        </Text>
        <DSExampleArea vertical>
          <Text variant="xxs">the quick brown fox</Text>
          <Text variant="xs">the quick brown fox</Text>
          <Text variant="sm">the quick brown fox</Text>
          <Text>the quick brown fox</Text>
          <Text variant="lg">the quick brown fox</Text>
        </DSExampleArea>
        <Heading lvl={3}>Weight</Heading>
        <Text variant="sm">
          As we use different font-faces depending on the weight of the text,
          using the <DSMono variant="property">bold</DSMono> property is
          mandatory for heavier text.
        </Text>
        <DSExampleArea vertical>
          <Text bold variant="xxs">
            the quick brown fox
          </Text>
          <Text bold variant="xs">
            the quick brown fox
          </Text>
          <Text bold variant="sm">
            the quick brown fox
          </Text>
          <Text bold>the quick brown fox</Text>
          <Text bold variant="lg">
            the quick brown fox
          </Text>
        </DSExampleArea>
        <Heading lvl={3}>Emphasis</Heading>
        <Text variant="sm">
          The <DSMono variant="property">muted</DSMono> property is useful for
          phrases you need to see but are less important and therefore can be in
          the background.
        </Text>
        <DSExampleArea vertical>
          <Text muted variant="xxs">
            the quick brown fox
          </Text>
          <Text muted variant="xs">
            the quick brown fox
          </Text>
          <Text muted variant="sm">
            the quick brown fox
          </Text>
          <Text muted>the quick brown fox</Text>
          <Text muted variant="lg">
            the quick brown fox
          </Text>
        </DSExampleArea>

        <Heading lvl={1}>TextArea</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="md">
            TextArea
          </DSMono>{" "}
          component is used for system generated text which the user might use
          elsewhere.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          The basic{" "}
          <DSMono variant="component" size="md">
            TextArea
          </DSMono>{" "}
          is muted to show the user the Text inside is just an Info and not
          something they can interact with.
        </Text>
        <DSExampleArea>
          <TextArea>
            {
              'The share link will be generated here\nClick on "Create page link" to generate a new link'
            }
          </TextArea>
        </DSExampleArea>
        <Text variant="xxs" muted style={tw`mt-4`}>
          Note: as there are currently troubles with react native that prevent
          users to select text in the web version and even editing in Safari
          (desktop & iOS), all Text on web will be selectable until this issue
          is fixed
        </Text>
        <Heading lvl={3}>Select & Copy</Heading>
        <Text variant="sm">
          To allow the user to interact with the{" "}
          <DSMono variant="component" size="md">
            TextArea
          </DSMono>{" "}
          add the <DSMono variant="property">selectable</DSMono> property.
        </Text>
        <DSExampleArea>
          <TextArea selectable style={tw`max-w-150`}>
            {
              "http://serenity.re/share/b80d1184-04f7-4965-a4e4/078967c0-c829-4870-b64c-#key=_gpZeFjmIHZzhmJwDp2chGYRiaKB0DdzTacl_uFV9ZU"
            }
          </TextArea>
        </DSExampleArea>
        <Text variant="sm" style={tw`mt-2.5`}>
          To add even more functionality you can allow the user to copy the Text
          to the clipboard, by adding{" "}
          <DSMono variant="property">isClipboardNoticeActive</DSMono> and a{" "}
          <DSMono variant="property">onCopyPress</DSMono> .
        </Text>
        <DSExampleArea
          vertical
          style={tw`mb-4 py-12 bg-gray-900/30 items-center`}
          center
        >
          <Box style={tw`w-100`}>
            <UIHeading lvl={3}>Share a page</UIHeading>
            <TextArea
              selectable={pageShareLink !== ""}
              onCopyPress={copyTextAreaText}
              isClipboardNoticeActive={isClipboardNoticeActive}
            >
              {pageShareLink !== ""
                ? pageShareLink
                : 'The share link will be generated here\nClick on "Create page link" to generate a new link'}
            </TextArea>
            <HStack space={4}>
              <Button
                onPress={() => {
                  setPageShareLink(
                    "http://serenity.re/share/b80d1184-04f7-4965-a4e4/078967c0-c829-4870-b64c-#key=_gpZeFjmIHZzhmJwDp2chGYRiaKB0DdzTacl_uFV9ZU"
                  );
                }}
              >
                Create page link
              </Button>
              <Button
                onPress={() => {
                  setPageShareLink("");
                }}
                variant={"secondary"}
              >
                Reset
              </Button>
            </HStack>
          </Box>
        </DSExampleArea>

        <Heading lvl={1}>Toast</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="md">
            Toast
          </DSMono>{" "}
          component is used to give feedback to users after an action has taken
          place.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          A <DSMono variant="component">Toast</DSMono> informs users of a
          process that an app has performed or will perform. They appear
          temporarily, towards the bottom of the screen.
        </Text>
        <Text variant="sm">
          They shouldn't interrupt the user experience, and they don't require
          user input to disappear.
        </Text>
        <DSExampleArea>
          <Button
            onPress={() => {
              counter = counter + 1;
              showToast(`Copied to clipboard ${counter}`);
            }}
            size={"md"}
          >
            Copy
          </Button>
          <Button
            onPress={() => {
              showToast("Failed to delete the page.", "error");
            }}
            size={"md"}
          >
            This will fail
          </Button>
        </DSExampleArea>

        <Heading lvl={1}>Tooltip</Heading>
        <Text>
          The{" "}
          <DSMono variant="component" size="md">
            Tooltip
          </DSMono>{" "}
          is a brief, informative message that appears when a user interacts
          with an element.
        </Text>
        <Heading lvl={3}>Basic</Heading>
        <Text variant="sm">
          For now we use <DSMono variant="component">Tooltip</DSMono>s
          exclusively for <DSMono variant="context">desktop</DSMono> for actions
          triggerd by <DSMono variant="component">IconButton</DSMono>s.
        </Text>
        <DSExampleArea>
          <VStack style={tw`w-sidebar py-4 border border-gray-200 bg-gray-100`}>
            <SidebarLink
              to={{ screen: "EncryptDecryptImageTest" }}
              iconName="history-line"
            >
              Recently edited
            </SidebarLink>
            <SidebarLink
              to={{ screen: "EncryptDecryptImageTest" }}
              iconName="settings-4-line"
            >
              Settings
            </SidebarLink>
            <SidebarDivider />
            <HStack
              justifyContent="space-between"
              alignItems="center"
              style={tw`mx-4 mb-4`}
            >
              <Text variant={"xxs"} bold>
                Folders
              </Text>
              <Tooltip label="Create folder" placement="right" offset={8}>
                <IconButton name="plus" />
              </Tooltip>
            </HStack>
            <SidebarButton>
              <View style={tw`w-full flex flex-row justify-between`}>
                <HStack alignItems={"center"}>
                  <View>
                    <Icon
                      name="arrow-right-filled"
                      color={"gray-600"}
                      mobileSize={5}
                    />
                  </View>
                  <View style={tw`-ml-0.5`}>
                    <Icon name="folder" size={5} mobileSize={8} />
                  </View>
                  <Text
                    variant="sm"
                    style={tw`ml-1.5 max-w-32`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Getting Started
                  </Text>
                </HStack>
              </View>
            </SidebarButton>
          </VStack>
        </DSExampleArea>
      </View>
    </ScrollSafeAreaView>
  );
}
