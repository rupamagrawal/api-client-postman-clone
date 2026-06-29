import { createCollection, saveRequest, getCollections } from "./api";
import { Collection } from "../types";

interface PostmanHeader {
  key?: string;
  value?: string;
}

interface PostmanRequestItem {
  name?: string;
  request?: {
    method?: string;
    url?: string | { raw?: string };
    header?: PostmanHeader[];
    body?: {
      mode?: string;
      raw?: string;
    };
  };
}

export async function importPostmanCollection(jsonText: string): Promise<Collection[]> {
  const json = JSON.parse(jsonText);

  if (!json.info || !json.info.name || !Array.isArray(json.item)) {
    throw new Error("Invalid Postman Collection v2.1 format");
  }

  const createdCol = await createCollection({
    name: json.info.name,
    description: json.info.description || "Imported collection",
  });

  const items: PostmanRequestItem[] = json.item;
  for (const item of items) {
    if (!item.request) continue;

    const req = item.request;
    const name = item.name || "Imported Request";
    const method = req.method || "GET";

    let url = "";
    if (typeof req.url === "string") {
      url = req.url;
    } else if (req.url && typeof req.url === "object") {
      url = req.url.raw || "";
    }

    const headers: Record<string, string> = {};
    if (Array.isArray(req.header)) {
      req.header.forEach((h) => {
        if (h.key) headers[h.key] = h.value || "";
      });
    }

    const params: Record<string, string> = {};
    const qIndex = url.indexOf("?");
    if (qIndex !== -1) {
      const queryStr = url.substring(qIndex + 1);
      const pairs = queryStr.split("&");
      pairs.forEach((p) => {
        if (!p) return;
        const eqIdx = p.indexOf("=");
        if (eqIdx === -1) {
          params[decodeURIComponent(p)] = "";
        } else {
          params[decodeURIComponent(p.substring(0, eqIdx))] = decodeURIComponent(
            p.substring(eqIdx + 1)
          );
        }
      });
    }

    let bodyType: "none" | "raw" = "none";
    let bodyContent = "";
    if (req.body?.mode === "raw") {
      bodyType = "raw";
      bodyContent = req.body.raw || "";
    }

    await saveRequest(createdCol.id, {
      name,
      method,
      url,
      headers,
      params,
      bodyType,
      bodyContent,
      authType: "none",
      authConfig: {},
    });
  }

  return await getCollections();
}
