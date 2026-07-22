# Travel Planner

一个以地图为中心的旅行地点整理工作台。创建旅行计划后，可以搜索高德 POI、为地点加标签，并在地图与地点列表之间同步管理。

> 当前版本聚焦于“旅行计划 + 地点收集与整理”。路线计算、按天排程、时间冲突检查、导出和协作尚未实现。

## 功能

- 创建、切换、编辑和删除多个旅行计划
- 编辑旅行名称、目的城市、日期、人数、每日出行时间及备注
- 通过高德 Web Service 搜索 POI，并将选中的地点加入当前计划
- 使用预设标签或本地自定义标签标记地点；自定义标签保存在浏览器 `localStorage`
- 查看、编辑、排序和删除计划内地点
- 地点列表与高德地图标记双向联动，并自动调整地图视野
- 提供桌面三栏工作区与移动端视图切换
- 后端使用 SQLite 作为默认本地数据库，并在启动时处理现有数据库的兼容迁移

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Next.js 15、React 19、TypeScript、Zustand、Lucide |
| 后端 | FastAPI、SQLAlchemy、Pydantic |
| 地图与 POI | 高德地图 JavaScript API、高德 Web Service API |
| 本地数据 | SQLite |
| 测试 | Vitest、Testing Library、Pytest |

## 项目结构

```text
frontend/                    Next.js 客户端
  src/app/                   页面与全局样式
  src/components/            地图与旅行计划组件
  src/lib/                   API 客户端、类型与标签库
  src/stores/                Zustand 状态
backend/                     FastAPI 服务
  app/api/v1/                旅行计划、地点与地图 API
  app/geo/                   高德服务适配器
  app/models/                SQLAlchemy 模型
  app/schemas/               API 请求与响应模型
  tests/                     后端测试
```

## 本地运行

### 前置条件

- Node.js 20 或更新版本
- Python 3.11 或更新版本
- [uv](https://docs.astral.sh/uv/)
- 高德地图 JavaScript API Key 与安全密钥
- 高德 Web Service Key

### 1. 启动后端

```powershell
cd backend
Copy-Item .env.example .env
uv sync --dev
uv run uvicorn app.main:app --reload --port 8000
```

编辑 `backend/.env`，至少为本地开发设置安全的 JWT 密钥，并填写高德 Web Service Key：

```dotenv
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-random-secret
AMAP_WEB_SERVICE_KEY=your-amap-web-service-key
```

默认数据库是 `backend/travel_planner.db`。它会在首次启动时自动创建，不应提交到 Git。

### 2. 启动前端

在另一个终端执行：

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

编辑 `frontend/.env.local`：

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_AMAP_JS_KEY=your-amap-js-key
NEXT_PUBLIC_AMAP_JS_SECURITY_CODE=your-amap-js-security-code
```

打开 [http://localhost:3000](http://localhost:3000)。若前端改用其他端口，请同步将该来源加入后端 `CORS_ORIGINS`。

## API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` / `POST` | `/api/v1/trips` | 列出或创建旅行计划 |
| `GET` / `PATCH` / `DELETE` | `/api/v1/trips/{trip_id}` | 查询、更新或删除旅行计划 |
| `GET` / `POST` | `/api/v1/trips/{trip_id}/places` | 查询或添加地点 |
| `PATCH` / `DELETE` | `/api/v1/trips/{trip_id}/places/{place_id}` | 修改或删除地点 |
| `GET` | `/api/v1/geo/places/search` | 代理高德 POI 关键词搜索 |
| `GET` | `/health` | 健康检查 |

高德 Web Service Key 只保存在后端环境变量中，不会发送给浏览器。

## 测试与检查

```powershell
# 前端
cd frontend
npm run test:run
npm run lint
npm run build

# 后端
cd backend
uv run pytest
uv run ruff check .
```

## 当前限制与下一步

- 路线规划、交通方式和时间计算尚未接入
- 地点尚未按天编排，当前可在单个计划内调整地点顺序
- 暂无分享、导出、多人协作和公开注册
- 当前默认面向本地单用户工作区；生产部署需要配置独立数据库、密钥和 CORS 来源

后续优先级是按天行程、地点拖拽排序、起终点和路线同步，再扩展停留时间、冲突检查与导出。

## 安全说明

不要提交 `.env`、`.env.local`、高德 Key 或 SQLite 数据库文件。请在高德开放平台中为 JavaScript Key 配置允许访问的域名白名单。
