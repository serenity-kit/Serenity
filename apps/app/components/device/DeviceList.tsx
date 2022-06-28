import { ViewProps, View, Text, Icon, tw } from "@serenity-tools/ui";
import { StyleSheet } from "react-native";
import { FlatList } from "native-base";
import { Device } from "../../types/Device";
import DeviceListItem from "./DeviceListItem";

type Props = ViewProps & {
  devices: Device[] | null;
  onDeletePress: (deviceSigningPublicKey: string) => void;
};

export default function DeviceList(props: Props) {
  const deleteDevice = async (device: Device) => {
    // TODO: delete device
  };

  return (
    <FlatList
      data={props.devices}
      renderItem={({ item }) => (
        <DeviceListItem
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
