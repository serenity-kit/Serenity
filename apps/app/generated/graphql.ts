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
};

export type ClientOprfLoginChallengeInput = {
  challenge: Scalars['String'];
  username: Scalars['String'];
};

export type ClientOprfLoginChallengeResult = {
  __typename?: 'ClientOprfLoginChallengeResult';
  nonce: Scalars['String'];
  oprfChallengeResponse: Scalars['String'];
  oprfPublicKey: Scalars['String'];
  secret: Scalars['String'];
};

export type ClientOprfLoginFinalizeInput = {
  username: Scalars['String'];
};

export type ClientOprfLoginFinalizeeResult = {
  __typename?: 'ClientOprfLoginFinalizeeResult';
  nonce: Scalars['String'];
  oauthData: Scalars['String'];
};

export type ClientOprfRegistrationChallengeRequest = {
  challenge: Scalars['String'];
  username: Scalars['String'];
};

export type ClientOprfRegistrationChallengeResult = {
  __typename?: 'ClientOprfRegistrationChallengeResult';
  oprfChallengeResponse: Scalars['String'];
  oprfPublicKey: Scalars['String'];
  serverPublicKey: Scalars['String'];
};

export type ClientOprfRegistrationFinalizeInput = {
  clientPublicKey: Scalars['String'];
  nonce: Scalars['String'];
  secret: Scalars['String'];
  username: Scalars['String'];
  workspaceId: Scalars['String'];
};

export type ClientOprfRegistrationFinalizeResult = {
  __typename?: 'ClientOprfRegistrationFinalizeResult';
  status: Scalars['String'];
};

export type ClientRequestResetPasswordRequest = {
  challenge: Scalars['String'];
  username: Scalars['String'];
};

export type ClientRequestResetPasswordResult = {
  __typename?: 'ClientRequestResetPasswordResult';
  oprfChallengeResponse: Scalars['String'];
  oprfPublicKey: Scalars['String'];
  serverPublicKey: Scalars['String'];
};

export type CreateDocumentInput = {
  id: Scalars['String'];
  workspaceId: Scalars['String'];
};

export type CreateDocumentResult = {
  __typename?: 'CreateDocumentResult';
  id: Scalars['String'];
};

export type CreateFolderInput = {
  id: Scalars['String'];
  parentFolderId?: InputMaybe<Scalars['String']>;
  workspaceId: Scalars['String'];
};

export type CreateFolderResult = {
  __typename?: 'CreateFolderResult';
  folder?: Maybe<Folder>;
};

export type CreateWorkspaceInput = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type CreateWorkspaceResult = {
  __typename?: 'CreateWorkspaceResult';
  workspace?: Maybe<Workspace>;
};

export type DeleteDocumentsInput = {
  ids: Array<Scalars['String']>;
};

export type DeleteDocumentsResult = {
  __typename?: 'DeleteDocumentsResult';
  status: Scalars['String'];
};

export type DeleteWorkspacesInput = {
  ids: Array<Scalars['String']>;
};

export type DeleteWorkspacesResult = {
  __typename?: 'DeleteWorkspacesResult';
  status: Scalars['String'];
};

export type DocumentPreview = {
  __typename?: 'DocumentPreview';
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
};

export type DocumentPreviewConnection = {
  __typename?: 'DocumentPreviewConnection';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types */
  edges?: Maybe<Array<Maybe<DocumentPreviewEdge>>>;
  /** Flattened list of DocumentPreview type */
  nodes?: Maybe<Array<Maybe<DocumentPreview>>>;
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo */
  pageInfo: PageInfo;
};

export type DocumentPreviewEdge = {
  __typename?: 'DocumentPreviewEdge';
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Cursor */
  cursor: Scalars['String'];
  /** https://facebook.github.io/relay/graphql/connections.htm#sec-Node */
  node?: Maybe<DocumentPreview>;
};

export type FinalizeResetPasswordInput = {
  clientPublicKey: Scalars['String'];
  nonce: Scalars['String'];
  secret: Scalars['String'];
  token: Scalars['String'];
  username: Scalars['String'];
};

export type FinalizeResetPasswordResult = {
  __typename?: 'FinalizeResetPasswordResult';
  status: Scalars['String'];
};

export type Folder = {
  __typename?: 'Folder';
  id: Scalars['String'];
  name: Scalars['String'];
  parentFolderId?: Maybe<Scalars['String']>;
  parentFolders?: Maybe<Array<Folder>>;
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

export type Mutation = {
  __typename?: 'Mutation';
  createDocument?: Maybe<CreateDocumentResult>;
  createFolder?: Maybe<CreateFolderResult>;
  createWorkspace?: Maybe<CreateWorkspaceResult>;
  deleteDocuments?: Maybe<DeleteDocumentsResult>;
  deleteWorkspaces?: Maybe<DeleteWorkspacesResult>;
  finalizeLogin?: Maybe<ClientOprfLoginFinalizeeResult>;
  finalizePasswordReset?: Maybe<FinalizeResetPasswordResult>;
  finalizeRegistration?: Maybe<ClientOprfRegistrationFinalizeResult>;
  initializeLogin?: Maybe<ClientOprfLoginChallengeResult>;
  initializePasswordReset?: Maybe<ClientRequestResetPasswordResult>;
  initializeRegistration?: Maybe<ClientOprfRegistrationChallengeResult>;
  updateDocumentName?: Maybe<UpdateDocumentNameResult>;
  updateFolderName?: Maybe<UpdateFolderNameResult>;
  updateWorkspace?: Maybe<UpdateWorkspaceResult>;
};


export type MutationCreateDocumentArgs = {
  input?: InputMaybe<CreateDocumentInput>;
};


export type MutationCreateFolderArgs = {
  input?: InputMaybe<CreateFolderInput>;
};


export type MutationCreateWorkspaceArgs = {
  input?: InputMaybe<CreateWorkspaceInput>;
};


export type MutationDeleteDocumentsArgs = {
  input?: InputMaybe<DeleteDocumentsInput>;
};


export type MutationDeleteWorkspacesArgs = {
  input?: InputMaybe<DeleteWorkspacesInput>;
};


export type MutationFinalizeLoginArgs = {
  input?: InputMaybe<ClientOprfLoginFinalizeInput>;
};


export type MutationFinalizePasswordResetArgs = {
  input?: InputMaybe<FinalizeResetPasswordInput>;
};


export type MutationFinalizeRegistrationArgs = {
  input?: InputMaybe<ClientOprfRegistrationFinalizeInput>;
};


export type MutationInitializeLoginArgs = {
  input?: InputMaybe<ClientOprfLoginChallengeInput>;
};


export type MutationInitializePasswordResetArgs = {
  input?: InputMaybe<ClientRequestResetPasswordRequest>;
};


export type MutationInitializeRegistrationArgs = {
  input?: InputMaybe<ClientOprfRegistrationChallengeRequest>;
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
  documentPreviews?: Maybe<DocumentPreviewConnection>;
  folder?: Maybe<Folder>;
  folders?: Maybe<FolderConnection>;
  rootFolders?: Maybe<FolderConnection>;
  workspace?: Maybe<Workspace>;
  workspaces?: Maybe<WorkspaceConnection>;
};


export type QueryDocumentPreviewsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  workspaceId: Scalars['ID'];
};


export type QueryFolderArgs = {
  id?: InputMaybe<Scalars['ID']>;
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


export type QueryWorkspaceArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryWorkspacesArgs = {
  after?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
};

export type UpdateDocumentNameInput = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type UpdateDocumentNameResult = {
  __typename?: 'UpdateDocumentNameResult';
  document?: Maybe<DocumentPreview>;
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

export type Workspace = {
  __typename?: 'Workspace';
  id: Scalars['String'];
  members?: Maybe<Array<WorkspacePermissionsOutput>>;
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

export type WorkspaceMemberInput = {
  isAdmin: Scalars['Boolean'];
  username: Scalars['String'];
};

export type WorkspacePermissionsOutput = {
  __typename?: 'WorkspacePermissionsOutput';
  isAdmin: Scalars['Boolean'];
  username: Scalars['String'];
};

export type CreateDocumentMutationVariables = Exact<{
  input: CreateDocumentInput;
}>;


export type CreateDocumentMutation = { __typename?: 'Mutation', createDocument?: { __typename?: 'CreateDocumentResult', id: string } | null };

export type CreateFolderMutationVariables = Exact<{
  input: CreateFolderInput;
}>;


export type CreateFolderMutation = { __typename?: 'Mutation', createFolder?: { __typename?: 'CreateFolderResult', folder?: { __typename?: 'Folder', id: string, name: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null } | null };

export type CreateWorkspaceMutationVariables = Exact<{
  input: CreateWorkspaceInput;
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace?: { __typename?: 'CreateWorkspaceResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspacePermissionsOutput', username: string, isAdmin: boolean }> | null } | null } | null };

export type DeleteDocumentsMutationVariables = Exact<{
  input: DeleteDocumentsInput;
}>;


export type DeleteDocumentsMutation = { __typename?: 'Mutation', deleteDocuments?: { __typename?: 'DeleteDocumentsResult', status: string } | null };

export type DeleteWorkspacesMutationVariables = Exact<{
  input: DeleteWorkspacesInput;
}>;


export type DeleteWorkspacesMutation = { __typename?: 'Mutation', deleteWorkspaces?: { __typename?: 'DeleteWorkspacesResult', status: string } | null };

export type FinalizeLoginMutationVariables = Exact<{
  input: ClientOprfLoginFinalizeInput;
}>;


export type FinalizeLoginMutation = { __typename?: 'Mutation', finalizeLogin?: { __typename?: 'ClientOprfLoginFinalizeeResult', oauthData: string, nonce: string } | null };

export type FinalizeRegistrationMutationVariables = Exact<{
  input: ClientOprfRegistrationFinalizeInput;
}>;


export type FinalizeRegistrationMutation = { __typename?: 'Mutation', finalizeRegistration?: { __typename?: 'ClientOprfRegistrationFinalizeResult', status: string } | null };

export type InitializeLoginMutationVariables = Exact<{
  input: ClientOprfLoginChallengeInput;
}>;


export type InitializeLoginMutation = { __typename?: 'Mutation', initializeLogin?: { __typename?: 'ClientOprfLoginChallengeResult', secret: string, nonce: string, oprfPublicKey: string, oprfChallengeResponse: string } | null };

export type InitializeRegistrationMutationVariables = Exact<{
  input: ClientOprfRegistrationChallengeRequest;
}>;


export type InitializeRegistrationMutation = { __typename?: 'Mutation', initializeRegistration?: { __typename?: 'ClientOprfRegistrationChallengeResult', serverPublicKey: string, oprfPublicKey: string, oprfChallengeResponse: string } | null };

export type UpdateDocumentNameMutationVariables = Exact<{
  input: UpdateDocumentNameInput;
}>;


export type UpdateDocumentNameMutation = { __typename?: 'Mutation', updateDocumentName?: { __typename?: 'UpdateDocumentNameResult', document?: { __typename?: 'DocumentPreview', id: string, name?: string | null } | null } | null };

export type UpdateWorkspaceMutationVariables = Exact<{
  input: UpdateWorkspaceInput;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace?: { __typename?: 'UpdateWorkspaceResult', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspacePermissionsOutput', username: string, isAdmin: boolean }> | null } | null } | null };

export type DocumentPreviewsQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
  first?: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type DocumentPreviewsQuery = { __typename?: 'Query', documentPreviews?: { __typename?: 'DocumentPreviewConnection', nodes?: Array<{ __typename?: 'DocumentPreview', id: string, name?: string | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null };

export type RootFoldersQueryVariables = Exact<{
  workspaceId: Scalars['ID'];
  first: Scalars['Int'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type RootFoldersQuery = { __typename?: 'Query', rootFolders?: { __typename?: 'FolderConnection', nodes?: Array<{ __typename?: 'Folder', id: string, name: string, parentFolderId?: string | null, rootFolderId?: string | null, workspaceId?: string | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } | null };

export type WorkspaceQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']>;
}>;


export type WorkspaceQuery = { __typename?: 'Query', workspace?: { __typename?: 'Workspace', id: string, name?: string | null, members?: Array<{ __typename?: 'WorkspacePermissionsOutput', username: string, isAdmin: boolean }> | null } | null };

export type WorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkspacesQuery = { __typename?: 'Query', workspaces?: { __typename?: 'WorkspaceConnection', nodes?: Array<{ __typename?: 'Workspace', id: string, name?: string | null } | null> | null } | null };


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
export const CreateWorkspaceDocument = gql`
    mutation createWorkspace($input: CreateWorkspaceInput!) {
  createWorkspace(input: $input) {
    workspace {
      id
      name
      members {
        username
        isAdmin
      }
    }
  }
}
    `;

export function useCreateWorkspaceMutation() {
  return Urql.useMutation<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>(CreateWorkspaceDocument);
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
export const FinalizeLoginDocument = gql`
    mutation finalizeLogin($input: ClientOprfLoginFinalizeInput!) {
  finalizeLogin(input: $input) {
    oauthData
    nonce
  }
}
    `;

export function useFinalizeLoginMutation() {
  return Urql.useMutation<FinalizeLoginMutation, FinalizeLoginMutationVariables>(FinalizeLoginDocument);
};
export const FinalizeRegistrationDocument = gql`
    mutation finalizeRegistration($input: ClientOprfRegistrationFinalizeInput!) {
  finalizeRegistration(input: $input) {
    status
  }
}
    `;

export function useFinalizeRegistrationMutation() {
  return Urql.useMutation<FinalizeRegistrationMutation, FinalizeRegistrationMutationVariables>(FinalizeRegistrationDocument);
};
export const InitializeLoginDocument = gql`
    mutation initializeLogin($input: ClientOprfLoginChallengeInput!) {
  initializeLogin(input: $input) {
    secret
    nonce
    oprfPublicKey
    oprfChallengeResponse
  }
}
    `;

export function useInitializeLoginMutation() {
  return Urql.useMutation<InitializeLoginMutation, InitializeLoginMutationVariables>(InitializeLoginDocument);
};
export const InitializeRegistrationDocument = gql`
    mutation initializeRegistration($input: ClientOprfRegistrationChallengeRequest!) {
  initializeRegistration(input: $input) {
    serverPublicKey
    oprfPublicKey
    oprfChallengeResponse
  }
}
    `;

export function useInitializeRegistrationMutation() {
  return Urql.useMutation<InitializeRegistrationMutation, InitializeRegistrationMutationVariables>(InitializeRegistrationDocument);
};
export const UpdateDocumentNameDocument = gql`
    mutation updateDocumentName($input: UpdateDocumentNameInput!) {
  updateDocumentName(input: $input) {
    document {
      id
      name
    }
  }
}
    `;

export function useUpdateDocumentNameMutation() {
  return Urql.useMutation<UpdateDocumentNameMutation, UpdateDocumentNameMutationVariables>(UpdateDocumentNameDocument);
};
export const UpdateWorkspaceDocument = gql`
    mutation updateWorkspace($input: UpdateWorkspaceInput!) {
  updateWorkspace(input: $input) {
    workspace {
      id
      name
      members {
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
export const DocumentPreviewsDocument = gql`
    query documentPreviews($workspaceId: ID!, $first: Int! = 100, $after: String) {
  documentPreviews(workspaceId: $workspaceId, first: $first, after: $after) {
    nodes {
      id
      name
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

export function useDocumentPreviewsQuery(options: Omit<Urql.UseQueryArgs<DocumentPreviewsQueryVariables>, 'query'>) {
  return Urql.useQuery<DocumentPreviewsQuery>({ query: DocumentPreviewsDocument, ...options });
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
export const WorkspaceDocument = gql`
    query workspace($id: ID) {
  workspace(id: $id) {
    id
    name
    members {
      username
      isAdmin
    }
  }
}
    `;

export function useWorkspaceQuery(options?: Omit<Urql.UseQueryArgs<WorkspaceQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkspaceQuery>({ query: WorkspaceDocument, ...options });
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