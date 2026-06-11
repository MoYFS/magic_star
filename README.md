# magic_star ✨

一个带有 Canvas 3D 星空背景的 Vue 3 单页应用。星星具有 warp-speed 飞行效果，支持拖尾光轨、速度调节等参数。

## 预览

运行项目后，你会看到一个全屏的 3D 星空背景：
- 彩色星星带有光晕和射线，持续闪烁
- 星星从远处向观察者飞来，产生 warp-speed 穿梭感
- 随机流星/彗星划过天空
- 彩色星云背景

## 技术栈

- **框架**: Vue 3（Composition API + `<script setup>`）
- **构建**: Vite 8
- **语言**: JavaScript（SFC）
- **星空动画**: Canvas 2D + requestAnimationFrame

## 快速开始

```sh
npm install
npm run dev
```

## 构建

```sh
npm run build
npm run preview
```

## StarSky 组件

`src/components/StarSky.vue` 提供全屏星空背景，支持以下 Props：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `warpActive` | Boolean | `true` | 是否启用 3D 星移效果 |
| `warpTrail` | Boolean | `true` | 是否开启拖尾光轨 |
| `movementSpeed` | Number | `3.0` | 星移速度，建议 0.5 ~ 6.0 |

### 基础用法

```vue
<template>
  <StarSky>
    <main>你的页面内容</main>
  </StarSky>
</template>

<script setup>
import StarSky from '@/components/StarSky.vue'
</script>
```

### 定制参数

```vue
<StarSky :warpActive="false" :warpTrail="false" :movementSpeed="2.0">
  <main>静态星空背景</main>
</StarSky>
```

## LoginCard 登录卡片

`src/components/business/LoginCard.vue` 是一个液态玻璃（Frosted Glass）风格的登录卡片，支持亮暗主题切换和尺寸缩放。

### 视觉效果

- **液态玻璃** — 半透明渐变 + 毛玻璃模糊，透出背后星空动画
- **边缘凸起圆滑** — 径向渐变高光模拟 3D 膨胀边缘
- **流动光泽** — 反光层动画模拟液态玻璃流动质感
- **多重心影** — 四方向阴影增强立体感

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | Number | `400` | 卡片宽度（px） |
| `height` | Number | `500` | 卡片高度（px） |
| `theme` | String | `'dark'` | 主题：`'dark'` 暗色 \| `'light'` 亮色 |

### 使用示例

```vue
<template>
  <StarSky>
    <main class="login-page">
      <LoginCard :width="400" :height="520" @login="handleLogin" />
    </main>
  </StarSky>
</template>

<script setup>
import StarSky from '@/components/StarSky.vue'
import LoginCard from '@/components/business/LoginCard.vue'

function handleLogin({ username, password }) {
  console.log('登录:', username, password)
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
```

### 亮色主题

```vue
<LoginCard theme="light" />
```
