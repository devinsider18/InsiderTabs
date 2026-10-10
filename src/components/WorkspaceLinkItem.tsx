import { Bookmark, BookmarkCheck, Pencil, Trash2 } from "lucide-react";
import type { WorkspaceLink } from "../lib/workspaceTypes";
import "../styles/LinkItem.css";

interface WorkspaceLinkItemProps {
  link: WorkspaceLink;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSavedForLater: () => void;
}

export default function WorkspaceLinkItem({
  link,
  onEdit,
  onDelete,
  onToggleSavedForLater,
}: WorkspaceLinkItemProps) {
  const hostname = new URL(link.url).hostname.replace(/^www\./, "");

  return (
    <article className="workspace-link-item">
      <a className="workspace-link-main" href={link.url} target="_blank" rel="noreferrer">
        <span className="workspace-link-favicon" aria-hidden="true">
          {hostname.slice(0, 1).toUpperCase()}
        </span>
        <span className="workspace-link-copy">
          <strong>{link.title}</strong>
          <small>{hostname}</small>
        </span>
      </a>
      <div className="workspace-link-actions">
        <button
          type="button"
          aria-label={link.savedForLater ? "Remove from Next" : "Save to Next"}
          title={link.savedForLater ? "Remove from Next" : "Save to Next"}
          onClick={onToggleSavedForLater}
        >
          {link.savedForLater ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        </button>
        <button type="button" aria-label={`Edit ${link.title}`} title="Edit" onClick={onEdit}>
          <Pencil size={14} />
        </button>
        <button type="button" aria-label={`Delete ${link.title}`} title="Delete" onClick={onDelete}>
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}
