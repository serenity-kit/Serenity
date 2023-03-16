import React from "react";
import {
  DesignSystemExampleArea as DSExampleArea,
  ScrollSafeAreaView,
  tw,
  View,
  TextArea,
  ReplyArea,
} from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { RootStackScreenProps } from "../../../types/navigationProps";

export default function UITestScreen(props: RootStackScreenProps<"UITest">) {
  useWindowDimensions(); // needed to ensure tw-breakpoints are triggered when resizing

  const [textareaText, setTextareaText] = useState("");
  const [replyText, setReplyText] = useState("");

  return (
    <ScrollSafeAreaView>
      <View style={tw`w-full max-w-4xl mx-auto px-4 pt-2 pb-12`}>
        <DSExampleArea style={tw`my-5`}>
          <HStack
            space={6}
            alignItems={"flex-start"}
            style={tw`p-6 border-2 border-solid border-collaboration-sky`}
          >
            <TextArea
              value={textareaText}
              onChangeText={(text) => setTextareaText(text)}
              minRows={2}
              maxRows={7}
            />
            <TextArea
              value={textareaText}
              onChangeText={(text) => setTextareaText(text)}
              minRows={2}
              maxRows={7}
              unlimited
            />
          </HStack>
        </DSExampleArea>
        <DSExampleArea style={tw`my-5`}>
          <View
            style={tw`w-50 p-6 border-2 border-solid border-collaboration-sky`}
          >
            <ReplyArea
              value={replyText}
              onChangeText={(text) => setReplyText(text)}
              minRows={3}
            />
          </View>
        </DSExampleArea>
      </View>
    </ScrollSafeAreaView>
  );
}
