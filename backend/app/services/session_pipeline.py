"""
session_pipeline.py  ── 담당: 허석준
세션/타임스탬프 생성 + 전체 파이프라인 오케스트레이션
"""
import uuid
import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any

from faker import Faker

from app.schemas.config_schema import GeneratorConfig
from app.services.event_graph_engine import EventGraphEngine

fake = Faker("ko_KR")

DEVICE_POOL = [
    {"device": "Galaxy S24", "os": "Android"},
    {"device": "iPhone 15", "os": "iOS"},
    {"device": "Pixel 8",   "os": "Android"},
    {"device": "MacBook Pro", "os": "macOS"},
]

USER_TYPES = ["new", "returning", "churned"]


class SessionPipeline:
    def __init__(self, config: GeneratorConfig):
        self.config = config
        self.engine = EventGraphEngine(config.navigation_graph)
        self._users = self._generate_users()

    # ── 유저 풀 생성 ──────────────────────────────────────────────────────────
    def _generate_users(self) -> List[Dict]:
        users = []
        for _ in range(self.config.num_users):
            device = random.choice(DEVICE_POOL)
            users.append({
                "user_id": f"user_{uuid.uuid4().hex[:8]}",
                "user_type": random.choice(USER_TYPES),
                "device": device["device"],
                "os": device["os"],
                "app_version": f"1{random.randint(50, 54)}.{random.randint(0, 9)}.1",
                "location": {
                    "country": "Korea",
                    "city": random.choice(["Seoul", "Busan", "Incheon", "Daegu"]),
                    "district": fake.city_suffix() + "구",
                },
                "gps": {
                    "latitude": round(random.uniform(35.0, 37.7), 3),
                    "longitude": round(random.uniform(126.7, 129.2), 3),
                },
            })
        return users

    # ── 타임스탬프 생성 ───────────────────────────────────────────────────────
    def _sample_timestamp(self, date: datetime) -> datetime:
        sc = self.config.session_config
        weights = sc.time_distribution.hour_weights
        hour = random.choices(range(24), weights=weights, k=1)[0]
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        return date.replace(hour=hour, minute=minute, second=second)

    def _date_range(self):
        start = datetime.strptime(self.config.start_date, "%Y-%m-%d")
        end   = datetime.strptime(self.config.end_date,   "%Y-%m-%d")
        delta = (end - start).days + 1
        day_weights = self.config.session_config.day_distribution.day_weights
        dates = []
        for i in range(delta):
            day = start + timedelta(days=i)
            dow = day.weekday()  # 0=월 … 6=일
            dates.append((day, day_weights[dow % 7]))
        return dates

    # ── 이벤트 로그 생성 ──────────────────────────────────────────────────────
    def _build_event(
        self,
        user: Dict,
        session_id: str,
        timestamp: datetime,
        event_name: str,
        page: str,
    ) -> Dict[str, Any]:
        event: Dict[str, Any] = {
            "event": event_name,
            "e_id": session_id,
            "time": int(timestamp.timestamp()),
            "properties": {
                "page": page,
                "userType": user["user_type"],
                "appVersion": user["app_version"],
                "device": user["device"],
                "os": user["os"],
                "location": user["location"],
                "gps": user["gps"],
            },
        }
        # 상품 페이지라면 상품 정보 추가
        if page in ("item", "cart", "checkout") and self.config.products:
            product = random.choice(self.config.products)
            event["properties"]["product_id"]   = product.product_id
            event["properties"]["product_name"] = product.product_name
            event["properties"]["category"]     = product.category
            event["properties"]["price"]        = product.price
            event["properties"]["currency"]     = product.currency
            event["properties"]["in_stock"]     = product.in_stock
        return event

    # ── 전체 실행 ─────────────────────────────────────────────────────────────
    def run(self) -> List[Dict[str, Any]]:
        all_events: List[Dict[str, Any]] = []
        dates = self._date_range()
        sc = self.config.session_config

        total_days = len(dates)
        day_totals = np.random.multinomial(
            sc.sessions_per_day * total_days,
            [w / sum(w for _, w in dates) for _, w in dates],
        )

        for (date, _), n_sessions in zip(dates, day_totals):
            for _ in range(n_sessions):
                user = random.choice(self._users)
                session_id = uuid.uuid4().hex
                base_ts = self._sample_timestamp(date)
                path = self.engine.simulate_session(
                    max_steps=sc.avg_events_per_session * 2
                )
                ts = base_ts
                for step in path:
                    all_events.append(
                        self._build_event(
                            user, session_id, ts,
                            step["event"], step["to"]
                        )
                    )
                    ts += timedelta(seconds=random.randint(2, 30))

        return all_events
