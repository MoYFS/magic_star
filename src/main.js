import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// 禁止页面缩放（Ctrl/Cmd + +/-/滚轮）
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) e.preventDefault()
}, { passive: false })

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')) {
    e.preventDefault()
  }
})

createApp(App).mount('#app')
