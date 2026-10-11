import { Cloud, UserRound } from "lucide-react";

interface ProfileSettingsProps {
  onOpenStorage: () => void;
}

export default function ProfileSettings({ onOpenStorage }: ProfileSettingsProps) {
  return (
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
          Connect Google Drive in Storage &amp; backup to manually save or restore a
          copy. InsiderTabs only requests access to files it creates.
        </p>
        <button className="settings-inline-link" type="button" onClick={onOpenStorage}>
          Manage backups <Cloud size={15} />
        </button>
      </div>
    </div>
  );
}
