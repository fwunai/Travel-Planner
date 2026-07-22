# Travel Planner 开发日志

**最近更新：** 2026-07-18
**当前阶段：** 地图地点整理与多旅行计划工作区

## 项目目标

Travel Planner 是一个以地图为核心的旅行计划编辑器。当前优先解决计划和地点的结构化整理；按天行程、路线、时间计算和导出属于后续阶段。

## 当前架构

- `frontend/`：Next.js、React、TypeScript、Zustand、原生 CSS。
- `backend/`：FastAPI、SQLAlchemy、Pydantic、高德 Web Service 适配器。
- 本地默认使用 SQLite，不需要 Docker、PostgreSQL/PostGIS 或 Redis。
- 前端通过 `NEXT_PUBLIC_API_BASE_URL` 调用后端 `/api/v1`。
- 地图使用高德 JS API，服务端 POI 搜索和地理编码使用高德 Web Service。

## 已完成内容

### 计划工作区

- 使用环境变量指定的预置用户作为本地工作区所有者。
- 支持旅行计划列表、空白计划创建、详情查询、更新和删除。
- 支持多个计划之间切换；切换时同步加载该计划的旅行信息和地点。
- 删除计划时显式清理其地点，避免 SQLite 外键配置差异造成孤儿数据。
- 保留 `/workspace` 兼容接口，但当前前端使用带 `trip_id` 的计划 API。

### 旅行信息

- 旅行名称、目的城市、起止日期、人数、每日开始/结束时间和备注。
- 左侧计划选择器支持新建和删除。
- 旅行信息默认收缩，展开后编辑并自动保存。
- 顶部品牌标题固定为 `Traveller`，不跟随旅行名称改变。

### 地点与地图

- 高德 POI 关键词搜索、候选选择和地点详情获取。
- 搜索工具栏位于地图上方的独立行，不再覆盖地图左上角。
- 搜索地区/城市是独立的前端状态，只影响 POI 搜索，不写入计划的目的城市。
- 添加地点前必须选择具体 POI 和标签。
- 支持预设标签：景点、美食、打卡点、住宿、交通、购物、其他。
- 自定义标签保存在浏览器 `localStorage`，刷新后仍可继续使用。
- 计划地点支持分类、必去/备选、备注、删除和地图标记联动。
- 地图初始化完成后再渲染已有地点标记，避免异步加载时序导致首屏无标记。

### 后端地图适配

- 统一封装高德地点搜索、地点详情和地址地理编码。
- 服务端 Key 不发送到浏览器。
- 对服务超时、HTTP 错误、无效 JSON、坐标异常和未配置 Key 返回明确错误。
- 新增 POI 时优先保存前端选中的标签，否则回退到高德推断分类。

## 主要文件

- `backend/app/api/v1/trips.py`
- `backend/app/api/v1/places.py`
- `backend/app/schemas/api.py`
- `backend/tests/test_smoke.py`
- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/components/map/MapCanvas.tsx`
- `frontend/src/lib/tag-library.ts`

## 配置与启动

1. 复制 `backend/.env.example` 为 `backend/.env`，配置 SQLite、预置用户和高德 Web Service Key。
2. 在 `backend` 目录运行 `./.venv/Scripts/uvicorn.exe app.main:app --reload --port 8000`。
3. 复制 `frontend/.env.example` 为 `frontend/.env.local`，配置高德 JS Key 和安全码。
4. 在 `frontend` 目录运行 `npm run dev`，访问 `http://localhost:3000`。

## API 范围

- `GET /api/v1/trips`：列出当前本地工作区的计划。
- `POST /api/v1/trips`：创建空白计划。
- `GET/PATCH/DELETE /api/v1/trips/{trip_id}`：查询、更新或删除计划。
- `GET/POST /api/v1/trips/{trip_id}/places`：查询或新增地点。
- `PATCH/DELETE /api/v1/trips/{trip_id}/places/{place_id}`：修改或删除地点。
- `GET /api/v1/geo/places/search`：代理高德 POI 搜索。

## 本轮排障记录

- 将旧的单一 `/workspace` 前端流程扩展为显式 `trip_id` 的多计划流程。
- 修复前端搜索请求竞态，旧关键词请求不能覆盖新结果。
- 修复地图 API 异步加载完成后已有地点不渲染的问题。
- 修复异步表单提交后访问 `event.currentTarget` 的潜在空引用问题，当前地点录入不再使用手动表单。
- `npm run lint` 当前仍会进入 Next.js 的交互式 ESLint 配置；生产构建和后端测试可正常执行。

## 后续工作

- 按天行程和地点拖拽排序。
- 起点、终点、交通方式和路线规划。
- 停留时间、到达时间和时间冲突检查。
- 行程预览、导出和分享。
- 在稳定的行程编辑能力之上接入 Agent。
