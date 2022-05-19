import { Icon, Pressable, Text } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { useCreateDocumentMutation } from "../../generated/graphql";

type Props = {
  children: React.ReactNode;
};

export default function Folder(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [, createDocumentMutation] = useCreateDocumentMutation();
  // TODO fetch folders query + have a function fetch more automatically
  // TODO fetch documents query + have a function fetch more automatically

  return (
    <>
      <Pressable
        onPress={() => {
          setIsOpen((currentIsOpen) => !currentIsOpen);
        }}
      >
        <HStack>
          <Icon name="arrow-down-s-line" />
          <Text>{props.children}</Text>
          <Pressable
            onPress={() => {
              console.log("lala");
            }}
          >
            <Text>+</Text>
          </Pressable>
        </HStack>
      </Pressable>
      {isOpen && <Text>children</Text>}
    </>
  );
}
