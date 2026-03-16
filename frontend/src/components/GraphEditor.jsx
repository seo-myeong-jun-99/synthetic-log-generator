// src/components/GraphEditor.jsx  ── 담당: 김광호
// ReactFlow 기반 앱 이동 경로 그래프 에디터
// 기능: 노드 추가 / 더블클릭 이름 편집 / 엣지 클릭 확률 수정 / 노드·엣지 삭제

import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

// ── 초기 데이터 ────────────────────────────────────────────────────────────
const initialNodes = [
  { id: "home",     position: { x: 50,  y: 200 }, data: { label: "Home",     is_entry: true,  is_exit: false } },
  { id: "navi",     position: { x: 260, y: 80  }, data: { label: "Navi",     is_entry: false, is_exit: false } },
  { id: "search",   position: { x: 260, y: 320 }, data: { label: "Search",   is_entry: false, is_exit: false } },
  { id: "item",     position: { x: 470, y: 200 }, data: { label: "Item",     is_entry: false, is_exit: false } },
  { id: "cart",     position: { x: 670, y: 120 }, data: { label: "Cart",     is_entry: false, is_exit: false } },
  { id: "checkout", position: { x: 870, y: 120 }, data: { label: "Checkout", is_entry: false, is_exit: true  } },
  { id: "exit",     position: { x: 670, y: 320 }, data: { label: "Exit",     is_entry: false, is_exit: true  } },
];

const initialEdges = [
  { id: "e1", source: "home",   target: "navi",     label: "40%", animated: true },
  { id: "e2", source: "home",   target: "search",   label: "30%", animated: true },
  { id: "e3", source: "home",   target: "exit",     label: "30%" },
  { id: "e4", source: "navi",   target: "item",     label: "60%", animated: true },
  { id: "e5", source: "search", target: "item",     label: "70%", animated: true },
  { id: "e6", source: "item",   target: "cart",     label: "40%", animated: true },
  { id: "e7", source: "cart",   target: "checkout", label: "50%", animated: true },
];

// ── 노드 색상 헬퍼 ────────────────────────────────────────────────────────
const nodeStyle = (data) => ({
  background: data.is_entry ? "#4ade80" : data.is_exit ? "#f87171" : "#fff",
  border: data.is_entry ? "2px solid #16a34a" : data.is_exit ? "2px solid #dc2626" : "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "6px 14px",
  fontSize: 13,
  fontWeight: 500,
  minWidth: 80,
  textAlign: "center",
  cursor: "pointer",
});

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────
export default function GraphEditor({ onChange }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map((n) => ({ ...n, style: nodeStyle(n.data) }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 노드 추가 폼
  const [showAddNode, setShowAddNode] = useState(false);
  const [newNodeName, setNewNodeName]   = useState("");
  const [newNodeType, setNewNodeType]   = useState("normal");
  const nodeIdRef = useRef(100);

  // 노드 이름 편집 모달
  const [editNode, setEditNode]         = useState(null);
  const [editNodeName, setEditNodeName] = useState("");
  const [editNodeType, setEditNodeType] = useState("normal");

  // 엣지 확률 편집 모달
  const [editEdge, setEditEdge] = useState(null);
  const [editProb, setEditProb] = useState("");

  // ── 엣지 연결 ────────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, label: "50%", animated: true }, eds)
      ),
    [setEdges]
  );

  // ── 노드 추가 ────────────────────────────────────────────────────────────
  const handleAddNode = () => {
    if (!newNodeName.trim()) return;
    const id = `node_${nodeIdRef.current++}`;
    const is_entry = newNodeType === "entry";
    const is_exit  = newNodeType === "exit";
    const data = { label: newNodeName.trim(), is_entry, is_exit };
    const newNode = {
      id,
      position: { x: 200 + Math.random() * 300, y: 200 + Math.random() * 200 },
      data,
      style: nodeStyle(data),
    };
    setNodes((nds) => [...nds, newNode]);
    setNewNodeName("");
    setNewNodeType("normal");
    setShowAddNode(false);
  };

  // ── 노드 더블클릭 → 편집 모달 ────────────────────────────────────────────
  const onNodeDoubleClick = useCallback((_, node) => {
    setEditNode(node);
    setEditNodeName(node.data.label);
    setEditNodeType(
      node.data.is_entry ? "entry" : node.data.is_exit ? "exit" : "normal"
    );
  }, []);

  const handleEditNodeSave = () => {
    if (!editNodeName.trim() || !editNode) return;
    const is_entry = editNodeType === "entry";
    const is_exit  = editNodeType === "exit";
    const newData  = { label: editNodeName.trim(), is_entry, is_exit };
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editNode.id
          ? { ...n, data: newData, style: nodeStyle(newData) }
          : n
      )
    );
    setEditNode(null);
  };

  // ── 노드 삭제 ─────────────────────────────────────────────────────────────
  const handleDeleteNode = () => {
    if (!editNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== editNode.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== editNode.id && e.target !== editNode.id)
    );
    setEditNode(null);
  };

  // ── 엣지 클릭 → 확률 편집 모달 ──────────────────────────────────────────
  const onEdgeClick = useCallback((_, edge) => {
    setEditEdge(edge);
    setEditProb((edge.label || "50%").replace("%", ""));
  }, []);

  const handleEditEdgeSave = () => {
    if (!editEdge) return;
    const val = Math.min(100, Math.max(0, parseInt(editProb) || 0));
    setEdges((eds) =>
      eds.map((e) =>
        e.id === editEdge.id ? { ...e, label: `${val}%` } : e
      )
    );
    setEditEdge(null);
  };

  const handleDeleteEdge = () => {
    if (!editEdge) return;
    setEdges((eds) => eds.filter((e) => e.id !== editEdge.id));
    setEditEdge(null);
  };

  // ── 그래프 export ─────────────────────────────────────────────────────────
  const exportGraph = () => {
    const graphData = {
      nodes: nodes.map((n) => ({
        id:       n.id,
        label:    n.data.label,
        is_entry: n.data.is_entry,
        is_exit:  n.data.is_exit,
      })),
      edges: edges.map((e) => ({
        source:      e.source,
        target:      e.target,
        probability: parseFloat((e.label || "50%").replace("%", "")) / 100,
        event_name:  `click_${e.target}`,
      })),
    };
    onChange && onChange(graphData);
    alert("그래프 설정이 적용되었습니다.");
  };

  // ── 렌더 ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* 툴바 */}
      <div style={s.toolbar}>
        <span style={s.hint}>
          드래그 이동 · 핸들 드래그 연결 · 더블클릭 편집 · 엣지 클릭 확률 수정 · Delete 삭제
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setShowAddNode(true)} style={s.btnGreen}>+ 노드 추가</button>
          <button onClick={exportGraph} style={s.btnBlue}>✓ 그래프 적용</button>
        </div>
      </div>

      {/* 범례 */}
      <div style={s.legend}>
        <span style={s.dot("#4ade80")} /> <span style={{ marginRight: 10 }}>Entry (진입)</span>
        <span style={s.dot("#f87171")} /> <span style={{ marginRight: 10 }}>Exit (종료)</span>
        <span style={s.dot("#fff", "#cbd5e1")} /> <span>일반 페이지</span>
      </div>

      {/* ReactFlow 캔버스 */}
      <div style={{ height: 420, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeClick={onEdgeClick}
          fitView
          deleteKeyCode="Delete"
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* ── 노드 추가 모달 ── */}
      {showAddNode && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <p style={s.modalTitle}>노드 추가</p>
            <label style={s.label}>페이지 이름</label>
            <input
              autoFocus
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNode()}
              placeholder="예: 리뷰 페이지"
              style={s.input}
            />
            <label style={s.label}>타입</label>
            <div style={s.radioRow}>
              {[["normal","일반"],["entry","진입(Entry)"],["exit","종료(Exit)"]].map(([v, l]) => (
                <label key={v} style={s.radioLabel}>
                  <input type="radio" value={v} checked={newNodeType === v}
                    onChange={() => setNewNodeType(v)} /> {l}
                </label>
              ))}
            </div>
            <div style={s.btnRow}>
              <button onClick={() => setShowAddNode(false)} style={s.btnGray}>취소</button>
              <button onClick={handleAddNode} style={s.btnBlue}>추가</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 노드 편집 모달 ── */}
      {editNode && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <p style={s.modalTitle}>노드 편집</p>
            <label style={s.label}>페이지 이름</label>
            <input
              autoFocus
              value={editNodeName}
              onChange={(e) => setEditNodeName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEditNodeSave()}
              style={s.input}
            />
            <label style={s.label}>타입</label>
            <div style={s.radioRow}>
              {[["normal","일반"],["entry","진입(Entry)"],["exit","종료(Exit)"]].map(([v, l]) => (
                <label key={v} style={s.radioLabel}>
                  <input type="radio" value={v} checked={editNodeType === v}
                    onChange={() => setEditNodeType(v)} /> {l}
                </label>
              ))}
            </div>
            <div style={s.btnRow}>
              <button onClick={handleDeleteNode} style={s.btnRed}>삭제</button>
              <button onClick={() => setEditNode(null)} style={s.btnGray}>취소</button>
              <button onClick={handleEditNodeSave} style={s.btnBlue}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 엣지 확률 편집 모달 ── */}
      {editEdge && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <p style={s.modalTitle}>전이 확률 수정</p>
            <p style={s.edgeInfo}>
              {nodes.find((n) => n.id === editEdge.source)?.data.label ?? editEdge.source}
              {" → "}
              {nodes.find((n) => n.id === editEdge.target)?.data.label ?? editEdge.target}
            </p>
            <label style={s.label}>확률 (%)</label>
            <input
              autoFocus
              type="number"
              min={0}
              max={100}
              value={editProb}
              onChange={(e) => setEditProb(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEditEdgeSave()}
              style={s.input}
            />
            <div style={s.btnRow}>
              <button onClick={handleDeleteEdge} style={s.btnRed}>엣지 삭제</button>
              <button onClick={() => setEditEdge(null)} style={s.btnGray}>취소</button>
              <button onClick={handleEditEdgeSave} style={s.btnBlue}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 스타일 ─────────────────────────────────────────────────────────────────
const s = {
  toolbar:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  hint:       { fontSize: 11, color: "#94a3b8" },
  legend:     { display: "flex", alignItems: "center", fontSize: 11, color: "#64748b", marginBottom: 6 },
  dot:        (bg, border = bg) => ({
    display: "inline-block", width: 10, height: 10, borderRadius: "50%",
    background: bg, border: `1px solid ${border}`, marginRight: 3,
  }),
  btnBlue:    { padding: "6px 14px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  btnGreen:   { padding: "6px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  btnGray:    { padding: "6px 14px", background: "#e2e8f0", color: "#475569", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  btnRed:     { padding: "6px 14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:      { background: "#fff", borderRadius: 12, padding: 24, width: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" },
  modalTitle: { margin: "0 0 16px", fontSize: 16, fontWeight: 700 },
  label:      { display: "block", fontSize: 12, color: "#64748b", marginBottom: 4, marginTop: 12 },
  input:      { width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, boxSizing: "border-box" },
  radioRow:   { display: "flex", gap: 12, marginTop: 4 },
  radioLabel: { fontSize: 13, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" },
  btnRow:     { display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" },
  edgeInfo:   { fontSize: 13, color: "#475569", margin: "0 0 4px", background: "#f1f5f9", padding: "6px 10px", borderRadius: 6 },
};
