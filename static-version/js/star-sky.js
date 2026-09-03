/**
 * star-sky.js —— Canvas 3D 星空背景动画（warp-speed 效果）
 * 对应：src/components/StarSky.vue（script + template 逻辑）
 *
 * 用法：
 *   const sky = window.createStarSky(canvasEl, {
 *     warpActive: true,     // 是否启用 3D 星移效果
 *     warpTrail: true,      // 是否开启拖尾光轨
 *     movementSpeed: 5.0,   // 星移速度因子，建议 0.5 ~ 6.0
 *   })
 *   sky.destroy()           // 销毁：取消动画帧并解绑 resize
 */
;(function (global) {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ warpActive?: boolean, warpTrail?: boolean, movementSpeed?: number }} [options]
   */
  function createStarSky(canvas, options = {}) {
    const opts = {
      warpActive: options.warpActive !== false, // 默认 true
      warpTrail: options.warpTrail !== false,   // 默认 true
      movementSpeed: options.movementSpeed == null ? 3.0 : options.movementSpeed,
    }

    let animFrameId = null
    let stars = []
    let bgPatches = []
    let shootingStars = []

    let maxZ = 2000            // 最大深度（自动计算）
    let focalLength = 800      // 镜头焦距（自动计算）

    // ---- 流星/彗星 ----
    function spawnShootingStar(w, h) {
      // 从左边出发→向右，从右边→向左，从上边→向下，从下边→向上
      const edge = Math.floor(Math.random() * 4)
      let sx, sy, baseAngle
      if (edge === 0)      { sx = -20; sy = Math.random() * h; baseAngle = 0 }              // 左边→右
      else if (edge === 1) { sx = w + 20; sy = Math.random() * h; baseAngle = Math.PI }     // 右边→左
      else if (edge === 2) { sx = Math.random() * w; sy = -20; baseAngle = Math.PI / 2 }    // 上边→下
      else                 { sx = Math.random() * w; sy = h + 20; baseAngle = -Math.PI / 2 } // 下边→上

      const angle = baseAngle + (Math.random() - 0.5) * Math.PI / 3
      const speed = 4 + Math.random() * 6
      const colors = [
        { h: 30,  s: 80, l: 70 },
        { h: 210, s: 70, l: 75 },
        { h: 60,  s: 75, l: 75 },
        { h: 290, s: 60, l: 70 },
        { h: 350, s: 70, l: 70 },
        { h: 160, s: 65, l: 70 },
      ]
      const c = colors[Math.floor(Math.random() * colors.length)]
      shootingStars.push({
        x: sx, y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        tail: 60 + Math.random() * 80,
        r: 1.2 + Math.random() * 2,
        hue: c.h, sat: c.s, light: c.l,
      })
    }

    // 预计算背景彩色渐变团的参数（resize 时重新随机）
    function buildBackground(w, h) {
      bgPatches = []
      const count = 20 + Math.floor(Math.random() * 10)
      for (let i = 0; i < count; i++) {
        bgPatches.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 80 + Math.random() * Math.max(w, h) * 0.5,
          h: Math.random() * 360,
        })
      }
    }

    // ---- 星星 ----
    const STAR_COLORS = [
      { w: 5, h: 220, s: 45, l: 88 },   // 深蓝
      { w: 7, h: 200, s: 35, l: 90 },   // 蓝
      { w: 6, h: 180, s: 28, l: 86 },   // 蓝白
      { w: 8, h: 0,   s: 0,  l: 95 },   // 纯白
      { w: 4, h: 60,  s: 40, l: 86 },   // 淡黄
      { w: 3, h: 45,  s: 48, l: 82 },   // 金黄
      { w: 2, h: 35,  s: 50, l: 78 },   // 橙黄
      { w: 2, h: 25,  s: 55, l: 74 },   // 橙
      { w: 1, h: 15,  s: 60, l: 68 },   // 红橙
      { w: 1, h: 5,   s: 65, l: 62 },   // 红
      { w: 2, h: 280, s: 40, l: 78 },   // 紫
    ]

    function pickColor() {
      const total = STAR_COLORS.reduce((s, c) => s + c.w, 0)
      let r = Math.random() * total
      for (const c of STAR_COLORS) { r -= c.w; if (r <= 0) return c }
      return STAR_COLORS[2]
    }

    function initStars(w, h) {
      stars = []
      const count = Math.round(w * h * 0.0005)
      // 3D 空间参数：z 轴深度范围 [minZ, maxZ]
      maxZ = Math.max(w, h) * 2
      focalLength = Math.max(w, h) * 0.8
      const minZ = 10
      for (let i = 0; i < count; i++) {
        const c = pickColor()
        const baseR = 0.5 + Math.pow(Math.random(), 2) * 3.0
        const twinkle = baseR > 1.2 ? 0.2 + Math.random() * 0.3 : 0.03 + Math.random() * 0.12
        stars.push({
          // 3D 坐标：x, y 以屏幕中心为原点向外散布，z 为深度
          x: (Math.random() - 0.5) * w * 2.5,
          y: (Math.random() - 0.5) * h * 2.5,
          z: minZ + Math.random() * (maxZ - minZ),
          baseR,
          phase: Math.random() * Math.PI * 2,
          speed: (0.3 + Math.random() * 0.5) * 0.02,
          twinkle, h: c.h, s: c.s, l: c.l,
        })
      }
    }

    function renderStar(ctx, s, tw, px, py, pr) {
      const alpha = 0.3 + tw * 0.7
      const r = pr * (0.85 + tw * 0.15)

      const glowR = r * 4
      const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR)
      glow.addColorStop(0, `hsla(${s.h}, ${s.s * 0.8}%, ${Math.min(s.l + 12, 98)}%, ${alpha * 0.3})`)
      glow.addColorStop(0.2, `hsla(${s.h}, ${s.s * 0.5}%, ${s.l + 5}%, ${alpha * 0.1})`)
      glow.addColorStop(0.5, `hsla(${s.h}, ${s.s * 0.3}%, ${s.l}%, ${alpha * 0.03})`)
      glow.addColorStop(1, `hsla(${s.h}, ${s.s * 0.1}%, ${s.l}%, 0)`)
      ctx.fillStyle = glow
      ctx.fillRect(px - glowR, py - glowR, glowR * 2, glowR * 2)

      if (r > 0.8) {
        const rayLen = r * (3.5 + r * 0.6)
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2 + s.phase
          const cos = Math.cos(a), sin = Math.sin(a)
          const tipX = px + cos * rayLen, tipY = py + sin * rayLen
          const spread = r * 0.5
          const spx = -sin * spread, spy = cos * spread
          const snx = sin * spread, sny = -cos * spread
          ctx.beginPath()
          ctx.moveTo(px + spx, py + spy)
          ctx.lineTo(tipX, tipY)
          ctx.lineTo(px + snx, py + sny)
          ctx.closePath()
          const rayGrad = ctx.createLinearGradient(px, py, tipX, tipY)
          rayGrad.addColorStop(0, `hsla(${s.h}, ${s.s * 0.7}%, ${s.l + 10}%, ${alpha * 0.25})`)
          rayGrad.addColorStop(0.5, `hsla(${s.h}, ${s.s * 0.5}%, ${s.l}%, ${alpha * 0.08})`)
          rayGrad.addColorStop(1, `hsla(${s.h}, ${s.s * 0.3}%, ${s.l - 5}%, 0)`)
          ctx.fillStyle = rayGrad
          ctx.fill()
        }
      }

      ctx.beginPath()
      ctx.arc(px, py, Math.max(r * 0.3, 0.4), 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${s.h}, 0%, 100%, ${Math.min(alpha * 0.9, 0.95)})`
      ctx.fill()
    }

    function draw(time) {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const cw = window.innerWidth, ch = window.innerHeight

      // 背景：拖尾模式下叠加半透明遮罩，否则完整刷新星云
      if (opts.warpTrail) {
        ctx.fillStyle = 'rgba(1,2,8,0.12)'
        ctx.fillRect(0, 0, cw, ch)
      } else {
        ctx.fillStyle = '#010208'
        ctx.fillRect(0, 0, cw, ch)
        for (const p of bgPatches) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
          g.addColorStop(0, `hsla(${p.h}, 60%, 35%, 0.12)`)
          g.addColorStop(0.3, `hsla(${p.h + 40}, 45%, 25%, 0.06)`)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = g
          ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
        }
      }

      // 流星/彗星
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const m = shootingStars[i]
        const tx = m.x - m.vx * m.tail, ty = m.y - m.vy * m.tail

        // 彗尾扩散光
        const dir = Math.sqrt(m.vx * m.vx + m.vy * m.vy)
        const nx = m.vx / dir, ny = m.vy / dir
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(tx + ny * m.r * 3, ty - nx * m.r * 3)
        ctx.lineTo(tx - ny * m.r * 3, ty + nx * m.r * 3)
        ctx.closePath()
        const fog = ctx.createLinearGradient(m.x, m.y, tx, ty)
        fog.addColorStop(0, `rgba(255,255,255,0.4)`)
        fog.addColorStop(0.3, `hsla(${m.hue}, ${m.sat}%, ${m.light}%, 0.2)`)
        fog.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = fog
        ctx.fill()

        // 主光轨
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty)
        g.addColorStop(0, 'rgba(255,255,255,1)')
        g.addColorStop(0.08, `hsla(${m.hue}, ${m.sat}%, ${m.light + 10}%, 0.8)`)
        g.addColorStop(0.4, `hsla(${m.hue}, ${m.sat}%, ${m.light}%, 0.3)`)
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.strokeStyle = g
        ctx.lineWidth = m.r * 0.7
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(tx, ty)
        ctx.stroke()

        // 头部光晕
        const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 3)
        hg.addColorStop(0, 'rgba(255,255,255,0.8)')
        hg.addColorStop(0.3, `hsla(${m.hue}, ${m.sat}%, ${m.light}%, 0.3)`)
        hg.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = hg
        ctx.fillRect(m.x - m.r * 3, m.y - m.r * 3, m.r * 6, m.r * 6)

        // 移动
        m.x += m.vx; m.y += m.vy

        // 出屏后尾部收缩
        if (m.x < -50 || m.x > cw + 50 || m.y < -50 || m.y > ch + 50) {
          m.tail *= 0.96
          if (m.tail < 3) shootingStars.splice(i, 1)
        }
      }

      // 随机生成流星（低频）
      if (Math.random() < 0.008 && shootingStars.length < 2) spawnShootingStar(cw, ch)

      // ---- 3D 星空移动（warp-speed 效果）----
      if (opts.warpActive) {
        const speedFactor = opts.movementSpeed
        for (const s of stars) {
          s.z -= speedFactor
          if (s.z < 1) {
            s.z = maxZ
            s.x = (Math.random() - 0.5) * cw * 2.5
            s.y = (Math.random() - 0.5) * ch * 2.5
          }
        }
      }

      // 透视投影并渲染星星
      for (const s of stars) {
        const scale = focalLength / s.z
        const px = cw / 2 + s.x * scale
        const py = ch / 2 + s.y * scale
        const pr = s.baseR * Math.min(scale, 3)
        if (px < -50 || px > cw + 50 || py < -50 || py > ch + 50) continue
        const tw = 1 - s.twinkle * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase))
        renderStar(ctx, s, tw, px, py, pr)
      }

      animFrameId = requestAnimationFrame(draw)
    }

    function resize() {
      if (!canvas) return
      const w = window.innerWidth, h = window.innerHeight
      canvas.width = w * devicePixelRatio
      canvas.height = h * devicePixelRatio
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      canvas.getContext('2d').scale(devicePixelRatio, devicePixelRatio)
      initStars(w, h)
      buildBackground(w, h)
      shootingStars = []
    }

    // 启动（对应 Vue onMounted）
    resize()
    window.addEventListener('resize', resize)
    animFrameId = requestAnimationFrame(draw)

    // 销毁（对应 Vue onUnmounted）
    return {
      destroy() {
        window.removeEventListener('resize', resize)
        if (animFrameId) cancelAnimationFrame(animFrameId)
      },
    }
  }

  global.createStarSky = createStarSky
})(window)
