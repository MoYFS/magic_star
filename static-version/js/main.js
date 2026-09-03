/**
 * main.js —— 页面入口与装配
 * 对应：src/main.js + src/App.vue（script setup）
 *
 * 装配顺序：StarSky 背景 → LoginCard 登录卡片 → 语言切换按钮。
 */
;(function () {
  // ---- 对应 src/main.js：禁止页面缩放（Ctrl/Cmd + +/-/0/滚轮）----
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) e.preventDefault()
  }, { passive: false })

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')) {
      e.preventDefault()
    }
  })

  // ---- 对应 App.vue 使用 StarSky：warpActive=true warpTrail=true movementSpeed=5.0 ----
  const canvas = document.getElementById('star-sky-canvas')
  const sky = window.createStarSky(canvas, {
    warpActive: true,
    warpTrail: true,
    movementSpeed: 5.0,
  })

  // ---- 对应 App.vue 使用 LoginCard：width=400 height=320 theme=dark ----
  const card = new window.LoginCard(document.getElementById('login-card'), {
    width: 400,
    height: 320,
    theme: 'dark',
    // 对应 App.vue handleLogin（仅表单非空时触发）
    onLogin({ username, password }) {
      console.log(window.I18N.t('login.title'), username, password)
    },
  })

  // ---- 对应 App.vue 语言切换按钮（toggleLang）----
  const langBtn = document.getElementById('lang-btn')
  function updateLangBtn() {
    langBtn.textContent = window.I18N.t('lang.switch')
  }
  langBtn.addEventListener('click', () => {
    window.I18N.toggle()
    card.refresh()       // 刷新登录卡片文本
    updateLangBtn()      // 刷新按钮文本
  })
  updateLangBtn()

  // 页面卸载时释放动画（可选，浏览器关闭页面自动回收，保留以对齐 Vue onUnmounted）
  window.addEventListener('beforeunload', () => sky.destroy())
})()
