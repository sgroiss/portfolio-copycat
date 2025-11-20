console.log("project-entry.js loaded");
import gsap from "gsap";

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

  // --- NEU: Funktion, die die eigentliche GSAP-Animation startet ---
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

  // --- NEU: Lenis-aware scrollToTop ---
  if (
    typeof window !== "undefined" &&
    window.lenis &&
    typeof window.lenis.scrollTo === "function"
  ) {
    // Scroll-Position sofort (ohne Ease) auf 0 setzen
    window.lenis.scrollTo(0, { immediate: true });
  } else {
    // Fallback, falls Lenis nicht verfügbar ist
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
document.addEventListener("DOMContentLoaded", handleAstroNavigation);

// Falls der DOM schon fertig ist (direkter Reload etc.)
handleAstroNavigation();
