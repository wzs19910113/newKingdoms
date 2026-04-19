<template>
  <canvas ref="canvasRef" class="battle-effect-canvas"></canvas>
</template>

<script>
const typeMap = ['text','thunder', 'arc', 'laser', 'blood', 'fire', 'explosion', 'heal', 'barrier', 'formation', 'moon', 'halo', 'cross', 'dark', 'lightning', ];
export default {
  name: "AniElement",
  props: {
    id: {
      type: Number,
      required: true,
    },
        delay: {
            type: Number,
            default: 0, // 延迟时间，单位秒
        },
        text: {
            type: String,
            default: '',
        },
        color: {
            type: Object,
            default: function(){return {r:0,g:0,b:0,}},
        },
        fontSize: {
            type: Number,
            default: .44, // rem
        },
    type: {
      type: String,
      required: true,
    },
    period: {
      type: Number,
      default: 0.5, // 秒
    },
    initAngle: {
      type: Number,
      default: 0, // 弧度
    },
    spinSpeed: {
      type: Number,
      default: 0, // 弧度/秒，正值逆时针
    },
    scaleX: {
      type: Number,
      default: 1,
    },
    scaleY: {
      type: Number,
      default: 1,
    },
    fromX: {
      type: Number,
      default: 0,
    },
    fromY: {
      type: Number,
      default: 0,
    },
    toX: {
      type: Number,
      default: 0,
    },
    toY: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      startTime: 0,
      animationFrame: null,
      ctx: null,
      canvasWidth: 0,
      canvasHeight: 0,
      isActive: true,

      c: 0,
    };
  },
  computed: {

  },
  mounted() {
      // console.log(`Ccc mounted=>`,this);
    this.initCanvas();
    this.startTime = performance.now() + this.delay * 1000;
    this._animate();
  },
  beforeDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.isActive = false;
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvasRef;
      const container = canvas.parentElement || document.body;
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;
      canvas.width = this.canvasWidth;
      canvas.height = this.canvasHeight;
      this.ctx = canvas.getContext("2d");
    },
    // 缓动函数: 先慢后快再慢 (easeInOutCubic)
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    // 获取当前进度 [0,1]，带淡入淡出透明度系数
    getProgressAndAlpha(now) {
      const elapsed = (now - this.startTime) / 1000;

      // 如果还在延迟期间，返回进度0
      if (elapsed < 0) {
        return { progress: 0, easedProgress: 0, alpha: 0 };
      }

      let progress = Math.min(1, elapsed / this.period);
      // 先慢后快再慢的位移进度
      const easedProgress = this.easeInOutCubic(progress);
      // 透明度: 淡入淡出 (开头0.1内淡入，结尾0.1内淡出)
      let alpha = 1;
      const fadeInDuration = 0.08;
      const fadeOutDuration = 0.12;
      if (progress < fadeInDuration) {
        alpha = progress / fadeInDuration;
      } else if (progress > 1 - fadeOutDuration) {
        alpha = (1 - progress) / fadeOutDuration;
      }
      alpha = Math.min(1, Math.max(0, alpha));
      return { progress, easedProgress, alpha };
    },
    // 获取当前位置（线性插值，但进度用easedProgress）
    getCurrentPosition(easedProgress) {
      const x = this.fromX + (this.toX - this.fromX) * easedProgress;
      const y = this.fromY + (this.toY - this.fromY) * easedProgress;
      return { x, y };
    },
    // 获取当前旋转角度
    getCurrentAngle(progress) {
      return this.initAngle + this.spinSpeed * this.period * progress;
    },
    _animate() {
      if (!this.isActive) return;
      const now = performance.now();
      this.c++;

      // 如果还在延迟期间，继续等待
      if (now < this.startTime) {
        this.animationFrame = requestAnimationFrame(this._animate);
        return;
      }

      const { progress, easedProgress, alpha } = this.getProgressAndAlpha(now);
      if (progress >= 1) {
        // 动画结束，移除自身
        // this.destroyComponent();
        this.$emit('onAnimationEnd',this.id);
        // console.log(`动画（${this.type}）总帧数：`,this.c);
        return;
      }
      const { x, y } = this.getCurrentPosition(easedProgress);
      const angle = this.getCurrentAngle(progress);
      this.drawEffect(x, y, angle, alpha, progress);
      this.animationFrame = requestAnimationFrame(this._animate);
    },
    destroyComponent() {
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
      this.$destroy();
      if (this.$el && this.$el.parentNode) this.$el.parentNode.removeChild(this.$el);
    },
    // 核心绘制函数，根据不同type绘制炫酷特效
    drawEffect(x, y, angle, alpha, progress) {
      const ctx = this.ctx;
      const w = this.canvasWidth;
      const h = this.canvasHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(this.scaleX, this.scaleY);
      ctx.globalAlpha = alpha;
      // 根据类型分发绘制
      switch (this.type) {
        case "text":
          this.drawText(ctx, progress);
          break;
        case "thunder":
          this.drawThunder(ctx, progress);
          break;
        case "arc":
          this.drawSector(ctx, progress);
          break;
        case "laser":
          this.drawLaser(ctx, progress);
          break;
        case "blood":
          this.drawBlood(ctx, progress);
          break;
        case "fire":
          this.drawFire(ctx, progress);
          break;
        case "explosion":
          this.drawExplosion(ctx, progress);
          break;
        case "heal":
          this.drawHeal(ctx, progress);
          break;
        case "barrier":
          this.drawBarrier(ctx, progress);
          break;
        case "formation":
          this.drawFormation(ctx, progress);
          break;
        case "moon":
          this.drawMoon(ctx, progress);
          break;
        case "halo":
          this.drawHalo(ctx, progress);
          break;
        case "cross":
          this.drawCross(ctx, progress);
          break;
        case "dark":
          this.drawDark(ctx, progress);
          break;
        case "lightning":
          this.drawLightning(ctx, progress);
          break;
        default:
          this.drawThunder(ctx, progress);
      }
      ctx.restore();
    },
    // 辅助: 绘制光晕
    drawGlow(ctx, color, x, y, radius) {
      ctx.shadowBlur = radius;
      ctx.shadowColor = color;
    },

    // 文本特效
    drawText(ctx, progress){
        const t = progress;
        const color = this.color;

        const text = this.text || "0";
        const fontFamily = this.fontFamily || "Arial, \"Microsoft YaHei\", sans-serif";
        const fontSize = this.fontSize || .44;
        // const op_color = {r:255-color.r,g:255-color.g,b:255-color.b,};
        const op_color = {r:0,g:0,b:0,};

        // 透明度：只淡出（前60%完全不透明，之后线性淡出）
        let alpha = 1;
        const fadeOutStart = 0.55;
        if (t > fadeOutStart) {
            alpha = 1 - (t - fadeOutStart) / (1 - fadeOutStart);
        }
        alpha = Math.min(1, Math.max(0, alpha));

        ctx.save();

        // 设置字体
        ctx.font = `bold ${fontSize}rem ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // ========== 第一层：文字外发光（最大范围） ==========
        ctx.shadowColor = `rgba(${op_color.r},${op_color.g},${op_color.b}, ${0.7 * alpha})`;
        ctx.fillStyle = `rgba(${op_color.r},${op_color.g},${op_color.b}, ${0.95 * alpha})`;
        ctx.fillText(text, 1, 1);
        // ========== 第二层：文字主体（清晰） ==========
        // ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${color.r},${color.g},${color.b}, ${0.9 * alpha})`;
        ctx.fillStyle = `rgba(${color.r},${color.g},${color.b}, ${alpha})`;
        ctx.fillText(text, 0, 0);
        // ========== 第四层：文字描边（增强可读性） ==========
        // ctx.shadowBlur = 0;
        // ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b}, ${0.5 * alpha})`;
        // ctx.lineWidth = 2.5;
        // ctx.strokeText(text, 0, 0);
        // ========== 第七层：文字闪光效果（随机闪烁） ==========
        // if (t < 0.3 && Math.random() < 0.3) {
        //     const flashIntensity = (1 - t / 0.3) * 0.8;
        //     ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * flashIntensity * alpha})`;
        //     ctx.fillText(text, 0, 0);
        // }
        // ========== 第八层：文字底部阴影（增强立体感） ==========
        // ctx.shadowBlur = 8;
        // ctx.shadowColor = `rgba(0, 0, 0, ${0.4 * alpha})`;
        // ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * alpha})`;
        // ctx.fillText(text, 2, 2);

        ctx.restore();
    },
    // 雷击特效: 扩散状闪电（无主干，向四周放射）
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
      const directions = 3; // 8个主方向
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

      // ========== 电弧粒子（增强扩散感）==========
      for (let p = 0; p < 20; p++) {
        const particleAngle = Math.random() * Math.PI * 2;
        const particleDist = 10 + Math.random() * 55 * easeInOut;
        const x = Math.cos(particleAngle) * particleDist;
        const y = Math.sin(particleAngle) * particleDist;

        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 100, 255, ${0.8 * alpha * (1 - particleDist / 70)})`;
        ctx.fill();

        // 小拖尾
        ctx.beginPath();
        ctx.arc(x - Math.cos(particleAngle) * 4, y - Math.sin(particleAngle) * 4, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 60, 200, ${0.5 * alpha})`;
        ctx.fill();
      }

      // 冲击波上的粒子（随冲击波扩散）
      const easeIn = t * t;
      const shockwaveRadius = 8 + 90 * easeIn;
      const waveParticleCount = 30;
      for (let i = 0; i < waveParticleCount; i++) {
        const angle = (i / waveParticleCount) * Math.PI * 2 + t * 15;
        const x = Math.cos(angle) * shockwaveRadius;
        const y = Math.sin(angle) * shockwaveRadius;
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.sin(t * 25 + i) * 1.2, 0, Math.PI * 2);

        // 冲击波粒子颜色（白/红/黄交替）
        let waveR, waveG, waveB;
        if (i % 3 === 0) {
          waveR = 255; waveG = 220; waveB = 100; // 黄色
        } else if (i % 3 === 1) {
          waveR = 55; waveG = 255; waveB = 255;   // 红色
        } else {
          waveR = 255; waveG = 240; waveB = 200; // 白色
        }
        ctx.fillStyle = `rgba(${waveR}, ${waveG}, ${waveB}, ${0.7 * alpha * (1 - easeIn)})`;
        ctx.fill();
      }

      // ========== 中心光晕（雷击核心）==========
      ctx.beginPath();
      ctx.arc(0, 0, 10 + 8 * Math.sin(t * Math.PI * 2), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 120, 255, ${0.7 * alpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 5 + 3 * Math.sin(t * Math.PI * 4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 180, 255, ${0.9 * alpha})`;
      ctx.fill();

      ctx.restore();
    },
    // 扇形特效: 135度扇形，边缘白光，底部透明，黑色残影效果
    drawSector(ctx, progress) {
      const t = progress;
      const easeInOut = this.easeInOutCubic(t);
      const alpha = Math.sin(t * Math.PI); // 淡入淡出

      ctx.save();

      // ========== 黑色残影效果（3层残影）==========
      for (let ghost = 1; ghost <= 3; ghost++) {
        ctx.save();
        // 残影偏移量
        const ghostOffset = ghost * 8;
        const ghostDelay = ghost * 0.1;
        const ghostProgress = Math.max(0, easeInOut - ghostDelay);

        if (ghostProgress <= 0) {
          ctx.restore();
          continue;
        }

        // 残影位置：向后偏移
        ctx.translate(-ghostOffset + Math.sin(t * 20) * 1.5, ghostOffset * 0.2);
        ctx.rotate(-ghost * 0.03);

        // 绘制扇形残影
        const startAngle = -Math.PI * 0.625; // -112.5度 (135度扇形的起始)
        const endAngle = startAngle + Math.PI * 0.75; // +135度

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 45 * ghostProgress, startAngle, endAngle);
        ctx.closePath();

        // 残影颜色：黑色到深灰渐变，底部透明
        const ghostAlpha = 0.3 * (1 - t * 0.4) * (1 - ghost * 0.15);
        const ghostGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 45 * ghostProgress);
        ghostGradient.addColorStop(0, `rgba(0, 0, 0, ${ghostAlpha * 0.9})`);
        ghostGradient.addColorStop(0.5, `rgba(10, 10, 15, ${ghostAlpha * 0.6})`);
        ghostGradient.addColorStop(1, `rgba(0, 0, 0, 0)`); // 底部透明
        ctx.fillStyle = ghostGradient;
        ctx.fill();

        ctx.restore();
      }

      // ========== 主扇形 ==========
      const startAngle = -Math.PI * 0.625; // -112.5度
      const endAngle = startAngle + Math.PI * 0.75; // +135度 = 22.5度结束

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 50 * easeInOut, startAngle, endAngle);
      ctx.closePath();

      // 主扇形渐变填充（底部透明，顶部白光）
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50 * easeInOut);
      gradient.addColorStop(0, `rgba(100, 100, 120, ${0.7 * alpha})`);      // 中心半透明灰
      gradient.addColorStop(0.3, `rgba(180, 180, 200, ${0.8 * alpha})`);
      gradient.addColorStop(0.6, `rgba(230, 230, 250, ${0.9 * alpha})`);
      gradient.addColorStop(0.85, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`); // 边缘完全透明
      ctx.fillStyle = gradient;
      ctx.fill();

      // ========== 边缘白光特效 ==========
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(255, 255, 255, 0.9)";

      // 外层白光边缘
      ctx.beginPath();
      ctx.arc(0, 0, 48 * easeInOut, startAngle, endAngle);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * alpha})`;
      ctx.stroke();

      // 内层强光边缘
      ctx.beginPath();
      ctx.arc(0, 0, 44 * easeInOut, startAngle, endAngle);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * alpha})`;
      ctx.stroke();

      // 扇形两侧边缘光晕
      ctx.beginPath();
      // 左侧边缘线
      ctx.moveTo(0, 0);
      const leftX = Math.cos(startAngle) * 48 * easeInOut;
      const leftY = Math.sin(startAngle) * 48 * easeInOut;
      ctx.lineTo(leftX, leftY);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * alpha})`;
      ctx.stroke();

      ctx.beginPath();
      // 右侧边缘线
      ctx.moveTo(0, 0);
      const rightX = Math.cos(endAngle) * 48 * easeInOut;
      const rightY = Math.sin(endAngle) * 48 * easeInOut;
      ctx.lineTo(rightX, rightY);
      ctx.stroke();

      ctx.restore();

      // ========== 扇形内部光晕粒子（增强视觉）==========
      for (let i = 0; i < 6; i++) {
        const angleRange = startAngle + Math.random() * (endAngle - startAngle);
        const radiusRange = 20 + Math.random() * 30 * easeInOut;
        const xOffset = Math.cos(angleRange) * radiusRange;
        const yOffset = Math.sin(angleRange) * radiusRange;

        ctx.beginPath();
        ctx.arc(xOffset, yOffset, 1.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * alpha * (1 - t * 0.5)})`;
        ctx.fill();
      }

      ctx.restore();
    },
    // 镭射特效: 灰色+白色光束
    drawLaser(ctx, progress) {
      const t = progress;
      const width = 12 * (1 - t * 0.3) + 4;
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#aaaaff";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-40 * t, -4 + i * 3);
        ctx.lineTo(40 * t, -2 + i * 2);
        ctx.lineTo(35 * t, 4 + i * 2);
        ctx.lineTo(-35 * t, 6 + i * 2);
        ctx.fillStyle = `rgba(160, 160, 200, ${0.7 * (1 - t * 0.5)})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.rect(-38 * t, -3, 76 * t, 6);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * Math.sin(t * Math.PI)})`;
      ctx.fill();
      ctx.restore();
    },
    // 火焰特效: 红黄色，雾气和燃烧
    drawFire(ctx, progress) {
      const t = progress;
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = "orange";
      for (let i = 0; i < 8; i++) {
        const offX = Math.sin(t * 25 + i) * 5 * (1 - t);
        const offY = Math.cos(t * 20 + i * 2) * 4 * t;
        ctx.beginPath();
        ctx.moveTo(-15 + offX, -25 * t + offY);
        ctx.quadraticCurveTo(offX, -35 * t, 15 + offX, -20 * t + offY);
        ctx.lineTo(8 + offX, -5 * t);
        ctx.quadraticCurveTo(offX, 8 * t, -8 + offX, -8 * t);
        ctx.fillStyle = `rgba(255, ${80 + Math.sin(t * 30) * 40}, 20, ${0.8 * (1 - t * 0.5)})`;
        ctx.fill();
      }
      // 火星粒子
      for (let p = 0; p < 20; p++) {
        ctx.beginPath();
        const angleRad = (p * 37) % 360;
        const rad = 2 + Math.sin(t * 50) * 1.5;
        ctx.arc(Math.cos(angleRad + t * 15) * 18 * t, Math.sin(angleRad * 2 + t * 20) * 12 * t, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 140, 30, ${0.9 * (1 - t)})`;
        ctx.fill();
      }
      ctx.restore();
    },
    // 烟花特效: 白+红+黄，向四周扩散的粒子效果 + 圆形冲击波，扩散速度由慢到快，只要淡出不要淡入
    drawExplosion(ctx, progress) {
      const t = progress;
      // 使用 easeInQuad 实现由慢到快的速度曲线
      const easeIn = t * t;
      // 只要淡出（开始时完全不透明，结束时完全透明）
      const alpha = 1 - t; // 线性淡出
      const fadeOutAlpha = Math.max(0, Math.min(1, 1 - t * 1.2)); // 稍快的淡出

      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(255, 100, 0, 0.8)";

      // 爆炸扩散半径（由慢到快增长）
      const explosionRadius = 5 + 85 * easeIn;

      // ========== 圆形冲击波（多层） ==========
      // 第一层冲击波（主冲击波，白色）
      const shockwaveRadius = 8 + 90 * easeIn;
      // ctx.beginPath();
      // ctx.arc(0, 0, shockwaveRadius, 0, Math.PI * 2);
      // ctx.strokeStyle = `rgba(255, 220, 150, ${0.8 * fadeOutAlpha * (1 - easeIn * 0.4)})`;
      // ctx.lineWidth = 4;
      // ctx.stroke();

      // 第二层冲击波（红色光晕）
      const shockwave2Progress = Math.max(0, Math.min(1, (easeIn - 0.08) / 0.92));
      if (shockwave2Progress > 0) {
        const shockwave2Radius = 8 + 72 * shockwave2Progress;
        ctx.beginPath();
        ctx.arc(0, 0, shockwave2Radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 80, 50, ${1 * fadeOutAlpha * (1 - shockwave2Progress)})`;
        ctx.lineWidth = 33;
        ctx.stroke();
      }

      // 第三层冲击波（黄色外圈）
      // const shockwave3Radius = 5 + 100 * easeIn;
      // ctx.beginPath();
      // ctx.arc(0, 0, shockwave3Radius, 0, Math.PI * 2);
      // ctx.strokeStyle = `rgba(255, 180, 60, ${0.45 * fadeOutAlpha * (1 - easeIn * 0.5)})`;
      // ctx.lineWidth = 2.5;
      // ctx.stroke();

      // 冲击波上的粒子（随冲击波扩散）
      // const waveParticleCount = 30;
      // for (let i = 0; i < waveParticleCount; i++) {
      //   const angle = (i / waveParticleCount) * Math.PI * 2 + t * 15;
      //   const x = Math.cos(angle) * shockwaveRadius;
      //   const y = Math.sin(angle) * shockwaveRadius;
      //   ctx.beginPath();
      //   ctx.arc(x, y, 2 + Math.sin(t * 25 + i) * 1.2, 0, Math.PI * 2);
      //
      //   // 冲击波粒子颜色（白/红/黄交替）
      //   let waveR, waveG, waveB;
      //   if (i % 3 === 0) {
      //     waveR = 255; waveG = 220; waveB = 100; // 黄色
      //   } else if (i % 3 === 1) {
      //     waveR = 255; waveG = 80; waveB = 60;   // 红色
      //   } else {
      //     waveR = 255; waveG = 240; waveB = 200; // 白色
      //   }
      //   ctx.fillStyle = `rgba(${waveR}, ${waveG}, ${waveB}, ${0.7 * fadeOutAlpha * (1 - easeIn)})`;
      //   ctx.fill();
      // }

      // ========== 第一层：主粒子群（大量向外扩散的圆形粒子）==========
      // const mainParticleCount = 100;
      // for (let i = 0; i < mainParticleCount; i++) {
      //   // 粒子角度（均匀分布 + 随机偏移）
      //   const angle = (i / mainParticleCount) * Math.PI * 2 + Math.random() * 0.5;
      //   // 粒子距离（随进度向外扩散，使用 easeIn 实现由慢到快）
      //   const distance = 5 + 80 * easeIn * (0.4 + Math.random() * 1);
      //   // 粒子大小（越远越小）
      //   const size = 2 + Math.random() * 3.5 * (1 - distance / 90);
      //
      //   const x = Math.cos(angle) * distance;
      //   const y = Math.sin(angle) * distance;
      //
      //   ctx.beginPath();
      //   ctx.arc(x, y, size, 0, Math.PI * 2);
      //
      //   // 颜色：白/红/黄三种
      //   const colorType = Math.random();
      //   let r, g, b;
      //   if (colorType < 0.34) {
      //     // 白色
      //     r = 255; g = 245; b = 220;
      //   } else if (colorType < 0.67) {
      //     // 红色
      //     r = 235 + Math.random() * 20;
      //     g = 50 + Math.random() * 50;
      //     b = 30 + Math.random() * 30;
      //   } else {
      //     // 黄色
      //     r = 255;
      //     g = 180 + Math.random() * 75;
      //     b = 40 + Math.random() * 40;
      //   }
      //
      //   const particleAlpha = fadeOutAlpha * (1 - distance / 90) * (0.5 + Math.random() * 0.5);
      //   ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particleAlpha})`;
      //   ctx.fill();
      // }

      // ========== 第二层：拖尾粒子（带尾巴效果的粒子）==========
      // const tailParticleCount = 60;
      // for (let i = 0; i < tailParticleCount; i++) {
      //   const angle = Math.random() * Math.PI * 2;
      //   const distance = 5 + 75 * easeIn * Math.random();
      //   // 拖尾长度随速度增加而变长
      //   const tailLength = 4 + 15 * easeIn * Math.random();
      //
      //   const x = Math.cos(angle) * distance;
      //   const y = Math.sin(angle) * distance;
      //   const tailX = Math.cos(angle) * Math.max(0, distance - tailLength);
      //   const tailY = Math.sin(angle) * Math.max(0, distance - tailLength);
      //
      //   // 绘制拖尾线条
      //   ctx.beginPath();
      //   ctx.moveTo(tailX, tailY);
      //   ctx.lineTo(x, y);
      //
      //   // 拖尾颜色根据距离渐变
      //   const tailColorType = Math.random();
      //   let tailR, tailG, tailB;
      //   if (tailColorType < 0.33) {
      //     tailR = 255; tailG = 200; tailB = 100;
      //   } else if (tailColorType < 0.66) {
      //     tailR = 255; tailG = 70; tailB = 40;
      //   } else {
      //     tailR = 255; tailG = 235; tailB = 180;
      //   }
      //
      //   ctx.strokeStyle = `rgba(${tailR}, ${tailG}, ${tailB}, ${0.6 * fadeOutAlpha * (1 - distance / 80)})`;
      //   ctx.lineWidth = 1.5 + Math.random() * 2.5;
      //   ctx.stroke();
      //
      //   // 头部粒子
      //   ctx.beginPath();
      //   ctx.arc(x, y, 1.5 + Math.random() * 2.5, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(${tailR}, ${tailG}, ${tailB}, ${0.85 * fadeOutAlpha * (1 - distance / 80)})`;
      //   ctx.fill();
      // }

      // ========== 第三层：火星溅射（细小颗粒）==========
      const sparkCount = 150;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + 185 * easeIn * Math.random();
        const size = 1 + Math.random() * 2;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);

        // 随机白/红/黄
        const sparkType = Math.random();
        let sparkR, sparkG, sparkB;
        if (sparkType < 0.33) {
          sparkR = 255; sparkG = 245; sparkB = 200;
        } else if (sparkType < 0.66) {
          sparkR = 245 + Math.random() * 10;
          sparkG = 60 + Math.random() * 40;
          sparkB = 30 + Math.random() * 30;
        } else {
          sparkR = 255;
          sparkG = 190 + Math.random() * 65;
          sparkB = 50 + Math.random() * 40;
        }

        ctx.fillStyle = `rgba(${sparkR}, ${sparkG}, ${sparkB}, ${0.7 * fadeOutAlpha * (1 - distance / 90)})`;
        ctx.fill();
      }

      // ========== 第四层：爆炸闪光核心（随进度减弱）==========
      // const coreSize = 10 + 8 * (1 - easeIn);
      // ctx.beginPath();
      // ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
      // ctx.fillStyle = `rgba(255, 220, 100, ${0.9 * fadeOutAlpha})`;
      // ctx.fill();
      //
      // ctx.beginPath();
      // ctx.arc(0, 0, coreSize * 0.6, 0, Math.PI * 2);
      // ctx.fillStyle = `rgba(255, 120, 40, ${0.85 * fadeOutAlpha})`;
      // ctx.fill();
      //
      // ctx.beginPath();
      // ctx.arc(0, 0, coreSize * 0.3, 0, Math.PI * 2);
      // ctx.fillStyle = `rgba(255, 255, 200, ${fadeOutAlpha})`;
      // ctx.fill();

      // 核心向外喷射的射线
      // for (let i = 0; i < 20; i++) {
      //   const angle = (i / 20) * Math.PI * 2 + t * 10;
      //   const distance = 5 + 130 * easeIn;
      //   const x = Math.cos(angle) * distance;
      //   const y = Math.sin(angle) * distance;
      //
      //   ctx.beginPath();
      //   ctx.moveTo(0, 0);
      //   ctx.lineTo(x, y);
      //   ctx.strokeStyle = `rgba(255, 180, 80, ${1 * fadeOutAlpha * (1 - easeIn)})`;
      //   ctx.lineWidth = 18;
      //   ctx.stroke();
      // }

      ctx.restore();
    },
    // 治疗特效: 绿色粒子向上飘散
    drawHeal(ctx, progress) {
      const t = progress;
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#18efa8";
      for (let i = 0; i < 25; i++) {
        const angleOff = (i * 37) % 360;
        const rad = 4 + Math.sin(t * 20 + i) * 2;
        const yOff = -12 * t - Math.sin(t * 15 + i) * 8;
        const xOff = Math.cos(angleOff + t * 12) * 14 * t;
        ctx.beginPath();
        ctx.arc(xOff, yOff, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 240, 200, ${0.8 * (1 - t * 0.4)})`;
        ctx.fill();
      }
      // 十字光晕
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(0, -18 * t);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 18 * t);
      ctx.fillStyle = `rgba(120, 205, 180, ${0.7 * Math.sin(t * Math.PI)})`;
      ctx.fill();

      // ========== 第八层：冲击波光环 ==========
      for (let wave = 0; wave < 2; wave++) {
        const waveDelay = wave * 0.12;
        const waveProgress = Math.max(0, Math.min(1, (t - waveDelay) / (1 - waveDelay)));
        if (waveProgress > 0 && waveProgress < 0.95) {
          const waveRadius = 12 + 25 * waveProgress;
          ctx.beginPath();
          ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 230, 170, ${0.8 * 1 * (1 - waveProgress)})`;
          ctx.lineWidth = .5;
          ctx.stroke();

          // 光环上的粒子
          // for (let p = 0; p < 16; p++) {
          //   const ringAngle = (p / 16) * Math.PI * 2 + t * 15;
          //   const x = Math.cos(ringAngle) * waveRadius;
          //   const y = Math.sin(ringAngle) * waveRadius;
          //   ctx.beginPath();
          //   ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          //   ctx.fillStyle = `rgba(255, 235, 180, ${0.5 * 1 * (1 - waveProgress)})`;
          //   ctx.fill();
          // }
        }
      }

      ctx.restore();
    },
    // 护盾特效: 潜绿色+蓝色 六边形多层
    drawBarrier(ctx, progress) {
      const t = progress;
      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#44ccff";
      for (let layer = 0; layer < 2; layer++) {
        const scaleLayer = 1 - layer * 5.2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angleHex = i * Math.PI * 2 / 6 + Math.PI/2;
          const xOff = Math.cos(angleHex) * (18 + layer * 4) * (1 - t * 0.3);
          const yOff = Math.sin(angleHex) * (18 + layer * 4) * (1 - t * 0.3);
          if (i === 0) ctx.moveTo(xOff, yOff);
          else ctx.lineTo(xOff, yOff);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * (1 - t * 0.8)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * Math.sin(t * Math.PI)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    },
    // 阵法特效: 潜蓝色粒子法阵
    drawFormation(ctx, progress) {
      const t = progress;
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#3399ff";
      // 外圈符文圆环
      for (let r = 0; r < 2; r++) {
        ctx.beginPath();
        ctx.arc(0, 0, 22 - r * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(80, 160, 255, ${0.7 * Math.sin(t * Math.PI)})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      // 粒子流动
      for (let i = 0; i < 16; i++) {
        const angleFlow = i * Math.PI * 2 / 16 + t * 8;
        const xFlow = Math.cos(angleFlow) * 26 * t;
        const yFlow = Math.sin(angleFlow) * 26 * t;
        ctx.beginPath();
        ctx.arc(xFlow, yFlow, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${0.9 * (1 - t * 0.3)})`;
        ctx.fill();
      }
      // 中心符文
      ctx.font = `${24 * (1 + t * 0.5)}px "Arial"`;
      ctx.fillStyle = `rgba(70, 170, 250, ${0.8 * Math.sin(t * Math.PI)})`;
      ctx.fillText("⚝", -12, 10);

      ctx.restore();
    },
    // 飙血特效: 鲜红色，向四周扩散然后下坠的粒子效果，扩散速度由快到慢，只要淡出不要淡入
    drawBlood(ctx, progress) {
      const t = progress;
      // 使用 easeOutCubic 实现由快到慢的速度曲线（快速喷出后减速）
      const easeOut = 1 - Math.pow(1 - t, 2.5);
      // 只要淡出（开始时完全不透明，结束时完全透明）
      const fadeOutAlpha = Math.max(0, Math.min(1, 1 - t * 1.1));

      ctx.save();
      ctx.shadowBlur = 3;
      ctx.shadowColor = "rgba(100, 0, 0, 0.4)";

      // ========== 第一层：大血滴粒子（主要喷溅，带重力下坠）==========
      const largeDropCount = 30; // 50
      for (let i = 0; i < largeDropCount; i++) {
        // 粒子角度（向四周扩散，主要向前上方和侧方）
        let angle;
        const angleBias = Math.random();
        if (angleBias < 0.5) {
          // 前方区域（-60度 到 60度），略向上
          angle = (Math.random() - 0.5) * Math.PI * 0.07 - 0.2;
        } else if (angleBias < 0.75) {
          // 两侧区域
          angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.4;
          if (Math.random() > 0.5) angle = -angle;
          angle -= 0.3; // 略微向下倾斜
        } else {
          // 后方少量溅射
          angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.5;
          angle += 0.2;
        }

        // 初始水平距离（由快到慢扩散）
        const horizontalDist = 4 + 15 * easeOut * (0.3 + Math.random() * 1);
        // 重力下坠效果：Y轴额外增加下坠偏移
        const gravityDrop = 38 * t * t * (0.5 + Math.random() * 0.8);

        const x = Math.cos(angle) * horizontalDist;
        let y = Math.sin(angle) * horizontalDist + gravityDrop;

        // 粒子大小（大血滴，越远越小）
        const size = 2.5 + Math.random() * 4.5 * (1 - horizontalDist / 80);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);

        // 鲜红色（不同深浅）
        const r = 190 + Math.random() * 65;
        const g = 15 + Math.random() * 35;
        const b = 10 + Math.random() * 25;

        const particleAlpha = fadeOutAlpha * (1 - horizontalDist / 85) * (0.5 + Math.random() * 0.5);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particleAlpha})`;
        ctx.fill();

        // 血滴高光
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 70, 50, ${particleAlpha * 0.6})`;
        ctx.fill();
      }

      // ========== 第二层：中血滴粒子（中等大小，受重力影响较大）==========
      const mediumDropCount = 80; // 80
      for (let i = 0; i < mediumDropCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // 水平方向随机
        const horizontalDist = 3 + 68 * easeOut * Math.random();
        // 重力下坠（中血滴下坠更明显）
        const gravityDrop = 12 * t * t * (0.3 + Math.random() * 1);

        const x = Math.cos(angle) * horizontalDist;
        const y = Math.sin(angle) * horizontalDist + gravityDrop + Math.abs(Math.sin(angle)) * 5 * t;

        const size = 1.5 + Math.random() * 3 * (1 - horizontalDist / 80);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);

        const r = 180 + Math.random() * 75;
        const g = 10 + Math.random() * 40;
        const b = 8 + Math.random() * 30;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.75 * fadeOutAlpha * (1 - horizontalDist / 85)})`;
        ctx.fill();
      }

      // ========== 第三层：血雾/血丝（细小颗粒，漂浮感）==========
      const mistCount = 130; // 130
      for (let i = 0; i < mistCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const horizontalDist = 2 + 70 * easeOut * Math.random();
        // 血雾受重力影响小，但也会缓慢下坠
        const gravityDrop = 4 * t * t * Math.random();

        const x = Math.cos(angle) * horizontalDist;
        const y = Math.sin(angle) * horizontalDist + gravityDrop;

        const size = 0.8 + Math.random() * 2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);

        const r = 175 + Math.random() * 80;
        const g = 8 + Math.random() * 30;
        const b = 5 + Math.random() * 25;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.55 * fadeOutAlpha * (1 - horizontalDist / 80)})`;
        ctx.fill();
      }

      // ========== 第四层：下坠血滴（专门表现重力下坠的重血滴）==========
      const fallingDropCount = 15;
      for (let i = 0; i < fallingDropCount; i++) {
        // 角度偏向下方向
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * Math.PI * 0.8;
        const horizontalDist = 2 + 5 * easeOut * Math.random();
        // 强重力下坠
        const gravityDrop = 108 * t * t * (0.6 + Math.random() * 0.8);

        const x = Math.cos(angle) * horizontalDist;
        const y = Math.sin(angle) * horizontalDist + gravityDrop + 3 * t;

        const size = 2 + Math.random() * 4;

        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.8, size * 1.2, 0, 0, Math.PI * 2);

        const r = 200 + Math.random() * 55;
        const g = 12 + Math.random() * 30;
        const b = 8 + Math.random() * 25;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.7 * fadeOutAlpha * (1 - horizontalDist / 75)})`;
        ctx.fill();
      }

      // ========== 第五层：血迹飞溅拖尾（轨迹线）==========
      const streakCount = 0;
      for (let i = 0; i < streakCount; i++) {
        let angle;
        if (Math.random() < 0.65) {
          angle = (Math.random() - 0.5) * Math.PI * 0.8 - 0.2;
        } else {
          angle = Math.random() * Math.PI * 2;
        }

        const horizontalDist = 3 + 60 * easeOut * Math.random();
        const streakLength = 4 + 14 * easeOut * Math.random();
        const gravityDrop = 76 * t * t * Math.random();

        const x = Math.cos(angle) * horizontalDist;
        const y = Math.sin(angle) * horizontalDist + gravityDrop;
        const tailX = Math.cos(angle) * Math.max(0, horizontalDist - streakLength);
        const tailY = Math.sin(angle) * Math.max(0, horizontalDist - streakLength) + gravityDrop * 0.7;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(180, 20, 15, ${0.5 * fadeOutAlpha * (1 - horizontalDist / 70)})`;
        ctx.lineWidth = 1.5 + Math.random() * 2.5;
        ctx.stroke();

        // 轨迹头部血滴
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + Math.random() * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 30, 20, ${0.65 * fadeOutAlpha * (1 - horizontalDist / 75)})`;
        ctx.fill();
      }

      // ========== 第六层：地面溅射血点（最下方）==========
      const groundSplashCount = 0;
      for (let i = 0; i < groundSplashCount; i++) {
        const angle = (Math.random() - 0.5) * Math.PI * 1.5;
        const horizontalDist = 5 + 60 * easeOut * Math.random();
        // 到达地面的血滴
        const yGround = 25 + Math.random() * 15;

        const x = Math.cos(angle) * horizontalDist;
        const y = yGround * t + Math.sin(angle) * horizontalDist * 0.3;

        if (y > 0) {
          ctx.beginPath();
          ctx.ellipse(x, y, 2 + Math.random() * 4, 1 + Math.random() * 2, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(170, 15, 10, ${0.5 * fadeOutAlpha * (1 - t)})`;
          ctx.fill();
        }
      }

      ctx.restore();
    },
    // 月牙特效: 发白光的月牙向上冲击，月牙下方伴有相同月牙形状的多重灰色残影，向下方扩散的粒子效果，速度由慢到快，只要淡出
    drawMoon(ctx, progress) {
      const t = progress;
      // 使用 easeInQuad 实现由慢到快的速度曲线
      const easeIn = t * t;
      // 只要淡出（开始时完全不透明，结束时完全透明）
      const fadeOutAlpha = Math.max(0, Math.min(1, 1 - t * 1.15));

      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(255, 255, 255, 0.1)";

      // 月牙向上移动的距离
      const upwardDistance = -15 - 70 * easeIn;

      // 第一层：下坠光尘（白色/淡蓝色）
      const dustCount = 60;
      for (let i = 0; i < dustCount; i++) {
        // 粒子水平位置（月牙下方区域）
        const x = (Math.random() - 0.5) * 70 * easeIn;
        // 粒子向下距离（随进度增加）
        const y = 15 + 55 * easeIn * Math.random();
        const size = 1.5 + Math.random() * 3 * (1 - y / 80);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);

        const isWhite = Math.random() > 0.6;
        if (isWhite) {
          ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * fadeOutAlpha * (1 - y / 80)})`;
        } else {
          ctx.fillStyle = `rgba(180, 200, 220, ${0.6 * fadeOutAlpha * (1 - y / 80)})`;
        }
        ctx.fill();
      }

      // 第二层：下坠拖尾粒子（带尾巴）
      const tailCount = 45;
      for (let i = 0; i < tailCount; i++) {
        const x = (Math.random() - 0.5) * 65 * easeIn;
        const y = 10 + 60 * easeIn * Math.random();
        const tailLength = 4 + 10 * easeIn * Math.random();

        const tailX = x;
        const tailY = y - tailLength;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 * fadeOutAlpha * (1 - y / 75)})`;
        ctx.lineWidth = 1.5 + Math.random() * 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 1.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * fadeOutAlpha * (1 - y / 75)})`;
        ctx.fill();
      }

      // 第三层：光晕粒子（较大，发光感）
      // const glowCount = 5;
      // for (let i = 0; i < glowCount; i++) {
      //   const x = (Math.random() - 0.5) * 55 * easeIn;
      //   const y = 20 + 50 * easeIn * Math.random();
      //   const size = 2 + Math.random() * 4;
      //
      //   ctx.beginPath();
      //   ctx.arc(x, y, size, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(220, 230, 255, ${0.5 * fadeOutAlpha * (1 - y / 70)})`;
      //   ctx.fill();
      //
      //   // 光晕外圈
      //   ctx.beginPath();
      //   ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(200, 210, 240, ${0.25 * fadeOutAlpha * (1 - y / 70)})`;
      //   ctx.fill();
      // }

      // 第四层：重力加速粒子（向下加速坠落）
      // const gravityCount = 20;
      // for (let i = 0; i < gravityCount; i++) {
      //   const x = (Math.random() - 0.5) * 60 * easeIn;
      //   // 重力加速效果：y随t的平方增长
      //   const y = 8 + 245 * easeIn * easeIn * Math.random();
      //   const size = 1 + Math.random() * 2.5;
      //
      //   ctx.beginPath();
      //   ctx.arc(x, y, size, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 250, 240, ${0.65 * fadeOutAlpha * (1 - y / 70)})`;
      //   ctx.fill();
      // }

      // 第五层：月牙尾部溅射粒子（从月牙底部向下喷出）
      // const splashCount = 10;
      // for (let i = 0; i < splashCount; i++) {
      //   // 粒子从月牙底部位置开始
      //   const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
      //   const distance = 5 + 50 * easeIn * Math.random();
      //   const x = Math.cos(angle) * distance * 0.8;
      //   const y = 8 + Math.sin(angle) * distance;
      //
      //   const size = 1.5 + Math.random() * 2.5;
      //
      //   ctx.beginPath();
      //   ctx.arc(x, y, size, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 245, 250, ${0.7 * fadeOutAlpha * (1 - y / 65)})`;
      //   ctx.fill();
      //
      //   // 溅射拖尾
      //   ctx.beginPath();
      //   ctx.moveTo(x, y);
      //   ctx.lineTo(x - Math.sin(angle) * 3, y + 4);
      //   ctx.strokeStyle = `rgba(200, 200, 220, ${0.45 * fadeOutAlpha * (1 - y / 65)})`;
      //   ctx.lineWidth = 1.2;
      //   ctx.stroke();
      // }

      ctx.restore();
    },
    // 光环
    drawHalo(ctx, progress) {
      const t = progress;
      // 亮度曲线：快速由暗变亮（前40%达到最亮），之后保持并随淡出衰减
      let brightness;
      if (t < 0.4) {
        // 由暗变亮（爆发）
        brightness = t / 0.4;
      } else {
        // 保持最亮，然后随淡出衰减
        const fadeStart = 0.4;
        const fadeEnd = 0.85;
        if (t < fadeEnd) {
          brightness = 1;
        } else {
          brightness = 1 - (t - fadeEnd) / (1 - fadeEnd);
        }
      }
      brightness = Math.min(1, Math.max(0, brightness));

      // 透明度：只淡出（前85%不透明，之后线性淡出）
      let alpha = 1;
      const fadeOutStart = 0.7;
      if (t > fadeOutStart) {
        alpha = 1 - (t - fadeOutStart) / (1 - fadeOutStart);
      }
      alpha = Math.min(1, Math.max(0, alpha));

      // 最终透明度 = 亮度系数 × 淡出系数
      const finalAlpha = brightness * alpha;

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(255, 255, 255, ${0.9 * finalAlpha})`;

      // 十字星爆半径（随进度扩大）
      const explosionRadius = 8 + 65 * t;

      // ========== 第四层：中心核心（最亮） ==========
      ctx.beginPath();
      ctx.arc(0, 0, 9 + 6 * t, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.99 * finalAlpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 4.5 + 3 * t, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, 1)`;
      ctx.fill();

      // ========== 第五层：星爆射线（8条主射线 + 8条次射线） ==========
      // 主射线
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rayLength = 28 + 42 * t;
        const rayEndX = Math.cos(angle) * rayLength;
        const rayEndY = Math.sin(angle) * rayLength;

        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 7, Math.sin(angle) * 7);
        ctx.lineTo(rayEndX, rayEndY);
        ctx.strokeStyle = `rgba(255, 255, 230, ${0.7 * finalAlpha * (1 - t * 0.4)})`;
        ctx.lineWidth = 2.2 + Math.sin(angle * 4) * 0.8;
        ctx.stroke();
      }

      // 次射线（45度夹角）
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const rayLength = 20 + 32 * t;
        const rayEndX = Math.cos(angle) * rayLength;
        const rayEndY = Math.sin(angle) * rayLength;

        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 5, Math.sin(angle) * 5);
        ctx.lineTo(rayEndX, rayEndY);
        ctx.strokeStyle = `rgba(255, 245, 200, ${0.5 * finalAlpha * (1 - t * 0.5)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ========== 第六层：爆炸粒子（向四周扩散） ==========
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + 70 * t * Math.random();
        const size = 1.5 + Math.random() * 3 * (1 - distance / 85);

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 210, ${0.65 * finalAlpha * (1 - distance / 85)})`;
        ctx.fill();
      }

      // ========== 第七层：拖尾粒子（射线尾部粒子） ==========
      const tailCount = 40;
      for (let i = 0; i < tailCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 12 + 68 * t * Math.random();
        const tailLength = 6 + 14 * t * Math.random();

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const tailX = Math.cos(angle) * Math.max(0, distance - tailLength);
        const tailY = Math.sin(angle) * Math.max(0, distance - tailLength);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(255, 242, 190, ${0.5 * finalAlpha * (1 - distance / 80)})`;
        ctx.lineWidth = 1.5 + Math.random() * 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 1.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 230, ${0.6 * finalAlpha * (1 - distance / 80)})`;
        ctx.fill();
      }

      // ========== 第八层：冲击波光环 ==========
      for (let wave = 0; wave < 2; wave++) {
        const waveDelay = wave * 0.12;
        const waveProgress = Math.max(0, Math.min(1, (t - waveDelay) / (1 - waveDelay)));
        if (waveProgress > 0 && waveProgress < 0.95) {
          const waveRadius = 12 + 80 * waveProgress;
          ctx.beginPath();
          ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 230, 170, ${0.4 * finalAlpha * (1 - waveProgress)})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // 光环上的粒子
          for (let p = 0; p < 16; p++) {
            const ringAngle = (p / 16) * Math.PI * 2 + t * 15;
            const x = Math.cos(ringAngle) * waveRadius;
            const y = Math.sin(ringAngle) * waveRadius;
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 235, 180, ${0.5 * finalAlpha * (1 - waveProgress)})`;
            ctx.fill();
          }
        }
      }

      ctx.restore();
    },
    // 十字特效: 只要淡出不要淡入
    drawCross(ctx, progress) {
      const t = progress;

      // 透明度：只淡出（前70%不透明，之后线性淡出）
      let alpha = 1;
      const fadeOutStart = 0.65;
      if (t > fadeOutStart) {
        alpha = 1 - (t - fadeOutStart) / (1 - fadeOutStart);
      }
      alpha = Math.min(1, Math.max(0, alpha));

      // 弧线扩展进度（弧线从无到有，然后保持）
      let arcProgress;
      if (t < 0.3) {
        // 前30%快速画出弧线
        arcProgress = t / 0.3;
      } else {
        // 之后保持完整弧线，随淡出衰减
        arcProgress = 1;
      }
      arcProgress = Math.min(1, Math.max(0, arcProgress));

      // 亮度系数（弧线保持高亮，淡出时衰减）
      let brightness = 1;
      if (t > fadeOutStart) {
        brightness = 1 - (t - fadeOutStart) / (1 - fadeOutStart) * 0.5;
      }
      brightness = Math.min(1, Math.max(0.3, brightness));

      const finalAlpha = alpha * brightness;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(255, 255, 255, ${0.9 * finalAlpha})`;

      // 弧线参数
      const radius = 35;
      const startAngle = -Math.PI * 0.4;  // -144度
      const endAngle = Math.PI * 0.4;      // 144度
      const totalAngle = endAngle - startAngle;
      const currentEndAngle = startAngle + totalAngle * arcProgress;

      // ========== 第一层：主弧线（最亮） ==========
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, currentEndAngle);
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(255, 0, 0, ${0.98 * finalAlpha})`;
      ctx.stroke();

      // ========== 第二层：弧线内层高亮 ==========
      ctx.beginPath();
      ctx.arc(0, 0, radius - 2, startAngle, currentEndAngle);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = `rgba(255, 0, 0, ${0.92 * finalAlpha})`;
      ctx.stroke();

      // ========== 第三层：弧线外发光晕 ==========
      ctx.beginPath();
      ctx.arc(0, 0, radius + 3, startAngle, currentEndAngle);
      ctx.lineWidth = 6;
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.45 * finalAlpha})`;
      ctx.stroke();

      // ========== 第四层：弧线端点光球（起点和当前终点） ==========
      // 起点光球
      // const startX = Math.cos(startAngle) * radius;
      // const startY = Math.sin(startAngle) * radius;
      // ctx.beginPath();
      // ctx.arc(startX, startY, 6, 0, Math.PI * 2);
      // ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * finalAlpha})`;
      // ctx.fill();
      // ctx.beginPath();
      // ctx.arc(startX, startY, 3, 0, Math.PI * 2);
      // ctx.fillStyle = `rgba(255, 255, 255, 1)`;
      // ctx.fill();
      //
      // // 当前终点光球（随弧线扩展而移动）
      // if (arcProgress > 0.05) {
      //   const endX = Math.cos(currentEndAngle) * radius;
      //   const endY = Math.sin(currentEndAngle) * radius;
      //   ctx.beginPath();
      //   ctx.arc(endX, endY, 6, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * finalAlpha})`;
      //   ctx.fill();
      //   ctx.beginPath();
      //   ctx.arc(endX, endY, 3, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 255, 255, 1)`;
      //   ctx.fill();
      //
      //   // 终点拖尾光晕
      //   ctx.beginPath();
      //   ctx.arc(endX, endY, 10, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 255, 220, ${0.3 * finalAlpha})`;
      //   ctx.fill();
      // }
      //
      // ========== 第五层：弧线轨迹粒子（沿弧线分布） ==========
      const particleCount = Math.floor(20 * arcProgress);
      for (let i = 0; i < particleCount; i++) {
        const angleProgress = i / Math.max(1, particleCount);
        const angle = startAngle + totalAngle * angleProgress * arcProgress;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const size = 2 + Math.sin(angle * 8) * 1;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * finalAlpha * (1 - angleProgress * 0.3)})`;
        ctx.fill();
      }
      //
      // ========== 第六层：弧线内侧光晕粒子 ==========
      const innerParticleCount = 25;
      for (let i = 0; i < innerParticleCount; i++) {
        const angle = startAngle + Math.random() * totalAngle * arcProgress;
        const radiusOffset = radius - 8 - Math.random() * 12;
        const x = Math.cos(angle) * radiusOffset;
        const y = Math.sin(angle) * radiusOffset;
        const size = 1.5 + Math.random() * 2.5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * finalAlpha * (1 - Math.random() * 0.5)})`;
        ctx.fill();
      }

      // ========== 第七层：弧线外侧散逸粒子 ==========
      const outerParticleCount = 20;
      for (let i = 0; i < outerParticleCount; i++) {
        const angle = startAngle + Math.random() * totalAngle * arcProgress;
        const radiusOffset = radius + 5 + Math.random() * 15;
        const x = Math.cos(angle) * radiusOffset;
        const y = Math.sin(angle) * radiusOffset;
        const size = 1 + Math.random() * 2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 0, 0, ${0.35 * finalAlpha * (1 - Math.random() * 0.6)})`;
        ctx.fill();
      }

      // ========== 第八层：弧线中间飘浮光尘 ==========
      // const dustCount = 30;
      // for (let i = 0; i < dustCount; i++) {
      //   // 分布在弧线内侧区域
      //   const angle = startAngle + Math.random() * totalAngle * arcProgress;
      //   const radiusOffset = radius - 15 + Math.random() * 25;
      //   const x = Math.cos(angle) * radiusOffset;
      //   const y = Math.sin(angle) * radiusOffset;
      //   const size = 0.8 + Math.random() * 1.8;
      //
      //   ctx.beginPath();
      //   ctx.arc(x, y, size, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 245, 210, ${0.4 * finalAlpha * (1 - Math.random() * 0.7)})`;
      //   ctx.fill();
      // }
      //
      // // ========== 第九层：弧线动态流动粒子（沿弧线移动） ==========
      // const flowParticleCount = 8;
      // for (let i = 0; i < flowParticleCount; i++) {
      //   // 粒子位置随进度移动
      //   const flowOffset = (t * 2 + i / flowParticleCount) % 1;
      //   const angle = startAngle + totalAngle * flowOffset * arcProgress;
      //   const x = Math.cos(angle) * radius;
      //   const y = Math.sin(angle) * radius;
      //   const size = 2.5 + Math.sin(t * 20 + i) * 1;
      //
      //   ctx.beginPath();
      //   ctx.arc(x, y, size, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * finalAlpha})`;
      //   ctx.fill();
      //
      //   // 流动粒子拖尾
      //   ctx.beginPath();
      //   ctx.arc(x - Math.cos(angle) * 4, y - Math.sin(angle) * 4, size * 0.6, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 255, 220, ${0.5 * finalAlpha})`;
      //   ctx.fill();
      // }

      // ========== 第十层：弧线中心区域光晕 ==========
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 230, ${0.2 * finalAlpha})`;
      ctx.fill();

      ctx.restore();
    },
    // 黑暗
    drawDark(ctx, progress) {
      const t = progress;

      // 透明度：只淡出（前70%不透明，之后线性淡出）
      let alpha = 1;
      const fadeOutStart = 0.65;
      if (t > fadeOutStart) {
        alpha = 1 - (t - fadeOutStart) / (1 - fadeOutStart);
      }
      alpha = Math.min(1, Math.max(0, alpha));

      // 弧线扩展进度（弧线从无到有，然后保持）
      let arcProgress;
      if (t < 0.3) {
        // 前30%快速画出弧线
        arcProgress = t / 0.3;
      } else {
        // 之后保持完整弧线，随淡出衰减
        arcProgress = 1;
      }
      arcProgress = Math.min(1, Math.max(0, arcProgress));

      // 亮度系数（弧线保持高亮，淡出时衰减）
      let brightness = 1;
      if (t > fadeOutStart) {
        brightness = 1 - (t - fadeOutStart) / (1 - fadeOutStart) * 0.5;
      }
      brightness = Math.min(1, Math.max(0.3, brightness));

      const finalAlpha = alpha * brightness;

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(0, 0, 0, ${0.9 * finalAlpha})`;

      // 弧线参数
      const radius = 35;
      const startAngle = -Math.PI * 2;  // -144度
      const endAngle = Math.PI * 2;      // 144度
      const totalAngle = endAngle - startAngle;
      const currentEndAngle = startAngle + totalAngle * arcProgress;

      // ========== 第一层：主弧线（最亮） ==========
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, currentEndAngle);
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.98 * finalAlpha})`;
      ctx.stroke();

      // ========== 第二层：弧线内层高亮 ==========
      ctx.beginPath();
      ctx.arc(0, 0, radius - 2, startAngle, currentEndAngle);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.92 * finalAlpha})`;
      ctx.stroke();

      // ========== 第三层：弧线外发光晕 ==========
      // ctx.beginPath();
      // ctx.arc(0, 0, radius + 3, startAngle, currentEndAngle);
      // ctx.lineWidth = 6;
      // ctx.strokeStyle = `rgba(0, 0, 0, ${0.45 * finalAlpha})`;
      // ctx.stroke();

      // ========== 第四层：弧线端点光球（起点和当前终点） ==========
      // 起点光球
      const startX = Math.cos(startAngle) * radius;
      const startY = Math.sin(startAngle) * radius;
      ctx.beginPath();
      ctx.arc(startX, startY, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * finalAlpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(startX, startY, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, 1)`;
      ctx.fill();

      // 当前终点光球（随弧线扩展而移动）
      if (arcProgress > 0.05) {
        const endX = Math.cos(currentEndAngle) * radius;
        const endY = Math.sin(currentEndAngle) * radius;
        ctx.beginPath();
        ctx.arc(endX, endY, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * finalAlpha})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, 1)`;
        ctx.fill();

        // 终点拖尾光晕
        ctx.beginPath();
        ctx.arc(endX, endY, 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * finalAlpha})`;
        ctx.fill();
      }
      //
      // ========== 第五层：弧线轨迹粒子（沿弧线分布） ==========
      const particleCount = Math.floor(20 * arcProgress);
      for (let i = 0; i < particleCount; i++) {
        const angleProgress = i / Math.max(1, particleCount);
        const angle = startAngle + totalAngle * angleProgress * arcProgress;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const size = 2 + Math.sin(angle * 8) * 1;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 0, 100, ${0.6 * finalAlpha * (1 - angleProgress * 0.3)})`;
        ctx.fill();
      }
      //
      // ========== 第六层：弧线内侧光晕粒子 ==========
      const innerParticleCount = 125;
      for (let i = 0; i < innerParticleCount; i++) {
        const angle = startAngle + Math.random() * totalAngle * arcProgress;
        const radiusOffset = radius - 8 - Math.random() * 12;
        const x = Math.cos(angle) * radiusOffset;
        const y = Math.sin(angle) * radiusOffset;
        const size = 1.5 + Math.random() * 2.5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(40, 0, 30, ${0.45 * finalAlpha * (1 - Math.random() * 0.5)})`;
        ctx.fill();
      }

      // ========== 第七层：弧线外侧散逸粒子 ==========
      const outerParticleCount = 20;
      for (let i = 0; i < outerParticleCount; i++) {
        const angle = startAngle + Math.random() * totalAngle * arcProgress;
        const radiusOffset = radius + 5 + Math.random() * 15;
        const x = Math.cos(angle) * radiusOffset;
        const y = Math.sin(angle) * radiusOffset;
        const size = 1 + Math.random() * 2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 0, 0, ${0.35 * finalAlpha * (1 - Math.random() * 0.6)})`;
        ctx.fill();
      }

      // ========== 第八层：弧线中间飘浮光尘 ==========
      // const dustCount = 30;
      // for (let i = 0; i < dustCount; i++) {
      //   // 分布在弧线内侧区域
      //   const angle = startAngle + Math.random() * totalAngle * arcProgress;
      //   const radiusOffset = radius - 15 + Math.random() * 25;
      //   const x = Math.cos(angle) * radiusOffset;
      //   const y = Math.sin(angle) * radiusOffset;
      //   const size = 0.8 + Math.random() * 1.8;
      //
      //   ctx.beginPath();
      //   ctx.arc(x, y, size, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 245, 210, ${0.4 * finalAlpha * (1 - Math.random() * 0.7)})`;
      //   ctx.fill();
      // }
      //
      // // ========== 第九层：弧线动态流动粒子（沿弧线移动） ==========
      // const flowParticleCount = 8;
      // for (let i = 0; i < flowParticleCount; i++) {
      //   // 粒子位置随进度移动
      //   const flowOffset = (t * 2 + i / flowParticleCount) % 1;
      //   const angle = startAngle + totalAngle * flowOffset * arcProgress;
      //   const x = Math.cos(angle) * radius;
      //   const y = Math.sin(angle) * radius;
      //   const size = 2.5 + Math.sin(t * 20 + i) * 1;
      //
      //   ctx.beginPath();
      //   ctx.arc(x, y, size, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * finalAlpha})`;
      //   ctx.fill();
      //
      //   // 流动粒子拖尾
      //   ctx.beginPath();
      //   ctx.arc(x - Math.cos(angle) * 4, y - Math.sin(angle) * 4, size * 0.6, 0, Math.PI * 2);
      //   ctx.fillStyle = `rgba(255, 255, 220, ${0.5 * finalAlpha})`;
      //   ctx.fill();
      // }

      // ========== 第十层：弧线中心区域光晕 ==========
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 0, 0, ${0.2 * finalAlpha})`;
      ctx.fill();

      ctx.restore();
    },
    // 雷霆
    // 闪电特效: 一道发光的叉状白色闪电，只要淡出不要淡入
    drawLightning(ctx, progress) {
      const t = progress;

      // 透明度：只淡出（前50%完全不透明，之后线性淡出）
      let alpha = 1;
      const fadeOutStart = 0.45;
      if (t > fadeOutStart) {
        alpha = 1 - (t - fadeOutStart) / (1 - fadeOutStart);
      }
      alpha = Math.min(1, Math.max(0, alpha));

      // 闪电绘制进度（前30%快速画出闪电）
      let drawProgress;
      if (t < 0.3) {
        drawProgress = t / 0.3;
      } else {
        drawProgress = 1;
      }
      drawProgress = Math.min(1, Math.max(0, drawProgress));

      // 闪烁强度（闪电特有的抖动效果）
      const flicker = 0.7 + Math.sin(t * 50) * 0.3;

      // 亮度系数（闪电保持高亮，淡出时衰减）
      let brightness = 1;
      if (t > fadeOutStart) {
        brightness = 1 - (t - fadeOutStart) / (1 - fadeOutStart) * 0.4;
      }
      brightness = Math.min(1, Math.max(0.4, brightness)) * flicker;

      const finalAlpha = alpha * brightness;

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(200, 220, 255, ${0.9 * finalAlpha})`;

      // 闪电起点和终点（默认从上到下）
      const startX = 0;
      const startY = -55;
      const endX = 0;
      const endY = 55;

      // ========== 主闪电（最亮的主干） ==========
      // 生成主闪电路径（带锯齿效果）
      const mainPoints = this.generateLightningPoints(startX, startY, endX, endY, 12, 12 * (1 - drawProgress * 0.3));

      ctx.beginPath();
      ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
      for (let i = 1; i < mainPoints.length; i++) {
        ctx.lineTo(mainPoints[i].x, mainPoints[i].y);
      }
      ctx.lineWidth = 5;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.98 * finalAlpha})`;
      ctx.stroke();

      // 主闪电内层高亮
      ctx.beginPath();
      ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
      for (let i = 1; i < mainPoints.length; i++) {
        ctx.lineTo(mainPoints[i].x, mainPoints[i].y);
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * finalAlpha})`;
      ctx.stroke();

      // ========== 第一分支（左侧分支） ==========
      // const branch1Start = mainPoints[Math.floor(mainPoints.length * 0.4)];
      // const branch1End = {
      //   x: branch1Start.x - 35 - Math.random() * 10,
      //   y: branch1Start.y + 15
      // };
      // const branch1Points = this.generateLightningPoints(branch1Start.x, branch1Start.y, branch1End.x, branch1End.y, 6, 8 * (1 - drawProgress * 0.3));
      //
      // ctx.beginPath();
      // ctx.moveTo(branch1Points[0].x, branch1Points[0].y);
      // for (let i = 1; i < branch1Points.length; i++) {
      //   ctx.lineTo(branch1Points[i].x, branch1Points[i].y);
      // }
      // ctx.lineWidth = 3;
      // ctx.strokeStyle = `rgba(220, 230, 255, ${0.8 * finalAlpha})`;
      // ctx.stroke();

      // ========== 第二分支（右侧分支） ==========
      // const branch2Start = mainPoints[Math.floor(mainPoints.length * 0.6)];
      // const branch2End = {
      //   x: branch2Start.x + 30 + Math.random() * 10,
      //   y: branch2Start.y + 20
      // };
      // const branch2Points = this.generateLightningPoints(branch2Start.x, branch2Start.y, branch2End.x, branch2End.y, 6, 8 * (1 - drawProgress * 0.3));
      //
      // ctx.beginPath();
      // ctx.moveTo(branch2Points[0].x, branch2Points[0].y);
      // for (let i = 1; i < branch2Points.length; i++) {
      //   ctx.lineTo(branch2Points[i].x, branch2Points[i].y);
      // }
      // ctx.lineWidth = 3;
      // ctx.strokeStyle = `rgba(220, 230, 255, ${0.8 * finalAlpha})`;
      // ctx.stroke();
      //
      // // ========== 第三分支（左侧小分支，从分支1分出） ==========
      // if (branch1Points.length > 3) {
      //   const subBranchStart = branch1Points[Math.floor(branch1Points.length * 0.6)];
      //   const subBranchEnd = {
      //     x: subBranchStart.x - 20 - Math.random() * 8,
      //     y: subBranchStart.y + 10
      //   };
      //   const subBranchPoints = this.generateLightningPoints(subBranchStart.x, subBranchStart.y, subBranchEnd.x, subBranchEnd.y, 4, 6);
      //
      //   ctx.beginPath();
      //   ctx.moveTo(subBranchPoints[0].x, subBranchPoints[0].y);
      //   for (let i = 1; i < subBranchPoints.length; i++) {
      //     ctx.lineTo(subBranchPoints[i].x, subBranchPoints[i].y);
      //   }
      //   ctx.lineWidth = 2;
      //   ctx.strokeStyle = `rgba(200, 210, 240, ${0.65 * finalAlpha})`;
      //   ctx.stroke();
      // }
      //
      // // ========== 第四分支（右侧小分支，从分支2分出） ==========
      // if (branch2Points.length > 3) {
      //   const subBranchStart = branch2Points[Math.floor(branch2Points.length * 0.5)];
      //   const subBranchEnd = {
      //     x: subBranchStart.x + 18 + Math.random() * 8,
      //     y: subBranchStart.y + 8
      //   };
      //   const subBranchPoints = this.generateLightningPoints(subBranchStart.x, subBranchStart.y, subBranchEnd.x, subBranchEnd.y, 4, 6);
      //
      //   ctx.beginPath();
      //   ctx.moveTo(subBranchPoints[0].x, subBranchPoints[0].y);
      //   for (let i = 1; i < subBranchPoints.length; i++) {
      //     ctx.lineTo(subBranchPoints[i].x, subBranchPoints[i].y);
      //   }
      //   ctx.lineWidth = 2;
      //   ctx.strokeStyle = `rgba(200, 210, 240, ${0.65 * finalAlpha})`;
      //   ctx.stroke();
      // }

      // ========== 闪电外发光层 ==========
      ctx.beginPath();
      ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
      for (let i = 1; i < mainPoints.length; i++) {
        ctx.lineTo(mainPoints[i].x, mainPoints[i].y);
      }
      ctx.lineWidth = 10;
      ctx.strokeStyle = `rgba(150, 180, 255, ${0.35 * finalAlpha})`;
      ctx.stroke();

      // ========== 闪电节点光球（在每个转折点添加光晕） ==========
      for (let i = 1; i < mainPoints.length - 1; i++) {
        const point = mainPoints[i];
        const size = 2.5 + Math.sin(t * 30 + i) * 1.5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * finalAlpha * (1 - i / mainPoints.length * 0.5)})`;
        ctx.fill();

        // 光晕
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${0.4 * finalAlpha * (1 - i / mainPoints.length * 0.5)})`;
        ctx.fill();
      }

      // ========== 闪电起点光球 ==========
      ctx.beginPath();
      ctx.arc(startX, startY, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * finalAlpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(startX, startY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, 1)`;
      ctx.fill();

      // ========== 闪电终点光球 ==========
      ctx.beginPath();
      ctx.arc(endX, endY, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * finalAlpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(endX, endY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, 1)`;
      ctx.fill();

      // ========== 闪电周围电弧粒子 ==========
      const particleCount = 35;
      for (let i = 0; i < particleCount; i++) {
        // 沿着主闪电路径分布粒子
        const segmentIndex = Math.floor(Math.random() * (mainPoints.length - 1));
        const pointA = mainPoints[segmentIndex];
        const pointB = mainPoints[segmentIndex + 1];
        const lerp = Math.random();
        const x = pointA.x + (pointB.x - pointA.x) * lerp;
        const y = pointA.y + (pointB.y - pointA.y) * lerp;

        // 垂直偏移
        const angle = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
        const perpX = -Math.sin(angle) * (Math.random() - 0.5) * 12;
        const perpY = Math.cos(angle) * (Math.random() - 0.5) * 12;

        const particleX = x + perpX;
        const particleY = y + perpY;
        const size = 1.5 + Math.random() * 3;

        ctx.beginPath();
        ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${0.6 * finalAlpha * (1 - Math.random() * 0.5)})`;
        ctx.fill();
      }

      // ========== 散逸电火花（细小粒子） ==========
      const sparkCount = 50;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 40 * (1 - t * 0.5);
        const x = endX + Math.cos(angle) * distance * drawProgress;
        const y = endY + Math.sin(angle) * distance * drawProgress;
        const size = 0.8 + Math.random() * 2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 240, ${0.45 * finalAlpha * (1 - distance / 50)})`;
        ctx.fill();
      }

      // ========== 闪电能量冲击波（向外扩散） ==========
      // const waveRadius = 15 + 35 * t;
      const waveRadius = 0;
      ctx.beginPath();
      ctx.arc(endX, endY, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 210, 255, ${0.5 * finalAlpha * (1 - t)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(endX, endY, waveRadius * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(220, 230, 255, ${0.7 * finalAlpha * (1 - t)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    },

    // 辅助函数：生成闪电路径点（带锯齿效果）
    generateLightningPoints(startX, startY, endX, endY, segments, offset) {
      const points = [{ x: startX, y: startY }];
      const dx = endX - startX;
      const dy = endY - startY;

      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        // 基础位置
        let x = startX + dx * t;
        let y = startY + dy * t;

        // 添加随机偏移（越靠近中间偏移越大）
        const midFactor = Math.sin(t * Math.PI);
        const xOffset = (Math.random() - 0.5) * offset * midFactor;
        const yOffset = (Math.random() - 0.5) * offset * midFactor;

        x += xOffset;
        y += yOffset;

        points.push({ x, y });
      }

      points.push({ x: endX, y: endY });
      return points;
    },
  },
};
</script>

<style scoped>
.battle-effect-canvas {
    width: 100%;
    height: 100%;
    display: block;
}
</style>
