"use client";

import React from "react";
import KeyValueEditor from "../shared/KeyValueEditor";
import { KeyValueRow } from "../../types";

interface ParamsTabProps {
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
}

export default function ParamsTab({ rows, onChange }: ParamsTabProps) {
  return (
    <div className="space-y-3">
      <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
        Query Parameters
      </div>
      <KeyValueEditor
        rows={rows}
        onChange={onChange}
        keyPlaceholder="Parameter Key"
        valuePlaceholder="Parameter Value"
      />
    </div>
  );
}
