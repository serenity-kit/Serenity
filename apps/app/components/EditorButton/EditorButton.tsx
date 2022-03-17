import { Text, TextProps } from "@serenity-tools/ui";

export function EditorButton(props: TextProps) {
  return (
    <Text {...props} style={[props.style, { fontFamily: "space-mono" }]} />
  );
}
