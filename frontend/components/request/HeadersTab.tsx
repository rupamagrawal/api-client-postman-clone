"use client";

import React from "react";
import KeyValueEditor from "../shared/KeyValueEditor";
import { KeyValueRow } from "../../types";

interface HeadersTabProps {
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
}

export default function HeadersTab({ rows, onChange }: HeadersTabProps) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
        Headers
      </div>
      <KeyValueEditor
        rows={rows}
        onChange={onChange}
        keyPlaceholder="Header Key"
        valuePlaceholder="Header Value"
      />
    </div>
  );
}
