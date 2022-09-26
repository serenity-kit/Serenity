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

export type ActiveWorkspaceKeysResult = {
  __typename?: 'ActiveWorkspaceKeysResult';
  activeWorkspaceKeys: Array<WorkspaceKey>;
};

export type AttachDeviceToWorkspacesInput = {
  creatorDeviceSigningPublicKey: Scalars['String'];
  deviceWorkspaceKeyBoxes: Array<WorkspaceKeyBoxData>;
  receiverDeviceSigningPublicKey: Scalars['String'];
};

export type AttachDeviceToWorkspacesResult = {
  __typename?: 'AttachDeviceToWorkspacesResult';
  workspaceKeys: Array<WorkspaceKey>;
};

export type AttachDevicesToWorkspacesInput = {
  creatorDeviceSigningPublicKey: Scalars['String'];
  workspaceMemberDevices: Array<WorkspaceDevicePairingInput>;
};

export type AttachDevicesToWorkspacesResult = {
  __typename?: 'AttachDevicesToWorkspacesResult';
  workspaces: Array<WorkspaceWithWorkspaceKeys>;
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
  encryptedName: Scalars['String'];
  encryptedNameNonce: Scalars['String'];
  id: Scalars['String'];
  parentFolderId?: InputMaybe<Scalars['String']>;
  subkeyId: Scalars['Int'];
  workspaceId: Scalars['String'];
  workspaceKeyId: Scalars['String'];
};

export type CreateFolderResult = {
  __typename?: 'CreateFolderResult';
  folder?: Maybe<Folder>;
};

export type CreateInitialWorkspaceStructureInput = {
  creatorDeviceSigningPublicKey: Scalars['String'];
  deviceWorkspaceKeyBoxes: Array<DeviceWorkspaceKeyBoxInput>;
  documentId: Scalars['String'];
  documentSnapshot: DocumentSnapshotInput;
  documentSubkeyId: Scalars['Int'];
  encryptedDocumentName: Scalars['String'];
  encryptedDocumentNameNonce: Scalars['String'];
  encryptedFolderName: Scalars['String'];
  encryptedFolderNameNonce: Scalars['String'];
  folderId: Scalars['String'];
  folderIdSignature: Scalars['String'];
  folderSubkeyId: Scalars['Int'];
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

export type CreatorDevice = {
  __typename?: 'CreatorDevice';
  createdAt?: Maybe<Scalars['Date']>;
  encryptionPublicKey: Scalars['String'];
  encryptionPublicKeySignature: Scalars['String'];
  signingPublicKey: Scalars['String'];
};

export type DeleteDevicesInput = {
  creatorSigningPublicKey: Scalars['String'];
  deviceSigningPublicKeysToBeDeleted: Array<Scalars['String']>;
  newDeviceWorkspaceKeyBoxes: Array<WorkspaceWithWorkspaceDevicesParingInput>;
};

export type DeleteDevicesResult = {
  __typename?: 'DeleteDevicesResult';
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
  createdAt?: Maybe<Scalars['Date']>;
  encryptionPublicKey: Scalars['String'];
  encryptionPublicKeySignature: Scalars['String'];
  info?: Maybe<Scalars['String']>;
  signingPublicKey: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
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

export type DeviceWorkspaceKeyBoxInput = {
  ciphertext: Scalars['String'];
  deviceSigningPublicKey: Scalars['String'];
  nonce: Scalars['String'];
};

export type Document = {
  __typename?: 'Document';
  encryptedName?: Maybe<Scalars['String']>;
  encryptedNameNonce?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  parentFolderId?: Maybe<Scalars['String']>;
  rootFolderId?: Maybe<Scalars['String']>;
  subkeyId?: Maybe<Scalars['Int']>;
  workspaceId?: Maybe<Scalars['String']>;
  workspaceKey?: Maybe<WorkspaceKey>;
  workspaceKeyId?: Maybe<Scalars['String']>;
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
  deviceEncryptionPublicKey: Scalars['String'];
  deviceEncryptionPublicKeySignature: Scalars['String'];
  deviceInfo: Scalars['String'];
  deviceSigningPublicKey: Scalars['String'];
  deviceType: Scalars['String'];
  loginId: Scalars['String'];
  message: Scalars['String'];
  sessionTokenSignature: Scalars['String'];
};

export type FinishLoginResult = {
  __typename?: 'FinishLoginResult';
  expiresAt: Scalars['Date'];
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
  pendingWorkspaceInvitationId?: InputMaybe<Scalars['String']>;
  registrationId: Scalars['String'];
};

export type FinishRegistrationResult = {
  __typename?: 'FinishRegistrationResult';
  id: Scalars['String'];
  verificationCode: Scalars['String'];
};

export type Folder = {
  __typename?: 'Folder';
  encryptedName: Scalars['String'];
  encryptedNameNonce: Scalars['String'];
  id: Scalars['String'];
  parentFolderId?: Maybe<Scalars['String']>;
  rootFolderId?: Maybe<Scalars['String']>;
  subkeyId: Scalars['Int'];
  workspaceId?: Maybe<Scalars['String']>;
  workspaceKey?: Maybe<WorkspaceKey>;
  workspaceKeyId?: Maybe<Scalars['String']>;
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

export type GetWorkspaceDevicesResult = {
  __typename?: 'GetWorkspaceDevicesResult';
  devices: Array<Maybe<Device>>;
};

export type MainDeviceResult = {
  __typename?: 'MainDeviceResult';
  ciphertext: Scalars['String'];
  createdAt: Scalars['Date'];
  encryptionKeySalt: Scalars['String'];
  encryptionPublicKey: Scalars['String'];
  info?: Maybe<Scalars['String']>;
  nonce: Scalars['String'];
  signingPublicKey: Scalars['String'];
};

export type MeResult = {
  __typename?: 'MeResult';
  id: Scalars['String'];
  username: Scalars['String'];
  workspaceLoadingInfo?: Maybe<WorkspaceLoadingInfo>;
};


export type MeResultWorkspaceLoadingInfoArgs = {
  documentId?: InputMaybe<Scalars['ID']>;
  returnOtherDocumentIfNotFound?: InputMaybe<Scalars['Boolean']>;
  returnOtherWorkspaceIfNotFound?: InputMaybe<Scalars['Boolean']>;
  workspaceId?: InputMaybe<Scalars['ID']>;
};

export type MemberDeviceParingInput = {
  id: Scalars['String'];
  workspaceDevices: Array<WorkspaceDeviceInput>;
};

export type MemberWithWorkspaceKeyBoxes = {
  __typename?: 'MemberWithWorkspaceKeyBoxes';
  id: Scalars['String'];
  workspaceKeyBoxes: Array<WorkspaceKeyBox>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptWorkspaceInvitation?: Maybe<AcceptWorkspaceInvitationResult>;
  attachDeviceToWorkspaces?: Maybe<AttachDeviceToWorkspacesResult>;
  attachDevicesToWorkspaces?: Maybe<AttachDevicesToWorkspacesResult>;
  createDocument?: Maybe<CreateDocumentResult>;
  createFolder?: Maybe<CreateFolderResult>;
  createInitialWorkspaceStructure?: Maybe<CreateInitialWorkspaceStructureResult>;
  createWorkspaceInvitation?: Maybe<CreateWorkspaceInvitationResult>;
  deleteDevices?: Maybe<DeleteDevicesResult>;
  deleteDocuments?: Maybe<DeleteDocumentsResult>;
  deleteFolders?: Maybe<DeleteFoldersResult>;
  deleteWorkspaceInvitations?: Maybe<DeleteWorkspaceInvitationsResult>;
  deleteWorkspaces?: Maybe<DeleteWorkspacesResult>;
  finishLogin?: Maybe<FinishLoginResult>;
  finishRegistration?: Maybe<FinishRegistrationResult>;
  removeMembersAndRotateWorkspaceKey?: Maybe<RemoveMembersAndRotateWorkspaceKeyResult>;
  startLogin?: Maybe<StartLoginResult>;
  startRegistration?: Maybe<StartRegistrationResult>;
  updateDocumentName?: Maybe<UpdateDocumentNameResult>;
  updateFolderName?: Maybe<UpdateFolderNameResult>;
  updateWorkspace?: Maybe<UpdateWorkspaceResult>;
  verifyRegistration?: Maybe<VerifyRegistrationResult>;
};


export type MutationAcceptWorkspaceInvitationArgs = {
  input: AcceptWorkspaceInvitationInput;
};


export type MutationAttachDeviceToWorkspacesArgs = {
  input: AttachDeviceToWorkspacesInput;
};


export type MutationAttachDevicesToWorkspacesArgs = {
  input: AttachDevicesToWorkspacesInput;
};


export type MutationCreateDocumentArgs = {
  input: CreateDocumentInput;
};


export type MutationCreateFolderArgs = {
  input: CreateFolderInput;
};


export type MutationCreateInitialWorkspaceStructureArgs = {
  input: CreateInitialWorkspaceStructureInput;
};


export type MutationCreateWorkspaceInvitationArgs = {
  input: CreateWorkspaceInvitationInput;
};


export type MutationDeleteDevicesArgs = {
  input: DeleteDevicesInput;
};


export type MutationDeleteDocumentsArgs = {
  input: DeleteDocumentsInput;
};


export type MutationDeleteFoldersArgs = {
  input: DeleteFoldersInput;
};


export type MutationDeleteWorkspaceInvitationsArgs = {
  input: DeleteWorkspaceInvitationsInput;
};


export type MutationDeleteWorkspacesArgs = {
  input: DeleteWorkspacesInput;
};


export type MutationFinishLoginArgs = {
  input: FinishLoginInput;
};


export type MutationFinishRegistrationArgs = {
  input: FinishRegistrationInput;
};


export type MutationRemoveMembersAndRotateWorkspaceKeyArgs = {
  input: RemoveMembersAndRotateWorkspaceKeyInput;
};


export type MutationStartLoginArgs = {
  input: StartLoginInput;
};


export type MutationStartRegistrationArgs = {
  input: StartRegistrationInput;
};


export type MutationUpdateDocumentNameArgs = {
  input: UpdateDocumentNameInput;
};


export type MutationUpdateFolderNameArgs = {
  input: UpdateFolderNameInput;
};


export type MutationUpdateWorkspaceArgs = {
  input: UpdateWorkspaceInput;
};


export type MutationVerifyRegistrationArgs = {
  input: VerifyRegistrationInput;
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

export type PendingWorkspaceInvitationResult = {
  __typename?: 'PendingWorkspaceInvitationResult';
  id?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  activeWorkspaceKeys?: Maybe<ActiveWorkspaceKeysResult>;
  deviceBySigningPublicKey?: Maybe<DeviceResult>;
  devices?: Maybe<DeviceConnection>;
  document?: Maybe<Document>;
  documentPath?: Maybe<Array<Maybe<Folder>>>;
  documents?: Maybe<DocumentConnection>;
  firstDocument?: Maybe<Document>;
  folder?: Maybe<Folder>;
  folders?: Maybe<FolderConnection>;
  mainDevice?: Maybe<MainDeviceResult>;
  me?: Maybe<MeResult>;
  pendingWorkspaceInvitation?: Maybe<PendingWorkspaceInvitationResult>;
  rootFolders?: Maybe<FolderConnection>;
  unauthorizedDevicesForWorkspaces?: Maybe<UnauthorizedDeviceForWorkspacesResult>;
  unauthorizedMembers?: Maybe<UnauthorizedMembersResult>;
  userIdFromUsername?: Maybe<UserIdFromUsernameResult>;
  workspace?: Maybe<Workspace>;
  workspaceDevices?: Maybe<DeviceConnection>;
  workspaceInvitation?: Maybe<WorkspaceInvitation>;
  workspaceInvitations?: Maybe<WorkspaceInvitationConnection>;
  workspaces?: Maybe<WorkspaceConnection>;
};


export type QueryActiveWorkspaceKeysArgs = {
  deviceSigningPublicKey: Scalars['String'];
  workspaceId: Scalars['ID'];
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


export type QueryFolderArgs = {
  id: Scalars['ID'];
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


export type QueryUnauthorizedMembersArgs = {
  workspaceIds: Array<Scalars['ID']>;
};


export type QueryUserIdFromUsernameArgs = {
  username: Scalars['String'];
};


export type QueryWorkspaceArgs = {
  deviceSigningPublicKey: Scalars['String'];
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryWorkspaceDevicesArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  workspaceId: Scalars['ID'];
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
  deviceSigningPublicKey: Scalars['String'];
  first: Scalars['Int'];
};

export type RemoveMembersAndRotateWorkspaceKeyInput = {
  creatorDeviceSigningPublicKey: Scalars['String'];
  deviceWorkspaceKeyBoxes: Array<WorkspaceDeviceInput>;
  revokedUserIds: Array<Scalars['String']>;
  workspaceId: Scalars['String'];
};

export type RemoveMembersAndRotateWorkspaceKeyResult = {
  __typename?: 'RemoveMembersAndRotateWorkspaceKeyResult';
  workspaceKey: WorkspaceKey;
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

export type UnauthorizedDeviceForWorkspacesResult = {
  __typename?: 'UnauthorizedDeviceForWorkspacesResult';
  unauthorizedMemberDevices: Array<WorkspaceIdWithMemberDevices>;
};

export type UnauthorizedMembersResult = {
  __typename?: 'UnauthorizedMembersResult';
  userIds: Array<Maybe<Scalars['String']>>;
};

export type UpdateDocumentNameInput = {
  encryptedName: Scalars['String'];
  encryptedNameNonce: Scalars['String'];
  id: Scalars['String'];
  subkeyId: Scalars['Int'];
  workspaceKeyId: Scalars['String'];
};

export type UpdateDocumentNameResult = {
  __typename?: 'UpdateDocumentNameResult';
  document?: Maybe<Document>;
};

export type UpdateFolderNameInput = {
  encryptedName: Scalars['String'];
  encryptedNameNonce: Scalars['String'];
  id: Scalars['String'];
  subkeyId: Scalars['Int'];
  workspaceKeyId: Scalars['String'];
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
  currentWorkspaceKey?: Maybe<WorkspaceKey>;
  id: Scalars['String'];
  members?: Maybe<Array<WorkspaceMember>>;
  name?: Maybe<Scalars['String']>;
  workspaceKeys?: Maybe<Array<WorkspaceKey>>;
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

export type WorkspaceDeviceInput = {
  ciphertext: Scalars['String'];
  nonce: Scalars['String'];
  receiverDeviceSigningPublicKey: Scalars['String'];
};

export type WorkspaceDevicePairingInput = {
  id: Scalars['String'];
  members: Array<MemberDeviceParingInput>;
};

export type WorkspaceEdge = {
  __typename?: 'WorkspaceEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Workspace>;
};

export type WorkspaceIdWithDevices = {
  __typename?: 'WorkspaceIdWithDevices';
  devices: Array<Device>;
  id: Scalars['String'];
};

export type WorkspaceIdWithMemberDevices = {
  __typename?: 'WorkspaceIdWithMemberDevices';
  id: Scalars['String'];
  members: Array<WorkspaceIdWithDevices>;
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

export type WorkspaceKey = {
  __typename?: 'WorkspaceKey';
  generation: Scalars['Int'];
  id: Scalars['String'];
  workspaceId: Scalars['String'];
  workspaceKeyBox?: Maybe<WorkspaceKeyBox>;
  workspaceKeyBoxes?: Maybe<Array<WorkspaceKeyBox>>;
};

export type WorkspaceKeyBox = {
  __typename?: 'WorkspaceKeyBox';
  ciphertext: Scalars['String'];
  creatorDevice?: Maybe<CreatorDevice>;
  creatorDeviceSigningPublicKey: Scalars['String'];
  deviceSigningPublicKey: Scalars['String'];
  id: Scalars['String'];
  nonce: Scalars['String'];
  workspaceKeyId: Scalars['String'];
};

export type WorkspaceKeyBoxData = {
  ciphertext: Scalars['String'];
  nonce: Scalars['String'];
  workspaceId: Scalars['String'];
};

export type WorkspaceKeyWithMembers = {
  __typename?: 'WorkspaceKeyWithMembers';
  generation: Scalars['Int'];
  id: Scalars['String'];
  members: Array<MemberWithWorkspaceKeyBoxes>;
};

export type WorkspaceLoadingInfo = {
  __typename?: 'WorkspaceLoadingInfo';
  documentId?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  isAuthorized: Scalars['Boolean'];
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

export type WorkspaceWithWorkspaceDevicesParingInput = {
  id: Scalars['String'];
  workspaceDevices: Array<WorkspaceDeviceInput>;
};

export type WorkspaceWithWorkspaceKeys = {
  __typename?: 'WorkspaceWithWorkspaceKeys';
  id: Scalars['String'];
  workspaceKeys: Array<WorkspaceKeyWithMembers>;
};

export type AcceptWorkspaceInvitationMutationVariables = Exact<{
  input: AcceptWorkspaceInvitationInput;
}>;


export type AcceptWorkspaceInvitationMutation = { __typename?: 'Mutation', acceptWorkspaceInvitation?: { __typename?: 'AcceptWorkspaceInvitationResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, isAdmin: boolean }> | null } | null } | null };

export type AttachDeviceToWorkspacesMutationVariables = Exact<{
  input: AttachDeviceToWorkspacesInput;
}>;


export type AttachDeviceToWorkspacesMutation = { __typename?: 'Mutation', attachDeviceToWorkspaces?: { __typename?: 'AttachDeviceToWorkspacesResult', workspaceKeys: Array<{ __typename?: 'WorkspaceKey', id: string, generation: number, workspaceId: string, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, deviceSigningPublicKey: string, creatorDeviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null }> } | null };

export type AttachDevicesToWorkspacesMutationVariables = Exact<{
  input: AttachDevicesToWorkspacesInput;
}>;


export type AttachDevicesToWorkspacesMutation = { __typename?: 'Mutation', attachDevicesToWorkspaces?: { __typename?: 'AttachDevicesToWorkspacesResult', workspaces: Array<{ __typename?: 'WorkspaceWithWorkspaceKeys', id: string, workspaceKeys: Array<{ __typename?: 'WorkspaceKeyWithMembers', id: string, generation: number, members: Array<{ __typename?: 'MemberWithWorkspaceKeyBoxes', id: string, workspaceKeyBoxes: Array<{ __typename?: 'WorkspaceKeyBox', id: string, deviceSigningPublicKey: string, creatorDeviceSigningPublicKey: string, ciphertext: string, nonce: string }> }> }> }> } | null };

export type CreateDocumentMutationVariables = Exact<{
  input: CreateDocumentInput;
}>;


export type CreateDocumentMutation = { __typename?: 'Mutation', createDocument?: { __typename?: 'CreateDocumentResult', id: string } | null };

export type CreateFolderMutationVariables = Exact<{
  input: CreateFolderInput;
}>;


export type CreateFolderMutation = { __typename?: 'Mutation', createFolder?: { __typename?: 'CreateFolderResult', folder?: { __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, workspaceKeyId?: string | null, subkeyId: number, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null } | null };

export type CreateInitialWorkspaceStructureMutationVariables = Exact<{
  input: CreateInitialWorkspaceStructureInput;
}>;


export type CreateInitialWorkspaceStructureMutation = { __typename?: 'Mutation', createInitialWorkspaceStructure?: { __typename?: 'CreateInitialWorkspaceStructureResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, isAdmin: boolean }> | null, currentWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null } | null } | null, folder?: { __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, workspaceKeyId?: string | null, subkeyId: number, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null, document?: { __typename?: 'Document', id: string } | null } | null };

export type CreateWorkspaceInvitationMutationVariables = Exact<{
  input: CreateWorkspaceInvitationInput;
}>;


export type CreateWorkspaceInvitationMutation = { __typename?: 'Mutation', createWorkspaceInvitation?: { __typename?: 'CreateWorkspaceInvitationResult', workspaceInvitation?: { __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, expiresAt: any } | null } | null };

export type DeleteDevicesMutationVariables = Exact<{
  input: DeleteDevicesInput;
}>;


export type DeleteDevicesMutation = { __typename?: 'Mutation', deleteDevices?: { __typename?: 'DeleteDevicesResult', status: string } | null };

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


export type FinishLoginMutation = { __typename?: 'Mutation', finishLogin?: { __typename?: 'FinishLoginResult', expiresAt: any } | null };

export type FinishRegistrationMutationVariables = Exact<{
  input: FinishRegistrationInput;
}>;


export type FinishRegistrationMutation = { __typename?: 'Mutation', finishRegistration?: { __typename?: 'FinishRegistrationResult', id: string, verificationCode: string } | null };

export type RemoveMembersAndRotateWorkspaceKeyMutationVariables = Exact<{
  input: RemoveMembersAndRotateWorkspaceKeyInput;
}>;


export type RemoveMembersAndRotateWorkspaceKeyMutation = { __typename?: 'Mutation', removeMembersAndRotateWorkspaceKey?: { __typename?: 'RemoveMembersAndRotateWorkspaceKeyResult', workspaceKey: { __typename?: 'WorkspaceKey', id: string, generation: number, workspaceId: string, workspaceKeyBoxes?: Array<{ __typename?: 'WorkspaceKeyBox', id: string, deviceSigningPublicKey: string, creatorDeviceSigningPublicKey: string, ciphertext: string, nonce: string }> | null } } | null };

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


export type UpdateDocumentNameMutation = { __typename?: 'Mutation', updateDocumentName?: { __typename?: 'UpdateDocumentNameResult', document?: { __typename?: 'Document', id: string, encryptedName?: string | null, encryptedNameNonce?: string | null, workspaceKeyId?: string | null, subkeyId?: number | null, parentFolderId?: string | null, workspaceId?: string | null } | null } | null };

export type UpdateFolderNameMutationVariables = Exact<{
  input: UpdateFolderNameInput;
}>;


export type UpdateFolderNameMutation = { __typename?: 'Mutation', updateFolderName?: { __typename?: 'UpdateFolderNameResult', folder?: { __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, workspaceKeyId?: string | null, subkeyId: number, parentFolderId?: string | null, rootFolderId?: string | null } | null } | null };

export type UpdateWorkspaceMutationVariables = Exact<{
  input: UpdateWorkspaceInput;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace?: { __typename?: 'UpdateWorkspaceResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, isAdmin: boolean }> | null } | null } | null };

export type VerifyRegistrationMutationVariables = Exact<{
  input: VerifyRegistrationInput;
}>;


export type VerifyRegistrationMutation = { __typename?: 'Mutation', verifyRegistration?: { __typename?: 'VerifyRegistrationResult', id: string } | null };

export type DeviceBySigningPublicKeyQueryVariables = Exact<{
  signingPublicKey: Scalars['ID'];
}>;


export type DeviceBySigningPublicKeyQuery = { __typename?: 'Query', deviceBySigningPublicKey?: { __typename?: 'DeviceResult', device?: { __typename?: 'Device', userId?: string | null, signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, info?: string | null, createdAt?: any | null } | null } | null };

export type DevicesQueryVariables = Exact<{
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type DevicesQuery = { __typename?: 'Query', devices?: { __typename?: 'DeviceConnection', nodes?: Array<{ __typename?: 'Device', userId?: string | null, signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, info?: string | null, createdAt?: any | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type DocumentQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DocumentQuery = { __typename?: 'Query', document?: { __typename?: 'Document', id: string, encryptedName?: string | null, encryptedNameNonce?: string | null, workspaceKeyId?: string | null, subkeyId?: number | null, parentFolderId?: string | null, workspaceId?: string | null } | null };

export type DocumentPathQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DocumentPathQuery = { __typename?: 'Query', documentPath?: Array<{ __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, workspaceKeyId?: string | null, subkeyId: number, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null> | null };

export type DocumentsQueryVariables = Exact<{
  parentFolderId: Scalars['ID'];
  first?: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type DocumentsQuery = { __typename?: 'Query', documents?: { __typename?: 'DocumentConnection', nodes?: Array<{ __typename?: 'Document', id: string, encryptedName?: string | null, encryptedNameNonce?: string | null, workspaceKeyId?: string | null, subkeyId?: number | null, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type FirstDocumentQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type FirstDocumentQuery = { __typename?: 'Query', firstDocument?: { __typename?: 'Document', id: string } | null };

export type FolderQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type FolderQuery = { __typename?: 'Query', folder?: { __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, workspaceKeyId?: string | null, subkeyId: number, parentFolderId?: string | null, workspaceId?: string | null } | null };

export type FoldersQueryVariables = Exact<{
  parentFolderId: Scalars['ID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type FoldersQuery = { __typename?: 'Query', folders?: { __typename?: 'FolderConnection', nodes?: Array<{ __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, workspaceKeyId?: string | null, subkeyId: number, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type MainDeviceQueryVariables = Exact<{ [key: string]: never; }>;


export type MainDeviceQuery = { __typename?: 'Query', mainDevice?: { __typename?: 'MainDeviceResult', signingPublicKey: string, nonce: string, ciphertext: string, encryptionKeySalt: string, encryptionPublicKey: string, createdAt: any } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'MeResult', id: string, username: string } | null };

export type MeWithWorkspaceLoadingInfoQueryVariables = Exact<{
  workspaceId?: InputMaybe<Scalars['ID']>;
  documentId?: InputMaybe<Scalars['ID']>;
  returnOtherWorkspaceIfNotFound?: InputMaybe<Scalars['Boolean']>;
  returnOtherDocumentIfNotFound?: InputMaybe<Scalars['Boolean']>;
}>;


export type MeWithWorkspaceLoadingInfoQuery = { __typename?: 'Query', me?: { __typename?: 'MeResult', id: string, username: string, workspaceLoadingInfo?: { __typename?: 'WorkspaceLoadingInfo', id: string, isAuthorized: boolean, documentId?: string | null } | null } | null };

export type PendingWorkspaceInvitationQueryVariables = Exact<{ [key: string]: never; }>;


export type PendingWorkspaceInvitationQuery = { __typename?: 'Query', pendingWorkspaceInvitation?: { __typename?: 'PendingWorkspaceInvitationResult', id?: string | null } | null };

export type RootFoldersQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type RootFoldersQuery = { __typename?: 'Query', rootFolders?: { __typename?: 'FolderConnection', nodes?: Array<{ __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, workspaceKeyId?: string | null, subkeyId: number, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type UnauthorizedDevicesForWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type UnauthorizedDevicesForWorkspacesQuery = { __typename?: 'Query', unauthorizedDevicesForWorkspaces?: { __typename?: 'UnauthorizedDeviceForWorkspacesResult', unauthorizedMemberDevices: Array<{ __typename?: 'WorkspaceIdWithMemberDevices', id: string, members: Array<{ __typename?: 'WorkspaceIdWithDevices', id: string, devices: Array<{ __typename?: 'Device', userId?: string | null, signingPublicKey: string, encryptionPublicKey: string, info?: string | null, createdAt?: any | null, encryptionPublicKeySignature: string }> }> }> } | null };

export type UnauthorizedMembersQueryVariables = Exact<{
  workspaceIds: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type UnauthorizedMembersQuery = { __typename?: 'Query', unauthorizedMembers?: { __typename?: 'UnauthorizedMembersResult', userIds: Array<string | null> } | null };

export type UserIdFromUsernameQueryVariables = Exact<{
  username: Scalars['String'];
}>;


export type UserIdFromUsernameQuery = { __typename?: 'Query', userIdFromUsername?: { __typename?: 'UserIdFromUsernameResult', id: string } | null };

export type WorkspaceQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']>;
  deviceSigningPublicKey: Scalars['String'];
}>;


export type WorkspaceQuery = { __typename?: 'Query', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, isAdmin: boolean }> | null, currentWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null } | null } | null };

export type WorkspaceDevicesQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type WorkspaceDevicesQuery = { __typename?: 'Query', workspaceDevices?: { __typename?: 'DeviceConnection', nodes?: Array<{ __typename?: 'Device', userId?: string | null, signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, info?: string | null, createdAt?: any | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type WorkspaceInvitationQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type WorkspaceInvitationQuery = { __typename?: 'Query', workspaceInvitation?: { __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, inviterUserId: string, inviterUsername: string, workspaceName?: string | null, expiresAt: any } | null };

export type WorkspaceInvitationsQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type WorkspaceInvitationsQuery = { __typename?: 'Query', workspaceInvitations?: { __typename?: 'WorkspaceInvitationConnection', nodes?: Array<{ __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, inviterUserId: string, inviterUsername: string, expiresAt: any } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type WorkspacesQueryVariables = Exact<{
  deviceSigningPublicKey: Scalars['String'];
}>;


export type WorkspacesQuery = { __typename?: 'Query', workspaces?: { __typename?: 'WorkspaceConnection', nodes?: Array<{ __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, isAdmin: boolean }> | null, currentWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null } | null } | null> | null } | null };


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
export const AttachDeviceToWorkspacesDocument = gql`
    mutation attachDeviceToWorkspaces($input: AttachDeviceToWorkspacesInput!) {
  attachDeviceToWorkspaces(input: $input) {
    workspaceKeys {
      id
      generation
      workspaceId
      workspaceKeyBox {
        id
        deviceSigningPublicKey
        creatorDeviceSigningPublicKey
        ciphertext
        nonce
        creatorDevice {
          signingPublicKey
          encryptionPublicKey
        }
      }
    }
  }
}
    `;

export function useAttachDeviceToWorkspacesMutation() {
  return Urql.useMutation<AttachDeviceToWorkspacesMutation, AttachDeviceToWorkspacesMutationVariables>(AttachDeviceToWorkspacesDocument);
};
export const AttachDevicesToWorkspacesDocument = gql`
    mutation attachDevicesToWorkspaces($input: AttachDevicesToWorkspacesInput!) {
  attachDevicesToWorkspaces(input: $input) {
    workspaces {
      id
      workspaceKeys {
        id
        generation
        members {
          id
          workspaceKeyBoxes {
            id
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            nonce
          }
        }
      }
    }
  }
}
    `;

export function useAttachDevicesToWorkspacesMutation() {
  return Urql.useMutation<AttachDevicesToWorkspacesMutation, AttachDevicesToWorkspacesMutationVariables>(AttachDevicesToWorkspacesDocument);
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
      encryptedName
      encryptedNameNonce
      workspaceKeyId
      subkeyId
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
      currentWorkspaceKey {
        id
        workspaceId
        generation
        workspaceKeyBox {
          id
          workspaceKeyId
          deviceSigningPublicKey
          ciphertext
          creatorDevice {
            signingPublicKey
            encryptionPublicKey
          }
        }
      }
    }
    folder {
      id
      encryptedName
      encryptedNameNonce
      workspaceKeyId
      subkeyId
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
export const DeleteDevicesDocument = gql`
    mutation deleteDevices($input: DeleteDevicesInput!) {
  deleteDevices(input: $input) {
    status
  }
}
    `;

export function useDeleteDevicesMutation() {
  return Urql.useMutation<DeleteDevicesMutation, DeleteDevicesMutationVariables>(DeleteDevicesDocument);
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
    expiresAt
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
export const RemoveMembersAndRotateWorkspaceKeyDocument = gql`
    mutation removeMembersAndRotateWorkspaceKey($input: RemoveMembersAndRotateWorkspaceKeyInput!) {
  removeMembersAndRotateWorkspaceKey(input: $input) {
    workspaceKey {
      id
      generation
      workspaceId
      workspaceKeyBoxes {
        id
        deviceSigningPublicKey
        creatorDeviceSigningPublicKey
        ciphertext
        nonce
      }
    }
  }
}
    `;

export function useRemoveMembersAndRotateWorkspaceKeyMutation() {
  return Urql.useMutation<RemoveMembersAndRotateWorkspaceKeyMutation, RemoveMembersAndRotateWorkspaceKeyMutationVariables>(RemoveMembersAndRotateWorkspaceKeyDocument);
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
      encryptedName
      encryptedNameNonce
      workspaceKeyId
      subkeyId
      parentFolderId
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
      encryptedName
      encryptedNameNonce
      workspaceKeyId
      subkeyId
      parentFolderId
      rootFolderId
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
export const DeviceBySigningPublicKeyDocument = gql`
    query deviceBySigningPublicKey($signingPublicKey: ID!) {
  deviceBySigningPublicKey(signingPublicKey: $signingPublicKey) {
    device {
      userId
      signingPublicKey
      encryptionPublicKey
      encryptionPublicKeySignature
      info
      createdAt
    }
  }
}
    `;

export function useDeviceBySigningPublicKeyQuery(options: Omit<Urql.UseQueryArgs<DeviceBySigningPublicKeyQueryVariables>, 'query'>) {
  return Urql.useQuery<DeviceBySigningPublicKeyQuery, DeviceBySigningPublicKeyQueryVariables>({ query: DeviceBySigningPublicKeyDocument, ...options });
};
export const DevicesDocument = gql`
    query devices($first: Int!, $after: String) {
  devices(first: $first, after: $after) {
    nodes {
      userId
      signingPublicKey
      encryptionPublicKey
      encryptionPublicKeySignature
      info
      createdAt
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

export function useDevicesQuery(options: Omit<Urql.UseQueryArgs<DevicesQueryVariables>, 'query'>) {
  return Urql.useQuery<DevicesQuery, DevicesQueryVariables>({ query: DevicesDocument, ...options });
};
export const DocumentDocument = gql`
    query document($id: ID!) {
  document(id: $id) {
    id
    encryptedName
    encryptedNameNonce
    workspaceKeyId
    subkeyId
    parentFolderId
    workspaceId
  }
}
    `;

export function useDocumentQuery(options: Omit<Urql.UseQueryArgs<DocumentQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentQuery, DocumentQueryVariables>({ query: DocumentDocument, ...options });
};
export const DocumentPathDocument = gql`
    query documentPath($id: ID!) {
  documentPath(id: $id) {
    id
    encryptedName
    encryptedNameNonce
    workspaceKeyId
    subkeyId
    parentFolderId
    rootFolderId
    workspaceId
  }
}
    `;

export function useDocumentPathQuery(options: Omit<Urql.UseQueryArgs<DocumentPathQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentPathQuery, DocumentPathQueryVariables>({ query: DocumentPathDocument, ...options });
};
export const DocumentsDocument = gql`
    query documents($parentFolderId: ID!, $first: Int! = 100, $after: String) {
  documents(parentFolderId: $parentFolderId, first: $first, after: $after) {
    nodes {
      id
      encryptedName
      encryptedNameNonce
      workspaceKeyId
      subkeyId
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
  return Urql.useQuery<DocumentsQuery, DocumentsQueryVariables>({ query: DocumentsDocument, ...options });
};
export const FirstDocumentDocument = gql`
    query firstDocument($workspaceId: ID!) {
  firstDocument(workspaceId: $workspaceId) {
    id
  }
}
    `;

export function useFirstDocumentQuery(options: Omit<Urql.UseQueryArgs<FirstDocumentQueryVariables>, 'query'>) {
  return Urql.useQuery<FirstDocumentQuery, FirstDocumentQueryVariables>({ query: FirstDocumentDocument, ...options });
};
export const FolderDocument = gql`
    query folder($id: ID!) {
  folder(id: $id) {
    id
    encryptedName
    encryptedNameNonce
    workspaceKeyId
    subkeyId
    parentFolderId
    workspaceId
  }
}
    `;

export function useFolderQuery(options: Omit<Urql.UseQueryArgs<FolderQueryVariables>, 'query'>) {
  return Urql.useQuery<FolderQuery, FolderQueryVariables>({ query: FolderDocument, ...options });
};
export const FoldersDocument = gql`
    query folders($parentFolderId: ID!, $first: Int!, $after: String) {
  folders(parentFolderId: $parentFolderId, first: $first, after: $after) {
    nodes {
      id
      encryptedName
      encryptedNameNonce
      workspaceKeyId
      subkeyId
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
  return Urql.useQuery<FoldersQuery, FoldersQueryVariables>({ query: FoldersDocument, ...options });
};
export const MainDeviceDocument = gql`
    query mainDevice {
  mainDevice {
    signingPublicKey
    nonce
    ciphertext
    encryptionKeySalt
    encryptionPublicKey
    createdAt
  }
}
    `;

export function useMainDeviceQuery(options?: Omit<Urql.UseQueryArgs<MainDeviceQueryVariables>, 'query'>) {
  return Urql.useQuery<MainDeviceQuery, MainDeviceQueryVariables>({ query: MainDeviceDocument, ...options });
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
  return Urql.useQuery<MeQuery, MeQueryVariables>({ query: MeDocument, ...options });
};
export const MeWithWorkspaceLoadingInfoDocument = gql`
    query meWithWorkspaceLoadingInfo($workspaceId: ID, $documentId: ID, $returnOtherWorkspaceIfNotFound: Boolean, $returnOtherDocumentIfNotFound: Boolean) {
  me {
    id
    username
    workspaceLoadingInfo(
      workspaceId: $workspaceId
      returnOtherWorkspaceIfNotFound: $returnOtherWorkspaceIfNotFound
      documentId: $documentId
      returnOtherDocumentIfNotFound: $returnOtherDocumentIfNotFound
    ) {
      id
      isAuthorized
      documentId
    }
  }
}
    `;

export function useMeWithWorkspaceLoadingInfoQuery(options?: Omit<Urql.UseQueryArgs<MeWithWorkspaceLoadingInfoQueryVariables>, 'query'>) {
  return Urql.useQuery<MeWithWorkspaceLoadingInfoQuery, MeWithWorkspaceLoadingInfoQueryVariables>({ query: MeWithWorkspaceLoadingInfoDocument, ...options });
};
export const PendingWorkspaceInvitationDocument = gql`
    query pendingWorkspaceInvitation {
  pendingWorkspaceInvitation {
    id
  }
}
    `;

export function usePendingWorkspaceInvitationQuery(options?: Omit<Urql.UseQueryArgs<PendingWorkspaceInvitationQueryVariables>, 'query'>) {
  return Urql.useQuery<PendingWorkspaceInvitationQuery, PendingWorkspaceInvitationQueryVariables>({ query: PendingWorkspaceInvitationDocument, ...options });
};
export const RootFoldersDocument = gql`
    query rootFolders($workspaceId: ID!, $first: Int!, $after: String) {
  rootFolders(workspaceId: $workspaceId, first: $first, after: $after) {
    nodes {
      id
      encryptedName
      encryptedNameNonce
      workspaceKeyId
      subkeyId
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
  return Urql.useQuery<RootFoldersQuery, RootFoldersQueryVariables>({ query: RootFoldersDocument, ...options });
};
export const UnauthorizedDevicesForWorkspacesDocument = gql`
    query unauthorizedDevicesForWorkspaces {
  unauthorizedDevicesForWorkspaces {
    unauthorizedMemberDevices {
      id
      members {
        id
        devices {
          userId
          signingPublicKey
          encryptionPublicKey
          info
          createdAt
          encryptionPublicKeySignature
        }
      }
    }
  }
}
    `;

export function useUnauthorizedDevicesForWorkspacesQuery(options?: Omit<Urql.UseQueryArgs<UnauthorizedDevicesForWorkspacesQueryVariables>, 'query'>) {
  return Urql.useQuery<UnauthorizedDevicesForWorkspacesQuery, UnauthorizedDevicesForWorkspacesQueryVariables>({ query: UnauthorizedDevicesForWorkspacesDocument, ...options });
};
export const UnauthorizedMembersDocument = gql`
    query unauthorizedMembers($workspaceIds: [ID!]!) {
  unauthorizedMembers(workspaceIds: $workspaceIds) {
    userIds
  }
}
    `;

export function useUnauthorizedMembersQuery(options: Omit<Urql.UseQueryArgs<UnauthorizedMembersQueryVariables>, 'query'>) {
  return Urql.useQuery<UnauthorizedMembersQuery, UnauthorizedMembersQueryVariables>({ query: UnauthorizedMembersDocument, ...options });
};
export const UserIdFromUsernameDocument = gql`
    query userIdFromUsername($username: String!) {
  userIdFromUsername(username: $username) {
    id
  }
}
    `;

export function useUserIdFromUsernameQuery(options: Omit<Urql.UseQueryArgs<UserIdFromUsernameQueryVariables>, 'query'>) {
  return Urql.useQuery<UserIdFromUsernameQuery, UserIdFromUsernameQueryVariables>({ query: UserIdFromUsernameDocument, ...options });
};
export const WorkspaceDocument = gql`
    query workspace($id: ID, $deviceSigningPublicKey: String!) {
  workspace(id: $id, deviceSigningPublicKey: $deviceSigningPublicKey) {
    id
    name
    members {
      userId
      username
      isAdmin
    }
    currentWorkspaceKey {
      id
      workspaceId
      workspaceKeyBox {
        id
        workspaceKeyId
        deviceSigningPublicKey
        ciphertext
        nonce
        creatorDevice {
          signingPublicKey
          encryptionPublicKey
        }
      }
    }
  }
}
    `;

export function useWorkspaceQuery(options: Omit<Urql.UseQueryArgs<WorkspaceQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceQuery, WorkspaceQueryVariables>({ query: WorkspaceDocument, ...options });
};
export const WorkspaceDevicesDocument = gql`
    query workspaceDevices($workspaceId: ID!) {
  workspaceDevices(workspaceId: $workspaceId, first: 500) {
    nodes {
      userId
      signingPublicKey
      encryptionPublicKey
      encryptionPublicKeySignature
      info
      createdAt
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

export function useWorkspaceDevicesQuery(options: Omit<Urql.UseQueryArgs<WorkspaceDevicesQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceDevicesQuery, WorkspaceDevicesQueryVariables>({ query: WorkspaceDevicesDocument, ...options });
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
  return Urql.useQuery<WorkspaceInvitationQuery, WorkspaceInvitationQueryVariables>({ query: WorkspaceInvitationDocument, ...options });
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
  return Urql.useQuery<WorkspaceInvitationsQuery, WorkspaceInvitationsQueryVariables>({ query: WorkspaceInvitationsDocument, ...options });
};
export const WorkspacesDocument = gql`
    query workspaces($deviceSigningPublicKey: String!) {
  workspaces(first: 50, deviceSigningPublicKey: $deviceSigningPublicKey) {
    nodes {
      id
      name
      members {
        userId
        isAdmin
      }
      currentWorkspaceKey {
        id
        workspaceId
        workspaceKeyBox {
          id
          workspaceKeyId
          deviceSigningPublicKey
          ciphertext
          nonce
          creatorDevice {
            signingPublicKey
            encryptionPublicKey
          }
        }
      }
    }
  }
}
    `;

export function useWorkspacesQuery(options: Omit<Urql.UseQueryArgs<WorkspacesQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspacesQuery, WorkspacesQueryVariables>({ query: WorkspacesDocument, ...options });
};