<template>
  <canvas
    ref="canvasRef"
    class="battle-effect-canvas"
    :style="{
      position: 'fixed',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      width: '100%',
      height: '100%'
    }"
  />
</template>

<script>
export default {
  name: 'BattleEffect',
  props: {
    // 特效类型: 'thunder', 'slash', 'thrust', 'heavy', 'fire', 'explosion', 'heal', 'shield', 'formation'
    type: {
      type: String,
      required: true,
      validator: (val) => ['thunder', 'slash', 'thrust', 'heavy', 'fire', 'explosion', 'heal', 'shield', 'formation'].includes(val)
    },
    // 播放时长（秒）
    period: {
      type: Number,
      default: 3,
      validator: (val) => val > 0
    },
    // 方向: 'up' 或 'down'
    direction: {
      type: String,
      default: 'up',
      validator: (val) => ['up', 'down'].includes(val)
    },
    // 屏幕位置坐标 x (px)
    x: {
      type: Number,
      required: true
    },
    // 屏幕位置坐标 y (px)
    y: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      startTime: 0,
      animationId: null,
      // 特效参数
      particles: [],
      // 针对不同类型的额外状态
      slashAngle: 0,
      slashOffset: 0,
      heavyRadius: 0,
      heavyScale: 1,
      thunderBolts: [],
      thrustLine: { start: 0, end: 0, width: 0 },
      fireParticles: [],
      explosionParticles: [],
      healParticles: [],
      shieldRadius: 0,
      shieldAlpha: 0,
      formationPoints: [],
      formationAlpha: 0
    };
  },
  watch: {
    // 当参数变化时重新播放特效
    type: 'restartEffect',
    period: 'restartEffect',
    direction: 'restartEffect',
    x: 'restartEffect',
    y: 'restartEffect'
  },
  mounted() {
    this.initCanvas();
    this.startEffect();
  },
  beforeDestroy() {
    this.stopAnimation();
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.canvasRef;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext('2d');
      window.addEventListener('resize', this.handleResize);
    },
    handleResize() {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // 重绘当前帧
        if (this.animationId) {
          this.drawFrame(Date.now() - this.startTime);
        }
      }
    },
    restartEffect() {
      this.stopAnimation();
      this.startEffect();
    },
    startEffect() {
      this.startTime = performance.now();
      this.initEffectState();
      this.animate();
    },
    stopAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    },
    initEffectState() {
      // 根据类型初始化粒子系统或动画状态
      const cx = this.x;
      const cy = this.y;

      switch (this.type) {
        case 'thunder':
          this.thunderBolts = [];
          for (let i = 0; i < 8; i++) {
            this.thunderBolts.push({
              angle: (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5,
              length: 40 + Math.random() * 30,
              width: 4 + Math.random() * 4,
              offset: Math.random() * Math.PI * 2
            });
          }
          break;
        case 'slash':
          this.slashAngle = this.direction === 'up' ? -Math.PI / 3 : Math.PI / 3;
          this.slashOffset = 0;
          break;
        case 'thrust':
          this.thrustLine = { start: 0, end: 0, width: 0 };
          break;
        case 'heavy':
          this.heavyRadius = 0;
          this.heavyScale = 1;
          break;
        case 'fire':
          this.fireParticles = [];
          for (let i = 0; i < 40; i++) {
            this.fireParticles.push({
              x: cx + (Math.random() - 0.5) * 60,
              y: cy + (Math.random() - 0.5) * 60,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4 - 2,
              size: 4 + Math.random() * 6,
              life: Math.random(),
              color: `hsl(${20 + Math.random() * 40}, 100%, 60%)`
            });
          }
          break;
        case 'explosion':
          this.explosionParticles = [];
          for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 12;
            this.explosionParticles.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 3 + Math.random() * 8,
              life: Math.random(),
              color: `hsl(${30 + Math.random() * 30}, 100%, 55%)`
            });
          }
          break;
        case 'heal':
          this.healParticles = [];
          for (let i = 0; i < 30; i++) {
            this.healParticles.push({
              x: cx + (Math.random() - 0.5) * 80,
              y: cy + (Math.random() - 0.5) * 80,
              vx: (Math.random() - 0.5) * 1.5,
              vy: -Math.random() * 3 - 1,
              size: 4 + Math.random() * 6,
              life: Math.random(),
              color: `hsl(${120 + Math.random() * 40}, 80%, 65%)`
            });
          }
          break;
        case 'shield':
          this.shieldRadius = 0;
          this.shieldAlpha = 0;
          break;
        case 'formation':
          this.formationPoints = [];
          for (let i = 0; i < 24; i++) {
            const angle = (Math.PI * 2 * i) / 24;
            this.formationPoints.push({
              angle,
              radius: 50,
              pulse: Math.random() * Math.PI * 2
            });
          }
          this.formationAlpha = 0;
          break;
      }
    },
    animate() {
      const now = performance.now();
      const elapsed = (now - this.startTime) / 1000; // seconds

      if (elapsed >= this.period) {
        this.stopAnimation();
        return;
      }

      this.drawFrame(elapsed);
      this.animationId = requestAnimationFrame(this.animate);
    },
    drawFrame(elapsed) {
      if (!this.ctx || !this.canvas) return;

      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const cx = this.x;
      const cy = this.y;
      const progress = Math.min(1, elapsed / this.period); // 0 -> 1

      // 清除画布
      ctx.clearRect(0, 0, w, h);

      // 根据类型绘制特效
      switch (this.type) {
        case 'thunder':
          this.drawThunder(ctx, cx, cy, progress);
          break;
        case 'slash':
          this.drawSlash(ctx, cx, cy, progress);
          break;
        case 'thrust':
          this.drawThrust(ctx, cx, cy, progress);
          break;
        case 'heavy':
          this.drawHeavy(ctx, cx, cy, progress);
          break;
        case 'fire':
          this.drawFire(ctx, cx, cy, progress);
          break;
        case 'explosion':
          this.drawExplosion(ctx, cx, cy, progress);
          break;
        case 'heal':
          this.drawHeal(ctx, cx, cy, progress);
          break;
        case 'shield':
          this.drawShield(ctx, cx, cy, progress);
          break;
        case 'formation':
          this.drawFormation(ctx, cx, cy, progress);
          break;
      }
    },
    // 雷击特效 (蓝紫色)
    // 雷击特效: 扩散状闪电 + 向四周扩散的粒子效果
drawThunder(ctx, progress) {
  const t = progress;
  const easeInOut = this.easeInOutCubic(t);
  const alpha = Math.sin(t * Math.PI); // 淡入淡出

  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#a05eff";

  // 扩散圈数（随着进度向外扩散）
  const expandRadius = 15 + 55 * easeInOut;
  
  // ========== 多层扩散闪电分支 ==========
  // 8个主要方向，每个方向有多条分支
  const directions = 8; // 8个主方向
  const branchesPerDir = 3; // 每个方向3条分支

  for (let dir = 0; dir < directions; dir++) {
    const baseAngle = (dir / directions) * Math.PI * 2;
    // 添加随机偏移，让闪电更自然
    const angleOffset = Math.sin(t * 15 + dir) * 0.3;
    const mainAngle = baseAngle + angleOffset;

    for (let branch = 0; branch < branchesPerDir; branch++) {
      // 分支角度偏移（扩散状）
      const branchOffset = (branch - 1) * 0.25;
      const angle = mainAngle + branchOffset;

      // 分支长度（内短外长，形成扩散感）
      const branchLength = (20 + branch * 12) * easeInOut;

      // 闪电分支的起点（从中心开始）
      const startX = 0;
      const startY = 0;

      // 计算终点
      const endX = Math.cos(angle) * expandRadius * (0.6 + branch * 0.2);
      const endY = Math.sin(angle) * expandRadius * (0.6 + branch * 0.2);

      // 绘制折线闪电（多个节点）
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      // 生成中间节点，形成锯齿效果
      const segments = 4;
      let currentX = startX;
      let currentY = startY;

      for (let seg = 1; seg <= segments; seg++) {
        const segProgress = seg / segments;
        let targetX = endX * segProgress;
        let targetY = endY * segProgress;

        // 添加锯齿偏移
        const perpX = -Math.sin(angle) * (Math.sin(t * 20 + dir * 2 + seg) * 6);
        const perpY = Math.cos(angle) * (Math.sin(t * 20 + dir * 2 + seg) * 6);

        targetX += perpX * (1 - segProgress * 0.5);
        targetY += perpY * (1 - segProgress * 0.5);

        ctx.lineTo(targetX, targetY);
        currentX = targetX;
        currentY = targetY;
      }

      // 根据分支和方向设置颜色和宽度
      const intensity = 0.6 + (1 - branch / branchesPerDir) * 0.4;
      const colorAlpha = alpha * intensity * (1 - t * 0.3);

      if (branch === 0) {
        // 主分支（每个方向的主闪电）
        ctx.strokeStyle = `rgba(160, 100, 255, ${0.9 * colorAlpha})`;
        ctx.lineWidth = 3.5;
      } else {
        // 次级分支
        ctx.strokeStyle = `rgba(120, 70, 220, ${0.7 * colorAlpha})`;
        ctx.lineWidth = 2;
      }

      ctx.stroke();
    }
  }

  // ========== 额外随机闪电分支（增加密集度）==========
  for (let i = 0; i < 12; i++) {
    const randomAngle = Math.random() * Math.PI * 2;
    const randomLength = 25 + Math.random() * 40 * easeInOut;
    const endX = Math.cos(randomAngle) * randomLength;
    const endY = Math.sin(randomAngle) * randomLength;

    ctx.beginPath();
    ctx.moveTo(0, 0);

    // 随机锯齿
    let prevX = 0, prevY = 0;
    for (let seg = 1; seg <= 3; seg++) {
      const segProgress = seg / 3;
      let targetX = endX * segProgress;
      let targetY = endY * segProgress;

      const perpX = -Math.sin(randomAngle) * (Math.random() * 8 - 4);
      const perpY = Math.cos(randomAngle) * (Math.random() * 8 - 4);

      targetX += perpX * (1 - segProgress);
      targetY += perpY * (1 - segProgress);

      ctx.lineTo(targetX, targetY);
      prevX = targetX;
      prevY = targetY;
    }

    ctx.strokeStyle = `rgba(100, 60, 200, ${0.5 * alpha * (1 - t * 0.5)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ========== 向四周扩散的粒子效果（新增）==========

  // 第一层：大量快速扩散粒子（电弧碎片）
  const particleCount1 = 40;
  for (let i = 0; i < particleCount1; i++) {
    // 粒子角度（均匀分布 + 随机偏移）
    const angle = (i / particleCount1) * Math.PI * 2 + t * 8 + Math.random() * 0.5;
    // 粒子距离（随进度向外扩散）
    const distance = 15 + 65 * easeInOut * (0.5 + Math.random() * 0.8);
    // 粒子半径（越远越小）
    const radius = 2.5 * (1 - distance / 90) + 1;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    // 颜色：蓝紫色到白色渐变
    const colorIntensity = 0.7 * (1 - distance / 90) * alpha;
    ctx.fillStyle = `rgba(160, 100, 255, ${colorIntensity})`;
    ctx.fill();

    // 粒子拖尾效果
    ctx.beginPath();
    ctx.arc(x - Math.cos(angle) * 3, y - Math.sin(angle) * 3, radius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100, 60, 200, ${colorIntensity * 0.7})`;
    ctx.fill();
  }

  // 第二层：小型快速粒子（更密集）
  const particleCount2 = 60;
  for (let i = 0; i < particleCount2; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + 70 * easeInOut * Math.random();
    const speedOffset = Math.sin(t * 15 + angle * 3) * 3;
    const finalDistance = Math.min(85, distance + speedOffset);

    const x = Math.cos(angle) * finalDistance;
    const y = Math.sin(angle) * finalDistance;

    ctx.beginPath();
    ctx.arc(x, y, 1.5 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 150, 255, ${0.6 * alpha * (1 - finalDistance / 85)})`;
    ctx.fill();
  }

  // 第三层：溅射粒子（从中心向外喷射的线条状粒子）
  const particleCount3 = 25;
  for (let i = 0; i < particleCount3; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 5 + 60 * easeInOut * Math.random();
    const length = 4 + Math.random() * 6;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const x2 = Math.cos(angle) * (distance + length);
    const y2 = Math.sin(angle) * (distance + length);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(180, 120, 255, ${0.8 * alpha * (1 - distance / 70)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 第四层：环形扩散波（冲击波效果）
  for (let wave = 0; wave < 2; wave++) {
    const waveOffset = wave * 0.15;
    const waveProgress = Math.max(0, Math.min(1, (easeInOut - waveOffset) / (1 - waveOffset)));
    if (waveProgress > 0) {
      const waveRadius = 20 + 65 * waveProgress;
      ctx.beginPath();
      ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(150, 100, 255, ${0.5 * alpha * (1 - waveProgress)})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 环形上的粒子
      for (let p = 0; p < 12; p++) {
        const ringAngle = (p / 12) * Math.PI * 2 + t * 12;
        const x = Math.cos(ringAngle) * waveRadius;
        const y = Math.sin(ringAngle) * waveRadius;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 150, 255, ${0.6 * alpha * (1 - waveProgress)})`;
        ctx.fill();
      }
    }
  }

  // ========== 中心光晕（雷击核心）==========
  ctx.beginPath();
  ctx.arc(0, 0, 12 + 8 * Math.sin(t * Math.PI * 3), 0, Math.PI * 2);
  ctx.fillStyle = `rgba(180, 120, 255, ${0.8 * alpha})`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, 6 + 3 * Math.sin(t * Math.PI * 6), 0, Math.PI * 2);
  ctx.fillStyle = `rgba(230, 190, 255, ${0.95 * alpha})`;
  ctx.fill();

  // 中心向外喷射的粒子
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 5 + 25 * easeInOut * Math.random();
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 220, 255, ${0.9 * alpha * (1 - distance / 30)})`;
    ctx.fill();
  }

  ctx.restore();
},
    // 挥砍特效 (灰白刀光剑气)
    drawSlash(ctx, cx, cy, progress) {
      const t = progress;
      const angle = this.slashAngle;
      const arcRadius = 80;
      const startAngle = angle - Math.PI / 2;
      const endAngle = angle + Math.PI / 2;
      const currentAngle = startAngle + (endAngle - startAngle) * t;
      const slashLength = 100;
      const x2 = cx + Math.cos(currentAngle) * slashLength;
      const y2 = cy + Math.sin(currentAngle) * slashLength;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 12 * (1 - t * 0.5);
      ctx.strokeStyle = `rgba(200, 200, 220, ${0.8 * (1 - t)})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.stroke();
      // 附加剑气
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        const offsetAngle = currentAngle + i * 0.3;
        const ox = cx + Math.cos(offsetAngle) * slashLength * 0.8;
        const oy = cy + Math.sin(offsetAngle) * slashLength * 0.8;
        ctx.moveTo(cx, cy);
        ctx.lineTo(ox, oy);
        ctx.lineWidth = 5 * (1 - t);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - t)})`;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    },
    // 突刺特效 (直线刀光)
    drawThrust(ctx, cx, cy, progress) {
      const directionY = this.direction === 'up' ? -1 : 1;
      const maxDist = 120;
      const dist = maxDist * progress;
      const startX = cx;
      const startY = cy;
      const endX = cx;
      const endY = cy + directionY * dist;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.lineWidth = 20 * (1 - progress * 0.7);
      ctx.strokeStyle = `rgba(210, 210, 240, ${0.9 * (1 - progress * 0.3)})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffffff';
      ctx.stroke();
      // 尖端
      ctx.beginPath();
      const tipX = endX;
      const tipY = endY;
      const perpX = directionY === -1 ? 8 : 8;
      const perpY = directionY === -1 ? 0 : 0;
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - 8, tipY - directionY * 12);
      ctx.lineTo(tipX + 8, tipY - directionY * 12);
      ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    },
    // 重压特效 (圆形气团)
    drawHeavy(ctx, cx, cy, progress) {
      const radius = 40 + progress * 60;
      const alpha = 0.6 * (1 - progress * 0.7);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(180, 180, 200, ${alpha})`);
      gradient.addColorStop(1, `rgba(120, 120, 140, ${alpha * 0.5})`);
      ctx.fillStyle = gradient;
      ctx.fill();
      // 冲击波环
      for (let i = 0; i < 3; i++) {
        const ringRadius = radius * (0.6 + i * 0.2);
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(200, 200, 220, ${0.5 * (1 - progress)})`;
        ctx.stroke();
      }
    },
    // 火焰特效
    drawFire(ctx, cx, cy, progress) {
      for (let i = this.fireParticles.length - 1; i >= 0; i--) {
        const p = this.fireParticles[i];
        p.life -= 0.02;
        if (p.life <= 0 || progress > 0.9) {
          this.fireParticles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        const lifeFactor = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * lifeFactor, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${80 + 100 * lifeFactor}, 0, ${lifeFactor * 0.8})`;
        ctx.fill();
      }
      // 补充粒子
      if (progress < 0.8 && this.fireParticles.length < 30) {
        for (let i = 0; i < 3; i++) {
          this.fireParticles.push({
            x: cx + (Math.random() - 0.5) * 50,
            y: cy + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 4 - 1,
            size: 4 + Math.random() * 7,
            life: 0.8 + Math.random() * 0.2,
            color: ''
          });
        }
      }
    },
    // 爆炸特效
    drawExplosion(ctx, cx, cy, progress) {
      if (progress < 0.2) {
        // 初期爆发
        const intensity = progress / 0.2;
        const radius = 20 + intensity * 60;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(255, 200, 50, ${1 - intensity * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 50, 0, ${0.8 - intensity * 0.5})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      } else {
        // 粒子扩散
        for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
          const p = this.explosionParticles[i];
          p.life -= 0.02;
          if (p.life <= 0) {
            this.explosionParticles.splice(i, 1);
            continue;
          }
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, ${80 + 100 * p.life}, 0, ${p.life * 0.9})`;
          ctx.fill();
        }
      }
    },
    // 治疗特效 (绿色)
    drawHeal(ctx, cx, cy, progress) {
      for (let i = this.healParticles.length - 1; i >= 0; i--) {
        const p = this.healParticles[i];
        p.life -= 0.015;
        if (p.life <= 0 || progress > 0.95) {
          this.healParticles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${120 + 20 * p.life}, 80%, 65%, ${p.life * 0.7})`;
        ctx.fill();
      }
      // 光环
      const ringRadius = 30 + Math.sin(progress * Math.PI * 4) * 10;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(100, 255, 100, ${0.6 * (1 - progress)})`;
      ctx.stroke();
    },
    // 护盾特效 (潜绿色)
    drawShield(ctx, cx, cy, progress) {
      const radius = 45 + Math.sin(progress * Math.PI * 3) * 8;
      const alpha = 0.5 * (1 - progress * 0.6);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 200, 120, ${alpha * 0.4})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(150, 230, 160, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      // 六边形纹理
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + progress * Math.PI * 2;
        const x2 = cx + Math.cos(angle) * radius * 0.8;
        const y2 = cy + Math.sin(angle) * radius * 0.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(180, 240, 180, ${alpha * 0.7})`;
        ctx.stroke();
      }
    },
    // 阵法特效 (潜绿色)
    drawFormation(ctx, cx, cy, progress) {
      const alpha = 0.6 * (1 - progress * 0.5);
      // 外圈
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100, 200, 120, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      // 内圈
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.stroke();
      // 符文点
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24 + progress * Math.PI;
        const r = 55 + Math.sin(progress * Math.PI * 4 + i) * 5;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 220, 140, ${alpha * 0.8})`;
        ctx.fill();
      }
      // 连接线
      for (let i = 0; i < 24; i++) {
        const angle1 = (Math.PI * 2 * i) / 24;
        const angle2 = (Math.PI * 2 * ((i + 12) % 24)) / 24;
        const x1 = cx + Math.cos(angle1) * 55;
        const y1 = cy + Math.sin(angle1) * 55;
        const x2 = cx + Math.cos(angle2) * 55;
        const y2 = cy + Math.sin(angle2) * 55;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(100, 200, 120, ${alpha * 0.5})`;
        ctx.stroke();
      }
    }
  }
};
</script>

<style scoped>
.battle-effect-canvas {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
}
</style>
