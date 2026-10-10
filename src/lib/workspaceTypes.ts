export interface Collection {
  id: string;
  name: string;
  createdAt: string;
}

export interface WorkspaceLink {
  id: string;
  title: string;
  url: string;
  collectionId: string | null;
  savedForLater: boolean;
  createdAt: string;
}

export interface Shortcut {
  id: string;
  slug: string;
  url: string;
  createdAt: string;
}

export interface LinkInput {
  title: string;
  url: string;
  collectionId: string | null;
  savedForLater: boolean;
}

export interface ShortcutInput {
  slug: string;
  url: string;
}

export interface WorkspaceContextValue {
  collections: Collection[];
  links: WorkspaceLink[];
  shortcuts: Shortcut[];
  error: string;
  reloadWorkspace: () => void;
  addCollection: (name: string) => void;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  addLink: (input: LinkInput) => void;
  updateLink: (id: string, input: LinkInput) => void;
  deleteLink: (id: string) => void;
  toggleSavedForLater: (id: string) => void;
  addShortcut: (input: ShortcutInput) => void;
  updateShortcut: (id: string, input: ShortcutInput) => void;
  deleteShortcut: (id: string) => void;
}
