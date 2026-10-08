import { Bookmark, BookmarkPlus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "../styles/WorkspacePages.css";

export default function Next() {
  return (
    <div className="workspace-view">
      <Sidebar />
      <main className="workspace-main">
        <header className="workspace-page-header">
          <div className="page-heading">
            <span className="page-kicker">PERSONAL SPACE / READING QUEUE</span>
            <h1 className="workspace-page-title">
              <Bookmark size={19} />
              Next
            </h1>
            <p className="page-description">Keep a few good things within reach for later.</p>
          </div>
        </header>
        <section className="workspace-list" aria-label="Reading queue">
          <div className="workspace-empty-state">
            <span className="empty-state-icon"><BookmarkPlus size={20} /></span>
            <div>
              <h2>Your reading queue is clear</h2>
              <p>Save links for later and they’ll appear here.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
