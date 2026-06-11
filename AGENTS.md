# AGENTS.md — magic_star 项目指南

> 本文件供 AI 编码助手阅读。描述了项目的技术栈、架构约定和开发规则。

## 项目概述

magic_star 是一个基于 Vue 3 + Vite 的 Web 应用，带有 Canvas 3D 星空背景动画。

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite 8 |
| 语言 | JavaScript（SFC，无 JSX） |
| 路径别名 | `@` → `./src` |
| 状态管理 | Pinia（约定，待安装） |
| 路由 | Vue Router（约定，待安装） |

## 项目结构

```
src/
├── App.vue               # 根组件（包装 StarSky + 内容插槽）
├── main.js               # 入口
├── router/               # 路由定义
│   └── index.js
├── stores/               # Pinia store 模块
├── views/                # 页面级组件
├── components/           # 通用组件
│   ├── common/           # 全局通用组件
│   ├── business/         # 业务组件
│   └── StarSky.vue       # Canvas 3D 星空背景组件（warp-speed 效果）
├── composables/          # 组合式函数（useXxx）
├── api/                  # API 请求层
├── utils/                # 工具函数
├── assets/               # 静态资源
│   ├── styles/           # 全局样式
│   └── images/           # 图片
└── constants/            # 常量
```

## StarSky 星空背景组件

`src/components/StarSky.vue` 是一个全屏 Canvas 星空动画组件，支持 3D warp-speed 星移效果。

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `warpActive` | Boolean | `true` | 是否启用 3D 星移效果 |
| `warpTrail` | Boolean | `true` | 是否开启拖尾光轨（星星划过留下残影） |
| `movementSpeed` | Number | `3.0` | 星移速度因子，建议范围 0.5 ~ 6.0 |

### 使用方式

```vue
<template>
  <StarSky>
    <!-- 放在星空之上的内容 -->
    <main>你的页面</main>
  </StarSky>
</template>

<script setup>
import StarSky from '@/components/StarSky.vue'
</script>
```

### 定制参数

```vue
<!-- 关闭移动和拖尾，速度设为 2.0 -->
<StarSky :warpActive="false" :warpTrail="false" :movementSpeed="2.0">
  <main>内容</main>
</StarSky>
```

### 效果说明

- 星星具有 3D 空间坐标（x, y, z），通过透视投影（`focalLength / z`）产生近大远小效果
- 每帧 `z` 递减，星星向观察者靠近，到最近处重置到最远，形成 warp-speed 飞行感
- 拖尾模式不擦除背景，仅叠加半透明遮罩，星星留下光轨
- 保留了原有的彩色星云背景、流星/彗星、星星光晕+射线+闪烁效果

## LoginCard 登录卡片组件

`src/components/business/LoginCard.vue` 是一个液态玻璃（Frosted Glass）风格的登录卡片组件，支持亮/暗主题切换、尺寸缩放。

### 视觉效果

- **液态玻璃** — 半透明渐变背景 + `backdrop-filter: blur(20px)` 毛玻璃效果，透出背后星空
- **边缘凸起圆滑** — 径向渐变 + CSS mask 在边缘绘制高光，模拟 3D 膨胀凸起
- **流动光泽** — 表面反射层动画模拟液态玻璃的流动反光
- **多重心影** — 四方向 inset box-shadow 增强立体凸起感

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | Number | `400` | 卡片宽度（px） |
| `height` | Number | `500` | 卡片高度（px） |
| `theme` | String | `'dark'` | 主题：`'dark'` 暗色 \| `'light'` 亮色 |

### Events

| 事件 | 载荷 | 说明 |
|------|------|------|
| `login` | `{ username, password }` | 点击登录按钮或回车时触发 |

### 使用方式

```vue
<template>
  <StarSky>
    <main class="login-page">
      <LoginCard :width="400" :height="520" @login="handleLogin" />
    </main>
  </StarSky>
</template>

<script setup>
import LoginCard from '@/components/business/LoginCard.vue'

function handleLogin({ username, password }) {
  // 处理登录逻辑
}
</script>
```

### 亮色主题

```vue
<LoginCard theme="light" />
```

### 缩放说明

组件以 400×300（BASE_W × BASE_H）为基准设计尺寸，内部所有元素（字号、间距、圆角、输入框高度等）通过 `--s` CSS 变量等比缩放。缩放比例取 `width / BASE_W` 和 `height / BASE_H` 的较小值，确保内容完整在卡片内。传入不同 `width` / `height` 时自动适配。

## 核心规则

> 本项目**全面采用 Composition API**，禁止一切 Options API 写法。

### 1. 组件编写

- **必须** 使用 `<script setup>` + Composition API
- **禁止** Options API（`data/computed/methods` 对象写法、`watch`/`mounted` 等选项式属性）
- 组件名 PascalCase 多词（`UserCard.vue`，非 `Card.vue`）
- Props 用 `defineProps`，事件用 `defineEmits`
- 模板中不要写复杂逻辑——用计算属性或函数

```vue
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ title: String })
const emit = defineEmits(['update'])

const count = ref(0)
const double = computed(() => count.value * 2)
</script>
```

### 2. 命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserAvatar.vue` |
| JS 文件 | kebab-case | `use-auth.js` |
| 组件名 | PascalCase 多词 | `<UserProfile />` |
| 变量/函数 | camelCase | `userList`, `fetchData()` |
| 常量 | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Store | useXxxStore | `useUserStore` |
| Composables | useXxx | `usePagination` |

### 3. 状态管理（Pinia）

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, double, increment }
})
```

### 4. 样式

- 组件样式用 `<style scoped>`
- 全局样式放 `src/assets/styles/`
- 用 CSS 变量定义主题，避免 `!important`

### 5. API 层

```js
// api/user.js
export const getUserList = (params) => request.get('/api/users', { params })
```

### 6. Git 提交

格式：`<type>: <描述>`

| type | 用途 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| refactor | 重构 |
| style | 样式/格式化 |
| docs | 文档 |
| chore | 构建/工具 |

## 开发命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 生产构建
npm run preview   # 预览构建产物
```
