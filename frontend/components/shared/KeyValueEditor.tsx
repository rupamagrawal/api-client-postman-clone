"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { KeyValueRow } from "../../types";
import { generateId } from "../../lib/utils";

interface KeyValueEditorProps {
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export default function KeyValueEditor({
  rows,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: KeyValueEditorProps) {
  
  const handleRowChange = (id: string, field: keyof KeyValueRow, val: any) => {
    const updated = rows.map((row, idx) => {
      if (row.id === id) {
        const newRow = { ...row, [field]: val };
        return newRow;
      }
      return row;
    });

    // Check if we edited the last row, and if so, append a new blank row
    const editedIndex = rows.findIndex((r) => r.id === id);
    if (
      editedIndex === rows.length - 1 &&
      (field === "key" || field === "value") &&
      val !== ""
    ) {
      updated.push({
        id: generateId(),
        enabled: true,
        key: "",
        value: "",
        description: "",
      });
    }

    onChange(updated);
  };

  const handleRemoveRow = (id: string) => {
    // Don't delete if it's the only row and is empty
    if (rows.length === 1) {
      onChange([{ id: generateId(), enabled: true, key: "", value: "", description: "" }]);
      return;
    }
    const updated = rows.filter((row) => row.id !== id);
    // Ensure we always have at least one empty row at the end
    const lastRow = updated[updated.length - 1];
    if (!lastRow || lastRow.key !== "" || lastRow.value !== "") {
      updated.push({
        id: generateId(),
        enabled: true,
        key: "",
        value: "",
        description: "",
      });
    }
    onChange(updated);
  };

  return (
    <div className="w-full overflow-x-auto text-xs select-none">
      <table className="w-full border-collapse border border-border/40 text-text-primary">
        <thead>
          <tr className="bg-panel/40 border-b border-border text-text-secondary font-medium">
            <th className="w-8 py-1.5 px-2 border-r border-border text-center"></th>
            <th className="py-1.5 px-2 border-r border-border text-left w-1/3">Key</th>
            <th className="py-1.5 px-2 border-r border-border text-left w-1/3">Value</th>
            <th className="py-1.5 px-2 border-r border-border text-left">Description</th>
            <th className="w-8 py-1.5 px-2 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isLast = idx === rows.length - 1;
            return (
              <tr
                key={row.id}
                className="border-b border-border/40 hover:bg-panel/20 focus-within:bg-panel/20 transition-colors"
              >
                {/* Enabled Checkbox */}
                <td className="py-1 px-2 border-r border-border/40 text-center">
                  {!isLast && (
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) => handleRowChange(row.id, "enabled", e.target.checked)}
                      className="accent-accent w-3 h-3 cursor-pointer"
                    />
                  )}
                </td>

                {/* Key Input */}
                <td className="py-0 px-2 border-r border-border/40">
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => handleRowChange(row.id, "key", e.target.value)}
                    placeholder={keyPlaceholder}
                    className="w-full bg-transparent border-none py-1.5 text-text-primary focus:outline-none placeholder-text-secondary/40 font-mono"
                  />
                </td>

                {/* Value Input */}
                <td className="py-0 px-2 border-r border-border/40">
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => handleRowChange(row.id, "value", e.target.value)}
                    placeholder={valuePlaceholder}
                    className="w-full bg-transparent border-none py-1.5 text-text-primary focus:outline-none placeholder-text-secondary/40 font-mono"
                  />
                </td>

                {/* Description Input */}
                <td className="py-0 px-2 border-r border-border/40">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => handleRowChange(row.id, "description", e.target.value)}
                    placeholder="Description"
                    className="w-full bg-transparent border-none py-1.5 text-text-primary focus:outline-none placeholder-text-secondary/40"
                  />
                </td>

                {/* Action button */}
                <td className="py-1 px-2 text-center">
                  {!isLast && (
                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-1 rounded text-text-secondary hover:text-status-error hover:bg-border/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
