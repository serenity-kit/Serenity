import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  LabeledInput,
  ModalHeader,
  ModalButtonFooter,
} from "@serenity-tools/ui";
import { useCreateInitialWorkspaceStructureMutation } from "../../generated/graphql";
import { v4 as uuidv4 } from "uuid";
import { createSignatureKeyPair, createSnapshot } from "@naisho/core";
import sodium, { KeyPair } from "@serenity-tools/libsodium";

type WorkspaceProps = {
  id: string;
};
type FolderProps = {
  id: string;
};
type DocumentProps = {
  id: string;
};
export type CreateWorkspaceFormProps = {
  onWorkspaceStructureCreated: ({
    workspace: WorkspaceProps,
    folder: FolderProps,
    document: DocumentProps,
  }) => void;
};

const introductionDocument = `AlCOiJekCQAHAQRwYWdlAwdoZWFkaW5nKACOiJekCQAFbGV2ZWwBfQEHAI6Il6QJAAYEAI6Il6QJAgxJbnRyb2R1Y3Rpb26HjoiXpAkAAwlwYXJhZ3JhcGgHAI6Il6QJDwYEAI6Il6QJEBtXZWxjb21lIHRvIHlvdXIgZmlyc3QgcGFnZSGBjoiXpAkPAQAbh46Il6QJLAMJcGFyYWdyYXBoAAXHjoiXpAkPjoiXpAksAwdoZWFkaW5nBwCOiJekCU4GBACOiJekCU8FTGlzdHMoAI6Il6QJTgVsZXZlbAF9AoGOiJekCUgBBwCOiJekCUgGBACOiJekCVcPWW91IGNhbiBjcmVhdGUggY6Il6QJZgWHjoiXpAlWAwlwYXJhZ3JhcGiBjoiXpAlrA4SOiJekCW8aYnVsbGV0LCBudW1iZXJlZCBhbmQgY2hlY2uBjoiXpAmJAQGEjoiXpAmKAQYtbGlzdHPBjoiXpAlIjoiXpAlWAYSOiJekCZABBSBlLmcuwY6Il6QJSI6Il6QJkQEBAALBjoiXpAlIjoiXpAmXAQEAAsGOiJekCUiOiJekCZoBAQALx46Il6QJSI6Il6QJnQEDCHRhc2tMaXN0BwCOiJekCakBAwh0YXNrSXRlbQcAjoiXpAmqAQMJcGFyYWdyYXBoIQCOiJekCaoBB2NoZWNrZWQBAQCOiJekCasBAQAPR46Il6QJrQEGBACOiJekCb0BDFNpZ24gdXAgZm9yIIGOiJekCckBAYSOiJekCcoBCFNlcmVuaXR5h46Il6QJqgEDCHRhc2tJdGVtBwCOiJekCdMBAwlwYXJhZ3JhcGgoAI6Il6QJ0wEHY2hlY2tlZAF5qI6Il6QJrAEBeAEAjoiXpAnUAQEAAUeOiJekCdcBBgQAjoiXpAnZAQVSZWFkIIGOiJekCd4BDISOiJekCeoBEXRoZSBJbnRyb2R1Y3Rpb24ggY6Il6QJ-wENhI6Il6QJiAIEcGFnZYeOiJekCdMBAwh0YXNrSXRlbQcAjoiXpAmNAgMJcGFyYWdyYXBoKACOiJekCY0CB2NoZWNrZWQBeQcAjoiXpAmOAgYEAI6Il6QJkAIUQ3JlYXRlIHlvdXIgb3duIHBhZ2WBjoiXpAmNAgEAAsGOiJekCakBjoiXpAmdAQEAKMeOiJekCakBjoiXpAmoAgMHaGVhZGluZygAjoiXpAnRAgVsZXZlbAF9AgcAjoiXpAnRAgYEAI6Il6QJ0wIWSGlnaGxpZ2h0cyBvZiBTZXJlbml0ecGOiJekCdECjoiXpAmoAgHHjoiXpAnRAo6Il6QJ6gIDCmJ1bGxldExpc3QHAI6Il6QJ6wIDCGxpc3RJdGVtBwCOiJekCewCAwlwYXJhZ3JhcGgHAI6Il6QJ7QIGBACOiJekCe4CCEdyZWF0IFVYh46Il6QJ7AIDCGxpc3RJdGVtBwCOiJekCfcCAwlwYXJhZ3JhcGgHAI6Il6QJ-AIGBACOiJekCfkCA0VuZIGOiJekCfwCAYSOiJekCf0CEC10by1lbmQgZW5jcnlwdGWEjoiXpAmNAwFkAfD8moQIAISOiJekCY4DAWQBjoiXpAkRLBxJBVYBZwVtA4oBAZEBAZcBEqwBEcoBAdcBAt8BDPwBDaUCLOoCAf0CAY4DAQ`;

const createIntroductionDocumentSnapshot = async ({
  documentId,
  documentEncryptionKey,
}: {
  documentId: string;
  documentEncryptionKey: Uint8Array;
}) => {
  // TODO in the future use the main device
  const signatureKeyPair = await createSignatureKeyPair();

  const publicData = {
    snapshotId: uuidv4(),
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };

  return await createSnapshot(
    sodium.from_base64(introductionDocument),
    publicData,
    documentEncryptionKey,
    signatureKeyPair
  );
};

export function CreateWorkspaceForm(props: CreateWorkspaceFormProps) {
  const inputRef = useRef();
  const [name, setName] = useState<string>("");
  const [, createInitialWorkspaceStructure] =
    useCreateInitialWorkspaceStructureMutation();

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        // @ts-expect-error focus() not defined since .current can be undefined
        inputRef.current.focus();
      }
    }, 250);
  }, []);

  const createWorkspace = async () => {
    const workspaceId = uuidv4();
    const folderId = uuidv4();
    const documentId = uuidv4();
    // currently hard-coded until we enable e2e encryption per workspace
    const documentEncryptionKey = sodium.from_base64(
      "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
    );
    const snapshot = await createIntroductionDocumentSnapshot({
      documentId,
      documentEncryptionKey,
    });

    const createInitialWorkspaceStructureResult =
      await createInitialWorkspaceStructure({
        input: {
          workspaceName: name,
          workspaceId,
          folderName: "Getting started",
          folderId,
          folderIdSignature: `TODO+${folderId}`,
          documentName: "Introduction",
          documentId,
          documentSnapshot: snapshot,
        },
      });
    if (
      !createInitialWorkspaceStructureResult.data
        ?.createInitialWorkspaceStructure?.workspace
    ) {
      // TODO: handle error
      return;
    }
    const workspace =
      createInitialWorkspaceStructureResult.data.createInitialWorkspaceStructure
        .workspace;
    const folder =
      createInitialWorkspaceStructureResult.data.createInitialWorkspaceStructure
        .folder;
    // TODO: we will have a document returned as part of this structure
    const document =
      createInitialWorkspaceStructureResult.data.createInitialWorkspaceStructure
        .document;
    if (props.onWorkspaceStructureCreated) {
      props.onWorkspaceStructureCreated({
        workspace,
        folder,
        document,
      });
    }
  };

  return (
    <>
      <ModalHeader>Create a Workspace</ModalHeader>
      <LabeledInput
        ref={inputRef}
        label={"Workspace Name"}
        onChangeText={setName}
        autoFocus={true}
        hint="This is the name of your organization, team or private notes. You can invite team members afterwards."
      />
      <ModalButtonFooter
        confirm={
          <Button disabled={name === ""} onPress={createWorkspace}>
            Create
          </Button>
        }
      />
    </>
  );
}
