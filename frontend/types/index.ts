export interface KeyValueRow {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
  description: string;
}

export interface Tab {
  id: string;
  name: string;
  method: string;
  url: string;
  params: KeyValueRow[];
  headers: KeyValueRow[];
  bodyType: "none" | "raw" | "form-data" | "urlencoded";
  bodyContent: string;
  bodyRows: KeyValueRow[];
  bodyRawFormat?: string;
  authType: "none" | "bearer" | "basic";
  authConfig: Record<string, string>;
  response: ResponseData | null;
  loading: boolean;
  savedRequestId: string | null;
  isDirty: boolean;
}

export interface ResponseData {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  timeMs: number;
  sizeBytes: number;
  error?: string;
  errorType?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  requests: SavedRequest[];
}

export interface SavedRequest {
  id: string;
  collectionId: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  bodyType: string;
  bodyContent: string;
  authType: string;
  authConfig: Record<string, string>;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
}

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface HistoryEntry {
  id: string;
  method: string;
  url: string;
  responseStatus: number;
  responseTimeMs: number;
  executedAt: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  bodyType?: string;
  bodyContent?: string;
  authType?: string;
  authConfig?: Record<string, string>;
}
