"use client";

import React, { useEffect } from "react";
import toast from "react-hot-toast";
import TopBar from "../components/layout/TopBar";
import Sidebar from "../components/layout/Sidebar";
import TabBar from "../components/layout/TabBar";
import RequestPanel from "../components/request/RequestPanel";
import NewCollectionModal from "../components/modals/NewCollectionModal";
import SaveRequestModal from "../components/modals/SaveRequestModal";
import EnvironmentModal from "../components/modals/EnvironmentModal";
import ImportModal from "../components/modals/ImportModal";
import GlobalSearchModal from "../components/modals/GlobalSearchModal";
import { useAppStore } from "../lib/store";
import { getCollections, getEnvironments, getHistory } from "../lib/api";

export default function Home() {
  const {
    setCollections,
    setEnvironments,
    setHistory,
    addTab,
    closeTab,
    activeTabId,
    setGlobalSearchOpen,
    setActiveEnv,
    setCollectionsLoading,
  } = useAppStore();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;
    
    const loadData = async () => {
      try {
        const [collections, environments, history] = await Promise.all([
          getCollections(),
          getEnvironments(),
          getHistory()
        ]);
        setCollections(collections);
        setEnvironments(environments);
        setHistory(history);
        if (environments.length > 0) setActiveEnv(environments[0].id);
        setCollectionsLoading(false);
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(loadData, 3000);
        }
      }
    };
    
    loadData();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        toast("Ask AI is coming soon!", { icon: "🚀" });
      }

      if (e.ctrlKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }

      if (e.ctrlKey) {
        if (e.key === "Enter") {
          e.preventDefault();
          const sendBtn = document.getElementById("send-request-btn");
          if (sendBtn) {
            sendBtn.click();
          }
        } else if (e.key === "t" || e.key === "T") {
          e.preventDefault();
          addTab();
        } else if (e.key === "w" || e.key === "W") {
          e.preventDefault();
          closeTab(activeTabId);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => {
      window.removeEventListener("keydown", handleGlobalShortcuts);
    };
  }, [activeTabId, addTab, closeTab]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-canvas text-text-primary select-none">
      {/* Top Header - Full Width */}
      <TopBar />

      {/* Main Container - Split Side & Work Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed width navigation */}
        <Sidebar />

        {/* Right workspace panel */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tab Navigation */}
          <TabBar />

          {/* Main workspace request-response editor */}
          <RequestPanel />
        </div>
      </div>

      {/* Modals Overlays */}
      <NewCollectionModal />
      <SaveRequestModal />
      <EnvironmentModal />
      <ImportModal />
      <GlobalSearchModal />
    </div>
  );
}
