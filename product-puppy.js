(() => {
  const stage = document.querySelector(".product-title-stage");
  const title = document.querySelector("#products-heading .product-title-text");
  const puppy = document.querySelector(".product-puppy");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!stage || !title || !puppy || reducedMotion.matches) {
    return;
  }

  let routeAnimation;
  let resizeTimer;

  const pose = (x, y, rotation = 0, scaleX = 1, scaleY = 1) =>
    `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;

  function playRoute() {
    routeAnimation?.cancel();

    const stageBox = stage.getBoundingClientRect();
    const titleBox = title.getBoundingClientRect();
    const puppyBox = puppy.getBoundingClientRect();
    const puppyWidth = puppyBox.width || 74;
    const puppyHeight = puppyBox.height || 53;
    const titleLeft = titleBox.left - stageBox.left;
    const titleRight = titleBox.right - stageBox.left;
    const titleTop = titleBox.top - stageBox.top;
    const lineY = stageBox.height - 31;
    const groundY = lineY - puppyHeight;
    const titleY = titleTop - puppyHeight + 7;
    const approachX = titleLeft - puppyWidth * 0.82;
    const failedTouchX = titleLeft - puppyWidth * 0.42;
    const titleStartX = titleLeft + puppyWidth * 0.04;
    const titleEndX = titleRight - puppyWidth * 0.78;
    const landingX = titleRight + puppyWidth * 0.05;

    puppy.style.opacity = "0";

    routeAnimation = puppy.animate([
      { offset: 0, transform: pose(-puppyWidth, groundY), opacity: 0, easing: "ease-out" },
      { offset: 0.035, transform: pose(-puppyWidth * 0.72, groundY), opacity: 1, easing: "linear" },
      { offset: 0.19, transform: pose(approachX, groundY), opacity: 1, easing: "linear" },

      { offset: 0.215, transform: pose(approachX + 3, groundY + 3, -3, 1.05, 0.9), opacity: 1, easing: "cubic-bezier(.3,.05,.4,1)" },
      { offset: 0.245, transform: pose(failedTouchX, titleY + 28, -12, 0.96, 1.05), opacity: 1, easing: "ease-out" },
      { offset: 0.262, transform: pose(failedTouchX + 4, titleY + 24, -7, 1.01, 0.98), opacity: 1, easing: "ease-in-out" },
      { offset: 0.278, transform: pose(failedTouchX - 2, titleY + 31, 5, 1.03, 0.95), opacity: 1, easing: "ease-in" },
      { offset: 0.305, transform: pose(approachX + 5, groundY - 15, 9, 0.98, 1.03), opacity: 1, easing: "ease-in" },
      { offset: 0.325, transform: pose(approachX, groundY, 0, 1.05, 0.93), opacity: 1, easing: "ease-out" },

      { offset: 0.35, transform: pose(approachX + 3, groundY + 4, -4, 1.08, 0.87), opacity: 1, easing: "cubic-bezier(.2,.8,.3,1)" },
      { offset: 0.39, transform: pose(titleStartX - 10, titleY - 24, -10, 0.95, 1.06), opacity: 1, easing: "ease-in" },
      { offset: 0.425, transform: pose(titleStartX, titleY + 3, 3, 1.05, 0.95), opacity: 1, easing: "ease-out" },
      { offset: 0.45, transform: pose(titleStartX + 7, titleY, 0, 1, 1), opacity: 1, easing: "linear" },

      { offset: 0.69, transform: pose(titleEndX, titleY, 0, 1, 1), opacity: 1, easing: "linear" },
      { offset: 0.715, transform: pose(titleEndX + 3, titleY + 3, 4, 1.05, 0.9), opacity: 1, easing: "ease-out" },
      { offset: 0.755, transform: pose(landingX - 6, groundY - 28, 10, 0.97, 1.04), opacity: 1, easing: "ease-in" },
      { offset: 0.79, transform: pose(landingX, groundY + 2, 2, 1.06, 0.93), opacity: 1, easing: "ease-out" },
      { offset: 0.82, transform: pose(landingX + 8, groundY, 0, 1, 1), opacity: 1, easing: "linear" },

      { offset: 0.96, transform: pose(stageBox.width + puppyWidth * 0.2, groundY), opacity: 1, easing: "linear" },
      { offset: 1, transform: pose(stageBox.width + puppyWidth, groundY), opacity: 0, easing: "linear" }
    ], {
      duration: 17800,
      delay: 900,
      fill: "both"
    });
  }

  window.addEventListener("load", playRoute, { once: true });
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(playRoute, 180);
  });
})();
