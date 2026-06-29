"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { ResponseData } from "../../types";
import PrettyView from "./PrettyView";
import HeadersView from "./HeadersView";
import { formatBytes, formatTime } from "../../lib/utils";

interface ResponseViewerProps {
  response: ResponseData | null;
  loading: boolean;
}

export default function ResponseViewer({ response, loading }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<"pretty" | "raw" | "headers">("pretty");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Monitor Ctrl+F keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
        }, 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-canvas text-text-secondary select-none text-xs">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mb-2"></div>
        <span>Sending request...</span>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-canvas text-text-secondary select-none p-6">
        <div className="text-center space-y-4 max-w-sm">
          <span className="text-text-primary text-xs font-semibold block">
            Send a request to see the response
          </span>
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2 text-xs hover:text-text-primary cursor-default justify-center transition-colors">
              <span className="text-accent">⚡</span>
              <span>Send + Get a successful response</span>
            </div>
            <div className="flex items-center space-x-2 text-xs hover:text-text-primary cursor-default justify-center transition-colors">
              <span className="text-accent">📊</span>
              <span>Send + Visualize response</span>
            </div>
            <div className="flex items-center space-x-2 text-xs hover:text-text-primary cursor-default justify-center transition-colors">
              <span className="text-accent">🧪</span>
              <span>Send + Write tests</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine status color and badge style
  const status = response.statusCode;
  const is2xx = status >= 200 && status < 300;
  const is4xx = status >= 400 && status < 500;
  const is5xx = status >= 500;

  let badgeColorClass = "text-text-secondary bg-panel/50 border-border/40";
  if (is2xx) {
    badgeColorClass = "text-method-get bg-method-get/10 border border-method-get/25";
  } else if (is4xx) {
    badgeColorClass = "text-method-post bg-method-post/10 border border-method-post/25";
  } else if (is5xx) {
    badgeColorClass = "text-method-delete bg-method-delete/10 border border-method-delete/25";
  }

  // Count matches helper
  const getMatchCount = () => {
    if (!searchQuery.trim() || !response.body) return 0;
    try {
      const escaped = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const matches = response.body.match(new RegExp(escaped, "gi"));
      return matches ? matches.length : 0;
    } catch (e) {
      return 0;
    }
  };

  const matchCount = getMatchCount();

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-500/30 text-yellow-200 border border-yellow-500/25 px-0.5 rounded font-mono font-bold"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  return (
    <div className="h-full w-full flex flex-col bg-canvas text-xs overflow-hidden select-none">
      {/* Response Panel Header / Controls */}
      <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-panel/30 flex-none">
        <div className="flex items-center space-x-1.5 h-full">
          <span className="font-semibold text-text-primary px-1 mr-2">Response</span>
          
          <button
            onClick={() => setActiveTab("pretty")}
            className={`px-3 h-full border-b-2 transition-all ${
              activeTab === "pretty"
                ? "border-accent text-white font-medium"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Pretty
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-3 h-full border-b-2 transition-all ${
              activeTab === "raw"
                ? "border-accent text-white font-medium"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Raw
          </button>
          <button
            onClick={() => setActiveTab("headers")}
            className={`px-3 h-full border-b-2 transition-all ${
              activeTab === "headers"
                ? "border-accent text-white font-medium"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Headers ({Object.keys(response.headers || {}).length})
          </button>

          {/* Search Toggle Button */}
          {!response.error && activeTab !== "headers" && (
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) {
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                } else {
                  setSearchQuery("");
                }
              }}
              className={`p-1 rounded hover:bg-border/40 ml-2 transition-colors ${
                showSearch ? "text-accent" : "text-text-secondary hover:text-text-primary"
              }`}
              title="Search response (Ctrl+F)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Response Metrics */}
        <div className="flex items-center space-x-4 text-text-secondary font-mono text-[11px]">
          {response.error ? (
            <span className="text-status-error font-sans font-medium text-xs">
              Error: {response.errorType || "unknown"}
            </span>
          ) : (
            <>
              <div className="flex items-center space-x-1.5">
                <span>Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColorClass}`}>
                  {status}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Time:</span>
                <span className="text-text-primary font-bold">{formatTime(response.timeMs)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Size:</span>
                <span className="text-text-primary font-bold">{formatBytes(response.sizeBytes)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating/Overlay Search Bar */}
      {showSearch && !response.error && activeTab !== "headers" && (
        <div className="bg-panel border-b border-border px-3 py-1.5 flex items-center justify-between space-x-2 animate-in slide-in-from-top-1 duration-100 flex-none select-none">
          <div className="flex items-center space-x-2 flex-1 max-w-sm relative">
            <Search className="w-3.5 h-3.5 text-text-secondary absolute left-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Find in response body..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-canvas border border-border text-text-primary pl-8 pr-16 py-1 rounded text-xs focus:border-accent focus:outline-none transition-all font-mono"
            />
            {searchQuery.trim() !== "" && (
              <span className="absolute right-2 text-[10px] font-mono text-text-secondary">
                {matchCount} {matchCount === 1 ? "match" : "matches"}
              </span>
            )}
          </div>
          <button
            onClick={handleCloseSearch}
            className="p-1 text-text-secondary hover:text-white rounded hover:bg-border/30 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Response Panel Body */}
      <div className="flex-1 p-3 overflow-hidden">
        {response.error ? (
          <div className="h-full w-full bg-status-error/5 border border-status-error/40 rounded p-4 font-mono text-status-error text-xs overflow-auto">
            <div className="font-bold text-sm mb-2 uppercase">Request Execution Failed</div>
            <div>Error Type: {response.errorType}</div>
            <div className="mt-2 text-text-primary whitespace-pre-wrap">{response.error}</div>
          </div>
        ) : (
          <div className="h-full w-full overflow-auto">
            {activeTab === "pretty" && (
              <PrettyView body={response.body} searchQuery={searchQuery} />
            )}
            
            {activeTab === "raw" && (
              searchQuery.trim() !== "" ? (
                <div className="h-full w-full overflow-auto bg-panel border border-border rounded p-3 font-mono text-xs text-text-primary custom-scrollbar select-text whitespace-pre">
                  <pre className="whitespace-pre break-all leading-relaxed font-mono">
                    {highlightText(response.body || "", searchQuery)}
                  </pre>
                </div>
              ) : (
                <textarea
                  readOnly
                  wrap="off"
                  value={response.body || ""}
                  className="h-full w-full bg-panel border border-border rounded p-3 font-mono text-xs text-text-primary focus:outline-none resize-none selection:bg-accent selection:text-white overflow-x-auto whitespace-pre"
                />
              )
            )}
            
            {activeTab === "headers" && <HeadersView headers={response.headers} />}
          </div>
        )}
      </div>
    </div>
  );
}
