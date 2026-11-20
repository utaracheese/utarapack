// ========================================================
// GIAO DIỆN MÙA ĐÔNG ẤM ÁP (COZY WARM WINTER) - UTARA
// Tối ưu hiệu năng: Offscreen Sprite Cache & GPU Compositing
// ========================================================

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  let emberCanvas, emberCtx;
  let emberWidth = 0;
  let emberHeight = 0;
  let embers = [];
  let emberAnimId = null;

  // Sprite vẽ sẵn giúp tránh shadowBlur mỗi frame (tăng FPS mạnh)
  let warmEmberSprite = null;
  let warmBokehSprite = null;

  document.addEventListener('DOMContentLoaded', () => {
    // Dọn dẹp key theme cũ nếu còn trong trình duyệt
    try {
      localStorage.removeItem('utara_current_theme');
    } catch (_) {}

    createFairyLights();

    if (!prefersReducedMotion) {
      createSprites();
      setupEmbersCanvas();
      startEmbersLoop();
      window.addEventListener('pointerdown', handleCozyClickSpark, { passive: true });
    }
  });

  // --------------------------------------------------------
  // 1. DÂY ĐÈN VÀNG ẤM MÙA ĐÔNG Ở MÉP TRÊN
  // --------------------------------------------------------
  function createFairyLights() {
    if (document.getElementById('cozyFairyLights')) return;
    const bar = document.createElement('div');
    bar.id = 'cozyFairyLights';
    bar.className = 'cozy-fairy-lights';
    bar.setAttribute('aria-hidden', 'true');

    const count = isMobile ? 9 : 16;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const bulb = document.createElement('span');
      bulb.className = 'fairy-bulb';
      bulb.style.animationDelay = `${(i * 0.37) % 2.8}s`;
      bulb.style.animationDuration = `${2.4 + (i % 3) * 0.65}s`;
      fragment.appendChild(bulb);
    }

    bar.appendChild(fragment);
    document.body.appendChild(bar);
  }

  // --------------------------------------------------------
  // 2. HIỆU ỨNG ĐỐM LỬA ẤM & BOKEH BAY LÊN (OFFSCREEN SPRITE)
  // --------------------------------------------------------
  function createRadialSprite(size, innerColor, midColor, outerColor) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const half = size / 2;
    const grad = g.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.4, midColor);
    grad.addColorStop(1, outerColor);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
  }

  function createSprites() {
    warmEmberSprite = createRadialSprite(
      32,
      'rgba(255, 244, 214, 1)',
      'rgba(251, 146, 60, 0.55)',
      'rgba(234, 88, 12, 0)'
    );
    warmBokehSprite = createRadialSprite(
      64,
      'rgba(253, 224, 138, 0.45)',
      'rgba(245, 158, 11, 0.14)',
      'rgba(245, 158, 11, 0)'
    );
  }

  function spawnEmber(randomY = false) {
    const isBokeh = Math.random() < 0.28;
    return {
      x: Math.random() * emberWidth,
      y: randomY ? Math.random() * emberHeight : emberHeight + 20 + Math.random() * 40,
      size: isBokeh ? (Math.random() * 26 + 18) : (Math.random() * 10 + 6),
      speedY: isBokeh ? (Math.random() * 0.28 + 0.16) : (Math.random() * 0.55 + 0.3),
      driftPhase: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.02 + 0.01,
      driftAmp: isBokeh ? 0.25 : 0.45,
      alpha: Math.random() * 0.45 + 0.25,
      isBokeh
    };
  }

  function setupEmbersCanvas() {
    emberCanvas = document.createElement('canvas');
    emberCanvas.id = 'cozy-embers-canvas';
    emberCanvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    document.body.appendChild(emberCanvas);
    emberCtx = emberCanvas.getContext('2d');

    const resize = () => {
      emberWidth = emberCanvas.width = window.innerWidth;
      emberHeight = emberCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const emberCount = isMobile ? 12 : 22;
    embers = Array.from({ length: emberCount }, () => spawnEmber(true));
  }

  function startEmbersLoop() {
    if (emberAnimId) return;

    function loop() {
      if (!document.hidden && !document.body.classList.contains('skybox-open')) {
        emberCtx.clearRect(0, 0, emberWidth, emberHeight);

        for (let i = 0; i < embers.length; i++) {
          const p = embers[i];
          p.y -= p.speedY;
          p.driftPhase += p.driftSpeed;
          p.x += Math.sin(p.driftPhase) * p.driftAmp;

          // Mờ dần khi gần lên tới đỉnh
          const fadeOut = p.y < emberHeight * 0.22 ? Math.max(0, p.y / (emberHeight * 0.22)) : 1;
          const fadeIn = p.y > emberHeight * 0.9 ? Math.max(0, (emberHeight - p.y) / (emberHeight * 0.1)) : 1;
          const finalAlpha = p.alpha * fadeOut * fadeIn;

          if (finalAlpha > 0.01) {
            emberCtx.globalAlpha = finalAlpha;
            const sprite = p.isBokeh ? warmBokehSprite : warmEmberSprite;
            emberCtx.drawImage(sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          }

          if (p.y < -35) {
            embers[i] = spawnEmber(false);
          }
        }
        emberCtx.globalAlpha = 1;
      }

      emberAnimId = requestAnimationFrame(loop);
    }

    emberAnimId = requestAnimationFrame(loop);
  }

  // --------------------------------------------------------
  // 3. HIỆU ỨNG CLICK TIA LỬA ẤM ÁP
  // --------------------------------------------------------
  let activeRipples = 0;

  function handleCozyClickSpark(e) {
    if (document.body.classList.contains('skybox-open')) return;
    if (activeRipples > 6) return;

    activeRipples++;
    const ripple = document.createElement('div');
    ripple.className = 'cozy-click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
      activeRipples = Math.max(0, activeRipples - 1);
    }, { once: true });

    // 4 tia lửa nhỏ bay tỏa nhẹ
    for (let i = 0; i < 4; i++) {
      const spark = document.createElement('span');
      spark.className = 'cozy-click-spark';
      const angle = (Math.PI / 2) * i + (Math.random() * 0.8 - 0.4);
      const dist = 18 + Math.random() * 18;
      spark.style.left = `${e.clientX}px`;
      spark.style.top = `${e.clientY}px`;
      spark.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      spark.style.setProperty('--ty', `${Math.sin(angle) * dist - 8}px`);
      document.body.appendChild(spark);

      spark.addEventListener('animationend', () => spark.remove(), { once: true });
    }
  }
})();