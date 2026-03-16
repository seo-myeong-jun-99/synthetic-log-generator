// src/pages/App.jsx  ── 메인 페이지
import React, { useState, useEffect } from "react";
import GraphEditor from "../components/GraphEditor";
import SessionConfig from "../components/SessionConfig";
import ProductConfig from "../components/ProductConfig";
import GeneratePanel from "../components/GeneratePanel";
import OutputList from "../components/OutputList";
import { getDefaultConfig, saveConfig } from "../api/client";

export default function App() {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState("graph");

  useEffect(() => {
    getDefaultConfig().then((res) => setConfig(res.data));
  }, []);

  const updateConfig = (patch) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const handleSave = () => {
    saveConfig(config).then(() => alert("설정이 저장되었습니다."));
  };

  if (!config) return <div style={styles.loading}>로딩 중...</div>;

  return (
    <div style={styles.root}>
      {/* ── Header ─────────────────────────────── */}
      <header style={styles.header}>
        <h1 style={styles.title}>🔧 Synthetic Log Generator</h1>
        <span style={styles.subtitle}>모바일 앱 사용자 행동 합성 데이터 생성기</span>
      </header>

      <div style={styles.layout}>
        {/* ── Left: Input Editor ─────────────────── */}
        <aside style={styles.sidebar}>
          <h2 style={styles.sectionTitle}>⚙️ Input Editor</h2>

          {/* 날짜/유저 설정 */}
          <div style={styles.card}>
            <label style={styles.label}>시작 날짜</label>
            <input
              type="date"
              value={config.start_date}
              onChange={(e) => updateConfig({ start_date: e.target.value })}
              style={styles.input}
            />
            <label style={styles.label}>종료 날짜</label>
            <input
              type="date"
              value={config.end_date}
              onChange={(e) => updateConfig({ end_date: e.target.value })}
              style={styles.input}
            />
            <label style={styles.label}>유저 수</label>
            <input
              type="number"
              value={config.num_users}
              min={1}
              max={10000}
              onChange={(e) =>
                updateConfig({ num_users: parseInt(e.target.value) })
              }
              style={styles.input}
            />
          </div>

          {/* 탭 전환 */}
          <div style={styles.tabs}>
            {["graph", "session", "product"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === t ? styles.tabActive : {}),
                }}
              >
                {t === "graph" ? "이동 그래프" : t === "session" ? "세션 분포" : "상품 데이터"}
              </button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === "graph" && (
              <GraphEditor
                onChange={(graph) => updateConfig({ navigation_graph: graph })}
              />
            )}
            {activeTab === "session" && (
              <SessionConfig
                config={config.session_config}
                onChange={(sc) => updateConfig({ session_config: sc })}
              />
            )}
            {activeTab === "product" && (
              <ProductConfig
                products={config.products}
                onChange={(p) => updateConfig({ products: p })}
              />
            )}
          </div>

          <button onClick={handleSave} style={styles.saveBtn}>
            💾 설정 저장
          </button>
        </aside>

        {/* ── Right: Generate + Output ────────────── */}
        <main style={styles.main}>
          <GeneratePanel config={config} />
          <OutputList />
        </main>
      </div>
    </div>
  );
}

// ── 인라인 스타일 ────────────────────────────────────────────────────────────
const styles = {
  root:         { fontFamily: "Pretendard, sans-serif", minHeight: "100vh", background: "#f1f5f9" },
  loading:      { padding: 40, textAlign: "center" },
  header:       { background: "#1e40af", color: "#fff", padding: "16px 32px", display: "flex", alignItems: "center", gap: 16 },
  title:        { margin: 0, fontSize: 22 },
  subtitle:     { fontSize: 13, opacity: 0.8 },
  layout:       { display: "flex", gap: 24, padding: 24, alignItems: "flex-start" },
  sidebar:      { width: 560, flexShrink: 0 },
  main:         { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 12 },
  card:         { background: "#fff", borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,.08)" },
  label:        { display: "block", fontSize: 12, color: "#64748b", marginBottom: 4, marginTop: 10 },
  input:        { width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, boxSizing: "border-box" },
  tabs:         { display: "flex", gap: 8, marginBottom: 12 },
  tabBtn:       { flex: 1, padding: "7px 0", border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13 },
  tabActive:    { background: "#3b82f6", color: "#fff", border: "1px solid #3b82f6" },
  saveBtn:      { width: "100%", padding: "10px 0", background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 },
};
