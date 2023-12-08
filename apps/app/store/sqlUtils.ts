import * as appStateStore from "./appStateStore";
import * as currentUserIdStore from "./currentUserInfoStore";
import * as documentChainStore from "./documentChainStore";
import * as documentStore from "./documentStore";
import * as sql from "./sql/sql";
import * as userChainStore from "./userChainStore";
import * as userStore from "./userStore";
import * as workspaceChainStore from "./workspaceChainStore";
import * as workspaceMemberDevicesProofStore from "./workspaceMemberDevicesProofStore";
import * as workspaceStore from "./workspaceStore";

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

export const wipeStoreCaches = () => {
  appStateStore.wipeCaches();
  workspaceStore.wipeCaches();
  workspaceChainStore.wipeCaches();
  workspaceMemberDevicesProofStore.wipeCaches();
  userStore.wipeCaches();
  userChainStore.wipeCaches();
  currentUserIdStore.wipeCaches();
  documentStore.wipeCaches();
  documentChainStore.wipeCaches();
};
