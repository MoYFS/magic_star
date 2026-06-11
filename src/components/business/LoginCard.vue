<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  /** 卡片宽度（px） */
  width: { type: Number, default: 400 },
  /** 卡片高度（px） */
  height: { type: Number, default: 500 },
  /** 主题：'dark' 暗色（默认）| 'light' 亮色 */
  theme: { type: String, default: 'dark' },
})

const emit = defineEmits(['login'])

const username = ref('')
const password = ref('')

// 基准设计尺寸，以此为参考进行缩放
const BASE_W = 400
const BASE_H = 300

// 取宽/高各自缩放比例的最小值，确保内容完整在卡片内
const scale = computed(() =>
  Math.min(props.width / BASE_W, props.height / BASE_H)
)

const cardStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  borderRadius: `${20 * scale.value}px`,
  padding: `${24 * scale.value}px`,
  '--s': scale.value,
}))

const themeClass = computed(() =>
  props.theme === 'light' ? 'theme-light' : 'theme-dark'
)

function handleSubmit() {
  if (!username.value.trim() || !password.value.trim()) return
  emit('login', { username: username.value, password: password.value })
}
</script>

<template>
  <div class="login-card" :class="themeClass" :style="cardStyle">
    <!-- 边缘凸起圆滑层 -->
    <div class="edge-bulge"></div>

    <!-- 液态玻璃光泽反射层 -->
    <div class="glass-shine"></div>

    <!-- 标题 -->
    <h2 class="login-title">欢迎回来</h2>
    <p class="login-subtitle">请登录以继续</p>

    <!-- 表单 -->
    <div class="login-form">
      <div class="field">
        <label class="field-label">用户名 / 邮箱</label>
        <input
          class="field-input"
          type="text"
          v-model="username"
          placeholder="请输入用户名"
          @keyup.enter="handleSubmit"
        />
      </div>

      <div class="field">
        <label class="field-label">密码</label>
        <input
          class="field-input"
          type="password"
          v-model="password"
          placeholder="请输入密码"
          @keyup.enter="handleSubmit"
        />
      </div>

      <button class="login-btn" @click="handleSubmit">登 录</button>
    </div>
  </div>
</template>

<style scoped>
/* ===== 液态玻璃卡片 ===== */
.login-card {
  --s: 1;
  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(10px * var(--s));

  /* 液态玻璃基础 */
  background: linear-gradient(
    135deg,
    rgba(20, 30, 60, 0.45) 0%,
    rgba(10, 18, 40, 0.55) 50%,
    rgba(25, 35, 70, 0.4) 100%
  );
  border: 1px solid rgba(209, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  /* 液态光泽 + 3D 凸起阴影（加强） */
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    /* 外层投影 — 更沉 */
    0 3px 12px rgba(0, 0, 0, 0.25),
    /* 过渡阴影 */
    inset 0 3px 2px rgba(209, 255, 255, 0.10),
    /* 顶部凸起高光 */
    inset 0 -2px 2px rgba(209, 255, 255, 0.06),
    /* 底部凸起 */
    inset 3px 0 6px rgba(209, 255, 255, 0.05),
    /* 左侧凸起 */
    inset -3px 0 6px rgba(209, 255, 255, 0.05),
    /* 右侧凸起 */
    0 0 20px rgba(100, 180, 255, 0.06); /* 环境泛光 */

  color: rgba(255, 255, 255, 0.9);
}

/* ===== 边缘凸起圆滑层（加强） ===== */
/* 双层层叠 + 更强渐变，模拟边缘膨胀凸出的 3D 视觉效果 */
.edge-bulge {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;

  /* 外层：亮色凸起渐变 */
  background:
    radial-gradient(
      ellipse at center,
      transparent 50%,
      rgba(180, 230, 255, 0.05) 65%,
      rgba(209, 255, 255, 0.20) 80%,
      rgba(209, 255, 255, 0.35) 92%,
      rgba(209, 255, 255, 0.50) 100%
    );

  /* 仅显示在 border / padding 区域 */
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  padding: 2.5px;
}

/* 第二层凸起 — 加深边缘厚重感 */
.edge-bulge::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    ellipse at center,
    transparent 60%,
    rgba(255, 255, 255, 0.03) 75%,
    rgba(100, 180, 255, 0.08) 88%,
    rgba(100, 180, 255, 0.15) 100%
  );
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  padding: 2.5px;
}

/* 凸起边缘的流光动画 */
@keyframes edge-flow {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.edge-bulge {
  animation: edge-flow 3s ease-in-out infinite;
}

/* ===== 表面光泽反射层 ===== */
.glass-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  pointer-events: none;
  z-index: 0;

  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(209, 255, 255, 0.03) 30%,
    transparent 60%
  );
  animation: liquid-shimmer 6s ease-in-out infinite alternate;
}

@keyframes liquid-shimmer {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-10%, -5%) rotate(3deg);
    opacity: 0.5;
  }
}

/* 标题 */
.login-title {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: calc(26px * var(--s));
  font-weight: 500;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 0 30px rgba(100, 180, 255, 0.2);
}

.login-subtitle {
  position: relative;
  z-index: 1;
  margin: 0 0 calc(6px * var(--s));
  font-size: calc(13px * var(--s));
  color: rgba(209, 255, 255, 0.7);
  font-weight: 500;
}

/* 表单 */
.login-form {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(16px * var(--s));
}

.field {
  display: flex;
  flex-direction: column;
  gap: calc(5px * var(--s));
}

.field-label {
  font-size: calc(12px * var(--s));
  color: rgba(209, 255, 255, 0.75);
  font-weight: 600;
  padding-left: calc(2px * var(--s));
}

.field-input {
  width: 100%;
  box-sizing: border-box;
  height: calc(42px * var(--s));
  padding: 0 calc(14px * var(--s));
  font-size: calc(14px * var(--s));

  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(209, 255, 255, 0.1);
  border-radius: calc(10px * var(--s));
  color: rgba(255, 255, 255, 0.9);
  outline: none;
  transition: all 0.3s ease;
}

.field-input::placeholder {
  color: rgba(209, 255, 255, 0.2);
}

.field-input:focus {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(209, 255, 255, 0.35);
  box-shadow:
    0 0 16px rgba(100, 180, 255, 0.06),
    inset 0 1px 0 rgba(209, 255, 255, 0.05);
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  box-sizing: border-box;
  height: calc(44px * var(--s));
  margin-top: calc(6px * var(--s));

  font-size: calc(15px * var(--s));
  font-weight: 500;
  letter-spacing: 0.12em;

  background: linear-gradient(
    135deg,
    rgba(100, 180, 255, 0.2) 0%,
    rgba(160, 120, 255, 0.2) 100%
  );
  border: 1px solid rgba(209, 255, 255, 0.2);
  border-radius: calc(10px * var(--s));
  color: rgba(209, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.login-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(100, 180, 255, 0.35) 0%,
    rgba(160, 120, 255, 0.35) 100%
  );
  border-color: rgba(209, 255, 255, 0.45);
  box-shadow:
    0 0 24px rgba(100, 180, 255, 0.12),
    inset 0 1px 0 rgba(209, 255, 255, 0.1);
  transform: translateY(-1px);
}

.login-btn:active {
  transform: scale(0.98) translateY(0);
}

/* ===== 亮色主题（theme-light） ===== */
.theme-light {
  /* 卡片背景 — 亮色玻璃 */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(240, 245, 255, 0.55) 50%,
    rgba(255, 255, 255, 0.5) 100%
  );
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.12),
    0 3px 12px rgba(0, 0, 0, 0.06),
    inset 0 3px 2px rgba(255, 255, 255, 0.5),
    inset 0 -2px 2px rgba(0, 0, 0, 0.03),
    inset 3px 0 6px rgba(255, 255, 255, 0.15),
    inset -3px 0 6px rgba(255, 255, 255, 0.15);
}

.theme-light .login-title {
  color: rgba(10, 15, 40, 0.95);
  font-weight: 500;
  text-shadow: none;
}

.theme-light .login-subtitle {
  color: rgba(20, 30, 60, 0.7);
  font-weight: 500;
}

.theme-light .field-label {
  color: rgba(20, 30, 60, 0.8);
  font-weight: 600;
}

.theme-light .field-input {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(0, 0, 0, 0.08);
  color: rgba(10, 15, 40, 0.9);
  font-weight: 500;
}

.theme-light .field-input::placeholder {
  color: rgba(0, 0, 0, 0.2);
}

.theme-light .field-input:focus {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(100, 150, 255, 0.3);
  box-shadow: 0 0 16px rgba(100, 150, 255, 0.1);
}

.theme-light .login-btn {
  background: linear-gradient(
    135deg,
    rgba(100, 150, 255, 0.25) 0%,
    rgba(140, 100, 220, 0.25) 100%
  );
  border-color: rgba(0, 0, 0, 0.08);
  color: rgba(20, 30, 60, 0.85);
}

.theme-light .login-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(100, 150, 255, 0.4) 0%,
    rgba(140, 100, 220, 0.4) 100%
  );
  border-color: rgba(100, 150, 255, 0.3);
  box-shadow: 0 0 24px rgba(100, 150, 255, 0.12);
}

.theme-light .edge-bulge {
  background:
    radial-gradient(
      ellipse at center,
      transparent 50%,
      rgba(100, 150, 255, 0.03) 65%,
      rgba(200, 215, 255, 0.12) 80%,
      rgba(200, 215, 255, 0.25) 92%,
      rgba(255, 255, 255, 0.40) 100%
    );
}

.theme-light .edge-bulge::after {
  background: radial-gradient(
    ellipse at center,
    transparent 60%,
    rgba(255, 255, 255, 0.05) 75%,
    rgba(100, 150, 255, 0.05) 88%,
    rgba(100, 150, 255, 0.10) 100%
  );
}

.theme-light .glass-shine {
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(200, 220, 255, 0.08) 30%,
    transparent 60%
  );
}
</style>
