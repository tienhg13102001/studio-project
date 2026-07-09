// API client for the /bao-gia quote builder. Calls the Google Apps Script
// doPost web app directly (NOT the axios apiClient in src/lib/api.ts) —
// see back-end/scripts/google/Mã.gs. Content-Type MUST stay text/plain to
// avoid a CORS preflight that Apps Script cannot answer.

import type {
  ActionType,
  InitialData,
  ProcessPayload,
  ProcessResult,
  QuoteFile,
  QuoteForm,
} from "./types";

async function callScript<T>(action: string, payload?: unknown): Promise<T> {
  const url = import.meta.env.VITE_QUOTE_SCRIPT_URL;
  if (!url) {
    throw new Error("VITE_QUOTE_SCRIPT_URL chưa cấu hình");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, payload: payload ?? {} }),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Quote script request failed: ${res.status} ${res.statusText}`);
  }

  try {
    const json = await res.json();
    return json as T;
  } catch {
    throw new Error("Không đọc được phản hồi từ Google Apps Script (JSON không hợp lệ)");
  }
}

export function getInitialData(): Promise<InitialData> {
  return callScript<InitialData>("getInitialData");
}

export function getQuoteFiles(): Promise<QuoteFile[]> {
  return callScript<QuoteFile[]>("getQuoteFiles");
}

export function getQuoteDataFromFile(fileId: string): Promise<{
  success: boolean;
  sheetNames?: string[];
  savedData?: Record<string, QuoteForm>;
  message?: string;
}> {
  return callScript("getQuoteDataFromFile", { fileId });
}

export function processQuoteDocument(payload: ProcessPayload): Promise<ProcessResult> {
  return callScript<ProcessResult>("processQuoteDocument", payload);
}

export function rollbackProcess(payload: {
  actionType: ActionType;
  resultData: ProcessResult;
  targetOptionName: string;
}): Promise<{ success: boolean; message?: string }> {
  return callScript("rollbackProcess", payload);
}
