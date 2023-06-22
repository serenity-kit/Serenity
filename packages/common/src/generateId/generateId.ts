import { generateId as secSyncGenerateId } from "@serenity-tools/secsync";
import sodium from "react-native-libsodium";

export const generateId = () => secSyncGenerateId(sodium);
