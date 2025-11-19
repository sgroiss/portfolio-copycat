console.log("project-entry.js loaded");
import gsap from "gsap";

let entryAnimation = document.getElementById("project-entry-animation");
let entryStatic = document.getElementById("project-entry-static");
let title = document.getElementById("project-title");
let main = document.querySelector("main");
let content = document.getElementById("project-content");
let contentHeroImg = document.querySelector(".project-content-hero-img");

let flag = sessionStorage.getItem("internalRef");
if (flag == "1") {
  sessionStorage.removeItem("internalRef");
  doAnimation();
} else {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  doAnimation();
}

function doAnimation() {
  let entryAnimationStarted = false;

  // läuft nur sinnvoll auf Projekt-Detailseiten
  function setupProjectEntryAnimation() {
    if (entryAnimationStarted) return;

    if (!entryAnimation || !main) {
      return;
    }
    entryAnimationStarted = true;

    // Startzustände
    const staticRect = entryStatic.getBoundingClientRect();
    const targetHeight = staticRect.height;
    const targetTop = staticRect.top;

    let tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
    });

    // 1. title einfaden
    tl.to(title, {
      opacity: 1,
      duration: 0.25,
    });

    // 2. zum zentrierten Balken (mit Titel) werden
    tl.to(entryAnimation, {
      height: targetHeight,
      top: targetTop,
      duration: 0.65,
      onComplete() {
        let rect = entryAnimation.getBoundingClientRect();
        let parentRect = entryAnimation.parentElement.getBoundingClientRect();
        let offsetTop = rect.top - parentRect.top;

        entryAnimation.classList.remove("fixed");
        entryAnimation.style.position = "absolute";
        entryAnimation.style.top = `${offsetTop}px`;
      },
    });

    // 3. content einfaden
    tl.to(content, {
      opacity: 1,
      duration: 0.5,
    });
  }

  // Warten bis die Detailseite wirklich im DOM ist
  function waitForEntryTitleAndRun() {
    let check = setInterval(() => {
      if (entryAnimationStarted) {
        clearInterval(check);
        return;
      }

      let entryAnimation = document.getElementById("project-entry-animation");
      let main = document.querySelector("main");
      let overlay = document.getElementById("project-transition-overlay");
      let overlayBg = overlay?.querySelector(".project-transition-overlay-bg");

      if (entryAnimation && main) {
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
}
