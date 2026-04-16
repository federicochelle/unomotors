(function () {
  function initVehicleLightbox() {
    const hero = document.getElementById("autoHero");
    const thumbsWrap = document.getElementById("autoThumbs");
    const openBtn = document.getElementById("openLightbox");
    const lightbox = document.getElementById("lightbox");
    const lbImg = document.getElementById("lbImage");
    const lbPrev = document.getElementById("lbPrev");
    const lbNext = document.getElementById("lbNext");
    const lbCounter = document.getElementById("lbCounter");

    if (
      !hero ||
      !thumbsWrap ||
      !lightbox ||
      !lbImg ||
      !lbPrev ||
      !lbNext ||
      !lbCounter
    ) {
      return false;
    }

    if (lightbox.dataset.initialized === "true") {
      return true;
    }

    const thumbs = Array.from(thumbsWrap.querySelectorAll(".thumb"));
    const photos = [
      hero.getAttribute("src"),
      ...thumbs.map((btn) => btn.dataset.full),
    ].filter(Boolean);

    if (!photos.length) {
      return false;
    }

    let index = 0;

    const norm = (i) => ((i % photos.length) + photos.length) % photos.length;

    function setLightbox(i) {
      index = norm(i);
      lbImg.src = photos[index];
      lbCounter.textContent = `${index + 1} / ${photos.length}`;
    }

    function openLightbox(i) {
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setLightbox(i);
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    hero.addEventListener("click", () => openLightbox(0));

    thumbs.forEach((btn, i) => {
      btn.addEventListener("click", () => openLightbox(i + 1));
    });

    openBtn?.addEventListener("click", () => openLightbox(0));

    lbPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      setLightbox(index - 1);
    });

    lbNext.addEventListener("click", (e) => {
      e.stopPropagation();
      setLightbox(index + 1);
    });

    lightbox.addEventListener("click", (e) => {
      const dialog = lightbox.querySelector(".lightbox-dialog");

      if (e.target.closest("[data-close]")) {
        closeLightbox();
        return;
      }

      if (!dialog.contains(e.target)) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") setLightbox(index - 1);
      if (e.key === "ArrowRight") setLightbox(index + 1);
    });

    lightbox.dataset.initialized = "true";
    return true;
  }

  window.initVehicleLightbox = initVehicleLightbox;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVehicleLightbox, {
      once: true,
    });
  } else {
    initVehicleLightbox();
  }
})();
