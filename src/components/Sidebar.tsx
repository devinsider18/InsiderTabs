import { ArrowDownAZ, Bookmark, LinkIcon, Plus, Search, Star, Users, Lock, PanelLeftClose } from "lucide-react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div className="workspace-identity">
          <span className="workspace-mark" aria-hidden="true">L</span>
          <h2>My Workspace</h2>
        </div>
        <button aria-label="Collapse sidebar"><PanelLeftClose size={16} /></button>
      </header>
      <div className="search-bar">
        <Search size={15} />
        <input type="text" placeholder="Search" aria-label="Search workspace" />
        <span className="search-shortcut" aria-hidden="true">⌘ K</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/links">
          <LinkIcon size={17} /> To / Links
        </NavLink>
        <NavLink to="/next">
          <Bookmark size={17} /> Next
        </NavLink>
        <div className="spaces-title">
          <span>SPACES</span>
          <div className="spaces-actions">
            <button aria-label="Sort spaces"><ArrowDownAZ size={14} /></button>
            <button aria-label="Add space"><Plus size={14} /></button>
          </div>
        </div>
        <NavLink to="/starred">
          <Star size={17} /> Starred Collections
        </NavLink>
        <NavLink to="/collections">
          <Lock size={17} /> My Collections
        </NavLink>
        <NavLink to="/first-space">
          <Users size={17} /> My First Space
        </NavLink>
      </nav>
    </aside>
  );
}