import { Text, View } from "@serenity-tools/ui";
import { FlatList, StyleSheet } from "react-native";
import { Device } from "../../types/Device";
import DeviceListItem from "./DeviceListItem";

type Props = {
  devices: Device[] | null;
  activeDevice: Device;
  onDeletePress: (deviceSigningPublicKey: string) => void;
};

export default function DeviceList(props: Props) {
  return (
    <FlatList
      data={props.devices}
      keyExtractor={(item) => item.signingPublicKey}
      renderItem={({ item }) => (
        <DeviceListItem
          isActiveDevice={
            props.activeDevice.signingPublicKey === item.signingPublicKey
          }
          signingPublicKey={item.signingPublicKey}
          encryptionPublicKey={item.encryptionPublicKey}
          encryptionPublicKeySignature={item.encryptionPublicKeySignature}
          createdAt={item.createdAt}
          info={item.info}
          onDeletePress={() => props.onDeletePress(item.signingPublicKey)}
        />
      )}
      ListEmptyComponent={() => (
        <View style={styles.listItem}>
          <Text>No devices</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
  },
});
