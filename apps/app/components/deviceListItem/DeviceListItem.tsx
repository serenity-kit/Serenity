import { Icon, Text, tw, View, ViewProps } from "@serenity-tools/ui";
import { TouchableOpacity } from "react-native-gesture-handler";

type Props = ViewProps & {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
  info?: string | null;
  isActiveDevice: boolean;
  createdAt?: Date;
  onDeletePress: () => void;
};

export default function DeviceListItem(props: Props) {
  const deviceInfoJson = JSON.parse(props.info!);

  return (
    <View style={tw`border-b p-4`}>
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
              {props.isActiveDevice && <Text>(this device)</Text>}
            </View>
          )}
          {deviceInfoJson.type == "device" && (
            <View>
              <Text>Type: {deviceInfoJson.type}</Text>
              <Text>OS: {deviceInfoJson.os}</Text>
              <Text>Version: {deviceInfoJson.osVersion}</Text>
              <Text>Created At {props.createdAt}</Text>
              <Text>Signing Public Key: {props.signingPublicKey}</Text>
              {props.isActiveDevice && <Text>(this device)</Text>}
            </View>
          )}
          {!props.isActiveDevice &&
            (deviceInfoJson.type === "web" ||
              deviceInfoJson.type === "device") && (
              <View>
                <TouchableOpacity onPress={props.onDeletePress}>
                  <Icon name="close-circle-fill" color={"gray-800"} />
                </TouchableOpacity>
              </View>
            )}
        </>
      )}
    </View>
  );
}
