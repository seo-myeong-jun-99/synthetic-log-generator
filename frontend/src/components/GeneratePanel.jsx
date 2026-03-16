// src/components/GeneratePanel.jsx
import React, { useState } from "react";
import { runGenerator } from "../api/client";

export default function GeneratePanel({ config }) {
  const [status, setStatus]   = useState("idle");   // idle | loading | done | error
  const [result, setResult]   = useState(null);
  const [preview, setPreview] = useState(null);

  const handleRun = async () => {
    setStatus("loading");
    setResult(null);
    try {
      const res = await runGenerator(config);
      setResult(res.data);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>🚀 Generator</h2>
      <p style={styles.desc}>
        설정이 완료되면 아래 버튼으로 합성 로그를 생성합니다.
      </p>

      <button
        onClick={handleRun}
        disabled={status === "loading"}
        style={{ ...styles.btn, ...(status === "loading" ? styles.btnDisabled : {}) }}
      >
        {status === "loading" ? "⏳ 생성 중..." : "▶ 로그 생성 시작"}
      </button>

      {/* 결과 요약 */}
      {status === "done" && result && (
        <div style={styles.resultBox}>
          <p style={styles.resultTitle}>✅ 생성 완료!</p>
          <div style={styles.statsRow}>
            <Stat label="Job ID"       value={result.job_id} />
            <Stat label="총 세션"      value={result.total_sessions.toLocaleString()} />
            <Stat label="총 이벤트"    value={result.total_events.toLocaleString()} />
          </div>
          <div style={styles.dlRow}>
            <a href={`http://localhost:8000/api/export/json/${result.job_id}`} style={styles.dlBtn} download>
              ⬇ JSON 다운로드
            </a>
            <a href={`http://localhost:8000/api/export/csv/${result.job_id}`} style={{ ...styles.dlBtn, background: "#0f172a" }} download>
              ⬇ CSV 다운로드
            </a>
          </div>
        </div>
      )}

      {status === "error" && (
        <div style={styles.errorBox}>⚠️ 생성 중 오류가 발생했습니다. 콘솔을 확인하세요.</div>
      )}

      {/* 미리보기 (처음 5개) */}
      {result && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>생성된 데이터 미리보기 (최신 5개 이벤트)</p>
          <pre style={styles.pre}>
            {JSON.stringify({ note: "파일을 다운로드하여 전체 데이터를 확인하세요.", job_id: result.job_id }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
    </div>
  );
}

const styles = {
  card:       { background: "#fff", borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,.08)" },
  title:      { margin: "0 0 8px", fontSize: 16, fontWeight: 700 },
  desc:       { fontSize: 13, color: "#64748b", marginBottom: 16 },
  btn:        { padding: "12px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 },
  btnDisabled:{ background: "#93c5fd", cursor: "not-allowed" },
  resultBox:  { marginTop: 20, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: 16 },
  resultTitle:{ margin: "0 0 12px", fontWeight: 700, color: "#15803d" },
  statsRow:   { display: "flex", gap: 24, marginBottom: 12 },
  dlRow:      { display: "flex", gap: 8 },
  dlBtn:      { padding: "7px 16px", background: "#15803d", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 13 },
  errorBox:   { marginTop: 16, padding: 12, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, color: "#b91c1c", fontSize: 13 },
  pre:        { background: "#1e293b", color: "#e2e8f0", padding: 12, borderRadius: 8, fontSize: 11, overflowX: "auto" },
};
