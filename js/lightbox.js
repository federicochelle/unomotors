(() => {
  const hero = document.getElementById("autoHero");
  const thumbsWrap = document.getElementById("autoThumbs");
  const openBtn = document.getElementById("openLightbox"); // opcional

  // Lightbox (tenés que tener estos ids en el modal)
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
    console.warn(
      "Faltan elementos: autoHero/autoThumbs o lightbox (lightbox, lbImage, lbPrev, lbNext, lbCounter).",
    );
    return;
  }

  const thumbs = Array.from(thumbsWrap.querySelectorAll(".thumb"));

  // ✅ fotos = [hero] + [thumbs] => total 4 (en tu caso 1 + 3)
  const photos = [
    hero.getAttribute("src"),
    ...thumbs.map((btn) => btn.dataset.full),
  ].filter(Boolean);

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
    // opcional: no vaciar para evitar flash si reabre rápido
    // lbImg.src = "";
  }

  // ✅ Click en HERO abre el lightbox (foto 1)
  hero.addEventListener("click", () => openLightbox(0));

  // ✅ Click en thumbs abre en esa (2,3,4)
  thumbs.forEach((btn, i) => {
    btn.addEventListener("click", () => openLightbox(i + 1));
  });

  // Botón "Ver fotos" (si existe)
  openBtn?.addEventListener("click", () => openLightbox(0));

  // Prev/Next
  lbPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    setLightbox(index - 1);
  });
  lbNext.addEventListener("click", (e) => {
    e.stopPropagation();
    setLightbox(index + 1);
  });

  // ✅ Cerrar (X o backdrop) con delegación
  lightbox.addEventListener("click", (e) => {
    // si clickeás algo que tenga data-close (backdrop o botón X)
    if (e.target.closest("[data-close]")) {
      closeLightbox();
    }
  });

  // Teclado
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") setLightbox(index - 1);
    if (e.key === "ArrowRight") setLightbox(index + 1);
  });
})();
