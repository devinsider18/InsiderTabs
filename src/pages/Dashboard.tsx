import { useState } from "react";
import {
  Root as DropdownMenu,
  Trigger as DropdownTrigger,
  Portal as DropdownPortal,
  Content as DropdownContent,
  Item as DropdownItem,
} from "@radix-ui/react-dropdown-menu";
import {
  ArrowDownAZ,
  BookmarkX,
  Calendar,
  ChevronDown,
  FolderPlus,
  GripVertical,
  Grid,
  LayoutGrid,
  List,
  Plus,
  Rows2,
  SlidersHorizontal,
  Star,
  Tag,
} from "lucide-react";
import CollectionDialog from "../components/CollectionDialog";
import LinkDialog from "../components/LinkDialog";
import WorkspaceLinkItem from "../components/WorkspaceLinkItem";
import { useWorkspace } from "../lib/workspaceContext";
import type { Collection } from "../lib/workspaceTypes";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const {
    collections,
    links,
    error,
    addCollection,
    renameCollection,
    deleteCollection,
    addLink,
    updateLink,
    deleteLink,
    toggleSavedForLater,
  } = useWorkspace();
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [defaultCollectionId, setDefaultCollectionId] = useState<string | null>(null);

  const editingLink = links.find((link) => link.id === editingLinkId);
  const unassignedLinks = links.filter((link) => link.collectionId === null);

  function openNewCollection() {
    setEditingCollection(null);
    setCollectionDialogOpen(true);
  }

  function openNewLink(collectionId: string | null = null) {
    setEditingLinkId(null);
    setDefaultCollectionId(collectionId);
    setLinkDialogOpen(true);
  }

  function openEditLink(id: string) {
    setEditingLinkId(id);
    setLinkDialogOpen(true);
  }

  function renderLink(linkId: string) {
    const link = links.find((item) => item.id === linkId);
    if (!link) return null;
    return (
      <WorkspaceLinkItem
        key={link.id}
        link={link}
        onEdit={() => openEditLink(link.id)}
        onDelete={() => {
          if (window.confirm(`Delete "${link.title}"?`)) deleteLink(link.id);
        }}
        onToggleSavedForLater={() => toggleSavedForLater(link.id)}
      />
    );
  }

  function renderCollection(collection: Collection) {
    const collectionLinks = links.filter((link) => link.collectionId === collection.id);
    return (
      <section className="collection-card" key={collection.id} aria-labelledby={`collection-${collection.id}`}>
        <header className="collection-card-header">
          <div>
            <h2 id={`collection-${collection.id}`}>{collection.name}</h2>
            <span>{collectionLinks.length} {collectionLinks.length === 1 ? "link" : "links"}</span>
          </div>
          <div className="collection-card-actions">
            <button
              type="button"
              onClick={() => {
                setEditingCollection(collection);
                setCollectionDialogOpen(true);
              }}
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${collection.name}"? Its links will be kept without a collection.`)) {
                  deleteCollection(collection.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        </header>
        <div className="collection-link-list">
          {collectionLinks.map((link) => renderLink(link.id))}
          <button
            className="collection-add-link"
            type="button"
            onClick={() => openNewLink(collection.id)}
          >
            <Plus size={15} /> Add a link
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="title">
          <span className="eyebrow">Your library</span>
          <div className="title-row">
            <h1>My Collections</h1>
            <span className="collection-count">
              {collections.length} {collections.length === 1 ? "collection" : "collections"}
            </span>
          </div>
        </div>
      </header>
      <nav className="toolbar">
        <div className="filters">
          <DropdownMenu>
            <DropdownTrigger asChild>
              <button className="filter-trigger" type="button">
                <SlidersHorizontal size={15} />
                Drag & drop
                <ChevronDown size={13} className="chevron" />
              </button>
            </DropdownTrigger>
            <DropdownPortal>
              <DropdownContent className="dropdown-content" sideOffset={6} align="start">
                <DropdownItem className="dropdown-item"><GripVertical size={16} /> Drag & Drop</DropdownItem>
                <DropdownItem className="dropdown-item"><ArrowDownAZ size={16} /> Alphabetical</DropdownItem>
                <DropdownItem className="dropdown-item"><Star size={16} /> Starred To Top</DropdownItem>
                <DropdownItem className="dropdown-item"><Calendar size={16} /> Date Created</DropdownItem>
              </DropdownContent>
            </DropdownPortal>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownTrigger asChild>
              <button className="filter-trigger" type="button">
                <Tag size={15} />
                Tag filter
                <ChevronDown size={13} className="chevron" />
              </button>
            </DropdownTrigger>
            <DropdownPortal>
              <DropdownContent className="dropdown-content" sideOffset={6} align="start">
                <DropdownItem className="dropdown-item">Clear All Tags</DropdownItem>
                <DropdownItem className="dropdown-item"><BookmarkX size={16} /> No Label</DropdownItem>
              </DropdownContent>
            </DropdownPortal>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownTrigger asChild>
              <button className="filter-trigger" type="button">
                <LayoutGrid size={15} />
                View
                <ChevronDown size={13} className="chevron" />
              </button>
            </DropdownTrigger>
            <DropdownPortal>
              <DropdownContent className="dropdown-content" sideOffset={6} align="start">
                <DropdownItem className="dropdown-item"><LayoutGrid size={16} /> Card</DropdownItem>
                <DropdownItem className="dropdown-item"><Rows2 size={16} /> Compact</DropdownItem>
                <DropdownItem className="dropdown-item"><List size={16} /> List</DropdownItem>
                <DropdownItem className="dropdown-item"><Grid size={16} /> Grid</DropdownItem>
              </DropdownContent>
            </DropdownPortal>
          </DropdownMenu>
        </div>
        <div className="dashboard-add-actions">
          <button className="add-btn" type="button" onClick={() => openNewLink()}>
            <Plus size={15} /> Add link
          </button>
          <button className="add-btn" type="button" onClick={openNewCollection}>
            <FolderPlus size={15} /> Add collection
          </button>
        </div>
      </nav>
      <main className="content">
        {error && <p className="workspace-data-error" role="alert">{error}</p>}
        {collections.length === 0 && links.length === 0 ? (
          <div className="empty-state">
            <div className="empty-copy">
              <h2>Your library is ready</h2>
              <p>Create a collection to organize your links, or add a link directly.</p>
            </div>
            <button className="fab-btn" type="button" aria-label="Add your first collection" onClick={openNewCollection}>
              <Plus size={21} />
            </button>
          </div>
        ) : (
          <div className="collection-grid">
            {collections.map(renderCollection)}
            {unassignedLinks.length > 0 && (
              <section className="collection-card" aria-labelledby="unassigned-heading">
                <header className="collection-card-header">
                  <div>
                    <h2 id="unassigned-heading">Unsorted links</h2>
                    <span>{unassignedLinks.length} {unassignedLinks.length === 1 ? "link" : "links"}</span>
                  </div>
                </header>
                <div className="collection-link-list">
                  {unassignedLinks.map((link) => renderLink(link.id))}
                  <button className="collection-add-link" type="button" onClick={() => openNewLink()}>
                    <Plus size={15} /> Add a link
                  </button>
                </div>
              </section>
            )}
            <button className="new-collection-card" type="button" onClick={openNewCollection}>
              <FolderPlus size={19} /> New collection
            </button>
          </div>
        )}
      </main>
      <CollectionDialog
        open={collectionDialogOpen}
        initialName={editingCollection?.name}
        onOpenChange={(open) => {
          setCollectionDialogOpen(open);
          if (!open) setEditingCollection(null);
        }}
        onSave={(name) => {
          if (editingCollection) renameCollection(editingCollection.id, name);
          else addCollection(name);
        }}
      />
      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={(open) => {
          setLinkDialogOpen(open);
          if (!open) setEditingLinkId(null);
        }}
        collections={collections}
        initialLink={editingLink}
        defaultCollectionId={defaultCollectionId}
        mode="library"
        onSaveLink={(input) => {
          if (editingLink) updateLink(editingLink.id, input);
          else addLink(input);
        }}
      />
    </div>
  );
}
