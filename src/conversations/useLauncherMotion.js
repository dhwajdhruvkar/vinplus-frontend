import { useLayoutEffect, useRef } from "react";

// Expands from the launcher with a soft spring and funnels back into it on minimize.
export function useLauncherMotion(open, panelRef, launcherRef) {
  const animation = useRef(null);
  const initialized = useRef(false);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const launcher = launcherRef.current;
    if (!panel || !launcher) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previousStyle = animation.current ? getComputedStyle(panel) : null;
    const start = previousStyle
      ? {
          transform: previousStyle.transform,
          opacity: previousStyle.opacity,
          clipPath: previousStyle.clipPath,
        }
      : null;
    animation.current?.cancel();
    panel.style.visibility = "visible";

    // Measures the actual icon position so the animation also works on small screens.
    const bounds = panel.getBoundingClientRect();
    const icon = launcher.getBoundingClientRect();
    panel.style.transformOrigin = `${icon.left + icon.width / 2 - bounds.left}px ${bounds.height}px`;
    const distance = icon.top + icon.height / 2 - bounds.bottom;
    const collapsed = {
      transform: `translateY(${distance}px) scale(0.1, 0.025)`,
      opacity: 0,
      clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)",
    };
    const expanded = {
      transform: "translateY(0) scale(1)",
      opacity: 1,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    };

    // Finishes immediately for reduced motion and removes hidden controls from focus.
    function finish() {
      panel.style.visibility = open ? "visible" : "hidden";
      panel.style.willChange = "auto";
      animation.current?.cancel();
      animation.current = null;
    }

    if (
      (!initialized.current && !open) ||
      reduceMotion.matches ||
      !panel.animate
    ) {
      initialized.current = true;
      finish();
      return;
    }
    initialized.current = true;
    panel.style.willChange = "transform, opacity, clip-path";
    const keyframes = open
      ? [
          { ...(start || collapsed), offset: 0 },
          {
            transform: "translateY(-5px) scale(1.015, 1.02)",
            opacity: 1,
            clipPath: expanded.clipPath,
            offset: 0.74,
          },
          expanded,
        ]
      : [
          { ...(start || expanded), offset: 0 },
          {
            transform: "translateY(12px) scale(0.75, 0.94)",
            opacity: 0.85,
            clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)",
            offset: 0.3,
          },
          collapsed,
        ];
    animation.current = panel.animate(keyframes, {
      duration: open ? 460 : 340,
      easing: open ? "cubic-bezier(.16,1,.3,1)" : "cubic-bezier(.55,0,.8,.45)",
      fill: "both",
    });
    animation.current.onfinish = finish;
    // Honors a reduced-motion setting changed while an animation is running.
    const changeMotion = (event) => {
      if (event.matches) finish();
    };
    reduceMotion.addEventListener("change", changeMotion);
    return () => {
      reduceMotion.removeEventListener("change", changeMotion);
      if (animation.current) animation.current.onfinish = null;
    };
  }, [open, panelRef, launcherRef]);

  useLayoutEffect(() => () => animation.current?.cancel(), []);
}
