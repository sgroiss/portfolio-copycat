// return false;

import gsap from "gsap";

let entryAnimationStarted = false;

// läuft nur sinnvoll auf Projekt-Detailseiten
function setupProjectEntryAnimation() {
  if (entryAnimationStarted) return;

  const entryTitle = document.getElementById("project-entry-hero-title");
  const main = document.querySelector("main");
  const content = document.getElementsByClassName("content-con");

  if (!entryTitle || !main) {
    return;
  }

  entryAnimationStarted = true;

  // Startzustände
  const barHeight = 100;
  const barTop = (window.innerHeight - barHeight) / 2;

  const tl = gsap.timeline({
    defaults: { ease: "power3.inOut" },
  });

  // 2. zum zentrierten Balken (mit Titel) werden
  tl.to(entryTitle, {
    height: barHeight,
    top: barTop,
    duration: 1.25,
    onComplete() {
      const rect = entryTitle.getBoundingClientRect();
      const parentRect = entryTitle.parentElement.getBoundingClientRect();
      const offsetTop = rect.top - parentRect.top;

      entryTitle.classList.remove("fixed");
      entryTitle.style.position = "absolute";
      entryTitle.style.top = `${offsetTop}px`;
    },
  });

  // 2. zum zentrierten Balken (mit Titel) werden
  tl.to(content, {
    opacity: 1,
    duration: 0.5,
  });
}

// Warten bis die Detailseite wirklich im DOM ist
function waitForEntryTitleAndRun() {
  const check = setInterval(() => {
    if (entryAnimationStarted) {
      clearInterval(check);
      return;
    }

    const entryTitle = document.getElementById("project-entry-hero-title");
    const main = document.querySelector("main");
    const overlay = document.getElementById("project-transition-overlay");
    const overlayBg = overlay?.querySelector(".project-transition-overlay-bg");

    if (entryTitle && main && overlay && overlayBg) {
      clearInterval(check);
      setupProjectEntryAnimation();
    }
  }, 20);
}

// Trigger bei Soft- und Hard-Navigation
document.addEventListener("astro:page-load", waitForEntryTitleAndRun);
document.addEventListener("astro:after-swap", waitForEntryTitleAndRun);
document.addEventListener("DOMContentLoaded", waitForEntryTitleAndRun);

// Falls der DOM schon fertig ist
waitForEntryTitleAndRun();
