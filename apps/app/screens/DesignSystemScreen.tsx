import { Text, tw, View, Button, Input } from "@serenity-tools/ui";

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
    </View>
  );
}
