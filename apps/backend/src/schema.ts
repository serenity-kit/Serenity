import { connectionPlugin, makeSchema } from "nexus";
import path from "path";
import * as FinishLoginTypes from "./graphql/mutations/authentication/finishLogin";
import * as FinishRegistrationTypes from "./graphql/mutations/authentication/finishRegistration";
import * as LogoutTypes from "./graphql/mutations/authentication/logout";
import * as StartLoginTypes from "./graphql/mutations/authentication/startLogin";
import * as StartRegistrationTypes from "./graphql/mutations/authentication/startRegistration";
import * as VerifyPasswordTypes from "./graphql/mutations/authentication/verifyPassword";
import * as VerifyRegistrationTypes from "./graphql/mutations/authentication/verifyRegistration";
import * as CreateCommentMutationTypes from "./graphql/mutations/comment/createComment";
import * as DeleteCommentsMutationTypes from "./graphql/mutations/comment/deleteComments";
import * as AttachDevicesToWorkspacesMutationTypes from "./graphql/mutations/device/attachDevicesToWorkspaces";
import * as AttachDeviceToWorkspacesMutationTypes from "./graphql/mutations/device/attachDeviceToWorkspaces";
import * as DeleteDevicesMutationTypes from "./graphql/mutations/device/deleteDevices";
import * as CreateDocumentMutationTypes from "./graphql/mutations/document/createDocument";
import * as CreateDocumentShareLinkTypes from "./graphql/mutations/document/createDocumentShareLink";
import * as DeleteDocumentsMutationTypes from "./graphql/mutations/document/deleteDocuments";
import * as RemoveDocumentShareLinkTypes from "./graphql/mutations/document/removeDocumentShareLink";
import * as UpdateDocumentNameMutationTypes from "./graphql/mutations/document/updateDocumentName";
import * as InitiateFileUploadMutationTypes from "./graphql/mutations/file/initiateFileUpload";
import * as CreateFolderMutationTypes from "./graphql/mutations/folder/createFolder";
import * as DeleteFoldersMutationTypes from "./graphql/mutations/folder/deleteFolders";
import * as UpdateFolderNameMutationTypes from "./graphql/mutations/folder/updateFolderName";
import * as AcceptWorkspaceInvitationTypes from "./graphql/mutations/workspace/acceptWorkspaceInvitation";
import * as CreateInitialWorkspaceStructureMutationTypes from "./graphql/mutations/workspace/createInitialWorkspaceStructure";
import * as CreateWorkspaceInvitationTypes from "./graphql/mutations/workspace/createWorkspaceInvitation";
import * as DeleteWorkspaceInvitationsTypes from "./graphql/mutations/workspace/deleteWorkspaceInvitations";
import * as DeleteWorkspacesMutationTypes from "./graphql/mutations/workspace/deleteWorkspaces";
import * as RemoveMembersAndRotateWorkspaceKeyMutationTypes from "./graphql/mutations/workspace/removeMembersAndRotateWorkspaceKey";
import * as UpdateWorkspaceMembersRolesMutationTypes from "./graphql/mutations/workspace/updateWorkspaceMembersRoles";
import * as UpdateWorkspaceNameMutationTypes from "./graphql/mutations/workspace/updateWorkspaceName";
import * as MeQueryTypes from "./graphql/queries/authentication/me";
import * as deviceBySigningPublicKeyQueryTypes from "./graphql/queries/device/deviceBySigningPublicKey";
import * as DevicesQueryTypes from "./graphql/queries/device/devices";
import * as MainDeviceQueryTypes from "./graphql/queries/device/mainDevice";
import * as UnauthorizedDevicesForWorkspacesTypes from "./graphql/queries/device/unauthorizedDevicesForWorkspaces";
import * as DocumentQueryTypes from "./graphql/queries/document/document";
import * as DocumentPathQueryTypes from "./graphql/queries/document/documentPath";
import * as DocumentsQueryTypes from "./graphql/queries/document/documents";
import * as DocumentShareLinkQueryTypes from "./graphql/queries/document/documentShareLink";
import * as DocumentShareLinksQueryTypes from "./graphql/queries/document/documentShareLinks";
import * as FirstDocumentQueryTypes from "./graphql/queries/document/firstDocument";
import * as FileUrlQueryTypes from "./graphql/queries/file/fileUrl";
import * as FolderQueryTypes from "./graphql/queries/folder/folder";
import * as FoldersQueryTypes from "./graphql/queries/folder/folders";
import * as RootFoldersQueryTypes from "./graphql/queries/folder/rootFolders";
import * as UserIdFromUsernameQueryTypes from "./graphql/queries/userIdFromUsername";
import * as ActiveWorkspaceKeysQueryTypes from "./graphql/queries/workspace/activeWorkspaceKeys";
import * as PendingingWorkspaceInvitationQueryTypes from "./graphql/queries/workspace/pendingWorkspaceInvitation";
import * as UnauthorizedMembersTypes from "./graphql/queries/workspace/unauthorizedMembers";
import * as WorkspaceQueryTypes from "./graphql/queries/workspace/workspace";
import * as WorkspaceDevicesQueryTypes from "./graphql/queries/workspace/workspaceDevices";
import * as WorkspaceInvitationTypes from "./graphql/queries/workspace/workspaceInvitation";
import * as WorkspaceInvitationsTypes from "./graphql/queries/workspace/workspaceInvitations";
import * as WorkspacesQueryTypes from "./graphql/queries/workspace/workspaces";
import * as DateTypes from "./graphql/types/date";
import * as DocumentTypes from "./graphql/types/document";
import * as DocumentShareLinkTypes from "./graphql/types/documentShareLink";
import * as WorkspaceTypes from "./graphql/types/workspace";

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
    CreateDocumentShareLinkTypes,
    RemoveDocumentShareLinkTypes,

    DocumentShareLinkTypes,
    DocumentShareLinksQueryTypes,
    DocumentShareLinkQueryTypes,

    CreateFolderMutationTypes,
    UpdateFolderNameMutationTypes,
    RootFoldersQueryTypes,
    FoldersQueryTypes,
    DeleteFoldersMutationTypes,
    FolderQueryTypes,

    StartRegistrationTypes,
    FinishRegistrationTypes,
    VerifyRegistrationTypes,
    StartLoginTypes,
    FinishLoginTypes,
    MeQueryTypes,
    UserIdFromUsernameQueryTypes,
    VerifyPasswordTypes,
    LogoutTypes,

    DeleteWorkspacesMutationTypes,
    UpdateWorkspaceNameMutationTypes,
    UpdateWorkspaceMembersRolesMutationTypes,
    WorkspaceTypes,
    WorkspaceQueryTypes,
    WorkspacesQueryTypes,
    CreateWorkspaceInvitationTypes,
    AcceptWorkspaceInvitationTypes,
    WorkspaceInvitationsTypes,
    WorkspaceInvitationTypes,
    DeleteWorkspaceInvitationsTypes,
    CreateInitialWorkspaceStructureMutationTypes,
    PendingingWorkspaceInvitationQueryTypes,
    UnauthorizedMembersTypes,
    RemoveMembersAndRotateWorkspaceKeyMutationTypes,
    WorkspaceDevicesQueryTypes,
    ActiveWorkspaceKeysQueryTypes,

    InitiateFileUploadMutationTypes,
    FileUrlQueryTypes,

    DevicesQueryTypes,
    deviceBySigningPublicKeyQueryTypes,
    DeleteDevicesMutationTypes,
    MainDeviceQueryTypes,
    AttachDeviceToWorkspacesMutationTypes,
    UnauthorizedDevicesForWorkspacesTypes,
    AttachDevicesToWorkspacesMutationTypes,

    CreateCommentMutationTypes,
    DeleteCommentsMutationTypes,
  ],
  outputs: {
    schema: path.join(__dirname, "/generated/schema.graphql"),
    typegen: path.join(__dirname, "/generated/typings.ts"),
  },
});
