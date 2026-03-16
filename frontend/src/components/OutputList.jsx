// src/components/OutputList.jsx
import React, { useState, useEffect } from "react";
import { listOutputs, downloadJson, downloadCsv } from "../api/client";

export default function OutputList() {
  const [files, setFiles] = useState([]);

  const refresh = () =>
    listOutputs().then((r) => setFiles(r.data.files || []));

  useEffect(() => { refresh(); }, []);

  // job_id만 추출 (확장자 제거 + 중복 제거)
  const jobIds = [...new Set(files.map((f) => f.replace(/\.(json|csv)$/, "")))];

  if (jobIds.length === 0)
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>📂 생성 이력</h2>
        <p style={styles.empty}>아직 생성된 파일이 없습니다.</p>
      </div>
    );

  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={styles.title}>📂 생성 이력</h2>
        <button onClick={refresh} style={styles.refreshBtn}>🔄 새로고침</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            {["Job ID", "JSON", "CSV"].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobIds.map((id) => (
            <tr key={id}>
              <td style={styles.td}><code>{id}</code></td>
              <td style={styles.td}>
                <a href={downloadJson(id)} style={styles.link} download>⬇ JSON</a>
              </td>
              <td style={styles.td}>
                <a href={downloadCsv(id)} style={{ ...styles.link, color: "#0f172a" }} download>⬇ CSV</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  card:       { background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.08)" },
  title:      { margin: "0 0 12px", fontSize: 16, fontWeight: 700 },
  empty:      { color: "#94a3b8", fontSize: 13 },
  refreshBtn: { padding: "5px 12px", border: "1px solid #cbd5e1", background: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 12 },
  table:      { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:         { background: "#f8fafc", padding: "6px 10px", textAlign: "left", borderBottom: "1px solid #e2e8f0", fontWeight: 600 },
  td:         { padding: "6px 10px", borderBottom: "1px solid #f1f5f9" },
  link:       { color: "#2563eb", textDecoration: "none", fontWeight: 500 },
};
