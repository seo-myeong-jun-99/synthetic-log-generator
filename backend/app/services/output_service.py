"""
output_service.py  ── 담당: 서명준
JSON / CSV 출력 + 메타데이터 생성
"""
import json
import csv
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any

from app.core.settings import settings


def save_json(events: List[Dict[str, Any]], job_id: str) -> str:
    path = os.path.join(settings.DATA_OUTPUT_PATH, f"{job_id}.json")
    os.makedirs(settings.DATA_OUTPUT_PATH, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    return path


def save_csv(events: List[Dict[str, Any]], job_id: str) -> str:
    path = os.path.join(settings.DATA_OUTPUT_PATH, f"{job_id}.csv")
    os.makedirs(settings.DATA_OUTPUT_PATH, exist_ok=True)
    if not events:
        return path

    # properties dict를 flat하게 펼쳐서 저장
    flat_rows = []
    for e in events:
        row = {
            "event":      e.get("event"),
            "e_id":       e.get("e_id"),
            "time":       e.get("time"),
        }
        props = e.get("properties", {})
        for k, v in props.items():
            row[f"prop_{k}"] = json.dumps(v, ensure_ascii=False) if isinstance(v, dict) else v
        flat_rows.append(row)

    fieldnames = list(flat_rows[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(flat_rows)
    return path


def build_metadata(events: List[Dict], config: dict, job_id: str) -> Dict:
    return {
        "job_id":        job_id,
        "generated_at":  datetime.utcnow().isoformat(),
        "total_events":  len(events),
        "total_sessions": len({e["e_id"] for e in events}),
        "config_summary": {
            "start_date":    config.get("start_date"),
            "end_date":      config.get("end_date"),
            "num_users":     config.get("num_users"),
        },
    }
