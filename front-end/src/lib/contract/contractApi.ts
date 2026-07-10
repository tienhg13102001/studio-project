// API client for the /hop-dong contract builder. Calls the Google Apps Script
// doPost web app directly (NOT the axios apiClient in src/lib/api.ts) —
// see back-end/scripts/google/hop-dong/Mã.gs. Content-Type MUST stay text/plain
// to avoid a CORS preflight that Apps Script cannot answer. Sibling of
// src/lib/quote/quoteApi.ts.

import type {
  BaoGiaDataResult,
  BaoGiaFile,
  BBNTPayload,
  CheckSohdResult,
  ContractFile,
  ContractForm,
  ContractLive,
  InitialData,
  ProcessContractPayload,
  ProcessContractResult,
  ProcessDocResult,
  DNTTPayload,
} from "./types";

async function callScript<T>(action: string, payload?: unknown): Promise<T> {
  const url = import.meta.env.VITE_CONTRACT_SCRIPT_URL;
  if (!url) {
    throw new Error("VITE_CONTRACT_SCRIPT_URL chưa cấu hình");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, payload: payload ?? {} }),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Contract script request failed: ${res.status} ${res.statusText}`);
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

/** NOTE: backend returns a BARE ARRAY (not a {success} wrapper). */
export function getContractFiles(): Promise<ContractFile[]> {
  return callScript<ContractFile[]>("getContractFiles");
}

export function getContractData(fileId: string): Promise<{
  success: boolean;
  formData?: ContractForm;
  message?: string;
}> {
  return callScript("getContractData", { fileId });
}

export function checkSohdExists(sohdDate: string, brand: string): Promise<CheckSohdResult> {
  return callScript<CheckSohdResult>("checkSohdExists", { sohdDate, brand });
}

/** NOTE: backend returns a BARE ARRAY (not a {success} wrapper). */
export function getBaoGiaFiles(): Promise<BaoGiaFile[]> {
  return callScript<BaoGiaFile[]>("getBaoGiaFiles");
}

export function getBaoGiaDataFromFile(fileId: string): Promise<BaoGiaDataResult> {
  return callScript<BaoGiaDataResult>("getBaoGiaDataFromFile", { fileId });
}

export function processContract(
  payload: ProcessContractPayload,
): Promise<ProcessContractResult> {
  return callScript<ProcessContractResult>("processContract", payload);
}

export function rollbackContract(payload: {
  actionType: ProcessContractPayload["actionType"];
  resultData: ProcessContractResult;
}): Promise<{ success: boolean; message?: string }> {
  return callScript("rollbackContract", payload);
}

export function getContractDataLive(fileId: string): Promise<ContractLive> {
  return callScript<ContractLive>("getContractDataLive", { fileId });
}

export function processBBNT(payload: BBNTPayload): Promise<ProcessDocResult> {
  return callScript<ProcessDocResult>("processBBNT", payload);
}

export function processDNTT(payload: DNTTPayload): Promise<ProcessDocResult> {
  return callScript<ProcessDocResult>("processDNTT", payload);
}
