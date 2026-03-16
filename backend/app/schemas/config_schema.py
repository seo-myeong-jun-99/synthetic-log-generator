from pydantic import BaseModel, Field
from typing import List, Dict, Optional


# ── Input Editor: 앱 환경 설정 ──────────────────────────────────────────────

class TimeDistribution(BaseModel):
    """시간대별 세션 분포 (0~23시)"""
    hour_weights: List[float] = Field(
        default=[1.0] * 24,
        description="각 시간대별 상대적 가중치 (길이 24)",
    )

class DayDistribution(BaseModel):
    """요일별 세션 분포"""
    day_weights: List[float] = Field(
        default=[1.0] * 7,
        description="월~일 순서의 가중치 (길이 7)",
    )

class SessionConfig(BaseModel):
    sessions_per_day: int = Field(100, ge=1, le=100000)
    avg_events_per_session: int = Field(10, ge=1, le=500)
    time_distribution: TimeDistribution = TimeDistribution()
    day_distribution: DayDistribution = DayDistribution()


# ── Input Editor: 앱 이동 그래프 노드/엣지 ──────────────────────────────────

class PageNode(BaseModel):
    id: str
    label: str
    is_entry: bool = False
    is_exit: bool = False

class PageEdge(BaseModel):
    source: str
    target: str
    probability: float = Field(0.5, ge=0.0, le=1.0)
    event_name: str  # 이 전이에서 발생하는 이벤트 이름

class NavigationGraph(BaseModel):
    nodes: List[PageNode]
    edges: List[PageEdge]


# ── Input Editor: 샘플 상품 데이터 ──────────────────────────────────────────

class ProductItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    price: int
    currency: str = "Korean Won"
    in_stock: bool = True


# ── 전체 Config ─────────────────────────────────────────────────────────────

class GeneratorConfig(BaseModel):
    start_date: str = Field("2024-01-01", description="생성 시작 날짜 YYYY-MM-DD")
    end_date: str = Field("2024-01-07", description="생성 종료 날짜 YYYY-MM-DD")
    session_config: SessionConfig = SessionConfig()
    navigation_graph: Optional[NavigationGraph] = None
    products: List[ProductItem] = []
    num_users: int = Field(50, ge=1, le=10000)


# ── 응답 스키마 ─────────────────────────────────────────────────────────────

class GenerateResponse(BaseModel):
    job_id: str
    status: str
    total_sessions: int
    total_events: int
    output_file: str
