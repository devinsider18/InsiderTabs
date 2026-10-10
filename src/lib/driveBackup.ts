const backupFileName = "LiberTab backup.json";
const storagePrefix = "libretab:";
const driveScope = "https://www.googleapis.com/auth/drive.file";

interface LiberTabBackup {
  app: "libretab";
  version: 1;
  createdAt: string;
  entries: Array<[string, string]>;
}

interface DriveFile {
  id: string;
  name: string;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

interface GoogleIdentity {
  accounts?: {
    oauth2?: {
      initTokenClient(options: {
        client_id: string;
        scope: string;
        callback(response: GoogleTokenResponse): void;
        error_callback?(error: { type: string; message?: string }): void;
      }): GoogleTokenClient;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

let googleScriptPromise: Promise<void> | undefined;

function getClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error(
      "Google Drive is not configured. Set VITE_GOOGLE_CLIENT_ID in your local .env file.",
    );
  }
  return clientId;
}

function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  let scriptPromise = googleScriptPromise;
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.oauth2) {
          resolve();
        } else {
          reject(new Error("Google sign-in could not be initialized."));
        }
      };
      script.onerror = () => reject(new Error("Could not load Google sign-in."));
      document.head.append(script);
    }).catch((error: unknown) => {
      googleScriptPromise = undefined;
      throw error;
    });
    googleScriptPromise = scriptPromise;
  }

  return scriptPromise;
}

export async function requestDriveAccess(prompt = "consent"): Promise<string> {
  const clientId = getClientId();
  await loadGoogleIdentity();

  const initTokenClient = window.google?.accounts?.oauth2?.initTokenClient;
  if (!initTokenClient) {
    throw new Error("Google sign-in could not be initialized.");
  }

  return new Promise((resolve, reject) => {
    const tokenClient = initTokenClient({
      client_id: clientId,
      scope: driveScope,
      callback(response) {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description ?? response.error ?? "Google access was not granted."));
          return;
        }
        resolve(response.access_token);
      },
      error_callback(error) {
        reject(new Error(error.message ?? `Google sign-in failed (${error.type}).`));
      },
    });
    tokenClient.requestAccessToken({ prompt });
  });
}

export function createLocalBackup(): LiberTabBackup {
  const entries: Array<[string, string]> = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(storagePrefix)) {
      const value = localStorage.getItem(key);
      if (value !== null) entries.push([key, value]);
    }
  }

  return {
    app: "libretab",
    version: 1,
    createdAt: new Date().toISOString(),
    entries,
  };
}

function parseBackup(raw: string): LiberTabBackup {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("This file is not valid JSON.");
  }

  if (
    typeof value !== "object" ||
    value === null ||
    !("app" in value) ||
    value.app !== "libretab" ||
    !("version" in value) ||
    value.version !== 1 ||
    !("entries" in value) ||
    !Array.isArray(value.entries)
  ) {
    throw new Error("This file is not a LiberTab backup.");
  }

  const entries: Array<[string, string]> = [];
  for (const entry of value.entries) {
    if (
      !Array.isArray(entry) ||
      entry.length !== 2 ||
      typeof entry[0] !== "string" ||
      !entry[0].startsWith(storagePrefix) ||
      typeof entry[1] !== "string"
    ) {
      throw new Error("The backup contains an unsupported data entry.");
    }
    entries.push([entry[0], entry[1]]);
  }

  return {
    app: "libretab",
    version: 1,
    createdAt: "createdAt" in value && typeof value.createdAt === "string" ? value.createdAt : "",
    entries,
  };
}

export function restoreLocalBackup(raw: string): number {
  const backup = parseBackup(raw);
  const previousEntries: Array<[string, string]> = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(storagePrefix)) {
      const value = localStorage.getItem(key);
      if (value !== null) previousEntries.push([key, value]);
    }
  }

  try {
    previousEntries.forEach(([key]) => localStorage.removeItem(key));
    backup.entries.forEach(([key, value]) => localStorage.setItem(key, value));
  } catch (error) {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(storagePrefix)) localStorage.removeItem(key);
    }
    previousEntries.forEach(([key, value]) => localStorage.setItem(key, value));
    throw error;
  }

  return backup.entries.length;
}

export function downloadLocalBackup(): void {
  const file = new Blob([JSON.stringify(createLocalBackup(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "libretab-backup.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function driveRequest<T>(url: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Drive request failed (${response.status}): ${detail || response.statusText}`);
  }

  if (response.status === 204) {
    throw new Error("Google Drive returned an empty response for a request that expected data.");
  }
  return response.json() as Promise<T>;
}

async function findLatestBackup(token: string): Promise<DriveFile | undefined> {
  const query = encodeURIComponent(`name = '${backupFileName}' and trashed = false`);
  const fields = encodeURIComponent("files(id,name)");
  const result = await driveRequest<{ files?: DriveFile[] }>(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime%20desc&pageSize=1&fields=${fields}`,
    token,
  );
  return result.files?.[0];
}

export async function saveBackupToDrive(token: string): Promise<void> {
  const backup = JSON.stringify(createLocalBackup(), null, 2);
  const existingFile = await findLatestBackup(token);

  if (existingFile) {
    await driveRequest<void>(
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingFile.id)}?uploadType=media`,
      token,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: backup,
      },
    );
    return;
  }

  const boundary = `libretab_${Date.now()}`;
  const metadata = JSON.stringify({ name: backupFileName, mimeType: "application/json" });
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    metadata,
    `--${boundary}`,
    "Content-Type: application/json",
    "",
    backup,
    `--${boundary}--`,
    "",
  ].join("\r\n");

  await driveRequest<DriveFile>(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    token,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
  );
}

export async function restoreBackupFromDrive(token: string): Promise<number> {
  const backup = await findLatestBackup(token);
  if (!backup) throw new Error("No LiberTab backup was found in this Google Drive.");

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(backup.id)}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Could not read the Drive backup (${response.status}): ${detail || response.statusText}`);
  }
  return restoreLocalBackup(await response.text());
}

export function getLocalDataEntryCount(): number {
  let count = 0;
  for (let index = 0; index < localStorage.length; index += 1) {
    if (localStorage.key(index)?.startsWith(storagePrefix)) count += 1;
  }
  return count;
}
