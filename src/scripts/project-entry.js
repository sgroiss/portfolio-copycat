// src/scripts/project-entry.js
console.log("project-entry.js loaded");
import gsap from "gsap";

function runProjectExitReverse(direction = "next") {
  const exitOverlay = document.getElementById("project-exit-overlay");
  const content = document.getElementById("project-content");
  const title = document.getElementById("project-title");

  if (!exitOverlay || !content || !title) return;

  // Farbe aus sessionStorage → Fallback: data-Attribut / aktuelles BG
  const storedColor = sessionStorage.getItem("projectExitColor");
  const fallbackColor =
    exitOverlay.dataset.projectOverlayColor ||
    window.getComputedStyle(exitOverlay).backgroundColor ||
    "#000";
  const color = (storedColor || fallbackColor).trim();

  // nach Verwendung direkt wieder löschen
  sessionStorage.removeItem("projectExitColor");

  // ursprüngliches Entry-Overlay entfernen, damit es nichts überdeckt
  const entryOverlay = document.getElementById("project-entry-animation");
  if (entryOverlay && entryOverlay.parentElement) {
    entryOverlay.parentElement.removeChild(entryOverlay);
  }

  // Scroll nach oben (Lenis-aware), damit der neue Screen "oben" startet
  if (
    typeof window !== "undefined" &&
    window.lenis &&
    typeof window.lenis.scrollTo === "function"
  ) {
    window.lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  // Startzustände für Reverse-Overlay + Content
  if (direction === "next") {
    // wir "gehen nach rechts" → Overlay hängt rechts, schrumpft von 100 → 0
    gsap.set(exitOverlay, {
      width: "100vw",
      left: "auto",
      right: 0,
      backgroundColor: color,
    });
  } else {
    // "prev" → wir "gehen nach links" → Overlay hängt links, schrumpft von 100 → 0
    gsap.set(exitOverlay, {
      width: "100vw",
      left: 0,
      right: "auto",
      backgroundColor: color,
    });
  }

  gsap.set(content, { opacity: 0 });
  gsap.set(title, { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.inOut" },
  });

  // 1) Overlay von der jeweiligen Seite "rausziehen" (100% → 0%)
  tl.to(exitOverlay, {
    width: 0,
    duration: 0.7,
  });

  // 2) Content + Titel einblenden
  tl.to(
    content,
    {
      opacity: 1,
      duration: 0.5,
    },
    "-=0.3",
  );

  tl.to(
    title,
    {
      opacity: 1,
      duration: 0.5,
    },
    "-=0.5",
  );
}

/**
 * Animation für die aktuelle Projekt-Detailseite starten
 */
function runProjectEntryAnimation() {
  const entryAnimation = document.getElementById("project-entry-animation");
  const entryStatic = document.getElementById("project-entry-static");
  const title = document.getElementById("project-title");
  const content = document.getElementById("project-content");
  const main = document.querySelector("main");

  // Wenn wir nicht auf einer Projektseite sind, abbrechen
  if (!entryAnimation || !entryStatic || !title || !content || !main) {
    return;
  }

  // Pro Seite nur einmal animieren
  if (entryAnimation.dataset.initialized === "1") {
    return;
  }
  entryAnimation.dataset.initialized = "1";

  const flag = sessionStorage.getItem("internalRef");
  if (flag === "1") {
    sessionStorage.removeItem("internalRef");
  }

  // Kommen wir von einer anderen Projektseite?
  const fromProject = sessionStorage.getItem("fromProject"); // "next" | "prev" | null
  if (fromProject === "next" || fromProject === "prev") {
    sessionStorage.removeItem("fromProject");
    runProjectExitReverse(fromProject);
    return; // wichtige: normale Entry-Animation NICHT mehr laufen lassen
  }

  // --- normale Entry-Animation (von Home etc.) ---
  function startAnimation() {
    const staticRect = entryStatic.getBoundingClientRect();
    const targetHeight = staticRect.height;
    const targetTop = staticRect.top;

    // Startzustände
    gsap.set(content, { opacity: 0 });
    gsap.set(title, { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
    });

    console.log("Project entry animation run");

    // 1. Titel einfaden
    tl.to(title, {
      opacity: 1,
      duration: 0.25,
    });

    // 2. Balken von full/fixed in die Statik überführen
    tl.to(entryAnimation, {
      height: targetHeight,
      top: targetTop,
      duration: 0.65,
      onComplete() {
        const rect = entryAnimation.getBoundingClientRect();
        const parentRect = entryAnimation.parentElement.getBoundingClientRect();
        const offsetTop = rect.top - parentRect.top;

        entryAnimation.classList.remove("fixed");
        entryAnimation.style.position = "absolute";
        entryAnimation.style.top = `${offsetTop}px`;
      },
    });

    // 3. Content einfaden
    tl.to(content, {
      opacity: 1,
      duration: 0.5,
    });
  }

  // --- Lenis-aware scrollToTop für normalen Entry ---
  if (
    typeof window !== "undefined" &&
    window.lenis &&
    typeof window.lenis.scrollTo === "function"
  ) {
    window.lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  // WICHTIG: Erst im nächsten Frame messen, wenn das Scrollen wirklich "angekommen" ist
  requestAnimationFrame(startAnimation);
}

/**
 * Callback, der nach einem Astro-Navigationsevent die Animation triggert
 */
function handleAstroNavigation() {
  // kleiner Timeout, damit der neue DOM sicher steht
  setTimeout(runProjectEntryAnimation, 0);
}

// Events von Astro + klassisches DOMContentLoaded
document.addEventListener("astro:page-load", handleAstroNavigation);
document.addEventListener("astro:after-swap", handleAstroNavigation);
document.addEventListener("astro:before-swap", () => {
  const main = document.querySelector("main[data-project-slug]");
  if (!main) return;

  sessionStorage.setItem("lastProjectSlug", main.dataset.projectSlug);
  sessionStorage.setItem("lastProjectIndex", main.dataset.projectIndex);
  sessionStorage.setItem("lastProjectTotal", main.dataset.projectTotal);
});
document.addEventListener("DOMContentLoaded", handleAstroNavigation);

// Falls der DOM schon fertig ist (direkter Reload etc.)
handleAstroNavigation();
