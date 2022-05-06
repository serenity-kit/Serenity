import { makeSchema, connectionPlugin } from "nexus";
import path from "path";

import * as WorkspaceQueryTypes from "./graphql/queries/workspace/workspace";
import * as WorkspacesQueryTypes from "./graphql/queries/workspace/workspaces";
import * as DocumentPreviewsQueryTypes from "./graphql/queries/documentPreviews";

import * as InitializeRegistrationTypes from "./graphql/mutations/initializeRegistration";
import * as FinalizeRegistrationTypes from "./graphql/mutations/finalizeRegistration";
import * as InitializeLoginTypes from "./graphql/mutations/initializeLogin";
import * as FinalizeLoginTypes from "./graphql/mutations/finalizeLogin";
import * as InitializePasswordResetTypes from "./graphql/mutations/initializePasswordReset";
import * as FinalizePasswordResetTypes from "./graphql/mutations/finalizePasswordReset";
import * as CreateDocumentMutationTypes from "./graphql/mutations/createDocument";
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
