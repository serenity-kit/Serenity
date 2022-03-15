import { View as DefaultView } from "react-native";
import { ThemeProps } from "../types";
export type ViewProps = ThemeProps & DefaultView["props"];
import { useThemeColor } from "../hooks/useThemeColor";

export function EditorWrapperView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    // @ts-expect-error manually setting color for the editor
    <DefaultView style={[{ backgroundColor, color }, style]} {...otherProps} />
  );
}
