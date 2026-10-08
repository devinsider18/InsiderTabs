import { Link2, Plus, Unlink } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "../styles/WorkspacePages.css";

export default function Links() {
  return (
    <div className="workspace-view">
      <Sidebar />
      <main className="workspace-main">
        <header className="workspace-page-header">
          <div className="page-heading">
            <span className="page-kicker">PERSONAL SPACE / SHORTCUTS</span>
            <h1 className="workspace-page-title">
              <Link2 size={19} />
              To/Links
            </h1>
            <p className="page-description">Short names for the places you return to.</p>
          </div>
          <button className="create-link-button" type="button">
            <Plus size={16} />
            New shortcut
          </button>
        </header>
        <section className="workspace-list" aria-label="Personal shortcuts">
          <div className="link-library-toolbar">
            <div className="link-tabs" aria-label="Link filters">
              <button className="link-tab is-selected" type="button">My links</button>
              <button className="link-tab" type="button">Shared</button>
            </div>
            <span className="sort-label">SORTED BY <strong>RECENT</strong></span>
          </div>
          <div className="workspace-empty-state">
            <span className="empty-state-icon"><Unlink size={20} /></span>
            <div>
              <h2>No shortcuts yet</h2>
              <p>Create a To/Link to give a frequently used destination a memorable name.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
