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
  window.lenis = lenis;

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

// Header ein/ausfaden
function initHeader() {
  const header = document.querySelector("#site-header");
  const velocityThreshold = 200;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      const dir = self.direction; // 1 = nach unten, -1 = nach oben
      const velocity = Math.abs(self.getVelocity());

      // Nach unten scrollen → Header ausblenden (bei genügend Geschwindigkeit)
      if (dir === 1 && velocity > velocityThreshold) {
        header.classList.replace("translate-y-0", "-translate-y-full");
      }

      // Nach oben scrollen → Header immer einblenden
      if (dir === -1) {
        header.classList.replace("-translate-y-full", "translate-y-0");
      }

      // Ganz oben → Header sicher sichtbar
      if (self.progress === 0) {
        header.classList.replace("-translate-y-full", "translate-y-0");
      }
    },
  });
}

// Footer Marquee Link Hover Effekts --------------------------------------
// alle Marquee-Links holen
function initFooterMarqueeLinks() {
  const marqueeLinks = document.querySelectorAll(".footer-marquee-link");

  // für jedes Element Enter/Leave registrieren
  marqueeLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      gsap.to(link, {
        color: "#fafafa",
        duration: 0.3,
        ease: "sine.out",
      });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(link, {
        color: "#323230",
        duration: 0.55,
        ease: "sine.inOut",
      });
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
        duration: 1,
        // offset: -80,
      });
    });
  });
}

function initDimSections() {
  document.querySelectorAll("section[data-dim]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 100%",
      end: "bottom 0%",
      scrub: true,
      // markers: true,
      onUpdate: (self) => {
        // Wert 0–1 schreiben
        let val = self.progress.toFixed(4) * -1 + 1.5;
        let val2 = val + 0.5;
        let val3 = val2 - self.progress.toFixed(4);
        section.style.setProperty("--dim", val3);
      },
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
  initDimSections();
  initAnchorScroll();
  initHeader();
  initFooterMarqueeLinks();

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
