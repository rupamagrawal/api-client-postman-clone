"use client";

import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface PrettyViewProps {
  body: string;
  searchQuery?: string;
}

export default function PrettyView({ body, searchQuery }: PrettyViewProps) {
  if (!body) {
    return (
      <div className="text-text-secondary italic text-xs py-4 px-2 select-none">
        Empty Response Body
      </div>
    );
  }

  let formattedBody = body;
  let isJson = false;

  try {
    const parsed = JSON.parse(body);
    formattedBody = JSON.stringify(parsed, null, 2);
    isJson = true;
  } catch (e) {
    // Keep raw string
  }

  // Highlight query occurrences inside pre tags
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    // Escape regex characters
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

  // If a search query is active, fallback to a mark-highlighted pre element
  if (searchQuery && searchQuery.trim() !== "") {
    return (
      <div className="h-full w-full overflow-auto bg-panel border border-border rounded p-3 font-mono text-xs text-text-primary custom-scrollbar select-text whitespace-pre">
        <pre className="whitespace-pre break-all leading-relaxed font-mono">
          {highlightText(formattedBody, searchQuery)}
        </pre>
      </div>
    );
  }

  if (isJson) {
    return (
      <div className="h-full w-full overflow-auto rounded border border-border/40 text-xs custom-scrollbar">
        <SyntaxHighlighter
          language="json"
          style={atomOneDark}
          customStyle={{
            margin: 0,
            padding: "12px",
            background: "#252525",
            fontSize: "12px",
            fontFamily: "var(--font-mono), monospace",
            overflowX: "auto",
          }}
        >
          {formattedBody}
        </SyntaxHighlighter>
      </div>
    );
  }

  // Monospace raw text fallback (no search active)
  return (
    <div className="h-full w-full overflow-auto bg-panel border border-border rounded p-3 font-mono text-xs text-text-primary custom-scrollbar select-text whitespace-pre">
      <pre className="whitespace-pre break-all leading-relaxed font-mono">
        {formattedBody}
      </pre>
    </div>
  );
}
