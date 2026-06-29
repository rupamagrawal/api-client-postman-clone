import { create } from "zustand";
import { Collection, Environment, EnvVariable, HistoryEntry, KeyValueRow, Tab } from "../types";
import { generateId } from "./utils";

interface AppState {
  tabs: Tab[];
  activeTabId: string;
  collections: Collection[];
  collectionsLoading: boolean;
  environments: Environment[];
  activeEnvId: string | null;
  history: HistoryEntry[];
  sidebarTab: "collections" | "history";
  
  // Modal visibility states
  newCollectionModalOpen: boolean;
  renameCollectionModalOpen: boolean;
  saveRequestModalOpen: boolean;
  environmentModalOpen: boolean;
  importModalOpen: boolean;
  globalSearchOpen: boolean;
  activeCollectionId: string | null;
  activeRequestId: string | null;
  tabIdToCloseAfterSave: string | null;
  
  // Actions
  addTab: (tab?: Partial<Tab> & { savedRequest?: any }) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  setCollections: (collections: Collection[]) => void;
  setCollectionsLoading: (loading: boolean) => void;
  setEnvironments: (environments: Environment[]) => void;
  setActiveEnv: (id: string | null) => void;
  setHistory: (history: HistoryEntry[]) => void;
  setSidebarTab: (tab: "collections" | "history") => void;
  
  // Modal toggles actions
  setNewCollectionModalOpen: (open: boolean) => void;
  setRenameCollectionModalOpen: (open: boolean) => void;
  setSaveRequestModalOpen: (open: boolean) => void;
  setEnvironmentModalOpen: (open: boolean) => void;
  setImportModalOpen: (open: boolean) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setActiveCollectionId: (id: string | null) => void;
  setActiveRequestId: (id: string | null) => void;
  setTabIdToCloseAfterSave: (id: string | null) => void;
  
  // Helpers
  getActiveEnvVariables: () => Record<string, string>;
}

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

const createBlankTab = (): Tab => {
  return {
    id: generateId(),
    name: "Untitled Request",
    method: "GET",
    url: "",
    params: [{ id: generateId(), enabled: true, key: "", value: "", description: "" }],
    headers: [{ id: generateId(), enabled: true, key: "", value: "", description: "" }],
    bodyType: "none",
    bodyContent: "",
    bodyRows: [{ id: generateId(), enabled: true, key: "", value: "", description: "" }],
    bodyRawFormat: "JSON",
    authType: "none",
    authConfig: {},
    response: null,
    loading: false,
    savedRequestId: null,
    isDirty: false,
  };
};

const mapRecordToRows = (record: Record<string, string> | null | undefined): KeyValueRow[] => {
  const rows = Object.entries(record || {}).map(([key, value]) => ({
    id: generateId(),
    enabled: true,
    key,
    value,
    description: "",
  }));
  // Always append one empty row for editing convenience
  rows.push({ id: generateId(), enabled: true, key: "", value: "", description: "" });
  return rows;
};

export const useAppStore = create<AppState>((set, get) => {
  // Initialize with one blank tab
  const initialTab = createBlankTab();

  return {
    tabs: [initialTab],
    activeTabId: initialTab.id,
    collections: [],
    collectionsLoading: true,
    environments: [],
    activeEnvId: null,
    history: [],
    sidebarTab: "collections",

    // Modals initial state
    newCollectionModalOpen: false,
    renameCollectionModalOpen: false,
    saveRequestModalOpen: false,
    environmentModalOpen: false,
    importModalOpen: false,
    globalSearchOpen: false,
    activeCollectionId: null,
    activeRequestId: null,
    tabIdToCloseAfterSave: null,

    addTab: (newTab) => {
      // If we are opening a saved request, check if it's already open in some tab
      if (newTab?.savedRequest?.id) {
        const existingTab = get().tabs.find(
          (t) => t.savedRequestId === newTab.savedRequest.id
        );
        if (existingTab) {
          set({ activeTabId: existingTab.id });
          return;
        }
      }

      let tabData: Tab;

      if (newTab?.savedRequest) {
        const req = newTab.savedRequest;
        tabData = {
          id: generateId(),
          name: req.name,
          method: req.method,
          url: req.url,
          params: mapRecordToRows(req.params),
          headers: mapRecordToRows(req.headers),
          bodyType: (req.bodyType as any) || "none",
          bodyContent: req.bodyContent || "",
          bodyRows: [{ id: generateId(), enabled: true, key: "", value: "", description: "" }],
          bodyRawFormat: inferRawFormatFromHeaders(req.headers),
          authType: (req.authType as any) || "none",
          authConfig: req.authConfig || {},
          response: null,
          loading: false,
          savedRequestId: req.id,
          isDirty: false,
        };
      } else {
        const id = newTab?.id || generateId();
        tabData = {
          id,
          name: newTab?.name || "Untitled Request",
          method: newTab?.method || "GET",
          url: newTab?.url || "",
          params: newTab?.params || [{ id: generateId(), enabled: true, key: "", value: "", description: "" }],
          headers: newTab?.headers || [{ id: generateId(), enabled: true, key: "", value: "", description: "" }],
          bodyType: newTab?.bodyType || "none",
          bodyContent: newTab?.bodyContent || "",
          bodyRows: newTab?.bodyRows || [{ id: generateId(), enabled: true, key: "", value: "", description: "" }],
          bodyRawFormat: newTab?.bodyRawFormat || "JSON",
          authType: newTab?.authType || "none",
          authConfig: newTab?.authConfig || {},
          response: newTab?.response || null,
          loading: newTab?.loading || false,
          savedRequestId: newTab?.savedRequestId || null,
          isDirty: newTab?.isDirty || false,
        };
      }

      set((state) => ({
        tabs: [...state.tabs, tabData],
        activeTabId: tabData.id,
      }));
    },

    closeTab: (id) => {
      const { tabs, activeTabId } = get();
      const index = tabs.findIndex((t) => t.id === id);
      
      if (index === -1) return;

      let nextActiveTabId = activeTabId;
      if (activeTabId === id) {
        if (tabs.length > 1) {
          if (index === tabs.length - 1) {
            nextActiveTabId = tabs[index - 1].id;
          } else {
            nextActiveTabId = tabs[index + 1].id;
          }
        } else {
          // Closing the only tab, create a new blank tab
          const newBlank = createBlankTab();
          set({
            tabs: [newBlank],
            activeTabId: newBlank.id,
          });
          return;
        }
      }

      set({
        tabs: tabs.filter((t) => t.id !== id),
        activeTabId: nextActiveTabId,
      });
    },

    setActiveTab: (id) => set({ activeTabId: id }),

    updateTab: (id, updates) => {
      set((state) => ({
        tabs: state.tabs.map((t) => {
          if (t.id !== id) return t;
          
          const dirtyFields = [
            "method",
            "url",
            "params",
            "headers",
            "bodyType",
            "bodyContent",
            "bodyRows",
            "authType",
            "authConfig"
          ];
          const isModifyingDirtyFields = Object.keys(updates).some((key) =>
            dirtyFields.includes(key)
          );

          const nextIsDirty = updates.hasOwnProperty("isDirty")
            ? updates.isDirty
            : isModifyingDirtyFields
            ? true
            : t.isDirty;

          return { ...t, ...updates, isDirty: nextIsDirty };
        }),
      }));
    },

    setCollections: (collections) => set({ collections }),

    setCollectionsLoading: (collectionsLoading) => set({ collectionsLoading }),

    setEnvironments: (environments) => set({ environments }),

    setActiveEnv: (id) => set({ activeEnvId: id }),

    setHistory: (history) => set({ history }),

    setSidebarTab: (sidebarTab) => set({ sidebarTab }),

    // Modal toggles actions
    setNewCollectionModalOpen: (newCollectionModalOpen) => set({ newCollectionModalOpen }),
    setRenameCollectionModalOpen: (renameCollectionModalOpen) => set({ renameCollectionModalOpen }),
    setSaveRequestModalOpen: (saveRequestModalOpen) => set({ saveRequestModalOpen }),
    setEnvironmentModalOpen: (environmentModalOpen) => set({ environmentModalOpen }),
    setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
    setGlobalSearchOpen: (globalSearchOpen) => set({ globalSearchOpen }),
    setActiveCollectionId: (activeCollectionId) => set({ activeCollectionId }),
    setActiveRequestId: (activeRequestId) => set({ activeRequestId }),
    setTabIdToCloseAfterSave: (tabIdToCloseAfterSave) => set({ tabIdToCloseAfterSave }),

    getActiveEnvVariables: () => {
      const { environments, activeEnvId } = get();
      if (!activeEnvId) return {};
      const env = environments.find((e) => e.id === activeEnvId);
      if (!env) return {};
      
      const flatVars: Record<string, string> = {};
      env.variables.forEach((v) => {
        if (v.enabled) {
          flatVars[v.key] = v.value;
        }
      });
      return flatVars;
    },
  };
});
