# 第一阶段开发日志

**日期：** 2026-07-18
**范围：** 项目基础能力，采用前后端分离架构。

## 目标

实现旅行规划 Web 应用的基础能力：预置账号登录、旅行项目管理、高德地点搜索代理、地点持久化以及地图大头针编辑界面。按天行程、路线、时间计算和导出能力不在本阶段范围内。

## 已完成内容

### 工程与运行环境

- 建立独立的 `frontend/` 与 `backend/` 工程。
- 前端采用 Next.js、TypeScript、React、TanStack Query、Zustand。
- 后端采用 FastAPI、SQLAlchemy、Pydantic、JWT、Argon2 密码哈希。
- 本地开发默认使用 SQLite 文件数据库，不需要 Docker、PostgreSQL/PostGIS 或 Redis。
- 保留 `DATABASE_URL` 配置项，生产环境可切换到 PostgreSQL。
- 新增根目录、前端和后端环境变量模板，并配置 `.gitignore`，避免提交真实密钥与本地数据。

### 用户与会话

- 使用环境变量配置预置账号；应用启动时自动、幂等地初始化该账号。
- 实现登录、刷新令牌、退出登录和当前用户 API。
- Access Token 使用短时 JWT；刷新令牌通过 `HttpOnly` Cookie 保存，服务端只保存刷新令牌哈希。
- 未实现公开注册，符合第一阶段“仅预置登录”的决策。

### 旅行项目

- 实现旅行项目的数据模型：名称、目的城市、日期、出行人数、每日时间窗口、备注、地图服务商和坐标系。
- 实现项目查询、创建、获取、更新和删除 API。
- 校验日期范围、出行人数和每日开始/结束时间。
- 所有项目查询均按当前用户过滤，避免跨用户访问。

### 地点与地图

- 实现项目地点的新增、查询、修改和删除 API。
- 支持手动地点，并记录名称、坐标、分类、优先级、备注和 `GCJ02` 坐标系。
- 高德 POI 使用内部 UUID 作为系统地点 ID；高德 POI ID 仅作为 `provider_place_id` 保存。
- 后端新增高德 Web Service 适配器，提供受认证保护的关键词 POI 搜索；服务端 Key 不暴露给前端。
- 前端实现高德 JS API 动态加载、地图实例生命周期清理、地点标记渲染和自动视野适配。
- 地点列表与地图标记共享选中状态，支持从列表删除地点。

### 前端页面

- 登录页：使用预置账号获取会话。
- 旅行列表页：创建旅行项目、查看最近项目、进入编辑页面。
- 旅行编辑页：左侧地点搜索与手动添加，中间地图，右侧已添加地点列表。

## 主要文件

- `backend/app/core/config.py`
- `backend/app/core/database.py`
- `backend/tests/test_smoke.py`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/trips/page.tsx`
- `frontend/src/app/trips/[tripId]/page.tsx`
- `frontend/src/components/map/MapCanvas.tsx`

## 配置与启动前提

- 后端：复制 `backend/.env.example` 为 `backend/.env`，设置 JWT 密钥、预置账号和 `AMAP_WEB_SERVICE_KEY`。
- 前端：复制 `frontend/.env.example` 为 `frontend/.env.local`，设置 `NEXT_PUBLIC_AMAP_JS_KEY` 与安全密钥。
- 高德 Web Service Key 仅允许出现在后端环境变量中；高德 JS Key 需要配置域名白名单。
- SQLite 数据库会在后端启动时自动创建为 `backend/travel_planner.db`，无需启动额外服务。
- 生产环境可通过 `DATABASE_URL` 连接 PostgreSQL；后续出现空间查询、多实例部署、共享缓存或异步任务时，再评估引入 PostGIS 和 Redis。

## 本轮运行与排障记录

- 将本地默认运行方案从 Docker/PostgreSQL/Redis 调整为 SQLite，删除 Docker Compose 和未使用的 Redis 依赖。
- SQLite 测试数据库在 Windows 上的连接占用问题已通过测试结束时释放 SQLAlchemy 连接池解决。
- 前端开发服务器因遗留进程占用 3000 端口时会自动改用其他端口；该端口必须加入后端 `CORS_ORIGINS`，例如 `http://localhost:3000,http://localhost:3002`。
- 曾出现 Next.js 开发缓存导致客户端脚本和样式资源返回 404，使表单退化为普通 GET 提交；清理 `frontend/.next` 并停止遗留开发服务器后恢复正常。
- 已发现创建旅行项目成功后调用 `event.currentTarget.reset()` 的前端缺陷：异步请求完成后 `currentTarget` 可能为 `null`，会显示 `Cannot read properties of null (reading 'reset')`。后端创建操作不受影响；该缺陷待修复。

## 后续工作

- 使用已配置的高德 Key 完成真实 POI 搜索和浏览器地图交互验收。
- 第二阶段实现按天行程、拖拽排序、起终点和路线同步。
