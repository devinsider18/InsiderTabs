import { useState } from "react";
import { Bookmark, BookmarkPlus } from "lucide-react";
import LinkDialog from "../components/LinkDialog";
import WorkspaceLinkItem from "../components/WorkspaceLinkItem";
import { useWorkspace } from "../lib/workspaceContext";
import "../styles/WorkspacePages.css";

export default function Next() {
  const { collections, links, error, updateLink, deleteLink, toggleSavedForLater } = useWorkspace();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const savedLinks = [...links].filter((link) => link.savedForLater).reverse();
  const editingLink = links.find((link) => link.id === editingId);

  return (
    <main className="workspace-main">
      <header className="workspace-page-header">
        <div className="page-heading">
          <span className="page-kicker">PERSONAL SPACE / READING QUEUE</span>
          <h1 className="workspace-page-title">
            <Bookmark size={19} />
            Next
          </h1>
          <p className="page-description">Keep a few good things within reach for later.</p>
        </div>
      </header>
      <section className="workspace-list" aria-label="Reading queue">
        {error && <p className="workspace-data-error" role="alert">{error}</p>}
        {savedLinks.length === 0 ? (
          <div className="workspace-empty-state">
            <span className="empty-state-icon"><BookmarkPlus size={20} /></span>
            <div>
              <h2>Your reading queue is clear</h2>
              <p>Add a link to Next from My Collections, or mark an existing link with the bookmark button.</p>
            </div>
          </div>
        ) : (
          <div className="saved-link-list">
            {savedLinks.map((link) => (
              <WorkspaceLinkItem
                key={link.id}
                link={link}
                onEdit={() => {
                  setEditingId(link.id);
                  setDialogOpen(true);
                }}
                onDelete={() => {
                  if (window.confirm(`Delete "${link.title}"?`)) deleteLink(link.id);
                }}
                onToggleSavedForLater={() => toggleSavedForLater(link.id)}
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
        collections={collections}
        initialLink={editingLink}
        mode="library"
        onSaveLink={(input) => {
          if (editingLink) updateLink(editingLink.id, input);
        }}
      />
    </main>
  );
}
