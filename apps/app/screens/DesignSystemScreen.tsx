import { Text, tw, View, Button } from "@serenity-tools/ui";

export default function DesignSystemScreen() {
  return (
    <View style={tw`mt-20 px-4`}>
      <Text>Default Button</Text>
      <Button>Login</Button>
      <Text>Disabled Button</Text>
      <Button disabled>Login</Button>
      <Text>Input</Text>
    </View>
  );
}
