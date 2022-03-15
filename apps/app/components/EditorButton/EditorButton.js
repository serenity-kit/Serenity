import { Platform, StyleSheet, View } from "react-native";
import { Text, TextProps } from '@serenity-tools/ui';

export function EditorButton(props: TextProps) {

  const styles = StyleSheet.create({

  })

  return (
    <Button>

    </Button>
  )
  return <Text {...props} style={[props.style, { fontFamily: 'space-mono' }]} />;
}
