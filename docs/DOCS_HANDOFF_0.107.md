# 0.107 文档交接整理

日期：2026-11-16。目标是让新聊天不依赖旧聊天全文也能继续。只改文档，不改功能、不发布。

## 本次处理

- PROJECT_CONTEXT 从 58,931 字节压缩为约 5.4 KB（文件体积约减少 91%，不等同 token 测量）；保留当前版本/目录、最近变更、关键约束和按需入口。
- 原交接完整归档到 archive/project-context-through-0.107.md，保留历史实测与失败，明确旧“仅预览/0.75 安装包”等状态已过期，不改写为新验收。
- 新增设计决定、开发导航和限制/待验清单；区分已决定、候选方向与未授权工作。启动文本只要求最小接手，不触发全仓扫读或自动发版。
- README 中英现行功能与 v0.97 下载链接保留；补开发入口。AGENTS 更新按需阅读路径，去掉三处已失效的外部 ESP 工程绝对链接，相关任务仍须查实际工程规则。
- 当前规格/验收/发布记录保持 0.107 源码与 0.97 安装包边界；历史手部/教程/审阅报告加当前状态提示。源码 HEAD 在整理前为 f7573df，工作区当时干净；不能由此推断远端或线上部署。

## 验证范围

盘点 docs 全部文件路径并按当前/历史/案例分类；重点重读当前说明、交接、规则、发布和已知限制，核对源码版本、存储、API 白名单和模块路径。不是再次逐行验收全部历史文档/外部资料；外部供应商最新能力与收费未联网验证。

现行文档 96 个本地链接及开发地图 70 个代码文件引用检查通过，正式/预览文档已同步，git diff --check 通过。本轮只改文档，不重复运行软件测试；274 项和构建成功来自上一轮 0.107 正式目录验收，不扩展为真人、硬件或付费 API 证明。

整理前文档备份：`/Users/zhichengu/Documents/Codex/backups/2026-11-16-platform-handoff/`。不保存密钥、密码、Cookie 或账号摘要。

## 以后维护

默认交接只写最新摘要，不累加长日志。功能改动时按影响更新 README/规格/决定/限制/验收；发布后才更新实际线上与安装包结果。历史证据写明日期、输入和边界。未复核的版本标为待核，不猜测。

## docs 文件清单

| 路径 | 阅读定位 |
| --- | --- |
| [.DS_Store](.DS_Store) | 历史归档/阶段记录 |
| [0.2更新与后续规格.md](0.2更新与后续规格.md) | 历史归档/阶段记录 |
| [0.3更新与验收记录.md](0.3更新与验收记录.md) | 历史归档/阶段记录 |
| [0.4身体追踪修复.md](0.4身体追踪修复.md) | 历史归档/阶段记录 |
| [0.5物体检测API规格与验收.md](0.5物体检测API规格与验收.md) | 历史归档/阶段记录 |
| [0.6提前保存与命名更新.md](0.6提前保存与命名更新.md) | 历史归档/阶段记录 |
| [COORDINATE_PREVIEW.md](COORDINATE_PREVIEW.md) | 历史归档/阶段记录 |
| [DECISIONS.md](DECISIONS.md) | 当前入口/说明 |
| [DEVELOPMENT.md](DEVELOPMENT.md) | 当前入口/说明 |
| [DOCS_AUDIT.md](DOCS_AUDIT.md) | 历史证据（按需） |
| [HAND_INTERACTION_AUDIT.md](HAND_INTERACTION_AUDIT.md) | 历史证据（按需） |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md) | 当前入口/说明 |
| [README.md](README.md) | 当前入口/说明 |
| [RELEASING.md](RELEASING.md) | 当前入口/说明 |
| [TUTORIAL_AUDIT.md](TUTORIAL_AUDIT.md) | 历史证据（按需） |
| [archive/interaction-0.43.md](archive/interaction-0.43.md) | 历史归档/阶段记录 |
| [archive/product-0.1.md](archive/product-0.1.md) | 历史归档/阶段记录 |
| [archive/project-context-through-0.107.md](archive/project-context-through-0.107.md) | 历史归档/阶段记录 |
| [archive/startup-0.1.md](archive/startup-0.1.md) | 历史归档/阶段记录 |
| [examples/.DS_Store](examples/.DS_Store) | 接收端案例（按需） |
| [examples/ContinuousOSC/README.txt](examples/ContinuousOSC/README.txt) | 接收端案例（按需） |
| [examples/ContinuousOSC/addons.make](examples/ContinuousOSC/addons.make) | 接收端案例（按需） |
| [examples/ContinuousOSC/src/main.cpp](examples/ContinuousOSC/src/main.cpp) | 接收端案例（按需） |
| [examples/ProcessingTrigger/ProcessingTrigger.pde](examples/ProcessingTrigger/ProcessingTrigger.pde) | 接收端案例（按需） |
| [examples/ProcessingTrigger/README.txt](examples/ProcessingTrigger/README.txt) | 接收端案例（按需） |
| [preview-0.26.md](preview-0.26.md) | 历史归档/阶段记录 |
| [preview-0.28.md](preview-0.28.md) | 历史归档/阶段记录 |
| [preview-0.29.md](preview-0.29.md) | 历史归档/阶段记录 |
| [产品与技术规格.md](产品与技术规格.md) | 当前入口/说明 |
| [开发启动Prompt.md](开发启动Prompt.md) | 当前入口/说明 |
| [当前交互与验收.md](当前交互与验收.md) | 当前入口/说明 |
| [指令审阅与优化-0.5.md](指令审阅与优化-0.5.md) | 历史归档/阶段记录 |
| [指令审阅与优化说明.md](指令审阅与优化说明.md) | 历史归档/阶段记录 |
| [识别增强说明.md](识别增强说明.md) | 历史归档/阶段记录 |
| [验证记录.md](验证记录.md) | 历史归档/阶段记录 |
| [DOCS_HANDOFF_0.107.md](DOCS_HANDOFF_0.107.md) | 当前整理记录 |
