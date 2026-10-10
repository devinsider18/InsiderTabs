import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/AppShell.css";

export default function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-content">
        <Outlet />
      </div>
    </div>
  );
}
