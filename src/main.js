document.documentElement.classList.add("js-enabled");

const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");
const productFrame = document.querySelector(".product-frame");
const sectionFocusTargets = new Map([
  ["workspace", document.querySelector("#workspace .product-frame")],
  ["principles", document.querySelector("#principles")],
  ["workflow", document.querySelector("#workflow .section-kicker")],
  ["deploy", document.querySelector("#deploy .closing-copy > p")],
]);

function closeNavigation() {
  menuButton?.setAttribute("aria-expanded", "false");
  navigation?.classList.remove("is-open");
}

menuButton?.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  navigation?.classList.toggle("is-open", !expanded);
});

navigation?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) closeNavigation();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavigation();
});

function getLayoutTop(target) {
  let top = 0;
  let element = target;

  while (element instanceof HTMLElement) {
    top += element.offsetTop;
    element = element.offsetParent;
  }

  return top;
}

function getAlignedScrollPosition(target, sectionId) {
  const sectionOffsets = {
    workspace: Math.min(260, Math.max(184, window.innerHeight * 0.3)),
    workflow: Math.min(120, Math.max(86, window.innerHeight * 0.13)),
  };
  const topAlignedOffset =
    sectionOffsets[sectionId] ?? Math.min(56, Math.max(36, window.innerHeight * 0.055));
  const absoluteTop = getLayoutTop(target) - topAlignedOffset;

  const maximumScroll = document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(0, Math.min(absoluteTop, maximumScroll));
}

function scrollToHash(hash, updateHistory = false) {
  const sectionId = hash.replace(/^#/, "");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (sectionId === "top") {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  } else {
    const target = sectionFocusTargets.get(sectionId);
    if (!(target instanceof HTMLElement)) return;
    window.scrollTo({
      top: getAlignedScrollPosition(target, sectionId),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  if (updateHistory && window.location.hash !== hash) history.pushState(null, "", hash);
}

document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!(link instanceof HTMLAnchorElement)) return;
  const hash = link.getAttribute("href");
  if (!hash || hash === "#") return;
  event.preventDefault();
  scrollToHash(hash, true);
});

window.addEventListener("popstate", () => {
  if (window.location.hash) scrollToHash(window.location.hash);
});

if (window.location.hash) {
  requestAnimationFrame(() => scrollToHash(window.location.hash));
}

const revealTargets = document.querySelectorAll(
  ".section-intro, .product-frame, .section-label, .feature-card, .workflow-copy, .control-card, .closing > *",
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8%", threshold: 0.12 },
  );

  for (const target of revealTargets) revealObserver.observe(target);
} else {
  for (const target of revealTargets) target.classList.add("is-visible");
}

productFrame?.addEventListener("pointermove", (event) => {
  const bounds = productFrame.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 100;
  const y = ((event.clientY - bounds.top) / bounds.height) * 100;
  productFrame.style.setProperty("--pointer-x", `${x}%`);
  productFrame.style.setProperty("--pointer-y", `${y}%`);
});
