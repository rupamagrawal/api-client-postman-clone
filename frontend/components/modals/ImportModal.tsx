"use client";

import React, { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";
import { parseCurl } from "../../lib/curlParser";
import { importPostmanCollection } from "../../lib/collectionImporter";
import { generateId } from "../../lib/utils";
import ImportModalFooter from "./ImportModalFooter";

export default function ImportModal() {
  const { importModalOpen, setImportModalOpen, addTab, setCollections } = useAppStore();
  const [showTip, setShowTip] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!importModalOpen) return null;

  const handleClose = () => setImportModalOpen(false);

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const trimmed = val.trim();
    if (trimmed.startsWith("curl ") || trimmed.startsWith("curl\n")) {
      try {
        const parsed = parseCurl(val);
        const mappedHeaders = Object.entries(parsed.headers).map(([k, v]) => ({
          id: generateId(),
          enabled: true,
          key: k,
          value: v,
          description: "",
        }));
        mappedHeaders.push({ id: generateId(), enabled: true, key: "", value: "", description: "" });

        addTab({
          name: "cURL Import",
          method: parsed.method,
          url: parsed.url,
          headers: mappedHeaders,
          bodyType: parsed.bodyContent ? "raw" : "none",
          bodyContent: parsed.bodyContent || "",
          isDirty: true,
        });

        toast.success("Imported from cURL!");
        handleClose();
      } catch (err) {
        toast.error("Failed to parse cURL command");
      }
    }
  };

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        toast.loading("Importing collection...", { id: "import-toast" });
        const cols = await importPostmanCollection(text);
        setCollections(cols);
        toast.success("Collection imported successfully!", { id: "import-toast" });
        handleClose();
      } catch (err: any) {
        toast.error(err.message || "Invalid JSON or import failed", { id: "import-toast" });
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm select-none font-sans">
      <div className="w-full max-w-2xl bg-panel border border-border rounded-xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-base">Import your API or connect your local repo</span>
          <button onClick={handleClose} className="text-text-secondary hover:text-white p-1 rounded hover:bg-border/30 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <textarea
          placeholder="Paste cURL, Raw text or URL..."
          onChange={handlePasteChange}
          className="w-full h-20 bg-canvas border border-border text-text-primary px-3 py-2 rounded-lg focus:border-accent focus:outline-none transition-all text-xs font-mono resize-none"
        />

        {showTip && (
          <div className="bg-canvas border border-border/50 rounded-lg px-3 py-2 flex justify-between items-center text-[11px] text-text-secondary">
            <div className="flex items-center space-x-1.5">
              <span>💡</span>
              <span>Tip: You can also paste cURL in the request bar to import</span>
            </div>
            <button onClick={() => setShowTip(false)} className="hover:text-text-primary font-semibold transition-colors">
              Dismiss
            </button>
          </div>
        )}

        <div
          onDragOver={onDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all ${
            isDragging ? "border-accent bg-accent/5" : "border-border hover:border-text-secondary bg-sidebar/30"
          }`}
        >
          <Upload className="w-8 h-8 text-text-secondary" />
          <div className="text-center text-xs space-y-1">
            <p className="font-semibold text-text-primary">Drop anywhere to import</p>
            <p className="text-text-secondary">
              Or select{" "}
              <span className="text-blue-500 hover:text-blue-400 font-medium underline">files</span> or folders
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
            className="hidden"
          />
        </div>

        <ImportModalFooter />
      </div>
    </div>
  );
}
