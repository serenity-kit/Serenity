export type WorkspaceKeyBox = {
  id: string;
  workspaceKeyId: string;
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  nonce: string;
  ciphertext: string;
};

export type WorkspaceKey = {
  id: string;
  workspaceId: string;
  generation: number;
  workspaceKeyBox: WorkspaceKeyBox;
};

export type Workspace = {
  id: string;
  name: string;
  idSignature?: string;
  workspaceKeys?: WorkspaceKey[];
  currentWorkspaceKey?: WorkspaceKey;
};
