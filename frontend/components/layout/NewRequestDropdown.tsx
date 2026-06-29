"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Bot,
  Globe,
  GitBranch,
  Sparkles,
  FolderPlus,
  Settings2,
  Terminal,
  Activity,
  Radio,
  Zap,
  Wifi,
  FileCode,
  Layers,
  Link2,
  GitFork,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";

interface NewRequestDropdownProps {
  onClose: () => void;
}

export default function NewRequestDropdown({ onClose }: NewRequestDropdownProps) {
  const { addTab, setNewCollectionModalOpen, setEnvironmentModalOpen } = useAppStore();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleComingSoon = (feature: string) => {
    toast(`${feature} is coming soon!`, { icon: "🚀" });
    onClose();
  };

  const sections = useMemo(() => {
    const items = [
      // Section 1
      {
        label: "Ask AI",
        icon: <Bot className="w-4 h-4 text-text-secondary" />,
        shortcut: "Ctrl+Alt+P",
        onClick: () => handleComingSoon("Ask AI"),
        section: 1,
      },
      // Section 2
      {
        label: "HTTP",
        icon: <Globe className="w-4 h-4 text-method-get" />,
        onClick: () => {
          addTab();
          onClose();
        },
        section: 2,
      },
      {
        label: "GraphQL",
        icon: <GitBranch className="w-4 h-4 text-method-put" />,
        onClick: () => handleComingSoon("GraphQL"),
        section: 2,
      },
      {
        label: "AI",
        icon: <Sparkles className="w-4 h-4 text-status-warning" />,
        onClick: () => handleComingSoon("AI Integration"),
        section: 2,
      },
      {
        label: "MCP",
        icon: <Terminal className="w-4 h-4 text-text-primary" />,
        onClick: () => handleComingSoon("MCP"),
        section: 2,
      },
      {
        label: "gRPC",
        icon: <Activity className="w-4 h-4 text-method-patch" />,
        onClick: () => handleComingSoon("gRPC"),
        section: 2,
      },
      {
        label: "WebSocket",
        icon: <Radio className="w-4 h-4 text-method-post" />,
        onClick: () => handleComingSoon("WebSocket"),
        section: 2,
      },
      {
        label: "Socket.IO",
        icon: <Zap className="w-4 h-4 text-status-warning" />,
        onClick: () => handleComingSoon("Socket.IO"),
        section: 2,
      },
      {
        label: "MQTT",
        icon: <Wifi className="w-4 h-4 text-method-put" />,
        onClick: () => handleComingSoon("MQTT"),
        section: 2,
      },
      // Section 3
      {
        label: "Collection",
        icon: <FolderPlus className="w-4 h-4 text-accent" />,
        onClick: () => {
          setNewCollectionModalOpen(true);
          onClose();
        },
        section: 3,
      },
      {
        label: "Environment",
        icon: <Settings2 className="w-4 h-4 text-text-primary" />,
        onClick: () => {
          setEnvironmentModalOpen(true);
          onClose();
        },
        section: 3,
      },
      {
        label: "Spec",
        icon: <FileCode className="w-4 h-4 text-text-secondary" />,
        onClick: () => handleComingSoon("Spec"),
        section: 3,
      },
      {
        label: "Mock",
        icon: <Layers className="w-4 h-4 text-text-secondary" />,
        onClick: () => handleComingSoon("Mock Server"),
        section: 3,
      },
      {
        label: "Monitor",
        icon: <Activity className="w-4 h-4 text-text-secondary" />,
        onClick: () => handleComingSoon("Monitor"),
        section: 3,
      },
      {
        label: "Webhook",
        icon: <Link2 className="w-4 h-4 text-text-secondary" />,
        onClick: () => handleComingSoon("Webhook"),
        section: 3,
      },
      {
        label: "Flow",
        icon: <GitFork className="w-4 h-4 text-text-secondary" />,
        onClick: () => handleComingSoon("Flow"),
        section: 3,
      },
    ];

    const filtered = items.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );

    const s1 = filtered.filter((i) => i.section === 1);
    const s2 = filtered.filter((i) => i.section === 2);
    const s3 = filtered.filter((i) => i.section === 3);

    return { s1, s2, s3 };
  }, [search, addTab, setNewCollectionModalOpen, setEnvironmentModalOpen]);

  return (
    <div className="absolute left-0 mt-1.5 w-60 bg-sidebar border border-border rounded shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans select-none text-xs">
      <div className="px-2 py-1.5">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-canvas text-text-primary px-2.5 py-1.5 rounded border border-border focus:border-accent focus:outline-none transition-all text-xs font-sans"
        />
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {sections.s1.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full text-left px-3 py-2 hover:bg-canvas transition-colors flex items-center justify-between text-text-primary"
          >
            <div className="flex items-center space-x-2.5">
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="text-[10px] text-text-secondary font-mono">{item.shortcut}</span>
            )}
          </button>
        ))}

        {sections.s2.length > 0 && sections.s1.length > 0 && (
          <div className="border-t border-border my-1" />
        )}

        {sections.s2.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full text-left px-3 py-2 hover:bg-canvas transition-colors flex items-center justify-between text-text-primary"
          >
            <div className="flex items-center space-x-2.5">
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
          </button>
        ))}

        {sections.s3.length > 0 && (sections.s1.length > 0 || sections.s2.length > 0) && (
          <div className="border-t border-border my-1" />
        )}

        {sections.s3.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full text-left px-3 py-2 hover:bg-canvas transition-colors flex items-center justify-between text-text-primary"
          >
            <div className="flex items-center space-x-2.5">
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
          </button>
        ))}

        {sections.s1.length === 0 && sections.s2.length === 0 && sections.s3.length === 0 && (
          <div className="px-3 py-3 text-center text-text-secondary italic text-[11px]">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}
