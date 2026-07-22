# 第一阶段测试日志

**日期：** 2026-07-18
**测试范围：** 后端认证/旅行项目/手动地点流程，以及前端生产构建。

## 测试环境

- Windows 10 Pro
- Python 3.11.8
- pytest 9.1.1
- Next.js 15.5.20
- Node.js 24.15.0
- 数据库：用于测试的临时 SQLite 文件

> SQLite 是第一阶段的标准本地与测试数据库；不需要 Docker、PostGIS 或 Redis。生产部署可通过 `DATABASE_URL` 切换至 PostgreSQL。

## 已执行检查

### 1. 后端依赖与静态编译

- 创建 Python 虚拟环境并安装后端依赖。
- 安装 pytest 开发依赖。
- 执行 Python `compileall` 编译检查。
- 结果：通过。

### 2. 后端 API 冒烟测试

测试文件：`backend/tests/test_smoke.py`

测试步骤：

1. 进入 FastAPI 生命周期，初始化数据表和预置账号。
2. 使用预置账号登录，获得 JWT Access Token。
3. 使用认证令牌创建旅行项目。
4. 为旅行项目添加一个手动地点。
5. 查询项目地点列表。
6. 验证地点来源为 `manual`，坐标系为 `GCJ02`，且列表中返回一个地点。

执行结果：

```text
collected 1 item
backend\tests\test_smoke.py . [100%]
1 passed, 1 warning in 0.95s
```

说明：测试中出现一个来自 FastAPI/Starlette `TestClient` 的依赖弃用警告，不影响本次测试结果；后续升级测试客户端依赖时应处理该警告。

### 3. 前端生产构建

执行命令：

```text
npm run build --prefix frontend
```

结果：通过。

```text
Compiled successfully
Linting and checking validity of types
Generating static pages (6/6)
Finalizing page optimization
```

构建路由：

| 路由 | 类型 | 首次加载 JS |
| --- | --- | --- |
| `/` | 静态 | 103 kB |
| `/login` | 静态 | 104 kB |
| `/trips` | 静态 | 107 kB |
| `/trips/[tripId]` | 动态 | 105 kB |

## 本地启动验证

无需 Docker 的本地运行入口已验证：

- 后端可改用 `8010` 端口运行；`GET http://127.0.0.1:8010/health` 已确认返回 `{"status":"ok"}`。
- 前端在端口无冲突时运行于 `3000`；如 Next.js 自动切换至 `3001`、`3002` 等端口，后端 `CORS_ORIGINS` 必须包含实际前端来源。
- 已确认清理 `frontend/.next` 并停止遗留前端进程后，登录页客户端脚本返回 HTTP 200；此前脚本资源 404 会造成无样式、事件未水合和表单以 GET 提交。

## 未执行项及原因

| 项目 | 原因 | 后续验证方式 |
| --- | --- | --- |
| 创建旅行项目后的表单重置 | 浏览器手工测试发现异步提交后 `event.currentTarget` 为 `null`，页面显示重置异常 | 修复为在异步操作前保存表单元素引用，并重新进行浏览器测试。 |
| 真实高德 POI 搜索 | 需要在运行中的本地后端使用已配置的服务端 Key 验证 | 搜索真实 POI 并确认浏览器只访问后端 API。 |
| 浏览器地图交互 | 未运行浏览器自动化 | 启动前后端后，验证地图初始化、大头针添加、选中联动和删除。 |
| 高德服务端 Key 泄露扫描 | 未进行真实浏览器会话检查 | 检查前端构建产物和浏览器网络请求。 |

## 结论

基础 API 核心流程、SQLite 本地持久化和前端生产构建均已通过。下一步是在已配置高德 Key 的本机启动前后端，完成真实 POI 搜索与浏览器地图交互验收。
