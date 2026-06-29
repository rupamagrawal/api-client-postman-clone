"use client";

import React from "react";
import { X, Info, Settings, ShieldAlert, Monitor, Sliders } from "lucide-react";

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSettingsModal({ isOpen, onClose }: AppSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-md bg-panel border border-border rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar/50 text-xs">
          <div className="flex items-center space-x-2 text-white font-bold">
            <Settings className="w-4 h-4 text-accent" />
            <span>App Settings</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white p-1 rounded hover:bg-border/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs text-text-primary overflow-y-auto max-h-[400px] custom-scrollbar">
          {/* Section: Theme selection */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              <Monitor className="w-3.5 h-3.5" />
              <span>Theme</span>
            </div>
            <div className="flex items-center space-x-4 pl-1">
              <label className="flex items-center space-x-2 cursor-pointer text-text-secondary hover:text-text-primary">
                <input
                  type="radio"
                  name="theme"
                  defaultChecked
                  className="accent-accent"
                  disabled
                />
                <span>Dark (Active)</span>
              </label>
              <label className="flex items-center space-x-2 text-text-secondary/50 cursor-not-allowed">
                <input type="radio" name="theme" className="accent-accent" disabled />
                <span>Light (Coming soon)</span>
              </label>
            </div>
          </div>

          {/* Section: Timeout settings */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>Request Limits</span>
            </div>
            <div className="flex flex-col space-y-1.5 pl-1">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Request timeout</span>
                <span className="text-[10px] text-text-secondary/60">seconds</span>
              </div>
              <input
                type="number"
                defaultValue={30}
                disabled
                className="bg-canvas border border-border/50 text-text-secondary px-3 py-1.5 rounded focus:outline-none w-24 cursor-not-allowed text-center font-mono"
              />
            </div>
          </div>

          {/* Section: Security settings */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Security</span>
            </div>
            <div className="flex items-center justify-between pl-1">
              <span className="text-text-secondary">SSL verification</span>
              <label className="relative inline-flex items-center cursor-not-allowed">
                <input type="checkbox" defaultChecked disabled className="sr-only peer" />
                <div className="w-9 h-5 bg-border/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent peer-checked:after:bg-white"></div>
              </label>
            </div>
          </div>

          {/* Section: Proxy settings */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Proxy</span>
            </div>
            <div className="flex items-center justify-between pl-1">
              <span className="text-text-secondary">Global Proxy</span>
              <span className="text-[10px] text-text-secondary/60 font-mono">No Proxy</span>
            </div>
          </div>

          {/* About Section */}
          <div className="pt-3 border-t border-border/40 space-y-1.5 text-center text-[10px] text-text-secondary">
            <div className="font-bold text-text-primary">ApiClient v1.0.0</div>
            <div>Built with Next.js 14 + Python FastAPI</div>
            <div>Evaluation Build • SDE Fullstack Internship</div>
          </div>
        </div>
      </div>
    </div>
  );
}
