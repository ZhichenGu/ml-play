# Platform

[中文](#中文) · [English](#english)

## 中文

一个受 Wekinator 启发的小工具，用摄像头和麦克风做交互实验。可以录下动作示范，让它学习识别，也可以接入自己的 API 做图像和声音识别。结果通过 Serial、MQTT 或 OSC 发给 Arduino、ESP32 或其他程序。

### 在哪里使用 Platform？

| 版本 | 入口与状态 |
| --- | --- |
| 网页版 | **[打开 Platform](https://ml-play.onrender.com/)**。无需安装，点击「访客进入」即可开始，右上角可切换中英文。 |
| macOS | [下载 Apple Silicon 0.107（DMG）](https://github.com/ZhichenGu/ml-play/releases/download/v0.107.0/Platform-0.107.0-macOS-arm64.dmg)。打开后将 Platform 拖入「应用程序」。已在 macOS 15.7.5 测试，尚未经过 Apple 公证。 |
| Windows | [下载 Intel/AMD 64 位测试版（EXE）](https://github.com/ZhichenGu/ml-play/releases/download/v0.107.0/Platform-0.107.0-Windows-x64-Setup.exe)。安装包未签名，Windows 10 和 11 的真机安装与设备权限待测。 |

[查看 v0.107.0 发布说明和校验文件](https://github.com/ZhichenGu/ml-play/releases/tag/v0.107.0)。正式网页为 0.114，桌面安装包为 0.107。Windows 安装包供测试，尚未完成 Win10/Win11 真机验收。


### 0.118 本机网页预览

在运行预览服务的 Mac 上打开 [0.118 预览](http://127.0.0.1:5198/)。手机竖屏的首页按类别列出项目。手部、面部和身体追踪把当前步骤放在固定底栏，视觉可展开「目标与 API」，声音把录音与音量操作放在底栏。桌面浏览器使用原工作台布局。设置和详细记录可按需展开。

手机与电脑的手部、面部和身体追踪共用浏览器模型缓存。首次使用某个追踪类型需加载该类型的模型；模型及共用运行文件仍在缓存中时，重开摄像头或关页后重开可直接初始化检测。预览和正式站的项目分开保存，可用导出与导入在两者之间迁移。

正式网站为 **0.114**，已上线手机手部模型缓存。桌面安装包为 **0.107**。预览的实际验证与待验事项见 [当前交互与验收](docs/当前交互与验收.md)。

### 示意动画与动作对照（0.107）

新建手部、面部、身体、视觉或声音项目后，先看对应交互的示意动画；可暂停、重播，之后也能从标题旁重看。动态动作提供“只看整体轨迹／只看局部形变／形变＋整体轨迹”三张卡片：点击预览、确定应用，确认的方式显示“推荐”；关闭不应用。动画用于解释交互，不是真实识别结果，不调用 API、不生成示范或发送输出。

手部、面部和身体的动态动作均提供暖橘色“动作对照”：默认参考当前动作最新的正向训练示范，也可切换旧示范；实时留痕、回放示范、查看这次对照依次排列。形变显示关键点骨架，轨迹显示移动路径，组合同时显示；追踪丢失会断开留痕，切换动作或录制不会混入旧片段。对照用于观察差异，不是评分。

标题旁可切换学习方式，改变后需重新训练，原示范保留。新建手部动态项目默认整体轨迹，用掌心中心表示整手移动；P 设置可另选食指尖或手腕，与关注哪些手指形变分开。旧项目保留原参考与规则；入门示例不同时会提示。首页每类项目支持确认后全部删除，已导出的文件不受影响。

以上功能包含在 0.107 源码与桌面包中，网页以部署版本为准。

### 设置面板（0.98）

P 设置面板按当前分类的内容调整高度，长内容可滚动；拖动顶部可手动调整，各分类在当前工作台会话内独立记忆高度。此更新包含在 0.107 桌面包中，网页以部署版本为准。

### 手部交互范围（0.97）

动作匹配、姿态分类、连续控制、区域停留和动作关系使用单手，并保持当前控制手，另一只手入镜不抢占；持续丢失后才允许接替。录制中检测到换手会取消该次录制，不保存混合示范。仅“直接输出手部坐标”提供单手/双手选择；单手自动追踪一只可用的手，不要求选择左右。创建时固定项目手数，工作台不重复切换；双手项目可选单手输出或双手输出，左右手独立输出。自动单手输出优先保持当前手，短暂遮挡暂停，持续离开后才由另一只接替；原手回来不抢占。双手/混合动作学习暂缓开放，0.84 实验项目和录制保留，可导出备份，不自动转换为单手项目。本版改动已合回本地源码，GitHub 与网页以推送和部署结果为准。桌面安装包为 0.107。

### 直接输出追踪坐标（0.97）

手部、面部和身体追踪均可选择“直接输出坐标”。手部支持单手 21 点、双手 42 点和推荐组合，面部/身体当前最多四点。开启摄像头后选择所需点，按 P 设置平滑与发送频率；在输出方式中选 Serial、MQTT 或 OSC，打开居中窗口，为点命名并勾选 X/Y/Z，完成连接和测试后“应用并返回”，再点击“开始输出”。XY 与镜像预览一致，Z 为相对深度。项目自动保存在当前浏览器。

本版“案例代码”已包含 Processing、openFrameworks、Max/MSP、p5.js 和 TouchDesigner 的教程、官方资料链接与下载。TouchDesigner 支持 OSC In CHOP、MQTT Client DAT 和 Serial DAT。接收项目、消息格式、串口链路说明与待验证项见[坐标案例说明](public/examples/coordinates/README.md)。网页版需下载新版 OSC 桥接。0.107 桌面包已包含单双手坐标、录制保护和标题栏学习方式切换。线上网页版本以部署结果为准。

### 可以做什么

| 类别 | 功能 |
| --- | --- |
| 动作追踪 | 手部、面部、身体；在本机运行 |
| 视觉识别 | 找物体、计数、判断画面条件；使用自己的 DeepSeek / OpenAI API Key |
| 声音识别 | 语音关键词：OpenAI / 科大讯飞；声音事件：OpenAI；音量控制：本机处理 |

动作追踪有六种处理方式：

- **动态动作匹配**：录下一次挥手，完成相似动作时触发一次。
- **姿态分类**：录下握拳等姿态，识别并稳定确认后触发一次。
- **连续控制**：给不同姿态设置数值，训练后持续输出中间值，例如 `0.12 → 0.45 → 0.83`。
- **区域与停留**：选一个点，进入指定区域并停留后触发，无需训练。
- **动作关系**：选两个点，判断距离或上下关系，无需训练。
- **坐标输出**：选检测点，直接输出命名的 X/Y/Z 数值，无需示范或训练。

新建项目时，把鼠标放在处理方式上可以查看具体例子。动作学习可以选择「关注部位」的推荐组合，或直接点击骨骼点自定义；修改后需要重新训练。左侧动作名可双击或点击铅笔重命名。按 P 可调整录制时间；学习工作台的大画面向上滚出约三分之一后会出现可拖动的小预览。坐标页目前没有浮动小预览。

动态动作可切换原版算法与实验增强，增强包含动作特征、起止切分和多示范匹配。切换后需重新训练，原始录制保留；用独立测试比较效果。面部新增嘴部、眼睑和眉部组合。视觉识别可选择送检区域，声音事件支持参考音频裁切，音量支持直接标定上下端点。

### 如何使用

1. 新建项目，选择输入和处理方式。
2. 动作学习先录制示范、再训练；区域与动作关系直接设置规则；坐标输出直接选点。视觉和声音 API 使用者需填写自己的凭证。
3. 选择状态灯、Serial、MQTT 或 OSC，测试后开始运行。

Serial 用 USB 连接设备，建议使用桌面 Chrome 或 Edge。MQTT 在网页中填写 Broker 的 WebSocket 地址，HTTPS 网站使用 `wss://`。首页有连接教程和 Arduino / ESP32-S3 案例下载。

### OSC 接收

网页版在浏览器所在电脑安装 Node.js 22.12 或更高版本，在下载目录运行 `node platform_osc_bridge.mjs`。首页「教程与示例 → OSC 入门」有分步说明和下载，「案例代码」也提供[本机桥接](public/examples/platform_osc_bridge.mjs)和 [Max 接收案例](public/examples/osc_receiver.maxpat)。下载 [Processing 动作触发草图](public/examples/processing_trigger.zip)（oscP5）或 [openFrameworks 连续数值工程](public/examples/openframeworks_value.zip)（ofxOsc）。一次只运行一个监听同一端口的案例。

按 P 选择 OSC 输出，填写接收端 IP（同机 `127.0.0.1`，跨设备填私有 IPv4）、UDP 监听端口（默认 9000）和 OSC 地址。触发默认向 `/platform/trigger` 发送动作名或 YES/NO 文本，可改为自定义 String、Integer（int32）或 Float（float32）。发送整数或命名坐标需下载并重启新版桥接。连续数值向 `/platform/value` 发送 float。点「应用目标」并测试，按浏览器提示允许本地网络访问，在接收软件中确认收到。

如果启动桥接时报 `EADDRINUSE`，表示本机桥接端口 8765 已被占用。先确认是否已经运行了 Platform 桥接；若是，直接复用。网页里的 9000 是接收软件的 UDP 端口，修改它不能解决桥接启动冲突。

已保存的项目在当前浏览器中，刷新后可以从首页重新打开。各类项目自动保存；请等待顶部显示「已保存在此浏览器」。若提示保存失败，先导出备份。MQTT、OSC 等连接参数的「保存配置／应用目标」仍需点击；这与项目自动保存是两件事。可导出备份，不会跟随账号同步。API Key 和 MQTT 密码不写入项目。动作追踪在本机处理；API 识别会把提交的图片或音频经网站服务发给所选平台，使用你自己的额度。

### 本地运行

需要 Node.js 22.12 或更高版本。

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。正式运行：

```sh
npm run build
npm start
```

检查代码用 `npm test`。账号管理用 `npm run users`。项目使用 React、TypeScript、Vite、Node.js 和 MediaPipe；视觉与声音 API 需要 Node 服务，不能只部署静态文件。

### 使用桌面版

桌面版内含运行环境及手、脸、身体模型。追踪、训练和音量控制在本机运行，OSC 可直接向接收端发送。云端识别需要联网和自己的 API 凭证，MQTT 需要可访问的 Broker。网页项目迁移到桌面版时，先在网页「导出项目」，再在应用首页「打开项目」。本地 Mac 测试包使用临时签名，尚未通过 Apple 公证。Windows 测试包尚未签名。构建命令与各平台验收记录见[发布说明](docs/RELEASING.md)。

## English

A small tool inspired by Wekinator, built for interactive experiments with a camera and microphone. Record examples to teach it gestures and poses, or use your own API credentials for image and audio recognition. Send results to Arduino, ESP32 or other software through Serial, MQTT or OSC.

### Where can I use Platform?

| Edition | Availability |
| --- | --- |
| Web | **[Open Platform](https://ml-play.onrender.com/)** and choose **Continue as guest**. No installation required. Switch languages in the top-right corner. |
| macOS | [Download for Apple Silicon (DMG, 0.107)](https://github.com/ZhichenGu/ml-play/releases/download/v0.107.0/Platform-0.107.0-macOS-arm64.dmg). Open it and drag Platform into Applications. Tested on macOS 15.7.5. This build has not been notarized by Apple. |
| Windows | [Download the Intel/AMD x64 preview (EXE)](https://github.com/ZhichenGu/ml-play/releases/download/v0.107.0/Platform-0.107.0-Windows-x64-Setup.exe). The installer is unsigned. Installation and device access on Windows 10 and 11 are awaiting real-device tests. |

[Read the v0.107.0 release notes and find the checksums](https://github.com/ZhichenGu/ml-play/releases/tag/v0.107.0). The live website is version 0.114. Desktop installers are version 0.107. The Windows installer is for testing and still awaits Windows 10/11 real-device validation.


### Local web preview 0.118

Open the [0.118 preview](http://127.0.0.1:5198/) on the Mac running the preview server. The portrait phone layout groups projects by category. Hand, face, and body tracking keep the current action in a fixed bottom bar. Vision has an expandable **Target and API** panel, and audio keeps recording and volume controls in the bottom bar. Desktop browsers retain the existing workspace layout. Settings and detailed results can be opened as needed.

Hand, face, and body tracking share a browser cache on phones and computers. The first use of a tracking type loads its model. When the model and shared runtime files are still cached, reopening the camera or page skips the download and initializes the detector. The preview and the live site store projects separately. Export and import projects to move them between sites.

The live website is **0.114**, with model caching for hand tracking in the phone layout. Desktop installers are **0.107**. See the [verification record](docs/当前交互与验收.md) for the preview checks and outstanding tests.

### Illustrated guides and motion comparison (0.107)

New hand, face, body, vision and audio projects open an illustrated guide with pause and replay controls; reopen it beside the title. Dynamic guides offer movement path, local shape, or both: click to preview and confirm to apply. The confirmed choice receives the Recommended label; closing discards the draft. Illustrations explain behavior, not real recognition results, and do not call APIs, create recordings or send output.

Dynamic hand, face and body projects include an amber Motion comparison control. It defaults to the latest positive training example, with older examples available. Live trails, reference playback and the latest comparison show paths, landmark shapes or both according to the chosen feature. Tracking loss breaks trails; changing actions or recording does not mix old segments. Comparison is a visual aid, not a score.

Change the learning feature beside the title, then retrain; recordings remain intact. New dynamic hand projects default to movement path using the palm center. P settings can select the index fingertip or wrist separately from shape focus. Existing projects keep their reference and rules; a notice explains differences from starter examples. Each project category also supports deleting all its projects after confirmation; exported files are unaffected.

These changes are included in the 0.107 source and desktop installers; the website depends on deployment.

### Settings panel (0.98)

The P settings panel fits the current tab’s content, with scrolling for longer sections. Drag the top edge to resize; each tab remembers its height during the current workspace session. This update is included in the 0.107 desktop installers; the website depends on deployment.

### Hand interaction scope (0.97)

Action matching, pose classification, continuous control, dwell and relation rules keep one active hand; a second hand does not preempt it. Handover follows sustained loss. A detected hand change during recording cancels the take instead of saving a mixed-hand example. Only direct coordinate output offers Single/Two hands. Single automatically tracks one available hand, without asking for left or right. Project capacity is fixed at creation. Two-hand projects offer single-hand or two-hand output, with independent channels. Automatic single-hand output keeps the current hand, pauses on brief occlusion and hands over only after sustained loss; the returning hand does not take control back. Two-hand/mixed learning is on hold. Existing 0.84 experimental projects and recordings remain exportable and are not converted into single-hand data. These changes are merged into the local source. The website version depends on deployment. Desktop installers are available at 0.107.

### Direct tracking coordinates (0.97)

Hand, face and body projects can stream coordinates directly. Hands support all 21 landmarks on one hand or all 42 on both hands, plus presets. Face and body currently support four landmarks. Press P for smoothing and rate settings; choose Serial, MQTT or OSC to open the naming window, name each point, choose X/Y/Z, connect and test, then Apply and return and Start output. XY follows the mirrored preview and Z is relative depth. Project settings save automatically in the current browser.

The source version’s Examples section includes downloadable projects, guides and official references for Processing, openFrameworks, Max/MSP, p5.js and TouchDesigner. TouchDesigner supports OSC In CHOP, MQTT Client DAT and Serial DAT. See the [coordinate receiver guide](public/examples/coordinates/README.md) for formats, serial topology and pending receiver tests. Web OSC needs the updated bridge. The v0.107 desktop installers include single/two-hand coordinates, recording protection and the title-bar feature selector; the online web version depends on deployment.

### What it does

| Category | Features |
| --- | --- |
| Motion tracking | Hands, face and body; runs locally |
| Visual recognition | Object detection, counting and visual conditions; your own DeepSeek / OpenAI API key |
| Audio recognition | Speech keywords: OpenAI / iFLYTEK; sound events: OpenAI; volume control: local |

Motion tracking offers six methods:

- **Dynamic action matching**: record a wave, then trigger once after a similar movement.
- **Pose classification**: record a held pose, such as a fist, and trigger after stable recognition.
- **Continuous control**: assign values to poses, train, then output intermediate values such as `0.12 → 0.45 → 0.83`.
- **Region and dwell**: choose one point and trigger when it stays in a region. No training needed.
- **Pose relationships**: choose two points and check their distance or vertical order. No training needed.
- **Coordinates**: select landmarks and stream named X/Y/Z values without demonstrations or training.

Hover over a method when creating a project to see examples. For motion learning, choose a focus preset or click landmarks to customize the points used. Retrain after changing them. Double-click an action name or click its pencil to rename it. Press P to adjust recording times; in the learning workspace, a draggable preview appears after about one third of the camera view scrolls above the viewport. The coordinate page does not currently have a floating preview.

### Getting started

1. Create a project and choose an input and processing method.
2. Record and train for gesture or pose learning, set rules for regions and relationships, or select points for direct coordinates. API recognition needs your own credentials.
3. Choose a status light, Serial, MQTT or OSC output, test it, then start.

For Serial, connect your device over USB and use desktop Chrome or Edge. For MQTT, enter the broker’s WebSocket address; HTTPS sites require `wss://`. The home page includes connection guides and Arduino / ESP32-S3 example downloads.

### Receiving OSC

For the web edition install Node.js 22.12 or later on the browser computer and run `node platform_osc_bridge.mjs` from the downloads folder. Get the [bridge](public/examples/platform_osc_bridge.mjs) and [Max patch](public/examples/osc_receiver.maxpat) under Learn & Connect → OSC quick start, or from Example code. Download the [Processing trigger sketch](public/examples/processing_trigger.zip) (oscP5) or [openFrameworks continuous example](public/examples/openframeworks_value.zip) (ofxOsc). Run one receiver per port.

Press P, select OSC, and enter the receiver IP (127.0.0.1 on the same machine, or a private IPv4 on the LAN), UDP port (default 9000), and OSC address. Triggers send a custom String, Integer (int32) or Float (float32) to `/platform/trigger` and continuous controls send floats to `/platform/value`. Download and restart the updated bridge for integer and named-coordinate support. Apply the target, test send, allow local network access if prompted, and check the receiver.

If the bridge reports `EADDRINUSE`, its local port (8765) is already in use. If Platform’s bridge is already running, use that instance. The UDP port in the web form (9000 by default) belongs to the receiving software; changing it will not fix a bridge startup conflict.

Saved projects stay in this browser and can be reopened from the home page after a refresh. All project types save automatically; wait for **Saved in this browser**. Export a backup if saving fails. Connection settings such as MQTT Save configuration or OSC Apply target still need their own action; those are separate from project autosave. Export projects for backup; signing in does not sync them. API keys and MQTT passwords are not included in project files. Motion tracking runs locally. API recognition sends submitted images or audio through the website’s server to your chosen provider and uses your own API credit.

### Running locally

Use Node.js 22.12 or later. Run `npm ci`, then `npm run dev` and open the address shown in the terminal. For production, run `npm run build`, then `npm start`.

Run checks with `npm test` and manage accounts with `npm run users`. Built with React, TypeScript, Vite, Node.js and MediaPipe. Image and audio API features need the Node server; static hosting alone is not enough.

### Using the desktop edition

The desktop app bundles its runtime and hand, face and body models. Tracking, training and volume control run locally. OSC sends directly to your receiver. Cloud recognition needs an internet connection and your own credentials. MQTT needs a reachable broker. To move a project from the web, choose **Export project** in the browser and **Open project** on the app’s home screen. The local Mac test build is ad hoc signed and has not been notarized. The Windows test installer is unsigned. See the [release notes and build instructions](docs/RELEASING.md).



维护教程与下载包时，见[当前交互与验收](docs/当前交互与验收.md)和[发布说明](docs/RELEASING.md)。

For tutorial verification and source/archive checks, see the [current validation notes](docs/当前交互与验收.md) and [release guide](docs/RELEASING.md).

全部当前说明与历史记录分类见[文档导航](docs/README.md)。

See the [documentation index](docs/README.md) for current guides and historical records.

## 继续开发 / Developer handoff

新聊天先读 [当前交接](PROJECT_CONTEXT.md)；按需查 [开发导航](docs/DEVELOPMENT.md)、[设计决定](docs/DECISIONS.md)、[限制与待办](docs/KNOWN_ISSUES.md)。历史记录不作为当前配置。Start with the current handoff; load history only when tracing a specific issue.
