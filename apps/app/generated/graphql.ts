import { getUrqlClient } from '../utils/urqlClient/urqlClient';
import canonicalize from 'canonicalize';
import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type AcceptWorkspaceInvitationInput = {
  serializedWorkspaceChainEvent: Scalars['String']['input'];
  serializedWorkspaceMemberDevicesProof: Scalars['String']['input'];
};

export type AcceptWorkspaceInvitationResult = {
  __typename?: 'AcceptWorkspaceInvitationResult';
  workspaceId: Scalars['String']['output'];
};

export type ActiveWorkspaceKeysResult = {
  __typename?: 'ActiveWorkspaceKeysResult';
  activeWorkspaceKeys: Array<WorkspaceKey>;
};

export type AddDeviceInput = {
  deviceEncryptionPublicKey: Scalars['String']['input'];
  deviceEncryptionPublicKeySignature: Scalars['String']['input'];
  deviceInfo: Scalars['String']['input'];
  deviceSigningPublicKey: Scalars['String']['input'];
  deviceType: Scalars['String']['input'];
  loginId: Scalars['String']['input'];
  serializedUserChainEvent: Scalars['String']['input'];
  sessionTokenSignature: Scalars['String']['input'];
  webDeviceCiphertext?: InputMaybe<Scalars['String']['input']>;
  webDeviceNonce?: InputMaybe<Scalars['String']['input']>;
  workspaceMemberDevicesProofs: Array<WorkspaceMemberDevicesProofEntryInput>;
};

export type AddDeviceResult = {
  __typename?: 'AddDeviceResult';
  expiresAt: Scalars['Date']['output'];
  webDeviceAccessToken?: Maybe<Scalars['String']['output']>;
};

export type AddMemberWorkspaceKeyInput = {
  workspaceKeyBoxes: Array<WorkspaceDeviceInput>;
  workspaceKeyId: Scalars['String']['input'];
};

export type AttachDeviceToWorkspacesInput = {
  creatorDeviceSigningPublicKey: Scalars['String']['input'];
  deviceWorkspaceKeyBoxes: Array<WorkspaceKeyBoxData>;
  receiverDeviceSigningPublicKey: Scalars['String']['input'];
};

export type AttachDeviceToWorkspacesResult = {
  __typename?: 'AttachDeviceToWorkspacesResult';
  workspaceKeys: Array<WorkspaceKey>;
};

export type AuthorizeMemberInput = {
  creatorDeviceSigningPublicKey: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
  workspaceKeys: Array<AddMemberWorkspaceKeyInput>;
};

export type AuthorizeMemberResult = {
  __typename?: 'AuthorizeMemberResult';
  success: Scalars['Boolean']['output'];
};

export type Comment = {
  __typename?: 'Comment';
  commentReplies?: Maybe<Array<Maybe<CommentReply>>>;
  contentCiphertext: Scalars['String']['output'];
  contentNonce: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  creatorDevice: CreatorDevice;
  documentId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  signature: Scalars['String']['output'];
  snapshotId: Scalars['String']['output'];
  subkeyId: Scalars['String']['output'];
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
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Comment>;
};

export type CommentReply = {
  __typename?: 'CommentReply';
  commentId: Scalars['String']['output'];
  contentCiphertext: Scalars['String']['output'];
  contentNonce: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  creatorDevice: CreatorDevice;
  documentId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  signature: Scalars['String']['output'];
  snapshotId: Scalars['String']['output'];
  subkeyId: Scalars['String']['output'];
};

export type CreateCommentInput = {
  commentId: Scalars['String']['input'];
  contentCiphertext: Scalars['String']['input'];
  contentNonce: Scalars['String']['input'];
  documentShareLinkToken?: InputMaybe<Scalars['String']['input']>;
  signature: Scalars['String']['input'];
  snapshotId: Scalars['String']['input'];
  subkeyId: Scalars['String']['input'];
};

export type CreateCommentReplyInput = {
  commentId: Scalars['String']['input'];
  commentReplyId: Scalars['String']['input'];
  contentCiphertext: Scalars['String']['input'];
  contentNonce: Scalars['String']['input'];
  documentShareLinkToken?: InputMaybe<Scalars['String']['input']>;
  signature: Scalars['String']['input'];
  snapshotId: Scalars['String']['input'];
  subkeyId: Scalars['String']['input'];
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
  nameCiphertext: Scalars['String']['input'];
  nameNonce: Scalars['String']['input'];
  parentFolderId: Scalars['String']['input'];
  serializedDocumentChainEvent: Scalars['String']['input'];
  snapshot: DocumentSnapshotInput;
  subkeyId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type CreateDocumentResult = {
  __typename?: 'CreateDocumentResult';
  id: Scalars['String']['output'];
};

export type CreateDocumentShareLinkInput = {
  deviceSecretBoxCiphertext: Scalars['String']['input'];
  deviceSecretBoxNonce: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  serializedDocumentChainEvent: Scalars['String']['input'];
  snapshotDeviceKeyBox: SnapshotDeviceKeyBoxInput;
};

export type CreateDocumentShareLinkResult = {
  __typename?: 'CreateDocumentShareLinkResult';
  token: Scalars['String']['output'];
};

export type CreateFolderInput = {
  id: Scalars['String']['input'];
  keyDerivationTrace: KeyDerivationTraceInput;
  nameCiphertext: Scalars['String']['input'];
  nameNonce: Scalars['String']['input'];
  parentFolderId?: InputMaybe<Scalars['String']['input']>;
  signature: Scalars['String']['input'];
  subkeyId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
  workspaceKeyId: Scalars['String']['input'];
  workspaceMemberDevicesProofHash: Scalars['String']['input'];
};

export type CreateFolderResult = {
  __typename?: 'CreateFolderResult';
  folder?: Maybe<Folder>;
};

export type CreateInitialDocumentInput = {
  nameCiphertext: Scalars['String']['input'];
  nameNonce: Scalars['String']['input'];
  serializedDocumentChainEvent: Scalars['String']['input'];
  snapshot: DocumentSnapshotInput;
  subkeyId: Scalars['String']['input'];
};

export type CreateInitialFolderInput = {
  id: Scalars['String']['input'];
  keyDerivationTrace: KeyDerivationTraceInput;
  nameCiphertext: Scalars['String']['input'];
  nameNonce: Scalars['String']['input'];
  signature: Scalars['String']['input'];
};

export type CreateInitialWorkspaceInput = {
  deviceWorkspaceKeyBoxes: Array<DeviceWorkspaceKeyBoxInput>;
  infoCiphertext: Scalars['String']['input'];
  infoNonce: Scalars['String']['input'];
  infoSignature: Scalars['String']['input'];
  workspaceKeyId: Scalars['String']['input'];
};

export type CreateInitialWorkspaceStructureInput = {
  creatorDeviceSigningPublicKey: Scalars['String']['input'];
  document: CreateInitialDocumentInput;
  folder: CreateInitialFolderInput;
  serializedWorkspaceChainEvent: Scalars['String']['input'];
  serializedWorkspaceMemberDevicesProof: Scalars['String']['input'];
  workspace: CreateInitialWorkspaceInput;
};

export type CreateInitialWorkspaceStructureResult = {
  __typename?: 'CreateInitialWorkspaceStructureResult';
  document?: Maybe<Document>;
  folder?: Maybe<Folder>;
  workspace?: Maybe<Workspace>;
};

export type CreateWorkspaceInvitationInput = {
  serializedWorkspaceChainEvent: Scalars['String']['input'];
  serializedWorkspaceMemberDevicesProof: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type CreateWorkspaceInvitationResult = {
  __typename?: 'CreateWorkspaceInvitationResult';
  workspaceInvitation?: Maybe<WorkspaceInvitation>;
};

export type CreatorDevice = {
  __typename?: 'CreatorDevice';
  createdAt?: Maybe<Scalars['Date']['output']>;
  encryptionPublicKey: Scalars['String']['output'];
  encryptionPublicKeySignature: Scalars['String']['output'];
  signingPublicKey: Scalars['String']['output'];
};

export type DeleteCommentRepliesInput = {
  commentReplyIds: Array<Scalars['String']['input']>;
};

export type DeleteCommentRepliesResult = {
  __typename?: 'DeleteCommentRepliesResult';
  status: Scalars['String']['output'];
};

export type DeleteCommentsInput = {
  commentIds: Array<Scalars['String']['input']>;
  documentShareLinkToken?: InputMaybe<Scalars['String']['input']>;
};

export type DeleteCommentsResult = {
  __typename?: 'DeleteCommentsResult';
  status: Scalars['String']['output'];
};

export type DeleteDeviceInput = {
  creatorSigningPublicKey: Scalars['String']['input'];
  newDeviceWorkspaceKeyBoxes: Array<WorkspaceWithWorkspaceDevicesParingInput>;
  serializedUserChainEvent: Scalars['String']['input'];
  workspaceMemberDevicesProofs: Array<WorkspaceMemberDevicesProofEntryInput>;
};

export type DeleteDeviceResult = {
  __typename?: 'DeleteDeviceResult';
  status: Scalars['String']['output'];
};

export type DeleteDocumentsInput = {
  ids: Array<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};

export type DeleteDocumentsResult = {
  __typename?: 'DeleteDocumentsResult';
  status: Scalars['String']['output'];
};

export type DeleteFoldersInput = {
  ids: Array<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};

export type DeleteFoldersResult = {
  __typename?: 'DeleteFoldersResult';
  status: Scalars['String']['output'];
};

export type DeleteWorkspaceInvitationsInput = {
  serializedWorkspaceChainEvent: Scalars['String']['input'];
  serializedWorkspaceMemberDevicesProof: Scalars['String']['input'];
};

export type DeleteWorkspaceInvitationsResult = {
  __typename?: 'DeleteWorkspaceInvitationsResult';
  status: Scalars['String']['output'];
};

export type DeleteWorkspacesInput = {
  ids: Array<Scalars['String']['input']>;
};

export type DeleteWorkspacesResult = {
  __typename?: 'DeleteWorkspacesResult';
  status: Scalars['String']['output'];
};

export type Device = {
  __typename?: 'Device';
  createdAt?: Maybe<Scalars['Date']['output']>;
  info?: Maybe<Scalars['String']['output']>;
  signingPublicKey: Scalars['String']['output'];
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
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Device>;
};

export type DeviceWorkspaceKeyBoxInput = {
  ciphertext: Scalars['String']['input'];
  deviceSigningPublicKey: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
};

export type Document = {
  __typename?: 'Document';
  id: Scalars['String']['output'];
  nameCiphertext: Scalars['String']['output'];
  nameNonce: Scalars['String']['output'];
  parentFolderId?: Maybe<Scalars['String']['output']>;
  rootFolderId?: Maybe<Scalars['String']['output']>;
  subkeyId: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
  workspaceKey?: Maybe<WorkspaceKey>;
};

export type DocumentChainEvent = {
  __typename?: 'DocumentChainEvent';
  position: Scalars['Int']['output'];
  serializedContent: Scalars['String']['output'];
};

export type DocumentChainEventConnection = {
  __typename?: 'DocumentChainEventConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<DocumentChainEventEdge>>>;
  /** Flattened list of DocumentChainEvent type */
  nodes?: Maybe<Array<Maybe<DocumentChainEvent>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type DocumentChainEventEdge = {
  __typename?: 'DocumentChainEventEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<DocumentChainEvent>;
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
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Document>;
};

export type DocumentShareLink = {
  __typename?: 'DocumentShareLink';
  deviceSigningPublicKey: Scalars['String']['output'];
  token: Scalars['String']['output'];
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
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<DocumentShareLink>;
};

export type DocumentShareLinkForSharePage = {
  __typename?: 'DocumentShareLinkForSharePage';
  activeSnapshotKeyBox: SnapshotKeyBox;
  deviceEncryptionPublicKey: Scalars['String']['output'];
  deviceEncryptionPublicKeySignature: Scalars['String']['output'];
  deviceSecretBoxCiphertext: Scalars['String']['output'];
  deviceSecretBoxNonce: Scalars['String']['output'];
  deviceSigningPublicKey: Scalars['String']['output'];
  role: ShareDocumentRole;
  token: Scalars['String']['output'];
  websocketSessionKey: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
};

export type DocumentSnapshotInput = {
  ciphertext: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
  publicData: DocumentSnapshotPublicDataInput;
  signature: Scalars['String']['input'];
};

export type DocumentSnapshotPublicDataInput = {
  docId: Scalars['String']['input'];
  documentChainEventHash: Scalars['String']['input'];
  keyDerivationTrace: KeyDerivationTraceInput;
  parentSnapshotId: Scalars['String']['input'];
  parentSnapshotProof: Scalars['String']['input'];
  parentSnapshotUpdateClocks: DocumentSnapshotPublicDataParentSnapshotClocksInput;
  pubKey: Scalars['String']['input'];
  snapshotId?: InputMaybe<Scalars['String']['input']>;
  workspaceMemberDevicesProof: WorkspaceMemberDevicesProofInput;
};

export type DocumentSnapshotPublicDataParentSnapshotClocksInput = {
  dummy?: InputMaybe<Scalars['String']['input']>;
};

export type EncryptedWebDeviceResult = {
  __typename?: 'EncryptedWebDeviceResult';
  ciphertext: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
};

export type File = {
  __typename?: 'File';
  downloadUrl: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type FinishLoginInput = {
  loginId: Scalars['String']['input'];
  message: Scalars['String']['input'];
};

export type FinishLoginMainDevice = {
  __typename?: 'FinishLoginMainDevice';
  ciphertext: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
};

export type FinishLoginResult = {
  __typename?: 'FinishLoginResult';
  mainDevice: FinishLoginMainDevice;
  userChain: Array<UserChainEvent>;
  workspaceMemberDevicesProofs: Array<WorkspaceMemberDevicesProof>;
};

export type FinishRegistrationDeviceInput = {
  ciphertext: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
};

export type FinishRegistrationInput = {
  encryptedMainDevice: FinishRegistrationDeviceInput;
  pendingWorkspaceInvitationId?: InputMaybe<Scalars['String']['input']>;
  pendingWorkspaceInvitationKeyCiphertext?: InputMaybe<Scalars['String']['input']>;
  pendingWorkspaceInvitationKeyPublicNonce?: InputMaybe<Scalars['String']['input']>;
  pendingWorkspaceInvitationKeySubkeyId?: InputMaybe<Scalars['String']['input']>;
  registrationRecord: Scalars['String']['input'];
  serializedUserChainEvent: Scalars['String']['input'];
};

export type FinishRegistrationResult = {
  __typename?: 'FinishRegistrationResult';
  id: Scalars['String']['output'];
  verificationCode?: Maybe<Scalars['String']['output']>;
};

export type Folder = {
  __typename?: 'Folder';
  creatorDeviceSigningPublicKey: Scalars['String']['output'];
  id: Scalars['String']['output'];
  keyDerivationTrace: KeyDerivationTrace;
  nameCiphertext: Scalars['String']['output'];
  nameNonce: Scalars['String']['output'];
  parentFolderId?: Maybe<Scalars['String']['output']>;
  rootFolderId?: Maybe<Scalars['String']['output']>;
  signature: Scalars['String']['output'];
  workspaceId?: Maybe<Scalars['String']['output']>;
  workspaceKey?: Maybe<WorkspaceKey>;
  workspaceMemberDevicesProofHash: Scalars['String']['output'];
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
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Folder>;
};

export type InitiateFileUploadInput = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type InitiateFileUploadResult = {
  __typename?: 'InitiateFileUploadResult';
  fileId: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type KeyDerivationTrace = {
  __typename?: 'KeyDerivationTrace';
  trace: Array<KeyDerivationTraceEntry>;
  workspaceKeyId: Scalars['String']['output'];
};

export type KeyDerivationTraceEntry = {
  __typename?: 'KeyDerivationTraceEntry';
  context: Scalars['String']['output'];
  entryId: Scalars['String']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  subkeyId: Scalars['String']['output'];
};

export type KeyDerivationTraceEntryInput = {
  context: Scalars['String']['input'];
  entryId: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  subkeyId: Scalars['String']['input'];
};

export type KeyDerivationTraceInput = {
  trace: Array<KeyDerivationTraceEntryInput>;
  workspaceKeyId: Scalars['String']['input'];
};

export type LogoutInput = {
  serializedUserChainEvent: Scalars['String']['input'];
  workspaceMemberDevicesProofs: Array<WorkspaceMemberDevicesProofEntryInput>;
};

export type LogoutResult = {
  __typename?: 'LogoutResult';
  success: Scalars['Boolean']['output'];
};

export type MainDeviceResult = {
  __typename?: 'MainDeviceResult';
  ciphertext: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
};

export type MeResult = {
  __typename?: 'MeResult';
  id: Scalars['String']['output'];
  mainDeviceSigningPublicKey: Scalars['String']['output'];
  username: Scalars['String']['output'];
  workspaceLoadingInfo?: Maybe<WorkspaceLoadingInfo>;
};


export type MeResultWorkspaceLoadingInfoArgs = {
  documentId?: InputMaybe<Scalars['ID']['input']>;
  returnOtherDocumentIfNotFound?: InputMaybe<Scalars['Boolean']['input']>;
  returnOtherWorkspaceIfNotFound?: InputMaybe<Scalars['Boolean']['input']>;
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptWorkspaceInvitation?: Maybe<AcceptWorkspaceInvitationResult>;
  addDevice?: Maybe<AddDeviceResult>;
  attachDeviceToWorkspaces?: Maybe<AttachDeviceToWorkspacesResult>;
  authorizeMember?: Maybe<AuthorizeMemberResult>;
  createComment?: Maybe<CreateCommentResult>;
  createCommentReply?: Maybe<CreateCommentReplyResult>;
  createDocument?: Maybe<CreateDocumentResult>;
  createDocumentShareLink?: Maybe<CreateDocumentShareLinkResult>;
  createFolder?: Maybe<CreateFolderResult>;
  createInitialWorkspaceStructure?: Maybe<CreateInitialWorkspaceStructureResult>;
  createWorkspaceInvitation?: Maybe<CreateWorkspaceInvitationResult>;
  deleteCommentReplies?: Maybe<DeleteCommentRepliesResult>;
  deleteComments?: Maybe<DeleteCommentsResult>;
  deleteDevice?: Maybe<DeleteDeviceResult>;
  deleteDocuments?: Maybe<DeleteDocumentsResult>;
  deleteFolders?: Maybe<DeleteFoldersResult>;
  deleteWorkspaceInvitations?: Maybe<DeleteWorkspaceInvitationsResult>;
  deleteWorkspaces?: Maybe<DeleteWorkspacesResult>;
  finishLogin?: Maybe<FinishLoginResult>;
  finishRegistration?: Maybe<FinishRegistrationResult>;
  initiateFileUpload?: Maybe<InitiateFileUploadResult>;
  logout?: Maybe<LogoutResult>;
  removeDocumentShareLink?: Maybe<RemoveDocumentShareLinkResult>;
  removeMemberAndRotateWorkspaceKey?: Maybe<RemoveMemberAndRotateWorkspaceKeyResult>;
  startLogin?: Maybe<StartLoginResult>;
  startRegistration?: Maybe<StartRegistrationResult>;
  updateDocumentName?: Maybe<UpdateDocumentNameResult>;
  updateFolderName?: Maybe<UpdateFolderNameResult>;
  updateWorkspaceMemberRole?: Maybe<UpdateWorkspaceMemberRoleResult>;
  updateWorkspaceName?: Maybe<UpdateWorkspaceNameResult>;
  verifyRegistration?: Maybe<VerifyRegistrationResult>;
};


export type MutationAcceptWorkspaceInvitationArgs = {
  input: AcceptWorkspaceInvitationInput;
};


export type MutationAddDeviceArgs = {
  input: AddDeviceInput;
};


export type MutationAttachDeviceToWorkspacesArgs = {
  input: AttachDeviceToWorkspacesInput;
};


export type MutationAuthorizeMemberArgs = {
  input: AuthorizeMemberInput;
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


export type MutationDeleteDeviceArgs = {
  input: DeleteDeviceInput;
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


export type MutationLogoutArgs = {
  input?: InputMaybe<LogoutInput>;
};


export type MutationRemoveDocumentShareLinkArgs = {
  input: RemoveDocumentShareLinkInput;
};


export type MutationRemoveMemberAndRotateWorkspaceKeyArgs = {
  input: RemoveMemberAndRotateWorkspaceKeyInput;
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


export type MutationUpdateWorkspaceMemberRoleArgs = {
  input: UpdateWorkspaceMemberRoleInput;
};


export type MutationUpdateWorkspaceNameArgs = {
  input: UpdateWorkspaceNameInput;
};


export type MutationVerifyRegistrationArgs = {
  input: VerifyRegistrationInput;
};

/** PageInfo cursor, as defined in https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** The cursor corresponding to the last nodes in edges. Null if the connection is empty. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Used to indicate whether more edges exist following the set defined by the clients arguments. */
  hasNextPage: Scalars['Boolean']['output'];
  /** Used to indicate whether more edges exist prior to the set defined by the clients arguments. */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor corresponding to the first nodes in edges. Null if the connection is empty. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PendingWorkspaceInvitationResult = {
  __typename?: 'PendingWorkspaceInvitationResult';
  ciphertext?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  publicNonce?: Maybe<Scalars['String']['output']>;
  subkeyId?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  activeWorkspaceKeys?: Maybe<ActiveWorkspaceKeysResult>;
  commentsByDocumentId?: Maybe<CommentConnection>;
  devices?: Maybe<DeviceConnection>;
  document?: Maybe<Document>;
  documentChain?: Maybe<DocumentChainEventConnection>;
  documentPath?: Maybe<Array<Maybe<Folder>>>;
  documentShareLink?: Maybe<DocumentShareLinkForSharePage>;
  documentShareLinkSnapshotKeyBox?: Maybe<SnapshotKeyBox>;
  documentShareLinks?: Maybe<DocumentShareLinkConnection>;
  documents?: Maybe<DocumentConnection>;
  encryptedWebDevice?: Maybe<EncryptedWebDeviceResult>;
  fileUrl?: Maybe<File>;
  firstDocument?: Maybe<Document>;
  folder?: Maybe<Folder>;
  folderTrace: Array<Folder>;
  folders?: Maybe<FolderConnection>;
  mainDevice?: Maybe<MainDeviceResult>;
  me?: Maybe<MeResult>;
  pendingWorkspaceInvitation?: Maybe<PendingWorkspaceInvitationResult>;
  rootFolders?: Maybe<FolderConnection>;
  snapshot?: Maybe<Snapshot>;
  unauthorizedMember?: Maybe<UnauthorizedMemberResult>;
  userChain?: Maybe<UserChainEventConnection>;
  userIdFromUsername?: Maybe<UserIdFromUsernameResult>;
  workspace?: Maybe<Workspace>;
  workspaceChain?: Maybe<WorkspaceChainEventConnection>;
  workspaceChainByInvitationId?: Maybe<WorkspaceChainEventConnection>;
  workspaceInvitation?: Maybe<WorkspaceInvitation>;
  workspaceInvitations?: Maybe<WorkspaceInvitationConnection>;
  workspaceKeyByDocumentId?: Maybe<WorkspaceKeyByDocumentIdResult>;
  workspaceMemberDevicesProof?: Maybe<WorkspaceMemberDevicesProof>;
  workspaceMemberDevicesProofs?: Maybe<WorkspaceMemberDevicesProofConnection>;
  workspaceMembers?: Maybe<WorkspaceMemberConnection>;
  workspaceMembersByMainDeviceSigningPublicKey?: Maybe<WorkspaceMembersByMainDeviceSigningPublicKeyResult>;
  workspaces?: Maybe<WorkspaceConnection>;
};


export type QueryActiveWorkspaceKeysArgs = {
  deviceSigningPublicKey: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type QueryCommentsByDocumentIdArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['ID']['input'];
  documentShareLinkToken?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDevicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  onlyNotExpired: Scalars['Boolean']['input'];
};


export type QueryDocumentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDocumentChainArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['ID']['input'];
  first: Scalars['Int']['input'];
};


export type QueryDocumentPathArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDocumentShareLinkArgs = {
  token: Scalars['ID']['input'];
};


export type QueryDocumentShareLinkSnapshotKeyBoxArgs = {
  snapshotId: Scalars['ID']['input'];
  token: Scalars['ID']['input'];
};


export type QueryDocumentShareLinksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['ID']['input'];
  first: Scalars['Int']['input'];
};


export type QueryDocumentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  parentFolderId: Scalars['ID']['input'];
  usingOldKeys?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryEncryptedWebDeviceArgs = {
  accessToken: Scalars['String']['input'];
};


export type QueryFileUrlArgs = {
  documentId: Scalars['ID']['input'];
  fileId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type QueryFirstDocumentArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryFolderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFolderTraceArgs = {
  folderId: Scalars['ID']['input'];
};


export type QueryFoldersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  parentFolderId: Scalars['ID']['input'];
  usingOldKeys?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryRootFoldersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type QuerySnapshotArgs = {
  documentId: Scalars['ID']['input'];
  documentShareLinkToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserChainArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryUserIdFromUsernameArgs = {
  username: Scalars['String']['input'];
};


export type QueryWorkspaceArgs = {
  deviceSigningPublicKey: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryWorkspaceChainArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type QueryWorkspaceChainByInvitationIdArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  invitationId: Scalars['ID']['input'];
};


export type QueryWorkspaceInvitationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkspaceInvitationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type QueryWorkspaceKeyByDocumentIdArgs = {
  deviceSigningPublicKey: Scalars['String']['input'];
  documentId: Scalars['ID']['input'];
};


export type QueryWorkspaceMemberDevicesProofArgs = {
  hash?: InputMaybe<Scalars['String']['input']>;
  invitationId?: InputMaybe<Scalars['ID']['input']>;
  workspaceId: Scalars['ID']['input'];
};


export type QueryWorkspaceMemberDevicesProofsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
};


export type QueryWorkspaceMembersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type QueryWorkspaceMembersByMainDeviceSigningPublicKeyArgs = {
  mainDeviceSigningPublicKeys: Array<Scalars['String']['input']>;
  workspaceId: Scalars['ID']['input'];
};


export type QueryWorkspacesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  deviceSigningPublicKey: Scalars['String']['input'];
  first: Scalars['Int']['input'];
};

export type RemoveDocumentShareLinkInput = {
  serializedDocumentChainEvent: Scalars['String']['input'];
};

export type RemoveDocumentShareLinkResult = {
  __typename?: 'RemoveDocumentShareLinkResult';
  success: Scalars['Boolean']['output'];
};

export type RemoveMemberAndRotateWorkspaceKeyInput = {
  creatorDeviceSigningPublicKey: Scalars['String']['input'];
  deviceWorkspaceKeyBoxes: Array<WorkspaceDeviceInput>;
  serializedWorkspaceChainEvent: Scalars['String']['input'];
  serializedWorkspaceMemberDevicesProof: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
  workspaceKeyId: Scalars['String']['input'];
};

export type RemoveMemberAndRotateWorkspaceKeyResult = {
  __typename?: 'RemoveMemberAndRotateWorkspaceKeyResult';
  workspaceKey: WorkspaceKey;
};

export enum Role {
  Admin = 'ADMIN',
  Commenter = 'COMMENTER',
  Editor = 'EDITOR',
  Viewer = 'VIEWER'
}

export enum ShareDocumentRole {
  Commenter = 'COMMENTER',
  Editor = 'EDITOR',
  Viewer = 'VIEWER'
}

export type Snapshot = {
  __typename?: 'Snapshot';
  activeDocumentSnapshot?: Maybe<Document>;
  clocks: Array<Scalars['Int']['output']>;
  createdAt: Scalars['Date']['output'];
  data: Scalars['String']['output'];
  document?: Maybe<Document>;
  documentId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  keyDerivationTrace: KeyDerivationTrace;
  updates?: Maybe<Array<Update>>;
};

export type SnapshotDeviceKeyBoxInput = {
  ciphertext: Scalars['String']['input'];
  deviceSigningPublicKey: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
};

export type SnapshotKeyBox = {
  __typename?: 'SnapshotKeyBox';
  ciphertext: Scalars['String']['output'];
  creatorDevice: CreatorDevice;
  creatorDeviceSigningPublicKey: Scalars['String']['output'];
  deviceSigningPublicKey: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
};

export type StartLoginInput = {
  challenge: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type StartLoginResult = {
  __typename?: 'StartLoginResult';
  challengeResponse: Scalars['String']['output'];
  loginId: Scalars['String']['output'];
};

export type StartRegistrationInput = {
  challenge: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type StartRegistrationResult = {
  __typename?: 'StartRegistrationResult';
  challengeResponse: Scalars['String']['output'];
};

export type UnauthorizedMemberResult = {
  __typename?: 'UnauthorizedMemberResult';
  userId: Scalars['String']['output'];
  userMainDeviceSigningPublicKey: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
};

export type Update = {
  __typename?: 'Update';
  clock: Scalars['Int']['output'];
  data: Scalars['String']['output'];
  id: Scalars['String']['output'];
  pubKey: Scalars['String']['output'];
  snapshot?: Maybe<Snapshot>;
  snapshotId: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type UpdateDocumentNameInput = {
  id: Scalars['String']['input'];
  nameCiphertext: Scalars['String']['input'];
  nameNonce: Scalars['String']['input'];
  subkeyId: Scalars['String']['input'];
  workspaceKeyId: Scalars['String']['input'];
};

export type UpdateDocumentNameResult = {
  __typename?: 'UpdateDocumentNameResult';
  document?: Maybe<Document>;
};

export type UpdateFolderNameInput = {
  id: Scalars['String']['input'];
  keyDerivationTrace: KeyDerivationTraceInput;
  nameCiphertext: Scalars['String']['input'];
  nameNonce: Scalars['String']['input'];
  signature: Scalars['String']['input'];
  subkeyId: Scalars['String']['input'];
  workspaceKeyId: Scalars['String']['input'];
  workspaceMemberDevicesProofHash: Scalars['String']['input'];
};

export type UpdateFolderNameResult = {
  __typename?: 'UpdateFolderNameResult';
  folder?: Maybe<Folder>;
};

export type UpdateWorkspaceMemberRoleInput = {
  serializedWorkspaceChainEvent: Scalars['String']['input'];
  serializedWorkspaceMemberDevicesProof: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type UpdateWorkspaceMemberRoleResult = {
  __typename?: 'UpdateWorkspaceMemberRoleResult';
  workspace?: Maybe<Workspace>;
};

export type UpdateWorkspaceNameInput = {
  id: Scalars['String']['input'];
  infoCiphertext: Scalars['String']['input'];
  infoNonce: Scalars['String']['input'];
  infoSignature: Scalars['String']['input'];
  infoWorkspaceKeyId: Scalars['String']['input'];
};

export type UpdateWorkspaceNameResult = {
  __typename?: 'UpdateWorkspaceNameResult';
  workspace?: Maybe<Workspace>;
};

export type User = {
  __typename?: 'User';
  chain: Array<UserChainEvent>;
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type UserChainEvent = {
  __typename?: 'UserChainEvent';
  position: Scalars['Int']['output'];
  serializedContent: Scalars['String']['output'];
};

export type UserChainEventConnection = {
  __typename?: 'UserChainEventConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<UserChainEventEdge>>>;
  /** Flattened list of UserChainEvent type */
  nodes?: Maybe<Array<Maybe<UserChainEvent>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type UserChainEventEdge = {
  __typename?: 'UserChainEventEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<UserChainEvent>;
};

export type UserIdFromUsernameResult = {
  __typename?: 'UserIdFromUsernameResult';
  id: Scalars['String']['output'];
};

export type VerifyRegistrationInput = {
  username: Scalars['String']['input'];
  verificationCode: Scalars['String']['input'];
};

export type VerifyRegistrationResult = {
  __typename?: 'VerifyRegistrationResult';
  id: Scalars['String']['output'];
};

export type Workspace = {
  __typename?: 'Workspace';
  currentWorkspaceKey?: Maybe<WorkspaceKey>;
  id: Scalars['String']['output'];
  infoCiphertext?: Maybe<Scalars['String']['output']>;
  infoCreatorDeviceSigningPublicKey: Scalars['String']['output'];
  infoNonce?: Maybe<Scalars['String']['output']>;
  infoSignature: Scalars['String']['output'];
  infoWorkspaceKey?: Maybe<WorkspaceKey>;
  infoWorkspaceKeyId?: Maybe<Scalars['String']['output']>;
  infoWorkspaceMemberDevicesProofHash: Scalars['String']['output'];
  workspaceKeys?: Maybe<Array<WorkspaceKey>>;
};

export type WorkspaceChainEvent = {
  __typename?: 'WorkspaceChainEvent';
  position: Scalars['Int']['output'];
  serializedContent: Scalars['String']['output'];
};

export type WorkspaceChainEventConnection = {
  __typename?: 'WorkspaceChainEventConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<WorkspaceChainEventEdge>>>;
  /** Flattened list of WorkspaceChainEvent type */
  nodes?: Maybe<Array<Maybe<WorkspaceChainEvent>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type WorkspaceChainEventEdge = {
  __typename?: 'WorkspaceChainEventEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<WorkspaceChainEvent>;
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
  ciphertext: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
  receiverDeviceSigningPublicKey: Scalars['String']['input'];
};

export type WorkspaceEdge = {
  __typename?: 'WorkspaceEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<Workspace>;
};

export type WorkspaceInvitation = {
  __typename?: 'WorkspaceInvitation';
  expiresAt: Scalars['Date']['output'];
  id: Scalars['String']['output'];
  invitationDataSignature: Scalars['String']['output'];
  invitationSigningPublicKey: Scalars['String']['output'];
  inviterUserId: Scalars['String']['output'];
  inviterUsername: Scalars['String']['output'];
  role: Role;
  workspaceId: Scalars['String']['output'];
  workspaceName?: Maybe<Scalars['String']['output']>;
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
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<WorkspaceInvitation>;
};

export type WorkspaceKey = {
  __typename?: 'WorkspaceKey';
  generation: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
  workspaceKeyBox?: Maybe<WorkspaceKeyBox>;
  workspaceKeyBoxes?: Maybe<Array<WorkspaceKeyBox>>;
};

export type WorkspaceKeyBox = {
  __typename?: 'WorkspaceKeyBox';
  ciphertext: Scalars['String']['output'];
  creatorDevice: CreatorDevice;
  creatorDeviceSigningPublicKey: Scalars['String']['output'];
  deviceSigningPublicKey: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
  workspaceKeyId: Scalars['String']['output'];
};

export type WorkspaceKeyBoxData = {
  workspaceId: Scalars['String']['input'];
  workspaceKeyDevicePairs: Array<WorkspaceKeyDevicePair>;
};

export type WorkspaceKeyByDocumentIdResult = {
  __typename?: 'WorkspaceKeyByDocumentIdResult';
  nameWorkspaceKey: WorkspaceKey;
};

export type WorkspaceKeyDevicePair = {
  ciphertext: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
  workspaceKeyId: Scalars['String']['input'];
};

export type WorkspaceLoadingInfo = {
  __typename?: 'WorkspaceLoadingInfo';
  documentId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isAuthorized: Scalars['Boolean']['output'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  id: Scalars['String']['output'];
  user: User;
};

export type WorkspaceMemberConnection = {
  __typename?: 'WorkspaceMemberConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<WorkspaceMemberEdge>>>;
  /** Flattened list of WorkspaceMember type */
  nodes?: Maybe<Array<Maybe<WorkspaceMember>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type WorkspaceMemberDevicesProof = {
  __typename?: 'WorkspaceMemberDevicesProof';
  authorMainDeviceSigningPublicKey: Scalars['String']['output'];
  proof: WorkspaceMemberDevicesProofContent;
  serializedData: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
};

export type WorkspaceMemberDevicesProofConnection = {
  __typename?: 'WorkspaceMemberDevicesProofConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<WorkspaceMemberDevicesProofEdge>>>;
  /** Flattened list of WorkspaceMemberDevicesProof type */
  nodes?: Maybe<Array<Maybe<WorkspaceMemberDevicesProof>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type WorkspaceMemberDevicesProofContent = {
  __typename?: 'WorkspaceMemberDevicesProofContent';
  clock: Scalars['Int']['output'];
  hash: Scalars['String']['output'];
  hashSignature: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type WorkspaceMemberDevicesProofEdge = {
  __typename?: 'WorkspaceMemberDevicesProofEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<WorkspaceMemberDevicesProof>;
};

export type WorkspaceMemberDevicesProofEntryInput = {
  serializedWorkspaceMemberDevicesProof: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type WorkspaceMemberDevicesProofInput = {
  clock: Scalars['Int']['input'];
  hash: Scalars['String']['input'];
  hashSignature: Scalars['String']['input'];
  version: Scalars['Int']['input'];
};

export type WorkspaceMemberEdge = {
  __typename?: 'WorkspaceMemberEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String']['output'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<WorkspaceMember>;
};

export type WorkspaceMembersByMainDeviceSigningPublicKeyResult = {
  __typename?: 'WorkspaceMembersByMainDeviceSigningPublicKeyResult';
  workspaceMembers: Array<WorkspaceMember>;
};

export type WorkspaceWithWorkspaceDevicesParingInput = {
  id: Scalars['String']['input'];
  workspaceDevices: Array<WorkspaceDeviceInput>;
  workspaceKeyId: Scalars['String']['input'];
};

export type AcceptWorkspaceInvitationMutationVariables = Exact<{
  input: AcceptWorkspaceInvitationInput;
}>;


export type AcceptWorkspaceInvitationMutation = { __typename?: 'Mutation', acceptWorkspaceInvitation?: { __typename?: 'AcceptWorkspaceInvitationResult', workspaceId: string } | null };

export type AddDeviceMutationVariables = Exact<{
  input: AddDeviceInput;
}>;


export type AddDeviceMutation = { __typename?: 'Mutation', addDevice?: { __typename?: 'AddDeviceResult', expiresAt: any, webDeviceAccessToken?: string | null } | null };

export type AttachDeviceToWorkspacesMutationVariables = Exact<{
  input: AttachDeviceToWorkspacesInput;
}>;


export type AttachDeviceToWorkspacesMutation = { __typename?: 'Mutation', attachDeviceToWorkspaces?: { __typename?: 'AttachDeviceToWorkspacesResult', workspaceKeys: Array<{ __typename?: 'WorkspaceKey', id: string, generation: number, workspaceId: string, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, deviceSigningPublicKey: string, creatorDeviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } | null }> } | null };

export type AuthorizeMemberMutationVariables = Exact<{
  input: AuthorizeMemberInput;
}>;


export type AuthorizeMemberMutation = { __typename?: 'Mutation', authorizeMember?: { __typename?: 'AuthorizeMemberResult', success: boolean } | null };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment?: { __typename?: 'CreateCommentResult', comment?: { __typename?: 'Comment', id: string, documentId: string, contentCiphertext: string, contentNonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string, createdAt?: any | null } } | null } | null };

export type CreateCommentReplyMutationVariables = Exact<{
  input: CreateCommentReplyInput;
}>;


export type CreateCommentReplyMutation = { __typename?: 'Mutation', createCommentReply?: { __typename?: 'CreateCommentReplyResult', commentReply?: { __typename?: 'CommentReply', id: string, commentId: string } | null } | null };

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


export type CreateFolderMutation = { __typename?: 'Mutation', createFolder?: { __typename?: 'CreateFolderResult', folder?: { __typename?: 'Folder', id: string, nameCiphertext: string, nameNonce: string, signature: string, creatorDeviceSigningPublicKey: string, workspaceMemberDevicesProofHash: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: string, parentId?: string | null, context: string }> } } | null } | null };

export type CreateInitialWorkspaceStructureMutationVariables = Exact<{
  input: CreateInitialWorkspaceStructureInput;
}>;


export type CreateInitialWorkspaceStructureMutation = { __typename?: 'Mutation', createInitialWorkspaceStructure?: { __typename?: 'CreateInitialWorkspaceStructureResult', workspace?: { __typename?: 'Workspace', id: string, infoCiphertext?: string | null, infoNonce?: string | null, infoSignature: string, infoWorkspaceMemberDevicesProofHash: string, infoCreatorDeviceSigningPublicKey: string, infoWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } | null } | null, currentWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } | null } | null } | null, folder?: { __typename?: 'Folder', id: string, nameCiphertext: string, nameNonce: string, signature: string, creatorDeviceSigningPublicKey: string, workspaceMemberDevicesProofHash: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: string, parentId?: string | null, context: string }> } } | null, document?: { __typename?: 'Document', id: string } | null } | null };

export type CreateWorkspaceInvitationMutationVariables = Exact<{
  input: CreateWorkspaceInvitationInput;
}>;


export type CreateWorkspaceInvitationMutation = { __typename?: 'Mutation', createWorkspaceInvitation?: { __typename?: 'CreateWorkspaceInvitationResult', workspaceInvitation?: { __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, expiresAt: any } | null } | null };

export type DeleteCommentRepliesMutationVariables = Exact<{
  input: DeleteCommentRepliesInput;
}>;


export type DeleteCommentRepliesMutation = { __typename?: 'Mutation', deleteCommentReplies?: { __typename?: 'DeleteCommentRepliesResult', status: string } | null };

export type DeleteCommentsMutationVariables = Exact<{
  input: DeleteCommentsInput;
}>;


export type DeleteCommentsMutation = { __typename?: 'Mutation', deleteComments?: { __typename?: 'DeleteCommentsResult', status: string } | null };

export type DeleteDeviceMutationVariables = Exact<{
  input: DeleteDeviceInput;
}>;


export type DeleteDeviceMutation = { __typename?: 'Mutation', deleteDevice?: { __typename?: 'DeleteDeviceResult', status: string } | null };

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


export type FinishLoginMutation = { __typename?: 'Mutation', finishLogin?: { __typename?: 'FinishLoginResult', userChain: Array<{ __typename?: 'UserChainEvent', position: number, serializedContent: string }>, mainDevice: { __typename?: 'FinishLoginMainDevice', ciphertext: string, nonce: string }, workspaceMemberDevicesProofs: Array<{ __typename?: 'WorkspaceMemberDevicesProof', serializedData: string, workspaceId: string, authorMainDeviceSigningPublicKey: string, proof: { __typename?: 'WorkspaceMemberDevicesProofContent', hash: string, hashSignature: string, clock: number, version: number } }> } | null };

export type FinishRegistrationMutationVariables = Exact<{
  input: FinishRegistrationInput;
}>;


export type FinishRegistrationMutation = { __typename?: 'Mutation', finishRegistration?: { __typename?: 'FinishRegistrationResult', id: string, verificationCode?: string | null } | null };

export type InitiateFileUploadMutationVariables = Exact<{
  initiateFileUpload: InitiateFileUploadInput;
}>;


export type InitiateFileUploadMutation = { __typename?: 'Mutation', initiateFileUpload?: { __typename?: 'InitiateFileUploadResult', uploadUrl: string, fileId: string } | null };

export type LogoutMutationVariables = Exact<{
  input?: InputMaybe<LogoutInput>;
}>;


export type LogoutMutation = { __typename?: 'Mutation', logout?: { __typename?: 'LogoutResult', success: boolean } | null };

export type RemoveDocumentShareLinkMutationVariables = Exact<{
  input: RemoveDocumentShareLinkInput;
}>;


export type RemoveDocumentShareLinkMutation = { __typename?: 'Mutation', removeDocumentShareLink?: { __typename?: 'RemoveDocumentShareLinkResult', success: boolean } | null };

export type RemoveMemberAndRotateWorkspaceKeyMutationVariables = Exact<{
  input: RemoveMemberAndRotateWorkspaceKeyInput;
}>;


export type RemoveMemberAndRotateWorkspaceKeyMutation = { __typename?: 'Mutation', removeMemberAndRotateWorkspaceKey?: { __typename?: 'RemoveMemberAndRotateWorkspaceKeyResult', workspaceKey: { __typename?: 'WorkspaceKey', id: string, generation: number, workspaceId: string, workspaceKeyBoxes?: Array<{ __typename?: 'WorkspaceKeyBox', id: string, deviceSigningPublicKey: string, creatorDeviceSigningPublicKey: string, ciphertext: string, nonce: string }> | null } } | null };

export type StartLoginMutationVariables = Exact<{
  input: StartLoginInput;
}>;


export type StartLoginMutation = { __typename?: 'Mutation', startLogin?: { __typename?: 'StartLoginResult', challengeResponse: string, loginId: string } | null };

export type StartRegistrationMutationVariables = Exact<{
  input: StartRegistrationInput;
}>;


export type StartRegistrationMutation = { __typename?: 'Mutation', startRegistration?: { __typename?: 'StartRegistrationResult', challengeResponse: string } | null };

export type UpdateDocumentNameMutationVariables = Exact<{
  input: UpdateDocumentNameInput;
}>;


export type UpdateDocumentNameMutation = { __typename?: 'Mutation', updateDocumentName?: { __typename?: 'UpdateDocumentNameResult', document?: { __typename?: 'Document', id: string, nameCiphertext: string, nameNonce: string, parentFolderId?: string | null, workspaceId: string, subkeyId: string } | null } | null };

export type UpdateFolderNameMutationVariables = Exact<{
  input: UpdateFolderNameInput;
}>;


export type UpdateFolderNameMutation = { __typename?: 'Mutation', updateFolderName?: { __typename?: 'UpdateFolderNameResult', folder?: { __typename?: 'Folder', id: string, nameCiphertext: string, nameNonce: string, signature: string, creatorDeviceSigningPublicKey: string, workspaceMemberDevicesProofHash: string, parentFolderId?: string | null, rootFolderId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: string, parentId?: string | null, context: string }> } } | null } | null };

export type UpdateWorkspaceMemberRoleMutationVariables = Exact<{
  input: UpdateWorkspaceMemberRoleInput;
}>;


export type UpdateWorkspaceMemberRoleMutation = { __typename?: 'Mutation', updateWorkspaceMemberRole?: { __typename?: 'UpdateWorkspaceMemberRoleResult', workspace?: { __typename?: 'Workspace', id: string } | null } | null };

export type UpdateWorkspaceNameMutationVariables = Exact<{
  input: UpdateWorkspaceNameInput;
}>;


export type UpdateWorkspaceNameMutation = { __typename?: 'Mutation', updateWorkspaceName?: { __typename?: 'UpdateWorkspaceNameResult', workspace?: { __typename?: 'Workspace', id: string } | null } | null };

export type VerifyRegistrationMutationVariables = Exact<{
  input: VerifyRegistrationInput;
}>;


export type VerifyRegistrationMutation = { __typename?: 'Mutation', verifyRegistration?: { __typename?: 'VerifyRegistrationResult', id: string } | null };

export type CommentsByDocumentIdQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
  documentShareLinkToken?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type CommentsByDocumentIdQuery = { __typename?: 'Query', commentsByDocumentId?: { __typename?: 'CommentConnection', nodes?: Array<{ __typename?: 'Comment', id: string, documentId: string, snapshotId: string, subkeyId: string, contentCiphertext: string, contentNonce: string, signature: string, createdAt: any, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string }, commentReplies?: Array<{ __typename?: 'CommentReply', id: string, snapshotId: string, subkeyId: string, contentCiphertext: string, contentNonce: string, signature: string, createdAt: any, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string, encryptionPublicKeySignature: string } } | null> | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type DevicesQueryVariables = Exact<{
  onlyNotExpired: Scalars['Boolean']['input'];
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type DevicesQuery = { __typename?: 'Query', devices?: { __typename?: 'DeviceConnection', nodes?: Array<{ __typename?: 'Device', signingPublicKey: string, info?: string | null, createdAt?: any | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type DocumentQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DocumentQuery = { __typename?: 'Query', document?: { __typename?: 'Document', id: string, nameCiphertext: string, nameNonce: string, parentFolderId?: string | null, workspaceId: string, subkeyId: string } | null };

export type DocumentChainQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type DocumentChainQuery = { __typename?: 'Query', documentChain?: { __typename?: 'DocumentChainEventConnection', nodes?: Array<{ __typename?: 'DocumentChainEvent', serializedContent: string, position: number } | null> | null } | null };

export type DocumentPathQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DocumentPathQuery = { __typename?: 'Query', documentPath?: Array<{ __typename?: 'Folder', id: string, nameCiphertext: string, nameNonce: string, signature: string, creatorDeviceSigningPublicKey: string, workspaceMemberDevicesProofHash: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: string, parentId?: string | null, context: string }> } } | null> | null };

export type DocumentShareLinkQueryVariables = Exact<{
  token: Scalars['ID']['input'];
}>;


export type DocumentShareLinkQuery = { __typename?: 'Query', documentShareLink?: { __typename?: 'DocumentShareLinkForSharePage', token: string, websocketSessionKey: string, workspaceId: string, role: ShareDocumentRole, deviceSecretBoxCiphertext: string, deviceSecretBoxNonce: string, activeSnapshotKeyBox: { __typename?: 'SnapshotKeyBox', id: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } } | null };

export type DocumentShareLinkSnapshotKeyBoxQueryVariables = Exact<{
  token: Scalars['ID']['input'];
  snapshotId: Scalars['ID']['input'];
}>;


export type DocumentShareLinkSnapshotKeyBoxQuery = { __typename?: 'Query', documentShareLinkSnapshotKeyBox?: { __typename?: 'SnapshotKeyBox', id: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } | null };

export type DocumentShareLinksQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
  first?: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type DocumentShareLinksQuery = { __typename?: 'Query', documentShareLinks?: { __typename?: 'DocumentShareLinkConnection', nodes?: Array<{ __typename?: 'DocumentShareLink', deviceSigningPublicKey: string, token: string } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type DocumentsQueryVariables = Exact<{
  parentFolderId: Scalars['ID']['input'];
  first?: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type DocumentsQuery = { __typename?: 'Query', documents?: { __typename?: 'DocumentConnection', nodes?: Array<{ __typename?: 'Document', id: string, nameCiphertext: string, nameNonce: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId: string, subkeyId: string } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type EncryptedWebDeviceQueryVariables = Exact<{
  accessToken: Scalars['String']['input'];
}>;


export type EncryptedWebDeviceQuery = { __typename?: 'Query', encryptedWebDevice?: { __typename?: 'EncryptedWebDeviceResult', ciphertext: string, nonce: string } | null };

export type FileUrlQueryVariables = Exact<{
  fileId: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
  documentId: Scalars['ID']['input'];
}>;


export type FileUrlQuery = { __typename?: 'Query', fileUrl?: { __typename?: 'File', id: string, downloadUrl: string } | null };

export type FirstDocumentQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type FirstDocumentQuery = { __typename?: 'Query', firstDocument?: { __typename?: 'Document', id: string } | null };

export type FolderQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FolderQuery = { __typename?: 'Query', folder?: { __typename?: 'Folder', id: string, nameCiphertext: string, nameNonce: string, signature: string, creatorDeviceSigningPublicKey: string, workspaceMemberDevicesProofHash: string, parentFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: string, parentId?: string | null, context: string }> } } | null };

export type FolderTraceQueryVariables = Exact<{
  folderId: Scalars['ID']['input'];
}>;


export type FolderTraceQuery = { __typename?: 'Query', folderTrace: Array<{ __typename?: 'Folder', id: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, nameCiphertext: string, nameNonce: string, signature: string, creatorDeviceSigningPublicKey: string, workspaceMemberDevicesProofHash: string, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: string, parentId?: string | null, context: string }> } }> };

export type FoldersQueryVariables = Exact<{
  parentFolderId: Scalars['ID']['input'];
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type FoldersQuery = { __typename?: 'Query', folders?: { __typename?: 'FolderConnection', nodes?: Array<{ __typename?: 'Folder', id: string, nameCiphertext: string, nameNonce: string, signature: string, creatorDeviceSigningPublicKey: string, workspaceMemberDevicesProofHash: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: string, parentId?: string | null, context: string }> } } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type MainDeviceQueryVariables = Exact<{ [key: string]: never; }>;


export type MainDeviceQuery = { __typename?: 'Query', mainDevice?: { __typename?: 'MainDeviceResult', nonce: string, ciphertext: string } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'MeResult', id: string, username: string } | null };

export type MeWithWorkspaceLoadingInfoQueryVariables = Exact<{
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
  documentId?: InputMaybe<Scalars['ID']['input']>;
  returnOtherWorkspaceIfNotFound?: InputMaybe<Scalars['Boolean']['input']>;
  returnOtherDocumentIfNotFound?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type MeWithWorkspaceLoadingInfoQuery = { __typename?: 'Query', me?: { __typename?: 'MeResult', id: string, username: string, mainDeviceSigningPublicKey: string, workspaceLoadingInfo?: { __typename?: 'WorkspaceLoadingInfo', id: string, isAuthorized: boolean, documentId?: string | null } | null } | null };

export type PendingWorkspaceInvitationQueryVariables = Exact<{ [key: string]: never; }>;


export type PendingWorkspaceInvitationQuery = { __typename?: 'Query', pendingWorkspaceInvitation?: { __typename?: 'PendingWorkspaceInvitationResult', id?: string | null, ciphertext?: string | null, publicNonce?: string | null, subkeyId?: string | null } | null };

export type RootFoldersQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type RootFoldersQuery = { __typename?: 'Query', rootFolders?: { __typename?: 'FolderConnection', nodes?: Array<{ __typename?: 'Folder', id: string, nameCiphertext: string, nameNonce: string, signature: string, creatorDeviceSigningPublicKey: string, workspaceMemberDevicesProofHash: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: string, parentId?: string | null, context: string }> } } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type SnapshotQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type SnapshotQuery = { __typename?: 'Query', snapshot?: { __typename?: 'Snapshot', id: string, data: string, documentId: string, keyDerivationTrace: { __typename?: 'KeyDerivationTrace', workspaceKeyId: string, trace: Array<{ __typename?: 'KeyDerivationTraceEntry', entryId: string, subkeyId: string, parentId?: string | null, context: string }> } } | null };

export type UnauthorizedMemberQueryVariables = Exact<{ [key: string]: never; }>;


export type UnauthorizedMemberQuery = { __typename?: 'Query', unauthorizedMember?: { __typename?: 'UnauthorizedMemberResult', userId: string, userMainDeviceSigningPublicKey: string, workspaceId: string } | null };

export type UserChainQueryVariables = Exact<{
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type UserChainQuery = { __typename?: 'Query', userChain?: { __typename?: 'UserChainEventConnection', nodes?: Array<{ __typename?: 'UserChainEvent', serializedContent: string, position: number } | null> | null } | null };

export type UserIdFromUsernameQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type UserIdFromUsernameQuery = { __typename?: 'Query', userIdFromUsername?: { __typename?: 'UserIdFromUsernameResult', id: string } | null };

export type WorkspaceQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  deviceSigningPublicKey: Scalars['String']['input'];
}>;


export type WorkspaceQuery = { __typename?: 'Query', workspace?: { __typename?: 'Workspace', id: string, infoCiphertext?: string | null, infoNonce?: string | null, infoSignature: string, infoWorkspaceMemberDevicesProofHash: string, infoCreatorDeviceSigningPublicKey: string, infoWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } | null } | null, currentWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } | null } | null, workspaceKeys?: Array<{ __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } | null }> | null } | null };

export type WorkspaceChainQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type WorkspaceChainQuery = { __typename?: 'Query', workspaceChain?: { __typename?: 'WorkspaceChainEventConnection', nodes?: Array<{ __typename?: 'WorkspaceChainEvent', serializedContent: string, position: number } | null> | null } | null };

export type WorkspaceChainByInvitationIdQueryVariables = Exact<{
  invitationId: Scalars['ID']['input'];
}>;


export type WorkspaceChainByInvitationIdQuery = { __typename?: 'Query', workspaceChainByInvitationId?: { __typename?: 'WorkspaceChainEventConnection', nodes?: Array<{ __typename?: 'WorkspaceChainEvent', serializedContent: string, position: number } | null> | null } | null };

export type WorkspaceInvitationQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type WorkspaceInvitationQuery = { __typename?: 'Query', me?: { __typename?: 'MeResult', id: string, username: string } | null, workspaceInvitation?: { __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, inviterUserId: string, inviterUsername: string, role: Role, expiresAt: any, invitationDataSignature: string, invitationSigningPublicKey: string } | null };

export type WorkspaceInvitationsQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type WorkspaceInvitationsQuery = { __typename?: 'Query', workspaceInvitations?: { __typename?: 'WorkspaceInvitationConnection', nodes?: Array<{ __typename?: 'WorkspaceInvitation', id: string, workspaceId: string, inviterUserId: string, inviterUsername: string, role: Role, expiresAt: any } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type WorkspaceMemberDevicesProofQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  invitationId?: InputMaybe<Scalars['ID']['input']>;
  hash?: InputMaybe<Scalars['String']['input']>;
}>;


export type WorkspaceMemberDevicesProofQuery = { __typename?: 'Query', workspaceMemberDevicesProof?: { __typename?: 'WorkspaceMemberDevicesProof', serializedData: string, authorMainDeviceSigningPublicKey: string, proof: { __typename?: 'WorkspaceMemberDevicesProofContent', hash: string, hashSignature: string, clock: number, version: number } } | null };

export type WorkspaceMemberDevicesProofsQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkspaceMemberDevicesProofsQuery = { __typename?: 'Query', workspaceMemberDevicesProofs?: { __typename?: 'WorkspaceMemberDevicesProofConnection', nodes?: Array<{ __typename?: 'WorkspaceMemberDevicesProof', serializedData: string, workspaceId: string, authorMainDeviceSigningPublicKey: string, proof: { __typename?: 'WorkspaceMemberDevicesProofContent', hash: string, hashSignature: string, clock: number, version: number } } | null> | null } | null };

export type WorkspaceMembersQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
}>;


export type WorkspaceMembersQuery = { __typename?: 'Query', workspaceMembers?: { __typename?: 'WorkspaceMemberConnection', nodes?: Array<{ __typename?: 'WorkspaceMember', id: string, user: { __typename?: 'User', id: string, username: string, chain: Array<{ __typename?: 'UserChainEvent', serializedContent: string, position: number }> } } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables = Exact<{
  workspaceId: Scalars['ID']['input'];
  mainDeviceSigningPublicKeys: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type WorkspaceMembersByMainDeviceSigningPublicKeyQuery = { __typename?: 'Query', workspaceMembersByMainDeviceSigningPublicKey?: { __typename?: 'WorkspaceMembersByMainDeviceSigningPublicKeyResult', workspaceMembers: Array<{ __typename?: 'WorkspaceMember', id: string, user: { __typename?: 'User', id: string, username: string, chain: Array<{ __typename?: 'UserChainEvent', serializedContent: string }> } }> } | null };

export type WorkspacesQueryVariables = Exact<{
  deviceSigningPublicKey: Scalars['String']['input'];
}>;


export type WorkspacesQuery = { __typename?: 'Query', workspaces?: { __typename?: 'WorkspaceConnection', nodes?: Array<{ __typename?: 'Workspace', id: string, infoCiphertext?: string | null, infoNonce?: string | null, infoSignature: string, infoWorkspaceMemberDevicesProofHash: string, infoCreatorDeviceSigningPublicKey: string, infoWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } | null } | null, currentWorkspaceKey?: { __typename?: 'WorkspaceKey', id: string, workspaceId: string, generation: number, workspaceKeyBox?: { __typename?: 'WorkspaceKeyBox', id: string, workspaceKeyId: string, deviceSigningPublicKey: string, ciphertext: string, nonce: string, creatorDevice: { __typename?: 'CreatorDevice', signingPublicKey: string, encryptionPublicKey: string } } | null } | null } | null> | null } | null };


export const AcceptWorkspaceInvitationDocument = gql`
    mutation acceptWorkspaceInvitation($input: AcceptWorkspaceInvitationInput!) {
  acceptWorkspaceInvitation(input: $input) {
    workspaceId
  }
}
    `;

export function useAcceptWorkspaceInvitationMutation() {
  return Urql.useMutation<AcceptWorkspaceInvitationMutation, AcceptWorkspaceInvitationMutationVariables>(AcceptWorkspaceInvitationDocument);
};
export const AddDeviceDocument = gql`
    mutation addDevice($input: AddDeviceInput!) {
  addDevice(input: $input) {
    expiresAt
    webDeviceAccessToken
  }
}
    `;

export function useAddDeviceMutation() {
  return Urql.useMutation<AddDeviceMutation, AddDeviceMutationVariables>(AddDeviceDocument);
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
export const AuthorizeMemberDocument = gql`
    mutation authorizeMember($input: AuthorizeMemberInput!) {
  authorizeMember(input: $input) {
    success
  }
}
    `;

export function useAuthorizeMemberMutation() {
  return Urql.useMutation<AuthorizeMemberMutation, AuthorizeMemberMutationVariables>(AuthorizeMemberDocument);
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
export const CreateCommentReplyDocument = gql`
    mutation createCommentReply($input: CreateCommentReplyInput!) {
  createCommentReply(input: $input) {
    commentReply {
      id
      commentId
    }
  }
}
    `;

export function useCreateCommentReplyMutation() {
  return Urql.useMutation<CreateCommentReplyMutation, CreateCommentReplyMutationVariables>(CreateCommentReplyDocument);
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
      nameCiphertext
      nameNonce
      signature
      creatorDeviceSigningPublicKey
      workspaceMemberDevicesProofHash
      parentFolderId
      rootFolderId
      workspaceId
      keyDerivationTrace {
        workspaceKeyId
        trace {
          entryId
          subkeyId
          parentId
          context
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
      infoCiphertext
      infoNonce
      infoSignature
      infoWorkspaceMemberDevicesProofHash
      infoCreatorDeviceSigningPublicKey
      infoWorkspaceKey {
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
      nameCiphertext
      nameNonce
      signature
      creatorDeviceSigningPublicKey
      workspaceMemberDevicesProofHash
      parentFolderId
      rootFolderId
      workspaceId
      keyDerivationTrace {
        workspaceKeyId
        trace {
          entryId
          subkeyId
          parentId
          context
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
export const DeleteCommentRepliesDocument = gql`
    mutation deleteCommentReplies($input: DeleteCommentRepliesInput!) {
  deleteCommentReplies(input: $input) {
    status
  }
}
    `;

export function useDeleteCommentRepliesMutation() {
  return Urql.useMutation<DeleteCommentRepliesMutation, DeleteCommentRepliesMutationVariables>(DeleteCommentRepliesDocument);
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
export const DeleteDeviceDocument = gql`
    mutation deleteDevice($input: DeleteDeviceInput!) {
  deleteDevice(input: $input) {
    status
  }
}
    `;

export function useDeleteDeviceMutation() {
  return Urql.useMutation<DeleteDeviceMutation, DeleteDeviceMutationVariables>(DeleteDeviceDocument);
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
    userChain {
      position
      serializedContent
    }
    mainDevice {
      ciphertext
      nonce
    }
    workspaceMemberDevicesProofs {
      proof {
        hash
        hashSignature
        clock
        version
      }
      serializedData
      workspaceId
      authorMainDeviceSigningPublicKey
    }
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
    mutation logout($input: LogoutInput) {
  logout(input: $input) {
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
export const RemoveMemberAndRotateWorkspaceKeyDocument = gql`
    mutation removeMemberAndRotateWorkspaceKey($input: RemoveMemberAndRotateWorkspaceKeyInput!) {
  removeMemberAndRotateWorkspaceKey(input: $input) {
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

export function useRemoveMemberAndRotateWorkspaceKeyMutation() {
  return Urql.useMutation<RemoveMemberAndRotateWorkspaceKeyMutation, RemoveMemberAndRotateWorkspaceKeyMutationVariables>(RemoveMemberAndRotateWorkspaceKeyDocument);
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
      nameCiphertext
      nameNonce
      parentFolderId
      workspaceId
      subkeyId
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
      nameCiphertext
      nameNonce
      signature
      creatorDeviceSigningPublicKey
      workspaceMemberDevicesProofHash
      parentFolderId
      rootFolderId
      keyDerivationTrace {
        workspaceKeyId
        trace {
          entryId
          subkeyId
          parentId
          context
        }
      }
    }
  }
}
    `;

export function useUpdateFolderNameMutation() {
  return Urql.useMutation<UpdateFolderNameMutation, UpdateFolderNameMutationVariables>(UpdateFolderNameDocument);
};
export const UpdateWorkspaceMemberRoleDocument = gql`
    mutation updateWorkspaceMemberRole($input: UpdateWorkspaceMemberRoleInput!) {
  updateWorkspaceMemberRole(input: $input) {
    workspace {
      id
    }
  }
}
    `;

export function useUpdateWorkspaceMemberRoleMutation() {
  return Urql.useMutation<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>(UpdateWorkspaceMemberRoleDocument);
};
export const UpdateWorkspaceNameDocument = gql`
    mutation updateWorkspaceName($input: UpdateWorkspaceNameInput!) {
  updateWorkspaceName(input: $input) {
    workspace {
      id
    }
  }
}
    `;

export function useUpdateWorkspaceNameMutation() {
  return Urql.useMutation<UpdateWorkspaceNameMutation, UpdateWorkspaceNameMutationVariables>(UpdateWorkspaceNameDocument);
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
    query commentsByDocumentId($documentId: ID!, $documentShareLinkToken: String, $first: Int = 50, $after: String) {
  commentsByDocumentId(
    documentId: $documentId
    documentShareLinkToken: $documentShareLinkToken
    first: $first
    after: $after
  ) {
    nodes {
      id
      documentId
      snapshotId
      subkeyId
      contentCiphertext
      contentNonce
      signature
      createdAt
      creatorDevice {
        signingPublicKey
        encryptionPublicKey
        encryptionPublicKeySignature
      }
      commentReplies {
        id
        snapshotId
        subkeyId
        contentCiphertext
        contentNonce
        signature
        createdAt
        creatorDevice {
          signingPublicKey
          encryptionPublicKey
          encryptionPublicKeySignature
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

export function useCommentsByDocumentIdQuery(options: Omit<Urql.UseQueryArgs<CommentsByDocumentIdQueryVariables>, 'query'>) {
  return Urql.useQuery<CommentsByDocumentIdQuery, CommentsByDocumentIdQueryVariables>({ query: CommentsByDocumentIdDocument, ...options });
};
export const DevicesDocument = gql`
    query devices($onlyNotExpired: Boolean!, $first: Int!, $after: String) {
  devices(onlyNotExpired: $onlyNotExpired, first: $first, after: $after) {
    nodes {
      signingPublicKey
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
    nameCiphertext
    nameNonce
    parentFolderId
    workspaceId
    subkeyId
  }
}
    `;

export function useDocumentQuery(options: Omit<Urql.UseQueryArgs<DocumentQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentQuery, DocumentQueryVariables>({ query: DocumentDocument, ...options });
};
export const DocumentChainDocument = gql`
    query documentChain($documentId: ID!, $after: String) {
  documentChain(documentId: $documentId, first: 5000, after: $after) {
    nodes {
      serializedContent
      position
    }
  }
}
    `;

export function useDocumentChainQuery(options: Omit<Urql.UseQueryArgs<DocumentChainQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentChainQuery, DocumentChainQueryVariables>({ query: DocumentChainDocument, ...options });
};
export const DocumentPathDocument = gql`
    query documentPath($id: ID!) {
  documentPath(id: $id) {
    id
    nameCiphertext
    nameNonce
    signature
    creatorDeviceSigningPublicKey
    workspaceMemberDevicesProofHash
    parentFolderId
    rootFolderId
    workspaceId
    keyDerivationTrace {
      workspaceKeyId
      trace {
        entryId
        subkeyId
        parentId
        context
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
    websocketSessionKey
    workspaceId
    role
    deviceSecretBoxCiphertext
    deviceSecretBoxNonce
    activeSnapshotKeyBox {
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
export const DocumentShareLinkSnapshotKeyBoxDocument = gql`
    query documentShareLinkSnapshotKeyBox($token: ID!, $snapshotId: ID!) {
  documentShareLinkSnapshotKeyBox(token: $token, snapshotId: $snapshotId) {
    id
    ciphertext
    nonce
    creatorDevice {
      signingPublicKey
      encryptionPublicKey
    }
  }
}
    `;

export function useDocumentShareLinkSnapshotKeyBoxQuery(options: Omit<Urql.UseQueryArgs<DocumentShareLinkSnapshotKeyBoxQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentShareLinkSnapshotKeyBoxQuery, DocumentShareLinkSnapshotKeyBoxQueryVariables>({ query: DocumentShareLinkSnapshotKeyBoxDocument, ...options });
};
export const DocumentShareLinksDocument = gql`
    query documentShareLinks($documentId: ID!, $first: Int! = 50, $after: String) {
  documentShareLinks(documentId: $documentId, first: $first, after: $after) {
    nodes {
      deviceSigningPublicKey
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
      nameCiphertext
      nameNonce
      parentFolderId
      rootFolderId
      workspaceId
      subkeyId
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
export const EncryptedWebDeviceDocument = gql`
    query encryptedWebDevice($accessToken: String!) {
  encryptedWebDevice(accessToken: $accessToken) {
    ciphertext
    nonce
  }
}
    `;

export function useEncryptedWebDeviceQuery(options: Omit<Urql.UseQueryArgs<EncryptedWebDeviceQueryVariables>, 'query'>) {
  return Urql.useQuery<EncryptedWebDeviceQuery, EncryptedWebDeviceQueryVariables>({ query: EncryptedWebDeviceDocument, ...options });
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
    nameCiphertext
    nameNonce
    signature
    creatorDeviceSigningPublicKey
    workspaceMemberDevicesProofHash
    parentFolderId
    workspaceId
    keyDerivationTrace {
      workspaceKeyId
      trace {
        entryId
        subkeyId
        parentId
        context
      }
    }
  }
}
    `;

export function useFolderQuery(options: Omit<Urql.UseQueryArgs<FolderQueryVariables>, 'query'>) {
  return Urql.useQuery<FolderQuery, FolderQueryVariables>({ query: FolderDocument, ...options });
};
export const FolderTraceDocument = gql`
    query folderTrace($folderId: ID!) {
  folderTrace(folderId: $folderId) {
    id
    parentFolderId
    rootFolderId
    workspaceId
    nameCiphertext
    nameNonce
    signature
    creatorDeviceSigningPublicKey
    workspaceMemberDevicesProofHash
    keyDerivationTrace {
      workspaceKeyId
      trace {
        entryId
        subkeyId
        parentId
        context
      }
    }
  }
}
    `;

export function useFolderTraceQuery(options: Omit<Urql.UseQueryArgs<FolderTraceQueryVariables>, 'query'>) {
  return Urql.useQuery<FolderTraceQuery, FolderTraceQueryVariables>({ query: FolderTraceDocument, ...options });
};
export const FoldersDocument = gql`
    query folders($parentFolderId: ID!, $first: Int!, $after: String) {
  folders(parentFolderId: $parentFolderId, first: $first, after: $after) {
    nodes {
      id
      nameCiphertext
      nameNonce
      signature
      creatorDeviceSigningPublicKey
      workspaceMemberDevicesProofHash
      parentFolderId
      rootFolderId
      workspaceId
      keyDerivationTrace {
        workspaceKeyId
        trace {
          entryId
          subkeyId
          parentId
          context
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
    nonce
    ciphertext
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
    mainDeviceSigningPublicKey
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
    ciphertext
    publicNonce
    subkeyId
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
      nameCiphertext
      nameNonce
      signature
      creatorDeviceSigningPublicKey
      workspaceMemberDevicesProofHash
      parentFolderId
      rootFolderId
      workspaceId
      keyDerivationTrace {
        workspaceKeyId
        trace {
          entryId
          subkeyId
          parentId
          context
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
export const SnapshotDocument = gql`
    query snapshot($documentId: ID!) {
  snapshot(documentId: $documentId) {
    id
    data
    documentId
    keyDerivationTrace {
      workspaceKeyId
      trace {
        entryId
        subkeyId
        parentId
        context
      }
    }
  }
}
    `;

export function useSnapshotQuery(options: Omit<Urql.UseQueryArgs<SnapshotQueryVariables>, 'query'>) {
  return Urql.useQuery<SnapshotQuery, SnapshotQueryVariables>({ query: SnapshotDocument, ...options });
};
export const UnauthorizedMemberDocument = gql`
    query unauthorizedMember {
  unauthorizedMember {
    userId
    userMainDeviceSigningPublicKey
    workspaceId
  }
}
    `;

export function useUnauthorizedMemberQuery(options?: Omit<Urql.UseQueryArgs<UnauthorizedMemberQueryVariables>, 'query'>) {
  return Urql.useQuery<UnauthorizedMemberQuery, UnauthorizedMemberQueryVariables>({ query: UnauthorizedMemberDocument, ...options });
};
export const UserChainDocument = gql`
    query userChain($workspaceId: ID, $userId: ID) {
  userChain(first: 5000, workspaceId: $workspaceId, userId: $userId) {
    nodes {
      serializedContent
      position
    }
  }
}
    `;

export function useUserChainQuery(options?: Omit<Urql.UseQueryArgs<UserChainQueryVariables>, 'query'>) {
  return Urql.useQuery<UserChainQuery, UserChainQueryVariables>({ query: UserChainDocument, ...options });
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
    infoCiphertext
    infoNonce
    infoSignature
    infoWorkspaceMemberDevicesProofHash
    infoCreatorDeviceSigningPublicKey
    infoWorkspaceKey {
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
export const WorkspaceChainDocument = gql`
    query workspaceChain($workspaceId: ID!, $after: String) {
  workspaceChain(workspaceId: $workspaceId, first: 5000, after: $after) {
    nodes {
      serializedContent
      position
    }
  }
}
    `;

export function useWorkspaceChainQuery(options: Omit<Urql.UseQueryArgs<WorkspaceChainQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceChainQuery, WorkspaceChainQueryVariables>({ query: WorkspaceChainDocument, ...options });
};
export const WorkspaceChainByInvitationIdDocument = gql`
    query workspaceChainByInvitationId($invitationId: ID!) {
  workspaceChainByInvitationId(invitationId: $invitationId, first: 5000) {
    nodes {
      serializedContent
      position
    }
  }
}
    `;

export function useWorkspaceChainByInvitationIdQuery(options: Omit<Urql.UseQueryArgs<WorkspaceChainByInvitationIdQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceChainByInvitationIdQuery, WorkspaceChainByInvitationIdQueryVariables>({ query: WorkspaceChainByInvitationIdDocument, ...options });
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
    role
    expiresAt
    invitationDataSignature
    invitationSigningPublicKey
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
      role
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
export const WorkspaceMemberDevicesProofDocument = gql`
    query workspaceMemberDevicesProof($workspaceId: ID!, $invitationId: ID, $hash: String) {
  workspaceMemberDevicesProof(
    workspaceId: $workspaceId
    invitationId: $invitationId
    hash: $hash
  ) {
    proof {
      hash
      hashSignature
      clock
      version
    }
    serializedData
    authorMainDeviceSigningPublicKey
  }
}
    `;

export function useWorkspaceMemberDevicesProofQuery(options: Omit<Urql.UseQueryArgs<WorkspaceMemberDevicesProofQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceMemberDevicesProofQuery, WorkspaceMemberDevicesProofQueryVariables>({ query: WorkspaceMemberDevicesProofDocument, ...options });
};
export const WorkspaceMemberDevicesProofsDocument = gql`
    query workspaceMemberDevicesProofs {
  workspaceMemberDevicesProofs(first: 50) {
    nodes {
      proof {
        hash
        hashSignature
        clock
        version
      }
      serializedData
      workspaceId
      authorMainDeviceSigningPublicKey
    }
  }
}
    `;

export function useWorkspaceMemberDevicesProofsQuery(options?: Omit<Urql.UseQueryArgs<WorkspaceMemberDevicesProofsQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceMemberDevicesProofsQuery, WorkspaceMemberDevicesProofsQueryVariables>({ query: WorkspaceMemberDevicesProofsDocument, ...options });
};
export const WorkspaceMembersDocument = gql`
    query workspaceMembers($workspaceId: ID!) {
  workspaceMembers(workspaceId: $workspaceId, first: 500) {
    nodes {
      id
      user {
        id
        username
        chain {
          serializedContent
          position
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

export function useWorkspaceMembersQuery(options: Omit<Urql.UseQueryArgs<WorkspaceMembersQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceMembersQuery, WorkspaceMembersQueryVariables>({ query: WorkspaceMembersDocument, ...options });
};
export const WorkspaceMembersByMainDeviceSigningPublicKeyDocument = gql`
    query workspaceMembersByMainDeviceSigningPublicKey($workspaceId: ID!, $mainDeviceSigningPublicKeys: [String!]!) {
  workspaceMembersByMainDeviceSigningPublicKey(
    workspaceId: $workspaceId
    mainDeviceSigningPublicKeys: $mainDeviceSigningPublicKeys
  ) {
    workspaceMembers {
      id
      user {
        id
        username
        chain {
          serializedContent
        }
      }
    }
  }
}
    `;

export function useWorkspaceMembersByMainDeviceSigningPublicKeyQuery(options: Omit<Urql.UseQueryArgs<WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceMembersByMainDeviceSigningPublicKeyQuery, WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables>({ query: WorkspaceMembersByMainDeviceSigningPublicKeyDocument, ...options });
};
export const WorkspacesDocument = gql`
    query workspaces($deviceSigningPublicKey: String!) {
  workspaces(first: 50, deviceSigningPublicKey: $deviceSigningPublicKey) {
    nodes {
      id
      infoCiphertext
      infoNonce
      infoSignature
      infoWorkspaceMemberDevicesProofHash
      infoCreatorDeviceSigningPublicKey
      infoWorkspaceKey {
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

export const runAddDeviceMutation = async (variables: AddDeviceMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<AddDeviceMutation, AddDeviceMutationVariables>(
      AddDeviceDocument,
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

export const runAuthorizeMemberMutation = async (variables: AuthorizeMemberMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<AuthorizeMemberMutation, AuthorizeMemberMutationVariables>(
      AuthorizeMemberDocument,
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

export const runCreateCommentReplyMutation = async (variables: CreateCommentReplyMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<CreateCommentReplyMutation, CreateCommentReplyMutationVariables>(
      CreateCommentReplyDocument,
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

export const runDeleteCommentRepliesMutation = async (variables: DeleteCommentRepliesMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<DeleteCommentRepliesMutation, DeleteCommentRepliesMutationVariables>(
      DeleteCommentRepliesDocument,
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

export const runDeleteDeviceMutation = async (variables: DeleteDeviceMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<DeleteDeviceMutation, DeleteDeviceMutationVariables>(
      DeleteDeviceDocument,
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

export const runRemoveMemberAndRotateWorkspaceKeyMutation = async (variables: RemoveMemberAndRotateWorkspaceKeyMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<RemoveMemberAndRotateWorkspaceKeyMutation, RemoveMemberAndRotateWorkspaceKeyMutationVariables>(
      RemoveMemberAndRotateWorkspaceKeyDocument,
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

export const runUpdateWorkspaceMemberRoleMutation = async (variables: UpdateWorkspaceMemberRoleMutationVariables, options?: any) => {
  return await getUrqlClient()
    .mutation<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>(
      UpdateWorkspaceMemberRoleDocument,
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
        // @ts-expect-error
        clearInterval(intervalId);
        commentsByDocumentIdQueryServiceSubscribers[variablesString].intervalId = null;
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
        // @ts-expect-error
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
        // @ts-expect-error
        clearInterval(intervalId);
        documentQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runDocumentChainQuery = async (variables: DocumentChainQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<DocumentChainQuery, DocumentChainQueryVariables>(
      DocumentChainDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type DocumentChainQueryResult = Urql.OperationResult<DocumentChainQuery, DocumentChainQueryVariables>;

export type DocumentChainQueryUpdateResultEvent = {
  type: "DocumentChainQuery.UPDATE_RESULT";
  result: DocumentChainQueryResult;
};

export type DocumentChainQueryErrorEvent = {
  type: "DocumentChainQuery.ERROR";
  result: DocumentChainQueryResult;
};

export type DocumentChainQueryServiceEvent = DocumentChainQueryUpdateResultEvent | DocumentChainQueryErrorEvent;

type DocumentChainQueryServiceSubscribersEntry = {
  variables: DocumentChainQueryVariables;
  callbacks: ((event: DocumentChainQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type DocumentChainQueryServiceSubscribers = {
  [variables: string]: DocumentChainQueryServiceSubscribersEntry;
};

const documentChainQueryServiceSubscribers: DocumentChainQueryServiceSubscribers = {};

const triggerDocumentChainQuery = (variablesString: string, variables: DocumentChainQueryVariables) => {
  getUrqlClient()
    .query<DocumentChainQuery, DocumentChainQueryVariables>(DocumentChainDocument, variables)
    .toPromise()
    .then((result) => {
      documentChainQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "DocumentChainQuery.ERROR" : "DocumentChainQuery.UPDATE_RESULT",
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
export const documentChainQueryService =
  (variables: DocumentChainQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (documentChainQueryServiceSubscribers[variablesString]) {
      documentChainQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      documentChainQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerDocumentChainQuery(variablesString, variables);
    if (!documentChainQueryServiceSubscribers[variablesString].intervalId) {
      documentChainQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerDocumentChainQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = documentChainQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        documentChainQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        documentChainQueryServiceSubscribers[variablesString].intervalId = null;
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
        // @ts-expect-error
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
        // @ts-expect-error
        clearInterval(intervalId);
        documentShareLinkQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runDocumentShareLinkSnapshotKeyBoxQuery = async (variables: DocumentShareLinkSnapshotKeyBoxQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<DocumentShareLinkSnapshotKeyBoxQuery, DocumentShareLinkSnapshotKeyBoxQueryVariables>(
      DocumentShareLinkSnapshotKeyBoxDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type DocumentShareLinkSnapshotKeyBoxQueryResult = Urql.OperationResult<DocumentShareLinkSnapshotKeyBoxQuery, DocumentShareLinkSnapshotKeyBoxQueryVariables>;

export type DocumentShareLinkSnapshotKeyBoxQueryUpdateResultEvent = {
  type: "DocumentShareLinkSnapshotKeyBoxQuery.UPDATE_RESULT";
  result: DocumentShareLinkSnapshotKeyBoxQueryResult;
};

export type DocumentShareLinkSnapshotKeyBoxQueryErrorEvent = {
  type: "DocumentShareLinkSnapshotKeyBoxQuery.ERROR";
  result: DocumentShareLinkSnapshotKeyBoxQueryResult;
};

export type DocumentShareLinkSnapshotKeyBoxQueryServiceEvent = DocumentShareLinkSnapshotKeyBoxQueryUpdateResultEvent | DocumentShareLinkSnapshotKeyBoxQueryErrorEvent;

type DocumentShareLinkSnapshotKeyBoxQueryServiceSubscribersEntry = {
  variables: DocumentShareLinkSnapshotKeyBoxQueryVariables;
  callbacks: ((event: DocumentShareLinkSnapshotKeyBoxQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type DocumentShareLinkSnapshotKeyBoxQueryServiceSubscribers = {
  [variables: string]: DocumentShareLinkSnapshotKeyBoxQueryServiceSubscribersEntry;
};

const documentShareLinkSnapshotKeyBoxQueryServiceSubscribers: DocumentShareLinkSnapshotKeyBoxQueryServiceSubscribers = {};

const triggerDocumentShareLinkSnapshotKeyBoxQuery = (variablesString: string, variables: DocumentShareLinkSnapshotKeyBoxQueryVariables) => {
  getUrqlClient()
    .query<DocumentShareLinkSnapshotKeyBoxQuery, DocumentShareLinkSnapshotKeyBoxQueryVariables>(DocumentShareLinkSnapshotKeyBoxDocument, variables)
    .toPromise()
    .then((result) => {
      documentShareLinkSnapshotKeyBoxQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "DocumentShareLinkSnapshotKeyBoxQuery.ERROR" : "DocumentShareLinkSnapshotKeyBoxQuery.UPDATE_RESULT",
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
export const documentShareLinkSnapshotKeyBoxQueryService =
  (variables: DocumentShareLinkSnapshotKeyBoxQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (documentShareLinkSnapshotKeyBoxQueryServiceSubscribers[variablesString]) {
      documentShareLinkSnapshotKeyBoxQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      documentShareLinkSnapshotKeyBoxQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerDocumentShareLinkSnapshotKeyBoxQuery(variablesString, variables);
    if (!documentShareLinkSnapshotKeyBoxQueryServiceSubscribers[variablesString].intervalId) {
      documentShareLinkSnapshotKeyBoxQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerDocumentShareLinkSnapshotKeyBoxQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = documentShareLinkSnapshotKeyBoxQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        documentShareLinkSnapshotKeyBoxQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        documentShareLinkSnapshotKeyBoxQueryServiceSubscribers[variablesString].intervalId = null;
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
        // @ts-expect-error
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
        // @ts-expect-error
        clearInterval(intervalId);
        documentsQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runEncryptedWebDeviceQuery = async (variables: EncryptedWebDeviceQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<EncryptedWebDeviceQuery, EncryptedWebDeviceQueryVariables>(
      EncryptedWebDeviceDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type EncryptedWebDeviceQueryResult = Urql.OperationResult<EncryptedWebDeviceQuery, EncryptedWebDeviceQueryVariables>;

export type EncryptedWebDeviceQueryUpdateResultEvent = {
  type: "EncryptedWebDeviceQuery.UPDATE_RESULT";
  result: EncryptedWebDeviceQueryResult;
};

export type EncryptedWebDeviceQueryErrorEvent = {
  type: "EncryptedWebDeviceQuery.ERROR";
  result: EncryptedWebDeviceQueryResult;
};

export type EncryptedWebDeviceQueryServiceEvent = EncryptedWebDeviceQueryUpdateResultEvent | EncryptedWebDeviceQueryErrorEvent;

type EncryptedWebDeviceQueryServiceSubscribersEntry = {
  variables: EncryptedWebDeviceQueryVariables;
  callbacks: ((event: EncryptedWebDeviceQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type EncryptedWebDeviceQueryServiceSubscribers = {
  [variables: string]: EncryptedWebDeviceQueryServiceSubscribersEntry;
};

const encryptedWebDeviceQueryServiceSubscribers: EncryptedWebDeviceQueryServiceSubscribers = {};

const triggerEncryptedWebDeviceQuery = (variablesString: string, variables: EncryptedWebDeviceQueryVariables) => {
  getUrqlClient()
    .query<EncryptedWebDeviceQuery, EncryptedWebDeviceQueryVariables>(EncryptedWebDeviceDocument, variables)
    .toPromise()
    .then((result) => {
      encryptedWebDeviceQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "EncryptedWebDeviceQuery.ERROR" : "EncryptedWebDeviceQuery.UPDATE_RESULT",
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
export const encryptedWebDeviceQueryService =
  (variables: EncryptedWebDeviceQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (encryptedWebDeviceQueryServiceSubscribers[variablesString]) {
      encryptedWebDeviceQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      encryptedWebDeviceQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerEncryptedWebDeviceQuery(variablesString, variables);
    if (!encryptedWebDeviceQueryServiceSubscribers[variablesString].intervalId) {
      encryptedWebDeviceQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerEncryptedWebDeviceQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = encryptedWebDeviceQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        encryptedWebDeviceQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        encryptedWebDeviceQueryServiceSubscribers[variablesString].intervalId = null;
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
        // @ts-expect-error
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
        // @ts-expect-error
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
        // @ts-expect-error
        clearInterval(intervalId);
        folderQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runFolderTraceQuery = async (variables: FolderTraceQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<FolderTraceQuery, FolderTraceQueryVariables>(
      FolderTraceDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type FolderTraceQueryResult = Urql.OperationResult<FolderTraceQuery, FolderTraceQueryVariables>;

export type FolderTraceQueryUpdateResultEvent = {
  type: "FolderTraceQuery.UPDATE_RESULT";
  result: FolderTraceQueryResult;
};

export type FolderTraceQueryErrorEvent = {
  type: "FolderTraceQuery.ERROR";
  result: FolderTraceQueryResult;
};

export type FolderTraceQueryServiceEvent = FolderTraceQueryUpdateResultEvent | FolderTraceQueryErrorEvent;

type FolderTraceQueryServiceSubscribersEntry = {
  variables: FolderTraceQueryVariables;
  callbacks: ((event: FolderTraceQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type FolderTraceQueryServiceSubscribers = {
  [variables: string]: FolderTraceQueryServiceSubscribersEntry;
};

const folderTraceQueryServiceSubscribers: FolderTraceQueryServiceSubscribers = {};

const triggerFolderTraceQuery = (variablesString: string, variables: FolderTraceQueryVariables) => {
  getUrqlClient()
    .query<FolderTraceQuery, FolderTraceQueryVariables>(FolderTraceDocument, variables)
    .toPromise()
    .then((result) => {
      folderTraceQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "FolderTraceQuery.ERROR" : "FolderTraceQuery.UPDATE_RESULT",
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
export const folderTraceQueryService =
  (variables: FolderTraceQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (folderTraceQueryServiceSubscribers[variablesString]) {
      folderTraceQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      folderTraceQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerFolderTraceQuery(variablesString, variables);
    if (!folderTraceQueryServiceSubscribers[variablesString].intervalId) {
      folderTraceQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerFolderTraceQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = folderTraceQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        folderTraceQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        folderTraceQueryServiceSubscribers[variablesString].intervalId = null;
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
        // @ts-expect-error
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
        // @ts-expect-error
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
        // @ts-expect-error
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
        // @ts-expect-error
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
        // @ts-expect-error
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
        // @ts-expect-error
        clearInterval(intervalId);
        rootFoldersQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runSnapshotQuery = async (variables: SnapshotQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<SnapshotQuery, SnapshotQueryVariables>(
      SnapshotDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type SnapshotQueryResult = Urql.OperationResult<SnapshotQuery, SnapshotQueryVariables>;

export type SnapshotQueryUpdateResultEvent = {
  type: "SnapshotQuery.UPDATE_RESULT";
  result: SnapshotQueryResult;
};

export type SnapshotQueryErrorEvent = {
  type: "SnapshotQuery.ERROR";
  result: SnapshotQueryResult;
};

export type SnapshotQueryServiceEvent = SnapshotQueryUpdateResultEvent | SnapshotQueryErrorEvent;

type SnapshotQueryServiceSubscribersEntry = {
  variables: SnapshotQueryVariables;
  callbacks: ((event: SnapshotQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type SnapshotQueryServiceSubscribers = {
  [variables: string]: SnapshotQueryServiceSubscribersEntry;
};

const snapshotQueryServiceSubscribers: SnapshotQueryServiceSubscribers = {};

const triggerSnapshotQuery = (variablesString: string, variables: SnapshotQueryVariables) => {
  getUrqlClient()
    .query<SnapshotQuery, SnapshotQueryVariables>(SnapshotDocument, variables)
    .toPromise()
    .then((result) => {
      snapshotQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "SnapshotQuery.ERROR" : "SnapshotQuery.UPDATE_RESULT",
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
export const snapshotQueryService =
  (variables: SnapshotQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (snapshotQueryServiceSubscribers[variablesString]) {
      snapshotQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      snapshotQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerSnapshotQuery(variablesString, variables);
    if (!snapshotQueryServiceSubscribers[variablesString].intervalId) {
      snapshotQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerSnapshotQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = snapshotQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        snapshotQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        snapshotQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runUnauthorizedMemberQuery = async (variables: UnauthorizedMemberQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<UnauthorizedMemberQuery, UnauthorizedMemberQueryVariables>(
      UnauthorizedMemberDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type UnauthorizedMemberQueryResult = Urql.OperationResult<UnauthorizedMemberQuery, UnauthorizedMemberQueryVariables>;

export type UnauthorizedMemberQueryUpdateResultEvent = {
  type: "UnauthorizedMemberQuery.UPDATE_RESULT";
  result: UnauthorizedMemberQueryResult;
};

export type UnauthorizedMemberQueryErrorEvent = {
  type: "UnauthorizedMemberQuery.ERROR";
  result: UnauthorizedMemberQueryResult;
};

export type UnauthorizedMemberQueryServiceEvent = UnauthorizedMemberQueryUpdateResultEvent | UnauthorizedMemberQueryErrorEvent;

type UnauthorizedMemberQueryServiceSubscribersEntry = {
  variables: UnauthorizedMemberQueryVariables;
  callbacks: ((event: UnauthorizedMemberQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type UnauthorizedMemberQueryServiceSubscribers = {
  [variables: string]: UnauthorizedMemberQueryServiceSubscribersEntry;
};

const unauthorizedMemberQueryServiceSubscribers: UnauthorizedMemberQueryServiceSubscribers = {};

const triggerUnauthorizedMemberQuery = (variablesString: string, variables: UnauthorizedMemberQueryVariables) => {
  getUrqlClient()
    .query<UnauthorizedMemberQuery, UnauthorizedMemberQueryVariables>(UnauthorizedMemberDocument, variables)
    .toPromise()
    .then((result) => {
      unauthorizedMemberQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "UnauthorizedMemberQuery.ERROR" : "UnauthorizedMemberQuery.UPDATE_RESULT",
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
export const unauthorizedMemberQueryService =
  (variables: UnauthorizedMemberQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (unauthorizedMemberQueryServiceSubscribers[variablesString]) {
      unauthorizedMemberQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      unauthorizedMemberQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerUnauthorizedMemberQuery(variablesString, variables);
    if (!unauthorizedMemberQueryServiceSubscribers[variablesString].intervalId) {
      unauthorizedMemberQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerUnauthorizedMemberQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = unauthorizedMemberQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        unauthorizedMemberQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        unauthorizedMemberQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runUserChainQuery = async (variables: UserChainQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<UserChainQuery, UserChainQueryVariables>(
      UserChainDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type UserChainQueryResult = Urql.OperationResult<UserChainQuery, UserChainQueryVariables>;

export type UserChainQueryUpdateResultEvent = {
  type: "UserChainQuery.UPDATE_RESULT";
  result: UserChainQueryResult;
};

export type UserChainQueryErrorEvent = {
  type: "UserChainQuery.ERROR";
  result: UserChainQueryResult;
};

export type UserChainQueryServiceEvent = UserChainQueryUpdateResultEvent | UserChainQueryErrorEvent;

type UserChainQueryServiceSubscribersEntry = {
  variables: UserChainQueryVariables;
  callbacks: ((event: UserChainQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type UserChainQueryServiceSubscribers = {
  [variables: string]: UserChainQueryServiceSubscribersEntry;
};

const userChainQueryServiceSubscribers: UserChainQueryServiceSubscribers = {};

const triggerUserChainQuery = (variablesString: string, variables: UserChainQueryVariables) => {
  getUrqlClient()
    .query<UserChainQuery, UserChainQueryVariables>(UserChainDocument, variables)
    .toPromise()
    .then((result) => {
      userChainQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "UserChainQuery.ERROR" : "UserChainQuery.UPDATE_RESULT",
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
export const userChainQueryService =
  (variables: UserChainQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (userChainQueryServiceSubscribers[variablesString]) {
      userChainQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      userChainQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerUserChainQuery(variablesString, variables);
    if (!userChainQueryServiceSubscribers[variablesString].intervalId) {
      userChainQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerUserChainQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = userChainQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        userChainQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        userChainQueryServiceSubscribers[variablesString].intervalId = null;
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
        // @ts-expect-error
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
        // @ts-expect-error
        clearInterval(intervalId);
        workspaceQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceChainQuery = async (variables: WorkspaceChainQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceChainQuery, WorkspaceChainQueryVariables>(
      WorkspaceChainDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceChainQueryResult = Urql.OperationResult<WorkspaceChainQuery, WorkspaceChainQueryVariables>;

export type WorkspaceChainQueryUpdateResultEvent = {
  type: "WorkspaceChainQuery.UPDATE_RESULT";
  result: WorkspaceChainQueryResult;
};

export type WorkspaceChainQueryErrorEvent = {
  type: "WorkspaceChainQuery.ERROR";
  result: WorkspaceChainQueryResult;
};

export type WorkspaceChainQueryServiceEvent = WorkspaceChainQueryUpdateResultEvent | WorkspaceChainQueryErrorEvent;

type WorkspaceChainQueryServiceSubscribersEntry = {
  variables: WorkspaceChainQueryVariables;
  callbacks: ((event: WorkspaceChainQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceChainQueryServiceSubscribers = {
  [variables: string]: WorkspaceChainQueryServiceSubscribersEntry;
};

const workspaceChainQueryServiceSubscribers: WorkspaceChainQueryServiceSubscribers = {};

const triggerWorkspaceChainQuery = (variablesString: string, variables: WorkspaceChainQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceChainQuery, WorkspaceChainQueryVariables>(WorkspaceChainDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceChainQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceChainQuery.ERROR" : "WorkspaceChainQuery.UPDATE_RESULT",
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
export const workspaceChainQueryService =
  (variables: WorkspaceChainQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceChainQueryServiceSubscribers[variablesString]) {
      workspaceChainQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceChainQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceChainQuery(variablesString, variables);
    if (!workspaceChainQueryServiceSubscribers[variablesString].intervalId) {
      workspaceChainQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceChainQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceChainQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceChainQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        workspaceChainQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceChainByInvitationIdQuery = async (variables: WorkspaceChainByInvitationIdQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceChainByInvitationIdQuery, WorkspaceChainByInvitationIdQueryVariables>(
      WorkspaceChainByInvitationIdDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceChainByInvitationIdQueryResult = Urql.OperationResult<WorkspaceChainByInvitationIdQuery, WorkspaceChainByInvitationIdQueryVariables>;

export type WorkspaceChainByInvitationIdQueryUpdateResultEvent = {
  type: "WorkspaceChainByInvitationIdQuery.UPDATE_RESULT";
  result: WorkspaceChainByInvitationIdQueryResult;
};

export type WorkspaceChainByInvitationIdQueryErrorEvent = {
  type: "WorkspaceChainByInvitationIdQuery.ERROR";
  result: WorkspaceChainByInvitationIdQueryResult;
};

export type WorkspaceChainByInvitationIdQueryServiceEvent = WorkspaceChainByInvitationIdQueryUpdateResultEvent | WorkspaceChainByInvitationIdQueryErrorEvent;

type WorkspaceChainByInvitationIdQueryServiceSubscribersEntry = {
  variables: WorkspaceChainByInvitationIdQueryVariables;
  callbacks: ((event: WorkspaceChainByInvitationIdQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceChainByInvitationIdQueryServiceSubscribers = {
  [variables: string]: WorkspaceChainByInvitationIdQueryServiceSubscribersEntry;
};

const workspaceChainByInvitationIdQueryServiceSubscribers: WorkspaceChainByInvitationIdQueryServiceSubscribers = {};

const triggerWorkspaceChainByInvitationIdQuery = (variablesString: string, variables: WorkspaceChainByInvitationIdQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceChainByInvitationIdQuery, WorkspaceChainByInvitationIdQueryVariables>(WorkspaceChainByInvitationIdDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceChainByInvitationIdQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceChainByInvitationIdQuery.ERROR" : "WorkspaceChainByInvitationIdQuery.UPDATE_RESULT",
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
export const workspaceChainByInvitationIdQueryService =
  (variables: WorkspaceChainByInvitationIdQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceChainByInvitationIdQueryServiceSubscribers[variablesString]) {
      workspaceChainByInvitationIdQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceChainByInvitationIdQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceChainByInvitationIdQuery(variablesString, variables);
    if (!workspaceChainByInvitationIdQueryServiceSubscribers[variablesString].intervalId) {
      workspaceChainByInvitationIdQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceChainByInvitationIdQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceChainByInvitationIdQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceChainByInvitationIdQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        workspaceChainByInvitationIdQueryServiceSubscribers[variablesString].intervalId = null;
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
        // @ts-expect-error
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
        // @ts-expect-error
        clearInterval(intervalId);
        workspaceInvitationsQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceMemberDevicesProofQuery = async (variables: WorkspaceMemberDevicesProofQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceMemberDevicesProofQuery, WorkspaceMemberDevicesProofQueryVariables>(
      WorkspaceMemberDevicesProofDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceMemberDevicesProofQueryResult = Urql.OperationResult<WorkspaceMemberDevicesProofQuery, WorkspaceMemberDevicesProofQueryVariables>;

export type WorkspaceMemberDevicesProofQueryUpdateResultEvent = {
  type: "WorkspaceMemberDevicesProofQuery.UPDATE_RESULT";
  result: WorkspaceMemberDevicesProofQueryResult;
};

export type WorkspaceMemberDevicesProofQueryErrorEvent = {
  type: "WorkspaceMemberDevicesProofQuery.ERROR";
  result: WorkspaceMemberDevicesProofQueryResult;
};

export type WorkspaceMemberDevicesProofQueryServiceEvent = WorkspaceMemberDevicesProofQueryUpdateResultEvent | WorkspaceMemberDevicesProofQueryErrorEvent;

type WorkspaceMemberDevicesProofQueryServiceSubscribersEntry = {
  variables: WorkspaceMemberDevicesProofQueryVariables;
  callbacks: ((event: WorkspaceMemberDevicesProofQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceMemberDevicesProofQueryServiceSubscribers = {
  [variables: string]: WorkspaceMemberDevicesProofQueryServiceSubscribersEntry;
};

const workspaceMemberDevicesProofQueryServiceSubscribers: WorkspaceMemberDevicesProofQueryServiceSubscribers = {};

const triggerWorkspaceMemberDevicesProofQuery = (variablesString: string, variables: WorkspaceMemberDevicesProofQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceMemberDevicesProofQuery, WorkspaceMemberDevicesProofQueryVariables>(WorkspaceMemberDevicesProofDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceMemberDevicesProofQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceMemberDevicesProofQuery.ERROR" : "WorkspaceMemberDevicesProofQuery.UPDATE_RESULT",
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
export const workspaceMemberDevicesProofQueryService =
  (variables: WorkspaceMemberDevicesProofQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceMemberDevicesProofQueryServiceSubscribers[variablesString]) {
      workspaceMemberDevicesProofQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceMemberDevicesProofQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceMemberDevicesProofQuery(variablesString, variables);
    if (!workspaceMemberDevicesProofQueryServiceSubscribers[variablesString].intervalId) {
      workspaceMemberDevicesProofQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceMemberDevicesProofQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceMemberDevicesProofQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceMemberDevicesProofQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        workspaceMemberDevicesProofQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceMemberDevicesProofsQuery = async (variables: WorkspaceMemberDevicesProofsQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceMemberDevicesProofsQuery, WorkspaceMemberDevicesProofsQueryVariables>(
      WorkspaceMemberDevicesProofsDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceMemberDevicesProofsQueryResult = Urql.OperationResult<WorkspaceMemberDevicesProofsQuery, WorkspaceMemberDevicesProofsQueryVariables>;

export type WorkspaceMemberDevicesProofsQueryUpdateResultEvent = {
  type: "WorkspaceMemberDevicesProofsQuery.UPDATE_RESULT";
  result: WorkspaceMemberDevicesProofsQueryResult;
};

export type WorkspaceMemberDevicesProofsQueryErrorEvent = {
  type: "WorkspaceMemberDevicesProofsQuery.ERROR";
  result: WorkspaceMemberDevicesProofsQueryResult;
};

export type WorkspaceMemberDevicesProofsQueryServiceEvent = WorkspaceMemberDevicesProofsQueryUpdateResultEvent | WorkspaceMemberDevicesProofsQueryErrorEvent;

type WorkspaceMemberDevicesProofsQueryServiceSubscribersEntry = {
  variables: WorkspaceMemberDevicesProofsQueryVariables;
  callbacks: ((event: WorkspaceMemberDevicesProofsQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceMemberDevicesProofsQueryServiceSubscribers = {
  [variables: string]: WorkspaceMemberDevicesProofsQueryServiceSubscribersEntry;
};

const workspaceMemberDevicesProofsQueryServiceSubscribers: WorkspaceMemberDevicesProofsQueryServiceSubscribers = {};

const triggerWorkspaceMemberDevicesProofsQuery = (variablesString: string, variables: WorkspaceMemberDevicesProofsQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceMemberDevicesProofsQuery, WorkspaceMemberDevicesProofsQueryVariables>(WorkspaceMemberDevicesProofsDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceMemberDevicesProofsQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceMemberDevicesProofsQuery.ERROR" : "WorkspaceMemberDevicesProofsQuery.UPDATE_RESULT",
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
export const workspaceMemberDevicesProofsQueryService =
  (variables: WorkspaceMemberDevicesProofsQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceMemberDevicesProofsQueryServiceSubscribers[variablesString]) {
      workspaceMemberDevicesProofsQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceMemberDevicesProofsQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceMemberDevicesProofsQuery(variablesString, variables);
    if (!workspaceMemberDevicesProofsQueryServiceSubscribers[variablesString].intervalId) {
      workspaceMemberDevicesProofsQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceMemberDevicesProofsQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceMemberDevicesProofsQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceMemberDevicesProofsQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        workspaceMemberDevicesProofsQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceMembersQuery = async (variables: WorkspaceMembersQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceMembersQuery, WorkspaceMembersQueryVariables>(
      WorkspaceMembersDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceMembersQueryResult = Urql.OperationResult<WorkspaceMembersQuery, WorkspaceMembersQueryVariables>;

export type WorkspaceMembersQueryUpdateResultEvent = {
  type: "WorkspaceMembersQuery.UPDATE_RESULT";
  result: WorkspaceMembersQueryResult;
};

export type WorkspaceMembersQueryErrorEvent = {
  type: "WorkspaceMembersQuery.ERROR";
  result: WorkspaceMembersQueryResult;
};

export type WorkspaceMembersQueryServiceEvent = WorkspaceMembersQueryUpdateResultEvent | WorkspaceMembersQueryErrorEvent;

type WorkspaceMembersQueryServiceSubscribersEntry = {
  variables: WorkspaceMembersQueryVariables;
  callbacks: ((event: WorkspaceMembersQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceMembersQueryServiceSubscribers = {
  [variables: string]: WorkspaceMembersQueryServiceSubscribersEntry;
};

const workspaceMembersQueryServiceSubscribers: WorkspaceMembersQueryServiceSubscribers = {};

const triggerWorkspaceMembersQuery = (variablesString: string, variables: WorkspaceMembersQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceMembersQuery, WorkspaceMembersQueryVariables>(WorkspaceMembersDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceMembersQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceMembersQuery.ERROR" : "WorkspaceMembersQuery.UPDATE_RESULT",
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
export const workspaceMembersQueryService =
  (variables: WorkspaceMembersQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceMembersQueryServiceSubscribers[variablesString]) {
      workspaceMembersQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceMembersQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceMembersQuery(variablesString, variables);
    if (!workspaceMembersQueryServiceSubscribers[variablesString].intervalId) {
      workspaceMembersQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceMembersQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceMembersQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceMembersQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        workspaceMembersQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };



export const runWorkspaceMembersByMainDeviceSigningPublicKeyQuery = async (variables: WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables, options?: any) => {
  return await getUrqlClient()
    .query<WorkspaceMembersByMainDeviceSigningPublicKeyQuery, WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables>(
      WorkspaceMembersByMainDeviceSigningPublicKeyDocument,
      variables,
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
        ...options
      }
    )
    .toPromise();
};

export type WorkspaceMembersByMainDeviceSigningPublicKeyQueryResult = Urql.OperationResult<WorkspaceMembersByMainDeviceSigningPublicKeyQuery, WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables>;

export type WorkspaceMembersByMainDeviceSigningPublicKeyQueryUpdateResultEvent = {
  type: "WorkspaceMembersByMainDeviceSigningPublicKeyQuery.UPDATE_RESULT";
  result: WorkspaceMembersByMainDeviceSigningPublicKeyQueryResult;
};

export type WorkspaceMembersByMainDeviceSigningPublicKeyQueryErrorEvent = {
  type: "WorkspaceMembersByMainDeviceSigningPublicKeyQuery.ERROR";
  result: WorkspaceMembersByMainDeviceSigningPublicKeyQueryResult;
};

export type WorkspaceMembersByMainDeviceSigningPublicKeyQueryServiceEvent = WorkspaceMembersByMainDeviceSigningPublicKeyQueryUpdateResultEvent | WorkspaceMembersByMainDeviceSigningPublicKeyQueryErrorEvent;

type WorkspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribersEntry = {
  variables: WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables;
  callbacks: ((event: WorkspaceMembersByMainDeviceSigningPublicKeyQueryServiceEvent) => void)[];
  intervalId: NodeJS.Timer | null;
};

type WorkspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers = {
  [variables: string]: WorkspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribersEntry;
};

const workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers: WorkspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers = {};

const triggerWorkspaceMembersByMainDeviceSigningPublicKeyQuery = (variablesString: string, variables: WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables) => {
  getUrqlClient()
    .query<WorkspaceMembersByMainDeviceSigningPublicKeyQuery, WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables>(WorkspaceMembersByMainDeviceSigningPublicKeyDocument, variables)
    .toPromise()
    .then((result) => {
      workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers[variablesString].callbacks.forEach(
        (callback) => {
          callback({
            type: result.error ? "WorkspaceMembersByMainDeviceSigningPublicKeyQuery.ERROR" : "WorkspaceMembersByMainDeviceSigningPublicKeyQuery.UPDATE_RESULT",
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
export const workspaceMembersByMainDeviceSigningPublicKeyQueryService =
  (variables: WorkspaceMembersByMainDeviceSigningPublicKeyQueryVariables, intervalInMs?: number) => (callback, onReceive) => {
    const variablesString = canonicalize(variables) as string;
    if (workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers[variablesString]) {
      workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers[variablesString].callbacks.push(callback);
    } else {
      workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers[variablesString] = {
        variables,
        callbacks: [callback],
        intervalId: null,
      };
    }

    triggerWorkspaceMembersByMainDeviceSigningPublicKeyQuery(variablesString, variables);
    if (!workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers[variablesString].intervalId) {
      workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers[variablesString].intervalId = setInterval(
        () => {
          triggerWorkspaceMembersByMainDeviceSigningPublicKeyQuery(variablesString, variables);
        },
        intervalInMs || 4000
      );
    }

    const intervalId = workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers[variablesString].intervalId;
    return () => {
      if (
        workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers[variablesString].callbacks.length === 0 &&
        intervalId
      ) {
        // perform cleanup
        // @ts-expect-error
        clearInterval(intervalId);
        workspaceMembersByMainDeviceSigningPublicKeyQueryServiceSubscribers[variablesString].intervalId = null;
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
        // @ts-expect-error
        clearInterval(intervalId);
        workspacesQueryServiceSubscribers[variablesString].intervalId = null;
      }
    };
  };

