"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";
import { saveRequest, getCollections } from "../../lib/api";
import { KeyValueRow } from "../../types";

export default function SaveRequestModal() {
  const {
    saveRequestModalOpen,
    setSaveRequestModalOpen,
    collections,
    setCollections,
    tabs,
    activeTabId,
    updateTab,
    tabIdToCloseAfterSave,
    closeTab,
    setTabIdToCloseAfterSave,
  } = useAppStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const [name, setName] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [loading, setLoading] = useState(false);

  // Set initial default name when tab changes
  useEffect(() => {
    if (activeTab) {
      setName(activeTab.name || "Untitled Request");
    }
  }, [activeTab, saveRequestModalOpen]);

  if (!saveRequestModalOpen || !activeTab) return null;

  const handleClose = () => {
    setName("");
    setCollectionId("");
    setSaveRequestModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Request name is required");
      return;
    }
    if (!collectionId) {
      toast.error("Please select a collection to save into");
      return;
    }

    // Helper to map rows to record dictionary
    const rowsToRecord = (rows: KeyValueRow[]): Record<string, string> => {
      const record: Record<string, string> = {};
      (rows || []).forEach((row) => {
        if (row.enabled && row.key.trim() !== "") {
          record[row.key] = row.value;
        }
      });
      return record;
    };

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        method: activeTab.method,
        url: activeTab.url,
        headers: rowsToRecord(activeTab.headers),
        params: rowsToRecord(activeTab.params),
        bodyType: activeTab.bodyType,
        bodyContent: activeTab.bodyType === "raw" ? activeTab.bodyContent : JSON.stringify(rowsToRecord(activeTab.bodyRows)),
        authType: activeTab.authType,
        authConfig: activeTab.authConfig,
      };

      const savedReq = await saveRequest(collectionId, payload);
      
      // Update collections store
      const cols = await getCollections();
      setCollections(cols);

      // Update active tab status
      updateTab(activeTab.id, {
        name: savedReq.name,
        savedRequestId: savedReq.id,
        isDirty: false,
      });

      toast.success("Request saved!");
      handleClose();

      // Trigger automatic tab close if flagged
      if (tabIdToCloseAfterSave === activeTab.id) {
        closeTab(activeTab.id);
        setTabIdToCloseAfterSave(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-md bg-panel border border-border rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar/50">
          <span className="text-white font-bold text-sm">Save Request</span>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-white p-1 rounded hover:bg-border/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} className="p-4 space-y-4 text-xs">
          <div className="flex flex-col space-y-1.5">
            <label className="text-text-secondary font-medium">Request Name <span className="text-accent">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Get Users"
              disabled={loading}
              className="bg-canvas border border-border text-text-primary px-3 py-2 rounded focus:border-accent focus:outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-text-secondary font-medium">Select Collection <span className="text-accent">*</span></label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              disabled={loading}
              className="bg-canvas border border-border text-text-primary px-3 py-2 rounded focus:border-accent focus:outline-none transition-all cursor-pointer"
            >
              <option value="">-- Choose Collection --</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Modal Footer / Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary rounded transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent hover:bg-orange-600 active:bg-orange-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
