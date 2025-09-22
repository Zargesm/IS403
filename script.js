(() => {
  const TAU = Math.PI * 2;

  const bowl = document.getElementById('bowl');
  const path = document.getElementById('swimPath');
  const fishGroup = document.getElementById('fishGroup');
  const lapEl = document.getElementById('lapCount');
  const playPauseBtn = document.getElementById('playPause');
  const speedSlider = document.getElementById('speed');
  const speedVal = document.getElementById('speedVal');
  const resetBtn = document.getElementById('reset');

  // Path details (SVG units)
  const cx = parseFloat(path.getAttribute('cx')) || 300;
  const cy = parseFloat(path.getAttribute('cy')) || 290;
  const r  = parseFloat(path.getAttribute('r'))  || 135;

  // Animation state
  let laps = 0;
  let running = true;
  let lastTs = null;
  let theta = 0;        // angle in radians [0, TAU)
  let prevTheta = 0;    // previous wrapped angle
  let cyclesPerSecond = 1; // default 1x

  const updateSpeedLabel = () => {
    speedVal.textContent = `${Number(cyclesPerSecond).toFixed(1)}x`;
  };
  updateSpeedLabel();

  function positionFish(angle) {
    // Position along circle
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    // Facing tangent direction: angle + 90° (PI/2)
    const deg = (angle * 180 / Math.PI) + 90;

    fishGroup.setAttribute('transform', `translate(${x},${y}) rotate(${deg})`);
  }

  function step(ts) {
    if (!running) { requestAnimationFrame(step); return; }

    if (lastTs == null) lastTs = ts;
    const dt = (ts - lastTs) / 1000; // seconds
    lastTs = ts;

    // Advance theta by cyclesPerSecond * TAU radians per second
    theta += dt * cyclesPerSecond * TAU;

    // Wrap to [0, TAU)
    const wrapped = ((theta % TAU) + TAU) % TAU;

    // Lap detection: when wrapped angle goes from high to low (wraparound)
    if (wrapped < prevTheta) {
      laps += 1;
      lapEl.textContent = String(laps);
      // subtle celebration pulse
      document.querySelector('.site-header')?.animate(
        [{ transform: 'scale(1.0)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1.0)' }],
        { duration: 250, easing: 'ease-out' }
      );
    }
    prevTheta = wrapped;

    positionFish(wrapped);
    requestAnimationFrame(step);
  }

  // Controls
  playPauseBtn.addEventListener('click', () => {
    running = !running;
    playPauseBtn.textContent = running ? 'Pause' : 'Play';
    playPauseBtn.setAttribute('aria-pressed', String(running));
    // Reset timer gap to avoid jump
    lastTs = null;
  });

  speedSlider.addEventListener('input', (e) => {
    cyclesPerSecond = Number(e.target.value);
    updateSpeedLabel();
  });

  resetBtn.addEventListener('click', () => {
    laps = 0;
    lapEl.textContent = '0';
    theta = 0;
    prevTheta = 0;
    positionFish(0);
  });

  // Interaction: click fish for a playful boost
  fishGroup.addEventListener('click', () => {
    // brief forward nudge
    theta += TAU * 0.03;
    fishGroup.animate(
      [{ transform: fishGroup.getAttribute('transform') }, { transform: fishGroup.getAttribute('transform') + ' scale(1.12)' }],
      { duration: 160, easing: 'ease-out' }
    );
  });

  // Kick off
  positionFish(0);
  requestAnimationFrame(step);
})();
