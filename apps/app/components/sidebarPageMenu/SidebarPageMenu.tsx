import { useNavigation } from "@react-navigation/native";
import {
  Button,
  Description,
  IconButton,
  Menu,
  MenuButton,
  Modal,
  ModalButtonFooter,
  ModalHeader,
  Shortcut,
  tw,
} from "@serenity-tools/ui";
import { useMachine } from "@xstate/react";
import { createMachine } from "xstate";
import { useDeleteDocumentsMutation } from "../../generated/graphql";
import { showToast } from "../../utils/toast/showToast";

type Props = {
  documentTitle: string;
  documentId: string;
  workspaceId: string;
  refetchDocuments: () => void;
  onUpdateNamePress: () => void;
  onCreateShareLinkPress: () => void;
};

type Context = {
  navigation: any;
  documentId: string;
  workspaceId: string;
  refetchDocuments: () => void;
  deleteDocumentsMutation: any;
};

const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwJYTAIwIYCcAKWMAsmAHYCuAdOgDZgAuKpUAxBAPaliVMBu7Aa260GYAjESgADu1SNOkkAA9EANlUAOSgGYATAEZVAVn0B2AAxHT+3RoA0IAJ6J95gJyUALNbcbV280DTDVMAX1CHVHRsfEIwEgpqMDpGZhYwHBx2HEopGix6ADNsgFsklLE4xRk5FAUkZTVNHQNjM0trWwdnBH0rLyMjSzdPI21jI3CIkFJ2dHgGqMxccXiyKjQ6atkUeVJFFQQjDXNKc1MRv3NdXSNdbSNuxDvVSlMjN103TUH3t0npksYqsElQSuttrV6qBDn5PG91G5TOpgp8NPYnIhPOZtJRdKo3OZVO5xnpzPpwpE0MtYsR1uVREQ5lgaJDdnV9g1Dp5dE8ENokWd7iMvsjiTjKSAgSs4qCGakoGy9gdEA9cQTdKYbhrTFrPKo+fo+jpzDzVO9tJa-KpdJLpbS1okRPRIEqOSqEHCEQSxajbBiehp9JRfKbrBptOjUZ47dTgbKIQ0auzoY0EABaA2YjNGENufMFwv5i5TUJAA */
  createMachine(
    {
      context: { navigation: null, documentId: "" } as Context,
      tsTypes: {} as import("./SidebarPageMenu.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "idle",
      states: {
        idle: {
          on: {
            openMenu: {
              target: "menu",
            },
          },
        },
        menu: {
          on: {
            openDeleteModal: {
              target: "deleteModal",
            },
            closeMenu: {
              target: "idle",
            },
          },
        },
        deleteModal: {
          on: {
            cancelDelete: {
              target: "menu",
            },
            confirmDelete: {
              target: "deleting",
            },
          },
        },
        deleting: {
          invoke: {
            src: "deletePage",
            id: "deletePage",
            onDone: [
              {
                target: "deleted",
              },
            ],
            onError: [
              {
                target: "menu",
              },
            ],
          },
        },
        deleted: {
          entry: "navigateToWorkspaceRoot",
          type: "final",
        },
      },
      id: "sidebarPageMenu",
    },
    {
      services: {
        deletePage: async (context) => {
          try {
            const result = await context.deleteDocumentsMutation({
              input: {
                ids: [context.documentId],
              },
            });
            // throw new Error("debugging the error flow");
            if (result.data.deleteDocuments.status === "success") {
              context.refetchDocuments();
            } else {
              throw new Error("Failed to delete the document");
            }
          } catch (err) {
            showToast(
              "Failed to delete the page. Please try again later.",
              "error"
            );
            throw err;
          }
        },
      },
      actions: {
        navigateToWorkspaceRoot: (context) => {
          showToast("Successfully deleted the page.");
          context.navigation.navigate("Workspace", {
            workspaceId: context.workspaceId,
            screen: "WorkspaceRoot",
          });
        },
      },
    }
  );

export default function SidebarPageMenu(props: Props) {
  const [, deleteDocumentsMutation] = useDeleteDocumentsMutation();
  const navigation = useNavigation();
  const [state, send] = useMachine(machine, {
    context: {
      navigation,
      documentId: props.documentId,
      refetchDocuments: props.refetchDocuments,
      deleteDocumentsMutation: deleteDocumentsMutation,
    },
  });

  return (
    <>
      <Menu
        placement="bottom left"
        style={tw`w-60`}
        offset={2}
        isOpen={state.value !== "idle"}
        onChange={(isOpen) => {
          if (!isOpen) {
            send("closeMenu");
          } else {
            send("openMenu");
          }
        }}
        trigger={
          <IconButton
            accessibilityLabel="More options menu"
            name="more-line"
            color="gray-600"
            style={tw`p-2 md:p-0`}
            testID={`sidebar-document-menu--${props.documentId}__open`}
          ></IconButton>
        }
      >
        <MenuButton
          onPress={() => {
            send("closeMenu");
            props.onUpdateNamePress();
          }}
          iconName="font-size-2"
          shortcut={<Shortcut letter="R" />}
          testID={`sidebar-document-menu--${props.documentId}__rename`}
        >
          Rename
        </MenuButton>
        {/* FIXME: link sharing here until we find a better place */}
        <MenuButton
          onPress={() => {
            send("createShareLink");
            props.onCreateShareLinkPress();
          }}
          iconName="link"
          shortcut={<Shortcut letter="S" />}
          testID={`sidebar-document-menu--${props.documentId}__create-share-link`}
        >
          Share
        </MenuButton>
        <MenuButton
          onPress={() => {
            send("openDeleteModal");
          }}
          iconName="delete-bin-line"
          danger
          testID={`sidebar-document-menu--${props.documentId}__delete`}
        >
          Delete
        </MenuButton>
      </Menu>
      <Modal
        isVisible={state.value === "deleteModal" || state.value === "deleting"}
        onBackdropPress={() => {
          send("cancelDelete");
        }}
      >
        <ModalHeader>Delete page</ModalHeader>
        <Description variant="modal">
          Are you sure you want to delete the page "{props.documentTitle.trim()}
          "? You can't undo this action.
        </Description>
        <ModalButtonFooter
          confirm={
            <Button
              onPress={() => {
                send("confirmDelete");
              }}
              variant="danger"
              isLoading={state.value === "deleting"}
            >
              Delete page
            </Button>
          }
          cancel={
            <Button
              onPress={() => {
                send("cancelDelete");
              }}
              variant="secondary"
              disabled={state.value === "deleting"}
            >
              Keep
            </Button>
          }
        />
      </Modal>
    </>
  );
}
