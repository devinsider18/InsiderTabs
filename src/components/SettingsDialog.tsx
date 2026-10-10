import { Fragment, useEffect, useRef, useState } from "react";
import { HardDrive, SlidersHorizontal, UserRound, X } from "lucide-react";
import PreferencesSettings from "./settings/PreferencesSettings";
import ProfileSettings from "./settings/ProfileSettings";
import StorageSettings from "./settings/StorageSettings";
import "../styles/SettingsDialog.css";

type SettingsSection = "profile" | "preferences" | "storage";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections: Array<{
  id: SettingsSection;
  label: string;
  group?: string;
  icon: typeof UserRound;
}> = [
  { id: "profile", label: "Profile", group: "ACCOUNT", icon: UserRound },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "storage", label: "Storage & backup", group: "DATA", icon: HardDrive },
];

const sectionTitles: Record<SettingsSection, string> = {
  profile: "Profile",
  preferences: "Preferences",
  storage: "Storage & backup",
};

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [section, setSection] = useState<SettingsSection>("profile");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function closeDialog() {
    onOpenChange(false);
  }

  return (
    <dialog
      ref={dialogRef}
      className="settings-dialog"
      aria-labelledby="settings-title"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <div className="settings-layout">
        <aside className="settings-rail" aria-label="Settings sections">
          {sections.map(({ id, label, group, icon: Icon }) => (
            <Fragment key={id}>
              {group && (
                <span className={`settings-rail-label${group === "DATA" ? " settings-rail-secondary" : ""}`}>
                  {group}
                </span>
              )}
              <button
                className={`settings-nav-item${section === id ? " is-current" : ""}`}
                type="button"
                aria-current={section === id ? "page" : undefined}
                onClick={() => setSection(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            </Fragment>
          ))}
        </aside>

        <section className="settings-panel">
          <header className="settings-panel-header">
            <div>
              <span className="settings-kicker">LIBRETAB SETTINGS</span>
              <h2 id="settings-title">{sectionTitles[section]}</h2>
            </div>
            <button
              className="settings-close"
              type="button"
              aria-label="Close settings"
              onClick={closeDialog}
            >
              <X size={18} />
            </button>
          </header>

          <div hidden={section !== "profile"}>
            <ProfileSettings onOpenStorage={() => setSection("storage")} />
          </div>
          <div hidden={section !== "preferences"}>
            <PreferencesSettings />
          </div>
          <div hidden={section !== "storage"}>
            <StorageSettings />
          </div>
        </section>
      </div>
    </dialog>
  );
}
