"use client";

import React, { useRef, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";
import MethodBadge from "../shared/MethodBadge";
import { updateRequest, getCollections } from "../../lib/api";
import { KeyValueRow, Tab } from "../../types";

export default function TabBar() {
  const {
    tabs,
    activeTabId,
    addTab,
    closeTab,
    setActiveTab,
    setTabIdToCloseAfterSave,
    setSaveRequestModalOpen,
    setCollections,
  } = useAppStore();

  const tabListRef = useRef<HTMLDivElement>(null);

  // Close Tab Confirmation Modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [tabToClose, setTabToClose] = useState<Tab | null>(null);

  // Auto-scroll to active tab when it changes
  useEffect(() => {
    if (tabListRef.current) {
      const activeElement = tabListRef.current.querySelector(
        `[data-tab-id="${activeTabId}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [activeTabId]);

  const handleCloseTabClick = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation();
    if (!tab.isDirty) {
      closeTab(tab.id);
    } else {
      setTabToClose(tab);
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmDiscard = () => {
    if (tabToClose) {
      closeTab(tabToClose.id);
    }
    setIsConfirmOpen(false);
    setTabToClose(null);
  };

  const handleConfirmSave = async () => {
    if (!tabToClose) return;

    if (tabToClose.savedRequestId) {
      // Direct update
      const rowsToRecord = (rows: KeyValueRow[]): Record<string, string> => {
        const record: Record<string, string> = {};
        (rows || []).forEach((row) => {
          if (row.enabled && row.key.trim() !== "") {
            record[row.key] = row.value;
          }
        });
        return record;
      };

      try {
        const payload = {
          name: tabToClose.name,
          method: tabToClose.method,
          url: tabToClose.url,
          headers: rowsToRecord(tabToClose.headers),
          params: rowsToRecord(tabToClose.params),
          bodyType: tabToClose.bodyType,
          bodyContent: tabToClose.bodyType === "raw" ? tabToClose.bodyContent : JSON.stringify(rowsToRecord(tabToClose.bodyRows)),
          authType: tabToClose.authType,
          authConfig: tabToClose.authConfig,
        };

        await updateRequest(tabToClose.savedRequestId, payload);
        
        // Refresh collections
        const cols = await getCollections();
        setCollections(cols);

        toast.success("Request updated!");
        closeTab(tabToClose.id);
      } catch (err) {
        toast.error("Failed to update request");
      }
    } else {
      // Open Save modal and flag it to close after save
      setTabIdToCloseAfterSave(tabToClose.id);
      setSaveRequestModalOpen(true);
    }
    
    setIsConfirmOpen(false);
    setTabToClose(null);
  };

  return (
    <div className="h-9 bg-panel border-b border-border flex items-center select-none overflow-hidden justify-between flex-none">
      {/* Scrollable Tab List */}
      <div
        ref={tabListRef}
        className="flex-1 flex items-end h-full overflow-x-auto overflow-y-hidden scrollbar-none custom-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const displayTitle = tab.name || tab.url || "Untitled Request";
          
          return (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 h-[34px] px-3 border-r border-border cursor-pointer transition-all flex-shrink-0 text-xs ${
                isActive
                  ? "bg-canvas text-white border-t-2 border-t-accent font-semibold"
                  : "bg-panel text-text-secondary hover:bg-canvas/40 hover:text-text-primary"
              }`}
            >
              {/* Method badge (tiny) */}
              <MethodBadge method={tab.method} size="sm" />
              
              {/* Request name / URL */}
              <span className="max-w-[120px] truncate leading-none">
                {displayTitle}
              </span>
              
              {/* Save State Indicator or Close Button */}
              {tab.isDirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              )}
              
              <button
                onClick={(e) => handleCloseTabClick(e, tab)}
                className="p-0.5 rounded hover:bg-border/60 text-text-secondary hover:text-text-primary transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Plus new tab button pinned at the far right */}
      <button
        onClick={() => addTab()}
        className="h-9 w-9 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-canvas/50 transition-all border-l border-border flex-shrink-0"
        title="New Tab"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Radix UI Dialog Close Tab Confirmation overlay */}
      <Dialog.Root open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-panel border border-border rounded shadow-2xl p-5 w-full max-w-sm z-[160] focus:outline-none animate-in fade-in zoom-in-95 duration-150 select-none">
            <Dialog.Title className="text-white font-bold text-sm mb-1.5">Unsaved Changes</Dialog.Title>
            <Dialog.Description className="text-text-secondary text-xs mb-5">
              You have unsaved changes. Do you want to save them before closing this tab?
            </Dialog.Description>
            <div className="flex items-center justify-end space-x-2 text-xs">
              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setTabToClose(null);
                }}
                className="px-3.5 py-1.5 text-text-secondary hover:text-text-primary rounded font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="px-3.5 py-1.5 border border-status-error/40 hover:bg-status-error/10 text-status-error rounded font-semibold transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-1.5 bg-accent hover:bg-orange-600 text-white rounded font-semibold transition-colors"
              >
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
