"""
event_graph_engine.py  ── 담당: 김우진
NetworkX 기반 페이지 이동 그래프 + 이벤트 시퀀스 생성
"""
import random
import networkx as nx
from typing import List, Dict, Any

from app.schemas.config_schema import NavigationGraph


# 기본 데모 그래프 (Input Editor 미사용 시 fallback)
DEFAULT_GRAPH_DATA = {
    "nodes": [
        {"id": "home",     "label": "Home",         "is_entry": True,  "is_exit": False},
        {"id": "navi",     "label": "Navi",          "is_entry": False, "is_exit": False},
        {"id": "search",   "label": "Search",        "is_entry": False, "is_exit": False},
        {"id": "item",     "label": "Item Detail",   "is_entry": False, "is_exit": False},
        {"id": "cart",     "label": "Cart",          "is_entry": False, "is_exit": False},
        {"id": "checkout", "label": "Checkout",      "is_entry": False, "is_exit": True},
        {"id": "exit",     "label": "Exit",          "is_entry": False, "is_exit": True},
    ],
    "edges": [
        {"source": "home",     "target": "navi",      "probability": 0.4, "event_name": "click_navi"},
        {"source": "home",     "target": "search",    "probability": 0.3, "event_name": "click_search"},
        {"source": "home",     "target": "exit",      "probability": 0.3, "event_name": "app_exit"},
        {"source": "navi",     "target": "item",      "probability": 0.6, "event_name": "item_impression"},
        {"source": "navi",     "target": "exit",      "probability": 0.4, "event_name": "app_exit"},
        {"source": "search",   "target": "item",      "probability": 0.7, "event_name": "item_click"},
        {"source": "search",   "target": "exit",      "probability": 0.3, "event_name": "app_exit"},
        {"source": "item",     "target": "cart",      "probability": 0.4, "event_name": "add_to_cart"},
        {"source": "item",     "target": "exit",      "probability": 0.6, "event_name": "app_exit"},
        {"source": "cart",     "target": "checkout",  "probability": 0.5, "event_name": "purchase_start"},
        {"source": "cart",     "target": "exit",      "probability": 0.5, "event_name": "app_exit"},
    ],
}


class EventGraphEngine:
    def __init__(self, graph_data: NavigationGraph | None = None):
        self.graph = nx.DiGraph()
        data = graph_data or _build_default_graph()
        self._build(data)

    def _build(self, graph_data: NavigationGraph):
        for node in graph_data.nodes:
            self.graph.add_node(
                node.id,
                label=node.label,
                is_entry=node.is_entry,
                is_exit=node.is_exit,
            )
        for edge in graph_data.edges:
            self.graph.add_edge(
                edge.source,
                edge.target,
                probability=edge.probability,
                event_name=edge.event_name,
            )

    def get_entry_nodes(self) -> List[str]:
        return [n for n, d in self.graph.nodes(data=True) if d.get("is_entry")]

    def next_page(self, current: str) -> tuple[str, str] | None:
        """현재 페이지에서 다음 페이지와 발생 이벤트 반환 (확률 기반)"""
        successors = list(self.graph.successors(current))
        if not successors:
            return None
        weights = [self.graph[current][s]["probability"] for s in successors]
        total = sum(weights)
        normalized = [w / total for w in weights]
        chosen = random.choices(successors, weights=normalized, k=1)[0]
        event = self.graph[current][chosen]["event_name"]
        return chosen, event

    def is_exit(self, node_id: str) -> bool:
        return self.graph.nodes[node_id].get("is_exit", False)

    def simulate_session(self, max_steps: int = 30) -> List[Dict[str, str]]:
        """단일 세션의 페이지 이동 + 이벤트 시퀀스 생성"""
        entries = self.get_entry_nodes()
        if not entries:
            return []
        current = random.choice(entries)
        path = []
        for _ in range(max_steps):
            result = self.next_page(current)
            if result is None:
                break
            next_page, event = result
            path.append({"from": current, "to": next_page, "event": event})
            current = next_page
            if self.is_exit(current):
                break
        return path


def _build_default_graph() -> NavigationGraph:
    from app.schemas.config_schema import PageNode, PageEdge
    nodes = [PageNode(**n) for n in DEFAULT_GRAPH_DATA["nodes"]]
    edges = [PageEdge(**e) for e in DEFAULT_GRAPH_DATA["edges"]]
    return NavigationGraph(nodes=nodes, edges=edges)
