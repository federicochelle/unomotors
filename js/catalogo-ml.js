(() => {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  // 1) Cambiá esto por tu URL real:
  const API = "https://unomotors-ml-proxy.vercel.app/api/ml/search";

  const money = (value, currency = "USD") => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return `${currency} ${n.toLocaleString("es-UY")}`;
  };

  // Helpers para “sacar” info desde ML (si viene en attributes)
  const getAttr = (attrs = [], id) =>
    attrs.find((a) => a.id === id)?.value_name || "";

  const buildCardHTML = (item) => {
    const id = item.id;

    // imagen: preferimos pictures[0] -> thumbnail
    const img = (item.pictures && item.pictures[0]) || item.thumbnail || "";

    // ejemplos de atributos típicos (pueden variar por publicación)
    const year =
      getAttr(item.attributes, "VEHICLE_YEAR") ||
      getAttr(item.attributes, "MODEL_YEAR");
    const km =
      getAttr(item.attributes, "KILOMETERS") ||
      getAttr(item.attributes, "ODOMETER");
    const version =
      getAttr(item.attributes, "TRIM") || getAttr(item.attributes, "VERSION");
    const brand = getAttr(item.attributes, "BRAND") || "";

    // tu UI:
    const title = item.title || `${brand}`.trim() || "Vehículo";
    const sub = version || "Consultar detalles";
    const metaParts = [];
    if (year) metaParts.push(year);
    if (km) metaParts.push(km.includes("km") ? km : `${km} km`);
    const meta = metaParts.join(" | ");

    const price = money(item.price, item.currency_id || "USD");

    // Detalle propio: recomendación -> una sola página detalle con query
    const href = `pages/auto.html?id=${encodeURIComponent(id)}`;

    return `
      <article class="gallery-item" role="listitem">
        <a href="${href}" aria-label="Consultar ${escapeHtml(title)}">
          <figure class="car-card">
            <div class="car-media">
              <img src="${escapeAttr(img)}" alt="${escapeAttr(title)}" loading="lazy" />
            </div>

            <figcaption class="car-body">
              <div class="car-info">
                <h3 class="car-title">${escapeHtml(title)}</h3>
                <p class="car-sub">${escapeHtml(sub)}</p>
                <p class="car-meta">${escapeHtml(meta)}</p>
              </div>
              <p class="car-price">${escapeHtml(price)}</p>
            </figcaption>
          </figure>
        </a>
      </article>
    `;
  };

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(str = "") {
    // mismo escape pero pensado para atributos
    return escapeHtml(str);
  }

  async function load() {
    // opcional: skeleton simple
    grid.innerHTML = <p class="text-muted">Cargando vehículos...</p>;

    try {
      const r = await fetch(API, { method: "GET" });
      const data = await r.json();

      if (!r.ok || !data?.ok) {
        grid.innerHTML = (
          <p class="text-muted">No se pudo cargar el catálogo.</p>
        );
        return;
      }

      const items = Array.isArray(data.results) ? data.results : [];

      if (!items.length) {
        grid.innerHTML = (
          <p class="text-muted">Todavía no hay vehículos publicados.</p>
        );
        return;
      }

      grid.innerHTML = items.map(buildCardHTML).join("");
    } catch (e) {
      grid.innerHTML = (
        <p class="text-muted">Error de red cargando el catálogo.</p>
      );
    }
  }

  load();
})();
