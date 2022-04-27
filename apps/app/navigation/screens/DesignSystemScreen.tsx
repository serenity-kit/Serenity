import { Text, tw, View, Button, Input, Icon } from "@serenity-tools/ui";
import { Columns, Column, Tiles } from "@mobily/stacks";
import React from "react";

export default function DesignSystemScreen() {
  return (
    <View style={tw`mt-20 px-4`}>
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
      <Text style={tw`mt-6 mb-4 font-700 text-xl text-center`}>Icons</Text>
      <Text style={tw`mb-1`}>Marks</Text>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="bold" />
        <Icon name="italic" />
      </Tiles>
      <Text style={tw`mt-4 mb-1`}>Nodes</Text>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="list-check-2" />
        <Icon name="list-ordered" />
        <Icon name="list-unordered" />
      </Tiles>
      <Text style={tw`mt-4 mb-1`}>Extension</Text>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}></Tiles>
      <Text style={tw`mt-4 mb-1`}>UI</Text>
      <Tiles style={tw`max-w-lg`} space={4} columns={10}>
        <Icon name="archive-line" />
        <Icon name="at-line" />
        <Icon name="calendar-check-fill" />
        <Icon name="printer-line" />
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
    </View>
  );
}
