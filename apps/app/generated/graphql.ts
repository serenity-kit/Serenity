import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type AcceptWorkspaceInvitationInput = {
  workspaceInvitationId: Scalars['String'];
};

export type AcceptWorkspaceInvitationResult = {
  __typename?: 'AcceptWorkspaceInvitationResult';
  workspace?: Maybe<Workspace>;
};

export type CreateDeviceInput = {
  encryptionPublicKey: Scalars['String'];
  encryptionPublicKeySignature: Scalars['String'];
  signingPublicKey: Scalars['String'];
};

export type CreateDeviceResult = {
  __typename?: 'CreateDeviceResult';
  device?: Maybe<Device>;
};

export type CreateDocumentInput = {
  id: Scalars['String'];
  parentFolderId?: InputMaybe<Scalars['String']>;
  workspaceId: Scalars['String'];
};

export type CreateDocumentResult = {
  __typename?: 'CreateDocumentResult';
  id: Scalars['String'];
};

export type CreateFolderInput = {
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  parentFolderId?: InputMaybe<Scalars['String']>;
  workspaceId: Scalars['String'];
};

export type CreateFolderResult = {
  __typename?: 'CreateFolderResult';
  folder?: Maybe<Folder>;
};

export type CreateInitialWorkspaceStructureInput = {
  documentId: Scalars['String'];
  documentName: Scalars['String'];
  documentSnapshot: DocumentSnapshotInput;
  folderId: Scalars['String'];
  folderIdSignature: Scalars['String'];
  folderName: Scalars['String'];
  workspaceId: Scalars['String'];
  workspaceName: Scalars['String'];
};

export type CreateInitialWorkspaceStructureResult = {
  __typename?: 'CreateInitialWorkspaceStructureResult';
  document?: Maybe<Document>;
  folder?: Maybe<Folder>;
  workspace?: Maybe<Workspace>;
};

export type CreateWorkspaceInvitationInput = {
  workspaceId: Scalars['String'];
};

export type CreateWorkspaceInvitationResult = {
  __typename?: 'CreateWorkspaceInvitationResult';
  workspaceInvitation?: Maybe<WorkspaceInvitation>;
};

export type DeleteDevicesInput = {
  signingPublicKeys: Array<Scalars['String']>;
};

export type DeleteDevicseResult = {
  __typename?: 'DeleteDevicseResult';
  status: Scalars['String'];
};

export type DeleteDocumentsInput = {
  ids: Array<Scalars['String']>;
};

export type DeleteDocumentsResult = {
  __typename?: 'DeleteDocumentsResult';
  status: Scalars['String'];
};

export type DeleteFoldersInput = {
  ids: Array<Scalars['String']>;
};

export type DeleteFoldersResult = {
  __typename?: 'DeleteFoldersResult';
  status: Scalars['String'];
};

export type DeleteWorkspaceInvitationsInput = {
  ids: Array<Scalars['String']>;
};

export type DeleteWorkspaceInvitationsResult = {
  __typename?: 'DeleteWorkspaceInvitationsResult';
  status: Scalars['String'];
};

export type DeleteWorkspacesInput = {
  ids: Array<Scalars['String']>;
};

export type DeleteWorkspacesResult = {
  __typename?: 'DeleteWorkspacesResult';
  status: Scalars['String'];
};

export type Device = {
  __typename?: 'Device';
  encryptionPublicKey: Scalars['String'];
  encryptionPublicKeySignature: Scalars['String'];
  signingPublicKey: Scalars['String'];
  userId: Scalars['String'];
};

export type DeviceConnection = {
  __typename?: 'DeviceConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<DeviceEdge>>>;
  /** Flattened list of Device type */
  nodes?: Maybe<Array<Maybe<Device>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type DeviceEdge = {
  __typename?: 'DeviceEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Device>;
};

export type DeviceResult = {
  __typename?: 'DeviceResult';
  device?: Maybe<Device>;
};

export type Document = {
  __typename?: 'Document';
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  parentFolderId?: Maybe<Scalars['String']>;
  rootFolderId?: Maybe<Scalars['String']>;
  workspaceId?: Maybe<Scalars['String']>;
};

export type DocumentConnection = {
  __typename?: 'DocumentConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<DocumentEdge>>>;
  /** Flattened list of Document type */
  nodes?: Maybe<Array<Maybe<Document>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type DocumentEdge = {
  __typename?: 'DocumentEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Document>;
};

export type DocumentSnapshotInput = {
  ciphertext: Scalars['String'];
  nonce: Scalars['String'];
  publicData: DocumentSnapshotPublicDataInput;
  signature: Scalars['String'];
};

export type DocumentSnapshotPublicDataInput = {
  docId: Scalars['String'];
  pubKey: Scalars['String'];
  snapshotId: Scalars['String'];
};

export type FinishLoginInput = {
  loginId: Scalars['String'];
  message: Scalars['String'];
};

export type FinishLoginResult = {
  __typename?: 'FinishLoginResult';
  mainDeviceSigningPublicKey: Scalars['String'];
  success?: Maybe<Scalars['Boolean']>;
};

export type FinishRegistrationDeviceInput = {
  ciphertext: Scalars['String'];
  encryptionKeySalt: Scalars['String'];
  encryptionPublicKey: Scalars['String'];
  encryptionPublicKeySignature: Scalars['String'];
  nonce: Scalars['String'];
  signingPublicKey: Scalars['String'];
};

export type FinishRegistrationInput = {
  mainDevice: FinishRegistrationDeviceInput;
  message: Scalars['String'];
  registrationId: Scalars['String'];
};

export type FinishRegistrationResult = {
  __typename?: 'FinishRegistrationResult';
  id: Scalars['String'];
  verificationCode: Scalars['String'];
};

export type Folder = {
  __typename?: 'Folder';
  id: Scalars['String'];
  name: Scalars['String'];
  parentFolderId?: Maybe<Scalars['String']>;
  rootFolderId?: Maybe<Scalars['String']>;
  workspaceId?: Maybe<Scalars['String']>;
};

export type FolderConnection = {
  __typename?: 'FolderConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<FolderEdge>>>;
  /** Flattened list of Folder type */
  nodes?: Maybe<Array<Maybe<Folder>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type FolderEdge = {
  __typename?: 'FolderEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Folder>;
};

export type MainDeviceResult = {
  __typename?: 'MainDeviceResult';
  ciphertext: Scalars['String'];
  encryptionKeySalt: Scalars['String'];
  encryptionPublicKey: Scalars['String'];
  nonce: Scalars['String'];
  signingPublicKey: Scalars['String'];
};

export type MeResult = {
  __typename?: 'MeResult';
  id: Scalars['String'];
  username: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptWorkspaceInvitation?: Maybe<AcceptWorkspaceInvitationResult>;
  createDevice?: Maybe<CreateDeviceResult>;
  createDocument?: Maybe<CreateDocumentResult>;
  createFolder?: Maybe<CreateFolderResult>;
  createInitialWorkspaceStructure?: Maybe<CreateInitialWorkspaceStructureResult>;
  createWorkspaceInvitation?: Maybe<CreateWorkspaceInvitationResult>;
  deleteDevices?: Maybe<DeleteDevicseResult>;
  deleteDocuments?: Maybe<DeleteDocumentsResult>;
  deleteFolders?: Maybe<DeleteFoldersResult>;
  deleteWorkspaceInvitations?: Maybe<DeleteWorkspaceInvitationsResult>;
  deleteWorkspaces?: Maybe<DeleteWorkspacesResult>;
  finishLogin?: Maybe<FinishLoginResult>;
  finishRegistration?: Maybe<FinishRegistrationResult>;
  startLogin?: Maybe<StartLoginResult>;
  startRegistration?: Maybe<StartRegistrationResult>;
  updateDocumentName?: Maybe<UpdateDocumentNameResult>;
  updateFolderName?: Maybe<UpdateFolderNameResult>;
  updateWorkspace?: Maybe<UpdateWorkspaceResult>;
  verifyRegistration?: Maybe<VerifyRegistrationResult>;
};


export type MutationAcceptWorkspaceInvitationArgs = {
  input?: InputMaybe<AcceptWorkspaceInvitationInput>;
};


export type MutationCreateDeviceArgs = {
  input?: InputMaybe<CreateDeviceInput>;
};


export type MutationCreateDocumentArgs = {
  input?: InputMaybe<CreateDocumentInput>;
};


export type MutationCreateFolderArgs = {
  input?: InputMaybe<CreateFolderInput>;
};


export type MutationCreateInitialWorkspaceStructureArgs = {
  input?: InputMaybe<CreateInitialWorkspaceStructureInput>;
};


export type MutationCreateWorkspaceInvitationArgs = {
  input?: InputMaybe<CreateWorkspaceInvitationInput>;
};


export type MutationDeleteDevicesArgs = {
  input?: InputMaybe<DeleteDevicesInput>;
};


export type MutationDeleteDocumentsArgs = {
  input?: InputMaybe<DeleteDocumentsInput>;
};


export type MutationDeleteFoldersArgs = {
  input?: InputMaybe<DeleteFoldersInput>;
};


export type MutationDeleteWorkspaceInvitationsArgs = {
  input?: InputMaybe<DeleteWorkspaceInvitationsInput>;
};


export type MutationDeleteWorkspacesArgs = {
  input?: InputMaybe<DeleteWorkspacesInput>;
};


export type MutationFinishLoginArgs = {
  input?: InputMaybe<FinishLoginInput>;
};


export type MutationFinishRegistrationArgs = {
  input?: InputMaybe<FinishRegistrationInput>;
};


export type MutationStartLoginArgs = {
  input?: InputMaybe<StartLoginInput>;
};


export type MutationStartRegistrationArgs = {
  input?: InputMaybe<StartRegistrationInput>;
};


export type MutationUpdateDocumentNameArgs = {
  input?: InputMaybe<UpdateDocumentNameInput>;
};


export type MutationUpdateFolderNameArgs = {
  input?: InputMaybe<UpdateFolderNameInput>;
};


export type MutationUpdateWorkspaceArgs = {
  input?: InputMaybe<UpdateWorkspaceInput>;
};


export type MutationVerifyRegistrationArgs = {
  input?: InputMaybe<VerifyRegistrationInput>;
};

/** PageInfo cursor, as defined in https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** The cursor corresponding to the last nodes in edges. Null if the connection is empty. */
  endCursor?: Maybe<Scalars['String']>;
  /** Used to indicate whether more edges exist following the set defined by the clients arguments. */
  hasNextPage: Scalars['Boolean'];
  /** Used to indicate whether more edges exist prior to the set defined by the clients arguments. */
  hasPreviousPage: Scalars['Boolean'];
  /** The cursor corresponding to the first nodes in edges. Null if the connection is empty. */
  startCursor?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  deviceBySigningPublicKey?: Maybe<DeviceResult>;
  devices?: Maybe<DeviceConnection>;
  document?: Maybe<Document>;
  documentPath?: Maybe<Array<Maybe<Folder>>>;
  documents?: Maybe<DocumentConnection>;
  firstDocument?: Maybe<Document>;
  folders?: Maybe<FolderConnection>;
  mainDevice?: Maybe<MainDeviceResult>;
  me?: Maybe<MeResult>;
  rootFolders?: Maybe<FolderConnection>;
  userIdFromUsername?: Maybe<UserIdFromUsernameResult>;
  workspace?: Maybe<Workspace>;
  workspaceInvitation?: Maybe<WorkspaceInvitation>;
  workspaceInvitations?: Maybe<WorkspaceInvitationConnection>;
  workspaces?: Maybe<WorkspaceConnection>;
};


export type QueryDeviceBySigningPublicKeyArgs = {
  signingPublicKey: Scalars['ID'];
};


export type QueryDevicesArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
};


export type QueryDocumentArgs = {
  id: Scalars['ID'];
};


export type QueryDocumentPathArgs = {
  id: Scalars['ID'];
};


export type QueryDocumentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  parentFolderId: Scalars['ID'];
};


export type QueryFirstDocumentArgs = {
  workspaceId: Scalars['ID'];
};


export type QueryFoldersArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  parentFolderId: Scalars['ID'];
};


export type QueryRootFoldersArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  workspaceId: Scalars['ID'];
};


export type QueryUserIdFromUsernameArgs = {
  username: Scalars['String'];
};


export type QueryWorkspaceArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryWorkspaceInvitationArgs = {
  id: Scalars['ID'];
};


export type QueryWorkspaceInvitationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  workspaceId: Scalars['ID'];
};


export type QueryWorkspacesArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
};

export type StartLoginInput = {
  challenge: Scalars['String'];
  username: Scalars['String'];
};

export type StartLoginResult = {
  __typename?: 'StartLoginResult';
  challengeResponse: Scalars['String'];
  loginId: Scalars['String'];
};

export type StartRegistrationInput = {
  challenge: Scalars['String'];
  username: Scalars['String'];
};

export type StartRegistrationResult = {
  __typename?: 'StartRegistrationResult';
  challengeResponse: Scalars['String'];
  registrationId: Scalars['String'];
};

export type UpdateDocumentNameInput = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type UpdateDocumentNameResult = {
  __typename?: 'UpdateDocumentNameResult';
  document?: Maybe<Document>;
};

export type UpdateFolderNameInput = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type UpdateFolderNameResult = {
  __typename?: 'UpdateFolderNameResult';
  folder?: Maybe<Folder>;
};

export type UpdateWorkspaceInput = {
  id: Scalars['String'];
  members?: InputMaybe<Array<WorkspaceMemberInput>>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateWorkspaceResult = {
  __typename?: 'UpdateWorkspaceResult';
  workspace?: Maybe<Workspace>;
};

export type UserIdFromUsernameResult = {
  __typename?: 'UserIdFromUsernameResult';
  id: Scalars['String'];
};

export type VerifyRegistrationInput = {
  username: Scalars['String'];
  verificationCode: Scalars['String'];
};

export type VerifyRegistrationResult = {
  __typename?: 'VerifyRegistrationResult';
  id: Scalars['String'];
};

export type Workspace = {
  __typename?: 'Workspace';
  id: Scalars['String'];
  members?: Maybe<Array<WorkspaceMember>>;
  name?: Maybe<Scalars['String']>;
};

export type WorkspaceConnection = {
  __typename?: 'WorkspaceConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<WorkspaceEdge>>>;
  /** Flattened list of Workspace type */
  nodes?: Maybe<Array<Maybe<Workspace>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type WorkspaceEdge = {
  __typename?: 'WorkspaceEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Workspace>;
};

export type WorkspaceInput = {
  id: Scalars['String'];
  name: Scalars['String'];
  sharing?: InputMaybe<Array<InputMaybe<WorkspaceMemberInput>>>;
};

export type WorkspaceInvitation = {
  __typename?: 'WorkspaceInvitation';
  expiresAt: Scalars['Date'];
  id: Scalars['String'];
  inviterUserId: Scalars['String'];
  inviterUsername: Scalars['String'];
  workspaceId: Scalars['String'];
  workspaceName?: Maybe<Scalars['String']>;
};

export type WorkspaceInvitationConnection = {
  __typename?: 'WorkspaceInvitationConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<WorkspaceInvitationEdge>>>;
  /** Flattened list of WorkspaceInvitation type */
  nodes?: Maybe<Array<Maybe<WorkspaceInvitation>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type WorkspaceInvitationEdge = {
  __typename?: 'WorkspaceInvitationEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<WorkspaceInvitation>;
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  isAdmin: Scalars['Boolean'];
  userId: Scalars['String'];
  username?: Maybe<Scalars['String']>;
};

export type WorkspaceMemberInput = {
  isAdmin: Scalars['Boolean'];
  userId: Scalars['String'];
};

export type AcceptWorkspaceInvitationMutationVariables = Exact<{
  input: AcceptWorkspaceInvitationInput;
}>;


export type AcceptWorkspaceInvitationMutation = { __typename?: 'Mutation', acceptWorkspaceInvitation?: { __typename?: 'AcceptWorkspaceInvitationResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, isAdmin: boolean }> | null } | null } | null };

export type CreateDeviceMutationVariables = Exact<{
  input: CreateDeviceInput;
}>;


export type CreateDeviceMutation = { __typename?: 'Mutation', createDevice?: { __typename?: 'CreateDeviceResult', device?: { __typename?: 'Device', userId: string, signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string } | null } | null };

export type CreateDocumentMutationVariables = Exact<{
  input: CreateDocumentInput;
}>;


export type CreateDocumentMutation = { __typename?: 'Mutation', createDocument?: { __typename?: 'CreateDocumentResult', id: string } | null };

export type CreateFolderMutationVariables = Exact<{
  input: CreateFolderInput;
}>;


export type CreateFolderMutation = { __typename?: 'Mutation', createFolder?: { __typename?: 'CreateFolderResult', folder?: { __typename?: 'Folder', id: string, name: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null } | null };

export type CreateInitialWorkspaceStructureMutationVariables = Exact<{
  input: CreateInitialWorkspaceStructureInput;
}>;


export type CreateInitialWorkspaceStructureMutation = { __typename?: 'Mutation', createInitialWorkspaceStructure?: { __typename?: 'CreateInitialWorkspaceStructureResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, isAdmin: boolean }> | null } | null, folder?: { __typename?: 'Folder', id: string, name: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null, document?: { __typename?: 'Document', id: string } | null } | null };

export type CreateWorkspaceInvitationMutationVariables = Exact<{
  input: CreateWorkspaceInvitationInput;
}>;


export type CreateWorkspaceInvitationMutation = { __typename?: 'Mutation', createWorkspaceInvitation?: { __typename?: 'CreateWorkspaceInvitationResult', workspaceInvitation?: { __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, expiresAt: any } | null } | null };

export type DeleteDocumentsMutationVariables = Exact<{
  input: DeleteDocumentsInput;
}>;


export type DeleteDocumentsMutation = { __typename?: 'Mutation', deleteDocuments?: { __typename?: 'DeleteDocumentsResult', status: string } | null };

export type DeleteFoldersMutationVariables = Exact<{
  input: DeleteFoldersInput;
}>;


export type DeleteFoldersMutation = { __typename?: 'Mutation', deleteFolders?: { __typename?: 'DeleteFoldersResult', status: string } | null };

export type DeleteWorkspaceInvitationsMutationVariables = Exact<{
  input: DeleteWorkspaceInvitationsInput;
}>;


export type DeleteWorkspaceInvitationsMutation = { __typename?: 'Mutation', deleteWorkspaceInvitations?: { __typename?: 'DeleteWorkspaceInvitationsResult', status: string } | null };

export type DeleteWorkspacesMutationVariables = Exact<{
  input: DeleteWorkspacesInput;
}>;


export type DeleteWorkspacesMutation = { __typename?: 'Mutation', deleteWorkspaces?: { __typename?: 'DeleteWorkspacesResult', status: string } | null };

export type FinishLoginMutationVariables = Exact<{
  input: FinishLoginInput;
}>;


export type FinishLoginMutation = { __typename?: 'Mutation', finishLogin?: { __typename?: 'FinishLoginResult', success?: boolean | null, mainDeviceSigningPublicKey: string } | null };

export type FinishRegistrationMutationVariables = Exact<{
  input: FinishRegistrationInput;
}>;


export type FinishRegistrationMutation = { __typename?: 'Mutation', finishRegistration?: { __typename?: 'FinishRegistrationResult', id: string, verificationCode: string } | null };

export type StartLoginMutationVariables = Exact<{
  input: StartLoginInput;
}>;


export type StartLoginMutation = { __typename?: 'Mutation', startLogin?: { __typename?: 'StartLoginResult', challengeResponse: string, loginId: string } | null };

export type StartRegistrationMutationVariables = Exact<{
  input: StartRegistrationInput;
}>;


export type StartRegistrationMutation = { __typename?: 'Mutation', startRegistration?: { __typename?: 'StartRegistrationResult', challengeResponse: string, registrationId: string } | null };

export type UpdateDocumentNameMutationVariables = Exact<{
  input: UpdateDocumentNameInput;
}>;


export type UpdateDocumentNameMutation = { __typename?: 'Mutation', updateDocumentName?: { __typename?: 'UpdateDocumentNameResult', document?: { __typename?: 'Document', id: string, name?: string | null, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null } | null };

export type UpdateFolderNameMutationVariables = Exact<{
  input: UpdateFolderNameInput;
}>;


export type UpdateFolderNameMutation = { __typename?: 'Mutation', updateFolderName?: { __typename?: 'UpdateFolderNameResult', folder?: { __typename?: 'Folder', id: string, name: string } | null } | null };

export type UpdateWorkspaceMutationVariables = Exact<{
  input: UpdateWorkspaceInput;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace?: { __typename?: 'UpdateWorkspaceResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, isAdmin: boolean }> | null } | null } | null };

export type VerifyRegistrationMutationVariables = Exact<{
  input: VerifyRegistrationInput;
}>;


export type VerifyRegistrationMutation = { __typename?: 'Mutation', verifyRegistration?: { __typename?: 'VerifyRegistrationResult', id: string } | null };

export type DocumentQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DocumentQuery = { __typename?: 'Query', document?: { __typename?: 'Document', id: string, name?: string | null, parentFolderId?: string | null, workspaceId?: string | null } | null };

export type DocumentPathQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DocumentPathQuery = { __typename?: 'Query', documentPath?: Array<{ __typename?: 'Folder', id: string, name: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null> | null };

export type DocumentsQueryVariables = Exact<{
  parentFolderId: Scalars['ID'];
  first?: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type DocumentsQuery = { __typename?: 'Query', documents?: { __typename?: 'DocumentConnection', nodes?: Array<{ __typename?: 'Document', id: string, name?: string | null, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type FirstDocumentQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type FirstDocumentQuery = { __typename?: 'Query', firstDocument?: { __typename?: 'Document', id: string } | null };

export type FoldersQueryVariables = Exact<{
  parentFolderId: Scalars['ID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type FoldersQuery = { __typename?: 'Query', folders?: { __typename?: 'FolderConnection', nodes?: Array<{ __typename?: 'Folder', id: string, name: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type MainDeviceQueryVariables = Exact<{ [key: string]: never; }>;


export type MainDeviceQuery = { __typename?: 'Query', mainDevice?: { __typename?: 'MainDeviceResult', signingPublicKey: string, nonce: string, ciphertext: string, encryptionKeySalt: string, encryptionPublicKey: string } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'MeResult', id: string, username: string } | null };

export type RootFoldersQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type RootFoldersQuery = { __typename?: 'Query', rootFolders?: { __typename?: 'FolderConnection', nodes?: Array<{ __typename?: 'Folder', id: string, name: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type UserIdFromUsernameQueryVariables = Exact<{
  username: Scalars['String'];
}>;


export type UserIdFromUsernameQuery = { __typename?: 'Query', userIdFromUsername?: { __typename?: 'UserIdFromUsernameResult', id: string } | null };

export type WorkspaceQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']>;
}>;


export type WorkspaceQuery = { __typename?: 'Query', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, isAdmin: boolean }> | null } | null };

export type WorkspaceInvitationQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type WorkspaceInvitationQuery = { __typename?: 'Query', workspaceInvitation?: { __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, inviterUserId: string, inviterUsername: string, workspaceName?: string | null, expiresAt: any } | null };

export type WorkspaceInvitationsQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type WorkspaceInvitationsQuery = { __typename?: 'Query', workspaceInvitations?: { __typename?: 'WorkspaceInvitationConnection', nodes?: Array<{ __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, inviterUserId: string, inviterUsername: string, expiresAt: any } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type WorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkspacesQuery = { __typename?: 'Query', workspaces?: { __typename?: 'WorkspaceConnection', nodes?: Array<{ __typename?: 'Workspace', id: string, name?: string | null } | null> | null } | null };


export const AcceptWorkspaceInvitationDocument = gql`
    mutation acceptWorkspaceInvitation($input: AcceptWorkspaceInvitationInput!) {
  acceptWorkspaceInvitation(input: $input) {
    workspace {
      id
      name
      members {
        userId
        username
        isAdmin
      }
    }
  }
}
    `;

export function useAcceptWorkspaceInvitationMutation() {
  return Urql.useMutation<AcceptWorkspaceInvitationMutation, AcceptWorkspaceInvitationMutationVariables>(AcceptWorkspaceInvitationDocument);
};
export const CreateDeviceDocument = gql`
    mutation createDevice($input: CreateDeviceInput!) {
  createDevice(input: $input) {
    device {
      userId
      signingPublicKey
      encryptionPublicKey
      encryptionPublicKeySignature
    }
  }
}
    `;

export function useCreateDeviceMutation() {
  return Urql.useMutation<CreateDeviceMutation, CreateDeviceMutationVariables>(CreateDeviceDocument);
};
export const CreateDocumentDocument = gql`
    mutation createDocument($input: CreateDocumentInput!) {
  createDocument(input: $input) {
    id
  }
}
    `;

export function useCreateDocumentMutation() {
  return Urql.useMutation<CreateDocumentMutation, CreateDocumentMutationVariables>(CreateDocumentDocument);
};
export const CreateFolderDocument = gql`
    mutation createFolder($input: CreateFolderInput!) {
  createFolder(input: $input) {
    folder {
      id
      name
      parentFolderId
      rootFolderId
      workspaceId
    }
  }
}
    `;

export function useCreateFolderMutation() {
  return Urql.useMutation<CreateFolderMutation, CreateFolderMutationVariables>(CreateFolderDocument);
};
export const CreateInitialWorkspaceStructureDocument = gql`
    mutation createInitialWorkspaceStructure($input: CreateInitialWorkspaceStructureInput!) {
  createInitialWorkspaceStructure(input: $input) {
    workspace {
      id
      name
      members {
        userId
        isAdmin
      }
    }
    folder {
      id
      name
      parentFolderId
      rootFolderId
      workspaceId
    }
    document {
      id
    }
  }
}
    `;

export function useCreateInitialWorkspaceStructureMutation() {
  return Urql.useMutation<CreateInitialWorkspaceStructureMutation, CreateInitialWorkspaceStructureMutationVariables>(CreateInitialWorkspaceStructureDocument);
};
export const CreateWorkspaceInvitationDocument = gql`
    mutation createWorkspaceInvitation($input: CreateWorkspaceInvitationInput!) {
  createWorkspaceInvitation(input: $input) {
    workspaceInvitation {
      id
      workspaceId
      expiresAt
    }
  }
}
    `;

export function useCreateWorkspaceInvitationMutation() {
  return Urql.useMutation<CreateWorkspaceInvitationMutation, CreateWorkspaceInvitationMutationVariables>(CreateWorkspaceInvitationDocument);
};
export const DeleteDocumentsDocument = gql`
    mutation deleteDocuments($input: DeleteDocumentsInput!) {
  deleteDocuments(input: $input) {
    status
  }
}
    `;

export function useDeleteDocumentsMutation() {
  return Urql.useMutation<DeleteDocumentsMutation, DeleteDocumentsMutationVariables>(DeleteDocumentsDocument);
};
export const DeleteFoldersDocument = gql`
    mutation deleteFolders($input: DeleteFoldersInput!) {
  deleteFolders(input: $input) {
    status
  }
}
    `;

export function useDeleteFoldersMutation() {
  return Urql.useMutation<DeleteFoldersMutation, DeleteFoldersMutationVariables>(DeleteFoldersDocument);
};
export const DeleteWorkspaceInvitationsDocument = gql`
    mutation deleteWorkspaceInvitations($input: DeleteWorkspaceInvitationsInput!) {
  deleteWorkspaceInvitations(input: $input) {
    status
  }
}
    `;

export function useDeleteWorkspaceInvitationsMutation() {
  return Urql.useMutation<DeleteWorkspaceInvitationsMutation, DeleteWorkspaceInvitationsMutationVariables>(DeleteWorkspaceInvitationsDocument);
};
export const DeleteWorkspacesDocument = gql`
    mutation deleteWorkspaces($input: DeleteWorkspacesInput!) {
  deleteWorkspaces(input: $input) {
    status
  }
}
    `;

export function useDeleteWorkspacesMutation() {
  return Urql.useMutation<DeleteWorkspacesMutation, DeleteWorkspacesMutationVariables>(DeleteWorkspacesDocument);
};
export const FinishLoginDocument = gql`
    mutation finishLogin($input: FinishLoginInput!) {
  finishLogin(input: $input) {
    success
    mainDeviceSigningPublicKey
  }
}
    `;

export function useFinishLoginMutation() {
  return Urql.useMutation<FinishLoginMutation, FinishLoginMutationVariables>(FinishLoginDocument);
};
export const FinishRegistrationDocument = gql`
    mutation finishRegistration($input: FinishRegistrationInput!) {
  finishRegistration(input: $input) {
    id
    verificationCode
  }
}
    `;

export function useFinishRegistrationMutation() {
  return Urql.useMutation<FinishRegistrationMutation, FinishRegistrationMutationVariables>(FinishRegistrationDocument);
};
export const StartLoginDocument = gql`
    mutation startLogin($input: StartLoginInput!) {
  startLogin(input: $input) {
    challengeResponse
    loginId
  }
}
    `;

export function useStartLoginMutation() {
  return Urql.useMutation<StartLoginMutation, StartLoginMutationVariables>(StartLoginDocument);
};
export const StartRegistrationDocument = gql`
    mutation startRegistration($input: StartRegistrationInput!) {
  startRegistration(input: $input) {
    challengeResponse
    registrationId
  }
}
    `;

export function useStartRegistrationMutation() {
  return Urql.useMutation<StartRegistrationMutation, StartRegistrationMutationVariables>(StartRegistrationDocument);
};
export const UpdateDocumentNameDocument = gql`
    mutation updateDocumentName($input: UpdateDocumentNameInput!) {
  updateDocumentName(input: $input) {
    document {
      id
      name
      parentFolderId
      rootFolderId
      workspaceId
    }
  }
}
    `;

export function useUpdateDocumentNameMutation() {
  return Urql.useMutation<UpdateDocumentNameMutation, UpdateDocumentNameMutationVariables>(UpdateDocumentNameDocument);
};
export const UpdateFolderNameDocument = gql`
    mutation updateFolderName($input: UpdateFolderNameInput!) {
  updateFolderName(input: $input) {
    folder {
      id
      name
    }
  }
}
    `;

export function useUpdateFolderNameMutation() {
  return Urql.useMutation<UpdateFolderNameMutation, UpdateFolderNameMutationVariables>(UpdateFolderNameDocument);
};
export const UpdateWorkspaceDocument = gql`
    mutation updateWorkspace($input: UpdateWorkspaceInput!) {
  updateWorkspace(input: $input) {
    workspace {
      id
      name
      members {
        userId
        username
        isAdmin
      }
    }
  }
}
    `;

export function useUpdateWorkspaceMutation() {
  return Urql.useMutation<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>(UpdateWorkspaceDocument);
};
export const VerifyRegistrationDocument = gql`
    mutation verifyRegistration($input: VerifyRegistrationInput!) {
  verifyRegistration(input: $input) {
    id
  }
}
    `;

export function useVerifyRegistrationMutation() {
  return Urql.useMutation<VerifyRegistrationMutation, VerifyRegistrationMutationVariables>(VerifyRegistrationDocument);
};
export const DocumentDocument = gql`
    query document($id: ID!) {
  document(id: $id) {
    id
    name
    parentFolderId
    workspaceId
  }
}
    `;

export function useDocumentQuery(options: Omit<Urql.UseQueryArgs<DocumentQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentQuery>({ query: DocumentDocument, ...options });
};
export const DocumentPathDocument = gql`
    query documentPath($id: ID!) {
  documentPath(id: $id) {
    id
    name
    parentFolderId
    rootFolderId
    workspaceId
  }
}
    `;

export function useDocumentPathQuery(options: Omit<Urql.UseQueryArgs<DocumentPathQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentPathQuery>({ query: DocumentPathDocument, ...options });
};
export const DocumentsDocument = gql`
    query documents($parentFolderId: ID!, $first: Int! = 100, $after: String) {
  documents(parentFolderId: $parentFolderId, first: $first, after: $after) {
    nodes {
      id
      name
      parentFolderId
      rootFolderId
      workspaceId
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
    `;

export function useDocumentsQuery(options: Omit<Urql.UseQueryArgs<DocumentsQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentsQuery>({ query: DocumentsDocument, ...options });
};
export const FirstDocumentDocument = gql`
    query firstDocument($workspaceId: ID!) {
  firstDocument(workspaceId: $workspaceId) {
    id
  }
}
    `;

export function useFirstDocumentQuery(options: Omit<Urql.UseQueryArgs<FirstDocumentQueryVariables>, 'query'>) {
  return Urql.useQuery<FirstDocumentQuery>({ query: FirstDocumentDocument, ...options });
};
export const FoldersDocument = gql`
    query folders($parentFolderId: ID!, $first: Int!, $after: String) {
  folders(parentFolderId: $parentFolderId, first: $first, after: $after) {
    nodes {
      id
      name
      parentFolderId
      rootFolderId
      workspaceId
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

export function useFoldersQuery(options: Omit<Urql.UseQueryArgs<FoldersQueryVariables>, 'query'>) {
  return Urql.useQuery<FoldersQuery>({ query: FoldersDocument, ...options });
};
export const MainDeviceDocument = gql`
    query mainDevice {
  mainDevice {
    signingPublicKey
    nonce
    ciphertext
    encryptionKeySalt
    encryptionPublicKey
  }
}
    `;

export function useMainDeviceQuery(options?: Omit<Urql.UseQueryArgs<MainDeviceQueryVariables>, 'query'>) {
  return Urql.useQuery<MainDeviceQuery>({ query: MainDeviceDocument, ...options });
};
export const MeDocument = gql`
    query me {
  me {
    id
    username
  }
}
    `;

export function useMeQuery(options?: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'>) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
};
export const RootFoldersDocument = gql`
    query rootFolders($workspaceId: ID!, $first: Int!, $after: String) {
  rootFolders(workspaceId: $workspaceId, first: $first, after: $after) {
    nodes {
      id
      name
      parentFolderId
      rootFolderId
      workspaceId
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

export function useRootFoldersQuery(options: Omit<Urql.UseQueryArgs<RootFoldersQueryVariables>, 'query'>) {
  return Urql.useQuery<RootFoldersQuery>({ query: RootFoldersDocument, ...options });
};
export const UserIdFromUsernameDocument = gql`
    query userIdFromUsername($username: String!) {
  userIdFromUsername(username: $username) {
    id
  }
}
    `;

export function useUserIdFromUsernameQuery(options: Omit<Urql.UseQueryArgs<UserIdFromUsernameQueryVariables>, 'query'>) {
  return Urql.useQuery<UserIdFromUsernameQuery>({ query: UserIdFromUsernameDocument, ...options });
};
export const WorkspaceDocument = gql`
    query workspace($id: ID) {
  workspace(id: $id) {
    id
    name
    members {
      userId
      username
      isAdmin
    }
  }
}
    `;

export function useWorkspaceQuery(options?: Omit<Urql.UseQueryArgs<WorkspaceQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceQuery>({ query: WorkspaceDocument, ...options });
};
export const WorkspaceInvitationDocument = gql`
    query workspaceInvitation($id: ID!) {
  workspaceInvitation(id: $id) {
    id
    workspaceId
    inviterUserId
    inviterUsername
    workspaceName
    expiresAt
  }
}
    `;

export function useWorkspaceInvitationQuery(options: Omit<Urql.UseQueryArgs<WorkspaceInvitationQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceInvitationQuery>({ query: WorkspaceInvitationDocument, ...options });
};
export const WorkspaceInvitationsDocument = gql`
    query workspaceInvitations($workspaceId: ID!) {
  workspaceInvitations(workspaceId: $workspaceId, first: 50) {
    nodes {
      id
      workspaceId
      inviterUserId
      inviterUsername
      expiresAt
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

export function useWorkspaceInvitationsQuery(options: Omit<Urql.UseQueryArgs<WorkspaceInvitationsQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceInvitationsQuery>({ query: WorkspaceInvitationsDocument, ...options });
};
export const WorkspacesDocument = gql`
    query workspaces {
  workspaces(first: 50) {
    nodes {
      id
      name
    }
  }
}
    `;

export function useWorkspacesQuery(options?: Omit<Urql.UseQueryArgs<WorkspacesQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspacesQuery>({ query: WorkspacesDocument, ...options });
};