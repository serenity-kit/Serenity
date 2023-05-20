import { generateId as naishoGenerateId } from "@naisho/core";
import sodium from "react-native-libsodium";

export const generateId = () => naishoGenerateId(sodium);
