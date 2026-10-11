import { useEffect, useRef, useState } from "react";
import type { Collection, Shortcut, WorkspaceLink } from "../lib/workspaceTypes";
import "../styles/WorkspaceDialogs.css";

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  initialLink?: WorkspaceLink;
  initialShortcut?: Shortcut;
  shortcutSlugs?: string[];
  defaultCollectionId?: string | null;
  mode: "library" | "shortcut";
  onSaveLink?: (link: Omit<WorkspaceLink, "id" | "createdAt">) => void;
  onSaveShortcut?: (shortcut: Pick<Shortcut, "slug" | "url">) => void;
}

export default function LinkDialog({
  open,
  onOpenChange,
  collections,
  initialLink,
  initialShortcut,
  shortcutSlugs = [],
  defaultCollectionId = null,
  mode,
  onSaveLink,
  onSaveShortcut,
}: LinkDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [savedForLater, setSavedForLater] = useState(false);
  const [error, setError] = useState("");
  const editing = Boolean(initialLink || initialShortcut);
  const shortcutMode = mode === "shortcut";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setTitle(initialLink?.title ?? initialShortcut?.slug ?? "");
      setUrl(initialLink?.url ?? initialShortcut?.url ?? "");
      setCollectionId(initialLink ? initialLink.collectionId ?? "" : defaultCollectionId ?? "");
      setSavedForLater(initialLink?.savedForLater ?? false);
      setError("");
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [defaultCollectionId, initialLink, initialShortcut, open]);

  function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError(shortcutMode ? "Enter a shortcut name." : "Enter a link title.");
      return;
    }

    const normalizedSlug = trimmedTitle.toLowerCase().replace(/\s+/g, "-");
    if (shortcutMode && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      setError("Use lowercase English letters, numbers, and hyphens.");
      return;
    }
    if (
      shortcutMode &&
      shortcutSlugs.some((slug) =>
        slug.toLowerCase() === normalizedSlug && slug !== initialShortcut?.slug,
      )
    ) {
      setError(`to/${normalizedSlug} already exists. Choose another shortcut.`);
      return;
    }

    const normalizedUrl = /^[a-z][a-z\d+.-]*:/i.test(url.trim())
      ? url.trim()
      : `https://${url.trim()}`;

    try {
      const parsedUrl = new URL(normalizedUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Use a web address starting with http:// or https://.");
      }
      if (!parsedUrl.hostname.includes(".")) {
        throw new Error("Enter a valid website address.");
      }

      if (shortcutMode) {
        onSaveShortcut?.({ slug: normalizedSlug, url: parsedUrl.toString() });
      } else {
        onSaveLink?.({
          title: trimmedTitle,
          url: parsedUrl.toString(),
          collectionId: collectionId || null,
          savedForLater,
        });
      }
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Enter a valid website address.");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="workspace-dialog"
      aria-labelledby="link-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <form className="workspace-dialog-form" onSubmit={submit}>
        <h2 id="link-dialog-title">
          {shortcutMode
            ? `${editing ? "Edit" : "Create"} To/Link`
            : `${editing ? "Edit" : "Add"} link`}
        </h2>
        {shortcutMode && (
          <p className="workspace-dialog-description">
            Create a custom link for your spaces and resources.
          </p>
        )}
        {shortcutMode ? (
          <label>
            <span>To/Link</span>
            <span className="to-link-input">
              <span aria-hidden="true">to /</span>
              <input
                autoFocus
                required
                maxLength={48}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="design"
                aria-label="To/Link shortcut"
              />
            </span>
          </label>
        ) : (
          <label>
            <span>Title</span>
            <input
              autoFocus
              required
              maxLength={100}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Design inspiration"
            />
          </label>
        )}
        <label>
          <span>{shortcutMode ? "URL" : "Website address"}</span>
          <input
            required
            type="text"
            inputMode="url"
            autoComplete="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={shortcutMode ? "https://..." : "example.com"}
          />
        </label>
        {!shortcutMode && (
          <>
            <label>
              <span>Collection</span>
              <select value={collectionId} onChange={(event) => setCollectionId(event.target.value)}>
                <option value="">No collection</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>{collection.name}</option>
                ))}
              </select>
            </label>
            <label className="workspace-checkbox">
              <input
                type="checkbox"
                checked={savedForLater}
                onChange={(event) => setSavedForLater(event.target.checked)}
              />
              <span>Also add to Next</span>
            </label>
          </>
        )}
        {error && <p className="workspace-form-error" role="alert">{error}</p>}
        <div className="workspace-dialog-actions">
          <button type="button" className="workspace-button secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="submit" className="workspace-button primary">
            {shortcutMode ? "Done" : editing ? "Save changes" : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
