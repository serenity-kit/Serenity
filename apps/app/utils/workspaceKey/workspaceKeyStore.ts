import * as SecureStore from "expo-secure-store";
import { WorkspaceKey } from "../../generated/graphql";

// TODO: store the latest known workspaceKey for a workspace

export const workspaceKeyStorageKeyPrefix = "workspaceKey.";
export const workspaceKeyWorkspaceLookupPrefix = "workspace.workspaceKey.";
export const currentWorkspaceKeyWorkspaceLookupPrefix =
  "workspace.currentWorkspaceKey.";

// currentWorkspaceKey: string

const getCurrentWorkspaceStorageWorkspaceLookupKey = (
  workspaceId: string
): string => {
  return `${currentWorkspaceKeyWorkspaceLookupPrefix}${workspaceId}`;
};

const setCurrentWorkspaceKeyIdForWorkspace = async (
  workspaceId: string,
  workspaceKey: WorkspaceKey
): Promise<void> => {
  const workspaceKeyId = workspaceKey.id;
  const lookupKey = getCurrentWorkspaceStorageWorkspaceLookupKey(workspaceId);
  await SecureStore.setItemAsync(lookupKey, workspaceKeyId);
};

const getCurrentWorkspaceKeyIdForWorkspace = async (
  workspaceId: string
): Promise<string | null> => {
  const lookupKey = getCurrentWorkspaceStorageWorkspaceLookupKey(workspaceId);
  const workspaceKeyId = await SecureStore.getItemAsync(lookupKey);
  return workspaceKeyId;
};

export const getCurrentWorkspaceKeyForWorkspace = async (
  workspaceId: string
): Promise<WorkspaceKey | null> => {
  const workspaceKeyId = await getCurrentWorkspaceKeyIdForWorkspace(
    workspaceId
  );
  if (!workspaceKeyId) {
    return null;
  }
  return getWorkspaceKey(workspaceId, workspaceKeyId);
};

const removeCurrentWorkspaceKeyForWorskpace = async (
  workspaceId: string
): Promise<void> => {
  const lookupKey = getCurrentWorkspaceStorageWorkspaceLookupKey(workspaceId);
  await SecureStore.deleteItemAsync(lookupKey);
};

// workspackeKeys for workspace: {[workspaceKey: string]: string}

const getWorkspaceStorageWorkspaceLookupKey = (workspaceId: string): string => {
  return `${workspaceKeyWorkspaceLookupPrefix}${workspaceId}`;
};

// workspaceKeys: {[workspaceKeyId: string]: WorkspaceKey}

const getWorkspaceStorageKey = (workspaceKey: string): string => {
  return `${workspaceKeyStorageKeyPrefix}${workspaceKey}`;
};

export const getWorkspaceKeysForWorkspace = async (workspaceId: string) => {
  const lookupKey = getWorkspaceStorageWorkspaceLookupKey(workspaceId);
  const jsonWorkspaceKeysForWorkspace = await SecureStore.getItemAsync(
    lookupKey
  );
  if (!jsonWorkspaceKeysForWorkspace) {
    return [];
  }
  try {
    const workspaceKeysForWorkspace = JSON.parse(jsonWorkspaceKeysForWorkspace);
    return workspaceKeysForWorkspace;
  } catch (error) {
    await removeWorkspaceKeyLookupForWorkspace(workspaceId);
    return [];
  }
};

export const setWorkspaceKeyIdsForWorkspace = async (
  workspaceId: string,
  workspaceKeyIds: string[]
) => {
  const lookupKey = getWorkspaceStorageWorkspaceLookupKey(workspaceId);
  workspaceKeyIds.sort();
  await SecureStore.setItemAsync(lookupKey, JSON.stringify(workspaceKeyIds));
};

export const removeWorkspaceKeyFromLookup = async (
  workspaceId: string,
  workspaceKeyId: string
): Promise<void> => {
  let workspaceKeyIds = await getWorkspaceKeysForWorkspace(workspaceId);
  const workspaceKeyIdPos = workspaceKeyIds.indexof(workspaceKeyId);
  if (workspaceKeyIdPos >= 0) {
    workspaceKeyIds = workspaceKeyIds.slice(workspaceKeyIdPos, 1);
  }
  await setWorkspaceKeyIdsForWorkspace(workspaceId, workspaceKeyIds);
};

export const removeWorkspaceKeyLookupForWorkspace = async (
  workspaceId: string
): Promise<void> => {
  const lookupKey = getWorkspaceStorageWorkspaceLookupKey(workspaceId);
  await SecureStore.deleteItemAsync(lookupKey);
};

export const setWorkspaceKey = async (workspaceKey: WorkspaceKey) => {
  const workspaceId = workspaceKey.workspaceId;
  const workspaceKeyId = workspaceKey.id;
  const workspaceKeyIds = await getWorkspaceKeysForWorkspace(workspaceId);
  if (!workspaceKeyIds.includes(workspaceKeyId)) {
    workspaceKeyIds.push(workspaceKeyId);
    await setWorkspaceKeyIdsForWorkspace(workspaceId, workspaceKeyIds);
  }
  const workspaceKeyStorageKey = getWorkspaceStorageKey(workspaceKeyId);
  await SecureStore.setItemAsync(
    workspaceKeyStorageKey,
    JSON.stringify(workspaceKey)
  );
};

export const getWorkspaceKey = async (
  workspaceId: string,
  workspaceKeyId: string
): Promise<WorkspaceKey | null> => {
  const workspaceKeyStorageKey = getWorkspaceStorageKey(workspaceKeyId);
  const jsonWorkspaceKey = await SecureStore.getItemAsync(
    workspaceKeyStorageKey
  );
  if (!jsonWorkspaceKey) {
    return null;
  }
  try {
    const workspaceKey = JSON.parse(jsonWorkspaceKey);
    return workspaceKey;
  } catch (error) {
    await removeWorkspaceKey(workspaceId, workspaceKeyId);
    return null;
  }
};

export const removeWorkspaceKey = async (
  workspaceId: string,
  workspaceKeyId: string
): Promise<void> => {
  const currentWorskpaceKeyId = await getCurrentWorkspaceKeyIdForWorkspace(
    workspaceId
  );
  if (currentWorskpaceKeyId === workspaceKeyId) {
    await removeCurrentWorkspaceKeyForWorskpace(workspaceId);
  }
  // check if this is a "currentWorkspaceKey"
  // removeCurrentWorkspaceKeyForWorskpace
  await removeWorkspaceKeyFromLookup(workspaceId, workspaceKeyId);
  const workspaceKeyStorageKey = getWorkspaceStorageKey(workspaceKeyId);
  await SecureStore.deleteItemAsync(workspaceKeyStorageKey);
};

export const setWorskpaceKeysForWorkspace = async (
  workspaceId: string,
  workspaceKeys: WorkspaceKey[]
) => {
  const workspaceKeyIds: string[] = [];
  let latestGeneration = -1;
  let latestWorkspaceKey: WorkspaceKey | undefined = undefined;
  for (let workspaceKey of workspaceKeys) {
    workspaceKeyIds.push(workspaceKey.id);
    await setWorkspaceKey(workspaceKey);
    if (workspaceKey.generation > latestGeneration) {
      latestGeneration = workspaceKey.generation;
      latestWorkspaceKey = workspaceKey;
    }
  }
  if (latestGeneration >= 0 && latestWorkspaceKey) {
    setCurrentWorkspaceKeyIdForWorkspace(workspaceId, latestWorkspaceKey);
  }
  await setWorkspaceKeyIdsForWorkspace(workspaceId, workspaceKeyIds);
};
