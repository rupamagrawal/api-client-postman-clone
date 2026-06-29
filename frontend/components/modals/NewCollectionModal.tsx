"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";
import { createCollection, getCollections } from "../../lib/api";

export default function NewCollectionModal() {
  const {
    newCollectionModalOpen,
    setNewCollectionModalOpen,
    setCollections,
  } = useAppStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!newCollectionModalOpen) return null;

  const handleClose = () => {
    setName("");
    setDescription("");
    setNewCollectionModalOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    setLoading(true);
    try {
      await createCollection({ name: name.trim(), description: description.trim() });
      const cols = await getCollections();
      setCollections(cols);
      toast.success("Collection created!");
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create collection");
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
          <span className="text-white font-bold text-sm">Create a New Collection</span>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-white p-1 rounded hover:bg-border/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleCreate} className="p-4 space-y-4 text-xs">
          <div className="flex flex-col space-y-1.5">
            <label className="text-text-secondary font-medium">Name <span className="text-accent">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., User Management API"
              disabled={loading}
              className="bg-canvas border border-border text-text-primary px-3 py-2 rounded focus:border-accent focus:outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-text-secondary font-medium">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or details about this collection..."
              disabled={loading}
              className="bg-canvas border border-border text-text-primary px-3 py-2 rounded focus:border-accent focus:outline-none transition-all h-24 resize-none"
            />
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
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
