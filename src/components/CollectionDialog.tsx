import { useEffect, useRef, useState } from "react";
import "../styles/WorkspaceDialogs.css";

interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  onSave: (name: string) => void;
}

export default function CollectionDialog({
  open,
  onOpenChange,
  initialName = "",
  onSave,
}: CollectionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(initialName);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setName(initialName);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [initialName, open]);

  function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave(trimmedName);
    onOpenChange(false);
  }

  return (
    <dialog
      ref={dialogRef}
      className="workspace-dialog"
      aria-labelledby="collection-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <form className="workspace-dialog-form" onSubmit={submit}>
        <h2 id="collection-dialog-title">{initialName ? "Rename collection" : "New collection"}</h2>
        <label>
          <span>Collection name</span>
          <input
            autoFocus
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Recipes"
          />
        </label>
        <div className="workspace-dialog-actions">
          <button type="button" className="workspace-button secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="submit" className="workspace-button primary">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
