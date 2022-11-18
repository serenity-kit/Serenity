import { Text, View } from "@serenity-tools/ui";
import { Editor } from "@tiptap/react";
import React from "react";

type Props = {
  editor: Editor | null;
};

export default function TableOfContents({ editor }: Props) {
  return (
    <View>
      <Text>Table of Contents</Text>
    </View>
  );
}
