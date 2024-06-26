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
import { fromPromise, setup } from "xstate";
import { useDeleteDocumentsMutation } from "../../generated/graphql";
import { showToast } from "../../utils/toast/showToast";

type Props = {
  documentTitle: string;
  documentId: string;
  workspaceId: string;
  refetchDocuments: () => void;
  onUpdateNamePress: () => void;
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
  setup({
    types: {} as {
      context: Context;
      input: Context;
      events:
        | { type: "cancelDelete" }
        | { type: "confirmDelete" }
        | { type: "openDeleteModal" }
        | { type: "openMenu" }
        | { type: "closeMenu" };
    },
    actors: {
      deletePage: fromPromise(
        async ({ input: context }: { input: Context }) => {
          try {
            const result = await context.deleteDocumentsMutation({
              input: {
                ids: [context.documentId],
                workspaceId: context.workspaceId,
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
        }
      ),
    },
    actions: {
      navigateToWorkspaceRoot: ({ context }) => {
        showToast("Successfully deleted the page.");
        context.navigation.navigate("Workspace", {
          workspaceId: context.workspaceId,
          screen: "WorkspaceRoot",
        });
      },
    },
  }).createMachine({
    context: ({ input }) => {
      return input;
    },
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
          input: ({ context }) => {
            return context;
          },
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
  });

export default function SidebarPageMenu(props: Props) {
  const [, deleteDocumentsMutation] = useDeleteDocumentsMutation();
  const navigation = useNavigation();
  const [state, send] = useMachine(machine, {
    input: {
      navigation,
      documentId: props.documentId,
      workspaceId: props.workspaceId,
      refetchDocuments: props.refetchDocuments,
      deleteDocumentsMutation: deleteDocumentsMutation,
    },
  });

  return (
    <>
      <Menu
        isOpen={state.value !== "idle"}
        bottomSheetModalProps={{
          snapPoints: [140],
        }}
        popoverProps={{
          placement: "bottom left",
          offset: 2,
          style: tw`w-60`,
        }}
        onChange={(isOpen) => {
          if (!isOpen) {
            send({ type: "closeMenu" });
          } else {
            send({ type: "openMenu" });
          }
        }}
        trigger={
          <IconButton
            aria-label="More options menu"
            name="more-line"
            color="gray-600"
            style={tw`p-2 md:p-0`}
            testID={`sidebar-document-menu--${props.documentId}__open`}
          ></IconButton>
        }
      >
        <MenuButton
          onPress={() => {
            send({ type: "closeMenu" });
            props.onUpdateNamePress();
          }}
          iconName="font-size-2"
          shortcut={<Shortcut letter="R" />}
          testID={`sidebar-document-menu--${props.documentId}__rename`}
        >
          Rename
        </MenuButton>
        <MenuButton
          onPress={() => {
            send({ type: "openDeleteModal" });
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
          send({ type: "cancelDelete" });
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
                send({ type: "confirmDelete" });
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
                send({ type: "cancelDelete" });
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
