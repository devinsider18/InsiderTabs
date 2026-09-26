import { LayoutGrid, Plus, Settings, Share2, SlidersHorizontal, Tag } from "lucide-react";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";
export default function Dashboard() {
  return (
   <div className="layout">
    <Sidebar />
    <div className="dashboard">
      <header className="topbar">
        <div className="title">
          <h1>My Collections</h1>
          <span>| 0 collections</span>
        </div>
        <div className="actions">
          <button className="text-btn"><Share2 size={15} /> SHARE</button>
          <button className="icon-btn"><Settings size={18} /></button>
        </div>
      </header>
      <nav className="toolbar">
        <div className="filters">
          <button><SlidersHorizontal size={14} /> DRAG & DROP</button>
          <button><Tag size={14} /> TAG FILTER</button>
          <button><LayoutGrid size={14} /> VIEW</button>
          <button>EXPAND</button>
          <button>COLLAPSE</button>
        </div>
        <button className="add-btn"><Plus size={16} /> ADD COLLECTION</button>
      </nav>
      <main className="content">
        <div className="skeleton-grid">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
        <div className="empty-state">
          <h2>No collections shared with this space yet.</h2>
          <p>ADD OR SHARE COLLECTIONS WITH YOUR SPACE AND YOU WILL SEE THEM HERE.</p>
          <button className="fab-btn"><Plus size={24} /></button>
        </div>
      </main>
    </div>
  </div>
  )
}