(async function () {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  const vehiclesApi = window.UNOMOTORS_VEHICLES_API;
  if (!vehiclesApi?.getVehicles) {
    grid.innerHTML = '<p class="text-muted">No se pudo inicializar el catálogo.</p>';
    return;
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function buildTitle(vehicle) {
    return [vehicle.marca, vehicle.modelo, vehicle.version]
      .filter(Boolean)
      .join(" ");
  }

  function buildYear(vehicle) {
    return vehicle.anio ? String(vehicle.anio) : "";
  }

  function buildFinance(logos = []) {
    if (!Array.isArray(logos) || logos.length === 0) {
      return "";
    }

    return `
      <div class="car-finance" aria-label="Opciones de financiación disponibles">
        ${logos
          .map(
            (logo) =>
              `<span class="car-finance__logo"><img src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.alt || logo.nombre || "")}" loading="lazy" /></span>`,
          )
          .join("")}
      </div>
    `;
  }

  function buildCard(vehicle) {
    const title = buildTitle(vehicle) || "Vehículo";
    const price = vehicle.precio_texto || "";
    const image =
      vehicle.imagen_principal?.src || vehicle.imagen_principal?.url || "";
    const imageAlt = vehicle.imagen_principal?.alt || title;
    const year = buildYear(vehicle);
    const href = `pages/auto.html?slug=${encodeURIComponent(vehicle.slug)}`;
    const finance = vehicle.financiacion?.mostrar === false
      ? ""
      : buildFinance(vehicle.financiacion?.logos);

    return `
      <article class="gallery-item" data-type="${escapeHtml(vehicle.tipo_vehiculo || "auto")}" role="listitem">
        <a class="car-card-link" href="${href}" target="_blank" rel="noopener" aria-label="Ver ${escapeHtml(title)}">
          <figure class="car-card">
            <div class="car-media">
              <img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt)}" loading="lazy" />
            </div>
            <figcaption class="car-card-body">
              <div class="car-card-main">
                <div class="car-copy">
                  <h3 class="car-title">${escapeHtml(title)}</h3>
                  ${year ? `<p class="car-year">${escapeHtml(year)}</p>` : ""}
                </div>
                <div class="car-card-aside">
                  <p class="car-price">${escapeHtml(price)}</p>
                  ${finance}
                </div>
              </div>
            </figcaption>
          </figure>
        </a>
      </article>
    `;
  }

  grid.innerHTML = '<p class="text-muted">Cargando vehículos...</p>';

  try {
    const vehicles = await vehiclesApi.getVehicles();
    console.log("[catalog-render] Vehicles received:", vehicles);

    const items = vehicles
      .filter((vehicle) => vehicle?.publicado !== false)
      .filter((vehicle) => vehicle?.archivado !== true)
      .sort(
        (a, b) =>
          (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER),
      );

    if (!items.length) {
      grid.innerHTML =
        '<p class="text-muted">Todavía no hay vehículos publicados.</p>';
      return;
    }

    grid.innerHTML = items.map(buildCard).join("");
  } catch (_error) {
    console.error("[catalog-render] Catalog render failed:", _error);
    grid.innerHTML =
      '<p class="text-muted">No se pudo cargar el catálogo en este momento.</p>';
  }
})();
