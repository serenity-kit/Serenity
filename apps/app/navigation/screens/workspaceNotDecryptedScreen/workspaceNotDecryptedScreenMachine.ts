import { assign, createMachine } from "xstate";
import { MeWithWorkspaceLoadingInfoQuery } from "../../../generated/graphql";
import { fetchMeWithWorkspaceLoadingInfo } from "../../../graphql/fetchUtils/fetchMeWithWorkspaceLoadingInfo";

export type MeWithWorkspaceLoadingInfoQueryResult = {
  data?: MeWithWorkspaceLoadingInfoQuery;
  error?: {
    networkError?: any;
  };
};

type Context = {
  workspaceId?: string;
  documentId?: string;
  returnOtherWorkspaceIfNotFound?: boolean;
  returnOtherDocumentIfNotFound?: boolean;
  navigation: any;
  meWithWorkspaceLoadingInfoQueryResult?: MeWithWorkspaceLoadingInfoQueryResult;
};

export const workspaceNotDecryptedScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBJAdgSwBc91kARdA9AOjUzxygGIJUcwr6A3VAa3YDMwBAMYALALJgA6oVFTUAJx6wADumFgAMhgj0oufqkSgVqWITytjIAB6IALAAYAzFQBsAJi8BWbwA5vAEYPbwB2AE5nABoQAE9EDzdQqnDAwPsPPw9HbNDnN3sAX0KY2mx8IhJyShodPUYwBQVFKhVkCkMFAFsqQREJaVl5JVV1LTqGAyMkEFNzIisZuwRA8I8qQLdnQNC3APCAvJj4hG9Uqg9A-3tnbPt7P2di0p1cCyqKajLIRms5i0WoGWa3sFz8j18Ll2YVCx0QzmcfhSgT8eVRl28zns4TczxAZTelTIn166DwyAArgowIwbLBKAR2Oh+IyFAAKbKORwASkYBIqxGJNX4ZMp1L+ZgBOGsywAtM5HO40kEEZzUfY9nCEDdAlQNaFspi-FzLm5vHj+e8hdROCQ8BAAMpwcysX4zf4LaVLRDBVEpPIeewo8KhUJZQJahFI1KoxEGq5YnEW14Cj41HCoAgAQQpBFEijwAC8fnSGUyWY02d4uTy+SmrdVqBns7n8woi5AJfNLF6gYg-CGqArMn4dRl7N4tdl1s4Q6kMo4nN5suFk5hCYLG1RROhYMNlGoNFnhBpYLA3SZJZ6ZT6w8lwbcguDAs5-JO4vDEcjY+iE9jcXiGYQHA1iWkSW5lHoXZSjeCCygaSrhJiyHhBqzhHB+CCXOsITYlkr7eFsOyhGu5QNiS3wQNB17egg4ZUMaeyZIiHi7IukaoXqjirC+2KXI8SSkRuabUCK5JUmA1E9rBVzeO4uzBIRr6OGajxahqbhUI4fieI4BzGhObgAS866ptaHA4LayD2k6Z7Se6V72X2CCpLqXhBrO4R6cREaYYRoKopsy4qcamJCWZW5WTZzpObMjmArYPrpMkGShOOaRYgiHGgk4PGJvx+QkSU+L1uBJLNjmeYFsWVEOd2CXLKskQpMaqEIrcA6XFOCGOKEelhoVGpnOaxVgZuJLUro1LCAQAAqqCkKgwgUl0YA4AQUkNQkL6af4+TLml2yZZGoRyTiCLeBOGo4n4mzheRNQ7nuigHmMx6nvAdUwbRVy3RcBo4iGmwPBq2VcasZyJAEy5JqNpXjemqDvc6m29olKxeDhwWhiEXkGh4Wq+OEFwhNsBxuJEEQjSZZFlZQqOwbKOKIchr6oVsGEnC+ipBr16TbJsRl+MUxRAA */
  createMachine(
    {
      context: { navigation: null } as Context,
      tsTypes:
        {} as import("./workspaceNotDecryptedScreenMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "loading",
      states: {
        loading: {
          invoke: {
            src: "fetchMeWithWorkspaceLoadingInfo",
            id: "fetchMeWithWorkspaceLoadingInfo",
            onDone: [
              {
                actions: assign({
                  meWithWorkspaceLoadingInfoQueryResult: (_, event) =>
                    event.data,
                }),
                cond: "hasNoNetworkError",
                target: "loaded",
              },
              {
                target: "failure",
              },
            ],
            onError: [
              {
                target: "failure",
              },
            ],
          },
        },
        loaded: {
          always: [
            {
              cond: "isValidSession",
              target: "validSession",
            },
            {
              target: "invalidSession",
            },
          ],
        },
        failure: {
          after: {
            "2000": {
              target: "loading",
            },
          },
        },
        invalidSession: {
          entry: "redirectToLogin",
          type: "final",
        },
        validSession: {
          always: [
            {
              cond: "hasAccessToWorkspace",
              target: "hasWorkspaceAccess",
            },
            {
              target: "noAccess",
            },
          ],
        },
        notAuthorized: {
          after: {
            "5000": {
              target: "loading",
            },
          },
        },
        redirectToDocument: {
          entry: "redirectToDocument",
          type: "final",
        },
        hasWorkspaceAccess: {
          always: [
            {
              cond: "isAuthorized",
              target: "redirectToDocument",
            },
            {
              target: "notAuthorized",
            },
          ],
        },
        noAccess: {
          entry: "redirectToNotFoundOrNoWorkspaces",
          type: "final",
        },
      },
      id: "loadInitialData",
    },
    {
      guards: {
        // @ts-ignore need to properly type this event
        hasNoNetworkError: (context, event: { data: QueryResult }) => {
          return !event.data?.error?.networkError;
        },
        isValidSession: (context) => {
          return Boolean(
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me?.id
          );
        },
        hasAccessToWorkspace: (context) => {
          return Boolean(
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.workspaceLoadingInfo?.id
          );
        },
        isAuthorized: (context) => {
          return Boolean(
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.workspaceLoadingInfo?.isAuthorized
          );
        },
      },
      actions: {
        redirectToLogin: (context) => {
          context.navigation.replace("Login", {});
        },
        redirectToNotFoundOrNoWorkspaces: (context) => {
          if (context.returnOtherWorkspaceIfNotFound === true) {
            context.navigation.replace("Onboarding");
          } else {
            context.navigation.replace("WorkspaceNotFoundScreen", {
              workspaceId:
                context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
                  ?.workspaceLoadingInfo?.id,
            });
          }
        },
        redirectToDocument: (context) => {
          if (
            context.meWithWorkspaceLoadingInfoQueryResult?.data?.me
              ?.workspaceLoadingInfo
          ) {
            context.navigation.replace("Workspace", {
              workspaceId:
                context.meWithWorkspaceLoadingInfoQueryResult.data.me
                  .workspaceLoadingInfo.id,
              screen: "Page",
              params: {
                pageId:
                  context.meWithWorkspaceLoadingInfoQueryResult.data.me
                    .workspaceLoadingInfo.documentId,
              },
            });
          } else {
            throw new Error("workspaceLoadingInfo was not defined");
          }
        },
      },
      services: {
        fetchMeWithWorkspaceLoadingInfo: (context) => {
          return fetchMeWithWorkspaceLoadingInfo({
            workspaceId: context.workspaceId,
            returnOtherWorkspaceIfNotFound: false,
            returnOtherDocumentIfNotFound: true,
          });
        },
      },
    }
  );
