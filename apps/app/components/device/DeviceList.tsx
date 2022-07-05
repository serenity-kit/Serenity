import { View, Text } from "@serenity-tools/ui";
import { StyleSheet, FlatList } from "react-native";
import { Device } from "../../types/Device";
import DeviceListItem from "./DeviceListItem";

type Props = {
  devices: Device[] | null;
  onDeletePress: (deviceSigningPublicKey: string) => void;
};

export default function DeviceList(props: Props) {
  return (
    <FlatList
      data={props.devices}
      keyExtractor={(item) => item.signingPublicKey}
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
