"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "../../lib/store";
import {
  getEnvironments,
  createEnvironment,
  deleteEnvironment,
  addEnvVariable,
  updateEnvVariable,
  deleteEnvVariable,
} from "../../lib/api";
import { EnvVariable } from "../../types";
import { generateId } from "../../lib/utils";

export default function EnvironmentModal() {
  const {
    environmentModalOpen,
    setEnvironmentModalOpen,
    environments,
    setEnvironments,
    activeEnvId,
    setActiveEnv,
  } = useAppStore();

  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [newEnvName, setNewEnvName] = useState("");
  const [loading, setLoading] = useState(false);

  // Local state for the variables of the selected environment to allow fast typing before auto-save
  const [localVars, setLocalVars] = useState<(EnvVariable & { isNew?: boolean })[]>([]);

  const selectedEnv = environments.find((e) => e.id === selectedEnvId);

  // Sync selectedEnvId with activeEnvId on open
  useEffect(() => {
    if (environmentModalOpen) {
      setSelectedEnvId(activeEnvId || (environments[0]?.id ?? null));
    }
  }, [environmentModalOpen, activeEnvId, environments]);

  // Load selected environment's variables into local state
  useEffect(() => {
    if (selectedEnv) {
      const vars = [...selectedEnv.variables];
      // Append one empty row for adding a new variable
      vars.push({
        id: generateId(),
        key: "",
        value: "",
        enabled: true,
        isNew: true,
      } as any);
      setLocalVars(vars);
    } else {
      setLocalVars([]);
    }
  }, [selectedEnvId, environments]);

  if (!environmentModalOpen) return null;

  const handleClose = () => {
    setEnvironmentModalOpen(false);
  };

  const handleAddEnvironment = async () => {
    const name = window.prompt("Enter Environment Name:");
    if (!name || !name.trim()) return;

    try {
      const newEnv = await createEnvironment({ name: name.trim() });
      const envs = await getEnvironments();
      setEnvironments(envs);
      setSelectedEnvId(newEnv.id);
      toast.success(`Environment "${name}" created`);
    } catch (err) {
      toast.error("Failed to create environment");
    }
  };

  const handleDeleteEnv = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete environment "${name}"?`)) return;

    try {
      await deleteEnvironment(id);
      if (activeEnvId === id) {
        setActiveEnv(null);
      }
      const envs = await getEnvironments();
      setEnvironments(envs);
      if (selectedEnvId === id) {
        setSelectedEnvId(envs[0]?.id ?? null);
      }
      toast.success("Environment deleted");
    } catch (err) {
      toast.error("Failed to delete environment");
    }
  };

  // Local variable change (fast, no backend call)
  const handleLocalVarChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...localVars];
    updated[index] = { ...updated[index], [field]: val };
    setLocalVars(updated);
  };

  // Auto-save key/value changes on blur
  const handleVarBlur = async (index: number) => {
    if (!selectedEnvId) return;
    const row = localVars[index];

    // If both key and value are empty, don't save
    if (!row.key.trim() && !row.value.trim()) return;

    try {
      if (row.isNew) {
        // Create new variable in backend
        const keyVal = row.key.trim() || "variable_key";
        const newVar = await addEnvVariable(selectedEnvId, {
          key: keyVal,
          value: row.value,
          enabled: row.enabled,
        });

        // Refresh environments store
        const envs = await getEnvironments();
        setEnvironments(envs);
        toast.success("Variable added");
      } else {
        // Update existing variable in backend
        await updateEnvVariable(selectedEnvId, row.id, {
          key: row.key.trim() || "variable_key",
          value: row.value,
        });
        
        // Refresh store
        const envs = await getEnvironments();
        setEnvironments(envs);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save variable");
    }
  };

  // Toggle variable enabled state (save immediately)
  const handleToggleVar = async (index: number, currentVal: boolean) => {
    if (!selectedEnvId) return;
    const row = localVars[index];

    if (row.isNew) {
      // Just toggle locally
      const updated = [...localVars];
      updated[index] = { ...updated[index], enabled: !currentVal };
      setLocalVars(updated);
      return;
    }

    try {
      await updateEnvVariable(selectedEnvId, row.id, {
        enabled: !currentVal,
      });
      const envs = await getEnvironments();
      setEnvironments(envs);
    } catch (err) {
      toast.error("Failed to toggle variable");
    }
  };

  // Delete variable immediately
  const handleDeleteVar = async (varId: string) => {
    if (!selectedEnvId) return;
    try {
      await deleteEnvVariable(selectedEnvId, varId);
      const envs = await getEnvironments();
      setEnvironments(envs);
      toast.success("Variable deleted");
    } catch (err) {
      toast.error("Failed to delete variable");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-3xl h-[450px] bg-panel border border-border rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar/50">
          <span className="text-white font-bold text-sm">Manage Environments</span>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-white p-1 rounded hover:bg-border/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content - Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel - Environments list */}
          <div className="w-[200px] border-r border-border bg-sidebar/30 p-3 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-2">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block px-1">
                Environments
              </span>
              <div className="space-y-0.5">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    onClick={() => setSelectedEnvId(env.id)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors text-xs ${
                      selectedEnvId === env.id
                        ? "bg-accent/15 text-accent font-semibold border-l-2 border-accent"
                        : "text-text-secondary hover:bg-panel hover:text-text-primary border-l-2 border-transparent"
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">{env.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEnv(env.id, env.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-text-secondary hover:text-status-error hover:bg-border/30 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddEnvironment}
              className="mt-4 flex items-center justify-center space-x-1.5 px-3 py-1.5 border border-dashed border-border hover:border-accent hover:text-accent rounded text-xs text-text-secondary transition-all w-full font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Environment</span>
            </button>
          </div>

          {/* Right panel - Environment Variable Grid */}
          <div className="flex-1 p-4 flex flex-col overflow-hidden bg-canvas">
            {selectedEnv ? (
              <div className="h-full flex flex-col overflow-hidden space-y-3">
                <div className="flex items-center justify-between flex-none">
                  <h3 className="text-white font-bold text-sm truncate">{selectedEnv.name}</h3>
                  <span className="text-[10px] text-text-secondary italic">Auto-saves on input blur</span>
                </div>

                {/* Variable inputs table grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar border border-border/40 rounded bg-panel/10">
                  <table className="w-full border-collapse text-xs select-none">
                    <thead>
                      <tr className="bg-panel border-b border-border text-text-secondary font-medium">
                        <th className="w-8 py-1.5 px-2 border-r border-border text-center"></th>
                        <th className="py-1.5 px-3 border-r border-border text-left w-1/2">Variable</th>
                        <th className="py-1.5 px-3 border-r border-border text-left w-1/2">Value</th>
                        <th className="w-10 py-1.5 px-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {localVars.map((row, idx) => {
                        return (
                          <tr
                            key={row.id}
                            className="border-b border-border/30 hover:bg-panel/10 focus-within:bg-panel/15 transition-colors"
                          >
                            {/* Checkbox enabled toggle */}
                            <td className="py-1.5 px-2 border-r border-border/30 text-center">
                              {!row.isNew && (
                                <input
                                  type="checkbox"
                                  checked={row.enabled}
                                  onChange={() => handleToggleVar(idx, row.enabled)}
                                  className="accent-accent w-3 h-3 cursor-pointer"
                                />
                              )}
                            </td>

                            {/* Variable Key input */}
                            <td className="py-0 px-3 border-r border-border/30">
                              <input
                                type="text"
                                value={row.key}
                                onChange={(e) => handleLocalVarChange(idx, "key", e.target.value)}
                                onBlur={() => handleVarBlur(idx)}
                                placeholder="Variable Key"
                                className="w-full bg-transparent border-none py-1.5 text-text-primary focus:outline-none placeholder-text-secondary/40 font-mono"
                              />
                            </td>

                            {/* Variable Value input */}
                            <td className="py-0 px-3 border-r border-border/30">
                              <input
                                type="text"
                                value={row.value}
                                onChange={(e) => handleLocalVarChange(idx, "value", e.target.value)}
                                onBlur={() => handleVarBlur(idx)}
                                placeholder="Value"
                                className="w-full bg-transparent border-none py-1.5 text-text-primary focus:outline-none placeholder-text-secondary/40 font-mono"
                              />
                            </td>

                            {/* Delete variable button */}
                            <td className="py-1 px-2 text-center">
                              {!row.isNew && (
                                <button
                                  onClick={() => handleDeleteVar(row.id)}
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
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary text-xs italic">
                Create or select an environment from the sidebar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
