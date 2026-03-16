// src/api/client.js  ── 백엔드 API 호출 모듈
import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE });

// ── Config ──────────────────────────────────────────────────────────────────
export const getDefaultConfig  = () => api.get("/api/config/default");
export const saveConfig        = (cfg) => api.post("/api/config/save", cfg);
export const loadConfig        = () => api.get("/api/config/load");

// ── Generate ────────────────────────────────────────────────────────────────
export const runGenerator      = (cfg)     => api.post("/api/generate/run", cfg);
export const previewGenerator  = (cfg)     => api.get("/api/generate/preview", { params: cfg });

// ── Export ──────────────────────────────────────────────────────────────────
export const listOutputs       = () => api.get("/api/export/list");
export const downloadJson      = (jobId) => `${BASE}/api/export/json/${jobId}`;
export const downloadCsv       = (jobId) => `${BASE}/api/export/csv/${jobId}`;
