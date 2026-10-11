import { useState } from "react";
import { ArrowRight, ExternalLink, Link2, Plus, Trash2 } from "lucide-react";
import LinkDialog from "../components/LinkDialog";
import { useWorkspace } from "../lib/workspaceContext";
import type { Shortcut } from "../lib/workspaceTypes";
import "../styles/WorkspacePages.css";
import "../styles/ShortcutList.css";

export default function Links() {
  const { shortcuts, error, addShortcut, updateShortcut, deleteShortcut } = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState("");
  const [addressError, setAddressError] = useState("");
  const editingShortcut = shortcuts.find((shortcut) => shortcut.id === editingId);

  function openNewShortcut() {
    setEditingId(null);
    setDialogOpen(true);
  }

  function openShortcut(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const enteredSlug = addressInput.trim().replace(/^to\//i, "").toLowerCase();
    const shortcut = shortcuts.find(({ slug }) => slug.toLowerCase() === enteredSlug);
    if (!shortcut) {
      setAddressError(`No To/Link found for "to/${enteredSlug}".`);
      return;
    }
    setAddressError("");
    window.location.assign(shortcut.url);
  }

  return (
    <main className="workspace-main">
      <header className="workspace-page-header">
        <div className="page-heading">
          <span className="page-kicker">PERSONAL SPACE / SHORTCUTS</span>
          <h1 className="workspace-page-title">
            <Link2 size={19} />
            To/Links
          </h1>
          <p className="page-description">Give the websites you use a short, memorable address.</p>
        </div>
        <button className="create-link-button" type="button" onClick={openNewShortcut}>
          <Plus size={16} />
          Create To/Link
        </button>
      </header>

      <section className="workspace-list to-link-workspace" aria-label="Your To/Links">
        {error && <p className="workspace-data-error" role="alert">{error}</p>}
        <form className="to-link-jump" onSubmit={openShortcut}>
          <label htmlFor="to-link-jump-input">Open a saved To/Link</label>
          <div className="to-link-jump-input">
            <span aria-hidden="true">to /</span>
            <input
              id="to-link-jump-input"
              value={addressInput}
              onChange={(event) => {
                setAddressInput(event.target.value);
                setAddressError("");
              }}
              placeholder="design"
              aria-describedby={addressError ? "to-link-jump-error" : "to-link-jump-hint"}
            />
            <button type="submit" aria-label="Open To/Link" disabled={!addressInput.trim()}>
              <ArrowRight size={16} />
            </button>
          </div>
          {addressError ? (
            <p className="to-link-jump-message is-error" id="to-link-jump-error" role="alert">
              {addressError}
            </p>
          ) : (
            <p className="to-link-jump-message" id="to-link-jump-hint">
              Enter its short name to go straight to the saved website.
            </p>
          )}
        </form>

        <div className="to-link-list-heading">
          <div>
            <h2>Your To/Links</h2>
            <span>{shortcuts.length} {shortcuts.length === 1 ? "shortcut" : "shortcuts"}</span>
          </div>
        </div>

        {shortcuts.length === 0 ? (
          <div className="workspace-empty-state">
            <span className="empty-state-icon"><Link2 size={20} /></span>
            <div>
              <h2>No To/Links yet</h2>
              <p>Create a short address such as <code>to/design</code> and connect it to a website.</p>
            </div>
          </div>
        ) : (
          <div className="shortcut-list">
            {[...shortcuts].reverse().map((shortcut) => (
              <ShortcutRow
                key={shortcut.id}
                shortcut={shortcut}
                onEdit={() => {
                  setEditingId(shortcut.id);
                  setDialogOpen(true);
                }}
                onDelete={() => {
                  if (window.confirm(`Delete to/${shortcut.slug}?`)) {
                    deleteShortcut(shortcut.id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      <LinkDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingId(null);
        }}
        collections={[]}
        initialShortcut={editingShortcut}
        shortcutSlugs={shortcuts.map(({ slug }) => slug)}
        mode="shortcut"
        onSaveShortcut={(input) => {
          if (editingShortcut) updateShortcut(editingShortcut.id, input);
          else addShortcut(input);
        }}
      />
    </main>
  );
}

function ShortcutRow({
  shortcut,
  onEdit,
  onDelete,
}: {
  shortcut: Shortcut;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hostname = new URL(shortcut.url).hostname.replace(/^www\./, "");

  return (
    <article className="shortcut-row">
      <a href={shortcut.url} className="shortcut-destination">
        <span className="shortcut-mark" aria-hidden="true">{hostname.slice(0, 1).toUpperCase()}</span>
        <span className="shortcut-copy">
          <strong>to/{shortcut.slug}</strong>
          <small>{hostname}</small>
        </span>
        <span className="shortcut-url">{shortcut.url}</span>
        <ExternalLink className="shortcut-open-icon" size={14} aria-hidden="true" />
      </a>
      <div className="shortcut-actions">
        <button type="button" onClick={onEdit} aria-label={`Edit to/${shortcut.slug}`}>Edit</button>
        <button type="button" onClick={onDelete} aria-label={`Delete to/${shortcut.slug}`}>
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}
