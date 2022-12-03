import { IPressableProps, Pressable as NativeBasePressable } from "native-base";

export type PressableProps = IPressableProps & { children?: React.ReactNode };

export const Pressable = NativeBasePressable;
