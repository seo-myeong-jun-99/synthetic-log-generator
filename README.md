# 🔧 Synthetic Log Generator

모바일 앱 사용자 행동 합성 로그 생성기 — 캡스톤 디자인 프로젝트

---

## 팀원별 담당 모듈

| 이름   | 담당 모듈 | 파일 |
|--------|-----------|------|
| 허석준 | 세션/파이프라인 | `backend/app/services/session_pipeline.py` |
| 김우진 | 이벤트/그래프 엔진 | `backend/app/services/event_graph_engine.py` |
| 서명준 | 메타데이터/출력 | `backend/app/services/output_service.py` |


---

## 프로젝트 구조

```
synthetic-log-generator/
├── docker-compose.yml
├── data/
│   ├── output/          # 생성된 JSON/CSV 파일
│   └── sample/          # 샘플 상품 데이터
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI 앱 진입점
│       ├── core/settings.py     # 환경변수 설정
│       ├── schemas/
│       │   └── config_schema.py # Pydantic 스키마
│       ├── services/
│       │   ├── event_graph_engine.py   # NetworkX 그래프 엔진
│       │   ├── session_pipeline.py     # 세션 생성 파이프라인
│       │   └── output_service.py       # JSON/CSV 출력
│       └── api/routes/
│           ├── config.py    # GET/POST /api/config
│           ├── generate.py  # POST /api/generate/run
│           └── export.py    # GET  /api/export/{json|csv}
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── index.js
        ├── api/client.js            # Axios API 클라이언트
        ├── pages/App.jsx            # 메인 페이지
        └── components/
            ├── GraphEditor.jsx      # ReactFlow 이동 그래프 에디터
            ├── SessionConfig.jsx    # 세션/시간 분포 설정
            ├── ProductConfig.jsx    # 샘플 상품 데이터 설정
            ├── GeneratePanel.jsx    # 생성 실행 + 다운로드
            └── OutputList.jsx       # 생성 이력 목록
```

---

## 실행 방법

### 1. 처음 실행 (팀원 모두 동일)

```bash
git clone <repo_url>
cd synthetic-log-generator
docker compose up --build
```

### 2. 이후 실행

```bash
docker compose up
```

### 3. 접속

| 서비스 | 주소 |
|--------|------|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 API | http://localhost:8000 |
| Swagger 문서 | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## API 엔드포인트 요약

```
GET  /health                   # 헬스체크
GET  /api/config/default       # 기본 설정 반환
POST /api/config/save          # 설정 저장
GET  /api/config/load          # 마지막 설정 불러오기

POST /api/generate/run         # 합성 로그 생성 (메인)
GET  /api/generate/preview     # 미리보기 (10개)

GET  /api/export/list          # 생성 파일 목록
GET  /api/export/json/{job_id} # JSON 다운로드
GET  /api/export/csv/{job_id}  # CSV 다운로드
```

---

## 개발 팁

- 백엔드만 수정 시: `docker compose restart backend`
- 로그 확인: `docker compose logs -f backend`
- 패키지 추가 후: `docker compose up --build backend`
- 생성된 파일 위치: `./data/output/`
