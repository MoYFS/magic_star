# static-version —— 原生 HTML/CSS/JS 版本

由本仓库 Vue 3 工程转换而来的**纯前端版本**（零依赖、无需构建），放在独立文件夹中，**不修改原有 Vue 工程任何文件**。

## 运行方式

直接双击 `index.html` 用浏览器打开即可（支持 `file://`），或任选一种静态服务器方式：

```bash
cd static-version
python3 -m http.server 8080   # 然后访问 http://localhost:8080
```

## 文件与 Vue 源码对应关系

| 原生文件 | 对应 Vue 源文件 |
|---|---|
| `index.html` | `index.html` + 页面装配 |
| `css/style.css` | `src/App.vue`（scoped）、`src/assets/base.css`、`src/assets/main.css` |
| `css/star-sky.css` | `src/components/StarSky.vue`（scoped） |
| `css/login-card.css` | `src/components/business/LoginCard.vue`（scoped） |
| `js/i18n.js` | `src/i18n/index.js` + `src/locales/*.json` |
| `js/star-sky.js` | `src/components/StarSky.vue`（script/template） |
| `js/login-card.js` | `src/components/business/LoginCard.vue`（script/template） |
| `js/main.js` | `src/main.js` + `src/App.vue`（script setup） |

## 功能对照

- ✅ Canvas 3D 星空背景（warp-speed 星移、拖尾光轨、流星、星云）——`createStarSky(canvas, { warpActive, warpTrail, movementSpeed })`
- ✅ 液态玻璃登录卡片（亮/暗主题、宽高自动缩放、回车提交）——`new LoginCard(el, { width, height, theme, onLogin })`
- ✅ 中/英语言切换（右上角圆形按钮），登录卡片与按钮文本同步刷新
- ✅ 禁止页面缩放（Ctrl/Cmd + 滚轮 / +/-/0）
- ✅ 点击登录 / 回车后 console 打印（与原版 `handleLogin` 行为一致，无真实后端）

## 定制参数示例

页面装配在 `js/main.js` 中，可参照源码注释调整：

```js
// 关闭星移与拖尾、放慢速度
createStarSky(canvas, { warpActive: false, warpTrail: false, movementSpeed: 2.0 })

// 亮色主题、调整尺寸
new LoginCard(el, { width: 420, height: 540, theme: 'light' })
```
