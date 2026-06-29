"use client";

import React from "react";
import KeyValueEditor from "../shared/KeyValueEditor";
import { KeyValueRow } from "../../types";

interface BodyTabProps {
  bodyType: "none" | "raw" | "form-data" | "urlencoded";
  bodyContent: string;
  bodyRows: KeyValueRow[];
  bodyRawFormat?: string;
  onTypeChange: (type: "none" | "raw" | "form-data" | "urlencoded") => void;
  onContentChange: (content: string) => void;
  onRowsChange: (rows: KeyValueRow[]) => void;
  onRawFormatChange?: (format: string) => void;
}

export default function BodyTab({
  bodyType,
  bodyContent,
  bodyRows,
  bodyRawFormat = "JSON",
  onTypeChange,
  onContentChange,
  onRowsChange,
  onRawFormatChange,
}: BodyTabProps) {
  return (
    <div className="space-y-3 flex flex-col h-full text-xs select-none">
      {/* Selector */}
      <div className="flex items-center justify-between border-b border-border/30 pb-2">
        <div className="flex items-center space-x-4">
          <label className="text-text-secondary font-medium">Body Type:</label>
          <div className="flex items-center space-x-3">
            {(["none", "raw", "form-data", "urlencoded"] as const).map((type) => (
              <label key={type} className="flex items-center space-x-1.5 cursor-pointer text-text-primary hover:text-white">
                <input
                  type="radio"
                  name="bodyType"
                  value={type}
                  checked={bodyType === type}
                  onChange={() => onTypeChange(type)}
                  className="accent-accent cursor-pointer"
                />
                <span className="capitalize">{type === "none" ? "none" : type}</span>
              </label>
            ))}
          </div>
        </div>

        {bodyType === "raw" && (
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary text-[11px]">Format:</span>
            <select
              value={bodyRawFormat}
              onChange={(e) => onRawFormatChange?.(e.target.value)}
              className="bg-panel border border-border rounded text-text-primary text-[11px] font-medium py-1 px-2 focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="JSON">JSON</option>
              <option value="Text">Text</option>
              <option value="XML">XML</option>
              <option value="HTML">HTML</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </div>
        )}
      </div>

      {/* Editor Space */}
      <div className="flex-1 min-h-[140px]">
        {bodyType === "none" && (
          <div className="h-full flex items-center justify-center text-text-secondary italic text-xs py-8">
            This request does not send a body payload.
          </div>
        )}

        {bodyType === "raw" && (
          <div className="h-full flex flex-col space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-text-secondary font-semibold uppercase">
              <span>RAW TEXT ({bodyRawFormat})</span>
            </div>
            <textarea
              value={bodyContent}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder={
                bodyRawFormat === "JSON"
                  ? '{\n  "key": "value"\n}'
                  : bodyRawFormat === "XML"
                  ? '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <key>value</key>\n</root>'
                  : bodyRawFormat === "HTML"
                  ? '<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>'
                  : bodyRawFormat === "JavaScript"
                  ? 'console.log("Hello World");'
                  : '// Enter raw text body here'
              }
              className="w-full flex-1 bg-panel text-text-primary border border-border rounded p-3 font-mono text-xs focus:border-accent focus:outline-none placeholder-text-secondary/30 resize-none h-[180px]"
            />
          </div>
        )}

        {(bodyType === "form-data" || bodyType === "urlencoded") && (
          <div className="space-y-2">
            <div className="text-[10px] text-text-secondary font-semibold uppercase">
              {bodyType === "form-data" ? "Multipart Form Data" : "URL Encoded Fields"}
            </div>
            <KeyValueEditor
              rows={bodyRows}
              onChange={onRowsChange}
              keyPlaceholder="Field Name"
              valuePlaceholder="Field Value"
            />
          </div>
        )}
      </div>
    </div>
  );
}
