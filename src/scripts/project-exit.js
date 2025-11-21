// src/scripts/project-exit.js
import gsap from "gsap";

function setupProjectExit() {
  const nextLink = document.getElementById("next-project-link");
  const prevLink = document.getElementById("prev-project-link");
  const overlay = document.getElementById("project-exit-overlay");

  if (!overlay) return;

  function handleClick(link, direction) {
    if (!link) return;

    link.addEventListener("click", (e) => {
      e.preventDefault();

      const href = link.getAttribute("href");
      if (!href) return;

      // doppelte Klicks verhindern
      if (overlay.classList.contains("animating")) return;
      overlay.classList.add("animating");

      // Farbe aus data-Attribut
      let color = "#000";
      if (direction === "next") {
        color =
          overlay.dataset.nextOverlayColor ||
          overlay.dataset.projectOverlayColor ||
          "#000";
      } else if (direction === "prev") {
        color =
          overlay.dataset.prevOverlayColor ||
          overlay.dataset.projectOverlayColor ||
          "#000";
      }

      color = color.trim();

      // Startzustand: je nach Richtung
      if (direction === "next") {
        // von links rein → 0 → 100vw
        gsap.set(overlay, {
          left: 0,
          right: "auto",
          width: 0,
          backgroundColor: color,
        });
      } else {
        // "prev": von rechts rein → 0 → 100vw
        gsap.set(overlay, {
          left: "auto",
          right: 0,
          width: 0,
          backgroundColor: color,
        });
      }

      // Flags + Farbe für die nächste Seite merken
      // (Naming fromProject bleibt erhalten)
      sessionStorage.setItem("fromProject", direction); // "next" oder "prev"
      sessionStorage.setItem("projectExitColor", color);

      gsap.to(overlay, {
        width: "100vw",
        duration: 0.65,
        ease: "power2.inOut",
        onComplete() {
          window.location.href = href;
        },
      });
    });
  }

  handleClick(nextLink, "next");
  handleClick(prevLink, "prev");
}

document.addEventListener("astro:page-load", setupProjectExit);
document.addEventListener("DOMContentLoaded", setupProjectExit);
