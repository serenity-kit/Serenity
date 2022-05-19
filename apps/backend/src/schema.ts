import { makeSchema, connectionPlugin } from "nexus";
import path from "path";

import * as WorkspaceQueryTypes from "./graphql/queries/workspace/workspace";
import * as WorkspacesQueryTypes from "./graphql/queries/workspace/workspaces";

import * as DocumentPreviewsQueryTypes from "./graphql/queries/documentPreviews";
import * as CreateDocumentMutationTypes from "./graphql/mutations/document/createDocument";
import * as UpdateDocumentNameMutationTypes from "./graphql/mutations/document/updateDocumentName";
import * as DeleteDocumentsMutationTypes from "./graphql/mutations/document/deleteDocuments";
import * as DocumentsQueryTypes from "./graphql/queries/document/documents";

import * as RootFoldersQueryTypes from "./graphql/queries/folder/rootFolders";
import * as FoldersQueryTypes from "./graphql/queries/folder/folders";
import * as FolderWithAncestorQueryTypes from "./graphql/queries/folder/folderWithAncestors";
import * as CreateFolderMutationTypes from "./graphql/mutations/folder/createFolder";
import * as UpdateFolderNameMutationTypes from "./graphql/mutations/folder/updateFolderName";

import * as InitializeRegistrationTypes from "./graphql/mutations/authentication/initializeRegistration";
import * as FinalizeRegistrationTypes from "./graphql/mutations/authentication/finalizeRegistration";
import * as InitializeLoginTypes from "./graphql/mutations/authentication/initializeLogin";
import * as FinalizeLoginTypes from "./graphql/mutations/authentication/finalizeLogin";
import * as InitializePasswordResetTypes from "./graphql/mutations/authentication/initializePasswordReset";
import * as FinalizePasswordResetTypes from "./graphql/mutations/authentication/finalizePasswordReset";
import * as CreateWorkspaceMutationTypes from "./graphql/mutations/workspace/createWorkspace";
import * as DeleteWorkspacesMutationTypes from "./graphql/mutations/workspace/deleteWorkspaces";
import * as UpdateWorkspaceMutationTypes from "./graphql/mutations/workspace/updateWorkspace";

import * as WorkspaceTypes from "./graphql/types/workspace";
import * as DocumentTypes from "./graphql/types/documentPreview";

export const schema = makeSchema({
  plugins: [
    connectionPlugin({
      includeNodesField: true,
    }),
  ],
  types: [
    DocumentTypes,
    DocumentPreviewsQueryTypes,
    CreateDocumentMutationTypes,
    UpdateDocumentNameMutationTypes,
    DeleteDocumentsMutationTypes,
    DocumentsQueryTypes,

    CreateFolderMutationTypes,
    UpdateFolderNameMutationTypes,
    FolderWithAncestorQueryTypes,
    RootFoldersQueryTypes,
    FoldersQueryTypes,

    InitializeRegistrationTypes,
    FinalizeRegistrationTypes,
    InitializeLoginTypes,
    FinalizeLoginTypes,
    InitializePasswordResetTypes,
    FinalizePasswordResetTypes,
    CreateWorkspaceMutationTypes,
    DeleteWorkspacesMutationTypes,
    UpdateWorkspaceMutationTypes,
    WorkspaceTypes,
    WorkspaceQueryTypes,
    WorkspacesQueryTypes,
  ],
  outputs: {
    schema: path.join(__dirname, "/generated/schema.graphql"),
    typegen: path.join(__dirname, "/generated/typings.ts"),
  },
});
