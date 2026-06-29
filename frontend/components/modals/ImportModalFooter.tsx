"use client";

import React from "react";
import toast from "react-hot-toast";

export default function ImportModalFooter() {
  const handleComingSoon = (feature: string) => {
    toast(`${feature} is coming soon!`, { icon: "🚀" });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border/40 text-xs">
      {/* Bottom Bar: Action Links */}
      <div className="flex justify-between items-center text-text-secondary px-1">
        <div className="flex space-x-4">
          <button
            onClick={() => handleComingSoon("Migration tools")}
            className="hover:text-text-primary transition-colors flex items-center"
          >
            Migrate to Postman <span className="ml-1 text-[8px]">▼</span>
          </button>
          <button
            onClick={() => handleComingSoon("Other Sources import")}
            className="hover:text-text-primary transition-colors flex items-center"
          >
            Other Sources <span className="ml-1 text-[8px]">▼</span>
          </button>
        </div>
        <a
          href="https://learning.postman.com/docs/getting-started/importing-and-exporting-data/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors flex items-center space-x-0.5"
        >
          <span>Learn more about importing data</span>
          <span className="text-[10px]">↗</span>
        </a>
      </div>

      {/* Bottom Blue Banner */}
      <div className="bg-blue-950/40 border border-blue-900/50 rounded-lg p-3.5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-500/25 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Work in Git <span className="text-[8px] font-medium font-sans">NEW</span>
            </span>
          </div>
          <p className="text-text-secondary text-[11px]">
            Manage collections and code together in Git
          </p>
        </div>
        <button
          onClick={() => handleComingSoon("Git integration")}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded font-semibold text-xs transition-colors shrink-0"
        >
          Connect local Git repo
        </button>
      </div>
    </div>
  );
}
