"use client";

import React from "react";

interface HeadersViewProps {
  headers: Record<string, string>;
}

export default function HeadersView({ headers }: HeadersViewProps) {
  const entries = Object.entries(headers || {});

  if (entries.length === 0) {
    return <div className="text-text-secondary italic text-xs">No Response Headers</div>;
  }

  return (
    <div className="w-full overflow-x-auto text-xs select-none">
      <table className="w-full border-collapse border border-border/40 text-text-primary">
        <thead>
          <tr className="bg-panel/40 border-b border-border text-text-secondary font-medium">
            <th className="py-1.5 px-3 border-r border-border text-left w-1/3">Key</th>
            <th className="py-1.5 px-3 text-left">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, val]) => (
            <tr
              key={key}
              className="border-b border-border/40 hover:bg-panel/20 transition-colors"
            >
              <td className="py-1.5 px-3 border-r border-border/40 font-mono text-text-secondary font-semibold">
                {key}
              </td>
              <td className="py-1.5 px-3 font-mono text-text-primary whitespace-pre-wrap break-all select-text">
                {val}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
