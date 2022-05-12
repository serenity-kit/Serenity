import {
  Text,
  tw,
  View,
  Button,
  Input,
  Icon,
  Menu,
  MenuItem,
  ScrollView,
  SidebarButton,
  Checkbox,
  Pressable,
  Link,
  EditorSidebarIcon,
  LabeledInput,
} from "@serenity-tools/ui";
import { Columns, Column, Tiles } from "@mobily/stacks";
import React from "react";
import { useWindowDimensions } from "react-native";
import { VStack } from "native-base";

export default function DesignSystemScreen() {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  return (
    <ScrollView style={tw`px-4 py-6`}>
      <Text style={tw`mb-4 h2`}>Text</Text>
      <Text variant="large">large Text</Text>
      <Text>regular Text</Text>
      <Text variant="small">small Text</Text>
      <Text variant="tiny">tiny Text</Text>
      <Text muted>muted Text</Text>

      <Text style={tw`mt-6 mb-4 h2`}>Button</Text>
      <Text>Default Button</Text>
      <Button>Login</Button>
      <Text>Disabled Button</Text>
      <Button disabled>Login</Button>

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

      <Text style={tw`mt-6 mb-4 h2`}>SidebarButton</Text>
      <SidebarButton>Hallo</SidebarButton>
      <SidebarButton disabled>Hallo</SidebarButton>

      <Text style={tw`mt-6 mb-4 h2`}>Menu</Text>
      <View style={tw`flex flex-row`}>
        <Menu
          trigger={(triggerProps) => {
            return (
              <Pressable
                accessibilityLabel="More options menu"
                {...triggerProps}
                style={tw``}
              >
                <Icon name="more-2-line" />
              </Pressable>
            );
          }}
        >
          <MenuItem>Arial</MenuItem>
          <MenuItem>Nunito Sans</MenuItem>
          <MenuItem>SF Pro</MenuItem>
          <MenuItem>Helvetica</MenuItem>
          <MenuItem isDisabled>Sofia</MenuItem>
          <MenuItem>Cookie</MenuItem>
        </Menu>
      </View>

      <Text style={tw`mt-6 mb-4 h2`}>Link</Text>
      <Link to={{ screen: "EncryptDecryptImageTest" }}>
        Encrypt / Decrypt Image
      </Link>

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
        <Icon name="archive-line" />
        <Icon name="arrow-down-s-fill" />
        <Icon name="arrow-down-s-line" />
        <Icon name="arrow-go-back-fill" />
        <Icon name="arrow-go-back-line" />
        <Icon name="arrow-go-forward-fill" />
        <Icon name="arrow-go-forward-line" />
        <Icon name="arrow-right-s-fill" />
        <Icon name="arrow-up-down-line" />
        <Icon name="book-open-line" />
        <Icon name="calendar-check-fill" />
        <Icon name="chat-1-line" />
        <Icon name="chat-4-line" />
        <Icon name="cup" />
        <Icon name="delete-bin-line" />
        <Icon name="download-line" />
        <Icon name="emotion-line" />
        <Icon name="file-search-line" />
        <Icon name="file-transfer-line" />
        <Icon name="folder-line" />
        <Icon name="folder-music-line" />
        <Icon name="history-line" />
        <Icon name="image-2-line" />
        <Icon name="image-line" />
        <Icon name="more-2-line" />
        <Icon name="more-line" />
        <Icon name="movie-line" />
        <Icon name="printer-line" />
        <Icon name="question-mark" />
        <Icon name="search-line" />
        <Icon name="settings-4-line" />
        <Icon name="stars-s-fill" />
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
