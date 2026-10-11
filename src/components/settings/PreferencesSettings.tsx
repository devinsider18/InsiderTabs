import { useState } from "react";
import PreferenceToggle from "./PreferenceToggle";
import ColorFilterPicker from "./ColorFilterPicker";

type PreferenceKey =
  | "darkMode"
  | "autoTheme"
  | "openSidePanel"
  | "openCardsInSameTab"
  | "autoCloseTabs"
  | "tabGroups"
  | "shortcuts";

const defaultPreferences: Record<PreferenceKey, boolean> = {
  darkMode: true,
  autoTheme: true,
  openSidePanel: true,
  openCardsInSameTab: false,
  autoCloseTabs: true,
  tabGroups: false,
  shortcuts: true,
};

export default function PreferencesSettings() {
  const [preferences, setPreferences] = useState(defaultPreferences);

  function togglePreference(key: PreferenceKey) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
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
        <ColorFilterPicker />
      </section>

      <section className="preference-group" aria-labelledby="toolbar-heading">
        <h3 id="toolbar-heading">Toolbar Button</h3>
        <PreferenceToggle
          label="Open InsiderTabs in the side panel"
          checked={preferences.openSidePanel}
          onChange={() => togglePreference("openSidePanel")}
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
  );
}
