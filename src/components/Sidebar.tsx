import { Bookmark, LinkIcon, Search, UserRound, PanelLeftClose } from "lucide-react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

interface SidebarProps {
  onOpenProfile: () => void;
}

export default function Sidebar({ onOpenProfile }: SidebarProps) {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <span className="workspace-mark" aria-label="LiberTab">L</span>
        <button className="sidebar-collapse" type="button" aria-label="Collapse sidebar">
          <PanelLeftClose size={16} />
        </button>
      </header>
      <div className="search-bar">
        <Search size={15} />
        <input type="text" placeholder="Search" aria-label="Search workspace" />
        <span className="search-shortcut" aria-hidden="true">⌘ K</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/next">
          <Bookmark size={17} /> Next
        </NavLink>
        <NavLink to="/links">
          <LinkIcon size={17} /> To/Links
        </NavLink>
      </nav>
      <button className="profile-button" type="button" onClick={onOpenProfile}>
        <span className="profile-avatar"><UserRound size={16} /></span>
        <span className="profile-copy">
          <strong>Profile</strong>
          <small>Local account</small>
        </span>
        <span className="profile-open">Settings</span>
      </button>
    </aside>
  );
}