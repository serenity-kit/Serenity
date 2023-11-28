import { IconButton, Menu, MenuButton, tw } from "@serenity-tools/ui";
import { useState } from "react";
import { useLocalDocumentName } from "../../store/documentStore";
import { useActiveDocumentStore } from "../../utils/document/activeDocumentStore";
import { exportPdf } from "../../utils/exportPdf/exportPdf";
import { showToast } from "../../utils/toast/showToast";

type Props = {};

export const PageActionsMenu: React.FC<Props> = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const activeDocumentId = useActiveDocumentStore(
    (state) => state.activeDocumentId
  );
  const activeDocumentTitle = useLocalDocumentName({
    documentId: activeDocumentId || "",
  });

  return (
    <Menu
      isOpen={isOpenMenu}
      onChange={setIsOpenMenu}
      trigger={
        <IconButton
          aria-label="Page actions menu"
          isActive={isOpenMenu}
          name={"more-line"}
          size={"lg"}
        />
      }
      bottomSheetModalProps={{
        snapPoints: [140],
      }}
      popoverProps={{
        placement: "bottom right",
        offset: 2,
        style: tw`w-40`,
      }}
    >
      <MenuButton
        iconName={"file-copy-line"}
        onPress={() => {
          const contentElement = document.querySelector(".ProseMirror");
          const pdfExportContainer = document.getElementById(
            "pdf-export-container"
          );
          if (contentElement === null || pdfExportContainer === null) {
            showToast("Content not ready for export", "error");
            return;
          }

          pdfExportContainer.innerHTML = contentElement.innerHTML;

          // set timeout to ensure content is copied before capture
          setTimeout(() => {
            exportPdf({
              content: pdfExportContainer,
              fileName: activeDocumentTitle,
            });
          }, 1);
          setIsOpenMenu(false);
        }}
      >
        Export to PDF
      </MenuButton>
    </Menu>
  );
};
