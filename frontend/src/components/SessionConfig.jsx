// src/components/SessionConfig.jsx
import React from "react";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function SessionConfig({ config, onChange }) {
  const update = (patch) => onChange({ ...config, ...patch });

  const updateHour = (i, val) => {
    const weights = [...config.time_distribution.hour_weights];
    weights[i] = parseFloat(val) || 0;
    update({ time_distribution: { hour_weights: weights } });
  };

  const updateDay = (i, val) => {
    const weights = [...config.day_distribution.day_weights];
    weights[i] = parseFloat(val) || 0;
    update({ day_distribution: { day_weights: weights } });
  };

  return (
    <div>
      <label style={styles.label}>하루 세션 수</label>
      <input
        type="number"
        value={config.sessions_per_day}
        min={1}
        onChange={(e) => update({ sessions_per_day: parseInt(e.target.value) })}
        style={styles.input}
      />

      <label style={styles.label}>세션당 평균 이벤트 수</label>
      <input
        type="number"
        value={config.avg_events_per_session}
        min={1}
        onChange={(e) => update({ avg_events_per_session: parseInt(e.target.value) })}
        style={styles.input}
      />

      <label style={styles.label}>요일별 가중치</label>
      <div style={styles.row}>
        {DAYS.map((d, i) => (
          <div key={d} style={styles.cell}>
            <span style={styles.dayLabel}>{d}</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={config.day_distribution.day_weights[i]}
              onChange={(e) => updateDay(i, e.target.value)}
              style={styles.smallInput}
            />
          </div>
        ))}
      </div>

      <label style={styles.label}>시간대별 가중치 (0~23시)</label>
      <div style={styles.hourGrid}>
        {config.time_distribution.hour_weights.map((w, i) => (
          <div key={i} style={styles.cell}>
            <span style={styles.dayLabel}>{i}시</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={w}
              onChange={(e) => updateHour(i, e.target.value)}
              style={styles.smallInput}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  label:      { display: "block", fontSize: 12, color: "#64748b", marginBottom: 4, marginTop: 12 },
  input:      { width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, boxSizing: "border-box" },
  row:        { display: "flex", gap: 4, flexWrap: "wrap" },
  hourGrid:   { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginTop: 4 },
  cell:       { display: "flex", flexDirection: "column", alignItems: "center" },
  dayLabel:   { fontSize: 10, color: "#94a3b8" },
  smallInput: { width: 44, padding: "3px 4px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 11, textAlign: "center" },
};
