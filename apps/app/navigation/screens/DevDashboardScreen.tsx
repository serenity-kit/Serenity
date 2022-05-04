import { Link, Text, tw, View } from "@serenity-tools/ui";

export default function DevDashboardScreen() {
  return (
    <View style={tw`mt-20`}>
      <Text>Dev Dashboard Screen</Text>
      <Link to={{ screen: "DesignSystem" }}>Design System</Link>
      <Link to={{ screen: "Register" }}>Registration</Link>
      <Link to={{ screen: "Login" }}>Login</Link>
      <Link
        to={{
          screen: "Workspace",
          params: {
            workspaceId: "dummy",
            screen: "Editor",
          },
        }}
      >
        Editor
      </Link>
      <Link
        to={{
          screen: "Workspace",
          params: {
            workspaceId: "dummy",
            screen: "TestEditor",
          },
        }}
      >
        Sync-Test-Editor
      </Link>
      <Link
        to={{
          screen: "Workspace",
          params: { workspaceId: "dummy", screen: "TestLibsodium" },
        }}
      >
        Libsodium Test Screen
      </Link>
      <Link to={{ screen: "EncryptDecryptImageTest" }}>
        Encrypt / Decrypt Image
      </Link>
    </View>
  );
}
