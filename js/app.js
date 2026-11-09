/* =====================================================================
   百年广大 · 时光漫游 —— 交互逻辑
   ===================================================================== */
'use strict';
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  /* ================================================================
     1. 加载页
  ================================================================= */
  function initLoader() {
    const loader = $('#loader'), fill = $('#loader-fill'), tip = $('#loader-tip');
    const tips = ['正在唤醒百年时光…', '翻阅泛黄的校史书页…', '点亮校园的地标光点…', '调校时光的琴弦…'];
    let p = 0, i = 0;
    const tipTimer = setInterval(() => {
      i = (i + 1) % tips.length;
      tip.textContent = tips[i];
    }, 600);
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        clearInterval(tipTimer);
        setTimeout(() => {
          loader.classList.add('hide');
          document.body.classList.add('ready');
        }, 350);
      }
      fill.style.width = p + '%';
    }, 140);
    // 兜底：即使动画异常，3.5 秒后也进入页面
    setTimeout(() => {
      loader.classList.add('hide');
      document.body.classList.add('ready');
    }, 3500);
  }

  /* ================================================================
     2. 粒子背景画布
  ================================================================= */
  function initParticles() {
    const cv = $('#bg'), ctx = cv.getContext('2d');
    let W, H, raf;
    const mouse = { x: 0, y: 0 };
    const COLORS = ['217,179,108', '74,134,216', '243,217,164'];
    const parts = [];

    function resize() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    }
    function make() {
      parts.length = 0;
      const n = Math.min(110, Math.floor((W * H) / 16000));
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.8 + 0.4,
          c: COLORS[(Math.random() * COLORS.length) | 0],
          a: Math.random() * 0.5 + 0.15,
          tw: Math.random() * Math.PI * 2
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const linkDist = 130;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.tw += 0.02;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        const ox = (p.x - W / 2) * 0.02 + (mouse.x - W / 2) * 0.04;
        const oy = (p.y - H / 2) * 0.02 + (mouse.y - H / 2) * 0.04;
        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.c + ',' + (p.a + Math.sin(p.tw) * 0.15) + ')';
        ctx.fill();
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(p.x + ox, p.y + oy);
            ctx.lineTo(q.x + ox, q.y + oy);
            ctx.strokeStyle = 'rgba(217,179,108,' + (0.10 * (1 - d / linkDist)) + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    window.addEventListener('resize', () => { resize(); make(); });
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    resize(); make(); draw();
  }

  /* ================================================================
     3. 导航 / 滚动进度 / 章节指示点
  ================================================================= */
  function initNav() {
    const nav = $('#nav'), progress = $('#nav-progress');
    const links = $$('#nav-links a');
    const sections = ['hero', 'timeline', 'campus', 'sound', 'data', 'game', 'ai'];
    const dotsWrap = $('#dots');

    sections.forEach((id) => {
      const d = document.createElement('i');
      d.title = id;
      d.addEventListener('click', () => document.getElementById(id).scrollIntoView({ behavior: 'smooth' }));
      dotsWrap.appendChild(d);
    });
    const dots = $$('#dots i');

    function onScroll() {
      const st = window.scrollY;
      nav.classList.toggle('scrolled', st > 40);
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      progress.style.width = (total > 0 ? (st / total) * 100 : 0) + '%';

      // 高亮当前章节
      let active = 0;
      sections.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop - window.innerHeight * 0.4 <= st) active = i;
      });
      links.forEach((a, i) => a.classList.toggle('active', i === active));
      dots.forEach((d, i) => d.classList.toggle('active', i === active));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 移动端菜单
    const btn = $('#menu-btn'), linksBox = $('#nav-links');
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      linksBox.classList.toggle('open');
    });
    links.forEach((a) => a.addEventListener('click', () => {
      btn.classList.remove('open');
      linksBox.classList.remove('open');
    }));
  }

  /* ================================================================
     4. 视口揭示动画
  ================================================================= */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));

    // 时间轴项：章节进入视口后错落揭示（保证横向滚动时全部可见）
    const tl = document.getElementById('timeline');
    if (tl) {
      const tio = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            tio.disconnect();
            $$('#tl-track .tl-item').forEach((it, i) => {
              setTimeout(() => it.classList.add('in-view'), i * 90);
            });
          }
        });
      }, { threshold: 0.1 });
      tio.observe(tl);
    }
  }

  /* ================================================================
     5. 时间轴：拖拽 + 滚动 + 进度
  ================================================================= */
  function initTimeline() {
    const scroll = $('#tl-scroll'), track = $('#tl-track'), bar = $('#tl-progress');
    let isDown = false, startX = 0, startLeft = 0;

    scroll.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      isDown = true; startX = e.clientX; startLeft = scroll.scrollLeft;
      scroll.classList.add('dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDown || e.pointerType === 'touch') return;
      e.preventDefault();
      scroll.scrollLeft = startLeft - (e.clientX - startX);
    });
    window.addEventListener('pointerup', () => {
      isDown = false; scroll.classList.remove('dragging');
    });

    function upd() {
      const max = scroll.scrollWidth - scroll.clientWidth;
      bar.style.width = (max > 0 ? (scroll.scrollLeft / max) * 100 : 0) + '%';
    }
    scroll.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* ================================================================
     6. 声音引擎（Web Audio 程序化合成）
  ================================================================= */
  let audioCtx = null, master = null, analyser = null, noiseBuf = null;

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      master = audioCtx.createGain();
      master.gain.value = 0.7;
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      master.connect(analyser);
      analyser.connect(audioCtx.destination);
      // 白噪声缓冲区
      const len = audioCtx.sampleRate * 2;
      noiseBuf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function noiseSource(loop) {
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = !!loop;
    return src;
  }

  const sounds = {
    // 钟楼晨钟
    bell(t) {
      const now = t.currentTime;
      [196, 294, 392, 588].forEach((f, i) => {
        const o = t.createOscillator(), g = t.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.5 / (i + 1), now + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
        o.connect(g); g.connect(master);
        o.start(now); o.stop(now + 3.3);
      });
    },
    // 图书馆翻书
    page(t) {
      for (let i = 0; i < 4; i++) {
        const st = t.currentTime + i * 0.35;
        const src = noiseSource(false);
        const f = t.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600 + Math.random() * 800; f.Q.value = 1.2;
        const g = t.createGain();
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.28, st + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.22);
        src.connect(f); f.connect(g); g.connect(master);
        src.start(st); src.stop(st + 0.25);
      }
    },
    // 中心湖流水
    water(t) {
      const src = noiseSource(true);
      const f = t.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520; f.Q.value = 0.6;
      const lfo = t.createOscillator(); lfo.frequency.value = 0.4;
      const lfoG = t.createGain(); lfoG.gain.value = 180;
      lfo.connect(lfoG); lfoG.connect(f.frequency);
      const g = t.createGain();
      const now = t.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.22, now + 0.5);
      g.gain.setValueAtTime(0.22, now + 3.2);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
      src.connect(f); f.connect(g); g.connect(master);
      src.start(now); src.stop(now + 4.4);
      lfo.start(now); lfo.stop(now + 4.4);
    },
    // 林间鸟鸣
    bird(t) {
      const notes = [1400, 1800, 1500, 2100, 1600, 2400, 1900, 1300];
      notes.forEach((f0, i) => {
        const st = t.currentTime + i * 0.28;
        const o = t.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(f0 * 0.8, st);
        o.frequency.exponentialRampToValueAtTime(f0, st + 0.06);
        o.frequency.exponentialRampToValueAtTime(f0 * 1.15, st + 0.14);
        const g = t.createGain();
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.16, st + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.2);
        o.connect(g); g.connect(master);
        o.start(st); o.stop(st + 0.22);
      });
    },
    // 演艺中心琴音（五声音阶琶音）
    piano(t) {
      const seq = [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33];
      seq.forEach((f, i) => {
        const st = t.currentTime + i * 0.32;
        [1, 2].forEach((m) => {
          const o = t.createOscillator(); o.type = 'triangle'; o.frequency.value = f * m;
          const g = t.createGain();
          g.gain.setValueAtTime(0.0001, st);
          g.gain.exponentialRampToValueAtTime(0.20 / m, st + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, st + 1.1);
          o.connect(g); g.connect(master);
          o.start(st); o.stop(st + 1.15);
        });
      });
    },
    // 体育馆欢呼（掌声）
    crowd(t) {
      for (let i = 0; i < 18; i++) {
        const st = t.currentTime + Math.random() * 2.4;
        const src = noiseSource(false);
        const f = t.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200 + Math.random() * 1800; f.Q.value = 0.7;
        const g = t.createGain();
        const dur = 0.06 + Math.random() * 0.1;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(0.20, st + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
        src.connect(f); f.connect(g); g.connect(master);
        src.start(st); src.stop(st + dur + 0.02);
      }
    }
  };

  function playSound(type) {
    ensureAudio();
    try { sounds[type](audioCtx); } catch (e) { /* 静默失败 */ }
    drawWave();
  }

  /* ---- 波形可视化 ---- */
  let waveRaf = null;
  function drawWave() {
    if (!analyser) return;
    const cv = $('#wave'), ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const data = new Uint8Array(analyser.frequencyBinCount);
    function step() {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(6,10,20,0.6)';
      ctx.fillRect(0, 0, W, H);
      const n = 64, bw = W / n;
      for (let i = 0; i < n; i++) {
        const v = data[(i * 2) % data.length] / 255;
        const h = Math.max(3, v * H * 0.9);
        const g = ctx.createLinearGradient(0, H, 0, H - h);
        g.addColorStop(0, '#a97f3c');
        g.addColorStop(1, '#f3d9a4');
        ctx.fillStyle = g;
        const x = i * bw + bw * 0.2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, H - h, bw * 0.6, h, 3);
        else ctx.rect(x, H - h, bw * 0.6, h);
        ctx.fill();
      }
      waveRaf = requestAnimationFrame(step);
    }
    cancelAnimationFrame(waveRaf);
    waveRaf = requestAnimationFrame(step);
    setTimeout(() => cancelAnimationFrame(waveRaf), 4600);
  }

  /* ================================================================
     7. 校园漫游（SVG 地图热点）
  ================================================================= */
  function initCampus() {
    const map = $('#campus-map'), panel = $('#spot-panel'), label = $('#map-label');
    const name = $('#spot-name'), desc = $('#spot-desc'), meta = $('#spot-meta');
    const cover = $('#spot-cover'), playBtn = $('#spot-play'), status = $('#spot-status');
    let vbAnim = null, tourTimer = null, current = null;

    const SPOTS = {
      library:  { name: '图书馆', icon: '📚', desc: '大学城五大标志性建筑之一，全国最大的校园单体图书馆，是无数广大人挑灯夜读的青春坐标。', meta: ['馆舍总面积 5.65 万平方米', '纸质图书总藏量 280 万册', '馆藏居广东省高校前三'], sound: 'page', x: 230, y: 190 },
      center:   { name: '演艺中心', icon: '🎭', desc: '舞台与灯光的汇聚之地，戏剧、晚会、毕业典礼在此定格青春的璀璨瞬间。', meta: ['艺术殿堂 · 青春舞台', '关键词：绽放 · 掌声'], sound: 'piano', x: 415, y: 145 },
      lake:     { name: '中心湖', icon: '💧', desc: '小谷围岛上的一方碧水，晨读、散步、看晚霞，倒映着广大的四季。', meta: ['生态校园 · 湖光掠影', '关键词：宁静 · 生机'], sound: 'water', x: 560, y: 300 },
      motto:    { name: '校训石', icon: '🪨', desc: '「博学笃行，与时俱进」八字校训镌刻其上，是广大人的精神坐标。', meta: ['精神象征 · 立石明志', '关键词：博学 · 笃行'], sound: 'bell', x: 493, y: 292 },
      teaching: { name: '教学楼群', icon: '🏫', desc: '文清楼、文新楼书声琅琅，粉笔与键盘交错，知识在此代代相传。', meta: ['课堂教学 · 传道授业', '关键词：勤学 · 成长'], sound: 'page', x: 355, y: 463 },
      stadium:  { name: '何世杰体育馆', icon: '🏟️', desc: '热血与汗水交织的赛场，运动会与球赛的呐喊声，汇成青春的乐章。', meta: ['体育竞技 · 强健体魄', '关键词：拼搏 · 团结'], sound: 'crowd', x: 785, y: 275 },
      gui:      { name: '桂花岗校区', icon: '🏛️', desc: '老校区桂香书韵，沉淀独特岁月韵味。学校现有大学城、桂花岗、黄埔三大校区。', meta: ['三大校区之一 · 历史底蕴', '关键词：传承 · 记忆'], sound: 'bird', x: 130, y: 390 }
    };

    function parseVB() {
      return (map.getAttribute('viewBox') || '0 0 1000 680').split(' ').map(Number);
    }
    function animateViewBox(target, dur) {
      dur = dur || 750;
      cancelAnimationFrame(vbAnim);
      const start = parseVB();
      const t0 = performance.now();
      function step(now) {
        const p = ease(Math.min(1, (now - t0) / dur));
        const cur = start.map((v, i) => v + (target[i] - v) * p);
        map.setAttribute('viewBox', cur.map((v) => Math.round(v)).join(' '));
        if (p < 1) vbAnim = requestAnimationFrame(step);
      }
      vbAnim = requestAnimationFrame(step);
    }

    function stopTour() {
      if (tourTimer) { clearInterval(tourTimer); tourTimer = null; }
      $('#tour-btn').textContent = '▶ 自动漫游';
    }

    function select(key, autoplay) {
      stopTour();
      const s = SPOTS[key];
      if (!s) return;
      current = key;
      $$('.hot').forEach((h) => h.classList.toggle('active', h.getAttribute('data-spot') === key));
      cover.textContent = s.icon;
      name.textContent = s.name;
      desc.textContent = s.desc;
      meta.innerHTML = s.meta.map((m) => '<li>' + m + '</li>').join('');
      status.textContent = '静候聆听';
      label.textContent = '正在聚焦：' + s.name;
      animateViewBox([s.x - 170, s.y - 115, 340, 230]);
      if (autoplay) { playBtn.dataset.sound = s.sound; }
    }

    function reset() {
      stopTour();
      current = null;
      $$('.hot').forEach((h) => h.classList.remove('active'));
      cover.textContent = '✦';
      name.textContent = '广州大学 · 校园地标';
      desc.textContent = '点击地图上的金色光点，即可查看该地标的介绍与专属声音。';
      meta.innerHTML = '';
      status.textContent = '静候聆听';
      label.textContent = '选择一处地标开始探索';
      animateViewBox([0, 0, 1000, 680]);
    }

    $$('.hot').forEach((h) => {
      h.addEventListener('click', () => select(h.getAttribute('data-spot')));
    });

    playBtn.addEventListener('click', () => {
      const key = current || playBtn.dataset.sound;
      const s = SPOTS[key];
      if (!s) { status.textContent = '请先选择一个地标'; return; }
      playSound(s.sound);
      status.textContent = '播放中：' + s.name + '之声';
    });

    $('#tour-btn').addEventListener('click', () => {
      if (tourTimer) { stopTour(); reset(); return; }
      $('#tour-btn').textContent = '■ 停止漫游';
      const keys = Object.keys(SPOTS);
      let i = 0;
      select(keys[0]);
      tourTimer = setInterval(() => {
        i = (i + 1) % keys.length;
        if (i === 0) { reset(); stopTour(); return; }
        select(keys[i]);
      }, 2600);
    });
    $('#map-reset').addEventListener('click', reset);
    // 初始状态
    reset();
  }

  /* ================================================================
     8. 声音地图
  ================================================================= */
  function initSoundMap() {
    const now = $('#sound-now');
    const names = {
      bell: '钟楼晨钟', page: '图书馆翻书', water: '中心湖流水',
      bird: '林间鸟鸣', piano: '演艺中心琴音', crowd: '体育馆欢呼'
    };
    $$('.sound-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        $$('.sound-tile').forEach((t) => t.classList.remove('playing'));
        tile.classList.add('playing');
        const type = tile.getAttribute('data-sound');
        playSound(type);
        now.textContent = '正在聆听：' + names[type];
      });
    });
  }

  /* ================================================================
     9. 数据可视化
  ================================================================= */
  function initCounters() {
    const nums = $$('.stat-num');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target, to = parseInt(el.getAttribute('data-to'), 10);
        const t0 = performance.now(), dur = 1600;
        function step(now) {
          const p = ease(Math.min(1, (now - t0) / dur));
          el.textContent = Math.round(to * p);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    nums.forEach((n) => io.observe(n));
  }

  function setupCanvas(cv) {
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth || cv.width;
    const h = cv.clientHeight || cv.height;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function animateChart(cv, draw) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const t0 = performance.now(), dur = 1600;
        function step(now) {
          const p = ease(Math.min(1, (now - t0) / dur));
          const { ctx, w, h } = setupCanvas(cv);
          ctx.clearRect(0, 0, w, h);
          draw(ctx, w, h, p);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.3 });
    io.observe(cv);
    // 窗口缩放重绘
    window.addEventListener('resize', () => {
      const { ctx, w, h } = setupCanvas(cv);
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, 1);
    });
  }

  function initCharts() {
    const GOLD = '#d9b36c', GOLD2 = '#f3d9a4', BLUE = '#4a86d8', MUTED = '#5a6278';

    // 柱状图：重点学科体系
    animateChart($('#chart-line'), (ctx, w, h, p) => {
      const pad = { l: 44, r: 16, t: 20, b: 34 };
      const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
      const cats = ['冲一流重点学科', '省级重点学科', '市级重点学科', 'ESI前1%学科'];
      const vals = [6, 14, 18, 13];
      const max = 20;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + ch - (i / 4) * ch;
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
        ctx.fillStyle = MUTED;
        ctx.fillText((max * i / 4 | 0), pad.l - 8, y + 4);
      }
      const bw = cw / cats.length * 0.5;
      cats.forEach((c, i) => {
        const x = pad.l + (i + 0.5) * (cw / cats.length) - bw / 2;
        const bh = (vals[i] / max) * ch * p;
        const y = pad.t + ch - bh;
        const g = ctx.createLinearGradient(0, y, 0, pad.t + ch);
        g.addColorStop(0, GOLD2); g.addColorStop(1, '#a97f3c');
        ctx.fillStyle = g;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, [6, 6, 0, 0]);
        else ctx.rect(x, y, bw, bh);
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.fillStyle = MUTED;
        ctx.fillText(c, pad.l + (i + 0.5) * (cw / cats.length), h - 10);
        ctx.fillStyle = GOLD2;
        ctx.fillText(vals[i], pad.l + (i + 0.5) * (cw / cats.length), y - 8);
      });
    });

    // 柱状图：学位授权点与博士后流动站
    animateChart($('#chart-bar'), (ctx, w, h, p) => {
      const pad = { l: 44, r: 16, t: 20, b: 34 };
      const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
      const cats = ['学术硕士点', '专业硕士点', '博士授权点', '博士后流动站'];
      const vals = [34, 30, 14, 8];
      const max = 40;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + ch - (i / 4) * ch;
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
        ctx.fillStyle = MUTED;
        ctx.fillText((max * i / 4 | 0), pad.l - 8, y + 4);
      }
      const bw = cw / cats.length * 0.5;
      cats.forEach((c, i) => {
        const x = pad.l + (i + 0.5) * (cw / cats.length) - bw / 2;
        const bh = (vals[i] / max) * ch * p;
        const y = pad.t + ch - bh;
        const g = ctx.createLinearGradient(0, y, 0, pad.t + ch);
        g.addColorStop(0, GOLD2); g.addColorStop(1, '#a97f3c');
        ctx.fillStyle = g;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, [6, 6, 0, 0]);
        else ctx.rect(x, y, bw, bh);
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.fillStyle = MUTED;
        ctx.fillText(c, pad.l + (i + 0.5) * (cw / cats.length), h - 10);
        ctx.fillStyle = GOLD2;
        ctx.fillText(vals[i], pad.l + (i + 0.5) * (cw / cats.length), y - 8);
      });
    });

    // 环形图：2026年本科招生专业构成
    animateChart($('#chart-ring'), (ctx, w, h, p) => {
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 26;
      const seg = [
        { label: '理工类 43', v: 43, c: '#d9b36c' },
        { label: '人文社科类 23', v: 23, c: '#4a86d8' },
        { label: '艺术体育类 10', v: 10, c: '#f3d9a4' }
      ];
      const total = seg.reduce((s, x) => s + x.v, 0);
      let angle = -Math.PI / 2;
      ctx.lineWidth = 26;
      ctx.lineCap = 'butt';
      seg.forEach((s) => {
        const sweep = (s.v / total) * Math.PI * 2 * p;
        ctx.beginPath();
        ctx.arc(cx, cy, r, angle, angle + sweep);
        ctx.strokeStyle = s.c;
        ctx.stroke();
        angle += sweep;
      });
      // 中心文字
      ctx.textAlign = 'center';
      ctx.fillStyle = GOLD2;
      ctx.font = '600 34px "STZhongsong", "SimSun", serif';
      ctx.fillText('76', cx, cy - 4);
      ctx.fillStyle = MUTED;
      ctx.font = '12px sans-serif';
      ctx.fillText('本科招生专业', cx, cy + 20);
      // 图例
      let lx = 20;
      const ly = h - 16;
      ctx.textAlign = 'left';
      ctx.font = '11px sans-serif';
      seg.forEach((s) => {
        ctx.fillStyle = s.c;
        ctx.fillRect(lx, ly - 9, 12, 12);
        ctx.fillStyle = MUTED;
        ctx.fillText(s.label, lx + 16, ly + 1);
        lx += 16 + ctx.measureText(s.label).width + 22;
      });
    });
  }

  /* ================================================================
     10. 拾忆游戏
  ================================================================= */
  function initGame() {
    const stage = $('#game-stage'), intro = $('#game-intro');
    const scoreEl = $('#game-score'), timeEl = $('#game-time');
    const slots = $$('#game-slots i'), result = $('#game-result');
    const startBtn = $('#game-start');
    const motto = '博学笃行与时俱进';
    let playing = false, timer = null, timeLeft = 30, score = 0;

    function spawn() {
      // 随机生成 8 个碎片，乱序
      const order = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5);
      order.forEach((idx, i) => {
        const f = document.createElement('div');
        f.className = 'frag';
        f.textContent = motto[idx];
        f.dataset.idx = idx;
        const pad = 40;
        f.style.left = (pad + Math.random() * (stage.clientWidth - 2 * pad - 44)) + 'px';
        f.style.top = (pad + Math.random() * (stage.clientHeight - 2 * pad - 44)) + 'px';
        f.style.animationDelay = (i * 0.18) + 's';
        f.addEventListener('click', () => catchFrag(f));
        stage.appendChild(f);
      });
    }

    function catchFrag(f) {
      if (f.classList.contains('caught')) return;
      f.classList.add('caught');
      const idx = parseInt(f.dataset.idx, 10);
      slots[idx].classList.add('done');
      score++;
      scoreEl.textContent = score;
      setTimeout(() => f.remove(), 500);
      if (score === 8) end(true);
    }

    function end(win) {
      playing = false;
      clearInterval(timer);
      $$('.frag').forEach((f) => f.remove());
      if (win) {
        result.textContent = '✦ 集齐校训「博学笃行 与时俱进」—— 恭喜解锁百年印记！';
        burst();
      } else {
        result.textContent = '本轮收集 ' + score + '/8 · 点击「开始挑战」再试一次';
      }
      startBtn.textContent = '再玩一次';
    }

    function burst() {
      for (let i = 0; i < 40; i++) {
        const b = document.createElement('span');
        b.className = 'frag';
        b.textContent = '✦';
        b.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;animation:caught 1.2s ease-out forwards;';
        stage.appendChild(b);
        setTimeout(() => b.remove(), 1300);
      }
    }

    startBtn.addEventListener('click', () => {
      if (playing) return;
      // 重置
      $$('.frag').forEach((f) => f.remove());
      slots.forEach((s) => s.classList.remove('done'));
      score = 0; timeLeft = 30; scoreEl.textContent = '0'; timeEl.textContent = '30';
      result.textContent = '';
      intro.style.display = 'none';
      playing = true;
      startBtn.textContent = '挑战中…';
      spawn();
      timer = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        if (timeLeft <= 0) end(false);
      }, 1000);
    });
  }

  /* ================================================================
     11. AI 寄语
  ================================================================= */
  function initAI() {
    const out = $('#ai-type'), gen = $('#ai-gen'), copy = $('#ai-copy');
    const openers = ['愿广大', '祝百年广大', '亲爱的广大', '致百岁的广大', '写给广大'];
    const mids = ['弦歌不辍，薪火相传', '博学笃行，与时俱进', '桃李芬芳，春华秋实', '栉风沐雨，赓续华章', '奋楫争先，笃行致远'];
    const tails = ['以青春之名，共赴下一个百年。', '于小谷围岛畔，再续岭南传奇。', '让每一次出发，都通向星辰大海。', '百年正青春，未来皆可期。', '愿岁月不负，理想长青。'];

    function compose() {
      const pick = (a) => a[(Math.random() * a.length) | 0];
      return pick(openers) + '，' + pick(mids) + '，' + pick(tails);
    }

    let typing = null;
    function typewrite(text) {
      out.innerHTML = '';
      let i = 0;
      clearInterval(typing);
      typing = setInterval(() => {
        i++;
        out.innerHTML = text.slice(0, i) + '<span class="caret"></span>';
        if (i >= text.length) { clearInterval(typing); }
      }, 70);
    }

    gen.addEventListener('click', () => {
      typewrite(compose());
    });
    copy.addEventListener('click', () => {
      const text = out.textContent;
      if (!text) return;
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      copy.textContent = '已复制 ✓';
      setTimeout(() => copy.textContent = '复制', 1400);
    });
    // 初始生成
    typewrite(compose());
  }

  /* ================================================================
     12. 返回顶部
  ================================================================= */
  function initTop() {
    const top = $('#top');
    window.addEventListener('scroll', () => top.classList.toggle('show', window.scrollY > 600), { passive: true });
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ================================================================
     启动
  ================================================================= */
  window.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initParticles();
    initNav();
    initReveal();
    initTimeline();
    initCampus();
    initSoundMap();
    initCounters();
    initCharts();
    initGame();
    initAI();
    initTop();
  });
})();
