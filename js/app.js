const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const overlay = document.querySelector(".menu-overlay");
const closeTargets = document.querySelectorAll("[data-menu-close]");
const loader = document.querySelector(".loader");
const shouldSkipLoader = document.documentElement.classList.contains("skip-loader");

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || event.defaultPrevented) return;

  if (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0 ||
    link.hasAttribute("download") ||
    (link.target && link.target !== "_self")
  ) {
    return;
  }

  const href = link.getAttribute("href");
  if (!href || href.startsWith("#")) return;

  try {
    const targetUrl = new URL(link.href, window.location.href);
    const isHttp = targetUrl.protocol === "http:" || targetUrl.protocol === "https:";
    const changesPage =
      targetUrl.pathname !== window.location.pathname ||
      targetUrl.search !== window.location.search;

    if (isHttp && targetUrl.origin === window.location.origin && changesPage) {
      sessionStorage.setItem("internalNavigation", "true");
    }
  } catch (_error) {}
});

window.addEventListener("load", () => {
  if (!loader || shouldSkipLoader) return;

  window.setTimeout(() => {
    loader.classList.add("hide");
  }, 4000);
});

if (header?.classList.contains("site-header--overlay")) {
  const syncHeaderScrollState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  syncHeaderScrollState();
  window.addEventListener("scroll", syncHeaderScrollState, { passive: true });
}

if (header && toggle && mobileMenu && overlay) {
  const openMenu = () => {
    header.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    overlay.hidden = false;
    mobileMenu.hidden = false;

    const firstLink = mobileMenu.querySelector("a, button");
    firstLink?.focus();
  };

  const closeMenu = () => {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    overlay.hidden = true;
    mobileMenu.hidden = true;
    toggle.focus();
  };

  const isOpen = () => header.classList.contains("is-open");

  // Toggle botón hamburguesa
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  // Click en overlay
  overlay.addEventListener("click", closeMenu);

  // Click en links del menú
  closeTargets.forEach((el) => el.addEventListener("click", closeMenu));

  // ⬅️ CLICK AFUERA REAL
  document.addEventListener("click", (e) => {
    if (!isOpen()) return;

    const clickedInsideMenu =
      mobileMenu.contains(e.target) || toggle.contains(e.target);

    if (!clickedInsideMenu) {
      closeMenu();
    }
  });

  // Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  // Resize → cierra si pasa a desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && isOpen()) closeMenu();
  });
}

const revealSections = document.querySelectorAll(".reveal-section");

if (revealSections.length) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealSections.forEach((section) => section.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealSections.forEach((section) => revealObserver.observe(section));
  }
}
