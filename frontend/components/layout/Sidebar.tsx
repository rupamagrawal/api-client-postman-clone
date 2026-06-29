"use client";

import React, { useState } from "react";
import { Search, Folder, ChevronRight, ChevronDown, MoreVertical, Plus, Trash2, Edit, FolderPlus, History as HistoryIcon, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";
import MethodBadge from "../shared/MethodBadge";
import {
  deleteCollection,
  getCollections,
  deleteRequest,
  clearHistory,
  deleteHistory,
  getHistory,
  updateCollection,
} from "../../lib/api";
import { timeAgo } from "../../lib/utils";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import { Collection, SavedRequest } from "../../types";

export default function Sidebar() {
  const {
    sidebarTab,
    setSidebarTab,
    collections,
    setCollections,
    history,
    setHistory,
    addTab,
    setNewCollectionModalOpen,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Deletion Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: "collection" | "request" | "history" | "history_all";
  } | null>(null);

  const toggleCollection = (colId: string) => {
    setExpandedCols((prev) => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  const handleRenameCollection = async (id: string, currentName: string) => {
    const name = window.prompt("Rename Collection:", currentName);
    if (!name || name.trim() === currentName) return;
    try {
      await updateCollection(id, { name: name.trim() });
      const cols = await getCollections();
      setCollections(cols);
      toast.success("Collection renamed!");
    } catch (e) {
      toast.error("Failed to rename collection");
    }
  };

  // Open deletion confirm modal for collection
  const promptDeleteCollection = (id: string, name: string) => {
    setDeleteTarget({ id, name, type: "collection" });
    setDeleteModalOpen(true);
  };

  // Open deletion confirm modal for request
  const promptDeleteRequest = (id: string, name: string) => {
    setDeleteTarget({ id, name, type: "request" });
    setDeleteModalOpen(true);
  };

  // Open deletion confirm modal for clearing all history
  const promptClearHistory = () => {
    setDeleteTarget({ id: "", name: "all search runs", type: "history_all" });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "collection") {
        await deleteCollection(deleteTarget.id);
        const cols = await getCollections();
        setCollections(cols);
        toast.success("Collection deleted");
      } else if (deleteTarget.type === "request") {
        await deleteRequest(deleteTarget.id);
        const cols = await getCollections();
        setCollections(cols);
        toast.success("Request deleted");
      } else if (deleteTarget.type === "history_all") {
        await clearHistory();
        setHistory([]);
        toast.success("History cleared");
      }
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
      toast.error("Deletion failed");
    }
  };

  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteHistory(id);
      const hist = await getHistory();
      setHistory(hist);
      toast.success("History item deleted");
    } catch (err) {
      toast.error("Failed to delete history item");
    }
  };

  // Export collection as Postman v2.1 JSON
  const handleExportCollection = (col: Collection) => {
    try {
      const data = {
        info: {
          name: col.name,
          schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: col.requests.map((r) => ({
          name: r.name,
          request: {
            method: r.method,
            url: { raw: r.url },
            header: Object.entries(r.headers || {}).map(([k, v]) => ({ key: k, value: v })),
            body: r.bodyType === "raw" ? { mode: "raw", raw: r.bodyContent } : undefined
          }
        }))
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${col.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.postman_collection.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Collection exported!");
    } catch (err) {
      toast.error("Failed to export collection");
    }
  };

  const handleRequestClick = (request: any) => {
    addTab({
      savedRequest: request,
    });
  };

  const handleHistoryClick = (entry: any) => {
    const mapRecordToRows = (record: Record<string, string> | null | undefined): KeyValueRow[] => {
      const rows = Object.entries(record || {}).map(([key, value]) => ({
        id: Math.random().toString(),
        enabled: true,
        key,
        value,
        description: "",
      }));
      rows.push({ id: Math.random().toString(), enabled: true, key: "", value: "", description: "" });
      return rows;
    };

    const getTabNameFromUrl = (urlStr: string): string => {
      if (!urlStr || !urlStr.trim()) return "Untitled Request";
      const cleanUrl = urlStr.split("?")[0].replace(/\/+$/, "");
      const parts = cleanUrl.split("/");
      const lastSegment = parts[parts.length - 1];
      if (lastSegment && !lastSegment.startsWith("http:") && !lastSegment.startsWith("https:")) {
        return lastSegment;
      }
      return urlStr;
    };

    addTab({
      name: getTabNameFromUrl(entry.url),
      method: entry.method,
      url: entry.url,
      params: mapRecordToRows(entry.params),
      headers: mapRecordToRows(entry.headers),
      bodyType: entry.bodyType || "none",
      bodyContent: entry.bodyContent || "",
      bodyRows: [{ id: Math.random().toString(), enabled: true, key: "", value: "", description: "" }],
      authType: entry.authType || "none",
      authConfig: entry.authConfig || {},
      isDirty: false,
    });
  };

  // Filter collections and their nested requests based on searchQuery
  const filteredCollections = React.useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const query = searchQuery.trim().toLowerCase();
    return collections
      .map((col) => {
        const matchesColName = col.name.toLowerCase().includes(query);
        const filteredReqs = col.requests.filter(
          (r) => r.name.toLowerCase().includes(query)
        );
        
        if (matchesColName) {
          return col;
        } else if (filteredReqs.length > 0) {
          return {
            ...col,
            requests: filteredReqs,
          };
        }
        return null;
      })
      .filter(Boolean) as Collection[];
  }, [collections, searchQuery]);

  // Filter history entries based on query
  const filteredHistory = history.filter(
    (h) =>
      h.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 h-full bg-sidebar border-r border-border flex flex-col text-sm select-none z-30 flex-none overflow-hidden">
      {/* Sidebar Tabs - Collections / History */}
      <div className="flex border-b border-border h-10 flex-none bg-sidebar">
        <button
          onClick={() => setSidebarTab("collections")}
          className={`flex-1 text-center font-semibold text-xs tracking-wide transition-all border-b-2 flex items-center justify-center ${
            sidebarTab === "collections"
              ? "border-accent text-white"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Folder className="w-3.5 h-3.5 mr-1.5" />
          <span>Collections</span>
        </button>
        <button
          onClick={() => setSidebarTab("history")}
          className={`flex-1 text-center font-semibold text-xs tracking-wide transition-all border-b-2 flex items-center justify-center ${
            sidebarTab === "history"
              ? "border-accent text-white"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <HistoryIcon className="w-3.5 h-3.5 mr-1.5" />
          <span>History</span>
        </button>
      </div>

      {/* Main Workspace content */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
        {/* Search input bar */}
        <div className="relative flex-none">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-text-secondary" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-panel text-text-primary pl-8 pr-3 py-1.5 rounded border border-border text-xs focus:border-accent focus:outline-none transition-all placeholder-text-secondary/60"
          />
        </div>

        {/* Orange "+ New Collection" Button (Only shown in Collections tab) */}
        {sidebarTab === "collections" && (
          <button
            onClick={() => setNewCollectionModalOpen(true)}
            className="flex-none bg-accent hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-xs py-1.5 rounded flex items-center justify-center space-x-1.5 transition-colors shadow-md w-full"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        )}

        {/* Collections Tree or History List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {sidebarTab === "collections" ? (
            <div className="space-y-1">
              {filteredCollections.length === 0 ? (
                <div className="text-center py-10 text-xs text-text-secondary italic">
                  No collections found
                </div>
              ) : (
                filteredCollections.map((col) => {
                  const isExpanded = searchQuery.trim() !== "" ? true : !!expandedCols[col.id];
                  const isMenuOpen = activeMenuId === col.id;

                  return (
                    <div key={col.id} className="space-y-0.5">
                      {/* Collection Accordion Header Row */}
                      <div className="group flex items-center justify-between px-2 py-1.5 hover:bg-panel rounded cursor-pointer transition-colors text-text-primary">
                        <div
                          onClick={() => toggleCollection(col.id)}
                          className="flex items-center space-x-2 flex-1 min-w-0"
                        >
                          <span className="text-text-secondary hover:text-text-primary p-0.5 rounded transition-all">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                          </span>
                          <Folder className="w-4 h-4 text-accent/80 flex-shrink-0" />
                          <span className="font-semibold truncate text-xs text-text-primary">{col.name}</span>
                        </div>

                        {/* Dropdown Menu trigger */}
                        <div className="relative flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : col.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-border/40 text-text-secondary hover:text-text-primary transition-all"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 mt-5 w-32 bg-panel border border-border rounded shadow-xl py-1 z-50">
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleRenameCollection(col.id, col.name);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-text-primary hover:bg-border/30 transition-colors flex items-center space-x-2"
                                >
                                  <Edit className="w-3 h-3 text-text-secondary" />
                                  <span>Rename</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleExportCollection(col);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-text-primary hover:bg-border/30 transition-colors flex items-center space-x-2"
                                >
                                  <Download className="w-3 h-3 text-text-secondary" />
                                  <span>Export</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    promptDeleteCollection(col.id, col.name);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-status-error hover:bg-status-error/10 transition-colors flex items-center space-x-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Nesting Request Sub-Items */}
                      {isExpanded && (
                        <div className="pl-3 border-l border-border/40 ml-3.5 space-y-0.5">
                          {col.requests.length === 0 ? (
                            <div className="py-1.5 px-3 text-[10px] text-text-secondary italic">
                              Empty collection
                            </div>
                          ) : (
                            col.requests.map((req) => {
                              const isReqMenuOpen = activeMenuId === req.id;
                              return (
                                <div
                                  key={req.id}
                                  onClick={() => handleRequestClick(req)}
                                  className="group/req flex items-center justify-between px-2 py-1 hover:bg-panel rounded cursor-pointer transition-colors text-xs text-text-secondary hover:text-text-primary"
                                >
                                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                                    <MethodBadge method={req.method} size="sm" />
                                    <span className="truncate text-text-primary">{req.name}</span>
                                  </div>

                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(isReqMenuOpen ? null : req.id);
                                      }}
                                      className="opacity-0 group-hover/req:opacity-100 p-0.5 rounded hover:bg-border/40 text-text-secondary hover:text-text-primary transition-all"
                                    >
                                      <MoreVertical className="w-3 h-3" />
                                    </button>

                                    {isReqMenuOpen && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-40"
                                          onClick={() => setActiveMenuId(null)}
                                        />
                                        <div className="absolute right-0 mt-5 w-28 bg-panel border border-border rounded shadow-xl py-1 z-50">
                                          <button
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              handleRequestClick(req);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-xs text-text-primary hover:bg-border/30 transition-colors flex items-center space-x-1.5"
                                          >
                                            <Edit className="w-3.5 h-3.5 text-text-secondary" />
                                            <span>Open</span>
                                          </button>
                                          <button
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              promptDeleteRequest(req.id, req.name);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-xs text-status-error hover:bg-status-error/10 transition-colors flex items-center space-x-1.5"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Delete</span>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-2">
              {filteredHistory.length > 0 && (
                <div className="flex justify-between items-center px-1 flex-none">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                    Recent Runs
                  </span>
                  <button
                    onClick={promptClearHistory}
                    className="text-[10px] text-text-secondary hover:text-accent font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
              <div className="space-y-1 overflow-y-auto pr-1">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12 text-xs text-text-secondary leading-relaxed">
                    No history yet.<br />Send a request to get started.
                  </div>
                ) : (
                  filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleHistoryClick(item)}
                      className="group flex items-center justify-between p-2 hover:bg-panel rounded cursor-pointer transition-all border border-transparent hover:border-border"
                    >
                      <div className="flex flex-col min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <MethodBadge method={item.method} size="sm" />
                          <span className="truncate text-xs font-mono text-text-primary flex-1">
                            {item.url}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-text-secondary mt-0.5">
                          <span className={`px-1 rounded text-[9px] font-bold ${
                            item.responseStatus >= 200 && item.responseStatus < 300
                              ? "bg-method-get/10 text-method-get border border-method-get/20"
                              : item.responseStatus >= 400 && item.responseStatus < 500
                              ? "bg-method-post/10 text-method-post border border-method-post/20"
                              : "bg-method-delete/10 text-method-delete border border-method-delete/20"
                          }`}>
                            {item.responseStatus}
                          </span>
                          <span>•</span>
                          <span>{item.responseTimeMs} ms</span>
                          <span>•</span>
                          <span>{timeAgo(item.executedAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-border/30 text-text-secondary hover:text-status-error transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side-specific Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === "history_all"
            ? "Clear History"
            : `Delete ${deleteTarget?.type === "collection" ? "Collection" : "Request"}`
        }
        message={
          deleteTarget?.type === "history_all"
            ? "Are you sure you want to clear all request runs from your history? This cannot be undone."
            : `Are you sure you want to delete the ${deleteTarget?.type === "collection" ? "collection" : "request"} "${deleteTarget?.name}"?`
        }
      />
    </div>
  );
}
