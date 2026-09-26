import { ArrowDownAZ, Bookmark, LinkIcon, Plus, Search, Star, Users, Lock, PanelLeftClose } from "lucide-react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <h2>My Workspace</h2>
        <button><PanelLeftClose size={18} /></button>
      </header>
      <div className="search-bar">
        <Search size={16} />
        <input type="text" placeholder="Search" />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/links">
          <LinkIcon size={16} /> To / Links
        </NavLink>
        <NavLink to="/next">
          <Bookmark size={16} /> Next
        </NavLink>
        <div className="spaces-title">
          <span>SPACES</span>
          <div className="spaces-actions">
            <button><ArrowDownAZ size={14} /></button>
            <button><Plus size={14} /></button>
          </div>
        </div>
        <NavLink to="/starred">
          <Star size={16} /> Starred Collections
        </NavLink>
        <NavLink to="/collections">
          <Lock size={16} /> My Collections
        </NavLink>
        <NavLink to="/first-space">
          <Users size={16} /> My First Space
        </NavLink>
      </nav>
    </aside>
  );
}