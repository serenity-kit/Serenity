import { getUrqlClient } from '../utils/urqlClient/urqlClient';
import canonicalize from 'canonicalize';
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
  inviteeMainDevice: ReducedDeviceInput;
  inviteeUsername: Scalars['String'];
  inviteeUsernameAndDeviceSignature: Scalars['String'];
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

export type Comment = {
  __typename?: 'Comment';
  commentReplies?: Maybe<Array<Maybe<CommentReply>>>;
  contentCiphertext: Scalars['String'];
  contentNonce: Scalars['String'];
  createdAt: Scalars['Date'];
  creatorDevice: CreatorDevice;
  documentId: Scalars['String'];
  id: Scalars['String'];
  keyDerivationTrace: KeyDerivationTrace2;
};

export type CommentConnection = {
  __typename?: 'CommentConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<CommentEdge>>>;
  /** Flattened list of Comment type */
  nodes?: Maybe<Array<Maybe<Comment>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type CommentEdge = {
  __typename?: 'CommentEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Comment>;
};

export type CommentReply = {
  __typename?: 'CommentReply';
  commentId: Scalars['String'];
  contentCiphertext: Scalars['String'];
  contentNonce: Scalars['String'];
  createdAt: Scalars['Date'];
  creatorDevice: CreatorDevice;
  documentId: Scalars['String'];
  id: Scalars['String'];
  keyDerivationTrace: KeyDerivationTrace2;
};

export type CreateCommentInput = {
  contentCiphertext: Scalars['String'];
  contentNonce: Scalars['String'];
  documentId: Scalars['String'];
  keyDerivationTrace: KeyDerivationTraceInput2;
};

export type CreateCommentReplyInput = {
  commentId: Scalars['String'];
  contentCiphertext: Scalars['String'];
  contentNonce: Scalars['String'];
  documentId: Scalars['String'];
  keyDerivationTrace: KeyDerivationTraceInput2;
};

export type CreateCommentReplyResult = {
  __typename?: 'CreateCommentReplyResult';
  commentReply?: Maybe<CommentReply>;
};

export type CreateCommentResult = {
  __typename?: 'CreateCommentResult';
  comment?: Maybe<Comment>;
};

export type CreateDocumentInput = {
  id: Scalars['String'];
  nameKeyDerivationTrace?: InputMaybe<KeyDerivationTraceInput>;
  parentFolderId: Scalars['String'];
  workspaceId: Scalars['String'];
};

export type CreateDocumentResult = {
  __typename?: 'CreateDocumentResult';
  id: Scalars['String'];
};

export type CreateDocumentShareLinkInput = {
  creatorDeviceSigningPublicKey: Scalars['String'];
  deviceEncryptionPublicKey: Scalars['String'];
  deviceEncryptionPublicKeySignature: Scalars['String'];
  deviceSecretBoxCiphertext: Scalars['String'];
  deviceSecretBoxNonce: Scalars['String'];
  deviceSigningPublicKey: Scalars['String'];
  documentId: Scalars['String'];
  sharingRole: Role;
  snapshotDeviceKeyBox: SnapshotDeviceKeyBoxInput;
};

export type CreateDocumentShareLinkResult = {
  __typename?: 'CreateDocumentShareLinkResult';
  token: Scalars['String'];
};

export type CreateFolderInput = {
  encryptedName: Scalars['String'];
  encryptedNameNonce: Scalars['String'];
  id: Scalars['String'];
  keyDerivationTrace: KeyDerivationTraceInput;
  parentFolderId?: InputMaybe<Scalars['String']>;
  subkeyId: Scalars['Int'];
  workspaceId: Scalars['String'];
  workspaceKeyId: Scalars['String'];
};

export type CreateFolderResult = {
  __typename?: 'CreateFolderResult';
  folder?: Maybe<Folder>;
};

export type CreateInitialDocumentInput = {
  encryptedName: Scalars['String'];
  encryptedNameNonce: Scalars['String'];
  id: Scalars['String'];
  nameKeyDerivationTrace: KeyDerivationTraceInput;
  snapshot: DocumentSnapshotInput;
};

export type CreateInitialFolderInput = {
  encryptedName: Scalars['String'];
  encryptedNameNonce: Scalars['String'];
  id: Scalars['String'];
  idSignature: Scalars['String'];
  keyDerivationTrace: KeyDerivationTraceInput;
};

export type CreateInitialWorkspaceInput = {
  deviceWorkspaceKeyBoxes: Array<DeviceWorkspaceKeyBoxInput>;
  id: Scalars['String'];
  name: Scalars['String'];
  workspaceKeyId: Scalars['String'];
};

export type CreateInitialWorkspaceStructureInput = {
  creatorDeviceSigningPublicKey: Scalars['String'];
  document: CreateInitialDocumentInput;
  folder: CreateInitialFolderInput;
  workspace: CreateInitialWorkspaceInput;
};

export type CreateInitialWorkspaceStructureResult = {
  __typename?: 'CreateInitialWorkspaceStructureResult';
  document?: Maybe<Document>;
  folder?: Maybe<Folder>;
  workspace?: Maybe<Workspace>;
};

export type CreateWorkspaceInvitationInput = {
  expiresAt: Scalars['Date'];
  invitationDataSignature: Scalars['String'];
  invitationId: Scalars['String'];
  invitationSigningPublicKey: Scalars['String'];
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

export type DeleteCommentRepliesInput = {
  commentReplyIds: Array<Scalars['String']>;
};

export type DeleteCommentRepliesResult = {
  __typename?: 'DeleteCommentRepliesResult';
  status: Scalars['String'];
};

export type DeleteCommentsInput = {
  commentIds: Array<Scalars['String']>;
};

export type DeleteCommentsResult = {
  __typename?: 'DeleteCommentsResult';
  status: Scalars['String'];
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
  workspaceId: Scalars['String'];
};

export type DeleteDocumentsResult = {
  __typename?: 'DeleteDocumentsResult';
  status: Scalars['String'];
};

export type DeleteFoldersInput = {
  ids: Array<Scalars['String']>;
  workspaceId: Scalars['String'];
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

export type DeviceWithRecentSession = {
  __typename?: 'DeviceWithRecentSession';
  createdAt?: Maybe<Scalars['Date']>;
  encryptionPublicKey: Scalars['String'];
  encryptionPublicKeySignature: Scalars['String'];
  info?: Maybe<Scalars['String']>;
  mostRecentSession?: Maybe<Session>;
  signingPublicKey: Scalars['String'];
  userId?: Maybe<Scalars['String']>;
};

export type DeviceWithRecentSessionConnection = {
  __typename?: 'DeviceWithRecentSessionConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<DeviceWithRecentSessionEdge>>>;
  /** Flattened list of DeviceWithRecentSession type */
  nodes?: Maybe<Array<Maybe<DeviceWithRecentSession>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type DeviceWithRecentSessionEdge = {
  __typename?: 'DeviceWithRecentSessionEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<DeviceWithRecentSession>;
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
  nameKeyDerivationTrace: KeyDerivationTrace;
  parentFolderId?: Maybe<Scalars['String']>;
  rootFolderId?: Maybe<Scalars['String']>;
  workspaceId?: Maybe<Scalars['String']>;
  workspaceKey?: Maybe<WorkspaceKey>;
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

export type DocumentShareLink = {
  __typename?: 'DocumentShareLink';
  deviceEncryptionPublicKey: Scalars['String'];
  deviceEncryptionPublicKeySignature: Scalars['String'];
  deviceSecretBoxCiphertext: Scalars['String'];
  deviceSecretBoxNonce: Scalars['String'];
  deviceSigningPublicKey: Scalars['String'];
  snapshotKeyBoxs?: Maybe<Array<SnapshotKeyBox>>;
  token: Scalars['String'];
};

export type DocumentShareLinkConnection = {
  __typename?: 'DocumentShareLinkConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<DocumentShareLinkEdge>>>;
  /** Flattened list of DocumentShareLink type */
  nodes?: Maybe<Array<Maybe<DocumentShareLink>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type DocumentShareLinkEdge = {
  __typename?: 'DocumentShareLinkEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<DocumentShareLink>;
};

export type DocumentSnapshotInput = {
  ciphertext: Scalars['String'];
  nonce: Scalars['String'];
  publicData: DocumentSnapshotPublicDataInput;
  signature: Scalars['String'];
};

export type DocumentSnapshotPublicDataInput = {
  docId: Scalars['String'];
  keyDerivationTrace: KeyDerivationTraceInput;
  pubKey: Scalars['String'];
  snapshotId?: InputMaybe<Scalars['String']>;
  subkeyId?: InputMaybe<Scalars['Int']>;
};

export type File = {
  __typename?: 'File';
  downloadUrl: Scalars['String'];
  id: Scalars['String'];
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
  pendingWorkspaceInvitationKeyCiphertext?: InputMaybe<Scalars['String']>;
  pendingWorkspaceInvitationKeyEncryptionSalt?: InputMaybe<Scalars['String']>;
  pendingWorkspaceInvitationKeyPublicNonce?: InputMaybe<Scalars['String']>;
  pendingWorkspaceInvitationKeySubkeyId?: InputMaybe<Scalars['Int']>;
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
  keyDerivationTrace: KeyDerivationTrace;
  parentFolderId?: Maybe<Scalars['String']>;
  rootFolderId?: Maybe<Scalars['String']>;
  workspaceId?: Maybe<Scalars['String']>;
  workspaceKey?: Maybe<WorkspaceKey>;
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
  devices: Array<Device>;
};

export type InitiateFileUploadInput = {
  documentId: Scalars['String'];
  workspaceId: Scalars['String'];
};

export type InitiateFileUploadResult = {
  __typename?: 'InitiateFileUploadResult';
  fileId: Scalars['String'];
  uploadUrl: Scalars['String'];
};

export type KeyDerivationTrace = {
  __typename?: 'KeyDerivationTrace';
  parentFolders: Array<KeyDerivationTraceParentFolder>;
  subkeyId: Scalars['Int'];
  workspaceKeyId: Scalars['String'];
};

export type KeyDerivationTrace2 = {
  __typename?: 'KeyDerivationTrace2';
  trace: Array<KeyDerivationTraceEntry>;
  workspaceKeyId: Scalars['String'];
};

export type KeyDerivationTraceEntry = {
  __typename?: 'KeyDerivationTraceEntry';
  context: Scalars['String'];
  entryId: Scalars['String'];
  parentId?: Maybe<Scalars['String']>;
  subkeyId: Scalars['Int'];
};

export type KeyDerivationTraceEntryInput = {
  context: Scalars['String'];
  entryId: Scalars['String'];
  parentId?: InputMaybe<Scalars['String']>;
  subkeyId: Scalars['Int'];
};

export type KeyDerivationTraceInput = {
  parentFolders: Array<KeyDerivationTraceParentFolderInput>;
  subkeyId: Scalars['Int'];
  workspaceKeyId: Scalars['String'];
};

export type KeyDerivationTraceInput2 = {
  trace: Array<KeyDerivationTraceEntryInput>;
  workspaceKeyId: Scalars['String'];
};

export type KeyDerivationTraceParentFolder = {
  __typename?: 'KeyDerivationTraceParentFolder';
  folderId: Scalars['String'];
  parentFolderId?: Maybe<Scalars['String']>;
  subkeyId: Scalars['Int'];
};

export type KeyDerivationTraceParentFolderInput = {
  folderId: Scalars['String'];
  parentFolderId?: InputMaybe<Scalars['String']>;
  subkeyId: Scalars['Int'];
};

export type LogoutResult = {
  __typename?: 'LogoutResult';
  success: Scalars['Boolean'];
};

export type MainDeviceResult = {
  __typename?: 'MainDeviceResult';
  ciphertext: Scalars['String'];
  createdAt: Scalars['Date'];
  encryptionKeySalt: Scalars['String'];
  encryptionPublicKey: Scalars['String'];
  encryptionPublicKeySignature: Scalars['String'];
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
  createComment?: Maybe<CreateCommentResult>;
  createCommentReply?: Maybe<CreateCommentReplyResult>;
  createDocument?: Maybe<CreateDocumentResult>;
  createDocumentShareLink?: Maybe<CreateDocumentShareLinkResult>;
  createFolder?: Maybe<CreateFolderResult>;
  createInitialWorkspaceStructure?: Maybe<CreateInitialWorkspaceStructureResult>;
  createWorkspaceInvitation?: Maybe<CreateWorkspaceInvitationResult>;
  deleteCommentReplies?: Maybe<DeleteCommentRepliesResult>;
  deleteComments?: Maybe<DeleteCommentsResult>;
  deleteDevices?: Maybe<DeleteDevicesResult>;
  deleteDocuments?: Maybe<DeleteDocumentsResult>;
  deleteFolders?: Maybe<DeleteFoldersResult>;
  deleteWorkspaceInvitations?: Maybe<DeleteWorkspaceInvitationsResult>;
  deleteWorkspaces?: Maybe<DeleteWorkspacesResult>;
  finishLogin?: Maybe<FinishLoginResult>;
  finishRegistration?: Maybe<FinishRegistrationResult>;
  initiateFileUpload?: Maybe<InitiateFileUploadResult>;
  logout?: Maybe<LogoutResult>;
  removeDocumentShareLink?: Maybe<RemoveDocumentShareLinkResult>;
  removeMembersAndRotateWorkspaceKey?: Maybe<RemoveMembersAndRotateWorkspaceKeyResult>;
  startLogin?: Maybe<StartLoginResult>;
  startRegistration?: Maybe<StartRegistrationResult>;
  updateDocumentName?: Maybe<UpdateDocumentNameResult>;
  updateFolderName?: Maybe<UpdateFolderNameResult>;
  updateWorkspaceMembersRoles?: Maybe<UpdateWorkspaceMembersRolesResult>;
  updateWorkspaceName?: Maybe<UpdateWorkspaceNameResult>;
  verifyPassword?: Maybe<VerifyLoginResult>;
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


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationCreateCommentReplyArgs = {
  input: CreateCommentReplyInput;
};


export type MutationCreateDocumentArgs = {
  input: CreateDocumentInput;
};


export type MutationCreateDocumentShareLinkArgs = {
  input: CreateDocumentShareLinkInput;
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


export type MutationDeleteCommentRepliesArgs = {
  input: DeleteCommentRepliesInput;
};


export type MutationDeleteCommentsArgs = {
  input: DeleteCommentsInput;
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


export type MutationInitiateFileUploadArgs = {
  input: InitiateFileUploadInput;
};


export type MutationRemoveDocumentShareLinkArgs = {
  input: RemoveDocumentShareLinkInput;
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


export type MutationUpdateWorkspaceMembersRolesArgs = {
  input: UpdateWorkspaceMembersRolesInput;
};


export type MutationUpdateWorkspaceNameArgs = {
  input: UpdateWorkspaceNameInput;
};


export type MutationVerifyPasswordArgs = {
  input: VerifyPasswordInput;
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
  ciphertext?: Maybe<Scalars['String']>;
  encryptionKeySalt?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  publicNonce?: Maybe<Scalars['String']>;
  subkeyId?: Maybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  activeWorkspaceKeys?: Maybe<ActiveWorkspaceKeysResult>;
  commentsByDocumentId?: Maybe<CommentConnection>;
  deviceBySigningPublicKey?: Maybe<DeviceResult>;
  devices?: Maybe<DeviceWithRecentSessionConnection>;
  document?: Maybe<Document>;
  documentPath?: Maybe<Array<Maybe<Folder>>>;
  documentShareLink?: Maybe<DocumentShareLink>;
  documentShareLinks?: Maybe<DocumentShareLinkConnection>;
  documents?: Maybe<DocumentConnection>;
  fileUrl?: Maybe<File>;
  firstDocument?: Maybe<Document>;
  folder?: Maybe<Folder>;
  folders?: Maybe<FolderConnection>;
  mainDevice?: Maybe<MainDeviceResult>;
  me?: Maybe<MeResult>;
  pendingWorkspaceInvitation?: Maybe<PendingWorkspaceInvitationResult>;
  rootFolders?: Maybe<FolderConnection>;
  unauthorizedDevicesForWorkspaces?: Maybe<UnauthorizedDevicesForWorkspacesResult>;
  unauthorizedMembers?: Maybe<UnauthorizedMembersResult>;
  userIdFromUsername?: Maybe<UserIdFromUsernameResult>;
  workspace?: Maybe<Workspace>;
  workspaceDevices?: Maybe<DeviceConnection>;
  workspaceInvitation?: Maybe<WorkspaceInvitation>;
  workspaceInvitations?: Maybe<WorkspaceInvitationConnection>;
  workspaceKeyByDocumentId?: Maybe<WorkspaceKeyByDocumentIdResult>;
  workspaces?: Maybe<WorkspaceConnection>;
};


export type QueryActiveWorkspaceKeysArgs = {
  deviceSigningPublicKey: Scalars['String'];
  workspaceId: Scalars['ID'];
};


export type QueryCommentsByDocumentIdArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  documentId: Scalars['ID'];
  documentShareLinkToken?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryDeviceBySigningPublicKeyArgs = {
  signingPublicKey: Scalars['ID'];
};


export type QueryDevicesArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  hasNonExpiredSession: Scalars['Boolean'];
};


export type QueryDocumentArgs = {
  id: Scalars['ID'];
};


export type QueryDocumentPathArgs = {
  id: Scalars['ID'];
};


export type QueryDocumentShareLinkArgs = {
  token: Scalars['ID'];
};


export type QueryDocumentShareLinksArgs = {
  after?: InputMaybe<Scalars['String']>;
  documentId: Scalars['ID'];
  first: Scalars['Int'];
};


export type QueryDocumentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  parentFolderId: Scalars['ID'];
  usingOldKeys?: InputMaybe<Scalars['Boolean']>;
};


export type QueryFileUrlArgs = {
  documentId: Scalars['ID'];
  fileId: Scalars['ID'];
  workspaceId: Scalars['ID'];
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
  usingOldKeys?: InputMaybe<Scalars['Boolean']>;
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


export type QueryWorkspaceKeyByDocumentIdArgs = {
  deviceSigningPublicKey: Scalars['String'];
  documentId: Scalars['ID'];
};


export type QueryWorkspacesArgs = {
  after?: InputMaybe<Scalars['String']>;
  deviceSigningPublicKey: Scalars['String'];
  first: Scalars['Int'];
};

export type ReducedDeviceInput = {
  encryptionPublicKey: Scalars['String'];
  encryptionPublicKeySignature: Scalars['String'];
  signingPublicKey: Scalars['String'];
  userId: Scalars['String'];
};

export type RemoveDocumentShareLinkInput = {
  token: Scalars['String'];
};

export type RemoveDocumentShareLinkResult = {
  __typename?: 'RemoveDocumentShareLinkResult';
  success: Scalars['Boolean'];
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

export enum Role {
  Admin = 'ADMIN',
  Commenter = 'COMMENTER',
  Editor = 'EDITOR',
  Viewer = 'VIEWER'
}

export type Session = {
  __typename?: 'Session';
  expiresAt: Scalars['Date'];
};

export type SnapshotDeviceKeyBoxInput = {
  ciphertext: Scalars['String'];
  deviceSigningPublicKey: Scalars['String'];
  nonce: Scalars['String'];
};

export type SnapshotKeyBox = {
  __typename?: 'SnapshotKeyBox';
  ciphertext: Scalars['String'];
  creatorDevice: CreatorDevice;
  creatorDeviceSigningPublicKey: Scalars['String'];
  deviceSigningPublicKey: Scalars['String'];
  id: Scalars['String'];
  nonce: Scalars['String'];
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

export type UnauthorizedDevicesForWorkspacesResult = {
  __typename?: 'UnauthorizedDevicesForWorkspacesResult';
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
  nameKeyDerivationTrace: KeyDerivationTraceInput;
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
  keyDerivationTrace: KeyDerivationTraceInput;
  subkeyId: Scalars['Int'];
  workspaceKeyId: Scalars['String'];
};

export type UpdateFolderNameResult = {
  __typename?: 'UpdateFolderNameResult';
  folder?: Maybe<Folder>;
};

export type UpdateWorkspaceMembersRolesInput = {
  id: Scalars['String'];
  members: Array<WorkspaceMemberInput>;
};

export type UpdateWorkspaceMembersRolesResult = {
  __typename?: 'UpdateWorkspaceMembersRolesResult';
  workspace?: Maybe<Workspace>;
};

export type UpdateWorkspaceNameInput = {
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateWorkspaceNameResult = {
  __typename?: 'UpdateWorkspaceNameResult';
  workspace?: Maybe<Workspace>;
};

export type UserIdFromUsernameResult = {
  __typename?: 'UserIdFromUsernameResult';
  id: Scalars['String'];
};

export type VerifyLoginResult = {
  __typename?: 'VerifyLoginResult';
  isValid?: Maybe<Scalars['Boolean']>;
};

export type VerifyPasswordInput = {
  deviceSigningPublicKey: Scalars['String'];
  loginId: Scalars['String'];
  message: Scalars['String'];
  sessionTokenSignature: Scalars['String'];
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
  idSignature?: Maybe<Scalars['String']>;
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
  workspaceKeysMembers: Array<WorkspaceKeyDeviceInput>;
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
  workspaceId: Scalars['String'];
  workspaceKeyDevicePairs: Array<WorkspaceKeyDevicePair>;
};

export type WorkspaceKeyByDocumentIdResult = {
  __typename?: 'WorkspaceKeyByDocumentIdResult';
  nameWorkspaceKey: WorkspaceKey;
};

export type WorkspaceKeyDeviceInput = {
  id: Scalars['String'];
  members: Array<MemberDeviceParingInput>;
};

export type WorkspaceKeyDevicePair = {
  ciphertext: Scalars['String'];
  nonce: Scalars['String'];
  workspaceKeyId: Scalars['String'];
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
  role: Role;
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  role: Role;
  userId: Scalars['String'];
  username?: Maybe<Scalars['String']>;
};

export type WorkspaceMemberInput = {
  role: Role;
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


export type AcceptWorkspaceInvitationMutation = { __typename?: 'Mutation', acceptWorkspaceInvitation?: { __typename?: 'AcceptWorkspaceInvitationResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, role: Role }> | null } | null } | null };

export type AttachDeviceToWorkspacesMutationVariables = Exact<{
  input: AttachDeviceToWorkspacesInput;
}>;


export type AttachDeviceToWorkspacesMutation = { __typename?: 'Mutation', attachDeviceToWorkspaces?: { __typename?: 'AttachDeviceToWorkspacesResult', workspaceKeys: Array<{ __typename?: 'WorkspaceKey', id: string, generation: number, workspaceId: string, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, deviceSigningPublicKey: string, creatorDeviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null }> } | null };

export type AttachDevicesToWorkspacesMutationVariables = Exact<{
  input: AttachDevicesToWorkspacesInput;
}>;


export type AttachDevicesToWorkspacesMutation = { __typename?: 'Mutation', attachDevicesToWorkspaces?: { __typename?: 'AttachDevicesToWorkspacesResult', workspaces: Array<{ __typename?: 'WorkspaceWithWorkspaceKeys', id: string, workspaceKeys: Array<{ __typename?: 'WorkspaceKeyWithMembers', id: string, generation: number, members: Array<{ __typename?: 'MemberWithWorkspaceKeyBoxes', id: string, workspaceKeyBoxes: Array<{ __typename?: 'WorkspaceKeyBox', id: string, deviceSigningPublicKey: string, creatorDeviceSigningPublicKey: string, ciphertext: string, nonce: string }> }> }> }> } | null };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment?: { __typename?: 'CreateCommentResult', comment?: { __typename?: 'Comment', id: string, documentId: string, contentCiphertext: string, contentNonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, createdAt?: any | null } } | null } | null };

export type CreateDocumentMutationVariables = Exact<{
  input: CreateDocumentInput;
}>;


export type CreateDocumentMutation = { __typename?: 'Mutation', createDocument?: { __typename?: 'CreateDocumentResult', id: string } | null };

export type CreateDocumentShareLinkMutationVariables = Exact<{
  input: CreateDocumentShareLinkInput;
}>;


export type CreateDocumentShareLinkMutation = { __typename?: 'Mutation', createDocumentShareLink?: { __typename?: 'CreateDocumentShareLinkResult', token: string } | null };

export type CreateFolderMutationVariables = Exact<{
  input: CreateFolderInput;
}>;


export type CreateFolderMutation = { __typename?: 'Mutation', createFolder?: { __typename?: 'CreateFolderResult', folder?: { __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null } | null };

export type CreateInitialWorkspaceStructureMutationVariables = Exact<{
  input: CreateInitialWorkspaceStructureInput;
}>;


export type CreateInitialWorkspaceStructureMutation = { __typename?: 'Mutation', createInitialWorkspaceStructure?: { __typename?: 'CreateInitialWorkspaceStructureResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role }> | null, currentWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null } | null } | null, folder?: { __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null, document?: { __typename?: 'Document', id: string } | null } | null };

export type CreateWorkspaceInvitationMutationVariables = Exact<{
  input: CreateWorkspaceInvitationInput;
}>;


export type CreateWorkspaceInvitationMutation = { __typename?: 'Mutation', createWorkspaceInvitation?: { __typename?: 'CreateWorkspaceInvitationResult', workspaceInvitation?: { __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, expiresAt: any } | null } | null };

export type DeleteCommentsMutationVariables = Exact<{
  input: DeleteCommentsInput;
}>;


export type DeleteCommentsMutation = { __typename?: 'Mutation', deleteComments?: { __typename?: 'DeleteCommentsResult', status: string } | null };

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

export type InitiateFileUploadMutationVariables = Exact<{
  initiateFileUpload: InitiateFileUploadInput;
}>;


export type InitiateFileUploadMutation = { __typename?: 'Mutation', initiateFileUpload?: { __typename?: 'InitiateFileUploadResult', uploadUrl: string, fileId: string } | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout?: { __typename?: 'LogoutResult', success: boolean } | null };

export type RemoveDocumentShareLinkMutationVariables = Exact<{
  input: RemoveDocumentShareLinkInput;
}>;


export type RemoveDocumentShareLinkMutation = { __typename?: 'Mutation', removeDocumentShareLink?: { __typename?: 'RemoveDocumentShareLinkResult', success: boolean } | null };

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


export type UpdateDocumentNameMutation = { __typename?: 'Mutation', updateDocumentName?: { __typename?: 'UpdateDocumentNameResult', document?: { __typename?: 'Document', id: string, encryptedName?: string | null, encryptedNameNonce?: string | null, parentFolderId?: string | null, workspaceId?: string | null, nameKeyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null } | null };

export type UpdateFolderNameMutationVariables = Exact<{
  input: UpdateFolderNameInput;
}>;


export type UpdateFolderNameMutation = { __typename?: 'Mutation', updateFolderName?: { __typename?: 'UpdateFolderNameResult', folder?: { __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, parentFolderId?: string | null, rootFolderId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null } | null };

export type UpdateWorkspaceMembersRolesMutationVariables = Exact<{
  input: UpdateWorkspaceMembersRolesInput;
}>;


export type UpdateWorkspaceMembersRolesMutation = { __typename?: 'Mutation', updateWorkspaceMembersRoles?: { __typename?: 'UpdateWorkspaceMembersRolesResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, role: Role }> | null } | null } | null };

export type UpdateWorkspaceNameMutationVariables = Exact<{
  input: UpdateWorkspaceNameInput;
}>;


export type UpdateWorkspaceNameMutation = { __typename?: 'Mutation', updateWorkspaceName?: { __typename?: 'UpdateWorkspaceNameResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, role: Role }> | null } | null } | null };

export type VerifyPasswordMutationVariables = Exact<{
  input: VerifyPasswordInput;
}>;


export type VerifyPasswordMutation = { __typename?: 'Mutation', verifyPassword?: { __typename?: 'VerifyLoginResult', isValid?: boolean | null } | null };

export type VerifyRegistrationMutationVariables = Exact<{
  input: VerifyRegistrationInput;
}>;


export type VerifyRegistrationMutation = { __typename?: 'Mutation', verifyRegistration?: { __typename?: 'VerifyRegistrationResult', id: string } | null };

export type CommentsByDocumentIdQueryVariables = Exact<{
  documentId: Scalars['ID'];
  deviceSigningPublicKey: Scalars['String'];
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
}>;


export type CommentsByDocumentIdQuery = { __typename?: 'Query', commentsByDocumentId?: { __typename?: 'CommentConnection', nodes?: Array<{ __typename?: 'Comment', id: string, documentId: string, contentCiphertext: string, contentNonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, createdAt?: any | null }, keyDerivationTrace: { __typename?: 'KeyDerivationTrace2', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: number, context: string, parentId?: string | null }> } } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null, workspaceKeyByDocumentId?: { __typename?: 'WorkspaceKeyByDocumentIdResult', nameWorkspaceKey: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, creatorDeviceSigningPublicKey: string, nonce: string, ciphertext: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, createdAt?: any | null } | null } | null } } | null };

export type DeviceBySigningPublicKeyQueryVariables = Exact<{
  signingPublicKey: Scalars['ID'];
}>;


export type DeviceBySigningPublicKeyQuery = { __typename?: 'Query', deviceBySigningPublicKey?: { __typename?: 'DeviceResult', device?: { __typename?: 'Device', userId?: string | null, signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, info?: string | null, createdAt?: any | null } | null } | null };

export type DevicesQueryVariables = Exact<{
  hasNonExpiredSession: Scalars['Boolean'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type DevicesQuery = { __typename?: 'Query', devices?: { __typename?: 'DeviceWithRecentSessionConnection', nodes?: Array<{ __typename?: 'DeviceWithRecentSession', userId?: string | null, signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, info?: string | null, createdAt?: any | null, mostRecentSession?: { __typename?: 'Session', expiresAt: any } | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type DocumentQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DocumentQuery = { __typename?: 'Query', document?: { __typename?: 'Document', id: string, encryptedName?: string | null, encryptedNameNonce?: string | null, parentFolderId?: string | null, workspaceId?: string | null, nameKeyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null };

export type DocumentPathQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DocumentPathQuery = { __typename?: 'Query', documentPath?: Array<{ __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null> | null };

export type DocumentShareLinkQueryVariables = Exact<{
  token: Scalars['ID'];
}>;


export type DocumentShareLinkQuery = { __typename?: 'Query', documentShareLink?: { __typename?: 'DocumentShareLink', token: string, deviceSecretBoxCiphertext: string, deviceSecretBoxNonce: string, snapshotKeyBoxs?: Array<{ __typename?: 'SnapshotKeyBox', id: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } }> | null } | null };

export type DocumentShareLinksQueryVariables = Exact<{
  documentId: Scalars['ID'];
  first?: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type DocumentShareLinksQuery = { __typename?: 'Query', documentShareLinks?: { __typename?: 'DocumentShareLinkConnection', nodes?: Array<{ __typename?: 'DocumentShareLink', token: string } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type DocumentsQueryVariables = Exact<{
  parentFolderId: Scalars['ID'];
  first?: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type DocumentsQuery = { __typename?: 'Query', documents?: { __typename?: 'DocumentConnection', nodes?: Array<{ __typename?: 'Document', id: string, encryptedName?: string | null, encryptedNameNonce?: string | null, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, nameKeyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type FileUrlQueryVariables = Exact<{
  fileId: Scalars['ID'];
  workspaceId: Scalars['ID'];
  documentId: Scalars['ID'];
}>;


export type FileUrlQuery = { __typename?: 'Query', fileUrl?: { __typename?: 'File', id: string, downloadUrl: string } | null };

export type FirstDocumentQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type FirstDocumentQuery = { __typename?: 'Query', firstDocument?: { __typename?: 'Document', id: string } | null };

export type FolderQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type FolderQuery = { __typename?: 'Query', folder?: { __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, parentFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null };

export type FoldersQueryVariables = Exact<{
  parentFolderId: Scalars['ID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type FoldersQuery = { __typename?: 'Query', folders?: { __typename?: 'FolderConnection', nodes?: Array<{ __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type MainDeviceQueryVariables = Exact<{ [key: string]: never; }>;


export type MainDeviceQuery = { __typename?: 'Query', mainDevice?: { __typename?: 'MainDeviceResult', signingPublicKey: string, nonce: string, ciphertext: string, encryptionKeySalt: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, createdAt: any } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'MeResult', id: string, username: string } | null };

export type MeWithWorkspaceLoadingInfoQueryVariables = Exact<{
  workspaceId?: InputMaybe<Scalars['ID']>;
  documentId?: InputMaybe<Scalars['ID']>;
  returnOtherWorkspaceIfNotFound?: InputMaybe<Scalars['Boolean']>;
  returnOtherDocumentIfNotFound?: InputMaybe<Scalars['Boolean']>;
}>;


export type MeWithWorkspaceLoadingInfoQuery = { __typename?: 'Query', me?: { __typename?: 'MeResult', id: string, username: string, workspaceLoadingInfo?: { __typename?: 'WorkspaceLoadingInfo', id: string, isAuthorized: boolean, documentId?: string | null, role: Role } | null } | null };

export type PendingWorkspaceInvitationQueryVariables = Exact<{ [key: string]: never; }>;


export type PendingWorkspaceInvitationQuery = { __typename?: 'Query', pendingWorkspaceInvitation?: { __typename?: 'PendingWorkspaceInvitationResult', id?: string | null, ciphertext?: string | null, publicNonce?: string | null, subkeyId?: number | null, encryptionKeySalt?: string | null } | null };

export type RootFoldersQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type RootFoldersQuery = { __typename?: 'Query', rootFolders?: { __typename?: 'FolderConnection', nodes?: Array<{ __typename?: 'Folder', id: string, encryptedName: string, encryptedNameNonce: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, subkeyId: number, parentFolders: Array<{ __typename?: 'KeyDerivationTraceParentFolder', folderId: string, subkeyId: number, parentFolderId?: string | null }> } } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type UnauthorizedDevicesForWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type UnauthorizedDevicesForWorkspacesQuery = { __typename?: 'Query', unauthorizedDevicesForWorkspaces?: { __typename?: 'UnauthorizedDevicesForWorkspacesResult', unauthorizedMemberDevices: Array<{ __typename?: 'WorkspaceIdWithMemberDevices', id: string, members: Array<{ __typename?: 'WorkspaceIdWithDevices', id: string, devices: Array<{ __typename?: 'Device', userId?: string | null, signingPublicKey: string, encryptionPublicKey: string, info?: string | null, createdAt?: any | null, encryptionPublicKeySignature: string }> }> }> } | null };

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


export type WorkspaceQuery = { __typename?: 'Query', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, username?: string | null, role: Role }> | null, currentWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null } | null, workspaceKeys?: Array<{ __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null }> | null } | null };

export type WorkspaceDevicesQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type WorkspaceDevicesQuery = { __typename?: 'Query', workspaceDevices?: { __typename?: 'DeviceConnection', nodes?: Array<{ __typename?: 'Device', userId?: string | null, signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, info?: string | null, createdAt?: any | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type WorkspaceInvitationQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type WorkspaceInvitationQuery = { __typename?: 'Query', me?: { __typename?: 'MeResult', id: string, username: string } | null, workspaceInvitation?: { __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, inviterUserId: string, inviterUsername: string, workspaceName?: string | null, expiresAt: any } | null };

export type WorkspaceInvitationsQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
}>;


export type WorkspaceInvitationsQuery = { __typename?: 'Query', workspaceInvitations?: { __typename?: 'WorkspaceInvitationConnection', nodes?: Array<{ __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, inviterUserId: string, inviterUsername: string, expiresAt: any } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type WorkspacesQueryVariables = Exact<{
  deviceSigningPublicKey: Scalars['String'];
}>;


export type WorkspacesQuery = { __typename?: 'Query', workspaces?: { __typename?: 'WorkspaceConnection', nodes?: Array<{ __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspaceMember', userId: string, role: Role }> | null, currentWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null } | null, workspaceKeys?: Array<{ __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice?: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } | null } | null }> | null } | null> | null } | null };


export const AcceptWorkspaceInvitationDocument = gql`
    mutation acceptWorkspaceInvitation($input: AcceptWorkspaceInvitationInput!) {
  acceptWorkspaceInvitation(input: $input) {
    workspace {
      id
      name
      members {
        userId
        username
        role
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
export const CreateCommentDocument = gql`
    mutation createComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    comment {
      id
      documentId
      contentCiphertext
      contentNonce
      creatorDevice {
        signingPublicKey
        encryptionPublicKey
        encryptionPublicKeySignature
        createdAt
      }
    }
  }
}
    `;

export function useCreateCommentMutation() {
  return Urql.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument);
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
export const CreateDocumentShareLinkDocument = gql`
    mutation createDocumentShareLink($input: CreateDocumentShareLinkInput!) {
  createDocumentShareLink(input: $input) {
    token
  }
}
    `;

export function useCreateDocumentShareLinkMutation() {
  return Urql.useMutation<CreateDocumentShareLinkMutation, CreateDocumentShareLinkMutationVariables>(CreateDocumentShareLinkDocument);
};
export const CreateFolderDocument = gql`
    mutation createFolder($input: CreateFolderInput!) {
  createFolder(input: $input) {
    folder {
      id
      encryptedName
      encryptedNameNonce
      parentFolderId
      rootFolderId
      workspaceId
      keyDerivationTrace {
        workspaceKeyId
        subkeyId
        parentFolders {
          folderId
          subkeyId
          parentFolderId
        }
      }
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
        role
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
      parentFolderId
      rootFolderId
      workspaceId
      keyDerivationTrace {
        workspaceKeyId
        subkeyId
        parentFolders {
          folderId
          subkeyId
          parentFolderId
        }
      }
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
export const DeleteCommentsDocument = gql`
    mutation deleteComments($input: DeleteCommentsInput!) {
  deleteComments(input: $input) {
    status
  }
}
    `;

export function useDeleteCommentsMutation() {
  return Urql.useMutation<DeleteCommentsMutation, DeleteCommentsMutationVariables>(DeleteCommentsDocument);
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
export const InitiateFileUploadDocument = gql`
    mutation initiateFileUpload($initiateFileUpload: InitiateFileUploadInput!) {
  initiateFileUpload(input: $initiateFileUpload) {
    uploadUrl
    fileId
  }
}
    `;

export function useInitiateFileUploadMutation() {
  return Urql.useMutation<InitiateFileUploadMutation, InitiateFileUploadMutationVariables>(InitiateFileUploadDocument);
};
export const LogoutDocument = gql`
    mutation logout {
  logout {
    success
  }
}
    `;

export function useLogoutMutation() {
  return Urql.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument);
};
export const RemoveDocumentShareLinkDocument = gql`
    mutation removeDocumentShareLink($input: RemoveDocumentShareLinkInput!) {
  removeDocumentShareLink(input: $input) {
    success
  }
}
    `;

export function useRemoveDocumentShareLinkMutation() {
  return Urql.useMutation<RemoveDocumentShareLinkMutation, RemoveDocumentShareLinkMutationVariables>(RemoveDocumentShareLinkDocument);
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
      parentFolderId
      workspaceId
      nameKeyDerivationTrace {
        workspaceKeyId
        subkeyId
        parentFolders {
          folderId
          subkeyId
          parentFolderId
        }
      }
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
      parentFolderId
      rootFolderId
      keyDerivationTrace {
        workspaceKeyId
        subkeyId
        parentFolders {
          folderId
          subkeyId
          parentFolderId
        }
      }
    }
  }
}
    `;

export function useUpdateFolderNameMutation() {
  return Urql.useMutation<UpdateFolderNameMutation, UpdateFolderNameMutationVariables>(UpdateFolderNameDocument);
};
export const UpdateWorkspaceMembersRolesDocument = gql`
    mutation updateWorkspaceMembersRoles($input: UpdateWorkspaceMembersRolesInput!) {
  updateWorkspaceMembersRoles(input: $input) {
    workspace {
      id
      name
      members {
        userId
        username
        role
      }
    }
  }
}
    `;

export function useUpdateWorkspaceMembersRolesMutation() {
  return Urql.useMutation<UpdateWorkspaceMembersRolesMutation, UpdateWorkspaceMembersRolesMutationVariables>(UpdateWorkspaceMembersRolesDocument);
};
export const UpdateWorkspaceNameDocument = gql`
    mutation updateWorkspaceName($input: UpdateWorkspaceNameInput!) {
  updateWorkspaceName(input: $input) {
    workspace {
      id
      name
      members {
        userId
        username
        role
      }
    }
  }
}
    `;

export function useUpdateWorkspaceNameMutation() {
  return Urql.useMutation<UpdateWorkspaceNameMutation, UpdateWorkspaceNameMutationVariables>(UpdateWorkspaceNameDocument);
};
export const VerifyPasswordDocument = gql`
    mutation verifyPassword($input: VerifyPasswordInput!) {
  verifyPassword(input: $input) {
    isValid
  }
}
    `;

export function useVerifyPasswordMutation() {
  return Urql.useMutation<VerifyPasswordMutation, VerifyPasswordMutationVariables>(VerifyPasswordDocument);
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
export const CommentsByDocumentIdDocument = gql`
    query commentsByDocumentId($documentId: ID!, $deviceSigningPublicKey: String!, $first: Int = 50, $after: String) {
  commentsByDocumentId(documentId: $documentId, first: $first, after: $after) {
    nodes {
      id
      documentId
      contentCiphertext
      contentNonce
      creatorDevice {
        signingPublicKey
        encryptionPublicKey
        encryptionPublicKeySignature
        createdAt
      }
      keyDerivationTrace {
        workspaceKeyId
        trace {
          entryId
          subkeyId
          context
          parentId
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
  workspaceKeyByDocumentId(
    documentId: $documentId
    deviceSigningPublicKey: $deviceSigningPublicKey
  ) {
    nameWorkspaceKey {
      id
      workspaceId
      generation
      workspaceKeyBox {
        id
        workspaceKeyId
        deviceSigningPublicKey
        creatorDeviceSigningPublicKey
        nonce
        ciphertext
        creatorDevice {
          signingPublicKey
          encryptionPublicKey
          encryptionPublicKeySignature
          createdAt
        }
      }
    }
  }
}
    `;

export function useCommentsByDocumentIdQuery(options: Omit<Urql.UseQueryArgs<CommentsByDocumentIdQueryVariables>, 'query'>) {
  return Urql.useQuery<CommentsByDocumentIdQuery, CommentsByDocumentIdQueryVariables>({ query: CommentsByDocumentIdDocument, ...options });
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
    query devices($hasNonExpiredSession: Boolean!, $first: Int!, $after: String) {
  devices(
    hasNonExpiredSession: $hasNonExpiredSession
    first: $first
    after: $after
  ) {
    nodes {
      userId
      signingPublicKey
      encryptionPublicKey
      encryptionPublicKeySignature
      info
      createdAt
      mostRecentSession {
        expiresAt
      }
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
    parentFolderId
    workspaceId
    nameKeyDerivationTrace {
      workspaceKeyId
      subkeyId
      parentFolders {
        folderId
        subkeyId
        parentFolderId
      }
    }
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
    parentFolderId
    rootFolderId
    workspaceId
    keyDerivationTrace {
      workspaceKeyId
      subkeyId
      parentFolders {
        folderId
        subkeyId
        parentFolderId
      }
    }
  }
}
    `;

export function useDocumentPathQuery(options: Omit<Urql.UseQueryArgs<DocumentPathQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentPathQuery, DocumentPathQueryVariables>({ query: DocumentPathDocument, ...options });
};
export const DocumentShareLinkDocument = gql`
    query documentShareLink($token: ID!) {
  documentShareLink(token: $token) {
    token
    deviceSecretBoxCiphertext
    deviceSecretBoxNonce
    snapshotKeyBoxs {
      id
      ciphertext
      nonce
      creatorDevice {
        signingPublicKey
        encryptionPublicKey
      }
    }
  }
}
    `;

export function useDocumentShareLinkQuery(options: Omit<Urql.UseQueryArgs<DocumentShareLinkQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentShareLinkQuery, DocumentShareLinkQueryVariables>({ query: DocumentShareLinkDocument, ...options });
};
export const DocumentShareLinksDocument = gql`
    query documentShareLinks($documentId: ID!, $first: Int! = 50, $after: String) {
  documentShareLinks(documentId: $documentId, first: $first, after: $after) {
    nodes {
      token
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

export function useDocumentShareLinksQuery(options: Omit<Urql.UseQueryArgs<DocumentShareLinksQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentShareLinksQuery, DocumentShareLinksQueryVariables>({ query: DocumentShareLinksDocument, ...options });
};
export const DocumentsDocument = gql`
    query documents($parentFolderId: ID!, $first: Int! = 100, $after: String) {
  documents(parentFolderId: $parentFolderId, first: $first, after: $after) {
    nodes {
      id
      encryptedName
      encryptedNameNonce
      parentFolderId
      rootFolderId
      workspaceId
      nameKeyDerivationTrace {
        workspaceKeyId
        subkeyId
        parentFolders {
          folderId
          subkeyId
          parentFolderId
        }
      }
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
export const FileUrlDocument = gql`
    query fileUrl($fileId: ID!, $workspaceId: ID!, $documentId: ID!) {
  fileUrl(fileId: $fileId, workspaceId: $workspaceId, documentId: $documentId) {
    id
    downloadUrl
  }
}
    `;

export function useFileUrlQuery(options: Omit<Urql.UseQueryArgs<FileUrlQueryVariables>, 'query'>) {
  return Urql.useQuery<FileUrlQuery, FileUrlQueryVariables>({ query: FileUrlDocument, ...options });
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
    parentFolderId
    workspaceId
    keyDerivationTrace {
      workspaceKeyId
      subkeyId
      parentFolders {
        folderId
        subkeyId
        parentFolderId
      }
    }
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
      parentFolderId
      rootFolderId
      workspaceId
      keyDerivationTrace {
        workspaceKeyId
        subkeyId
        parentFolders {
          folderId
          subkeyId
          parentFolderId
        }
      }
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
    encryptionPublicKeySignature
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
      role
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
    ciphertext
    publicNonce
    subkeyId
    encryptionKeySalt
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
      parentFolderId
      rootFolderId
      workspaceId
      keyDerivationTrace {
        workspaceKeyId
        subkeyId
        parentFolders {
          folderId
          subkeyId
          parentFolderId
        }
      }
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
      role
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
    workspaceKeys {
      id
      workspaceId
      generation
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
  me {
    id
    username
  }
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
        role
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
          nonce
          creatorDevice {
            signingPublicKey
            encryptionPublicKey
          }
        }
      }
      workspaceKeys {
        id
        workspaceId
        generation
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

export const runAcceptWorkspaceInvitationMutation = async (variables: AcceptWorkspaceInvitationMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<AcceptWorkspaceInvitationMutation, AcceptWorkspaceInvitationMutationVariables>(
      AcceptWorkspaceInvitationDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runAttachDeviceToWorkspacesMutation = async (variables: AttachDeviceToWorkspacesMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<AttachDeviceToWorkspacesMutation, AttachDeviceToWorkspacesMutationVariables>(
      AttachDeviceToWorkspacesDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runAttachDevicesToWorkspacesMutation = async (variables: AttachDevicesToWorkspacesMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<AttachDevicesToWorkspacesMutation, AttachDevicesToWorkspacesMutationVariables>(
      AttachDevicesToWorkspacesDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runCreateCommentMutation = async (variables: CreateCommentMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<CreateCommentMutation, CreateCommentMutationVariables>(
      CreateCommentDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runCreateDocumentMutation = async (variables: CreateDocumentMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<CreateDocumentMutation, CreateDocumentMutationVariables>(
      CreateDocumentDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runCreateDocumentShareLinkMutation = async (variables: CreateDocumentShareLinkMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<CreateDocumentShareLinkMutation, CreateDocumentShareLinkMutationVariables>(
      CreateDocumentShareLinkDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runCreateFolderMutation = async (variables: CreateFolderMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<CreateFolderMutation, CreateFolderMutationVariables>(
      CreateFolderDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runCreateInitialWorkspaceStructureMutation = async (variables: CreateInitialWorkspaceStructureMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<CreateInitialWorkspaceStructureMutation, CreateInitialWorkspaceStructureMutationVariables>(
      CreateInitialWorkspaceStructureDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runCreateWorkspaceInvitationMutation = async (variables: CreateWorkspaceInvitationMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<CreateWorkspaceInvitationMutation, CreateWorkspaceInvitationMutationVariables>(
      CreateWorkspaceInvitationDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runDeleteCommentsMutation = async (variables: DeleteCommentsMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<DeleteCommentsMutation, DeleteCommentsMutationVariables>(
      DeleteCommentsDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runDeleteDevicesMutation = async (variables: DeleteDevicesMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<DeleteDevicesMutation, DeleteDevicesMutationVariables>(
      DeleteDevicesDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runDeleteDocumentsMutation = async (variables: DeleteDocumentsMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<DeleteDocumentsMutation, DeleteDocumentsMutationVariables>(
      DeleteDocumentsDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runDeleteFoldersMutation = async (variables: DeleteFoldersMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<DeleteFoldersMutation, DeleteFoldersMutationVariables>(
      DeleteFoldersDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runDeleteWorkspaceInvitationsMutation = async (variables: DeleteWorkspaceInvitationsMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<DeleteWorkspaceInvitationsMutation, DeleteWorkspaceInvitationsMutationVariables>(
      DeleteWorkspaceInvitationsDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runDeleteWorkspacesMutation = async (variables: DeleteWorkspacesMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<DeleteWorkspacesMutation, DeleteWorkspacesMutationVariables>(
      DeleteWorkspacesDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runFinishLoginMutation = async (variables: FinishLoginMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<FinishLoginMutation, FinishLoginMutationVariables>(
      FinishLoginDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runFinishRegistrationMutation = async (variables: FinishRegistrationMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<FinishRegistrationMutation, FinishRegistrationMutationVariables>(
      FinishRegistrationDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runInitiateFileUploadMutation = async (variables: InitiateFileUploadMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<InitiateFileUploadMutation, InitiateFileUploadMutationVariables>(
      InitiateFileUploadDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runLogoutMutation = async (variables: LogoutMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<LogoutMutation, LogoutMutationVariables>(
      LogoutDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runRemoveDocumentShareLinkMutation = async (variables: RemoveDocumentShareLinkMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<RemoveDocumentShareLinkMutation, RemoveDocumentShareLinkMutationVariables>(
      RemoveDocumentShareLinkDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runRemoveMembersAndRotateWorkspaceKeyMutation = async (variables: RemoveMembersAndRotateWorkspaceKeyMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<RemoveMembersAndRotateWorkspaceKeyMutation, RemoveMembersAndRotateWorkspaceKeyMutationVariables>(
      RemoveMembersAndRotateWorkspaceKeyDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runStartLoginMutation = async (variables: StartLoginMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<StartLoginMutation, StartLoginMutationVariables>(
      StartLoginDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runStartRegistrationMutation = async (variables: StartRegistrationMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<StartRegistrationMutation, StartRegistrationMutationVariables>(
      StartRegistrationDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runUpdateDocumentNameMutation = async (variables: UpdateDocumentNameMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<UpdateDocumentNameMutation, UpdateDocumentNameMutationVariables>(
      UpdateDocumentNameDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runUpdateFolderNameMutation = async (variables: UpdateFolderNameMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<UpdateFolderNameMutation, UpdateFolderNameMutationVariables>(
      UpdateFolderNameDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runUpdateWorkspaceMembersRolesMutation = async (variables: UpdateWorkspaceMembersRolesMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<UpdateWorkspaceMembersRolesMutation, UpdateWorkspaceMembersRolesMutationVariables>(
      UpdateWorkspaceMembersRolesDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runUpdateWorkspaceNameMutation = async (variables: UpdateWorkspaceNameMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<UpdateWorkspaceNameMutation, UpdateWorkspaceNameMutationVariables>(
      UpdateWorkspaceNameDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runVerifyPasswordMutation = async (variables: VerifyPasswordMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<VerifyPasswordMutation, VerifyPasswordMutationVariables>(
      VerifyPasswordDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runVerifyRegistrationMutation = async (variables: VerifyRegistrationMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<VerifyRegistrationMutation, VerifyRegistrationMutationVariables>(
      VerifyRegistrationDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export const runCommentsByDocumentIdQuery = async (variables: CommentsByDocumentIdQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<CommentsByDocumentIdQuery, CommentsByDocumentIdQueryVariables>(
      CommentsByDocumentIdDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type CommentsByDocumentIdQueryResult = Urql.OperationResult<CommentsByDocumentIdQuery, CommentsByDocumentIdQueryVariables>;

export type CommentsByDocumentIdQueryUpdateResultEvent = {
  type: "CommentsByDocumentIdQuery.UPDATE_RESULT";
  result: CommentsByDocumentIdQueryResult;
};

export type CommentsByDocumentIdQueryErrorEvent = {
  type: "CommentsByDocumentIdQuery.ERROR";
  result: CommentsByDocumentIdQueryResult;
};

export type CommentsByDocumentIdQueryServiceEvent = CommentsByDocumentIdQueryUpdateResultEvent | CommentsByDocumentIdQueryErrorEvent;

type CommentsByDocumentIdQueryServiceSubscribersEntry = {
  variables: CommentsByDocumentIdQueryVariables;
  callbacks: ((event: CommentsByDocumentIdQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type CommentsByDocumentIdQueryServiceSubscribers = {
  [variables: string]: CommentsByDocumentIdQueryServiceSubscribersEntry;
};

const commentsByDocumentIdQueryServiceSubscribers: CommentsByDocumentIdQueryServiceSubscribers = {};

const triggerCommentsByDocumentIdQuery = (variablesString: string, variables: CommentsByDocumentIdQueryVariables) => {
  getUrqlClient()
    .query<CommentsByDocumentIdQuery, CommentsByDocumentIdQueryVariables>(CommentsByDocumentIdDocument, variables)
    .toPromise()
    .then((result) => {
      commentsByDocumentIdQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "CommentsByDocumentIdQuery.ERROR" : "CommentsByDocumentIdQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const commentsByDocumentIdQueryService =
  (variables: CommentsByDocumentIdQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (commentsByDocumentIdQueryServiceSubscribers[variablesString]) {
      commentsByDocumentIdQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      commentsByDocumentIdQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerCommentsByDocumentIdQuery(variablesString, variables);
    if (!commentsByDocumentIdQueryServiceSubscribers[variablesString].intervalId) {
      commentsByDocumentIdQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerCommentsByDocumentIdQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = commentsByDocumentIdQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        commentsByDocumentIdQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        commentsByDocumentIdQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runDeviceBySigningPublicKeyQuery = async (variables: DeviceBySigningPublicKeyQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<DeviceBySigningPublicKeyQuery, DeviceBySigningPublicKeyQueryVariables>(
      DeviceBySigningPublicKeyDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type DeviceBySigningPublicKeyQueryResult = Urql.OperationResult<DeviceBySigningPublicKeyQuery, DeviceBySigningPublicKeyQueryVariables>;

export type DeviceBySigningPublicKeyQueryUpdateResultEvent = {
  type: "DeviceBySigningPublicKeyQuery.UPDATE_RESULT";
  result: DeviceBySigningPublicKeyQueryResult;
};

export type DeviceBySigningPublicKeyQueryErrorEvent = {
  type: "DeviceBySigningPublicKeyQuery.ERROR";
  result: DeviceBySigningPublicKeyQueryResult;
};

export type DeviceBySigningPublicKeyQueryServiceEvent = DeviceBySigningPublicKeyQueryUpdateResultEvent | DeviceBySigningPublicKeyQueryErrorEvent;

type DeviceBySigningPublicKeyQueryServiceSubscribersEntry = {
  variables: DeviceBySigningPublicKeyQueryVariables;
  callbacks: ((event: DeviceBySigningPublicKeyQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type DeviceBySigningPublicKeyQueryServiceSubscribers = {
  [variables: string]: DeviceBySigningPublicKeyQueryServiceSubscribersEntry;
};

const deviceBySigningPublicKeyQueryServiceSubscribers: DeviceBySigningPublicKeyQueryServiceSubscribers = {};

const triggerDeviceBySigningPublicKeyQuery = (variablesString: string, variables: DeviceBySigningPublicKeyQueryVariables) => {
  getUrqlClient()
    .query<DeviceBySigningPublicKeyQuery, DeviceBySigningPublicKeyQueryVariables>(DeviceBySigningPublicKeyDocument, variables)
    .toPromise()
    .then((result) => {
      deviceBySigningPublicKeyQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "DeviceBySigningPublicKeyQuery.ERROR" : "DeviceBySigningPublicKeyQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const deviceBySigningPublicKeyQueryService =
  (variables: DeviceBySigningPublicKeyQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (deviceBySigningPublicKeyQueryServiceSubscribers[variablesString]) {
      deviceBySigningPublicKeyQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      deviceBySigningPublicKeyQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerDeviceBySigningPublicKeyQuery(variablesString, variables);
    if (!deviceBySigningPublicKeyQueryServiceSubscribers[variablesString].intervalId) {
      deviceBySigningPublicKeyQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerDeviceBySigningPublicKeyQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = deviceBySigningPublicKeyQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        deviceBySigningPublicKeyQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        deviceBySigningPublicKeyQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runDevicesQuery = async (variables: DevicesQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<DevicesQuery, DevicesQueryVariables>(
      DevicesDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type DevicesQueryResult = Urql.OperationResult<DevicesQuery, DevicesQueryVariables>;

export type DevicesQueryUpdateResultEvent = {
  type: "DevicesQuery.UPDATE_RESULT";
  result: DevicesQueryResult;
};

export type DevicesQueryErrorEvent = {
  type: "DevicesQuery.ERROR";
  result: DevicesQueryResult;
};

export type DevicesQueryServiceEvent = DevicesQueryUpdateResultEvent | DevicesQueryErrorEvent;

type DevicesQueryServiceSubscribersEntry = {
  variables: DevicesQueryVariables;
  callbacks: ((event: DevicesQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type DevicesQueryServiceSubscribers = {
  [variables: string]: DevicesQueryServiceSubscribersEntry;
};

const devicesQueryServiceSubscribers: DevicesQueryServiceSubscribers = {};

const triggerDevicesQuery = (variablesString: string, variables: DevicesQueryVariables) => {
  getUrqlClient()
    .query<DevicesQuery, DevicesQueryVariables>(DevicesDocument, variables)
    .toPromise()
    .then((result) => {
      devicesQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "DevicesQuery.ERROR" : "DevicesQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const devicesQueryService =
  (variables: DevicesQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (devicesQueryServiceSubscribers[variablesString]) {
      devicesQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      devicesQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerDevicesQuery(variablesString, variables);
    if (!devicesQueryServiceSubscribers[variablesString].intervalId) {
      devicesQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerDevicesQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = devicesQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        devicesQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        devicesQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runDocumentQuery = async (variables: DocumentQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<DocumentQuery, DocumentQueryVariables>(
      DocumentDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type DocumentQueryResult = Urql.OperationResult<DocumentQuery, DocumentQueryVariables>;

export type DocumentQueryUpdateResultEvent = {
  type: "DocumentQuery.UPDATE_RESULT";
  result: DocumentQueryResult;
};

export type DocumentQueryErrorEvent = {
  type: "DocumentQuery.ERROR";
  result: DocumentQueryResult;
};

export type DocumentQueryServiceEvent = DocumentQueryUpdateResultEvent | DocumentQueryErrorEvent;

type DocumentQueryServiceSubscribersEntry = {
  variables: DocumentQueryVariables;
  callbacks: ((event: DocumentQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type DocumentQueryServiceSubscribers = {
  [variables: string]: DocumentQueryServiceSubscribersEntry;
};

const documentQueryServiceSubscribers: DocumentQueryServiceSubscribers = {};

const triggerDocumentQuery = (variablesString: string, variables: DocumentQueryVariables) => {
  getUrqlClient()
    .query<DocumentQuery, DocumentQueryVariables>(DocumentDocument, variables)
    .toPromise()
    .then((result) => {
      documentQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "DocumentQuery.ERROR" : "DocumentQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const documentQueryService =
  (variables: DocumentQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (documentQueryServiceSubscribers[variablesString]) {
      documentQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      documentQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerDocumentQuery(variablesString, variables);
    if (!documentQueryServiceSubscribers[variablesString].intervalId) {
      documentQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerDocumentQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = documentQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        documentQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        documentQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runDocumentPathQuery = async (variables: DocumentPathQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<DocumentPathQuery, DocumentPathQueryVariables>(
      DocumentPathDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type DocumentPathQueryResult = Urql.OperationResult<DocumentPathQuery, DocumentPathQueryVariables>;

export type DocumentPathQueryUpdateResultEvent = {
  type: "DocumentPathQuery.UPDATE_RESULT";
  result: DocumentPathQueryResult;
};

export type DocumentPathQueryErrorEvent = {
  type: "DocumentPathQuery.ERROR";
  result: DocumentPathQueryResult;
};

export type DocumentPathQueryServiceEvent = DocumentPathQueryUpdateResultEvent | DocumentPathQueryErrorEvent;

type DocumentPathQueryServiceSubscribersEntry = {
  variables: DocumentPathQueryVariables;
  callbacks: ((event: DocumentPathQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type DocumentPathQueryServiceSubscribers = {
  [variables: string]: DocumentPathQueryServiceSubscribersEntry;
};

const documentPathQueryServiceSubscribers: DocumentPathQueryServiceSubscribers = {};

const triggerDocumentPathQuery = (variablesString: string, variables: DocumentPathQueryVariables) => {
  getUrqlClient()
    .query<DocumentPathQuery, DocumentPathQueryVariables>(DocumentPathDocument, variables)
    .toPromise()
    .then((result) => {
      documentPathQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "DocumentPathQuery.ERROR" : "DocumentPathQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const documentPathQueryService =
  (variables: DocumentPathQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (documentPathQueryServiceSubscribers[variablesString]) {
      documentPathQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      documentPathQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerDocumentPathQuery(variablesString, variables);
    if (!documentPathQueryServiceSubscribers[variablesString].intervalId) {
      documentPathQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerDocumentPathQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = documentPathQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        documentPathQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        documentPathQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runDocumentShareLinkQuery = async (variables: DocumentShareLinkQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<DocumentShareLinkQuery, DocumentShareLinkQueryVariables>(
      DocumentShareLinkDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type DocumentShareLinkQueryResult = Urql.OperationResult<DocumentShareLinkQuery, DocumentShareLinkQueryVariables>;

export type DocumentShareLinkQueryUpdateResultEvent = {
  type: "DocumentShareLinkQuery.UPDATE_RESULT";
  result: DocumentShareLinkQueryResult;
};

export type DocumentShareLinkQueryErrorEvent = {
  type: "DocumentShareLinkQuery.ERROR";
  result: DocumentShareLinkQueryResult;
};

export type DocumentShareLinkQueryServiceEvent = DocumentShareLinkQueryUpdateResultEvent | DocumentShareLinkQueryErrorEvent;

type DocumentShareLinkQueryServiceSubscribersEntry = {
  variables: DocumentShareLinkQueryVariables;
  callbacks: ((event: DocumentShareLinkQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type DocumentShareLinkQueryServiceSubscribers = {
  [variables: string]: DocumentShareLinkQueryServiceSubscribersEntry;
};

const documentShareLinkQueryServiceSubscribers: DocumentShareLinkQueryServiceSubscribers = {};

const triggerDocumentShareLinkQuery = (variablesString: string, variables: DocumentShareLinkQueryVariables) => {
  getUrqlClient()
    .query<DocumentShareLinkQuery, DocumentShareLinkQueryVariables>(DocumentShareLinkDocument, variables)
    .toPromise()
    .then((result) => {
      documentShareLinkQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "DocumentShareLinkQuery.ERROR" : "DocumentShareLinkQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const documentShareLinkQueryService =
  (variables: DocumentShareLinkQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (documentShareLinkQueryServiceSubscribers[variablesString]) {
      documentShareLinkQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      documentShareLinkQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerDocumentShareLinkQuery(variablesString, variables);
    if (!documentShareLinkQueryServiceSubscribers[variablesString].intervalId) {
      documentShareLinkQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerDocumentShareLinkQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = documentShareLinkQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        documentShareLinkQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        documentShareLinkQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runDocumentShareLinksQuery = async (variables: DocumentShareLinksQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<DocumentShareLinksQuery, DocumentShareLinksQueryVariables>(
      DocumentShareLinksDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type DocumentShareLinksQueryResult = Urql.OperationResult<DocumentShareLinksQuery, DocumentShareLinksQueryVariables>;

export type DocumentShareLinksQueryUpdateResultEvent = {
  type: "DocumentShareLinksQuery.UPDATE_RESULT";
  result: DocumentShareLinksQueryResult;
};

export type DocumentShareLinksQueryErrorEvent = {
  type: "DocumentShareLinksQuery.ERROR";
  result: DocumentShareLinksQueryResult;
};

export type DocumentShareLinksQueryServiceEvent = DocumentShareLinksQueryUpdateResultEvent | DocumentShareLinksQueryErrorEvent;

type DocumentShareLinksQueryServiceSubscribersEntry = {
  variables: DocumentShareLinksQueryVariables;
  callbacks: ((event: DocumentShareLinksQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type DocumentShareLinksQueryServiceSubscribers = {
  [variables: string]: DocumentShareLinksQueryServiceSubscribersEntry;
};

const documentShareLinksQueryServiceSubscribers: DocumentShareLinksQueryServiceSubscribers = {};

const triggerDocumentShareLinksQuery = (variablesString: string, variables: DocumentShareLinksQueryVariables) => {
  getUrqlClient()
    .query<DocumentShareLinksQuery, DocumentShareLinksQueryVariables>(DocumentShareLinksDocument, variables)
    .toPromise()
    .then((result) => {
      documentShareLinksQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "DocumentShareLinksQuery.ERROR" : "DocumentShareLinksQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const documentShareLinksQueryService =
  (variables: DocumentShareLinksQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (documentShareLinksQueryServiceSubscribers[variablesString]) {
      documentShareLinksQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      documentShareLinksQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerDocumentShareLinksQuery(variablesString, variables);
    if (!documentShareLinksQueryServiceSubscribers[variablesString].intervalId) {
      documentShareLinksQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerDocumentShareLinksQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = documentShareLinksQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        documentShareLinksQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        documentShareLinksQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runDocumentsQuery = async (variables: DocumentsQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<DocumentsQuery, DocumentsQueryVariables>(
      DocumentsDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type DocumentsQueryResult = Urql.OperationResult<DocumentsQuery, DocumentsQueryVariables>;

export type DocumentsQueryUpdateResultEvent = {
  type: "DocumentsQuery.UPDATE_RESULT";
  result: DocumentsQueryResult;
};

export type DocumentsQueryErrorEvent = {
  type: "DocumentsQuery.ERROR";
  result: DocumentsQueryResult;
};

export type DocumentsQueryServiceEvent = DocumentsQueryUpdateResultEvent | DocumentsQueryErrorEvent;

type DocumentsQueryServiceSubscribersEntry = {
  variables: DocumentsQueryVariables;
  callbacks: ((event: DocumentsQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type DocumentsQueryServiceSubscribers = {
  [variables: string]: DocumentsQueryServiceSubscribersEntry;
};

const documentsQueryServiceSubscribers: DocumentsQueryServiceSubscribers = {};

const triggerDocumentsQuery = (variablesString: string, variables: DocumentsQueryVariables) => {
  getUrqlClient()
    .query<DocumentsQuery, DocumentsQueryVariables>(DocumentsDocument, variables)
    .toPromise()
    .then((result) => {
      documentsQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "DocumentsQuery.ERROR" : "DocumentsQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const documentsQueryService =
  (variables: DocumentsQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (documentsQueryServiceSubscribers[variablesString]) {
      documentsQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      documentsQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerDocumentsQuery(variablesString, variables);
    if (!documentsQueryServiceSubscribers[variablesString].intervalId) {
      documentsQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerDocumentsQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = documentsQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        documentsQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        documentsQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runFileUrlQuery = async (variables: FileUrlQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<FileUrlQuery, FileUrlQueryVariables>(
      FileUrlDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type FileUrlQueryResult = Urql.OperationResult<FileUrlQuery, FileUrlQueryVariables>;

export type FileUrlQueryUpdateResultEvent = {
  type: "FileUrlQuery.UPDATE_RESULT";
  result: FileUrlQueryResult;
};

export type FileUrlQueryErrorEvent = {
  type: "FileUrlQuery.ERROR";
  result: FileUrlQueryResult;
};

export type FileUrlQueryServiceEvent = FileUrlQueryUpdateResultEvent | FileUrlQueryErrorEvent;

type FileUrlQueryServiceSubscribersEntry = {
  variables: FileUrlQueryVariables;
  callbacks: ((event: FileUrlQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type FileUrlQueryServiceSubscribers = {
  [variables: string]: FileUrlQueryServiceSubscribersEntry;
};

const fileUrlQueryServiceSubscribers: FileUrlQueryServiceSubscribers = {};

const triggerFileUrlQuery = (variablesString: string, variables: FileUrlQueryVariables) => {
  getUrqlClient()
    .query<FileUrlQuery, FileUrlQueryVariables>(FileUrlDocument, variables)
    .toPromise()
    .then((result) => {
      fileUrlQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "FileUrlQuery.ERROR" : "FileUrlQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const fileUrlQueryService =
  (variables: FileUrlQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (fileUrlQueryServiceSubscribers[variablesString]) {
      fileUrlQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      fileUrlQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerFileUrlQuery(variablesString, variables);
    if (!fileUrlQueryServiceSubscribers[variablesString].intervalId) {
      fileUrlQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerFileUrlQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = fileUrlQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        fileUrlQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        fileUrlQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runFirstDocumentQuery = async (variables: FirstDocumentQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<FirstDocumentQuery, FirstDocumentQueryVariables>(
      FirstDocumentDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type FirstDocumentQueryResult = Urql.OperationResult<FirstDocumentQuery, FirstDocumentQueryVariables>;

export type FirstDocumentQueryUpdateResultEvent = {
  type: "FirstDocumentQuery.UPDATE_RESULT";
  result: FirstDocumentQueryResult;
};

export type FirstDocumentQueryErrorEvent = {
  type: "FirstDocumentQuery.ERROR";
  result: FirstDocumentQueryResult;
};

export type FirstDocumentQueryServiceEvent = FirstDocumentQueryUpdateResultEvent | FirstDocumentQueryErrorEvent;

type FirstDocumentQueryServiceSubscribersEntry = {
  variables: FirstDocumentQueryVariables;
  callbacks: ((event: FirstDocumentQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type FirstDocumentQueryServiceSubscribers = {
  [variables: string]: FirstDocumentQueryServiceSubscribersEntry;
};

const firstDocumentQueryServiceSubscribers: FirstDocumentQueryServiceSubscribers = {};

const triggerFirstDocumentQuery = (variablesString: string, variables: FirstDocumentQueryVariables) => {
  getUrqlClient()
    .query<FirstDocumentQuery, FirstDocumentQueryVariables>(FirstDocumentDocument, variables)
    .toPromise()
    .then((result) => {
      firstDocumentQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "FirstDocumentQuery.ERROR" : "FirstDocumentQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const firstDocumentQueryService =
  (variables: FirstDocumentQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (firstDocumentQueryServiceSubscribers[variablesString]) {
      firstDocumentQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      firstDocumentQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerFirstDocumentQuery(variablesString, variables);
    if (!firstDocumentQueryServiceSubscribers[variablesString].intervalId) {
      firstDocumentQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerFirstDocumentQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = firstDocumentQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        firstDocumentQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        firstDocumentQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runFolderQuery = async (variables: FolderQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<FolderQuery, FolderQueryVariables>(
      FolderDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type FolderQueryResult = Urql.OperationResult<FolderQuery, FolderQueryVariables>;

export type FolderQueryUpdateResultEvent = {
  type: "FolderQuery.UPDATE_RESULT";
  result: FolderQueryResult;
};

export type FolderQueryErrorEvent = {
  type: "FolderQuery.ERROR";
  result: FolderQueryResult;
};

export type FolderQueryServiceEvent = FolderQueryUpdateResultEvent | FolderQueryErrorEvent;

type FolderQueryServiceSubscribersEntry = {
  variables: FolderQueryVariables;
  callbacks: ((event: FolderQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type FolderQueryServiceSubscribers = {
  [variables: string]: FolderQueryServiceSubscribersEntry;
};

const folderQueryServiceSubscribers: FolderQueryServiceSubscribers = {};

const triggerFolderQuery = (variablesString: string, variables: FolderQueryVariables) => {
  getUrqlClient()
    .query<FolderQuery, FolderQueryVariables>(FolderDocument, variables)
    .toPromise()
    .then((result) => {
      folderQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "FolderQuery.ERROR" : "FolderQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const folderQueryService =
  (variables: FolderQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (folderQueryServiceSubscribers[variablesString]) {
      folderQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      folderQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerFolderQuery(variablesString, variables);
    if (!folderQueryServiceSubscribers[variablesString].intervalId) {
      folderQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerFolderQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = folderQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        folderQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        folderQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runFoldersQuery = async (variables: FoldersQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<FoldersQuery, FoldersQueryVariables>(
      FoldersDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type FoldersQueryResult = Urql.OperationResult<FoldersQuery, FoldersQueryVariables>;

export type FoldersQueryUpdateResultEvent = {
  type: "FoldersQuery.UPDATE_RESULT";
  result: FoldersQueryResult;
};

export type FoldersQueryErrorEvent = {
  type: "FoldersQuery.ERROR";
  result: FoldersQueryResult;
};

export type FoldersQueryServiceEvent = FoldersQueryUpdateResultEvent | FoldersQueryErrorEvent;

type FoldersQueryServiceSubscribersEntry = {
  variables: FoldersQueryVariables;
  callbacks: ((event: FoldersQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type FoldersQueryServiceSubscribers = {
  [variables: string]: FoldersQueryServiceSubscribersEntry;
};

const foldersQueryServiceSubscribers: FoldersQueryServiceSubscribers = {};

const triggerFoldersQuery = (variablesString: string, variables: FoldersQueryVariables) => {
  getUrqlClient()
    .query<FoldersQuery, FoldersQueryVariables>(FoldersDocument, variables)
    .toPromise()
    .then((result) => {
      foldersQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "FoldersQuery.ERROR" : "FoldersQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const foldersQueryService =
  (variables: FoldersQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (foldersQueryServiceSubscribers[variablesString]) {
      foldersQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      foldersQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerFoldersQuery(variablesString, variables);
    if (!foldersQueryServiceSubscribers[variablesString].intervalId) {
      foldersQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerFoldersQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = foldersQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        foldersQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        foldersQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runMainDeviceQuery = async (variables: MainDeviceQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<MainDeviceQuery, MainDeviceQueryVariables>(
      MainDeviceDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type MainDeviceQueryResult = Urql.OperationResult<MainDeviceQuery, MainDeviceQueryVariables>;

export type MainDeviceQueryUpdateResultEvent = {
  type: "MainDeviceQuery.UPDATE_RESULT";
  result: MainDeviceQueryResult;
};

export type MainDeviceQueryErrorEvent = {
  type: "MainDeviceQuery.ERROR";
  result: MainDeviceQueryResult;
};

export type MainDeviceQueryServiceEvent = MainDeviceQueryUpdateResultEvent | MainDeviceQueryErrorEvent;

type MainDeviceQueryServiceSubscribersEntry = {
  variables: MainDeviceQueryVariables;
  callbacks: ((event: MainDeviceQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type MainDeviceQueryServiceSubscribers = {
  [variables: string]: MainDeviceQueryServiceSubscribersEntry;
};

const mainDeviceQueryServiceSubscribers: MainDeviceQueryServiceSubscribers = {};

const triggerMainDeviceQuery = (variablesString: string, variables: MainDeviceQueryVariables) => {
  getUrqlClient()
    .query<MainDeviceQuery, MainDeviceQueryVariables>(MainDeviceDocument, variables)
    .toPromise()
    .then((result) => {
      mainDeviceQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "MainDeviceQuery.ERROR" : "MainDeviceQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const mainDeviceQueryService =
  (variables: MainDeviceQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (mainDeviceQueryServiceSubscribers[variablesString]) {
      mainDeviceQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      mainDeviceQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerMainDeviceQuery(variablesString, variables);
    if (!mainDeviceQueryServiceSubscribers[variablesString].intervalId) {
      mainDeviceQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerMainDeviceQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = mainDeviceQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        mainDeviceQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        mainDeviceQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runMeQuery = async (variables: MeQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<MeQuery, MeQueryVariables>(
      MeDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type MeQueryResult = Urql.OperationResult<MeQuery, MeQueryVariables>;

export type MeQueryUpdateResultEvent = {
  type: "MeQuery.UPDATE_RESULT";
  result: MeQueryResult;
};

export type MeQueryErrorEvent = {
  type: "MeQuery.ERROR";
  result: MeQueryResult;
};

export type MeQueryServiceEvent = MeQueryUpdateResultEvent | MeQueryErrorEvent;

type MeQueryServiceSubscribersEntry = {
  variables: MeQueryVariables;
  callbacks: ((event: MeQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type MeQueryServiceSubscribers = {
  [variables: string]: MeQueryServiceSubscribersEntry;
};

const meQueryServiceSubscribers: MeQueryServiceSubscribers = {};

const triggerMeQuery = (variablesString: string, variables: MeQueryVariables) => {
  getUrqlClient()
    .query<MeQuery, MeQueryVariables>(MeDocument, variables)
    .toPromise()
    .then((result) => {
      meQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "MeQuery.ERROR" : "MeQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const meQueryService =
  (variables: MeQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (meQueryServiceSubscribers[variablesString]) {
      meQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      meQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerMeQuery(variablesString, variables);
    if (!meQueryServiceSubscribers[variablesString].intervalId) {
      meQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerMeQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = meQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        meQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        meQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runMeWithWorkspaceLoadingInfoQuery = async (variables: MeWithWorkspaceLoadingInfoQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<MeWithWorkspaceLoadingInfoQuery, MeWithWorkspaceLoadingInfoQueryVariables>(
      MeWithWorkspaceLoadingInfoDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type MeWithWorkspaceLoadingInfoQueryResult = Urql.OperationResult<MeWithWorkspaceLoadingInfoQuery, MeWithWorkspaceLoadingInfoQueryVariables>;

export type MeWithWorkspaceLoadingInfoQueryUpdateResultEvent = {
  type: "MeWithWorkspaceLoadingInfoQuery.UPDATE_RESULT";
  result: MeWithWorkspaceLoadingInfoQueryResult;
};

export type MeWithWorkspaceLoadingInfoQueryErrorEvent = {
  type: "MeWithWorkspaceLoadingInfoQuery.ERROR";
  result: MeWithWorkspaceLoadingInfoQueryResult;
};

export type MeWithWorkspaceLoadingInfoQueryServiceEvent = MeWithWorkspaceLoadingInfoQueryUpdateResultEvent | MeWithWorkspaceLoadingInfoQueryErrorEvent;

type MeWithWorkspaceLoadingInfoQueryServiceSubscribersEntry = {
  variables: MeWithWorkspaceLoadingInfoQueryVariables;
  callbacks: ((event: MeWithWorkspaceLoadingInfoQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type MeWithWorkspaceLoadingInfoQueryServiceSubscribers = {
  [variables: string]: MeWithWorkspaceLoadingInfoQueryServiceSubscribersEntry;
};

const meWithWorkspaceLoadingInfoQueryServiceSubscribers: MeWithWorkspaceLoadingInfoQueryServiceSubscribers = {};

const triggerMeWithWorkspaceLoadingInfoQuery = (variablesString: string, variables: MeWithWorkspaceLoadingInfoQueryVariables) => {
  getUrqlClient()
    .query<MeWithWorkspaceLoadingInfoQuery, MeWithWorkspaceLoadingInfoQueryVariables>(MeWithWorkspaceLoadingInfoDocument, variables)
    .toPromise()
    .then((result) => {
      meWithWorkspaceLoadingInfoQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "MeWithWorkspaceLoadingInfoQuery.ERROR" : "MeWithWorkspaceLoadingInfoQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const meWithWorkspaceLoadingInfoQueryService =
  (variables: MeWithWorkspaceLoadingInfoQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (meWithWorkspaceLoadingInfoQueryServiceSubscribers[variablesString]) {
      meWithWorkspaceLoadingInfoQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      meWithWorkspaceLoadingInfoQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerMeWithWorkspaceLoadingInfoQuery(variablesString, variables);
    if (!meWithWorkspaceLoadingInfoQueryServiceSubscribers[variablesString].intervalId) {
      meWithWorkspaceLoadingInfoQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerMeWithWorkspaceLoadingInfoQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = meWithWorkspaceLoadingInfoQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        meWithWorkspaceLoadingInfoQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        meWithWorkspaceLoadingInfoQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runPendingWorkspaceInvitationQuery = async (variables: PendingWorkspaceInvitationQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<PendingWorkspaceInvitationQuery, PendingWorkspaceInvitationQueryVariables>(
      PendingWorkspaceInvitationDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type PendingWorkspaceInvitationQueryResult = Urql.OperationResult<PendingWorkspaceInvitationQuery, PendingWorkspaceInvitationQueryVariables>;

export type PendingWorkspaceInvitationQueryUpdateResultEvent = {
  type: "PendingWorkspaceInvitationQuery.UPDATE_RESULT";
  result: PendingWorkspaceInvitationQueryResult;
};

export type PendingWorkspaceInvitationQueryErrorEvent = {
  type: "PendingWorkspaceInvitationQuery.ERROR";
  result: PendingWorkspaceInvitationQueryResult;
};

export type PendingWorkspaceInvitationQueryServiceEvent = PendingWorkspaceInvitationQueryUpdateResultEvent | PendingWorkspaceInvitationQueryErrorEvent;

type PendingWorkspaceInvitationQueryServiceSubscribersEntry = {
  variables: PendingWorkspaceInvitationQueryVariables;
  callbacks: ((event: PendingWorkspaceInvitationQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type PendingWorkspaceInvitationQueryServiceSubscribers = {
  [variables: string]: PendingWorkspaceInvitationQueryServiceSubscribersEntry;
};

const pendingWorkspaceInvitationQueryServiceSubscribers: PendingWorkspaceInvitationQueryServiceSubscribers = {};

const triggerPendingWorkspaceInvitationQuery = (variablesString: string, variables: PendingWorkspaceInvitationQueryVariables) => {
  getUrqlClient()
    .query<PendingWorkspaceInvitationQuery, PendingWorkspaceInvitationQueryVariables>(PendingWorkspaceInvitationDocument, variables)
    .toPromise()
    .then((result) => {
      pendingWorkspaceInvitationQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "PendingWorkspaceInvitationQuery.ERROR" : "PendingWorkspaceInvitationQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const pendingWorkspaceInvitationQueryService =
  (variables: PendingWorkspaceInvitationQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (pendingWorkspaceInvitationQueryServiceSubscribers[variablesString]) {
      pendingWorkspaceInvitationQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      pendingWorkspaceInvitationQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerPendingWorkspaceInvitationQuery(variablesString, variables);
    if (!pendingWorkspaceInvitationQueryServiceSubscribers[variablesString].intervalId) {
      pendingWorkspaceInvitationQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerPendingWorkspaceInvitationQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = pendingWorkspaceInvitationQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        pendingWorkspaceInvitationQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        pendingWorkspaceInvitationQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runRootFoldersQuery = async (variables: RootFoldersQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<RootFoldersQuery, RootFoldersQueryVariables>(
      RootFoldersDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type RootFoldersQueryResult = Urql.OperationResult<RootFoldersQuery, RootFoldersQueryVariables>;

export type RootFoldersQueryUpdateResultEvent = {
  type: "RootFoldersQuery.UPDATE_RESULT";
  result: RootFoldersQueryResult;
};

export type RootFoldersQueryErrorEvent = {
  type: "RootFoldersQuery.ERROR";
  result: RootFoldersQueryResult;
};

export type RootFoldersQueryServiceEvent = RootFoldersQueryUpdateResultEvent | RootFoldersQueryErrorEvent;

type RootFoldersQueryServiceSubscribersEntry = {
  variables: RootFoldersQueryVariables;
  callbacks: ((event: RootFoldersQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type RootFoldersQueryServiceSubscribers = {
  [variables: string]: RootFoldersQueryServiceSubscribersEntry;
};

const rootFoldersQueryServiceSubscribers: RootFoldersQueryServiceSubscribers = {};

const triggerRootFoldersQuery = (variablesString: string, variables: RootFoldersQueryVariables) => {
  getUrqlClient()
    .query<RootFoldersQuery, RootFoldersQueryVariables>(RootFoldersDocument, variables)
    .toPromise()
    .then((result) => {
      rootFoldersQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "RootFoldersQuery.ERROR" : "RootFoldersQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const rootFoldersQueryService =
  (variables: RootFoldersQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (rootFoldersQueryServiceSubscribers[variablesString]) {
      rootFoldersQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      rootFoldersQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerRootFoldersQuery(variablesString, variables);
    if (!rootFoldersQueryServiceSubscribers[variablesString].intervalId) {
      rootFoldersQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerRootFoldersQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = rootFoldersQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        rootFoldersQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        rootFoldersQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runUnauthorizedDevicesForWorkspacesQuery = async (variables: UnauthorizedDevicesForWorkspacesQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<UnauthorizedDevicesForWorkspacesQuery, UnauthorizedDevicesForWorkspacesQueryVariables>(
      UnauthorizedDevicesForWorkspacesDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type UnauthorizedDevicesForWorkspacesQueryResult = Urql.OperationResult<UnauthorizedDevicesForWorkspacesQuery, UnauthorizedDevicesForWorkspacesQueryVariables>;

export type UnauthorizedDevicesForWorkspacesQueryUpdateResultEvent = {
  type: "UnauthorizedDevicesForWorkspacesQuery.UPDATE_RESULT";
  result: UnauthorizedDevicesForWorkspacesQueryResult;
};

export type UnauthorizedDevicesForWorkspacesQueryErrorEvent = {
  type: "UnauthorizedDevicesForWorkspacesQuery.ERROR";
  result: UnauthorizedDevicesForWorkspacesQueryResult;
};

export type UnauthorizedDevicesForWorkspacesQueryServiceEvent = UnauthorizedDevicesForWorkspacesQueryUpdateResultEvent | UnauthorizedDevicesForWorkspacesQueryErrorEvent;

type UnauthorizedDevicesForWorkspacesQueryServiceSubscribersEntry = {
  variables: UnauthorizedDevicesForWorkspacesQueryVariables;
  callbacks: ((event: UnauthorizedDevicesForWorkspacesQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type UnauthorizedDevicesForWorkspacesQueryServiceSubscribers = {
  [variables: string]: UnauthorizedDevicesForWorkspacesQueryServiceSubscribersEntry;
};

const unauthorizedDevicesForWorkspacesQueryServiceSubscribers: UnauthorizedDevicesForWorkspacesQueryServiceSubscribers = {};

const triggerUnauthorizedDevicesForWorkspacesQuery = (variablesString: string, variables: UnauthorizedDevicesForWorkspacesQueryVariables) => {
  getUrqlClient()
    .query<UnauthorizedDevicesForWorkspacesQuery, UnauthorizedDevicesForWorkspacesQueryVariables>(UnauthorizedDevicesForWorkspacesDocument, variables)
    .toPromise()
    .then((result) => {
      unauthorizedDevicesForWorkspacesQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "UnauthorizedDevicesForWorkspacesQuery.ERROR" : "UnauthorizedDevicesForWorkspacesQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const unauthorizedDevicesForWorkspacesQueryService =
  (variables: UnauthorizedDevicesForWorkspacesQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (unauthorizedDevicesForWorkspacesQueryServiceSubscribers[variablesString]) {
      unauthorizedDevicesForWorkspacesQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      unauthorizedDevicesForWorkspacesQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerUnauthorizedDevicesForWorkspacesQuery(variablesString, variables);
    if (!unauthorizedDevicesForWorkspacesQueryServiceSubscribers[variablesString].intervalId) {
      unauthorizedDevicesForWorkspacesQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerUnauthorizedDevicesForWorkspacesQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = unauthorizedDevicesForWorkspacesQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        unauthorizedDevicesForWorkspacesQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        unauthorizedDevicesForWorkspacesQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runUnauthorizedMembersQuery = async (variables: UnauthorizedMembersQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<UnauthorizedMembersQuery, UnauthorizedMembersQueryVariables>(
      UnauthorizedMembersDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type UnauthorizedMembersQueryResult = Urql.OperationResult<UnauthorizedMembersQuery, UnauthorizedMembersQueryVariables>;

export type UnauthorizedMembersQueryUpdateResultEvent = {
  type: "UnauthorizedMembersQuery.UPDATE_RESULT";
  result: UnauthorizedMembersQueryResult;
};

export type UnauthorizedMembersQueryErrorEvent = {
  type: "UnauthorizedMembersQuery.ERROR";
  result: UnauthorizedMembersQueryResult;
};

export type UnauthorizedMembersQueryServiceEvent = UnauthorizedMembersQueryUpdateResultEvent | UnauthorizedMembersQueryErrorEvent;

type UnauthorizedMembersQueryServiceSubscribersEntry = {
  variables: UnauthorizedMembersQueryVariables;
  callbacks: ((event: UnauthorizedMembersQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type UnauthorizedMembersQueryServiceSubscribers = {
  [variables: string]: UnauthorizedMembersQueryServiceSubscribersEntry;
};

const unauthorizedMembersQueryServiceSubscribers: UnauthorizedMembersQueryServiceSubscribers = {};

const triggerUnauthorizedMembersQuery = (variablesString: string, variables: UnauthorizedMembersQueryVariables) => {
  getUrqlClient()
    .query<UnauthorizedMembersQuery, UnauthorizedMembersQueryVariables>(UnauthorizedMembersDocument, variables)
    .toPromise()
    .then((result) => {
      unauthorizedMembersQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "UnauthorizedMembersQuery.ERROR" : "UnauthorizedMembersQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const unauthorizedMembersQueryService =
  (variables: UnauthorizedMembersQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (unauthorizedMembersQueryServiceSubscribers[variablesString]) {
      unauthorizedMembersQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      unauthorizedMembersQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerUnauthorizedMembersQuery(variablesString, variables);
    if (!unauthorizedMembersQueryServiceSubscribers[variablesString].intervalId) {
      unauthorizedMembersQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerUnauthorizedMembersQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = unauthorizedMembersQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        unauthorizedMembersQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        unauthorizedMembersQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runUserIdFromUsernameQuery = async (variables: UserIdFromUsernameQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<UserIdFromUsernameQuery, UserIdFromUsernameQueryVariables>(
      UserIdFromUsernameDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type UserIdFromUsernameQueryResult = Urql.OperationResult<UserIdFromUsernameQuery, UserIdFromUsernameQueryVariables>;

export type UserIdFromUsernameQueryUpdateResultEvent = {
  type: "UserIdFromUsernameQuery.UPDATE_RESULT";
  result: UserIdFromUsernameQueryResult;
};

export type UserIdFromUsernameQueryErrorEvent = {
  type: "UserIdFromUsernameQuery.ERROR";
  result: UserIdFromUsernameQueryResult;
};

export type UserIdFromUsernameQueryServiceEvent = UserIdFromUsernameQueryUpdateResultEvent | UserIdFromUsernameQueryErrorEvent;

type UserIdFromUsernameQueryServiceSubscribersEntry = {
  variables: UserIdFromUsernameQueryVariables;
  callbacks: ((event: UserIdFromUsernameQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type UserIdFromUsernameQueryServiceSubscribers = {
  [variables: string]: UserIdFromUsernameQueryServiceSubscribersEntry;
};

const userIdFromUsernameQueryServiceSubscribers: UserIdFromUsernameQueryServiceSubscribers = {};

const triggerUserIdFromUsernameQuery = (variablesString: string, variables: UserIdFromUsernameQueryVariables) => {
  getUrqlClient()
    .query<UserIdFromUsernameQuery, UserIdFromUsernameQueryVariables>(UserIdFromUsernameDocument, variables)
    .toPromise()
    .then((result) => {
      userIdFromUsernameQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "UserIdFromUsernameQuery.ERROR" : "UserIdFromUsernameQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const userIdFromUsernameQueryService =
  (variables: UserIdFromUsernameQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (userIdFromUsernameQueryServiceSubscribers[variablesString]) {
      userIdFromUsernameQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      userIdFromUsernameQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerUserIdFromUsernameQuery(variablesString, variables);
    if (!userIdFromUsernameQueryServiceSubscribers[variablesString].intervalId) {
      userIdFromUsernameQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerUserIdFromUsernameQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = userIdFromUsernameQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        userIdFromUsernameQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        userIdFromUsernameQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceQuery = async (variables: WorkspaceQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceQuery, WorkspaceQueryVariables>(
      WorkspaceDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceQueryResult = Urql.OperationResult<WorkspaceQuery, WorkspaceQueryVariables>;

export type WorkspaceQueryUpdateResultEvent = {
  type: "WorkspaceQuery.UPDATE_RESULT";
  result: WorkspaceQueryResult;
};

export type WorkspaceQueryErrorEvent = {
  type: "WorkspaceQuery.ERROR";
  result: WorkspaceQueryResult;
};

export type WorkspaceQueryServiceEvent = WorkspaceQueryUpdateResultEvent | WorkspaceQueryErrorEvent;

type WorkspaceQueryServiceSubscribersEntry = {
  variables: WorkspaceQueryVariables;
  callbacks: ((event: WorkspaceQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceQueryServiceSubscribers = {
  [variables: string]: WorkspaceQueryServiceSubscribersEntry;
};

const workspaceQueryServiceSubscribers: WorkspaceQueryServiceSubscribers = {};

const triggerWorkspaceQuery = (variablesString: string, variables: WorkspaceQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceQuery, WorkspaceQueryVariables>(WorkspaceDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceQuery.ERROR" : "WorkspaceQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const workspaceQueryService =
  (variables: WorkspaceQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceQueryServiceSubscribers[variablesString]) {
      workspaceQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceQuery(variablesString, variables);
    if (!workspaceQueryServiceSubscribers[variablesString].intervalId) {
      workspaceQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        workspaceQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceDevicesQuery = async (variables: WorkspaceDevicesQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceDevicesQuery, WorkspaceDevicesQueryVariables>(
      WorkspaceDevicesDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceDevicesQueryResult = Urql.OperationResult<WorkspaceDevicesQuery, WorkspaceDevicesQueryVariables>;

export type WorkspaceDevicesQueryUpdateResultEvent = {
  type: "WorkspaceDevicesQuery.UPDATE_RESULT";
  result: WorkspaceDevicesQueryResult;
};

export type WorkspaceDevicesQueryErrorEvent = {
  type: "WorkspaceDevicesQuery.ERROR";
  result: WorkspaceDevicesQueryResult;
};

export type WorkspaceDevicesQueryServiceEvent = WorkspaceDevicesQueryUpdateResultEvent | WorkspaceDevicesQueryErrorEvent;

type WorkspaceDevicesQueryServiceSubscribersEntry = {
  variables: WorkspaceDevicesQueryVariables;
  callbacks: ((event: WorkspaceDevicesQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceDevicesQueryServiceSubscribers = {
  [variables: string]: WorkspaceDevicesQueryServiceSubscribersEntry;
};

const workspaceDevicesQueryServiceSubscribers: WorkspaceDevicesQueryServiceSubscribers = {};

const triggerWorkspaceDevicesQuery = (variablesString: string, variables: WorkspaceDevicesQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceDevicesQuery, WorkspaceDevicesQueryVariables>(WorkspaceDevicesDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceDevicesQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceDevicesQuery.ERROR" : "WorkspaceDevicesQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const workspaceDevicesQueryService =
  (variables: WorkspaceDevicesQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceDevicesQueryServiceSubscribers[variablesString]) {
      workspaceDevicesQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceDevicesQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceDevicesQuery(variablesString, variables);
    if (!workspaceDevicesQueryServiceSubscribers[variablesString].intervalId) {
      workspaceDevicesQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceDevicesQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceDevicesQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceDevicesQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        workspaceDevicesQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceInvitationQuery = async (variables: WorkspaceInvitationQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceInvitationQuery, WorkspaceInvitationQueryVariables>(
      WorkspaceInvitationDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceInvitationQueryResult = Urql.OperationResult<WorkspaceInvitationQuery, WorkspaceInvitationQueryVariables>;

export type WorkspaceInvitationQueryUpdateResultEvent = {
  type: "WorkspaceInvitationQuery.UPDATE_RESULT";
  result: WorkspaceInvitationQueryResult;
};

export type WorkspaceInvitationQueryErrorEvent = {
  type: "WorkspaceInvitationQuery.ERROR";
  result: WorkspaceInvitationQueryResult;
};

export type WorkspaceInvitationQueryServiceEvent = WorkspaceInvitationQueryUpdateResultEvent | WorkspaceInvitationQueryErrorEvent;

type WorkspaceInvitationQueryServiceSubscribersEntry = {
  variables: WorkspaceInvitationQueryVariables;
  callbacks: ((event: WorkspaceInvitationQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceInvitationQueryServiceSubscribers = {
  [variables: string]: WorkspaceInvitationQueryServiceSubscribersEntry;
};

const workspaceInvitationQueryServiceSubscribers: WorkspaceInvitationQueryServiceSubscribers = {};

const triggerWorkspaceInvitationQuery = (variablesString: string, variables: WorkspaceInvitationQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceInvitationQuery, WorkspaceInvitationQueryVariables>(WorkspaceInvitationDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceInvitationQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceInvitationQuery.ERROR" : "WorkspaceInvitationQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const workspaceInvitationQueryService =
  (variables: WorkspaceInvitationQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceInvitationQueryServiceSubscribers[variablesString]) {
      workspaceInvitationQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceInvitationQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceInvitationQuery(variablesString, variables);
    if (!workspaceInvitationQueryServiceSubscribers[variablesString].intervalId) {
      workspaceInvitationQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceInvitationQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceInvitationQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceInvitationQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        workspaceInvitationQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceInvitationsQuery = async (variables: WorkspaceInvitationsQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceInvitationsQuery, WorkspaceInvitationsQueryVariables>(
      WorkspaceInvitationsDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceInvitationsQueryResult = Urql.OperationResult<WorkspaceInvitationsQuery, WorkspaceInvitationsQueryVariables>;

export type WorkspaceInvitationsQueryUpdateResultEvent = {
  type: "WorkspaceInvitationsQuery.UPDATE_RESULT";
  result: WorkspaceInvitationsQueryResult;
};

export type WorkspaceInvitationsQueryErrorEvent = {
  type: "WorkspaceInvitationsQuery.ERROR";
  result: WorkspaceInvitationsQueryResult;
};

export type WorkspaceInvitationsQueryServiceEvent = WorkspaceInvitationsQueryUpdateResultEvent | WorkspaceInvitationsQueryErrorEvent;

type WorkspaceInvitationsQueryServiceSubscribersEntry = {
  variables: WorkspaceInvitationsQueryVariables;
  callbacks: ((event: WorkspaceInvitationsQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceInvitationsQueryServiceSubscribers = {
  [variables: string]: WorkspaceInvitationsQueryServiceSubscribersEntry;
};

const workspaceInvitationsQueryServiceSubscribers: WorkspaceInvitationsQueryServiceSubscribers = {};

const triggerWorkspaceInvitationsQuery = (variablesString: string, variables: WorkspaceInvitationsQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceInvitationsQuery, WorkspaceInvitationsQueryVariables>(WorkspaceInvitationsDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceInvitationsQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceInvitationsQuery.ERROR" : "WorkspaceInvitationsQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const workspaceInvitationsQueryService =
  (variables: WorkspaceInvitationsQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceInvitationsQueryServiceSubscribers[variablesString]) {
      workspaceInvitationsQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceInvitationsQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceInvitationsQuery(variablesString, variables);
    if (!workspaceInvitationsQueryServiceSubscribers[variablesString].intervalId) {
      workspaceInvitationsQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceInvitationsQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceInvitationsQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceInvitationsQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        workspaceInvitationsQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspacesQuery = async (variables: WorkspacesQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspacesQuery, WorkspacesQueryVariables>(
      WorkspacesDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspacesQueryResult = Urql.OperationResult<WorkspacesQuery, WorkspacesQueryVariables>;

export type WorkspacesQueryUpdateResultEvent = {
  type: "WorkspacesQuery.UPDATE_RESULT";
  result: WorkspacesQueryResult;
};

export type WorkspacesQueryErrorEvent = {
  type: "WorkspacesQuery.ERROR";
  result: WorkspacesQueryResult;
};

export type WorkspacesQueryServiceEvent = WorkspacesQueryUpdateResultEvent | WorkspacesQueryErrorEvent;

type WorkspacesQueryServiceSubscribersEntry = {
  variables: WorkspacesQueryVariables;
  callbacks: ((event: WorkspacesQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspacesQueryServiceSubscribers = {
  [variables: string]: WorkspacesQueryServiceSubscribersEntry;
};

const workspacesQueryServiceSubscribers: WorkspacesQueryServiceSubscribers = {};

const triggerWorkspacesQuery = (variablesString: string, variables: WorkspacesQueryVariables) => {
  getUrqlClient()
    .query<WorkspacesQuery, WorkspacesQueryVariables>(WorkspacesDocument, variables)
    .toPromise()
    .then((result) => {
      workspacesQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspacesQuery.ERROR" : "WorkspacesQuery.UPDATE_RESULT",
            result: result,
          });
        }
      );
    });
};

/**
 * This service is used to query results every 4 seconds.
 *
 * It allows machines to spawn a service that will fetch the query
 * and send the result to the machine.
 * It will share the same interval for all machines.
 * When the last subscription is stopped, the interval will be cleared.
 * It also considers the variables passed to the service.
 */
export const workspacesQueryService =
  (variables: WorkspacesQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspacesQueryServiceSubscribers[variablesString]) {
      workspacesQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspacesQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspacesQuery(variablesString, variables);
    if (!workspacesQueryServiceSubscribers[variablesString].intervalId) {
      workspacesQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspacesQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspacesQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspacesQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        clearInterval(intervalId);
        workspacesQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };

