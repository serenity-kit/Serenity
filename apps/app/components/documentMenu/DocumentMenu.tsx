import {
  Icon,
  Menu,
  Pressable,
  SidebarButton,
  Text,
  tw,
} from "@serenity-tools/ui";
import {
  useDeleteDocumentsMutation,
  useUpdateDocumentNameMutation,
} from "../../generated/graphql";
import { useState } from "react";

type Props = {
  documentId: string;
  refetchDocumentPreviews: () => void;
};

export default function DocumentMenu(props: Props) {
  const [isOpenDocumentMenu, setIsOpenDocumentMenu] = useState(false);
  const [, deleteDocumentsMutation] = useDeleteDocumentsMutation();
  const [, updateDocumentNameMutation] = useUpdateDocumentNameMutation();

  const deleteDocument = async (id: string) => {
    await deleteDocumentsMutation({
      input: {
        ids: [id],
      },
    });
    props.refetchDocumentPreviews();
  };

  const updateDocumentName = async (id: string) => {
    const name = window.prompt("Enter a document name");
    if (name && name.length > 0) {
      // refetchDocumentPreviews no necessary since a document is returned
      // and therefor the cache automatically updated
      await updateDocumentNameMutation({
        input: {
          id,
          name,
        },
      });
    }
  };

  return (
    <Menu
      placement="bottom"
      style={tw`w-60`}
      offset={8}
      crossOffset={80}
      isOpen={isOpenDocumentMenu}
      onChange={setIsOpenDocumentMenu}
      trigger={
        <Pressable
          accessibilityLabel="More options menu"
          style={tw`flex flex-row`}
        >
          <Icon name="more-line" />
        </Pressable>
      }
    >
      <SidebarButton
        onPress={() => {
          setIsOpenDocumentMenu(false);
          updateDocumentName(props.documentId);
        }}
      >
        <Text variant="small">Change Name</Text>
      </SidebarButton>
      <SidebarButton
        onPress={() => {
          setIsOpenDocumentMenu(false);
          deleteDocument(props.documentId);
        }}
      >
        <Text variant="small">Delete</Text>
      </SidebarButton>
    </Menu>
  );
}
