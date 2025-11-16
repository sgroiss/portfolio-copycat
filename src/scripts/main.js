import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let lenis; // globale Referenz für andere Funktionen
let lenisInitialized = false;

// Lenis nur einmal booten
function setupLenis() {
  if (lenisInitialized || typeof window === "undefined") return;

  lenis = new Lenis({ duration: 1.2, smooth: true });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on("scroll", ScrollTrigger.update);
  lenisInitialized = true;
}

// Overlap Scroll
function initOverlapSections() {
  const sections = Array.from(document.querySelectorAll("section"));
  sections.forEach((section, i) => {
    // Basis-Trigger aktiv halten (sonst kein Refresh)
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      markers: false,
    });

    if (!section.hasAttribute("data-overlap-previous")) return;
    const prev = sections[i - 1];
    if (!prev) return;
    const speed = parseFloat(section.getAttribute("data-overlap-speed")) || 0.5;

    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "top top",
      scrub: true,
      markers: false,
      onUpdate: (self) => {
        const slowY = self.progress * window.innerHeight * speed;
        gsap.set(prev, { y: slowY });
      },
      onLeave: () => gsap.to(prev, { y: 0, duration: 0.6 }),
      onEnterBack: () => gsap.to(prev, { y: 0, duration: 0.6 }),
    });
  });
}

// Parallax / Scroll-Speed
function initScrollSpeed() {
  document.querySelectorAll("[data-scroll-speed]").forEach((el) => {
    const speed = parseFloat(el.dataset.scrollSpeed);
    if (isNaN(speed) || speed === 1) return;

    gsap.to(el, {
      y: () => (1 - speed) * window.innerHeight,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

function initAnchorScroll() {
  if (!lenis) return;

  const links = document.querySelectorAll(
    'a[data-anchor-scroll="true"][href^="#"]',
  );

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      lenis.scrollTo(target, {
        duration: 1.2,
        offset: -80,
      });
    });
  });
}

// Alles, was pro Seite neu initialisiert werden muss
function initPageAnimations() {
  setupLenis();

  // alte ScrollTrigger killen, damit bei Page-Wechsel nichts doppelt läuft
  ScrollTrigger.getAll().forEach((t) => t.kill());

  initOverlapSections();
  initScrollSpeed();
  initAnchorScroll();

  ScrollTrigger.refresh();
}

// Start nur im Browser + View-Transition aware
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.defaults({
    // markers: true,
  });

  // Wird bei Astro-Page-Load / View-Transition gefeuert
  document.addEventListener("astro:page-load", () => {
    initPageAnimations();
  });

  // Fallback fürs allererste Laden, falls astro:page-load nicht feuert
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initPageAnimations();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      initPageAnimations();
    });
  }
}
