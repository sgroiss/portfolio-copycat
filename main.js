import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.defaults({
  // markers: true,
});

// Smooth Scroll
const lenis = new Lenis({ duration: 1.2, smooth: true });
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
lenis.on("scroll", ScrollTrigger.update);

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

// Marquee
async function initMarquee() {
  const marquee = document.querySelector("#intro-marquee");
  if (!marquee) return;
  await document.fonts.ready;

  const split = new SplitText(marquee, { type: "chars" });
  const chars = split.chars;

  gsap.to(marquee, {
    x: () => -window.innerWidth * 0.5,
    ease: "none",
    scrollTrigger: {
      trigger: "#intro",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  function updateWeights() {
    const centerX = window.innerWidth / 2;
    const sigma = window.innerWidth / 5;
    const baseWeight = 100;
    const maxWeight = 900;
    const range = maxWeight - baseWeight;

    chars.forEach((span) => {
      const { left, width } = span.getBoundingClientRect();
      const letterCenter = left + width / 2;
      const dist = Math.abs(letterCenter - centerX);
      const gaussian = Math.pow(
        Math.exp(-Math.pow(dist, 2) / (2 * Math.pow(sigma, 2))),
        2
      );
      const wght = baseWeight + gaussian * range;
      span.style.fontVariationSettings = `"wght" ${wght}`;
    });

    requestAnimationFrame(updateWeights);
  }

  requestAnimationFrame(updateWeights);
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

function initAboutImg() {
  const wrap = document.querySelector("#about-img-wrap");
  const overlay = document.querySelector("#about-overlay");
  if (!wrap || !overlay) return;

  // transform-origin → oben zentriert
  gsap.set(wrap, { transformOrigin: "50% 0%" });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#intro",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // 1️⃣ zuerst komplett schwarz werden
  tl.to(overlay, {
    opacity: 1,
    ease: "none",
    duration: 0.4, // erster Teil der Scrollstrecke
  });

  // 2️⃣ danach Kreis nach oben hin vergrößern
  tl.to(wrap, {
    scaleX: 20,
    scaleY: 6,
    borderRadius: "0vw",
    ease: "power2.in",
    duration: 0.6,
  });
}

// Start
initOverlapSections();
initMarquee();
initScrollSpeed();
initAboutImg();
