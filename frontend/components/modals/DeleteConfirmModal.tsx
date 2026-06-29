"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  loading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-sm bg-panel border border-border rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar/50 text-xs">
          <div className="flex items-center space-x-1.5 text-status-error font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-text-secondary hover:text-white p-1 rounded hover:bg-border/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          <p className="text-text-primary leading-relaxed">{message}</p>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary rounded transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-3.5 py-1.5 bg-status-error hover:bg-red-600 active:bg-red-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Deleting..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
