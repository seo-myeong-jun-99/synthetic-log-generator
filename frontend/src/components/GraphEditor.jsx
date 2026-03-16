// src/components/GraphEditor.jsx  ── 담당: 김광호
// ReactFlow 기반 앱 이동 경로 그래프 에디터
import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  { id: "home",     position: { x: 50,  y: 200 }, data: { label: "Home (Entry)" },    style: { background: "#4ade80" } },
  { id: "navi",     position: { x: 250, y: 100 }, data: { label: "Navi" } },
  { id: "search",   position: { x: 250, y: 300 }, data: { label: "Search" } },
  { id: "item",     position: { x: 450, y: 200 }, data: { label: "Item Detail" } },
  { id: "cart",     position: { x: 650, y: 150 }, data: { label: "Cart" } },
  { id: "checkout", position: { x: 850, y: 150 }, data: { label: "Checkout (Exit)" }, style: { background: "#f87171" } },
  { id: "exit",     position: { x: 650, y: 350 }, data: { label: "Exit" },             style: { background: "#f87171" } },
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

export default function GraphEditor({ onChange }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // 부모 컴포넌트에 그래프 데이터 전달
  const exportGraph = () => {
    const graphData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        is_entry: n.data.label.includes("Entry"),
        is_exit:  n.data.label.includes("Exit"),
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        probability: parseFloat((e.label || "0.5").replace("%", "")) / 100,
        event_name: `click_${e.target}`,
      })),
    };
    onChange && onChange(graphData);
    alert("그래프 설정이 적용되었습니다.");
  };

  return (
    <div style={{ height: 450, border: "1px solid #ddd", borderRadius: 8 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      <button
        onClick={exportGraph}
        style={{
          margin: "8px",
          padding: "6px 16px",
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        그래프 적용
      </button>
    </div>
  );
}
