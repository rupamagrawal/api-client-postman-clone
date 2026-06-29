"use client";

import React from "react";

interface AuthTabProps {
  type: "none" | "bearer" | "basic";
  config: Record<string, string>;
  onTypeChange: (type: "none" | "bearer" | "basic") => void;
  onConfigChange: (config: Record<string, string>) => void;
}

export default function AuthTab({
  type,
  config,
  onTypeChange,
  onConfigChange,
}: AuthTabProps) {
  const handleConfigChange = (key: string, val: string) => {
    onConfigChange({
      ...config,
      [key]: val,
    });
  };

  return (
    <div className="space-y-4 max-w-lg text-xs select-none">
      <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
        Authentication
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-text-secondary font-medium">Type</label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as any)}
          className="bg-panel border border-border text-text-primary rounded px-2.5 py-1.5 focus:border-accent focus:outline-none w-56 cursor-pointer"
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
        </select>
      </div>

      <div className="border-t border-border/40 pt-3">
        {type === "none" && (
          <p className="text-text-secondary text-[11px] leading-relaxed">
            This request does not use any authentication headers or parameters.
          </p>
        )}

        {type === "bearer" && (
          <div className="space-y-3">
            <div className="flex flex-col space-y-1.5">
              <label className="text-text-secondary">Token</label>
              <input
                type="text"
                value={config.token || ""}
                onChange={(e) => handleConfigChange("token", e.target.value)}
                placeholder="Bearer token value"
                className="bg-panel border border-border text-text-primary px-3 py-1.5 rounded focus:border-accent focus:outline-none font-mono text-xs w-full"
              />
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              The token will be sent in the <code>Authorization: Bearer &lt;token&gt;</code> header.
            </p>
          </div>
        )}

        {type === "basic" && (
          <div className="space-y-3">
            <div className="flex flex-col space-y-1.5">
              <label className="text-text-secondary">Username</label>
              <input
                type="text"
                value={config.username || ""}
                onChange={(e) => handleConfigChange("username", e.target.value)}
                placeholder="Username"
                className="bg-panel border border-border text-text-primary px-3 py-1.5 rounded focus:border-accent focus:outline-none font-mono text-xs w-full"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-text-secondary">Password</label>
              <input
                type="password"
                value={config.password || ""}
                onChange={(e) => handleConfigChange("password", e.target.value)}
                placeholder="Password"
                className="bg-panel border border-border text-text-primary px-3 py-1.5 rounded focus:border-accent focus:outline-none font-mono text-xs w-full"
              />
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              Basic Authentication will encode credentials using Base64 and append the <code>Authorization: Basic ...</code> header.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
