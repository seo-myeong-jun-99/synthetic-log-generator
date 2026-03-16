// src/components/ProductConfig.jsx
import React, { useState } from "react";

const EMPTY = { product_id: "", product_name: "", category: "", price: 0, currency: "Korean Won", in_stock: true };

export default function ProductConfig({ products, onChange }) {
  const [form, setForm] = useState(EMPTY);

  const add = () => {
    if (!form.product_id || !form.product_name) return alert("ID와 상품명은 필수입니다.");
    onChange([...products, { ...form, price: parseInt(form.price) }]);
    setForm(EMPTY);
  };

  const remove = (i) => onChange(products.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={styles.grid}>
        {[
          ["product_id",   "상품 ID",   "text"],
          ["product_name", "상품명",    "text"],
          ["category",     "카테고리",  "text"],
          ["price",        "가격",      "number"],
        ].map(([key, label, type]) => (
          <div key={key}>
            <label style={styles.label}>{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              style={styles.input}
            />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={form.in_stock}
            onChange={(e) => setForm((p) => ({ ...p, in_stock: e.target.checked }))}
          />{" "}
          재고 있음
        </label>
        <button onClick={add} style={styles.addBtn}>+ 추가</button>
      </div>

      {products.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>{["ID", "상품명", "카테고리", "가격", "재고", ""].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i}>
                <td style={styles.td}>{p.product_id}</td>
                <td style={styles.td}>{p.product_name}</td>
                <td style={styles.td}>{p.category}</td>
                <td style={styles.td}>{p.price.toLocaleString()}원</td>
                <td style={styles.td}>{p.in_stock ? "✅" : "❌"}</td>
                <td style={styles.td}><button onClick={() => remove(i)} style={styles.delBtn}>삭제</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  grid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  label:  { display: "block", fontSize: 11, color: "#64748b", marginBottom: 3 },
  input:  { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 5, fontSize: 13, boxSizing: "border-box" },
  addBtn: { padding: "6px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  table:  { width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: 12 },
  th:     { background: "#f1f5f9", padding: "5px 8px", textAlign: "left", borderBottom: "1px solid #e2e8f0" },
  td:     { padding: "5px 8px", borderBottom: "1px solid #f1f5f9" },
  delBtn: { padding: "2px 8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11 },
};
