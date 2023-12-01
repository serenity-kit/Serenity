import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Params = {
  content: HTMLElement;
  fileName: string;
};

export const exportPdf = ({ content, fileName }: Params) => {
  html2canvas(content, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");

    const imgWidth = 210; // Width of A4 in mm
    const pageHeight = 295; // Height of A4 in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const doc = new jsPDF();
    let position = 0;

    doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    doc.save(`${fileName}.pdf`);
  });
};
