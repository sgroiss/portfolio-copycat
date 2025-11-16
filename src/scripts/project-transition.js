import gsap from "gsap";

function setupProjectExitAnimation() {
  const links = document.querySelectorAll(".js-project-link");
  if (!links.length) return;

  const overlay = document.getElementById("project-transition-overlay");
  if (!overlay) return;

  const overlayBg = overlay.querySelector(".project-transition-overlay-bg");
  const overlayMarqueeInner = overlay.querySelector(
    ".project-transition-marquee__inner",
  );

  if (!overlayBg || !overlayMarqueeInner) return;

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      // Nur Link-Clicks behandeln, keine Modifier (CMD/CTRL)
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();

      const href = link.getAttribute("href");
      if (!href) return;

      const card = link.querySelector(".project-card");
      const overlayColor = link.getAttribute("data-overlay-color") || "#000";
      const projectTitle = link.getAttribute("data-project-title") || "";

      if (!card) {
        window.location.href = href;
        return;
      }

      const rect = card.getBoundingClientRect();

      // Overlay für Animation vorbereiten
      overlay.style.display = "block";
      overlay.style.position = "fixed";
      overlay.style.top = `${rect.top}px`;
      overlay.style.left = `${rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.pointerEvents = "none";

      overlayBg.style.backgroundColor = overlayColor;
      overlayMarqueeInner.textContent = `${projectTitle} — ${projectTitle} — ${projectTitle} — ${projectTitle}`;

      // Body-Scroll optional sperren
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const tl = gsap.timeline({
        onComplete() {
          document.body.style.overflow = previousOverflow;
          window.location.href = href;
        },
      });

      // Startzustand
      gsap.set(overlay, { opacity: 1 });
      gsap.set(overlayBg, { opacity: 0.9 });
      gsap.set(overlayMarqueeInner, { opacity: 1 });

      // Marquee schnell ausblenden + Overlay voll deckend machen
      tl.to(
        overlayMarqueeInner,
        {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        },
        0,
      );

      tl.to(
        overlayBg,
        {
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
        },
        0,
      );

      // Overlay von Card-Größe auf Fullscreen animieren
      tl.to(
        overlay,
        {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          duration: 0.6,
          ease: "power3.inOut",
        },
        0,
      );
    });
  });
}

// Für Astro View Transitions + ClientRouter:
// Code immer nach einer Navigation neu laufen lassen.
document.addEventListener("astro:page-load", () => {
  setupProjectExitAnimation();
});
