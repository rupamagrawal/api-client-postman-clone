export interface ParsedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  bodyContent: string;
}

function tokenize(cmd: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inDoubleQuotes = false;
  let inSingleQuotes = false;
  let escaped = false;

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i];
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"' && !inSingleQuotes) {
      inDoubleQuotes = !inDoubleQuotes;
      continue;
    }
    if (char === "'" && !inDoubleQuotes) {
      inSingleQuotes = !inSingleQuotes;
      continue;
    }
    if ((char === " " || char === "\t" || char === "\n" || char === "\r") && !inDoubleQuotes && !inSingleQuotes) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

export function parseCurl(curlCommand: string): ParsedRequest {
  const cleaned = curlCommand.replace(/\\\n/g, " ");
  const tokens = tokenize(cleaned);

  let method = "";
  let url = "";
  const headers: Record<string, string> = {};
  let bodyContent = "";

  const argsWithParams = new Set([
    "-X",
    "--request",
    "-H",
    "--header",
    "-d",
    "--data",
    "--data-raw",
    "--data-binary",
    "--data-urlencode",
    "--url",
  ]);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "curl") {
      continue;
    }

    if (token === "-X" || token === "--request") {
      if (i + 1 < tokens.length) {
        method = tokens[i + 1].toUpperCase();
        i++;
      }
    } else if (token === "-H" || token === "--header") {
      if (i + 1 < tokens.length) {
        const headerStr = tokens[i + 1];
        const colonIndex = headerStr.indexOf(":");
        if (colonIndex !== -1) {
          const key = headerStr.substring(0, colonIndex).trim();
          const value = headerStr.substring(colonIndex + 1).trim();
          headers[key] = value;
        }
        i++;
      }
    } else if (
      token === "-d" ||
      token === "--data" ||
      token === "--data-raw" ||
      token === "--data-binary" ||
      token === "--data-urlencode"
    ) {
      if (i + 1 < tokens.length) {
        bodyContent = tokens[i + 1];
        i++;
      }
    } else if (token === "--url") {
      if (i + 1 < tokens.length) {
        url = tokens[i + 1];
        i++;
      }
    } else if (!token.startsWith("-")) {
      const prevToken = i > 0 ? tokens[i - 1] : "";
      if (!argsWithParams.has(prevToken)) {
        if (!url) {
          url = token;
        }
      }
    }
  }

  if (!method) {
    method = bodyContent ? "POST" : "GET";
  }

  // Strip wrapping single or double quotes from URL if they exist
  if (url && ((url.startsWith("'") && url.endsWith("'")) || (url.startsWith('"') && url.endsWith('"')))) {
    url = url.substring(1, url.length - 1);
  }

  return {
    method,
    url,
    headers,
    bodyContent,
  };
}
