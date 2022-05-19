import { Icon, Pressable, Text, tw, View } from "@serenity-tools/ui";
import { HStack } from "native-base";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateDocumentMutation,
  useCreateFolderMutation,
  useFoldersQuery,
} from "../../generated/graphql";

type Props = {
  children: React.ReactNode;
  workspaceId: string;
  folderId: string;
};

export default function Folder(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [, createDocumentMutation] = useCreateDocumentMutation();
  const [, createFolderMutation] = useCreateFolderMutation();
  const [foldersResult] = useFoldersQuery({
    pause: !isOpen,
    variables: {
      parentFolderId: props.folderId,
      first: 50,
    },
  });
  // TODO fetch folders query + have a function fetch more automatically
  // TODO fetch documents query + have a function fetch more automatically

  const createFolder = async () => {
    const id = uuidv4();
    const result = await createFolderMutation({
      input: {
        id,
        workspaceId: props.workspaceId,
        parentFolderId: props.folderId,
      },
    });
    if (result.data?.createFolder?.folder?.id) {
      console.log("created a folder");
    } else {
      console.error(result.error);
      alert("Failed to create a folder. Please try again.");
    }
  };

  return (
    <>
      <Pressable
        onPress={() => {
          setIsOpen((currentIsOpen) => !currentIsOpen);
        }}
      >
        <HStack>
          {isOpen ? (
            <Icon name="arrow-down-s-fill" />
          ) : (
            <Icon name="arrow-right-s-fill" />
          )}
          <Text>{props.children}</Text>
          <Pressable onPress={createFolder}>
            <Text>Create Folder</Text>
          </Pressable>
        </HStack>
      </Pressable>
      {isOpen && (
        <>
          {foldersResult.fetching ? (
            <Text>Loading Folders…</Text>
          ) : foldersResult.data?.folders?.nodes ? (
            foldersResult.data?.folders?.nodes.map((folder) => {
              if (folder === null) {
                return null;
              }
              return (
                <View style={tw`ml-2`} key={folder.id}>
                  <Folder folderId={folder.id} workspaceId={props.workspaceId}>
                    <Text>{folder.name}</Text>
                  </Folder>
                </View>
              );
            })
          ) : null}
        </>
      )}
    </>
  );
}
