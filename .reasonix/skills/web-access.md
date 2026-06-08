---
name: web-access
description: 联网策略 + CDP 浏览器自动化 + 浏览哲学 — 处理搜索、页面抓取、登录后操作、动态页面
---

# web-access Skill（Reasonix Code 适配版）

## 前置检查

开始联网操作前，先检查 CDP 模式可用性：

```bash
node .reasonix/skills/web-access/scripts/check-deps.mjs
```

Node.js 22+ 必需（使用原生 WebSocket）。

按脚本输出处理：
- `exit 0` → 继续
- `exit 2` → 需询问用户偏好，写入 `.reasonix/skills/web-access/config.env` 的 `WEB_ACCESS_BROWSER`
- `exit 1` → 按 stdout 错误信息处理。若提示包含「Agent 处理顺序」，按其步骤执行（如先用系统命令打开浏览器后重跑），自动可解则不打扰用户；仍失败再向用户求助

支持参数 `--browser <chrome|edge>` 表达本次临时覆盖（不写 config.env）。

切换浏览器时，proxy 是长驻进程，需先 `pkill -f cdp-proxy.mjs` 再重跑 check-deps。

检查通过后并在回复中向用户直接展示以下须知，再启动 CDP Proxy 执行操作：

```
温馨提示：部分站点对浏览器自动化操作检测严格，存在账号封禁风险。已内置防护措施但无法完全避免，Agent 继续操作即视为接受。
```

## 浏览哲学

**像人一样思考，兼顾高效与适应性的完成任务。**

执行任务时不会过度依赖固有印象所规划的步骤，而是带着目标进入，边看边判断，遇到阻碍就解决，发现内容不够就深入——全程围绕「我要达成什么」做决策。这个 skill 的所有行为都应遵循这个逻辑。

**① 拿到请求** — 先明确用户要做什么，定义成功标准：什么算完成了？需要获取什么信息、执行什么操作、达到什么结果？这是后续所有判断的锚点。

**② 选择起点** — 按优先级从低到高依次尝试：**首选轻量工具（web_search → web_fetch → curl），CDP 浏览器作为最后兜底**。先尝试成本最低的方式，失败后逐步升级，每一步的结果都是下一轮的决策依据。不在同一个方式上反复重试——搜索没命中不等于"还没找对方法"，也可能是"目标不存在"；发现方向错了立即调整。

**③ 过程校验** — 每一步的结果都是证据，不只是成功或失败的二元信号。用结果对照①的成功标准，更新你对目标的判断：路径在推进吗？结果的整体面貌（质量、相关度、量级）是否指向目标可达？发现方向错了立即调整，不在同一个方式上反复重试。遇到弹窗、登录墙等障碍，判断它是否真的挡住了目标：挡住了就处理，没挡住就绕过——内容可能已在页面 DOM 中，交互只是展示手段。

**④ 完成判断** — 对照定义的任务成功标准，确认任务完成后才停止，但也不要过度操作，不为了"完整"而浪费代价。

## 联网工具选择

- **确保信息的真实性，一手信息优于二手信息**：搜索引擎和聚合平台是信息发现入口。当多次搜索尝试后没有质的改进时，升级到更根本的获取方式：定位一手来源（官网、官方平台、原始页面）。

| 场景 | 工具 |
|------|------|
| 搜索摘要或关键词结果，发现信息来源 | **web_search**（Reasonix 内置） |
| URL 已知，需要从页面定向提取特定信息 | **web_fetch**（Reasonix 内置，返回处理后内容） |
| URL 已知，需要原始 HTML 源码（meta、JSON-LD 等结构化字段） | **curl**（通过 run_command） |
| 非公开内容，或已知静态层无效的平台（小红书、微信公众号等） | **CDP 浏览器**（直连用户日常浏览器） |
| 需要登录态、交互操作，或需要在浏览器内自由导航探索 | **CDP 浏览器** |

浏览器 CDP 不要求 URL 已知——可从任意入口出发，通过页面内搜索、点击、跳转等方式找到目标内容。web_search、web_fetch、curl 均不处理登录态。

进入浏览器层后，`/eval` 就是你的眼睛和手：

- **看**：用 `/eval` 查询 DOM，发现页面上的链接、按钮、表单、文本内容
- **做**：用 `/click` 点击元素、`/scroll` 滚动加载、`/eval` 填表提交
- **读**：用 `/eval` 提取文字内容，判断图片/视频是否承载核心信息——是则提取媒体 URL 或 `/screenshot` 视觉识别

浏览网页时，**先了解页面结构，再决定下一步动作**。不需要提前规划所有步骤。

### 补充：本地浏览器资源

用户指向**本人访问过的页面**或**组织内部系统**时，检索本地浏览器书签/历史：

```bash
node .reasonix/skills/web-access/scripts/find-url.mjs [关键词...] [--only bookmarks|history] [--browser chrome|edge] [--limit N] [--since 1d|7h|YYYY-MM-DD] [--sort recent|visits]
```

需要系统安装 `sqlite3` 命令行工具。

### 程序化操作与 GUI 交互

浏览器内操作页面有两种方式：

- **程序化方式**（构造 URL 直接导航、eval 操作 DOM）：成功时速度快、精确，但可能触发反爬机制。
- **GUI 交互**（点击按钮、填写输入框、滚动浏览）：GUI 是为人设计的，确定性最高，但步骤多、速度慢。

根据对目标平台的了解来灵活选择方式。GUI 交互可作为有效探测——通过一次真实交互观察站点的实际行为（URL 模式、必需参数、页面跳转逻辑），为后续程序化操作提供依据。

**站点内交互产生的链接是可靠的**：通过用户视角中的可交互单元进行的站点内交互，自然到达的 URL 天然携带平台所需的完整上下文。手动构造的 URL 可能缺失隐式必要参数。

## 浏览器 CDP 模式

通过 CDP Proxy 直连用户日常浏览器（Chrome / Edge / Chromium 等 Chromium 系），天然携带登录态，无需启动独立浏览器。
若无用户明确要求，不主动操作用户已有 tab，所有操作都在自己创建的后台 tab 中执行。不关闭用户 tab，完成任务后关闭自己创建的 tab。

### Proxy 生命周期管理

**启动**：通过 check-deps 自动完成（调用 `run_command` 执行 `node .reasonix/skills/web-access/scripts/check-deps.mjs`）

**CDP API 调用**：通过 `run_command` 执行 curl 命令调用 `http://localhost:3456` 上的 HTTP API

**停止**：`pkill -f cdp-proxy.mjs`（通过 run_command）

Proxy 持续运行，不建议主动停止——重启后需要在浏览器中重新授权 CDP 连接。

### Proxy API 速查

所有操作通过 curl 调用 HTTP API（localhost:3456），通过 `run_command` 执行：

```bash
# 列出用户已打开的 tab
curl -s http://localhost:3456/targets

# 创建新后台 tab — URL 在 POST body
curl -s -X POST --data-raw 'https://example.com' http://localhost:3456/new

# 获取页面信息
curl -s "http://localhost:3456/info?target=ID"

# 执行 JS（读写 DOM、提取数据）
curl -s -X POST "http://localhost:3456/eval?target=ID" -d 'document.title'

# 截图
curl -s "http://localhost:3456/screenshot?target=ID&file=/tmp/shot.png"

# 导航（URL 在 POST body）
curl -s -X POST --data-raw 'https://example.com' "http://localhost:3456/navigate?target=ID"

# 后退
curl -s "http://localhost:3456/back?target=ID"

# 点击（POST body = CSS 选择器）
curl -s -X POST "http://localhost:3456/click?target=ID" -d 'button.submit'

# 真实鼠标点击
curl -s -X POST "http://localhost:3456/clickAt?target=ID" -d 'button.upload'

# 文件上传
curl -s -X POST "http://localhost:3456/setFiles?target=ID" -d '{"selector":"input[type=file]","files":["/path/to/file.png"]}'

# 滚动
curl -s "http://localhost:3456/scroll?target=ID&y=3000"
curl -s "http://localhost:3456/scroll?target=ID&direction=bottom"

# 关闭 tab
curl -s "http://localhost:3456/close?target=ID"
```

### 技术事实
- 页面中存在大量已加载但未展示的内容——轮播中非当前帧的图片、折叠区块的文字、懒加载占位元素等，它们存在于 DOM 中但对用户不可见。
- DOM 中存在选择器不可跨越的边界（Shadow DOM 的 `shadowRoot`、iframe 的 `contentDocument`等）。eval 递归遍历可一次穿透所有层级。
- `/scroll` 到底部会触发懒加载。提取图片 URL 前若未滚动，部分图片可能尚未加载。
- 短时间内密集打开大量页面可能触发反爬风控。
- 平台返回的"内容不存在"等提示不一定是真实状态——也可能是访问方式的问题。

### 视频内容获取

通过 `/eval` 操控 `<video>` 元素（获取时长、seek 到任意时间点），配合 `/screenshot` 采帧，可对视频内容进行离散采样分析。

### 登录判断

用户日常浏览器天然携带登录态，大多数常用网站已登录。

打开页面后先尝试获取目标内容。只有当确认**目标内容无法获取**且判断登录能解决时，才告知用户处理。

### 任务结束

用 `/close` 关闭自己创建的 tab。Proxy 持续运行，不建议主动停止。

## 子 Agent 分治策略（并行调研）

任务包含多个**独立**调研目标时，利用 Reasonix Code 内置的 `explore` 和 `research` 工具（它们是内置的子 agent 工具），在子 agent 的 prompt 中要求其加载本 skill 并遵循指引。

**分治判断标准：**

| 适合分治 | 不适合分治 |
|----------|-----------|
| 目标相互独立，结果互不依赖 | 目标有依赖关系，下一个需要上一个的结果 |
| 每个子任务量足够大（多页抓取、多轮搜索） | 简单单页查询，分治开销大于收益 |
| 需要 CDP 浏览器或长时间运行的任务 | 几次 web_search / web_fetch 就能完成的轻量查询 |

子 agent prompt 要目标导向而非步骤指令：描述「获取」「调研」「了解」的目标，避免用「搜索」「抓取」「爬取」等暗示具体手段的动词。

## 信息核实类任务

核实的目标是**一手来源**。搜索引擎是信息发现入口，不可用于直接**证明**真伪。找到来源后直接访问读取原文。

| 信息类型 | 一手来源 |
|----------|---------|
| 政策/法规 | 发布机构官网 |
| 企业公告 | 公司官方新闻页 |
| 学术声明 | 原始论文/机构官网 |
| 工具能力/用法 | 官方文档、源码 |

**找不到官网时**：权威媒体的原创报道（非转载）可作为次级依据，但需向用户说明不确定性。

## 站点经验

操作中积累的特定网站经验，按域名存储在 `.reasonix/skills/web-access/references/site-patterns/` 下。

确定目标网站后，先运行 `node .reasonix/skills/web-access/scripts/match-site.mjs "<域名或描述>"` 匹配站点经验文件。如果有匹配的站点，读取对应文件获取先验知识。

CDP 操作成功完成后，如果发现了有必要记录经验的新站点或新模式，主动写入对应的站点经验文件。只写经过验证的事实。

文件格式：
```markdown
---
domain: example.com
aliases: [示例, Example]
updated: 2026-03-19
---
## 平台特征
架构、反爬行为、登录需求、内容加载方式等事实

## 有效模式
已验证的 URL 模式、操作策略、选择器

## 已知陷阱
什么会失败以及为什么
```
