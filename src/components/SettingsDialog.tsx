import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Cloud,
  Download,
  HardDrive,
  Info,
  Import,
  LoaderCircle,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import {
  downloadLocalBackup,
  getLocalDataEntryCount,
  requestDriveAccess,
  restoreBackupFromDrive,
  restoreLocalBackup,
  saveBackupToDrive,
} from "../lib/driveBackup";
import "../styles/SettingsDialog.css";

type SettingsSection = "profile" | "preferences" | "storage";

type PreferenceKey =
  | "darkMode"
  | "autoTheme"
  | "openTobySidePanel"
  | "openCardsInSameTab"
  | "autoCloseTabs"
  | "tabGroups"
  | "shortcuts";
type ColorFilter = "none" | "protanopia" | "deuteranopia" | "tritanopia";

const colorFilterOptions: Array<{ value: ColorFilter; label: string; description?: string }> = [
  { value: "none", label: "None" },
  { value: "protanopia", label: "Red/Green Filter", description: "Protanopia" },
  { value: "deuteranopia", label: "Green/Red Filter", description: "Deuteranopia" },
  { value: "tritanopia", label: "Blue/Yellow Filter", description: "Tritanopia" },
];

const initialPreferences: Record<PreferenceKey, boolean> = {
  darkMode: true,
  autoTheme: true,
  openTobySidePanel: true,
  openCardsInSameTab: false,
  autoCloseTabs: true,
  tabGroups: false,
  shortcuts: true,
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

interface PreferenceToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

function PreferenceToggle({ label, description, checked, onChange }: PreferenceToggleProps) {
  return (
    <div className={`preference-row${description ? " has-description" : ""}`}>
      <span className="preference-copy">
        <span className="preference-label">
          {label}
          <Info size={13} aria-hidden="true" />
        </span>
        {description && <span className="preference-description">{description}</span>}
      </span>
      <PreferenceSwitch label={label} checked={checked} onChange={onChange} />
    </div>
  );
}

interface PreferenceSwitchProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function PreferenceSwitch({ label, checked, onChange }: PreferenceSwitchProps) {
  return (
    <button
      className={`preference-switch${checked ? " is-on" : ""}`}
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
    >
      <span />
    </button>
  );
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorFilterRef = useRef<HTMLDivElement>(null);
  const colorFilterTriggerRef = useRef<HTMLButtonElement>(null);
  const focusSelectedFilterRef = useRef(false);
  const [section, setSection] = useState<SettingsSection>("profile");
  const [preferences, setPreferences] = useState(initialPreferences);
  const [colorFilter, setColorFilter] = useState<ColorFilter>("none");
  const [colorFilterOpen, setColorFilterOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [{ initialEntryCount, initialStatus }] = useState(() => {
    try {
      return { initialEntryCount: getLocalDataEntryCount(), initialStatus: "" };
    } catch (error) {
      return {
        initialEntryCount: 0,
        initialStatus: `Could not inspect local app data: ${getErrorMessage(error)}`,
      };
    }
  });
  const [status, setStatus] = useState(initialStatus);
  const [entryCount, setEntryCount] = useState(initialEntryCount);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!colorFilterOpen || !focusSelectedFilterRef.current) return;
    const selectedIndex = colorFilterOptions.findIndex((option) => option.value === colorFilter);
    colorFilterRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[selectedIndex]
      ?.focus();
    focusSelectedFilterRef.current = false;
  }, [colorFilterOpen, colorFilter]);

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
    if (entryCount > 0 && !window.confirm("Replace LiberTab data in this browser with the Drive backup?")) {
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      const token = accessToken ?? await requestDriveAccess();
      setAccessToken(token);
      const restoredCount = await restoreBackupFromDrive(token);
      setEntryCount(restoredCount);
      setStatus(`Restored ${restoredCount} LiberTab data ${restoredCount === 1 ? "item" : "items"}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function importLocalBackup(file?: File) {
    if (!file) return;
    if (entryCount > 0 && !window.confirm("Replace LiberTab data in this browser with this backup?")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      const restoredCount = restoreLocalBackup(await file.text());
      setEntryCount(restoredCount);
      setStatus(`Restored ${restoredCount} LiberTab data ${restoredCount === 1 ? "item" : "items"}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDownload() {
    try {
      downloadLocalBackup();
      setStatus("A backup file was downloaded.");
    } catch (error) {
      setStatus(`Could not download backup: ${getErrorMessage(error)}`);
    }
  }

  function togglePreference(key: PreferenceKey) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }

  function selectColorFilter(filter: ColorFilter) {
    setColorFilter(filter);
    setColorFilterOpen(false);
    colorFilterTriggerRef.current?.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      className="settings-dialog"
      aria-labelledby="settings-title"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false);
        else if (!colorFilterRef.current?.contains(event.target as Node)) setColorFilterOpen(false);
      }}
    >
      <div className="settings-layout">
        <aside className="settings-rail" aria-label="Settings sections">
          <span className="settings-rail-label">ACCOUNT</span>
          <button
            className={`settings-nav-item${section === "profile" ? " is-current" : ""}`}
            type="button"
            onClick={() => setSection("profile")}
          >
            <UserRound size={16} />
            Profile
          </button>
          <button
            className={`settings-nav-item${section === "preferences" ? " is-current" : ""}`}
            type="button"
            onClick={() => setSection("preferences")}
          >
            <SlidersHorizontal size={16} />
            Preferences
          </button>
          <span className="settings-rail-label settings-rail-secondary">DATA</span>
          <button
            className={`settings-nav-item${section === "storage" ? " is-current" : ""}`}
            type="button"
            onClick={() => setSection("storage")}
          >
            <HardDrive size={16} />
            Storage & backup
          </button>
        </aside>

        <section className="settings-panel">
          <header className="settings-panel-header">
            <div>
              <span className="settings-kicker">LIBRETAB SETTINGS</span>
              <h2 id="settings-title">
                {section === "profile" ? "Profile" : section === "preferences" ? "Preferences" : "Storage & backup"}
              </h2>
            </div>
            <button
              className="settings-close"
              type="button"
              aria-label="Close settings"
              onClick={() => onOpenChange(false)}
            >
              <X size={18} />
            </button>
          </header>

          {section === "profile" ? (
            <div className="settings-content">
              <div className="profile-card">
                <span className="profile-card-avatar"><UserRound size={21} /></span>
                <div>
                  <h3>Local profile</h3>
                  <p>This app is running without an account or a backend.</p>
                </div>
                <span className="local-badge">ON THIS DEVICE</span>
              </div>
              <div className="settings-info">
                <h3>Your data stays in your browser</h3>
                <p>
                  Connect Google Drive in Storage &amp; backup to manually save or
                  restore a copy. LiberTab only requests access to files it creates.
                </p>
                <button className="settings-inline-link" type="button" onClick={() => setSection("storage")}>
                  Manage backups <Cloud size={15} />
                </button>
              </div>
            </div>
          ) : section === "preferences" ? (
            <div className="settings-content preferences-content">
              <section className="preference-group" aria-labelledby="appearance-heading">
                <h3 id="appearance-heading">Appearance</h3>
                <PreferenceToggle
                  label="Dark Mode"
                  checked={preferences.darkMode}
                  onChange={() => togglePreference("darkMode")}
                />
                <PreferenceToggle
                  label="Auto Theme with Browser"
                  checked={preferences.autoTheme}
                  onChange={() => togglePreference("autoTheme")}
                />
                <div
                  className={`preference-filter-picker${colorFilterOpen ? " is-open" : ""}`}
                  ref={colorFilterRef}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && colorFilterOpen) {
                      event.preventDefault();
                      setColorFilterOpen(false);
                      colorFilterTriggerRef.current?.focus();
                      return;
                    }

                    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                    const currentIndex = colorFilterOptions.findIndex((option) => option.value === colorFilter);
                    const offset = event.key === "ArrowDown" ? 1 : -1;
                    const nextIndex = (currentIndex + offset + colorFilterOptions.length) % colorFilterOptions.length;
                    event.preventDefault();
                    if (!colorFilterOpen) {
                      focusSelectedFilterRef.current = true;
                      setColorFilterOpen(true);
                      return;
                    }
                    setColorFilterOpen(true);
                    colorFilterRef.current
                      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]
                      ?.focus();
                  }}
                >
                  <button
                    ref={colorFilterTriggerRef}
                    className="preference-select-row"
                    type="button"
                    aria-expanded={colorFilterOpen}
                    aria-controls="color-filter-options"
                    onClick={() => setColorFilterOpen((current) => !current)}
                  >
                    <span>Colour Filters</span>
                    <span className="preference-select-value">
                      {colorFilterOptions.find((option) => option.value === colorFilter)?.label}
                    </span>
                    <ChevronDown className="preference-select-chevron" size={16} aria-hidden="true" />
                  </button>
                  <div
                    className="preference-filter-options"
                    id="color-filter-options"
                    role="radiogroup"
                    aria-label="Colour Filters"
                    hidden={!colorFilterOpen}
                  >
                    {colorFilterOptions.map((option) => (
                      <button
                        key={option.value}
                        className="preference-filter-option"
                        type="button"
                        role="radio"
                        aria-checked={colorFilter === option.value}
                        onClick={() => selectColorFilter(option.value)}
                      >
                        <span className="preference-radio" aria-hidden="true" />
                        <span className="preference-option-copy">
                          <span>{option.label}</span>
                          {option.description && <small>{option.description}</small>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="preference-group" aria-labelledby="toolbar-heading">
                <h3 id="toolbar-heading">Toolbar Button</h3>
                <PreferenceToggle
                  label="Open LiberTab in the side panel"
                  checked={preferences.openTobySidePanel}
                  onChange={() => togglePreference("openTobySidePanel")}
                />
              </section>

              <section className="preference-group" aria-labelledby="tabs-heading">
                <h3 id="tabs-heading">Tabs</h3>
                <PreferenceToggle
                  label="Open cards on the same tab"
                  description="Cmd + click to open on a new tab"
                  checked={preferences.openCardsInSameTab}
                  onChange={() => togglePreference("openCardsInSameTab")}
                />
                <PreferenceToggle
                  label="Automatically close tabs"
                  checked={preferences.autoCloseTabs}
                  onChange={() => togglePreference("autoCloseTabs")}
                />
                <PreferenceToggle
                  label="Enable Tab Groups"
                  checked={preferences.tabGroups}
                  onChange={() => togglePreference("tabGroups")}
                />
                <PreferenceToggle
                  label="Enable Shortcuts"
                  checked={preferences.shortcuts}
                  onChange={() => togglePreference("shortcuts")}
                />
              </section>
            </div>
          ) : (
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
                  Backups include LiberTab data stored in this browser. Collection and
                  link storage is not connected yet, so there may be nothing to back up.
                </p>
              </div>

              <div className="backup-actions">
                {!accessToken ? (
                  <button
                    className="settings-primary-action"
                    type="button"
                    disabled={busy}
                    onClick={connectDrive}
                  >
                    {busy ? <LoaderCircle className="is-spinning" size={16} /> : <Cloud size={16} />}
                    Connect Google Drive
                  </button>
                ) : (
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
                )}
                <div className="local-backup-actions">
                  <button className="settings-secondary-action" type="button" disabled={busy} onClick={handleDownload}>
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
          )}
        </section>
      </div>
    </dialog>
  );
}
