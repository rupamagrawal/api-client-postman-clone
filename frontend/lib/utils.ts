export const generateId = (): string => {
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
  } catch (e) {
    // Fallback to random generator
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const resolveVariables = (text: string, vars: Record<string, string>): string => {
  if (!text) return "";
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return vars[trimmedKey] !== undefined ? vars[trimmedKey] : match;
  });
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0 || isNaN(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatTime = (ms: number): string => {
  if (ms === 0 || isNaN(ms)) return "0 ms";
  if (ms < 1000) {
    return `${ms} ms`;
  }
  return `${(ms / 1000).toFixed(2)} s`;
};

export const timeAgo = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    return `${days}d ago`;
  } catch (e) {
    return "";
  }
};

export const getMethodColor = (method: string): string => {
  const m = method?.toUpperCase() || "";
  switch (m) {
    case "GET":
      return "text-method-get";
    case "POST":
      return "text-method-post";
    case "PUT":
      return "text-method-put";
    case "PATCH":
      return "text-method-patch";
    case "DELETE":
      return "text-method-delete";
    default:
      return "text-text-secondary";
  }
};

export const getTabNameFromUrl = (urlStr: string, defaultName: string = "Untitled Request"): string => {
  const trimmed = urlStr.trim();
  if (!trimmed) return defaultName;

  try {
    let urlToParse = trimmed;
    if (!/^https?:\/\//i.test(trimmed)) {
      urlToParse = "http://" + trimmed;
    }
    const url = new URL(urlToParse);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      return segments[segments.length - 1];
    }
    if (url.hostname) {
      return url.hostname;
    }
  } catch (e) {
    const cleanUrl = trimmed.replace(/^https?:\/\//i, "");
    const parts = cleanUrl.split("/").filter(Boolean);
    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      const qIdx = last.indexOf("?");
      if (qIdx !== -1) {
        return last.substring(0, qIdx) || defaultName;
      }
      return last;
    }
  }
  return defaultName;
};
