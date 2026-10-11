import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { WorkspaceContext } from "./workspaceContext";
import type {
  Collection,
  LinkInput,
  Shortcut,
  ShortcutInput,
  WorkspaceLink,
} from "./workspaceTypes";

const storageKey = "libretab:workspace:v1";

interface WorkspaceData {
  collections: Collection[];
  links: WorkspaceLink[];
  shortcuts: Shortcut[];
}

const emptyWorkspace: WorkspaceData = {
  collections: [],
  links: [],
  shortcuts: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

function isCollection(value: unknown): value is Collection {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.createdAt === "string"
  );
}

function isWorkspaceLink(value: unknown): value is WorkspaceLink {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.url === "string" &&
    isWebUrl(value.url) &&
    (typeof value.collectionId === "string" || value.collectionId === null) &&
    typeof value.savedForLater === "boolean" &&
    typeof value.createdAt === "string"
  );
}

function isShortcut(value: unknown): value is Shortcut {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) &&
    typeof value.url === "string" &&
    isWebUrl(value.url) &&
    typeof value.createdAt === "string"
  );
}

function toSlug(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "link";
}

function migrateShortcut(value: unknown): Shortcut | null {
  if (isShortcut(value)) return value;
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.url !== "string" ||
    !isWebUrl(value.url) ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    slug: toSlug(value.name),
    url: value.url,
    createdAt: value.createdAt,
  };
}

function readWorkspace(): { data: WorkspaceData; error: string } {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return { data: emptyWorkspace, error: "" };

    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      !Array.isArray(value.collections) ||
      !value.collections.every(isCollection) ||
      !Array.isArray(value.links) ||
      !value.links.every(isWorkspaceLink) ||
      !Array.isArray(value.shortcuts)
    ) {
      throw new Error("Saved InsiderTabs data has an unsupported format.");
    }

    const collections = value.collections;
    const links = value.links;
    const migratedShortcuts = value.shortcuts.map(migrateShortcut);
    if (migratedShortcuts.some((shortcut) => shortcut === null)) {
      throw new Error("Saved InsiderTabs data contains an unsupported To/Link.");
    }
    const shortcuts = migratedShortcuts.filter(
      (shortcut): shortcut is Shortcut => shortcut !== null,
    );
    const usedSlugs = new Set<string>();
    const uniqueShortcuts = shortcuts.map((shortcut) => {
      const baseSlug = shortcut.slug;
      let slug = baseSlug;
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }
      usedSlugs.add(slug);
      return slug === baseSlug ? shortcut : { ...shortcut, slug };
    });
    if (
      links.some((link) =>
        link.collectionId !== null &&
        !collections.some((collection) => collection.id === link.collectionId),
      )
    ) {
      throw new Error("Saved InsiderTabs data refers to a collection that does not exist.");
    }

    return {
      data: { collections, links, shortcuts: uniqueShortcuts },
      error: "",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown storage error.";
    return { data: emptyWorkspace, error: `Could not load saved data: ${message}` };
  }
}

function createId(): string {
  return crypto.randomUUID();
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(readWorkspace);
  const [workspace, setWorkspace] = useState(initialState.data);
  const [loadError, setLoadError] = useState(initialState.error);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (loadError) return;

    let active = true;
    try {
      localStorage.setItem(storageKey, JSON.stringify(workspace));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown storage error.";
      queueMicrotask(() => {
        if (active) setSaveError(`Could not save changes: ${message}`);
      });
    }

    return () => {
      active = false;
    };
  }, [loadError, workspace]);

  const reloadWorkspace = useCallback(() => {
    const state = readWorkspace();
    setWorkspace(state.data);
    setLoadError(state.error);
    setSaveError("");
  }, []);

  const updateWorkspace = useCallback((update: (current: WorkspaceData) => WorkspaceData) => {
    if (loadError) return;
    setSaveError("");
    setWorkspace(update);
  }, [loadError]);

  const addCollection = useCallback((name: string) => {
    updateWorkspace((current) => ({
      ...current,
      collections: [...current.collections, { id: createId(), name, createdAt: new Date().toISOString() }],
    }));
  }, [updateWorkspace]);

  const renameCollection = useCallback((id: string, name: string) => {
    updateWorkspace((current) => ({
      ...current,
      collections: current.collections.map((collection) =>
        collection.id === id ? { ...collection, name } : collection,
      ),
    }));
  }, [updateWorkspace]);

  const deleteCollection = useCallback((id: string) => {
    updateWorkspace((current) => ({
      ...current,
      collections: current.collections.filter((collection) => collection.id !== id),
      links: current.links.map((link) =>
        link.collectionId === id ? { ...link, collectionId: null } : link,
      ),
    }));
  }, [updateWorkspace]);

  const addLink = useCallback((input: LinkInput) => {
    updateWorkspace((current) => ({
      ...current,
      links: [...current.links, { ...input, id: createId(), createdAt: new Date().toISOString() }],
    }));
  }, [updateWorkspace]);

  const updateLink = useCallback((id: string, input: LinkInput) => {
    updateWorkspace((current) => ({
      ...current,
      links: current.links.map((link) => link.id === id ? { ...link, ...input } : link),
    }));
  }, [updateWorkspace]);

  const deleteLink = useCallback((id: string) => {
    updateWorkspace((current) => ({
      ...current,
      links: current.links.filter((link) => link.id !== id),
    }));
  }, [updateWorkspace]);

  const toggleSavedForLater = useCallback((id: string) => {
    updateWorkspace((current) => ({
      ...current,
      links: current.links.map((link) =>
        link.id === id ? { ...link, savedForLater: !link.savedForLater } : link,
      ),
    }));
  }, [updateWorkspace]);

  const addShortcut = useCallback((input: ShortcutInput) => {
    updateWorkspace((current) => ({
      ...current,
      shortcuts: [...current.shortcuts, { ...input, id: createId(), createdAt: new Date().toISOString() }],
    }));
  }, [updateWorkspace]);

  const updateShortcut = useCallback((id: string, input: ShortcutInput) => {
    updateWorkspace((current) => ({
      ...current,
      shortcuts: current.shortcuts.map((shortcut) =>
        shortcut.id === id ? { ...shortcut, ...input } : shortcut,
      ),
    }));
  }, [updateWorkspace]);

  const deleteShortcut = useCallback((id: string) => {
    updateWorkspace((current) => ({
      ...current,
      shortcuts: current.shortcuts.filter((shortcut) => shortcut.id !== id),
    }));
  }, [updateWorkspace]);

  return (
    <WorkspaceContext.Provider
      value={{
        ...workspace,
        error: loadError || saveError,
        reloadWorkspace,
        addCollection,
        renameCollection,
        deleteCollection,
        addLink,
        updateLink,
        deleteLink,
        toggleSavedForLater,
        addShortcut,
        updateShortcut,
        deleteShortcut,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
