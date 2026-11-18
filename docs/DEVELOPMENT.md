# 开发导航

0.107 / 2026-11-16。只按当前任务读取相关模块，不必加载整个 main.tsx 或所有测试。

## 常用定位

| 任务 | 入口 |
| --- | --- |
| 页面/录制结束竞态 | src/main.tsx、recording.ts、useLandmarkCamera.ts |
| 稳定选手/双手坐标 | coordinate-hands.ts、coordinate-detector.ts、vision.worker.ts、hand-learning.ts |
| 动态/姿态/连续 | core.ts、learning.ts、continuous.ts、lab-motion.ts |
| 轨迹参考 | hand-path.ts、focus.ts；旧无 handPath 不等于强制新掌心默认 |
| 示例动画 | FeatureGuide.tsx、HandInteractionGuide.tsx、MediaInteractionGuide.tsx、TrackingFigure.tsx |
| 示例输入和计时 | feature-demo.ts、interaction-demo.ts、tracking-demo.ts、demo-rule.ts；后者用实际 DwellGate |
| 新建规则初值/差异提示 | tracking-presets.ts；只新建使用，不迁移旧规则 |
| 动作对照 | MotionComparison.tsx、motion-comparison.ts；生产调用 main.tsx |
| 保存/校验 | storage.ts、core.ts、objects.ts、audio.ts、ProjectSaveStatus.tsx |
| 主页批量删除 | ProjectLibrary.tsx、batch-delete.ts、main.tsx |
| 输出与命名 | coordinates.ts、coordinate-payload.ts、CoordinateOutputDialog.tsx、serial.ts、mqtt-output.ts、osc.ts |
| 设置/视觉/声音 | CoordinateStudio.tsx、ObjectStudio.tsx、AudioStudio.tsx、相关 Controls 与 Panel |
| 文案/教程/外观 | locales/en.json、i18n.ts、learn-content.ts、style.css |

React 18.3 + TS/Vite、Lucide、普通 CSS；MediaPipe Tasks Vision 0.10.35。Worker 优先、主线程兼容回退；Node 原生 HTTP，无 Express/云数据库/服务端训练。内部 pose 是 PoseLandmarker。

## 数据与账号
- 动作项目：IndexedDB `motion-studio` / `projects`，带项目ID及旧 `current` 兼容记录（`storage.ts`）。
- 视觉项目：localStorage `motion-object-projects`，迁移旧 `motion-object-project`（`objects.ts`）。声音：`motion-audio-projects`（`audio.ts`）。
- 数据属于当前浏览器与 origin，不跟账号同步；换域名/端口不会自动带过去，先导出 JSON 再导入。参考音频会增加 localStorage 占用。
- Key/密码不进入项目；普通图片、待测音频和识别历史不作项目持久化。白名单清理函数是存储边界。
- `config/users.json` 为服务端 scrypt 摘要账号文件，`server/users.mjs` 校验；`npm run users` 管理。不要在交接中复制账号摘要或会话密钥。
- 登录、访客均可获得12小时签名 HttpOnly/SameSite=Strict Cookie；退出撤销表与限流在进程内存。不是跨实例会话管理。

## API 与环境配置
所有以下接口均 POST JSON，同源且经访问门禁：

| 接口 | 用处 |
| --- | --- |
| `/api/objects/check`、`/api/objects/detect` | 视觉模型访问验证、截图识别 |
| `/api/audio/check`、`/api/audio/detect` | 声音凭证验证、录音识别 |

`/auth/login`、`/auth/guest`、`/auth/logout` 是表单 POST 路由。

当前代码白名单（不是已联网核实的供应商最新列表）：
- 视觉 DeepSeek：`deepseek-flash` → `api.deepseek.com/chat/completions`；默认平台 DeepSeek。
- 视觉 OpenAI：`gpt-4.1-mini`、`gpt-4o-mini` → `/v1/responses`。
- 声音 OpenAI：关键词固定 `gpt-transcribe` → `/v1/audio/transcriptions`；事件固定 `gpt-audio-1.5` → `/v1/chat/completions`。
- 讯飞：仅关键词；APPID/APIKey/APISecret，服务端签名连接 `iat-api.xfyun.cn/v2/iat`。签名连接成功不能证明 APPID、额度和识别服务权限。

运行环境变量：`HOST`、`PORT`、`SESSION_SECRET`、`AUTH_COOKIE_SECURE`。线上 `HOST=0.0.0.0`，HTTPS 使用 `AUTH_COOKIE_SECURE=true`；本地HTTP不可直接沿用Secure Cookie。`APP_PASSWORD` 不再是生产账号来源，代码的显式password模式用于旧测试。

## 目录与关键入口
| 文件/目录 | 职责 |
| --- | --- |
| `src/main.tsx` | 追踪工作台、录制/运行状态、摄像头生命周期、页面切换 |
| `src/core.ts`、`learning.ts`、`continuous.ts` | 项目类型/校验、DTW、分类与回归 |
| `src/lab-motion.ts`、`LabPanel.tsx`、`lab-compare.worker.ts` | 已合入正式版的增强与独立测试对比，Lab命名不表示未实现 |
| `src/vision.worker.ts`、`focus.ts` | MediaPipe检测、选点/特征重算 |
| `src/camera-assets.ts`、`useLandmarkCamera.ts` | 三种追踪的模型与 WASM 浏览器缓存、启动进度、坐标摄像头生命周期 |
| `src/CoordinateStudio.tsx`、`coordinates.ts`、`coordinate-detector.ts` | 坐标选点、格式与限速、模型兼容回退 |
| `src/CoordinateOutputDialog.tsx`、`CameraPlaceholder.tsx` | 命名与选轴窗口、共用摄像头开启入口 |
| `src/Skeleton.tsx`、`PointPicker.tsx`、`face-visual.ts` | 骨骼渲染、选点和面部简洁显示 |
| `src/region.ts`、`relation.ts`及对应Controls | 规则计算、阈值/区域UI |
| `src/ObjectStudio.tsx`、`objects.ts`、`detection-region.ts` | 视觉工作台、项目、送检裁切 |
| `src/AudioStudio.tsx`、`audio.ts`、`AudioClipEditor.tsx`、`VolumeControls.tsx` | 声音工作台与音频处理 |
| `src/serial.ts`、`mqtt-output.ts`及对应Panel | 输出生命周期与状态 |
| `src/HistoryList.tsx`、`trim.ts`、`RecordingControls.tsx`、`CameraRecordingKeys.tsx` | 最新优先历史、裁切/快捷键、录制按钮 |
| `src/WorkspacePreview.tsx`、`preview.ts` | 浮动摄像头预览与坐标 |
| `src/CreateChoices.tsx`、`HoverHelp.tsx`、`method-help.ts`、`recognition-help.ts` | 创建选项和说明 |
| `src/style.css`、`i18n.ts`、`locales/en.json` | 全站样式与翻译 |
| `server/access.mjs`、`users.mjs` | 认证与账号校验 |
| `server/object-api.mjs`、`audio-api.mjs`、`xfyun.mjs` | 上游代理、校验、取消与限流 |
| `vite.config.ts`、`server/start.mjs` | 开发中间件、正式HTTP入口 |
| `public/models/*.task`、`public/wasm/` | 模型与WASM资源；主线程/Worker均按base加载 |
| `public/tutorials/`、`public/examples/`、`src/Learn.tsx`、`learn-content.ts` | Arduino/ESP32-S3 与五种创作软件接收案例、连接教程 |

## 启动与部署
Node >=22.12；`npm ci` → `npm run dev`，使用终端实际端口；Vite插件同时提供访问门禁和API，不需要另开代理。

正式运行：`npm run build` → `npm start`，Node提供dist和API；默认127.0.0.1:5173，部署读取PORT。检查：`npm test`、`npm run build`。

GitHub仓库：https://github.com/ZhichenGu/ml-play 。Render使用Node Web Service，构建 `npm ci --include=dev && npm run build`，启动 `npm start`；推送后仍须确认Render实际部署提交。正式访问地址 https://ml-play.onrender.com/ 已通过访客入口核实。桌面安装包和各平台验证状态见 README；发布说明模板见 [docs/RELEASING.md](RELEASING.md)。

当前仓库没有 `.github/` 工作流或 Render blueprint。GitHub Pages纯静态托管不能提供账号与API代理；不要将Pages失败当作Render失败。未配置自动发布桌面安装包。


## 验证和维护

`npm test` 与 `npm run build` 是当前检查入口；0.107 已通过 274 项。文档改动检查路径/链接/状态，不必因此重新跑真人或收费请求。下载案例改动后执行 `python3 scripts/package-examples.py` 并用 `--check` 核对。

开发检查页只在预览 checks/、scripts/visual-check/；不合入生产入口或把临时模拟数据写进用户项目。首次开本机服务确认实际端口和来源；不要覆盖已有服务或改变安全配置。

敏感信息不写文档：API Key、密码、Cookie、用户账号摘要、会话密钥。环境变量只写名称与用途，不复制真实值。上游型号列表来自代码快照，不是官方最新能力证明。
