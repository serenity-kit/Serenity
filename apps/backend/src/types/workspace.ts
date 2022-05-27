export type WorkspaceMember = {
  userId: string;
  username: string | undefined | null;
  isAdmin: boolean;
};

export type Workspace = {
  id: string;
  name: string;
  idSignature: string;
  members: WorkspaceMember[];
};
