/**
 * i18n.js —— 简易国际化（替代 vue-i18n）
 * 对应：src/i18n/index.js + src/locales/zh-CN.json + src/locales/en.json
 *
 * 使用：I18N.t('login.title') 获取当前语言文本；I18N.toggle() 切换语言。
 * 文本直接内嵌在 JS 中（避免 fetch JSON，保证 file:// 双击打开即可运行）。
 */
;(function (global) {
  const messages = {
    'zh-CN': {
      login: {
        title: '欢迎回来',
        subtitle: '请登录以继续',
        username: '用户名 / 邮箱',
        usernamePlaceholder: '请输入用户名',
        password: '密码',
        passwordPlaceholder: '请输入密码',
        submit: '登 录',
      },
      lang: {
        switch: 'EN',
      },
    },
    en: {
      login: {
        title: 'Welcome Back',
        subtitle: 'Please sign in to continue',
        username: 'Username / Email',
        usernamePlaceholder: 'Enter username',
        password: 'Password',
        passwordPlaceholder: 'Enter password',
        submit: 'Sign In',
      },
      lang: {
        switch: '中',
      },
    },
  }

  let locale = 'zh-CN'

  /**
   * 按点路径取文本，例如 t('login.title')
   * @param {string} key
   * @param {string} [l] 可选：指定语言，默认当前语言
   */
  function t(key, l) {
    const dict = messages[l || locale]
    return key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict)
  }

  global.I18N = {
    messages,
    t,
    /** 当前语言（'zh-CN' | 'en'） */
    get locale() {
      return locale
    },
    setLocale(l) {
      locale = l
    },
    toggle() {
      locale = locale === 'zh-CN' ? 'en' : 'zh-CN'
    },
  }
})(window)
