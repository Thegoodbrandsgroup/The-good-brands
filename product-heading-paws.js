(() => {
  const stage = document.querySelector(".product-title-stage");
  const title = document.querySelector("#products-heading .product-title-text");
  const layer = document.getElementById("product-heading-paw-layer");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!stage || !title || !layer || reducedMotion.matches) {
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
    { side: -1, scale: 0.9 },
    { side: -1, scale: 1.02 },
    { side: 1, scale: 0.9 },
    { side: 1, scale: 1.02 }
  ];

  let cleanupTimer;
  let resizeTimer;

  const distance = (first, second) =>
    Math.hypot(second.x - first.x, second.y - first.y);

  function addLine(points, start, end, spacing) {
    const steps = Math.max(1, Math.round(distance(start, end) / spacing));
    const firstStep = points.length ? 1 : 0;

    for (let index = firstStep; index <= steps; index += 1) {
      const progress = index / steps;
      points.push({
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress
      });
    }
  }

  function addArc(points, start, control, end, steps) {
    for (let index = 1; index <= steps; index += 1) {
      const progress = index / steps;
      const inverse = 1 - progress;
      points.push({
        x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x,
        y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y
      });
    }
  }

  function buildTrail() {
    window.clearTimeout(cleanupTimer);
    layer.replaceChildren();

    const stageBox = stage.getBoundingClientRect();
    const titleBox = title.getBoundingClientRect();
    const titleLeft = titleBox.left - stageBox.left;
    const titleRight = titleBox.right - stageBox.left;
    const titleTop = titleBox.top - stageBox.top;
    const groundY = stageBox.height - 45;
    const titleY = titleTop - 10;
    const start = { x: -28, y: groundY };
    const approach = { x: titleLeft - 24, y: groundY };
    const titleStart = { x: titleLeft + 15, y: titleY };
    const titleEnd = { x: titleRight - 12, y: titleY };
    const landing = { x: titleRight + 30, y: groundY };
    const exit = { x: stageBox.width + 30, y: groundY };
    const points = [];

    addLine(points, start, approach, 54);
    addArc(points, approach, {
      x: (approach.x + titleStart.x) / 2,
      y: Math.min(groundY, titleY) - 36
    }, titleStart, 5);
    addLine(points, titleStart, titleEnd, 42);
    addArc(points, titleEnd, {
      x: (titleEnd.x + landing.x) / 2,
      y: Math.min(groundY, titleY) - 28
    }, landing, 5);
    addLine(points, landing, exit, 54);

    let elapsedDelay = 0.8;

    points.forEach((point, index) => {
      const previous = points[Math.max(0, index - 1)];
      const next = points[Math.min(points.length - 1, index + 1)];
      const tangentX = next.x - previous.x;
      const tangentY = next.y - previous.y;
      const tangentLength = Math.hypot(tangentX, tangentY) || 1;
      const directionX = tangentX / tangentLength;
      const directionY = tangentY / tangentLength;
      const perpendicularX = -directionY;
      const perpendicularY = directionX;
      const gait = gaitPattern[index % gaitPattern.length];
      const laneOffset = gait.side * 8.5;
      const angle = Math.atan2(directionY, directionX) * (180 / Math.PI) + 90;
      const paw = document.createElement("span");

      paw.className = "paw-print product-heading-paw";
      paw.style.left = `${point.x + perpendicularX * laneOffset}px`;
      paw.style.top = `${point.y + perpendicularY * laneOffset}px`;
      paw.style.setProperty("--paw-angle", `${angle + gait.side * 1.5}deg`);
      paw.style.setProperty("--paw-scale", gait.scale);
      paw.style.setProperty("--paw-duration", "3.7s");
      paw.style.setProperty("--paw-delay", `${elapsedDelay}s`);
      paw.innerHTML = pawSvg;
      layer.appendChild(paw);

      elapsedDelay += index % gaitPattern.length === gaitPattern.length - 1 ? 0.57 : 0.42;
    });

    cleanupTimer = window.setTimeout(
      () => layer.replaceChildren(),
      (elapsedDelay + 4.1) * 1000
    );
  }

  window.addEventListener("load", buildTrail, { once: true });
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(buildTrail, 180);
  });
})();
