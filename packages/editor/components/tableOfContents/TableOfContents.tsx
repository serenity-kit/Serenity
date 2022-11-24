import { Text, tw, View } from "@serenity-tools/ui";
import { Editor } from "@tiptap/react";
import React from "react";

type Props = {
  editor: Editor | null;
};

export default function TableOfContents({ editor }: Props) {
  const content = editor?.getJSON().content || [];

  return (
    <View style={tw`pl-2`}>
      {content.map((entry, index) => {
        if (entry.type !== "heading") {
          return null;
        }
        return (
          <Text
            key={index}
            variant="sm"
            style={tw`pl-${entry.attrs?.level * 2 || 0}`}
          >
            {entry.content?.map((subEntry, index) => {
              if (subEntry.type !== "text") {
                return null;
              }
              return <>{subEntry.text}</>;
            })}
          </Text>
        );
      })}
    </View>
  );
}
