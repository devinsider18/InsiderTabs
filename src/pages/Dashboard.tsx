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
            <span className="eyebrow">Space overview</span>
            <div className="title-row">
              <h1>My Collections</h1>
              <span className="collection-count">0 collections</span>
            </div>
          </div>
          <div className="actions">
            <button className="text-btn">
              <Share2 size={16} /> Share
            </button>
            <button className="icon-btn" aria-label="Settings">
              <Settings size={17} />
            </button>
          </div>
        </header>
        <nav className="toolbar">
          <div className="filters">
            <DropdownMenu>
              <DropdownTrigger asChild>
                <button className="filter-trigger">
                  <SlidersHorizontal size={15} />
                  Drag & drop
                  <ChevronDown size={13} className="chevron" />
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
                  <Tag size={15} />
                  Tag filter
                  <ChevronDown size={13} className="chevron" />
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
                  <LayoutGrid size={15} />
                  View
                  <ChevronDown size={13} className="chevron" />
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
            <button className="filter-trigger text-only">Expand</button>
            <button className="filter-trigger text-only">Collapse</button>
          </div>
          <button className="add-btn">
            <Plus size={15} /> Add collection
          </button>
        </nav>
        <main className="content">
          <div className="empty-state">
            <div className="empty-copy">
              <h2>No collections shared with this space yet.</h2>
              <p>Add or share collections with your space and they’ll appear here.</p>
            </div>
            <button className="fab-btn" aria-label="Add your first collection">
              <Plus size={21} />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}