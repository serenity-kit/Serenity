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
  const [type, setType] = useState("");
  const [osName, setOsName] = useState("");
  const [osVersion, setOsVersion] = useState("");
  const [browserName, setBrowseerName] = useState("");
  const [browserVersion, setBrowserVersion] = useState("");

  useEffect(() => {
    if (props.info) {
      try {
        const deviceInfoJson = JSON.parse(props.info);
        setType(deviceInfoJson.type);
        setOsName(deviceInfoJson.os);
        setOsVersion(deviceInfoJson.osVersion);
        setBrowseerName(deviceInfoJson.browser);
        setBrowserVersion(deviceInfoJson.browserVersion);
      } catch (err) {
        // TODO: handle device info parse error
        console.error(err);
      }
    }
  }, []);

  return (
    <View style={styles.listItem}>
      {type === "main" && (
        <View>
          <Text>Type: Main</Text>
          <Text>Created At {props.createdAt}</Text>
          <Text>Signing Public Key: {props.signingPublicKey}</Text>
        </View>
      )}
      {type === "web" && (
        <View>
          <Text>Type: {type}</Text>
          <Text>OS: {osName}</Text>
          <Text>Browser: {browserName}</Text>
          <Text>Version: {browserVersion}</Text>
          <Text>Created At {props.createdAt}</Text>
          <Text>Signing Public Key: {props.signingPublicKey}</Text>
        </View>
      )}
      {type == "device" && (
        <View>
          <Text>Type: {type}</Text>
          <Text>OS: {osName}</Text>
          <Text>Version: {osVersion}</Text>
          <Text>Created At {props.createdAt}</Text>
          <Text>Signing Public Key: {props.signingPublicKey}</Text>
        </View>
      )}
      {(type === "web" || type === "device") && (
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
