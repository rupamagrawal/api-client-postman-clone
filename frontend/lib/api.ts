import axios from "axios";
import { Collection, Environment, EnvVariable, HistoryEntry, ResponseData, SavedRequest } from "../types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to convert frontend camelCase tab/request data to backend snake_case
const mapToBackendRequest = (data: Partial<SavedRequest> | any) => {
  return {
    name: data.name,
    method: data.method,
    url: data.url,
    headers: data.headers,
    params: data.params,
    body_type: data.bodyType || data.body_type || "none",
    body_content: data.bodyContent || data.body_content,
    auth_type: data.authType || data.auth_type || "none",
    auth_config: data.authConfig || data.auth_config,
  };
};

export const runRequest = async (payload: {
  method: string;
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  bodyType: string;
  bodyContent: string;
  authType: string;
  authConfig: Record<string, string>;
  environmentVariables: Record<string, string>;
}): Promise<ResponseData> => {
  const backendPayload = {
    method: payload.method,
    url: payload.url,
    headers: payload.headers,
    params: payload.params,
    body_type: payload.bodyType,
    body_content: payload.bodyContent,
    auth_type: payload.authType,
    auth_config: payload.authConfig,
    environment_variables: payload.environmentVariables,
  };
  const response = await api.post("/api/run", backendPayload);
  return {
    statusCode: response.data.status_code,
    headers: response.data.headers,
    body: response.data.body,
    timeMs: response.data.time_ms,
    sizeBytes: response.data.size_bytes,
    error: response.data.error,
    errorType: response.data.error_type,
  };
};

// Collections
export const getCollections = async (): Promise<Collection[]> => {
  const response = await api.get("/api/collections");
  // Map backend structure (body_type, body_content, auth_type, auth_config) to frontend camelCase
  return response.data.map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description || "",
    requests: (c.requests || []).map((r: any) => ({
      id: r.id,
      collectionId: r.collection_id,
      name: r.name,
      method: r.method,
      url: r.url,
      headers: r.headers || {},
      params: r.params || {},
      bodyType: r.body_type,
      bodyContent: r.body_content || "",
      authType: r.auth_type,
      authConfig: r.auth_config || {},
    })),
  }));
};

export const createCollection = async (data: {
  name: string;
  description?: string;
}): Promise<Collection> => {
  const response = await api.post("/api/collections", data);
  return {
    id: response.data.id,
    name: response.data.name,
    description: response.data.description || "",
    requests: [],
  };
};

export const updateCollection = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<Collection> => {
  const response = await api.put(`/api/collections/${id}`, data);
  return {
    id: response.data.id,
    name: response.data.name,
    description: response.data.description || "",
    requests: [],
  };
};

export const deleteCollection = async (id: string): Promise<void> => {
  await api.delete(`/api/collections/${id}`);
};

// Saved Requests
export const saveRequest = async (
  collectionId: string,
  data: Omit<SavedRequest, "id" | "collectionId">
): Promise<SavedRequest> => {
  const backendData = mapToBackendRequest(data);
  const response = await api.post(`/api/collections/${collectionId}/requests`, backendData);
  return {
    id: response.data.id,
    collectionId: response.data.collection_id,
    name: response.data.name,
    method: response.data.method,
    url: response.data.url,
    headers: response.data.headers || {},
    params: response.data.params || {},
    bodyType: response.data.body_type,
    bodyContent: response.data.body_content || "",
    authType: response.data.auth_type,
    authConfig: response.data.auth_config || {},
  };
};

export const updateRequest = async (
  id: string,
  data: Partial<Omit<SavedRequest, "id">>
): Promise<SavedRequest> => {
  const backendData = mapToBackendRequest(data);
  const response = await api.put(`/api/requests/${id}`, backendData);
  return {
    id: response.data.id,
    collectionId: response.data.collection_id,
    name: response.data.name,
    method: response.data.method,
    url: response.data.url,
    headers: response.data.headers || {},
    params: response.data.params || {},
    bodyType: response.data.body_type,
    bodyContent: response.data.body_content || "",
    authType: response.data.auth_type,
    authConfig: response.data.auth_config || {},
  };
};

export const deleteRequest = async (id: string): Promise<void> => {
  await api.delete(`/api/requests/${id}`);
};

// Environments
export const getEnvironments = async (): Promise<Environment[]> => {
  const response = await api.get("/api/environments");
  return response.data;
};

export const createEnvironment = async (data: { name: string }): Promise<Environment> => {
  const response = await api.post("/api/environments", data);
  return response.data;
};

export const updateEnvironment = async (
  id: string,
  data: { name: string }
): Promise<Environment> => {
  const response = await api.put(`/api/environments/${id}`, data);
  return response.data;
};

export const deleteEnvironment = async (id: string): Promise<void> => {
  await api.delete(`/api/environments/${id}`);
};

// Environment Variables
export const addEnvVariable = async (
  envId: string,
  data: { key: string; value: string; enabled: boolean }
): Promise<EnvVariable> => {
  const response = await api.post(`/api/environments/${envId}/variables`, data);
  return response.data;
};

export const updateEnvVariable = async (
  envId: string,
  varId: string,
  data: { key?: string; value?: string; enabled?: boolean }
): Promise<EnvVariable> => {
  const response = await api.put(`/api/environments/${envId}/variables/${varId}`, data);
  return response.data;
};

export const deleteEnvVariable = async (envId: string, varId: string): Promise<void> => {
  await api.delete(`/api/environments/${envId}/variables/${varId}`);
};

// History
export const getHistory = async (): Promise<HistoryEntry[]> => {
  const response = await api.get("/api/history");
  return response.data.map((h: any) => ({
    id: h.id,
    method: h.method,
    url: h.url,
    responseStatus: h.response_status,
    responseTimeMs: h.response_time_ms,
    executedAt: h.executed_at,
    headers: h.headers || {},
    params: h.params || {},
    bodyType: h.body_type || "none",
    bodyContent: h.body_content || "",
    authType: h.auth_type || "none",
    authConfig: h.auth_config || {},
  }));
};

export const deleteHistory = async (id: string): Promise<void> => {
  await api.delete(`/api/history/${id}`);
};

export const clearHistory = async (): Promise<void> => {
  await api.delete("/api/history");
};

export default api;
