import { ViewProps, View, Text, Icon, tw } from "@serenity-tools/ui";
import { StyleSheet, FlatList } from "react-native";
import { Device } from "../../types/Device";
import DeviceListItem from "./DeviceListItem";

type Props = ViewProps & {
  devices: Device[] | null;
  onDeviceDeleted: (device: Device) => void;
};

export default function DeviceList({ devices, onDeviceDeleted }: Props) {
  const deleteDevice = async (device: Device) => {
    // TODO: delete device
  };

  return (
    <FlatList
      data={devices}
      renderItem={({ item }) => (
        <DeviceListItem
          signingPublicKey={item.signingPublicKey}
          encryptionPublicKey={item.encryptionPublicKey}
          encryptionPublicKeySignature={item.encryptionPublicKeySignature}
          createdAt={item.createdAt}
          info={item.info}
          onDeletePress={() => deleteDevice(item)}
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
