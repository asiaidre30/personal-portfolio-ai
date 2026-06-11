/* ============================================================
   ASIA IDREES PORTFOLIO — script.js
   Contains:
     1. Starfield background animation
     2. Navbar scroll effect + hamburger menu
     3. Scroll reveal animations
     4. Mini Game (Asteroid Dodger)
     5. Meme Generator
   ============================================================ */


/* ============================================================
   1. STARFIELD — animated star background on <canvas id="starfield">
      Stars are randomly placed and twinkle by changing their opacity.
   ============================================================ */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx    = canvas.getContext('2d');

  /* Resize canvas to always fill the full window */
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* Star colours — mix of white, purple, cyan, and gold for a rich galaxy look */
  const STAR_COLORS = [
    '255,255,255',   /* white       */
    '255,255,255',   /* white (more common) */
    '255,255,255',
    '200,180,255',   /* soft purple */
    '180,230,255',   /* ice blue    */
    '255,220,120',   /* warm gold   */
    '120,255,220',   /* cyan        */
  ];

  /* Generate stars — mix of tiny background stars and a few large bright ones */
  const STAR_COUNT = 380;
  const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
    const isBig = i < 18; /* first 18 are large bright hero stars */
    return {
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * window.innerHeight,
      radius:  isBig ? 2.2 + Math.random() * 2.5 : Math.random() * 1.6 + 0.2,
      opacity: Math.random(),
      speed:   isBig ? Math.random() * 0.012 + 0.004 : Math.random() * 0.006 + 0.001,
      dir:     Math.random() > 0.5 ? 1 : -1,
      color:   STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      glow:    isBig, /* big stars get a glow halo */
    };
  });

  /* Shooting stars — streak across the canvas occasionally */
  const shootingStars = [];
  let shootTimer = 0;

  function spawnShootingStar() {
    shootingStars.push({
      x:     Math.random() * canvas.width * 0.7,
      y:     Math.random() * canvas.height * 0.4,
      len:   80 + Math.random() * 120,
      speed: 12 + Math.random() * 10,
      angle: Math.PI / 5 + (Math.random() - 0.5) * 0.3,
      life:  1.0,
      decay: 0.018 + Math.random() * 0.01,
    });
  }

  /* Draw and animate every frame */
  function drawStars() {
    /* Deep space gradient background */
    const grad = ctx.createRadialGradient(
      canvas.width * 0.4, canvas.height * 0.3, 0,
      canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.9
    );
    grad.addColorStop(0,   '#120030');
    grad.addColorStop(0.4, '#08001a');
    grad.addColorStop(1,   '#02000a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Soft nebula clouds painted directly on the background */
    [
      { x: 0.15, y: 0.2,  r: 320, col: '100,20,180',  a: 0.07 },
      { x: 0.8,  y: 0.6,  r: 280, col: '200,30,120',  a: 0.06 },
      { x: 0.5,  y: 0.85, r: 250, col: '20,150,180',  a: 0.05 },
      { x: 0.9,  y: 0.1,  r: 200, col: '80,0,200',    a: 0.05 },
    ].forEach(n => {
      const ng = ctx.createRadialGradient(
        n.x * canvas.width, n.y * canvas.height, 0,
        n.x * canvas.width, n.y * canvas.height, n.r
      );
      ng.addColorStop(0,   `rgba(${n.col},${n.a})`);
      ng.addColorStop(1,   `rgba(${n.col},0)`);
      ctx.fillStyle = ng;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    /* Draw regular stars */
    stars.forEach(star => {
      star.opacity += star.speed * star.dir;
      if (star.opacity >= 1 || star.opacity <= 0) star.dir *= -1;

      ctx.save();
      if (star.glow) {
        /* Soft glow halo around big stars */
        const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
        halo.addColorStop(0,   `rgba(${star.color},${star.opacity * 0.6})`);
        halo.addColorStop(1,   `rgba(${star.color},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${star.color},${star.opacity})`;
      ctx.fill();
      ctx.restore();
    });

    /* Spawn a shooting star occasionally (~every 3s on average) */
    shootTimer++;
    if (shootTimer > 180 && Math.random() < 0.015) {
      spawnShootingStar();
      shootTimer = 0;
    }

    /* Draw and age shooting stars */
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      const tx = s.x + Math.cos(s.angle) * s.len;
      const ty = s.y + Math.sin(s.angle) * s.len;

      const sg = ctx.createLinearGradient(s.x, s.y, tx, ty);
      sg.addColorStop(0,   `rgba(255,255,255,0)`);
      sg.addColorStop(0.6, `rgba(220,200,255,${s.life * 0.9})`);
      sg.addColorStop(1,   `rgba(255,255,255,${s.life})`);

      ctx.save();
      ctx.strokeStyle = sg;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx,  ty);
      ctx.stroke();
      ctx.restore();

      /* Move and fade */
      s.x    += Math.cos(s.angle) * s.speed;
      s.y    += Math.sin(s.angle) * s.speed;
      s.life -= s.decay;
      if (s.life <= 0) shootingStars.splice(i, 1);
    }

    requestAnimationFrame(drawStars);
  }

  drawStars();
})();


/* ============================================================
   2. NAVBAR — shrink on scroll + hamburger toggle for mobile
   ============================================================ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');

  /* Shrink navbar background when user scrolls down */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.padding = '10px 40px';
      navbar.style.background = 'rgba(5, 0, 15, 0.92)';
    } else {
      navbar.style.padding = '16px 40px';
      navbar.style.background = 'rgba(5, 0, 15, 0.7)';
    }
  });

  /* Toggle mobile nav open/closed when hamburger is clicked */
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  /* Close mobile nav when a link is clicked */
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
})();


/* ============================================================
   3. SCROLL REVEAL — elements with class "reveal" fade in
      when they enter the viewport using IntersectionObserver.
      We add the "reveal" class to all section children here
      so the HTML stays cleaner.
   ============================================================ */
(function initScrollReveal() {
  /* Add .reveal to every major element we want to animate in */
  const targets = document.querySelectorAll(
    '.about-card, .about-text, .skill-card, .project-card, .contact-card, .section-title, .section-sub'
  );
  targets.forEach(el => el.classList.add('reveal'));

  /* Observer fires when element reaches 10% visibility */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); /* only animate once */
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
})();


/* ============================================================
   4. MINI GAME — Asteroid Dodger
      - A spaceship (▶) moves around the canvas
      - Asteroids fall from the top at increasing speed
      - Score increases every second you survive
      - Collision ends the game
      - Controls: Arrow keys, WASD, or tap/drag on mobile
   ============================================================ */
(function initGame() {
  const canvas      = document.getElementById('gameCanvas');
  const ctx         = canvas.getContext('2d');
  const startBtn    = document.getElementById('startBtn');
  const restartBtn  = document.getElementById('restartBtn');
  const scoreEl     = document.getElementById('scoreDisplay');
  const hiScoreEl   = document.getElementById('hiScoreDisplay');

  /* Game state variables */
  let gameLoop, asteroidTimer, scoreTimer;
  let running    = false;
  let score      = 0;
  let hiScore    = 0;
  let asteroids  = [];
  let particles  = []; /* explosion particles on collision */

  /* Spaceship object */
  const ship = {
    x: canvas.width  / 2,
    y: canvas.height - 60,
    w: 28,
    h: 28,
    speed: 5,
    /* Track which keys are held down */
    keys: { left: false, right: false, up: false, down: false },
  };

  /* ---- Drawing helpers ---- */

  /* Draw the spaceship as a glowing triangle */
  function drawShip() {
    ctx.save();
    ctx.translate(ship.x, ship.y);

    /* Glow effect */
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur  = 18;

    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(0, -ship.h / 2);        /* nose tip */
    ctx.lineTo(-ship.w / 2, ship.h / 2); /* bottom left */
    ctx.lineTo(ship.w / 2,  ship.h / 2); /* bottom right */
    ctx.closePath();
    ctx.fill();

    /* Engine flame */
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(-8, ship.h / 2);
    ctx.lineTo(8,  ship.h / 2);
    ctx.lineTo(0,  ship.h / 2 + 12 + Math.random() * 6); /* flicker */
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /* Draw a single asteroid as an irregular polygon */
  function drawAsteroid(a) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rot);

    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = '#6b21a8';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth   = 1.5;

    /* Draw a rough polygon using pre-generated angle offsets */
    ctx.beginPath();
    a.shape.forEach((r, i) => {
      const angle = (i / a.shape.length) * Math.PI * 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  /* Draw explosion particles */
  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /* Draw idle / game-over screen */
  function drawScreen(line1, line2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Gradient background */
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width
    );
    grad.addColorStop(0, '#0d002a');
    grad.addColorStop(1, '#000005');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Main text */
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = `bold 28px 'Orbitron', sans-serif`;
    ctx.fillStyle    = '#c084fc';
    ctx.shadowColor  = '#9333ea';
    ctx.shadowBlur   = 20;
    ctx.fillText(line1, canvas.width / 2, canvas.height / 2 - 20);

    ctx.font         = `16px 'Inter', sans-serif`;
    ctx.fillStyle    = '#a78bfa';
    ctx.shadowBlur   = 0;
    ctx.fillText(line2, canvas.width / 2, canvas.height / 2 + 20);
  }

  /* ---- Asteroid factory ---- */
  function spawnAsteroid() {
    const size = 18 + Math.random() * 22; /* radius 18–40 */
    /* Random jagged shape: 9 vertices at different distances from center */
    const shape = Array.from({ length: 9 }, () => size * (0.6 + Math.random() * 0.5));

    asteroids.push({
      x:     Math.random() * (canvas.width - 80) + 40,
      y:     -size,
      size,
      shape,
      speed: 2 + score / 80 + Math.random() * 2, /* gets faster as score grows */
      rot:   0,
      rotSpeed: (Math.random() - 0.5) * 0.05,
    });
  }

  /* ---- Explosion particles ---- */
  function explode(x, y) {
    const colors = ['#fbbf24', '#ec4899', '#c084fc', '#22d3ee'];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 2 + Math.random() * 5;
      particles.push({
        x, y,
        vx:      Math.cos(angle) * spd,
        vy:      Math.sin(angle) * spd,
        r:       2 + Math.random() * 4,
        color:   colors[Math.floor(Math.random() * colors.length)],
        life:    40,
        maxLife: 40,
      });
    }
  }

  /* ---- Collision detection (circle vs triangle bounding box) ---- */
  function hitTest(a) {
    return (
      Math.abs(a.x - ship.x) < a.size + ship.w / 2 &&
      Math.abs(a.y - ship.y) < a.size + ship.h / 2
    );
  }

  /* ---- Main game update loop ---- */
  function update() {
    /* Clear and redraw background */
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width
    );
    grad.addColorStop(0, '#0d002a');
    grad.addColorStop(1, '#000005');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Move ship based on held keys */
    if (ship.keys.left  && ship.x - ship.w / 2 > 0)           ship.x -= ship.speed;
    if (ship.keys.right && ship.x + ship.w / 2 < canvas.width) ship.x += ship.speed;
    if (ship.keys.up    && ship.y - ship.h / 2 > 0)           ship.y -= ship.speed;
    if (ship.keys.down  && ship.y + ship.h / 2 < canvas.height) ship.y += ship.speed;

    /* Move and rotate asteroids */
    asteroids.forEach(a => {
      a.y   += a.speed;
      a.rot += a.rotSpeed;
    });

    /* Remove asteroids that fell off the bottom */
    asteroids = asteroids.filter(a => a.y - a.size < canvas.height);

    /* Update particles */
    particles.forEach(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.15; /* gravity */
      p.life -= 1;
    });
    particles = particles.filter(p => p.life > 0);

    /* Draw everything */
    asteroids.forEach(drawAsteroid);
    drawParticles();
    drawShip();

    /* Score counter in top-right */
    ctx.font      = `bold 14px 'Orbitron', sans-serif`;
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, canvas.width - 16, 28);

    /* Check collision with any asteroid */
    if (asteroids.some(hitTest)) {
      endGame();
      return;
    }

    gameLoop = requestAnimationFrame(update);
  }

  /* ---- Start game ---- */
  function startGame() {
    score      = 0;
    asteroids  = [];
    particles  = [];
    ship.x     = canvas.width / 2;
    ship.y     = canvas.height - 60;
    ship.keys  = { left: false, right: false, up: false, down: false };

    scoreEl.textContent = score;
    startBtn.style.display   = 'none';
    restartBtn.style.display = 'none';
    running = true;

    /* Spawn a new asteroid every 1.2 seconds */
    asteroidTimer = setInterval(spawnAsteroid, 1200);
    /* Increase score by 1 every second survived */
    scoreTimer    = setInterval(() => {
      score++;
      scoreEl.textContent = score;
    }, 1000);

    gameLoop = requestAnimationFrame(update);
  }

  /* ---- End game ---- */
  function endGame() {
    running = false;
    cancelAnimationFrame(gameLoop);
    clearInterval(asteroidTimer);
    clearInterval(scoreTimer);

    if (score > hiScore) {
      hiScore = score;
      hiScoreEl.textContent = hiScore;
    }

    explode(ship.x, ship.y);

    /* Show explosion particles for a moment before the game-over screen */
    setTimeout(() => {
      drawScreen('💥 GAME OVER', `Score: ${score}  |  Best: ${hiScore}`);
      restartBtn.style.display = 'inline-block';
    }, 800);
  }

  /* ---- Button event listeners ---- */
  startBtn.addEventListener('click',   startGame);
  restartBtn.addEventListener('click', startGame);

  /* ---- Keyboard controls ---- */
  window.addEventListener('keydown', e => {
    const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    /* Prevent arrow keys from scrolling the page while the game is running */
    if (running && arrowKeys.includes(e.key)) e.preventDefault();

    if (!running) return;
    if (e.key === 'ArrowLeft'  || e.key === 'a') ship.keys.left  = true;
    if (e.key === 'ArrowRight' || e.key === 'd') ship.keys.right = true;
    if (e.key === 'ArrowUp'    || e.key === 'w') ship.keys.up    = true;
    if (e.key === 'ArrowDown'  || e.key === 's') ship.keys.down  = true;
  });

  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft'  || e.key === 'a') ship.keys.left  = false;
    if (e.key === 'ArrowRight' || e.key === 'd') ship.keys.right = false;
    if (e.key === 'ArrowUp'    || e.key === 'w') ship.keys.up    = false;
    if (e.key === 'ArrowDown'  || e.key === 's') ship.keys.down  = false;
  });

  /* ---- Touch / mobile controls: tap side of canvas to move ---- */
  let touchStartX = null;
  let touchStartY = null;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!running) return;
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    /* Move ship to where the finger is (clamped within canvas) */
    ship.x = Math.max(ship.w / 2, Math.min(canvas.width  - ship.w / 2, t.clientX - rect.left));
    ship.y = Math.max(ship.h / 2, Math.min(canvas.height - ship.h / 2, t.clientY - rect.top));
  }, { passive: false });

  /* Draw initial idle screen */
  drawScreen('🚀 Asteroid Dodger', 'Press Start to play!');
})();


/* ============================================================
   5. MEME GENERATOR
      - Pre-loaded meme template images (using picsum / placeholders
        since we can't guarantee specific meme URLs — users can
        add real meme image URLs to the TEMPLATES array below)
      - User picks a template, types top/bottom text
      - Canvas renders image + bold impact-style text
      - User can download the result
   ============================================================ */
(function initMemeGenerator() {
  const memeCanvas     = document.getElementById('memeCanvas');
  const memeCtx        = memeCanvas.getContext('2d');
  const topTextInput   = document.getElementById('topText');
  const bottomTextInput= document.getElementById('bottomText');
  const fontSizeSlider = document.getElementById('fontSize');
  const fontSizeVal    = document.getElementById('fontSizeVal');
  const generateBtn    = document.getElementById('generateMeme');
  const downloadBtn    = document.getElementById('downloadMeme');
  const templatesEl    = document.getElementById('memeTemplates');

  /* Meme templates — all sourced from imgflip's public image CDN.
     Add more by pasting any imgflip image URL into this array! */
  const TEMPLATES = [
    { label: 'Drake',              url: 'https://i.imgflip.com/30b1gx.jpg'  },
    { label: 'Distracted BF',      url: 'https://i.imgflip.com/1ur9b0.jpg'  },
    { label: 'Change My Mind',     url: 'https://i.imgflip.com/24y43o.jpg'  },
    { label: 'This is Fine',       url: 'https://i.imgflip.com/wxica.jpg'   },
    { label: 'Two Buttons',        url: 'https://i.imgflip.com/1g8my4.jpg'  },
    { label: 'Expanding Brain',    url: 'https://i.imgflip.com/1jwhww.jpg'  },
    { label: 'Surprised Pikachu',  url: 'https://i.imgflip.com/2kbn1e.jpg'  },
    { label: 'Woman Yelling Cat',  url: 'https://i.imgflip.com/345v97.jpg'  },
    { label: 'Gru Plan',           url: 'https://i.imgflip.com/26am.jpg'    },
    { label: 'Galaxy Brain',       url: 'https://i.imgflip.com/3lmzyx.jpg'  },
    { label: 'Always Has Been',    url: 'https://i.imgflip.com/46e43q.jpg'  },
    { label: 'Hide the Pain',      url: 'https://i.imgflip.com/gk5el.jpg'   },
    { label: 'One Does Not',       url: 'https://i.imgflip.com/1bij.jpg'    },
    { label: 'Success Kid',        url: 'https://i.imgflip.com/1bhk.jpg'    },
    { label: 'Everywhere',         url: 'https://i.imgflip.com/1o00in.jpg'  },
    { label: 'Batman Slapping',    url: 'https://i.imgflip.com/9ehk.jpg'    },
    { label: 'Oprah You Get',      url: 'https://i.imgflip.com/3lmzyx.jpg'  },
    { label: 'Sad Affleck',        url: 'https://i.imgflip.com/wx16a.jpg'   },
    { label: 'Roll Safe',          url: 'https://i.imgflip.com/1h7in3.jpg'  },
    { label: 'Waiting Skeleton',   url: 'https://i.imgflip.com/2fm6x.jpg'   },
    { label: 'Disaster Girl',      url: 'https://i.imgflip.com/23ls.jpg'    },
    { label: 'Ancient Aliens',     url: 'https://i.imgflip.com/xxy0x.jpg'   },
    { label: 'UNO Draw 25',        url: 'https://i.imgflip.com/3lmzyx.jpg'  },
    { label: 'Monkey Puppet',      url: 'https://i.imgflip.com/3oevdk.jpg'  },
    { label: 'Blinking Guy',       url: 'https://i.imgflip.com/3cb6dy.jpg'  },
    { label: 'Think About It',     url: 'https://i.imgflip.com/1otk96.jpg'  },
    { label: 'Mocking Spongebob',  url: 'https://i.imgflip.com/1otk96.jpg'  },
    { label: 'Running Away',       url: 'https://i.imgflip.com/3vfmyf.jpg'  },
    { label: 'Panik Kalm',         url: 'https://i.imgflip.com/3whkl7.jpg'  },
    { label: 'They\'re the Same',  url: 'https://i.imgflip.com/4hyt0n.jpg'  },
  ];

  let selectedImage = null; /* the currently loaded Image object */
  let activeThumb   = null; /* the currently selected thumbnail element */

  /* ---- Build thumbnail grid ---- */
  TEMPLATES.forEach((tpl, i) => {
    const img = document.createElement('img');
    img.src   = tpl.url;
    img.alt   = tpl.label;
    img.title = tpl.label;
    img.className = 'meme-thumb';

    img.addEventListener('click', () => {
      /* Deselect previous thumb */
      if (activeThumb) activeThumb.classList.remove('active');
      img.classList.add('active');
      activeThumb = img;

      /* Load the full image into memory */
      const full = new Image();
      full.crossOrigin = 'anonymous'; /* needed to draw external images on canvas */
      full.src = tpl.url;
      full.onload = () => {
        selectedImage = full;
        /* Auto-preview once the image loads */
        renderMeme();
      };
      full.onerror = () => {
        /* Fallback: draw a placeholder if the image can't load */
        selectedImage = null;
        memeCtx.fillStyle = '#1a004a';
        memeCtx.fillRect(0, 0, memeCanvas.width, memeCanvas.height);
        memeCtx.fillStyle = '#a78bfa';
        memeCtx.font = '20px Inter, sans-serif';
        memeCtx.textAlign = 'center';
        memeCtx.fillText('Image failed to load — try another!', memeCanvas.width / 2, memeCanvas.height / 2);
      };
    });

    templatesEl.appendChild(img);
  });

  /* ---- Render meme onto canvas ---- */
  function renderMeme() {
    const fontSize = parseInt(fontSizeSlider.value);
    const topText  = topTextInput.value.trim().toUpperCase();
    const botText  = bottomTextInput.value.trim().toUpperCase();

    /* Clear canvas */
    memeCtx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);

    /* Draw meme image scaled to canvas */
    if (selectedImage) {
      memeCtx.drawImage(selectedImage, 0, 0, memeCanvas.width, memeCanvas.height);
    } else {
      /* No image selected yet — draw a placeholder */
      memeCtx.fillStyle = '#1a004a';
      memeCtx.fillRect(0, 0, memeCanvas.width, memeCanvas.height);
      memeCtx.fillStyle = '#6b6b8f';
      memeCtx.font      = '18px Inter, sans-serif';
      memeCtx.textAlign = 'center';
      memeCtx.fillText('← Pick a template to start!', memeCanvas.width / 2, memeCanvas.height / 2);
      return;
    }

    /* Helper: draw bold outlined impact-font text (classic meme style) */
    function drawMemeText(text, x, y) {
      if (!text) return;
      memeCtx.font         = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
      memeCtx.textAlign    = 'center';
      memeCtx.textBaseline = 'middle';

      /* Black outline for readability */
      memeCtx.strokeStyle = '#000';
      memeCtx.lineWidth   = fontSize / 8;
      memeCtx.lineJoin    = 'round';
      memeCtx.strokeText(text, x, y);

      /* White fill */
      memeCtx.fillStyle = '#ffffff';
      memeCtx.fillText(text, x, y);
    }

    const cx = memeCanvas.width / 2;

    /* Draw top text near the top */
    drawMemeText(topText, cx, fontSize / 2 + 16);

    /* Draw bottom text near the bottom */
    drawMemeText(botText, cx, memeCanvas.height - fontSize / 2 - 16);
  }

  /* ---- Live preview as user types ---- */
  topTextInput.addEventListener('input',    renderMeme);
  bottomTextInput.addEventListener('input', renderMeme);
  fontSizeSlider.addEventListener('input',  () => {
    fontSizeVal.textContent = fontSizeSlider.value;
    renderMeme();
  });

  /* ---- Generate button ---- */
  generateBtn.addEventListener('click', () => {
    renderMeme();
    /* Show download button after generating */
    downloadBtn.style.display = 'inline-block';
  });

  /* ---- Download button — exports canvas as PNG ---- */
  downloadBtn.addEventListener('click', () => {
    const link    = document.createElement('a');
    link.download = 'asia-meme.png';
    link.href     = memeCanvas.toDataURL('image/png');
    link.click();
  });

  /* Draw initial placeholder */
  renderMeme();
})();
