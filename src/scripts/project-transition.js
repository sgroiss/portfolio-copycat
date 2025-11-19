console.log("project-transition.js loaded");
import gsap from "gsap";

document.querySelectorAll(".work-item").forEach((card) => {
  const link = card.querySelector("a"); // dein Detail-Link
  const overlay = card.querySelector(".project-overlay"); // dein Farboverlay
  const marquee = card.querySelector(".project-marquee");

  if (!link || !overlay) return;

  link.addEventListener("click", (event) => {
    event.preventDefault();
    const targetHref = link.getAttribute("href");
    if (!targetHref) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete() {
        sessionStorage.setItem("internalRef", "1");
        window.location.href = targetHref;
      },
    });

    tl.to(marquee, { opacity: 0, duration: 0.3 }, 0);
    tl.to(overlay, { opacity: 1, duration: 0.3 }, 0);

    tl.add(() => {
      const rect = overlay.getBoundingClientRect();

      const fixedOverlay = overlay.cloneNode(true);
      fixedOverlay.style.position = "fixed";
      fixedOverlay.style.top = `${rect.top}px`;
      fixedOverlay.style.left = `${rect.left}px`;
      fixedOverlay.style.width = `${rect.width}px`;
      fixedOverlay.style.height = `${rect.height}px`;
      fixedOverlay.style.margin = "0";
      fixedOverlay.style.pointerEvents = "none";
      fixedOverlay.style.zIndex = 500;
      document.body.appendChild(fixedOverlay);

      overlay.style.visibility = "hidden";

      tl.to(fixedOverlay, {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        duration: 0.7,
      });
    });
  });
});
