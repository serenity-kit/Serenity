import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
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
  challenge: Scalars["String"];
  username: Scalars["String"];
};

export type ClientOprfLoginChallengeResult = {
  __typename?: "ClientOprfLoginChallengeResult";
  nonce: Scalars["String"];
  oprfChallengeResponse: Scalars["String"];
  oprfPublicKey: Scalars["String"];
  secret: Scalars["String"];
};

export type ClientOprfLoginFinalizeInput = {
  username: Scalars["String"];
};

export type ClientOprfLoginFinalizeeResult = {
  __typename?: "ClientOprfLoginFinalizeeResult";
  nonce: Scalars["String"];
  oauthData: Scalars["String"];
};

export type ClientOprfRegistrationChallengeRequest = {
  challenge: Scalars["String"];
  username: Scalars["String"];
};

export type ClientOprfRegistrationChallengeResult = {
  __typename?: "ClientOprfRegistrationChallengeResult";
  oprfChallengeResponse: Scalars["String"];
  oprfPublicKey: Scalars["String"];
  serverPublicKey: Scalars["String"];
};

export type ClientOprfRegistrationFinalizeInput = {
  clientPublicKey: Scalars["String"];
  nonce: Scalars["String"];
  secret: Scalars["String"];
  username: Scalars["String"];
};

export type ClientOprfRegistrationFinalizeResult = {
  __typename?: "ClientOprfRegistrationFinalizeResult";
  status: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  finalizeLogin?: Maybe<ClientOprfLoginFinalizeeResult>;
  finalizeRegistration?: Maybe<ClientOprfRegistrationFinalizeResult>;
  initializeLogin?: Maybe<ClientOprfLoginChallengeResult>;
  initializeRegistration?: Maybe<ClientOprfRegistrationChallengeResult>;
};

export type MutationFinalizeLoginArgs = {
  input?: InputMaybe<ClientOprfLoginFinalizeInput>;
};

export type MutationFinalizeRegistrationArgs = {
  input?: InputMaybe<ClientOprfRegistrationFinalizeInput>;
};

export type MutationInitializeLoginArgs = {
  input?: InputMaybe<ClientOprfLoginChallengeInput>;
};

export type MutationInitializeRegistrationArgs = {
  input?: InputMaybe<ClientOprfRegistrationChallengeRequest>;
};

export type Query = {
  __typename?: "Query";
  test?: Maybe<Scalars["String"]>;
};

export type FinalizeLoginMutationVariables = Exact<{
  input: ClientOprfLoginFinalizeInput;
}>;

export type FinalizeLoginMutation = {
  __typename?: "Mutation";
  finalizeLogin?: {
    __typename?: "ClientOprfLoginFinalizeeResult";
    oauthData: string;
    nonce: string;
  } | null;
};

export type FinalizeRegistrationMutationVariables = Exact<{
  input: ClientOprfRegistrationFinalizeInput;
}>;

export type FinalizeRegistrationMutation = {
  __typename?: "Mutation";
  finalizeRegistration?: {
    __typename?: "ClientOprfRegistrationFinalizeResult";
    status: string;
  } | null;
};

export type InitializeLoginMutationVariables = Exact<{
  input: ClientOprfLoginChallengeInput;
}>;

export type InitializeLoginMutation = {
  __typename?: "Mutation";
  initializeLogin?: {
    __typename?: "ClientOprfLoginChallengeResult";
    secret: string;
    nonce: string;
    oprfPublicKey: string;
    oprfChallengeResponse: string;
  } | null;
};

export type InitializeRegistrationMutationVariables = Exact<{
  input: ClientOprfRegistrationChallengeRequest;
}>;

export type InitializeRegistrationMutation = {
  __typename?: "Mutation";
  initializeRegistration?: {
    __typename?: "ClientOprfRegistrationChallengeResult";
    serverPublicKey: string;
    oprfPublicKey: string;
    oprfChallengeResponse: string;
  } | null;
};

export type TestQueryVariables = Exact<{ [key: string]: never }>;

export type TestQuery = { __typename?: "Query"; test?: string | null };

export const FinalizeLoginDocument = gql`
  mutation finalizeLogin($input: ClientOprfLoginFinalizeInput!) {
    finalizeLogin(input: $input) {
      oauthData
      nonce
    }
  }
`;

export function useFinalizeLoginMutation() {
  return Urql.useMutation<
    FinalizeLoginMutation,
    FinalizeLoginMutationVariables
  >(FinalizeLoginDocument);
}
export const FinalizeRegistrationDocument = gql`
  mutation finalizeRegistration($input: ClientOprfRegistrationFinalizeInput!) {
    finalizeRegistration(input: $input) {
      status
    }
  }
`;

export function useFinalizeRegistrationMutation() {
  return Urql.useMutation<
    FinalizeRegistrationMutation,
    FinalizeRegistrationMutationVariables
  >(FinalizeRegistrationDocument);
}
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
  return Urql.useMutation<
    InitializeLoginMutation,
    InitializeLoginMutationVariables
  >(InitializeLoginDocument);
}
export const InitializeRegistrationDocument = gql`
  mutation initializeRegistration(
    $input: ClientOprfRegistrationChallengeRequest!
  ) {
    initializeRegistration(input: $input) {
      serverPublicKey
      oprfPublicKey
      oprfChallengeResponse
    }
  }
`;

export function useInitializeRegistrationMutation() {
  return Urql.useMutation<
    InitializeRegistrationMutation,
    InitializeRegistrationMutationVariables
  >(InitializeRegistrationDocument);
}
export const TestDocument = gql`
  query test {
    test
  }
`;

export function useTestQuery(
  options?: Omit<Urql.UseQueryArgs<TestQueryVariables>, "query">
) {
  return Urql.useQuery<TestQuery>({ query: TestDocument, ...options });
}
