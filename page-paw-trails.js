(() => {
  const stage = document.querySelector("[data-page-paw-trail]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!stage || reducedMotion.matches) {
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

  let resizeTimer;

  const distance = (first, second) =>
    Math.hypot(second.x - first.x, second.y - first.y);

  function addLine(points, start, end, spacing = 58) {
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

  function addArc(points, start, control, end, steps = 4) {
    for (let index = 1; index <= steps; index += 1) {
      const progress = index / steps;
      const inverse = 1 - progress;
      points.push({
        x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x,
        y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y
      });
    }
  }

  function addCubic(points, start, firstControl, secondControl, end, steps = 18) {
    for (let index = 1; index <= steps; index += 1) {
      const progress = index / steps;
      const inverse = 1 - progress;
      points.push({
        x: inverse ** 3 * start.x
          + 3 * inverse * inverse * progress * firstControl.x
          + 3 * inverse * progress * progress * secondControl.x
          + progress ** 3 * end.x,
        y: inverse ** 3 * start.y
          + 3 * inverse * inverse * progress * firstControl.y
          + 3 * inverse * progress * progress * secondControl.y
          + progress ** 3 * end.y
      });
    }
  }

  function resamplePath(points, spacing) {
    if (points.length < 2) {
      return points;
    }

    const segmentLengths = [];
    const cumulativeLengths = [0];

    for (let index = 1; index < points.length; index += 1) {
      const segmentLength = distance(points[index - 1], points[index]);
      segmentLengths.push(segmentLength);
      cumulativeLengths.push(cumulativeLengths[index - 1] + segmentLength);
    }

    const totalLength = cumulativeLengths[cumulativeLengths.length - 1];
    const result = [];
    const stepCount = Math.max(1, Math.round(totalLength / spacing));
    let segmentIndex = 0;

    for (let step = 0; step <= stepCount; step += 1) {
      const target = Math.min(totalLength, (step / stepCount) * totalLength);

      while (
        segmentIndex < segmentLengths.length - 1
        && cumulativeLengths[segmentIndex + 1] < target
      ) {
        segmentIndex += 1;
      }

      const segmentStart = cumulativeLengths[segmentIndex];
      const segmentLength = segmentLengths[segmentIndex] || 1;
      const progress = (target - segmentStart) / segmentLength;
      const start = points[segmentIndex];
      const end = points[segmentIndex + 1];

      result.push({
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress
      });
    }

    return result;
  }

  function missionRoute(width, height) {
    const points = [];
    const y = height * 0.32;
    const radius = width < 600 ? 34 : 48;
    const loopCenter = { x: width * 0.5, y };
    const loopSteps = width < 600 ? 11 : 14;
    const start = { x: -34, y };
    const loopStart = { x: loopCenter.x, y };
    const exit = { x: width + 34, y };

    addLine(points, start, loopStart, 58);

    for (let index = 1; index <= loopSteps; index += 1) {
      const theta = (index / loopSteps) * Math.PI * 2;
      points.push({
        x: loopCenter.x + Math.sin(theta) * radius,
        y: loopCenter.y + (1 - Math.cos(theta)) * radius
      });
    }

    addLine(points, loopStart, exit, 58);
    return points;
  }

  function contactRoute(width, height) {
    const content = document.querySelector(".contact-page-content");
    const heading = document.getElementById("contact-heading");

    if (!content || !heading) {
      return [];
    }

    const stageBox = stage.getBoundingClientRect();
    const contentBox = content.getBoundingClientRect();
    const headingBox = heading.getBoundingClientRect();
    const inset = width < 600 ? 24 : 54;
    const corner = width < 600 ? 18 : 28;
    const left = Math.max(22, contentBox.left - stageBox.left - inset);
    const right = Math.min(width - 22, contentBox.right - stageBox.left + inset);
    const top = Math.max(32, contentBox.top - stageBox.top - inset);
    const bottom = Math.min(height - 34, contentBox.bottom - stageBox.top + inset);
    const titleRight = headingBox.right - stageBox.left;
    const titleCenterY = headingBox.top - stageBox.top + headingBox.height * 0.52;
    const final = {
      x: Math.min(width - 25, titleRight + (width < 600 ? 21 : 28)),
      y: titleCenterY + (width < 600 ? 8 : 10)
    };
    const points = [];
    const start = { x: -34, y: top + corner };
    const upperLeft = { x: left, y: top + corner };
    const lowerLeft = { x: left, y: bottom - corner };
    const bottomLeft = { x: left + corner, y: bottom };
    const bottomRight = { x: right - corner, y: bottom };
    const lowerRight = { x: right, y: bottom - corner };
    const upperRight = { x: right, y: top + corner };
    const topRight = { x: right - corner, y: top };

    addLine(points, start, upperLeft, 10);
    addLine(points, upperLeft, lowerLeft, 10);
    addArc(points, lowerLeft, { x: left, y: bottom }, bottomLeft, 18);
    addLine(points, bottomLeft, bottomRight, 10);
    addArc(points, bottomRight, { x: right, y: bottom }, lowerRight, 18);
    addLine(points, lowerRight, upperRight, 10);
    addArc(points, upperRight, { x: right, y: top }, topRight, 18);
    addCubic(
      points,
      topRight,
      { x: topRight.x - Math.max(54, width * 0.08), y: top },
      { x: final.x + Math.max(48, width * 0.06), y: final.y - inset * 0.72 },
      final,
      24
    );

    return resamplePath(points, width < 600 ? 49 : 60);
  }

  function renderTrail() {
    stage.replaceChildren();

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const route = stage.dataset.pagePawTrail;
    const points = route === "contact"
      ? contactRoute(width, height)
      : missionRoute(width, height);
    let elapsedDelay = 0.65;

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
      const laneOffset = gait.side * (window.innerWidth < 600 ? 7.5 : 9);
      const angle = Math.atan2(directionY, directionX) * (180 / Math.PI) + 90;
      const paw = document.createElement("span");
      const isFinal = route === "contact" && index === points.length - 1;
      const pawAngle = isFinal
        ? 0
        : angle + gait.side * 1.5;

      paw.className = `paw-print page-trail-paw${isFinal ? " page-paw-final" : ""}`;
      paw.style.left = `${point.x + perpendicularX * laneOffset}px`;
      paw.style.top = `${point.y + perpendicularY * laneOffset}px`;
      paw.style.setProperty("--paw-angle", `${pawAngle}deg`);
      paw.style.setProperty("--paw-scale", gait.scale);
      paw.style.setProperty("--paw-duration", "4.1s");
      paw.style.setProperty("--paw-delay", `${elapsedDelay}s`);
      paw.innerHTML = pawSvg;
      stage.appendChild(paw);

      elapsedDelay += index % gaitPattern.length === gaitPattern.length - 1 ? 0.54 : 0.39;
    });
  }

  window.addEventListener("load", renderTrail, { once: true });
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderTrail, 180);
  });
})();
