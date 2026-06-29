"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Settings, Plus, ArrowDownToLine, Rocket, Check, Search } from "lucide-react";
import NewRequestDropdown from "./NewRequestDropdown";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";
import { createCollection, saveRequest, getCollections } from "../../lib/api";
import AppSettingsModal from "../modals/AppSettingsModal";

export default function TopBar() {
  const {
    environments,
    activeEnvId,
    setActiveEnv,
    setEnvironmentModalOpen,
    addTab,
    setCollections,
    setImportModalOpen,
    setGlobalSearchOpen,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAppSettingsModalOpen, setIsAppSettingsModalOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const newDropdownRef = useRef<HTMLDivElement>(null);

  const activeEnv = environments.find((e) => e.id === activeEnvId);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (newDropdownRef.current && !newDropdownRef.current.contains(event.target as Node)) {
        setIsNewOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleComingSoon = (feature: string) => {
    toast(`${feature} is coming soon!`, {
      icon: "🚀",
    });
  };

  const handleManageEnvironments = () => {
    setIsOpen(false);
    setEnvironmentModalOpen(true);
  };

  const handleNewTab = () => {
    addTab();
  };

  const handleImportClick = () => {
    setImportModalOpen(true);
  };

  return (
    <div className="h-12 bg-sidebar border-b border-border flex items-center justify-between px-4 text-sm select-none z-40 flex-none">
      {/* Left: Branding & Small Action Buttons */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 cursor-pointer">
          <Rocket className="w-5 h-5 text-accent fill-accent" />
          <span className="text-white font-bold text-base tracking-normal">Postman</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Real Add Tab Button with Dropdown */}
          <div className="relative" ref={newDropdownRef}>
            <button
              onClick={() => setIsNewOpen(!isNewOpen)}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary rounded transition-all font-medium bg-panel/30"
            >
              <Plus className="w-3.5 h-3.5 text-text-secondary" />
              <span>New</span>
            </button>
            {isNewOpen && (
              <NewRequestDropdown onClose={() => setIsNewOpen(false)} />
            )}
          </div>
          
          {/* File Import Trigger */}
          <button
            onClick={handleImportClick}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary rounded transition-all font-medium bg-panel/30"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-text-secondary" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="absolute left-1/2 transform -translate-x-1/2 z-30">
        <div
          onClick={() => setGlobalSearchOpen(true)}
          className="relative flex items-center bg-sidebar border border-border rounded px-3 gap-2 w-96 h-8 cursor-pointer hover:border-text-secondary"
        >
          <Search size={14} className="text-text-secondary flex-none" />
          <span className="text-text-secondary text-sm flex-1 truncate">
            Search Postman (append &gt; to see and run commands)
          </span>
          <kbd className="text-xs text-text-secondary border border-border rounded px-1 py-0.5 font-mono flex-none">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right: Environment Selector & Settings dropdown */}
      <div className="flex items-center space-x-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-panel border border-border text-text-primary rounded hover:border-text-secondary transition-all text-xs font-medium"
          >
            <span className="max-w-[120px] truncate text-text-secondary">
              {activeEnv ? activeEnv.name : "No Environment"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-panel border border-border rounded shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Environments
              </div>
              
              <button
                onClick={() => {
                  setActiveEnv(null);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-border/30 transition-colors flex items-center justify-between ${
                  activeEnvId === null ? "text-accent font-medium bg-border/10" : "text-text-primary"
                }`}
              >
                <span>No Environment</span>
                {activeEnvId === null && <Check className="w-3.5 h-3.5 text-accent" />}
              </button>

              {environments.map((env) => (
                <button
                  key={env.id}
                  onClick={() => {
                    setActiveEnv(env.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-border/30 transition-colors flex items-center justify-between ${
                    activeEnvId === env.id ? "text-accent font-medium bg-border/10" : "text-text-primary"
                  }`}
                >
                  <span className="truncate">{env.name}</span>
                  {activeEnvId === env.id && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              ))}

              <div className="border-t border-border my-1" />

              <button
                onClick={handleManageEnvironments}
                className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-border/30 transition-colors flex items-center space-x-2"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Manage Environments</span>
              </button>
            </div>
          )}
        </div>

        {/* Gear Settings menu */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-panel rounded transition-all border border-border bg-panel"
          >
            <Settings className="w-4 h-4 text-text-secondary" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-panel border border-border rounded shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsAppSettingsModalOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-border/30 transition-colors text-text-primary flex items-center justify-between font-medium"
              >
                <span>App settings</span>
                <span className="text-[10px] text-text-secondary font-mono">Ctrl+,</span>
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  handleComingSoon("Workspace settings");
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-border/30 transition-colors text-text-primary font-medium"
              >
                Workspace settings
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  handleComingSoon("Team settings");
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-border/30 transition-colors text-text-primary font-medium"
              >
                Team settings
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  handleComingSoon("Account settings");
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-border/30 transition-colors text-text-primary font-medium"
              >
                Account settings
              </button>

              <div className="border-t border-border my-1" />

              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  handleComingSoon("Help menu");
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-border/30 transition-colors text-text-primary font-medium"
              >
                Help
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Settings modal overlay */}
      <AppSettingsModal
        isOpen={isAppSettingsModalOpen}
        onClose={() => setIsAppSettingsModalOpen(false)}
      />
    </div>
  );
}
