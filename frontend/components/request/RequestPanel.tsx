"use client";

import React, { useState, useRef, useEffect } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { ChevronDown, Send, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";
import { runRequest, getHistory, updateRequest, getCollections } from "../../lib/api";
import { KeyValueRow } from "../../types";
import { generateId, getTabNameFromUrl } from "../../lib/utils";
import { parseCurl } from "../../lib/curlParser";
import ParamsTab from "./ParamsTab";
import AuthTab from "./AuthTab";
import HeadersTab from "./HeadersTab";
import BodyTab from "./BodyTab";
import ResponseViewer from "../response/ResponseViewer";

const inferRawFormatFromHeaders = (headers: Record<string, string> | null | undefined): string => {
  if (!headers) return "JSON";
  const contentType = Object.entries(headers).find(([k, _]) => k.toLowerCase() === "content-type")?.[1];
  if (!contentType) return "JSON";
  if (contentType.includes("application/json")) return "JSON";
  if (contentType.includes("text/plain")) return "Text";
  if (contentType.includes("application/xml") || contentType.includes("text/xml")) return "XML";
  if (contentType.includes("text/html")) return "HTML";
  if (contentType.includes("application/javascript") || contentType.includes("text/javascript")) return "JavaScript";
  return "JSON";
};

const getUpdatedHeadersForBody = (
  headers: KeyValueRow[],
  bodyType: "none" | "raw" | "form-data" | "urlencoded",
  rawFormat: string
): KeyValueRow[] => {
  const contentTypeIndex = headers.findIndex(
    (h) => h.key.trim().toLowerCase() === "content-type"
  );

  let newHeaders = [...headers];
  let targetValue = "";
  let shouldEnable = false;

  if (bodyType === "urlencoded") {
    targetValue = "application/x-www-form-urlencoded";
    shouldEnable = true;
  } else if (bodyType === "raw") {
    shouldEnable = true;
    switch (rawFormat.toLowerCase()) {
      case "json":
        targetValue = "application/json";
        break;
      case "text":
        targetValue = "text/plain";
        break;
      case "xml":
        targetValue = "application/xml";
        break;
      case "html":
        targetValue = "text/html";
        break;
      case "javascript":
        targetValue = "application/javascript";
        break;
      default:
        targetValue = "text/plain";
    }
  }

  if (shouldEnable) {
    if (contentTypeIndex !== -1) {
      newHeaders[contentTypeIndex] = {
        ...newHeaders[contentTypeIndex],
        value: targetValue,
        enabled: true,
      };
    } else {
      const lastRow = newHeaders[newHeaders.length - 1];
      const newRow: KeyValueRow = {
        id: generateId(),
        enabled: true,
        key: "Content-Type",
        value: targetValue,
        description: "",
      };

      if (lastRow && lastRow.key === "" && lastRow.value === "") {
        newHeaders.splice(newHeaders.length - 1, 0, newRow);
      } else {
        newHeaders.push(newRow);
        newHeaders.push({
          id: generateId(),
          enabled: true,
          key: "",
          value: "",
          description: "",
        });
      }
    }
  } else {
    // If switching to none/form-data: find Content-Type row and set enabled: false
    if (contentTypeIndex !== -1) {
      newHeaders[contentTypeIndex] = {
        ...newHeaders[contentTypeIndex],
        enabled: false,
      };
    }
  }

  return newHeaders;
};

export default function RequestPanel() {
  const {
    tabs,
    activeTabId,
    updateTab,
    getActiveEnvVariables,
    setHistory,
    setSaveRequestModalOpen,
    setCollections,
  } = useAppStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const [activeSubTab, setActiveSubTab] = useState<"params" | "auth" | "headers" | "body">("params");
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const methodDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close method dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        methodDropdownRef.current &&
        !methodDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync scrolling between transparent input and highlight overlay
  const handleScroll = () => {
    if (inputRef.current && overlayRef.current) {
      overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  if (!activeTab) {
    return (
      <div className="flex-1 bg-canvas flex items-center justify-center text-text-secondary text-xs select-none">
        Open a tab to begin editing requests.
      </div>
    );
  }

  const setIsOpenDropdown = (val: boolean) => {
    setIsMethodOpen(val);
  };

  const handleMethodSelect = (method: string) => {
    updateTab(activeTab.id, { method, isDirty: true });
    setIsOpenDropdown(false);
  };

  // Sync URL query params table when typing in URL bar
  const syncUrlToParams = (urlStr: string, currentParams: KeyValueRow[]): KeyValueRow[] => {
    const questionMarkIndex = urlStr.indexOf("?");
    if (questionMarkIndex === -1) {
      return [{ id: generateId(), enabled: true, key: "", value: "", description: "" }];
    }
    
    const queryStr = urlStr.substring(questionMarkIndex + 1);
    const pairs = queryStr.split("&");
    const newParams: KeyValueRow[] = [];
    
    pairs.forEach((pair, idx) => {
      if (!pair) return;
      const eqIndex = pair.indexOf("=");
      let key = "";
      let value = "";
      if (eqIndex === -1) {
        key = decodeURIComponent(pair);
      } else {
        key = decodeURIComponent(pair.substring(0, eqIndex));
        value = decodeURIComponent(pair.substring(eqIndex + 1));
      }
      
      const existing = currentParams[idx];
      if (existing && existing.key === key && existing.value === value) {
        newParams.push(existing);
      } else {
        newParams.push({
          id: existing?.id || generateId(),
          enabled: existing?.enabled ?? true,
          key,
          value,
          description: existing?.description || "",
        });
      }
    });
    
    newParams.push({ id: generateId(), enabled: true, key: "", value: "", description: "" });
    return newParams;
  };

  // Reconstruct URL bar when changing values in parameters table
  const syncParamsToUrl = (urlStr: string, params: KeyValueRow[]): string => {
    const questionMarkIndex = urlStr.indexOf("?");
    const basePath = questionMarkIndex === -1 ? urlStr : urlStr.substring(0, questionMarkIndex);
    
    const activeParams = params.filter((p) => p.enabled && p.key.trim() !== "");
    if (activeParams.length === 0) {
      return basePath;
    }
    
    const queryParts = activeParams.map(
      (p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`
    );
    return `${basePath}?${queryParts.join("&")}`;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    const trimmed = newUrl.trim();
    if (trimmed.startsWith("curl ") || trimmed.startsWith("curl\n")) {
      try {
        const parsed = parseCurl(newUrl);
        const mappedHeaders = Object.entries(parsed.headers).map(([k, v]) => ({
          id: generateId(),
          enabled: true,
          key: k,
          value: v,
          description: "",
        }));
        mappedHeaders.push({ id: generateId(), enabled: true, key: "", value: "", description: "" });

        const syncedParams = syncUrlToParams(parsed.url, []);

        const rawFormat = inferRawFormatFromHeaders(parsed.headers);
        const newName = getTabNameFromUrl(parsed.url);
        updateTab(activeTab.id, {
          method: parsed.method,
          url: parsed.url,
          headers: mappedHeaders,
          params: syncedParams,
          bodyType: parsed.bodyContent ? "raw" : "none",
          bodyContent: parsed.bodyContent || "",
          bodyRawFormat: rawFormat,
          name: newName,
          isDirty: true,
        });
        toast.success("Imported from cURL!");
        return;
      } catch (err) {
        console.error("Failed to parse cURL in url input", err);
      }
    }

    const syncedParams = syncUrlToParams(newUrl, activeTab.params);
    const newName = getTabNameFromUrl(newUrl);
    updateTab(activeTab.id, {
      url: newUrl,
      params: syncedParams,
      name: newName,
      isDirty: true,
    });
  };

  const handleParamsChange = (newParams: KeyValueRow[]) => {
    const newUrl = syncParamsToUrl(activeTab.url, newParams);
    const newName = getTabNameFromUrl(newUrl);
    updateTab(activeTab.id, {
      params: newParams,
      url: newUrl,
      name: newName,
      isDirty: true,
    });
  };

  const handleBodyTypeChange = (bodyType: "none" | "raw" | "form-data" | "urlencoded") => {
    const rawFormat = activeTab.bodyRawFormat || "JSON";
    const updatedHeaders = getUpdatedHeadersForBody(activeTab.headers, bodyType, rawFormat);
    updateTab(activeTab.id, {
      bodyType,
      headers: updatedHeaders,
      isDirty: true,
    });
  };

  const handleRawFormatChange = (rawFormat: string) => {
    const updatedHeaders = getUpdatedHeadersForBody(activeTab.headers, "raw", rawFormat);
    updateTab(activeTab.id, {
      bodyRawFormat: rawFormat,
      headers: updatedHeaders,
      isDirty: true,
    });
  };

  const handleSend = async () => {
    if (!activeTab.url.trim()) {
      toast.error("Please enter a request URL");
      return;
    }

    const rowsToRecord = (rows: KeyValueRow[]): Record<string, string> => {
      const record: Record<string, string> = {};
      (rows || []).forEach((row) => {
        if (row.enabled && row.key.trim() !== "") {
          record[row.key] = row.value;
        }
      });
      return record;
    };

    updateTab(activeTab.id, { loading: true });

    try {
      const payload = {
        method: activeTab.method,
        url: activeTab.url,
        headers: rowsToRecord(activeTab.headers),
        params: rowsToRecord(activeTab.params),
        bodyType: activeTab.bodyType,
        bodyContent: activeTab.bodyType === "raw" ? activeTab.bodyContent : JSON.stringify(rowsToRecord(activeTab.bodyRows)),
        authType: activeTab.authType,
        authConfig: activeTab.authConfig,
        environmentVariables: getActiveEnvVariables(),
      };

      const response = await runRequest(payload);
      updateTab(activeTab.id, { response, loading: false });

      // Refresh sidebar history entries
      const hist = await getHistory();
      setHistory(hist);
      toast.success("Request completed successfully!");
    } catch (err: any) {
      console.error(err);
      updateTab(activeTab.id, {
        loading: false,
        response: {
          statusCode: 0,
          headers: {},
          body: "",
          timeMs: 0,
          sizeBytes: 0,
          error: err.response?.data?.detail || err.message || "Network Error",
          errorType: "unknown",
        },
      });
      toast.error("Request execution failed.");
    }
  };

  // Handles Save actions (direct backend update if already saved, else opens modal)
  const handleSaveClick = async () => {
    if (activeTab.savedRequestId) {
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
          name: activeTab.name,
          method: activeTab.method,
          url: activeTab.url,
          headers: rowsToRecord(activeTab.headers),
          params: rowsToRecord(activeTab.params),
          bodyType: activeTab.bodyType,
          bodyContent: activeTab.bodyType === "raw" ? activeTab.bodyContent : JSON.stringify(rowsToRecord(activeTab.bodyRows)),
          authType: activeTab.authType,
          authConfig: activeTab.authConfig,
        };

        await updateRequest(activeTab.savedRequestId, payload);
        updateTab(activeTab.id, { isDirty: false });
        
        // Refresh collections
        const cols = await getCollections();
        setCollections(cols);

        toast.success("Request updated!");
      } catch (err) {
        toast.error("Failed to update request");
      }
    } else {
      setSaveRequestModalOpen(true);
    }
  };

  // Render Highlighted {{variable}} Overlay in URL Input bar
  const renderHighlightedUrl = (urlText: string) => {
    if (!urlText) {
      return <span className="text-text-secondary/40">Enter request URL</span>;
    }
    const envVars = getActiveEnvVariables();
    const regex = /\{\{([^}]+)\}\}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(urlText)) !== null) {
      const matchIndex = match.index;
      const fullMatch = match[0];
      const varName = match[1].trim();

      if (matchIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="text-text-primary">
            {urlText.substring(lastIndex, matchIndex)}
          </span>
        );
      }

      const exists = envVars[varName] !== undefined;
      parts.push(
        <span
          key={`var-${matchIndex}`}
          className={
            exists
              ? "text-accent font-bold bg-accent/15 border border-accent/30 rounded px-0.5"
              : "text-status-error font-bold bg-status-error/15 border border-status-error/30 rounded px-0.5"
          }
        >
          {fullMatch}
        </span>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < urlText.length) {
      parts.push(
        <span key="text-end" className="text-text-primary">
          {urlText.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  const methodColorClass = {
    GET: "text-method-get",
    POST: "text-method-post",
    PUT: "text-method-put",
    PATCH: "text-method-patch",
    DELETE: "text-method-delete",
  }[activeTab.method] || "text-text-primary";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-canvas">
      <PanelGroup direction="vertical">
        {/* Top Panel: URL + Request configs */}
        <Panel defaultSize={55} minSize={30}>
          <div className="p-4 flex flex-col h-full overflow-hidden space-y-4">
            
            {/* URL input bar + Save/Send buttons */}
            <div className="flex items-center select-none flex-none">
              {/* Method Dropdown */}
              <div className="relative" ref={methodDropdownRef}>
                <button
                  onClick={() => setIsMethodOpen(!isMethodOpen)}
                  className={`w-28 h-9 bg-panel border border-border text-left px-3 text-xs font-bold font-mono rounded-l flex items-center justify-between border-r-0 hover:bg-border/30 transition-all ${methodColorClass}`}
                >
                  <span>{activeTab.method}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                </button>

                {isMethodOpen && (
                  <div className="absolute left-0 mt-1 w-28 bg-panel border border-border rounded shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-mono">
                    {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => {
                      const color = {
                        GET: "text-method-get hover:bg-method-get/10",
                        POST: "text-method-post hover:bg-method-post/10",
                        PUT: "text-method-put hover:bg-method-put/10",
                        PATCH: "text-method-patch hover:bg-method-patch/10",
                        DELETE: "text-method-delete hover:bg-method-delete/10",
                      }[m] || "text-text-primary";

                      return (
                        <button
                          key={m}
                          onClick={() => handleMethodSelect(m)}
                          className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-all ${color}`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Styled URL input overlay container */}
              <div className="relative flex-1 h-9 border border-border bg-panel focus-within:border-accent flex items-center overflow-hidden">
                {/* Background overlay highlighting variables */}
                <div
                  ref={overlayRef}
                  className="absolute left-0 top-0 right-0 bottom-0 px-3 flex items-center text-xs font-mono whitespace-pre overflow-hidden pointer-events-none bg-panel"
                >
                  {renderHighlightedUrl(activeTab.url)}
                </div>

                {/* Transparent interactive input sitting on top */}
                <input
                  ref={inputRef}
                  type="text"
                  value={activeTab.url}
                  onChange={handleUrlChange}
                  onScroll={handleScroll}
                  placeholder=""
                  className="absolute inset-0 bg-transparent border-none px-3 text-xs text-transparent focus:outline-none font-mono caret-text-primary z-10 w-full"
                />
              </div>

              {/* Pinned Save button */}
              <button
                onClick={handleSaveClick}
                className={`h-9 px-4 ml-2 border border-border text-xs font-semibold rounded flex items-center space-x-1.5 transition-all ${
                  activeTab.isDirty
                    ? "bg-accent hover:bg-orange-600 text-white font-bold border-accent"
                    : "bg-panel text-text-secondary hover:text-text-primary hover:border-text-secondary"
                }`}
                title="Save Request"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              {/* Pinned Send Button */}
              <button
                id="send-request-btn"
                onClick={handleSend}
                disabled={activeTab.loading}
                className="h-9 px-5 bg-accent hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold rounded flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{activeTab.loading ? "Sending..." : "Send"}</span>
              </button>
            </div>

            {/* Config Sub-Tabs */}
            <div className="flex border-b border-border/50 h-9 flex-none select-none">
              {(["params", "auth", "headers", "body"] as const).map((tab) => {
                const label = {
                  params: "Params",
                  auth: "Authorization",
                  headers: "Headers",
                  body: "Body",
                }[tab];

                const isActive = activeSubTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-4 h-full border-b-2 text-xs transition-colors flex items-center ${
                      isActive
                        ? "border-accent text-white font-medium"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span>{label}</span>
                    {tab === "params" && activeTab.params.filter((p) => p.key).length > 1 && (
                      <span className="ml-1 px-1 bg-border rounded text-[9px] text-text-secondary font-mono">
                        {activeTab.params.filter((p) => p.key).length - 1}
                      </span>
                    )}
                    {tab === "headers" && activeTab.headers.filter((h) => h.key).length > 1 && (
                      <span className="ml-1 px-1 bg-border rounded text-[9px] text-text-secondary font-mono">
                        {activeTab.headers.filter((h) => h.key).length - 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* sub-tab grid editors */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {activeSubTab === "params" && (
                <ParamsTab
                  rows={activeTab.params}
                  onChange={handleParamsChange}
                />
              )}
              {activeSubTab === "auth" && (
                <AuthTab
                  type={activeTab.authType}
                  config={activeTab.authConfig}
                  onTypeChange={(authType) =>
                    updateTab(activeTab.id, { authType, isDirty: true })
                  }
                  onConfigChange={(authConfig) =>
                    updateTab(activeTab.id, { authConfig, isDirty: true })
                  }
                />
              )}
              {activeSubTab === "headers" && (
                <HeadersTab
                  rows={activeTab.headers}
                  onChange={(headers) => updateTab(activeTab.id, { headers, isDirty: true })}
                />
              )}
              {activeSubTab === "body" && (
                <BodyTab
                  bodyType={activeTab.bodyType}
                  bodyContent={activeTab.bodyContent}
                  bodyRows={activeTab.bodyRows}
                  bodyRawFormat={activeTab.bodyRawFormat || "JSON"}
                  onTypeChange={handleBodyTypeChange}
                  onContentChange={(bodyContent) =>
                    updateTab(activeTab.id, { bodyContent, isDirty: true })
                  }
                  onRowsChange={(bodyRows) =>
                    updateTab(activeTab.id, { bodyRows, isDirty: true })
                  }
                  onRawFormatChange={handleRawFormatChange}
                />
              )}
            </div>

          </div>
        </Panel>

        {/* Resizer bar */}
        <PanelResizeHandle className="h-1 bg-border hover:bg-accent/60 cursor-row-resize transition-all" />

        {/* Bottom Panel: Response Metrics & Viewer */}
        <Panel defaultSize={45} minSize={20}>
          <div className="h-full border-t border-border overflow-hidden">
            <ResponseViewer response={activeTab.response} loading={activeTab.loading} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
