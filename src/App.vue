<script setup>
import { useI18n } from 'vue-i18n'
import StarSky from '@/components/StarSky.vue'
import LoginCard from '@/components/business/LoginCard.vue'

const { t, locale } = useI18n()

function toggleLang() {
  locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
}

function handleLogin({ username, password }) {
  console.log(t('login.title'), username, password)
}
</script>

<template>
  <StarSky :warpActive="true" :warpTrail="true" :movementSpeed="5.0">
    <main class="app-content">
      <LoginCard :width="400" :height="320" @login="handleLogin" theme="dark"/>
      <button class="lang-btn" @click="toggleLang">{{ t('lang.switch') }}</button>
    </main>
  </StarSky>
</template>

<style scoped>
.app-content {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 22vh;
}

.lang-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 20;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(209, 255, 255, 0.25);
  background: rgba(10, 14, 30, 0.6);
  backdrop-filter: blur(8px);
  color: rgba(209, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-btn:hover {
  background: rgba(209, 255, 255, 0.12);
  border-color: rgba(209, 255, 255, 0.5);
}
</style>
