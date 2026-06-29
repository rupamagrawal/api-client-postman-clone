"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";
import { timeAgo } from "../../lib/utils";
import MethodBadge from "../shared/MethodBadge";

export default function GlobalSearchModal() {
  const { globalSearchOpen, setGlobalSearchOpen, history, addTab } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (globalSearchOpen) {
      setSearchQuery("");
      // Set short timeout to let rendering finish before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [globalSearchOpen]);

  useEffect(() => {
    if (!globalSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGlobalSearchOpen(false);
      } else if (e.ctrlKey && e.shiftKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        toast("Commands list is coming soon!", { icon: "🚀" });
      } else if (e.ctrlKey && e.altKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        toast("Find in workspace is coming soon!", { icon: "🚀" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  const handleRecentClick = (entry: any) => {
    addTab({
      name: entry.url.replace(/^https?:\/\//, "").substring(0, 20) || "Request",
      method: entry.method,
      url: entry.url,
      params: [{ id: Math.random().toString(), enabled: true, key: "", value: "", description: "" }],
      headers: [{ id: Math.random().toString(), enabled: true, key: "", value: "", description: "" }],
      bodyType: "none",
      bodyContent: "",
      authType: "none",
      authConfig: {},
    });
    setGlobalSearchOpen(false);
  };

  const filteredHistory = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
    );
    const sliced = sorted.slice(0, 10);
    if (!searchQuery.trim()) return sliced;
    const q = searchQuery.toLowerCase();
    return sliced.filter(
      (h) => h.url.toLowerCase().includes(q) || h.method.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  if (!globalSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-xs select-none font-sans pt-16"
      onClick={() => setGlobalSearchOpen(false)}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-panel border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden text-xs text-text-primary animate-in fade-in slide-in-from-top-4 duration-150"
      >
        <div className="flex items-center px-3 py-2 border-b border-border space-x-2 bg-sidebar/30">
          <Search className="w-4 h-4 text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Postman (append > to see and run commands)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-text-primary focus:outline-none py-1 text-xs"
          />
        </div>

        <div className="flex items-center px-3 py-2 border-b border-border space-x-2.5 bg-sidebar/20 text-text-secondary">
          {["Visibility", "Type", "In", "By"].map((f) => (
            <button
              key={f}
              onClick={() => toast(`${f} filter is coming soon!`, { icon: "🚀" })}
              className="hover:text-text-primary transition-colors flex items-center bg-canvas/30 px-2 py-1 rounded border border-border/40"
            >
              <span>{f}</span>
              <span className="ml-1 text-[8px]">▼</span>
            </button>
          ))}
          <div className="flex-1" />
          <SlidersHorizontal className="w-3.5 h-3.5 hover:text-text-primary cursor-pointer transition-colors" />
        </div>

        <div className="max-h-96 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
          <button
            onClick={() => toast("Commands list is coming soon!", { icon: "🚀" })}
            className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-canvas rounded-md transition-colors text-left"
          >
            <span className="font-semibold text-text-primary">Show and run commands &gt;</span>
            <span className="text-[10px] text-text-secondary font-mono">Ctrl Shift P</span>
          </button>
          <button
            onClick={() => toast("Find in workspace is coming soon!", { icon: "🚀" })}
            className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-canvas rounded-md transition-colors text-left"
          >
            <span>
              Find in Workspace <span className="font-semibold text-text-primary">My Workspace</span>
            </span>
            <span className="text-[10px] text-text-secondary font-mono">Ctrl Alt K</span>
          </button>

          <div className="border-t border-border my-1.5" />
          <div className="px-2.5 py-1 text-[10px] text-text-secondary font-bold tracking-wider">
            RECENTLY VIEWED
          </div>

          {filteredHistory.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRecentClick(item)}
              className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-canvas rounded-md transition-colors text-left space-x-3"
            >
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                <MethodBadge method={item.method} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-text-primary truncate">{item.url}</p>
                  <p className="text-[10px] text-text-secondary truncate">My Workspace</p>
                </div>
              </div>
              <span className="text-[10px] text-text-secondary whitespace-nowrap">
                {timeAgo(item.executedAt)}
              </span>
            </button>
          ))}

          {filteredHistory.length === 0 && (
            <p className="text-center text-text-secondary italic py-4">No recent items match search</p>
          )}
        </div>
      </div>
    </div>
  );
}
