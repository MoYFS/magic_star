/**
 * login-card.js —— 液态玻璃（Frosted Glass）登录卡片
 * 对应：src/components/business/LoginCard.vue（script + template + 尺寸缩放逻辑）
 *
 * 用法：
 *   const card = new window.LoginCard(document.getElementById('login-card'), {
 *     width: 400,                 // 卡片宽度（px）
 *     height: 320,                // 卡片高度（px）
 *     theme: 'dark',              // 'dark' 暗色（默认）| 'light' 亮色
 *     onLogin: ({ username, password }) => { ... },  // 登录回调
 *   })
 *   card.refresh()                // 切换语言后调用，刷新界面文本
 */
;(function (global) {
  const BASE_W = 400 // 基准设计宽度
  const BASE_H = 300 // 基准设计高度

  class LoginCard {
    /**
     * @param {HTMLElement} container 挂载容器
     * @param {object} [options]
     */
    constructor(container, options = {}) {
      this.container = container
      this.opts = {
        width: options.width == null ? 400 : options.width,
        height: options.height == null ? 500 : options.height,
        theme: options.theme || 'dark',
        onLogin: typeof options.onLogin === 'function' ? options.onLogin : null,
      }

      // 表单状态（对应 v-model: username / password）
      this.username = ''
      this.password = ''

      // 取宽/高各自缩放比例的最小值，确保内容完整在卡片内
      this.scale = Math.min(this.opts.width / BASE_W, this.opts.height / BASE_H)

      this._buildDom()
      this._bindEvents()
      this.refresh()
    }

    /** 计算卡片内联样式（对应 computed: cardStyle） */
    cardStyle() {
      const s = this.scale
      return {
        width: `${this.opts.width}px`,
        height: `${this.opts.height}px`,
        borderRadius: `${20 * s}px`,
        padding: `${24 * s}px`,
        '--s': s,
      }
    }

    /** 主题 class（对应 computed: themeClass） */
    themeClass() {
      return this.opts.theme === 'light' ? 'theme-light' : 'theme-dark'
    }

    /** 组装 DOM（对应 template 结构） */
    _buildDom() {
      const el = document.createElement('div')
      el.className = `login-card ${this.themeClass()}`
      const style = this.cardStyle()
      for (const [k, v] of Object.entries(style)) el.style.setProperty(k, v)

      // 边缘凸起圆滑层
      const edge = document.createElement('div')
      edge.className = 'edge-bulge'
      el.appendChild(edge)

      // 液态玻璃光泽反射层
      const shine = document.createElement('div')
      shine.className = 'glass-shine'
      el.appendChild(shine)

      // 标题
      const title = document.createElement('h2')
      title.className = 'login-title'
      el.appendChild(title)

      const subtitle = document.createElement('p')
      subtitle.className = 'login-subtitle'
      el.appendChild(subtitle)

      // 表单
      const form = document.createElement('div')
      form.className = 'login-form'

      const mkField = (labelCls, labelText, inputType) => {
        const field = document.createElement('div')
        field.className = 'field'

        const label = document.createElement('label')
        label.className = 'field-label'
        field.appendChild(label)

        const input = document.createElement('input')
        input.className = 'field-input'
        input.type = inputType
        input.autocomplete = inputType === 'password' ? 'current-password' : 'username'
        field.appendChild(input)
        return { field, label, input }
      }

      const userField = mkField('field-label', '', 'text')
      const passField = mkField('field-label', '', 'password')

      // 按钮
      const btn = document.createElement('button')
      btn.className = 'login-btn'
      btn.type = 'button'

      form.appendChild(userField.field)
      form.appendChild(passField.field)
      form.appendChild(btn)
      el.appendChild(form)

      this.container.appendChild(el)
      this.el = el
      this.title = title
      this.subtitle = subtitle
      this.btn = btn
      this.userLabel = userField.label
      this.userInput = userField.input
      this.passLabel = passField.label
      this.passInput = passField.input
    }

    /** 事件绑定（对应 v-model + @click + @keyup.enter） */
    _bindEvents() {
      this.userInput.addEventListener('input', (e) => { this.username = e.target.value })
      this.passInput.addEventListener('input', (e) => { this.password = e.target.value })

      const submit = () => this._handleSubmit()
      this.btn.addEventListener('click', submit)
      this.userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() })
      this.passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() })
    }

    /** 提交校验并回调（对应 handleSubmit + emit('login')） */
    _handleSubmit() {
      if (!this.username.trim() || !this.password.trim()) return
      if (this.opts.onLogin) {
        this.opts.onLogin({ username: this.username, password: this.password })
      }
    }

    /** 刷新国际化文本（切换语言后调用） */
    refresh() {
      const t = global.I18N.t
      this.title.textContent = t('login.title')
      this.subtitle.textContent = t('login.subtitle')
      this.userLabel.textContent = t('login.username')
      this.passLabel.textContent = t('login.password')
      this.userInput.placeholder = t('login.usernamePlaceholder')
      this.passInput.placeholder = t('login.passwordPlaceholder')
      this.btn.textContent = t('login.submit')
    }
  }

  global.LoginCard = LoginCard
})(window)
