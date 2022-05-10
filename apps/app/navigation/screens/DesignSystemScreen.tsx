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
  Checkbox,
  Pressable,
  Link,
} from "@serenity-tools/ui";
import { Columns, Column, Tiles } from "@mobily/stacks";
import React from "react";

export default function DesignSystemScreen() {
  return (
    <ScrollView style={tw`mt-20 px-4`}>
      <Text>Default Button</Text>
      <Button>Login</Button>
      <Text>Disabled Button</Text>
      <Button disabled>Login</Button>
      <Text>Input</Text>
      <Input />
      <Text>Input w/ Value</Text>
      <Input value="jane@example.com" />
      <Text>Input w/ Placeholder</Text>
      <Input placeholder="Enter your email …" />
      <Text>Input Disabled</Text>
      <Input disabled value="jane@example.com" />
      <Text>Input Disabled</Text>
      <Input disabled placeholder="Enter your email …" />
      <Text>Menu</Text>
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

      <Link to={{ screen: "EncryptDecryptImageTest" }}>
        Encrypt / Decrypt Image
      </Link>
      <Text>Checkbox</Text>
      <Checkbox value="test" accessibilityLabel="This is a dummy checkbox" />
      <Checkbox
        value="test"
        accessibilityLabel="This is a dummy checkbox"
        defaultIsChecked
      >
        Software Development{" "}
        <Link to={{ screen: "EncryptDecryptImageTest" }}>
          Encrypt / Decrypt Image
        </Link>
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

      <Text style={tw`mt-6 mb-4 font-700 text-xl text-center`}>Icons</Text>
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
