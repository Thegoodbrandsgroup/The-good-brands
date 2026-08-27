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
    const stepCount = Math.max(6, Math.min(window.innerWidth < 600 ? 8 : 11, Math.round(distance / 105)));
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    const perpendicularX = -dy / distance;
    const perpendicularY = dx / distance;
    const trail = document.createElement("div");
    const duration = randomBetween(2.8, 3.4);
    const stepDelay = randomBetween(0.38, 0.52);

    trail.className = "paw-trail";

    for (let index = 0; index < stepCount; index += 1) {
      const progress = (index + 0.55) / stepCount;
      const side = index % 2 === 0 ? -1 : 1;
      const lateralOffset = side * randomBetween(8, 12);
      const paw = document.createElement("span");

      paw.className = "paw-print";
      paw.style.left = `${route.x1 + dx * progress + perpendicularX * lateralOffset}px`;
      paw.style.top = `${route.y1 + dy * progress + perpendicularY * lateralOffset}px`;
      paw.style.setProperty("--paw-angle", `${angle + randomBetween(-4, 4)}deg`);
      paw.style.setProperty("--paw-duration", `${duration}s`);
      paw.style.setProperty("--paw-delay", `${index * stepDelay}s`);
      paw.innerHTML = pawSvg;
      trail.appendChild(paw);
    }

    layer.appendChild(trail);
    window.setTimeout(() => trail.remove(), (duration + stepCount * stepDelay + 0.3) * 1000);
    scheduleNext();
  }

  function scheduleNext() {
    window.clearTimeout(timer);
    timer = window.setTimeout(addTrail, randomBetween(4700, 6900));
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !layer.childElementCount) {
      scheduleNext();
    }
  });

  timer = window.setTimeout(addTrail, 900);
})();
