import { makeSchema, connectionPlugin } from "nexus";
import path from "path";

import * as WorkspaceQueryTypes from "./graphql/queries/workspace/workspace";
import * as WorkspacesQueryTypes from "./graphql/queries/workspace/workspaces";

import * as CreateDocumentMutationTypes from "./graphql/mutations/document/createDocument";
import * as UpdateDocumentNameMutationTypes from "./graphql/mutations/document/updateDocumentName";
import * as DeleteDocumentsMutationTypes from "./graphql/mutations/document/deleteDocuments";
import * as DocumentsQueryTypes from "./graphql/queries/document/documents";
import * as DocumentPathQueryTypes from "./graphql/queries/document/documentPath";
import * as FirstDocumentQueryTypes from "./graphql/queries/document/firstDocument";
import * as DocumentQueryTypes from "./graphql/queries/document/document";

import * as RootFoldersQueryTypes from "./graphql/queries/folder/rootFolders";
import * as FoldersQueryTypes from "./graphql/queries/folder/folders";
import * as CreateFolderMutationTypes from "./graphql/mutations/folder/createFolder";
import * as UpdateFolderNameMutationTypes from "./graphql/mutations/folder/updateFolderName";
import * as DeleteFoldersMutationTypes from "./graphql/mutations/folder/deleteFolders";

import * as StartRegistrationTypes from "./graphql/mutations/authentication/startRegistration";
import * as FinishRegistrationTypes from "./graphql/mutations/authentication/finishRegistration";
import * as VerifyRegistrationTypes from "./graphql/mutations/authentication/verifyRegistration";
import * as StartLoginTypes from "./graphql/mutations/authentication/startLogin";
import * as FinishLoginTypes from "./graphql/mutations/authentication/finishLogin";
import * as MeQueryTypes from "./graphql/queries/authentication/me";
import * as UserIdFromUsernameQueryTypes from "./graphql/queries/userIdFromUsername";

import * as WorkspaceTypes from "./graphql/types/workspace";
import * as DeleteWorkspacesMutationTypes from "./graphql/mutations/workspace/deleteWorkspaces";
import * as UpdateWorkspaceMutationTypes from "./graphql/mutations/workspace/updateWorkspace";
import * as CreateWorkspaceInvitationTypes from "./graphql/mutations/workspace/createWorkspaceInvitation";
import * as AcceptWorkspaceInvitationTypes from "./graphql/mutations/workspace/acceptWorkspaceInvitation";
import * as WorkspaceInvitationsTypes from "./graphql/queries/workspace/workspaceInvitations";
import * as WorkspaceInvitationTypes from "./graphql/queries/workspace/workspaceInvitation";
import * as DeleteWorkspaceInvitationsTypes from "./graphql/mutations/workspace/deleteWorkspaceInvitations";
import * as CreateInitialWorkspaceStructureMutationTypes from "./graphql/mutations/workspace/createInitialWorkspaceStructure";

import * as CreateDeviceMutationTypes from "./graphql/mutations/device/createDevice";
import * as DevicesQueryTypes from "./graphql/queries/device/devices";
import * as deviceBySigningPublicKeyQueryTypes from "./graphql/queries/device/deviceBySigningPublicKey";
import * as DeleteDevicesMutationTypes from "./graphql/mutations/device/deleteDevices";
import * as MainDeviceQueryTypes from "./graphql/queries/device/mainDevice";

import * as DocumentTypes from "./graphql/types/document";

import * as DateTypes from "./graphql/types/date";

export const schema = makeSchema({
  plugins: [
    connectionPlugin({
      includeNodesField: true,
    }),
  ],
  types: [
    DateTypes,

    DocumentTypes,
    CreateDocumentMutationTypes,
    UpdateDocumentNameMutationTypes,
    DeleteDocumentsMutationTypes,
    DocumentsQueryTypes,
    DocumentPathQueryTypes,
    FirstDocumentQueryTypes,
    DocumentQueryTypes,

    CreateFolderMutationTypes,
    UpdateFolderNameMutationTypes,
    RootFoldersQueryTypes,
    FoldersQueryTypes,
    DeleteFoldersMutationTypes,

    StartRegistrationTypes,
    FinishRegistrationTypes,
    VerifyRegistrationTypes,
    StartLoginTypes,
    FinishLoginTypes,
    MeQueryTypes,
    UserIdFromUsernameQueryTypes,

    DeleteWorkspacesMutationTypes,
    UpdateWorkspaceMutationTypes,
    WorkspaceTypes,
    WorkspaceQueryTypes,
    WorkspacesQueryTypes,
    CreateWorkspaceInvitationTypes,
    AcceptWorkspaceInvitationTypes,
    WorkspaceInvitationsTypes,
    WorkspaceInvitationTypes,
    DeleteWorkspaceInvitationsTypes,
    CreateInitialWorkspaceStructureMutationTypes,

    CreateDeviceMutationTypes,
    DevicesQueryTypes,
    deviceBySigningPublicKeyQueryTypes,
    DeleteDevicesMutationTypes,
    MainDeviceQueryTypes,
  ],
  outputs: {
    schema: path.join(__dirname, "/generated/schema.graphql"),
    typegen: path.join(__dirname, "/generated/typings.ts"),
  },
});
