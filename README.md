# Travel-Planner

一个以地图为核心的国内旅游攻略规划工具。

用户可以搜索景点、酒店、餐厅、车站等地点，并将地点以“大头针”的形式固定在地图上。用户可以连接多个地点、调整游览顺序、设置交通方式、起点、终点以及地点停留时间，系统将自动计算路线和时间，并生成可导出的旅游计划。

项目第一阶段以 Web 应用为主，主要面向国内旅游场景，地图、地点搜索和路线规划统一接入高德地图服务。后期可以根据产品发展情况打包为移动 App，并逐步接入旅行规划 Agent。

---

## 1. 项目背景

目前用户制作旅游攻略时，通常需要在多个平台之间反复切换：

- 在内容平台查找景点和攻略
- 在地图软件中确认地点位置
- 在酒店平台查看住宿信息
- 在地图中反复查询地点之间的距离
- 在备忘录、文档或表格中整理每日行程
- 手动计算交通时间和地点停留时间

这种方式存在以下问题：

1. 景点、酒店、餐厅等信息分散
2. 难以直观看到多个地点之间的位置关系
3. 景点顺序需要在地图和攻略之间反复调整
4. 交通时间和游玩时间难以统一计算
5. 行程修改后需要重新整理完整攻略
6. 最终计划缺乏统一、清晰的展示形式

本项目希望将地点搜索、地图标记、路线规划、时间安排和计划导出整合到同一个系统中。

---

## 2. 产品定位

Travel Planner 不是一个单纯生成文字攻略的工具，而是一个以地图为核心的可视化旅行计划工作台。

用户可以将分散在不同平台中的旅行地点统一添加到地图，通过大头针、路线和时间轴组织行程，并最终生成结构化的旅游计划。

项目核心原则：

- 地图是主要操作区域，而不是单纯的展示组件
- 行程数据必须结构化存储
- 地图视图和行程列表保持同步
- 用户可以自由调整系统生成的结果
- Agent 只能建立在稳定的行程编辑能力之上
- 第一版优先解决地点整理和路线编排问题

---

## 3. 当前产品方案

### 3.1 产品形态

第一阶段优先开发 Web 应用。

原因包括：

- 方便快速验证地图交互
- 开发和调试成本较低
- 适合复杂的地图与行程双栏操作
- 后续可以复用大部分前端业务逻辑
- 可以通过 Capacitor 等方案初步打包为 App

后期根据实际需求，可以选择：

- 将 Web 应用包装为移动 App
- 使用 React Native 或 Flutter 开发移动端
- 为 Android 和 iOS 接入原生地图 SDK

### 3.2 目标用户

第一阶段主要面向国内自由行用户。

主要使用场景：

- 城市短途旅游
- 多日自由行
- 周末旅行
- 跨城市旅行
- 景点、酒店和餐厅路线整理
- 多人共同讨论旅行计划

### 3.3 地图服务

第一阶段统一使用高德地图服务。

主要接入能力包括：

- 高德地图 JavaScript API
- 地点关键词搜索
- 输入提示
- POI 详情查询
- 地理编码和逆地理编码
- 步行路线规划
- 驾车路线规划
- 公共交通路线规划
- 距离和预计时间计算

虽然当前只使用高德地图，但系统内部仍会保留统一的地图服务适配层，以降低未来接入境外地图服务的改造成本。

---

## 4. 核心使用流程

### 4.1 创建旅行项目

用户创建一个旅行项目，并填写：

- 旅行名称
- 目的城市
- 出发日期
- 结束日期
- 出行人数
- 每日预计出发时间
- 每日预计结束时间
- 旅行备注

示例：

```text
旅行名称：杭州三日游
目的城市：杭州
出发日期：2026-10-01
结束日期：2026-10-03
出行人数：2 人
```

### 4.2 搜索地点

用户可以搜索：

- 景点
- 酒店
- 餐厅
- 咖啡店
- 商场
- 机场
- 火车站
- 地铁站
- 自定义地点

搜索结果主要展示：

- 地点名称
- 地点类型
- 地址
- 经纬度
- 地点评分
- 营业时间
- 地点图片
- 地点简介

第一版主要依赖高德 POI 数据。用户也可以手动创建地图中未搜索到的地点。

### 4.3 添加地图大头针

用户可以将搜索结果添加到当前旅行项目中。

地点以大头针形式展示在地图上，不同类型的地点可以使用不同图标，例如：

- 景点
- 酒店
- 餐厅
- 车站
- 购物地点
- 自定义地点

点击大头针后，可以执行：

- 查看地点详情
- 添加到某一天
- 设置停留时间
- 设置备注
- 标记为必去地点
- 标记为备选地点
- 删除地点

### 4.4 安排行程顺序

用户将地点添加到某一天后，可以通过拖拽调整顺序。

例如：

```text
酒店
  ↓
西湖
  ↓
灵隐寺
  ↓
河坊街
  ↓
酒店
```

地图中的连接线会随着右侧行程列表自动更新。

第一版以“行程列表拖拽排序”为主要交互方式，不优先实现直接在地图上拖动连线。

### 4.5 设置交通方式

每两个相邻地点之间可以设置交通方式：

- 步行
- 驾车
- 公交
- 地铁
- 骑行
- 出租车
- 自定义交通

系统调用高德路线规划服务，获取：

- 路线距离
- 预计耗时
- 路线轨迹
- 换乘信息
- 交通步骤

### 4.6 设置时间

用户可以设置：

- 每日出发时间
- 每日结束时间
- 当日起点
- 当日终点
- 每个地点的停留时间
- 交通缓冲时间
- 用餐时间
- 自由活动时间

系统根据地点顺序、交通时间和停留时间自动生成时间安排。

基础计算逻辑：

```text
地点到达时间
= 上一个地点结束时间
+ 两个地点之间的交通时间

地点结束时间
= 地点到达时间
+ 地点停留时间
```

系统需要检查：

- 是否超过每日结束时间
- 是否存在时间冲突
- 是否超出地点营业时间
- 是否存在无法衔接的路线
- 当日行程是否过于紧凑

### 4.7 生成旅行计划

系统根据用户设置生成完整计划，内容包括：

- 旅行概览
- 每日行程
- 地图路线
- 地点访问顺序
- 到达时间
- 停留时间
- 交通方式
- 路线距离
- 预计交通耗时
- 用户备注
- 备选地点

### 4.8 导出旅行计划

第一版优先支持：

- 分享链接
- PDF
- 长图片
- Markdown

后期可以增加：

- Word
- 日历文件
- Google Calendar
- Apple Calendar
- 微信分享卡片

---

## 5. 页面设计

### 5.1 首页

首页主要展示：

- 创建新旅行
- 最近编辑的旅行
- 历史旅行
- 旅行项目搜索
- 项目复制和删除

### 5.2 旅行编辑页面

旅行编辑页面采用三栏布局。

#### 左侧：地点区域

包含：

- 地点搜索框
- 搜索结果
- 已收藏地点
- 必去地点
- 备选地点
- 地点分类筛选

#### 中间：地图区域

包含：

- 高德地图
- 地点大头针
- 路线连接线
- 当前选中的地点
- 地图缩放和定位
- 地图视野自动调整

#### 右侧：行程区域

包含：

- 日期切换
- 当日行程列表
- 地点拖拽排序
- 起点和终点
- 停留时间
- 交通方式
- 到达时间
- 当日总时长
- 冲突提示

### 5.3 行程预览页面

包含：

- 旅行基本信息
- 每日时间轴
- 每日地图路线
- 地点详情
- 交通信息
- 用户备注
- 导出按钮
- 分享按钮

---

## 6. MVP 功能范围

第一阶段重点验证以下核心流程：

```text
搜索地点
→ 添加到地图
→ 添加到某一天
→ 调整地点顺序
→ 设置交通方式
→ 设置停留时间
→ 自动计算时间
→ 生成旅游计划
→ 导出或分享
```

### 6.1 MVP 必须实现

- 创建和编辑旅行项目
- 高德地图展示
- 地点关键词搜索
- 地点输入提示
- 添加地图大头针
- 删除地点
- 地点分类
- 按天管理行程
- 拖拽调整地点顺序
- 设置每日起点和终点
- 设置地点停留时间
- 设置交通方式
- 查询地点间距离
- 查询地点间交通时间
- 地图绘制路线
- 自动生成每日时间表
- 基础时间冲突检查
- 保存并重新编辑行程
- 生成行程预览
- 导出基础旅游计划

### 6.2 MVP 暂不实现

- Agent 自动生成完整行程
- 多人实时协作
- 酒店和机票预订
- 实时天气调整
- 实时交通动态调整
- 自动预算统计
- 社区攻略分享
- 离线地图
- 海外地图服务
- 多地图服务切换
- 复杂的全局路线优化

---

## 7. 技术架构

### 7.1 前端

推荐技术栈：

- React
- Next.js
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- dnd-kit
- 高德地图 JavaScript API

前端主要负责：

- 地图展示
- 地点标记
- 路线绘制
- 行程拖拽
- 表单编辑
- 行程预览
- 用户交互状态管理

### 7.2 后端

推荐使用：

- Python
- FastAPI
- SQLAlchemy
- Pydantic

选择 FastAPI 的原因：

- 方便后续接入 Agent
- 适合封装地图服务
- 适合处理结构化数据
- 方便增加路线优化算法
- 可以与 OpenAI SDK 等 Agent 框架直接集成

后端主要负责：

- 用户认证
- 旅行项目管理
- 地点数据管理
- 行程数据管理
- 高德 Web 服务 API 封装
- 路线结果标准化
- 时间计算
- 冲突检测
- 计划生成
- 导出任务
- Agent 工具调用

### 7.3 数据库

推荐方案：

- 本地开发：SQLite（默认，无需 Docker）
- 生产部署：PostgreSQL
- 空间检索、范围查询或距离索引需求出现后：PostGIS

第一阶段仅保存用户、旅行项目和地点坐标，不依赖 PostGIS 专属字段。后端通过 `DATABASE_URL` 配置数据库；默认值为 `sqlite:///./travel_planner.db`，启动后自动创建本地数据库文件。

主要存储：

- 用户
- 旅行项目
- 地点
- 每日行程
- 行程节点
- 地点间路线
- 用户备注
- 导出记录
- 行程历史版本
- Agent 对话与操作记录

### 7.4 缓存

第一阶段不要求 Redis。地点搜索结果暂由高德服务直接返回；当需要多实例共享缓存、限流、异步导出或 Agent 会话状态时，再引入 Redis。

主要缓存：

- 地点搜索结果
- POI 详情
- 路线查询结果
- 地理编码结果
- 临时行程状态
- 导出任务状态
- Agent 会话状态

### 7.5 文件存储

用于保存：

- 导出的 PDF
- 导出的长图片
- 用户上传图片
- 分享页面资源

可以选择：

- 阿里云 OSS
- 腾讯云 COS
- Cloudflare R2
- MinIO

### 7.6 本地启动

第一阶段本地开发不需要 Docker：

1. 将 `backend/.env.example` 复制为 `backend/.env`，填写预置账号、JWT 密钥和高德 Web 服务 Key。
2. 在 `backend` 目录运行 `./.venv/Scripts/uvicorn.exe app.main:app --reload --port 8000`。首次启动会创建 `travel_planner.db`。
3. 将 `frontend/.env.example` 复制为 `frontend/.env.local`，填写高德 JS API Key 和安全密钥。
4. 在 `frontend` 目录运行 `npm run dev`，访问 `http://localhost:3000`。

生产环境可通过 `DATABASE_URL` 改用 PostgreSQL；本地 SQLite 数据文件不应提交到 Git。

---

## 8. 高德地图接入方案

### 8.1 前端能力

前端使用高德地图 JavaScript API，负责：

- 初始化地图
- 显示大头针
- 绘制路线
- 调整地图视野
- 监听大头针点击
- 监听地图拖动和缩放

### 8.2 后端能力

后端调用高德 Web 服务 API，负责：

- 地点关键词搜索
- POI 详情查询
- 地理编码
- 逆地理编码
- 路线规划
- 距离计算

不建议将高德 Web 服务 Key 直接暴露在前端。

### 8.3 Key 安全

需要配置：

- Web 端域名白名单
- JS API 安全密钥
- 服务端 Key
- API 调用监控
- 配额预警
- 异常流量预警

### 8.4 调用量优化

为降低 API 调用量，需要：

- 搜索输入增加 300～500 毫秒防抖
- 至少输入两个字符后再发起搜索
- 缓存相同关键词的搜索结果
- 拖拽过程中不请求路线
- 拖拽结束后再重新计算
- 只计算发生变化的相邻路线
- 对相同起点、终点和交通方式进行缓存
- 避免 React 重复初始化地图实例

### 8.5 成本预期

个人开发和小范围内测阶段，预计可以在高德免费配额内完成，地图服务成本接近 0 元。

随着用户量增加，主要成本可能来自：

- 地点搜索
- 输入提示
- 路线重复计算

正式商业上线前，需要确认：

- 企业开发者认证
- 高德技术服务许可
- 最新免费配额
- 最新 API 调用价格
- 商业使用授权范围

具体费用以高德开放平台当时的官方规则为准。

---

## 9. 地图服务适配层

虽然第一版只接入高德地图，但业务代码不应直接依赖高德返回的数据结构。

系统内部需要建立统一接口。

### 9.1 地图渲染接口

```ts
interface MapRenderer {
  initialize(container: HTMLElement): Promise<void>;

  setCenter(coordinate: Coordinate): void;

  addMarker(marker: MapMarker): string;

  updateMarker(markerId: string, marker: MapMarker): void;

  removeMarker(markerId: string): void;

  drawPolyline(polyline: MapPolyline): string;

  removePolyline(polylineId: string): void;

  fitBounds(coordinates: Coordinate[]): void;

  destroy(): void;
}
```

第一版实现：

```text
AmapRenderer
```

未来可以增加：

```text
GoogleMapRenderer
MapboxRenderer
```

### 9.2 地理服务接口

```ts
interface GeoServiceProvider {
  searchPlaces(
    request: PlaceSearchRequest
  ): Promise<PlaceSearchResult>;

  getPlaceDetail(
    providerPlaceId: string
  ): Promise<PlaceDetail>;

  geocode(
    address: string
  ): Promise<GeocodeResult[]>;

  calculateRoute(
    request: RouteRequest
  ): Promise<RouteResult>;
}
```

第一版实现：

```text
AmapGeoService
```

业务模块只调用统一接口，不直接调用高德特有的方法。

---

## 10. 数据设计原则

### 10.1 使用内部地点 ID

不能将高德 POI ID 直接作为系统主键。

推荐结构：

```json
{
  "id": "place_internal_001",
  "provider": "amap",
  "provider_place_id": "B000A00001",
  "name": "西湖风景名胜区"
}
```

其中：

- `id` 是系统内部稳定 ID
- `provider` 表示地图服务商
- `provider_place_id` 表示高德 POI ID

### 10.2 保存坐标系

高德地图主要使用 GCJ-02 坐标系。

地点数据需要保存：

```json
{
  "longitude": 120.148,
  "latitude": 30.245,
  "coordinate_system": "GCJ02",
  "provider": "amap"
}
```

不能只保存经纬度而不记录坐标系。

### 10.3 统一地点模型

```ts
interface Place {
  id: string;

  provider: 'amap' | 'manual';
  providerPlaceId?: string;

  name: string;
  address?: string;

  longitude: number;
  latitude: number;
  coordinateSystem: 'GCJ02';

  category: PlaceCategory;
  rating?: number;
  openingHours?: OpeningHours;

  stayDurationMinutes?: number;
  priority?: 'must_visit' | 'optional';

  userNote?: string;
}
```

### 10.4 统一路线模型

```ts
interface Route {
  id: string;

  fromPlaceId: string;
  toPlaceId: string;

  provider: 'amap';

  transportMode:
    | 'walking'
    | 'driving'
    | 'transit'
    | 'cycling'
    | 'taxi'
    | 'custom';

  distanceMeters: number;
  durationSeconds: number;

  routeGeometry?: string;
  steps?: RouteStep[];
}
```

---

## 11. 核心数据结构

### 11.1 旅行项目

```json
{
  "id": "trip_001",
  "name": "杭州三日游",
  "destination_city": "杭州",
  "start_date": "2026-10-01",
  "end_date": "2026-10-03",
  "travelers": 2,
  "map_provider": "amap",
  "coordinate_system": "GCJ02",
  "status": "planning"
}
```

### 11.2 每日行程

```json
{
  "id": "day_001",
  "trip_id": "trip_001",
  "date": "2026-10-01",
  "start_time": "09:00",
  "end_time": "21:00",
  "start_place_id": "hotel_001",
  "end_place_id": "hotel_001"
}
```

### 11.3 行程节点

```json
{
  "id": "item_001",
  "day_id": "day_001",
  "place_id": "place_001",
  "order": 1,
  "arrival_time": "10:00",
  "stay_duration_minutes": 120,
  "note": "建议提前预约"
}
```

### 11.4 地点间路线

```json
{
  "id": "route_001",
  "from_place_id": "hotel_001",
  "to_place_id": "place_001",
  "provider": "amap",
  "transport_mode": "transit",
  "distance_meters": 5200,
  "duration_seconds": 1800
}
```

---

## 12. Agent 能力规划

Agent 不应只生成一段文字攻略，而应该能够读取和修改系统中的结构化行程。

用户后续可以通过自然语言提出：

- 帮我规划一个杭州三日游
- 每天不要安排得太满
- 我希望每天十点以后出门
- 帮我增加适合拍照的景点
- 把距离太远的地点放到其他天
- 将每天步行距离控制在八公里以内
- 帮我找西湖附近的餐厅
- 把第二天结束时间调整到晚上九点

### 12.1 Agent 工具

后续为 Agent 提供统一工具：

```text
search_places
get_place_detail
add_place_to_trip
remove_place_from_trip
calculate_route
reorder_itinerary
update_stay_duration
update_transport_mode
check_time_conflict
generate_trip_plan
export_trip_plan
```

Agent 不直接调用：

```text
AMap.PlaceSearch
AMap.Driving
AMap.Transfer
```

地图服务的具体实现由系统 Provider 层处理。

### 12.2 Agent 修改确认

Agent 修改行程时，需要先展示变更内容：

- 新增了哪些地点
- 删除了哪些地点
- 调整了哪些顺序
- 修改了哪些停留时间
- 修改了哪些交通方式
- 是否产生新的时间冲突

用户确认后再保存，避免 Agent 直接覆盖现有计划。

---

## 13. 开发阶段规划

### 第一阶段：项目基础能力

完成：

- 用户系统
- 旅行项目管理
- 基础数据库
- 高德地图接入
- 地点搜索
- 地点大头针

### 第二阶段：行程编排

完成：

- 按天管理地点
- 行程列表拖拽
- 地图路线同步
- 起点和终点
- 交通方式设置

### 第三阶段：时间计算

完成：

- 停留时间设置
- 路线时间计算
- 到达时间计算
- 每日结束时间计算
- 基础冲突检查

### 第四阶段：计划输出

完成：

- 行程预览
- 分享链接
- PDF 导出
- 长图片导出
- Markdown 导出

### 第五阶段：体验优化

完成：

- 路线结果缓存
- 地点搜索缓存
- 自动优化地点顺序
- 营业时间冲突检查
- 移动端适配
- Web 打包 App 验证

### 第六阶段：Agent 接入

完成：

- 自然语言生成行程
- Agent 工具调用
- 自动搜索地点
- 自动分配每日行程
- 自动调整路线
- 根据反馈修改计划

### 第七阶段：长期能力

可能包括：

- 境外地图服务
- 用户旅行画像
- 天气动态调整
- 多人协作
- 预算统计
- 社区行程分享
- 酒店和交通预订

---

## 14. 当前待确定事项

后续仍需要确定：

- 项目正式名称
- UI 视觉风格
- 是否第一版就实现用户注册
- PDF 和长图片的具体样式
- 是否支持未登录用户创建临时行程
- 行程是否自动保存
- 是否保留行程历史版本
- 自动路线优化是否进入 MVP
- 第一版部署平台
- 是否需要微信公众号或小程序分享

---

## 15. 项目愿景

Travel Planner 希望将复杂、分散的旅行规划过程，变成直观的地图编辑过程。

用户不再需要频繁切换攻略平台、地图软件和备忘录，而是可以在一个界面中完成：

```text
发现地点
→ 收藏地点
→ 地图编排
→ 路线规划
→ 时间安排
→ 导出计划
```

在核心地图和行程能力稳定后，系统将进一步接入 Agent，使用户可以通过自然语言生成、调整和优化个性化旅行计划。
