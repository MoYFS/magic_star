# AGENTS.md — magic_star 项目指南

> 本文件供 AI 编码助手阅读。描述了项目的技术栈、架构约定和开发规则。

## 项目概述

magic_star 是一个基于 Vue 3 + Vite 的 Web 应用。

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
├── App.vue               # 根组件（布局壳，无业务逻辑）
├── main.js               # 入口
├── router/               # 路由定义
│   └── index.js
├── stores/               # Pinia store 模块
├── views/                # 页面级组件
├── components/           # 通用组件
│   ├── common/           # 全局通用组件
│   └── business/         # 业务组件
├── composables/          # 组合式函数（useXxx）
├── api/                  # API 请求层
├── utils/                # 工具函数
├── assets/               # 静态资源
│   ├── styles/           # 全局样式
│   └── images/           # 图片
└── constants/            # 常量
```

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
