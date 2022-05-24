type WorkspaceMember = {
  userId: string;
  isAdmin: boolean;
};

export type Workspace = {
  id: string;
  name: string;
  idSignature: string;
  members: WorkspaceMember[];
};
