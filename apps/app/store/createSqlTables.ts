import * as appStateStore from "../store/appStateStore";
import * as documentChainStore from "../store/documentChainStore";
import * as documentStore from "../store/documentStore";
import * as userChainStore from "../store/userChainStore";
import * as userStore from "../store/userStore";
import * as workspaceChainStore from "../store/workspaceChainStore";
import * as workspaceMemberDevicesProofStore from "../store/workspaceMemberDevicesProofStore";
import * as workspaceStore from "../store/workspaceStore";
import * as currentUserIdStore from "./currentUserInfoStore";
import * as sql from "./sql/sql";

export const createSqlTables = async () => {
  await sql.ready();

  appStateStore.initialize();
  workspaceStore.initialize();
  workspaceChainStore.initialize();
  workspaceMemberDevicesProofStore.initialize();
  userStore.initialize();
  userChainStore.initialize();
  currentUserIdStore.initialize();
  documentStore.initialize();
  documentChainStore.initialize();
};
