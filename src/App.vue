<script setup>
import StarSky from '@/components/StarSky.vue'
</script>

<template>
  <StarSky>
    <main class="app-content">
<!--      <h1>magic_star</h1>-->
<!--      <p>星空已点亮 ✨</p>-->
    </main>
  </StarSky>
</template>

<style scoped>
.app-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: rgba(255, 255, 255, 0.85);
  font-family: system-ui, sans-serif;
  text-align: center;
}

.app-content h1 {
  font-size: 3rem;
  font-weight: 300;
  letter-spacing: 0.1em;
  text-shadow: 0 0 30px rgba(100, 150, 255, 0.3);
  margin-bottom: 0.5rem;
}

.app-content p {
  font-size: 1.1rem;
  opacity: 0.6;
}
</style>
