(() => {
  const layer = document.getElementById("paw-trails");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!layer || reducedMotion.matches) {
    return;
  }

  const pawSvg = `
    <svg viewBox="0 0 36 40" aria-hidden="true">
      <path d="M18 16.2c-3.4 0-4.8 2.6-6.1 5-1.4 2.5-4.5 4.2-3.9 7.7.7 4.1 5.3 5.9 10 5.9s9.3-1.8 10-5.9c.6-3.5-2.5-5.2-3.9-7.7-1.3-2.4-2.7-5-6.1-5Z" />
      <ellipse cx="7" cy="15" rx="3.8" ry="5.4" transform="rotate(-25 7 15)" />
      <ellipse cx="14" cy="8" rx="3.7" ry="5.4" transform="rotate(-8 14 8)" />
      <ellipse cx="22" cy="8" rx="3.7" ry="5.4" transform="rotate(8 22 8)" />
      <ellipse cx="29" cy="15" rx="3.8" ry="5.4" transform="rotate(25 29 15)" />
    </svg>`;

  const gaitPattern = [
    { side: -1, isFrontPaw: false },
    { side: -1, isFrontPaw: true },
    { side: 1, isFrontPaw: false },
    { side: 1, isFrontPaw: true }
  ];

  let timer;

  const randomBetween = (minimum, maximum) =>
    minimum + Math.random() * (maximum - minimum);

  function routeAcross(width, height) {
    const edge = Math.floor(Math.random() * 4);
    const outside = 44;

    if (edge === 0) {
      return { x1: -outside, y1: randomBetween(0, height), x2: width + outside, y2: randomBetween(0, height) };
    }

    if (edge === 1) {
      return { x1: width + outside, y1: randomBetween(0, height), x2: -outside, y2: randomBetween(0, height) };
    }

    if (edge === 2) {
      return { x1: randomBetween(0, width), y1: -outside, x2: randomBetween(0, width), y2: height + outside };
    }

    return { x1: randomBetween(0, width), y1: height + outside, x2: randomBetween(0, width), y2: -outside };
  }

  function addTrail() {
    const width = layer.clientWidth;
    const height = layer.clientHeight;

    if (!width || !height || document.hidden) {
      scheduleNext();
      return;
    }

    const route = routeAcross(width, height);
    const dx = route.x2 - route.x1;
    const dy = route.y2 - route.y1;
    const distance = Math.hypot(dx, dy);
    const cycleCount = Math.max(2, Math.min(window.innerWidth < 600 ? 2 : 3, Math.round(distance / 360)));
    const stepCount = cycleCount * gaitPattern.length;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    const perpendicularX = -dy / distance;
    const perpendicularY = dx / distance;
    const trail = document.createElement("div");
    const duration = randomBetween(4.1, 4.7);
    const curve = randomBetween(-52, 52);
    let elapsedDelay = 0;

    trail.className = "paw-trail";

    for (let index = 0; index < stepCount; index += 1) {
      const progress = (index + 0.55) / stepCount;
      const phaseIndex = index % gaitPattern.length;
      const { side, isFrontPaw } = gaitPattern[phaseIndex];
      const laneOffset = side * randomBetween(11, 16);
      const curvedOffset = Math.sin(progress * Math.PI) * curve;
      const naturalJitter = randomBetween(-2.5, 2.5);
      const totalOffset = laneOffset + curvedOffset + naturalJitter;
      const curveAngle = Math.atan((curve * Math.PI * Math.cos(progress * Math.PI)) / distance) * (180 / Math.PI);
      const paw = document.createElement("span");

      paw.className = "paw-print";
      paw.style.left = `${route.x1 + dx * progress + perpendicularX * totalOffset}px`;
      paw.style.top = `${route.y1 + dy * progress + perpendicularY * totalOffset}px`;
      paw.style.setProperty("--paw-angle", `${angle + curveAngle + side * randomBetween(0.5, 3)}deg`);
      paw.style.setProperty("--paw-scale", isFrontPaw ? randomBetween(0.98, 1.05) : randomBetween(0.86, 0.93));
      paw.style.setProperty("--paw-duration", `${duration}s`);
      paw.style.setProperty("--paw-delay", `${elapsedDelay}s`);
      paw.innerHTML = pawSvg;
      trail.appendChild(paw);

      elapsedDelay += phaseIndex === gaitPattern.length - 1
        ? randomBetween(0.74, 0.9)
        : randomBetween(0.48, 0.6);
    }

    layer.appendChild(trail);
    window.setTimeout(() => trail.remove(), (duration + elapsedDelay + 0.3) * 1000);
    scheduleNext();
  }

  function scheduleNext() {
    window.clearTimeout(timer);
    timer = window.setTimeout(addTrail, randomBetween(7600, 9800));
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !layer.childElementCount) {
      scheduleNext();
    }
  });

  timer = window.setTimeout(addTrail, 900);
})();
