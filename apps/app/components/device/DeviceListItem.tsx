import { ViewProps, View, Text, Icon, tw } from "@serenity-tools/ui";
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";

type Props = ViewProps & {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string | undefined; // TODO always return encryptionPublicKeySignature
  info?: string | null;
  createdAt?: Date;
  onDeletePress: () => void;
};

export default function DeviceListItem(props: Props) {
  const deviceInfoJson = JSON.parse(props.info!);

  return (
    <View style={styles.listItem}>
      {deviceInfoJson && (
        <>
          {deviceInfoJson.type === "main" && (
            <View>
              <Text>Type: Main</Text>
              <Text>Created At {props.createdAt}</Text>
              <Text>Signing Public Key: {props.signingPublicKey}</Text>
            </View>
          )}
          {deviceInfoJson.type === "web" && (
            <View>
              <Text>Type: {deviceInfoJson.type}</Text>
              <Text>OS: {deviceInfoJson.os}</Text>
              <Text>Browser: {deviceInfoJson.browser}</Text>
              <Text>Version: {deviceInfoJson.browserVersion}</Text>
              <Text>Created At {props.createdAt}</Text>
              <Text>Signing Public Key: {props.signingPublicKey}</Text>
            </View>
          )}
          {deviceInfoJson.type == "device" && (
            <View>
              <Text>Type: {deviceInfoJson.type}</Text>
              <Text>OS: {deviceInfoJson.os}</Text>
              <Text>Version: {deviceInfoJson.osVersion}</Text>
              <Text>Created At {props.createdAt}</Text>
              <Text>Signing Public Key: {props.signingPublicKey}</Text>
            </View>
          )}
          {(deviceInfoJson.type === "web" ||
            deviceInfoJson.type === "device") && (
            <View>
              <TouchableOpacity onPress={props.onDeletePress}>
                <Icon
                  name="close-circle-fill"
                  size={18}
                  color={tw.color("gray-800")}
                />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
  },
});
