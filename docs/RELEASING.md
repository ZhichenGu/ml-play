# Platform 发布说明

README 回答“今天能用哪个版本”；一个 GitHub Release 对应一个版本，记录“这一版改了什么、该下载哪个文件、实际在哪跑过”。网页版可以单独发版，不必等桌面版。按用户授权选择正式发布或预发布；发布标签不能替代各平台验收。未验证的平台附件明确标为测试包，不能宣称兼容性通过。推送、发布及可能的自动部署须在授权范围内完成。

## 0.118 网页预览候选 · 2026-11-18

- 本机预览 [127.0.0.1:5198](http://127.0.0.1:5198/) 提供三种追踪的手机与桌面模型缓存，以及手机竖屏的追踪、视觉和声音工作台。在线正式网页为 [0.114](https://ml-play.onrender.com/)。
- 桌面附件沿用 [v0.107.0](https://github.com/ZhichenGu/ml-play/releases/tag/v0.107.0) 的 Apple Silicon DMG、Windows x64 测试包和校验文件。
- 检查范围与待验事项见[当前交互与验收](当前交互与验收.md)。此处记录预览候选，发布后需另行核对 Render 实际版本。

## v0.107.0 桌面发布验收 · 2026-11-16

- 候选包位于 `desktop/out/release-0.107.0/`：`Platform-0.107.0-macOS-arm64.dmg`、`Platform-0.107.0-Windows-x64-Setup.exe`、`SHA256SUMS.txt`。已发布至 [v0.107.0](https://github.com/ZhichenGu/ml-play/releases/tag/v0.107.0)，标记为 Latest；公开 Assets 中两个安装包的 GitHub SHA256 均与本地校验文件一致。
- 274 项测试（244 应用 + 30 服务端）、生产构建和八个案例 ZIP 一致性检查通过；未发现阻塞发布的问题。未修改功能代码。
- 常规 Electron 下载停滞后，核对并复用 45.2.3 运行环境，完整重建 app.asar，更新双平台版本、完整性信息和 Mac 签名。ASAR 59 个文件与 desktop/stage 一致。Windows EXE 为 x64，内部版本 0.107.0；NSIS 解包成功，内嵌 app.asar 与构建字节一致。
- macOS 15.7.5 / Apple Silicon：最终 DMG 校验通过，从映像复制到独立 `/tmp/platform-107-installed/Platform.app` 后卸载映像；签名校验、启动、界面版本 0.107、动作关系示意与退出重开后的项目列表保留通过。本轮未替换 `/Applications` 中的旧应用。
- Mac ad hoc 签名，未 Apple 公证；Windows 未签名，Win10/11 真机安装、启动和设备权限待验。本轮未测真人识别、物理 Serial/MQTT、付费 API 或全部接收软件。网页入口 https://ml-play.onrender.com/ ，本轮未核对部署版本。
- 发布源码对应 `1e997573c66f388b687725d3c777ef2d8ea46f8e`；用户已授权检查通过后上传两平台附件并更新 GitHub Release，未授权推送分支或部署。

## 0.107 本地源码合回 · 2026-11-16

示意动画覆盖手/脸/身体六类交互及视觉/声音，动态加入动作对照、独立轨迹参考和推荐选择。详细行为与验证见当前规格及当前验收。仅更新本地正式源码和文档；未提交、推送、创建标签、发布 Release 或生成安装包。公开附件仍使用下方 v0.97.0，不能把源码更新描述为桌面包已更新。线上版本需在用户推送部署后另行确认。

## v0.97.0 · 2026-11-15

- 网页：https://ml-play.onrender.com/，线上已确认 0.97。
- 新增单/双手独立坐标输出与 21/42 点选择；稳定选手、遮挡暂停、录制换手/歧义取消和录制结束等待在途检测。标题旁可切换动态学习方式；新建手部动态项目默认整体轨迹；六种手部点位统一小尺寸，白点 75%、红点 100%。
- 附件：`Platform-0.97.0-macOS-arm64.dmg`、`Platform-0.97.0-Windows-x64-Setup.exe` 和 `SHA256SUMS.txt`，位于 `desktop/out/release-0.97.0/`。Windows 为测试包。
- 本机 macOS 15.7.5 / Apple Silicon：最终 DMG 校验、挂载复制到 /Applications、卸载映像、签名校验和启动通过；界面显示 0.97，原有坐标项目仍可见，新建默认整体轨迹，切换局部形变退出重开保留。239 项回归（209 前端/算法/案例、30 服务端）通过。
- Windows：NSIS 及嵌入归档校验通过，解出 app.asar 与构建字节一致。未进行 Windows 10/11 真机安装、启动、摄像头和设备权限验证。Mac 仍为 ad hoc 签名、未 Apple 公证；Windows 未签名。真人识别准确率、物理串口/MQTT 和付费 API 本轮未测。
- 同版本 Electron 45.2.3 运行环境经核对后复用；完整重建 app.asar、更新 Mac/Windows 版本和归档完整性信息，重新签署 Mac 并制作 DMG/NSIS。旧 App 备份保留于 `desktop/out/release-0.97.0/previous-install/`，用户项目存储未清理。

## v0.94.0 网页源码更新 · 2026-11-14

- 合入预览副本的单手/双手坐标输出、21/42 点选择、稳定选手、遮挡触发保护、录制换手与身份歧义取消、结束等待在途检测、保存竞态及键盘修复。
- 正式源码版本 0.94。网站入口为 https://ml-play.onrender.com/，部署状态须另行核实。
- 本批次未生成新安装包和 GitHub Release 附件，桌面下载继续使用下述 0.79 附件。
- 验证范围和已知高可信错标签限制见 HAND_INTERACTION_AUDIT.md。

## v0.79.0 · 2026-11-13

- 修正版已合入正式本地源码。147 项前端/算法/案例测试、30 项服务端测试和 3 项 Python 回调检查通过；构建与八个 ZIP 一致性检查通过。
- 新包为 `Platform-0.79.0-macOS-arm64.dmg` 与 `Platform-0.79.0-Windows-x64-Setup.exe`，校验文件为 `SHA256SUMS.txt`，集中在 `desktop/out/release-0.79.0/`。对应 [v0.79.0 发布页](https://github.com/ZhichenGu/ml-play/releases/tag/v0.79.0)，中英文 README 使用本版附件链接。Windows 附件明确作为测试包提供。
- Mac 在当前 macOS 15.7.5 / Apple Silicon 上校验最终 DMG、挂载复制应用、卸载映像后启动。界面版本 0.79，原项目可读，新坐标项目退出重开保留。应用内测试发送经独立本机 UDP 接收，验证 `/platform/hand/index_tip/x` 与 `/y` 均为 Float 0.5；未启动外部桥接。未测试真人准确率、真实串口、付费 API。
- Mac 为 ad hoc 签名，已校验签名，未获 Apple 公证。Windows 无签名；安装程序的嵌入压缩包完整性通过，解出的 app.asar 与构建内容逐字节一致，应用和 EXE 版本均为 0.79.0。未声称 Windows 10/11 真机安装、启动或设备权限通过。
- 本次正常构建遇到 Electron 下载缓慢；核对本地既有运行环境为相同 Electron 45.2.3 后复用运行环境，重新生成完整 app.asar，更新 Mac/Windows 版本与 ASAR 完整性信息，再签署 Mac、制作 DMG 和 NSIS。不是把 0.75 安装包改名。
- 当前来源、旧协议兼容和接收端限制见[当前验收](当前交互与验收.md)、[全量文档审阅](DOCS_AUDIT.md)、[教程审阅](TUTORIAL_AUDIT.md)。网页部署另行核对，不把 GitHub 发布当作 Render 已成功部署。

## v0.75.0 桌面预发布版

- 网页入口为 [Platform](https://ml-play.onrender.com/)。桌面与线上可以分别更新，请在发布时核对网站实际版本。
- 安装包内含 Electron、工作台、三种追踪模型、音量处理和教程资源。OSC 直接发送 UDP。已有网页项目可导出 JSON，再由桌面首页打开。
- Mac 附件名为 `Platform-0.75.0-macOS-arm64.dmg`，适用 Apple Silicon。当前采用 ad hoc 签名，尚无 Developer ID 签名与 Apple 公证。
- Windows 附件名为 `Platform-0.75.0-Windows-x64-Setup.exe`，面向 Intel/AMD 64 位电脑。本地测试包未签名。Windows 10、11 的真机安装与设备权限待分别验证。
- 桌面安装包位于本地 `desktop/out/`。仓库忽略此目录，维护者发布时将附件上传至对应版本的 Assets。

### 本次安装包验收

| 平台 | 实际结果 |
| --- | --- |
| macOS 15.7.5 / Apple Silicon | 校验 DMG，挂载并复制其中的应用，卸载映像后启动。阻断外网域名解析后，新建并保存动作、视觉、声音项目，退出应用后重新打开，三个项目均保留。 |
| Mac 输入和输出 | 模拟摄像头成功加载手部模型。模拟麦克风的 RMS 为 0.4635，映射输出为 0.464。内置 OSC 经应用的「测试发送」发到独立的本机 UDP 接收端，核对了连续浮点数与文本、整数、浮点数触发。真实设备、外接硬件和付费 API 待测。 |
| Windows x64 | NSIS 安装程序的嵌入压缩包完整性通过，解出了 x64 主程序，应用资源与构建产物一致。在这台 Mac 的 CrossOver 中，静默安装返回 2。从解包目录启动时遇到图形进程异常。Windows 10、11 真机仍待安装、启动及设备测试。 |
| 网页回归 | 本地正式构建通过，132 项前端及算法测试、29 项服务端测试通过。 |

两个安装包已上传至 [v0.75.0 公开预发布页](https://github.com/ZhichenGu/ml-play/releases/tag/v0.75.0)。本地副本及 `SHA256SUMS.txt` 集中在 `desktop/out/release-0.75.0/`。本地 Mac DMG 使用系统的 `hdiutil` 从已签名的应用生成，包含“应用程序”快捷方式。

### 从源码打包

在仓库根目录运行 `npm ci` 和 `npm ci --prefix desktop`。按目标系统执行以下命令之一，默认只生成本地文件：

```sh
# Apple Silicon Mac
npm --prefix desktop run package -- --mac --arm64

# Windows x64
npm --prefix desktop run package -- --win --x64
```

桌面工作台使用独立、固定的本机地址（127.0.0.1:43879）来保留项目存储。桌面进程启动本地服务，关闭应用时退出。端口冲突时会显示启动错误。网页版 OSC 桥接继续使用 8765。

## v0.74.0 发布说明草稿

- **网页版**：[打开 Platform](https://ml-play.onrender.com/)，可以访客进入。
- **本次亮点**：首页新增独立的 OSC 入门；网页可通过本机桥接输出动作触发和连续数值。案例代码提供 Max、Processing（动作触发）和 openFrameworks（连续数值）接收示例。
- **macOS / Windows 10、11**：本版均无桌面安装包。源码压缩包不能双击当作应用安装。
- **验证范围**：本机 Apple Silicon、macOS 15.7.5，网页版正式构建成功，132 项前端/算法检查和 29 项服务端检查通过。三类项目均已验证新建、保存、刷新和重开；线上访客入口可用。OSC 以临时空闲端口验证了文本、整数和浮点数收包；本机默认桥接端口 8765 被其他程序占用。浏览器模拟输入确认了手部模型启动、音量输入及映射值显示；这不衡量真人识别准确率。没有进行桌面安装、真实付费 API 或硬件联调验收。

## 以后每版可复制

> **Platform v〈版本〉 · 〈日期〉**

> 主要变化：〈一至三条用户能体验到的变化〉

> 网页版：〈线上链接、实际部署版本〉

> macOS：〈实际附件名、芯片类型、已测系统；无包写未发布〉

> Windows：〈实际附件名、架构、Windows 10 / 11 各自验证状态；无包写未发布〉

> 项目与升级：〈旧项目如何打开，是否需要先导出备份〉

> 已验证 / 已知限制：〈列出实际跑过的路径，以及未测或受限的功能〉

首批建议文件名：Mac 用 `Platform-<version>-macOS-arm64.dmg`（内含 Platform.app）；Windows 用 `Platform-<version>-Windows-x64-Setup.exe`。同一个 Windows 安装包经 Win 10、Win 11 分别测试后才标注两者兼容。Intel Mac、Windows ARM 等架构不从其他架构的结果推断。

## 有安装包时怎样验收

1. 从候选 Release 下载最终附件，在未装 Node.js、没有项目源码的目标系统上，以普通用户身份安装、启动。记录系统版本、CPU、签名和系统提示；无需关闭系统安全保护才能使用。
2. 从新建项目走一轮摄像头录制、训练、运行，再测试麦克风音量。退出重开检查保存结果；从上一版导出并导入一份项目。声称离线可用的功能在断网后从冷启动重试。
3. 按本版宣称的输出验证：Serial 看设备实际收到什么；MQTT 看独立订阅端；OSC 用接收软件核对触发和连续数值。用模拟输入或未用真实凭证时如实标注。
4. 核对附件、版本标签、中英文 README 和线上页面。只有实际上传的附件才写成下载链接；不要把开发环境里成功启动等同于安装包验证。
