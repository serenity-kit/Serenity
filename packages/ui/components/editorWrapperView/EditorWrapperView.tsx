import { View as DefaultView } from "react-native";
import { useThemeColor } from "../../hooks/useThemeColor";
import { ViewProps } from "../view/View";

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
