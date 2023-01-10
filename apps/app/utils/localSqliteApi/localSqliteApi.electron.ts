type Document = {
  id: string;
  content: string;
};

export interface SerenityElectron {
  setDocument: (document: Document) => Promise<boolean>;
  getDocument: (documentId: string) => Promise<Document>;
}

declare global {
  interface Window {
    serenityElectron: SerenityElectron;
  }
}

const invoke = async () => {
  // const id = Date.now().toString();
  const id = "test-id";
  // const insertResult = await window.serenityElectron.setDocument({
  //   id,
  //   content: "test-content",
  // });
  // console.log("insertResult", insertResult);
  const selectResult = await window.serenityElectron.getDocument(id);
  console.log("selectResult", selectResult);
};

invoke();
