<script setup>
import StarSky from '@/components/StarSky.vue'
import LoginCard from '@/components/business/LoginCard.vue'

function handleLogin({ username, password }) {
  console.log('登录:', username, password)
}
</script>

<template>
  <StarSky :warpActive="true" :warpTrail="true" :movementSpeed="5.0">
    <main class="app-content">
      <LoginCard :width="400" :height="320" @login="handleLogin" theme="light"/>
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
  align-items: center;
  justify-content: center;
}
</style>
