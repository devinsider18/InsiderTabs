import {
  Root as DropdownMenu,
  Trigger as DropdownTrigger,
  Portal as DropdownPortal,
  Content as DropdownContent,
  Item as DropdownItem,
} from "@radix-ui/react-dropdown-menu";
import {
  LayoutGrid,
  Plus,
  Settings,
  Share2,
  SlidersHorizontal,
  Tag,
  ChevronDown,
  GripVertical,
  ArrowDownAZ,
  Star,
  Calendar,
  BookmarkX,
  Rows2,
  List,
  Grid,
} from "lucide-react";
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
            <button className="text-btn">
              <Share2 size={15} /> SHARE
            </button>
            <button className="icon-btn">
              <Settings size={18} />
            </button>
          </div>
        </header>
        <nav className="toolbar">
          <div className="filters">
            <DropdownMenu>
              <DropdownTrigger asChild>
                <button className="filter-trigger">
                  <SlidersHorizontal size={14} />
                  DRAG & DROP
                  <ChevronDown size={14} className="chevron" />
                </button>
              </DropdownTrigger>
              <DropdownPortal>
                <DropdownContent className="dropdown-content" sideOffset={6} align="start">
                  <DropdownItem className="dropdown-item">
                    <GripVertical size={16} /> Drag & Drop
                  </DropdownItem>
                  <DropdownItem className="dropdown-item">
                    <ArrowDownAZ size={16} /> Alphabetical
                  </DropdownItem>
                  <DropdownItem className="dropdown-item">
                    <Star size={16} /> Starred To Top
                  </DropdownItem>
                  <DropdownItem className="dropdown-item">
                    <Calendar size={16} /> Date Created
                  </DropdownItem>
                </DropdownContent>
              </DropdownPortal>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownTrigger asChild>
                <button className="filter-trigger">
                  <Tag size={14} />
                  TAG FILTER
                  <ChevronDown size={14} className="chevron" />
                </button>
              </DropdownTrigger>
              <DropdownPortal>
                <DropdownContent className="dropdown-content" sideOffset={6} align="start">
                  <DropdownItem className="dropdown-item">
                    Clear All Tags
                  </DropdownItem>
                  <DropdownItem className="dropdown-item">
                    <BookmarkX size={16} /> No Label
                  </DropdownItem>
                </DropdownContent>
              </DropdownPortal>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownTrigger asChild>
                <button className="filter-trigger">
                  <LayoutGrid size={14} />
                  VIEW
                  <ChevronDown size={14} className="chevron" />
                </button>
              </DropdownTrigger>
              <DropdownPortal>
                <DropdownContent className="dropdown-content" sideOffset={6} align="start">
                  <DropdownItem className="dropdown-item">
                    <LayoutGrid size={16} /> Card
                  </DropdownItem>
                  <DropdownItem className="dropdown-item">
                    <Rows2 size={16} /> Compact
                  </DropdownItem>
                  <DropdownItem className="dropdown-item">
                    <List size={16} /> List
                  </DropdownItem>
                  <DropdownItem className="dropdown-item">
                    <Grid size={16} /> Grid
                  </DropdownItem>
                </DropdownContent>
              </DropdownPortal>
            </DropdownMenu>
            <button className="filter-trigger text-only">EXPAND</button>
            <button className="filter-trigger text-only">COLLAPSE</button>
          </div>
          <button className="add-btn">
            <Plus size={16} /> ADD COLLECTION
          </button>
        </nav>
        <main className="content">
          <div className="skeleton-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
          <div className="empty-state">
            <h2>No collections shared with this space yet.</h2>
            <p>ADD OR SHARE COLLECTIONS WITH YOUR SPACE AND YOU WILL SEE THEM HERE.</p>
            <button className="fab-btn">
              <Plus size={24} />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}