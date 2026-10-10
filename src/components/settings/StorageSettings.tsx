import { useRef, useState } from "react";
import { Cloud, Download, Import, LoaderCircle } from "lucide-react";
import {
  downloadLocalBackup,
  getLocalDataEntryCount,
  requestDriveAccess,
  restoreBackupFromDrive,
  restoreLocalBackup,
  saveBackupToDrive,
} from "../../lib/driveBackup";
import { useWorkspace } from "../../lib/workspaceContext";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

function getInitialStorageState() {
  try {
    return { entryCount: getLocalDataEntryCount(), status: "" };
  } catch (error) {
    return {
      entryCount: 0,
      status: `Could not inspect local app data: ${getErrorMessage(error)}`,
    };
  }
}

export default function StorageSettings() {
  const { reloadWorkspace } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [accessToken, setAccessToken] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [initialState] = useState(getInitialStorageState);
  const [status, setStatus] = useState(initialState.status);
  const [entryCount, setEntryCount] = useState(initialState.entryCount);

  async function connectDrive() {
    setBusy(true);
    setStatus("");
    try {
      setAccessToken(await requestDriveAccess());
      setStatus("Google Drive is connected for this browser session.");
    } catch (error) {
      setStatus(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function saveDriveBackup() {
    setBusy(true);
    setStatus("");
    try {
      const token = accessToken ?? await requestDriveAccess();
      setAccessToken(token);
      await saveBackupToDrive(token);
      setStatus("Backup saved to Google Drive.");
    } catch (error) {
      setStatus(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function restoreDriveBackup() {
    if (
      entryCount > 0 &&
      !window.confirm("Replace LiberTab data in this browser with the Drive backup?")
    ) {
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      const token = accessToken ?? await requestDriveAccess();
      setAccessToken(token);
      const restoredCount = await restoreBackupFromDrive(token);
      reloadWorkspace();
      setEntryCount(restoredCount);
      setStatus(formatRestoreStatus(restoredCount));
    } catch (error) {
      setStatus(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function importLocalBackup(file?: File) {
    if (!file) return;

    if (
      entryCount > 0 &&
      !window.confirm("Replace LiberTab data in this browser with this backup?")
    ) {
      clearSelectedFile();
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      const restoredCount = restoreLocalBackup(await file.text());
      reloadWorkspace();
      setEntryCount(restoredCount);
      setStatus(formatRestoreStatus(restoredCount));
    } catch (error) {
      setStatus(getErrorMessage(error));
    } finally {
      setBusy(false);
      clearSelectedFile();
    }
  }

  function downloadBackup() {
    try {
      downloadLocalBackup();
      setStatus("A backup file was downloaded.");
    } catch (error) {
      setStatus(`Could not download backup: ${getErrorMessage(error)}`);
    }
  }

  function clearSelectedFile() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="settings-content">
      <div className="storage-intro">
        <span className="storage-icon"><Cloud size={19} /></span>
        <div>
          <h3>Google Drive</h3>
          <p>Manual backup, directly from this browser. No app server.</p>
        </div>
        <span className={`connection-badge${accessToken ? " is-connected" : ""}`}>
          <span />
          {accessToken ? "Connected" : "Not connected"}
        </span>
      </div>

      <div className="backup-explainer">
        <strong>{entryCount} local app {entryCount === 1 ? "item" : "items"} found</strong>
        <p>
          Backups include your collections, links, To/Links, and other LiberTab data
          stored in this browser.
        </p>
      </div>

      <div className="backup-actions">
        {accessToken ? (
          <div className="drive-actions">
            <button
              className="settings-primary-action"
              type="button"
              disabled={busy}
              onClick={saveDriveBackup}
            >
              {busy ? <LoaderCircle className="is-spinning" size={16} /> : <Cloud size={16} />}
              Save backup
            </button>
            <button
              className="settings-secondary-action"
              type="button"
              disabled={busy}
              onClick={restoreDriveBackup}
            >
              <Import size={16} />
              Restore from Drive
            </button>
          </div>
        ) : (
          <button
            className="settings-primary-action"
            type="button"
            disabled={busy}
            onClick={connectDrive}
          >
            {busy ? <LoaderCircle className="is-spinning" size={16} /> : <Cloud size={16} />}
            Connect Google Drive
          </button>
        )}

        <div className="local-backup-actions">
          <button
            className="settings-secondary-action"
            type="button"
            disabled={busy}
            onClick={downloadBackup}
          >
            <Download size={16} />
            Download JSON
          </button>
          <button
            className="settings-secondary-action"
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            <Import size={16} />
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            className="backup-file-input"
            type="file"
            accept="application/json,.json"
            aria-label="Choose a LiberTab backup file"
            onChange={(event) => void importLocalBackup(event.currentTarget.files?.[0])}
          />
        </div>
      </div>

      <p className="drive-setup-note">
        Google Drive requires a Google OAuth web client ID configured as
        <code> VITE_GOOGLE_CLIENT_ID</code> and the current site origin allowlisted in Google Cloud.
      </p>
      <p className="settings-status" role="status" aria-live="polite">{status}</p>
    </div>
  );
}

function formatRestoreStatus(entryCount: number): string {
  const noun = entryCount === 1 ? "item" : "items";
  return `Restored ${entryCount} LiberTab data ${noun}.`;
}
