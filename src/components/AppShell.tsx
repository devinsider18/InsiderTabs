import { useState } from "react";
import { Outlet } from "react-router-dom";
import SettingsDialog from "./SettingsDialog";
import Sidebar from "./Sidebar";
import "../styles/AppShell.css";

export default function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar onOpenProfile={() => setSettingsOpen(true)} />
      <div className="app-shell-content">
        <Outlet />
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
