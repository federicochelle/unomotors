(async function () {
  const vehiclesApi = window.UNOMOTORS_VEHICLES_API;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const content = document.getElementById("vehicleContent");
  const layout = document.getElementById("vehicleLayout");
  const descriptionSection = document.getElementById("vehicleDescriptionSection");
  const notFound = document.getElementById("vehicleNotFound");

  const titleEl = document.getElementById("vehicleTitle");
  const priceEl = document.getElementById("vehiclePrice");
  const subtitleEl = document.getElementById("vehicleSubtitle");
  const financeEl = document.getElementById("vehicleFinance");
  const financeLabelEl = document.getElementById("vehicleFinanceLabel");
  const financeLogosEl = document.getElementById("vehicleFinanceLogos");
  const heroEl = document.getElementById("autoHero");
  const thumbsEl = document.getElementById("autoThumbs");
  const specsEl = document.getElementById("vehicleSpecs");
  const whatsappEl = document.getElementById("vehicleWhatsapp");
  const noteEl = document.getElementById("vehicleNote");
  const descriptionEl = document.getElementById("vehicleDescription");
  const featuresEl = document.getElementById("vehicleFeatures");
  const phoneEl = document.getElementById("vehiclePhone");
  const locationEl = document.getElementById("vehicleLocation");
  const backWrapperEl = document.getElementById("vehicleBackWrapper");
  const backLinkEl = document.getElementById("vehicleBackLink");
  const canonicalLinkEl = document.getElementById("canonicalLink");

  const visibleThumbs = 4;
  const hiddenStartIndex = visibleThumbs - 1;
  const siteUrl = "https://unomotors.uy";

  const specDefinitions = [
    { label: "Año", value: (vehicle) => String(vehicle.anio || "") },
    { label: "Kilómetros", value: (vehicle) => vehicle.specs?.kilometros || "" },
    { label: "Combustible", value: (vehicle) => vehicle.specs?.combustible || "" },
    { label: "Transmisión", value: (vehicle) => vehicle.specs?.transmision || "" },
    { label: "Motor", value: (vehicle) => vehicle.specs?.motor || "" },
    { label: "Color", value: (vehicle) => vehicle.specs?.color || "" },
  ];

  function setHidden(element, hidden) {
    if (!element) return;
    element.hidden = Boolean(hidden);
  }

  function createSpecItem(label, value) {
    const wrapper = document.createElement("div");
    wrapper.className = "spec-item";

    const dt = document.createElement("dt");
    dt.textContent = label;

    const dd = document.createElement("dd");
    dd.textContent = value;

    wrapper.append(dt, dd);
    return wrapper;
  }

  function createThumb(photo, extraClass, counterText) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = ["thumb", extraClass].filter(Boolean).join(" ");
    button.dataset.full = photo.src;

    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.alt || "";
    image.loading = "lazy";

    button.appendChild(image);

    if (counterText) {
      const counter = document.createElement("span");
      counter.textContent = counterText;
      button.appendChild(counter);
    }

    return button;
  }

  function renderThumbs(gallery) {
    thumbsEl.innerHTML = "";

    if (!Array.isArray(gallery) || gallery.length === 0) {
      return;
    }

    const hiddenCount = Math.max(gallery.length - visibleThumbs, 0);

    gallery.forEach((photo, index) => {
      if (index < hiddenStartIndex) {
        thumbsEl.appendChild(createThumb(photo));
        return;
      }

      if (index === hiddenStartIndex) {
        const counterText = hiddenCount > 0 ? `+${hiddenCount}` : "";
        const extraClass = hiddenCount > 0 ? "thumb-more" : "";
        thumbsEl.appendChild(createThumb(photo, extraClass, counterText));
        return;
      }

      thumbsEl.appendChild(createThumb(photo, "thumb-hidden"));
    });
  }

  function renderFinance(financiacion) {
    const logos = financiacion?.logos || [];
    const hasFinance = financiacion?.mostrar !== false && logos.length > 0;

    financeLogosEl.innerHTML = "";
    setHidden(financeEl, !hasFinance);

    if (!hasFinance) {
      return;
    }

    const hasLabel = Boolean(financiacion.label);
    setHidden(financeLabelEl, !hasLabel);
    financeLabelEl.textContent = hasLabel ? financiacion.label : "";

    logos.forEach((logo) => {
      const image = document.createElement("img");
      image.src = logo.src;
      image.alt = logo.alt || logo.nombre || "";
      image.loading = "lazy";
      financeLogosEl.appendChild(image);
    });
  }

  function renderDescription(vehicle) {
    descriptionEl.innerHTML = "";

    (vehicle.descripcion_parrafos || []).forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      descriptionEl.appendChild(p);
    });

    featuresEl.innerHTML = "";

    const hasFeatures = Array.isArray(vehicle.features) && vehicle.features.length > 0;
    setHidden(featuresEl, !hasFeatures);

    if (hasFeatures) {
      vehicle.features.forEach((feature) => {
        const item = document.createElement("li");
        item.textContent = feature;
        featuresEl.appendChild(item);
      });
    }

    const hasPhone = Boolean(vehicle.telefono);
    setHidden(phoneEl, !hasPhone);
    if (hasPhone) {
      const strong = document.createElement("strong");
      strong.textContent = "Teléfono:";
      phoneEl.replaceChildren(strong, document.createTextNode(` ${vehicle.telefono}`));
    } else {
      phoneEl.textContent = "";
    }

    const hasLocation = Boolean(vehicle.ubicacion);
    setHidden(locationEl, !hasLocation);
    locationEl.textContent = hasLocation ? vehicle.ubicacion : "";
  }

  function setMeta(selector, content) {
    const element = document.querySelector(selector);
    if (!element || !content) return;
    element.setAttribute("content", content);
  }

  function updateSeoMeta(vehicle, titleParts) {
    const absoluteUrl = new URL(window.location.pathname + window.location.search, siteUrl).href;
    const imageSource =
      vehicle.imagen_principal?.url ||
      vehicle.imagen_principal?.src ||
      "/assets/hero.jpg";
    const absoluteImage = new URL(imageSource, siteUrl).href;
    const description =
      vehicle.seo?.description ||
      `${titleParts} disponible en UnoMotors. Consultá precio, fotos, especificaciones y opciones de financiación.`;
    const title = vehicle.seo?.title || `${titleParts} | UnoMotors`;

    document.title = title;
    canonicalLinkEl?.setAttribute("href", absoluteUrl);

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', absoluteUrl);
    setMeta('meta[property="og:image"]', absoluteImage);
    setMeta('meta[property="og:image:secure_url"]', absoluteImage);
    setMeta(
      'meta[property="og:image:alt"]',
      vehicle.imagen_principal?.alt || `${titleParts} disponible en UnoMotors`,
    );
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', absoluteImage);
  }

  function renderVehicle(vehicle) {
    const titleParts = [vehicle.marca, vehicle.modelo, vehicle.version]
      .filter(Boolean)
      .join(" ");

    const year = document.createElement("span");
    year.textContent = vehicle.anio;
    titleEl.replaceChildren(document.createTextNode(`${titleParts} `), year);
    priceEl.textContent = vehicle.precio_texto || "";

    const hasSubtitle = Boolean(vehicle.subtitulo);
    setHidden(subtitleEl, !hasSubtitle);
    subtitleEl.textContent = hasSubtitle ? vehicle.subtitulo : "";

    renderFinance(vehicle.financiacion);

    heroEl.src = vehicle.imagen_principal?.src || "";
    heroEl.alt = vehicle.imagen_principal?.alt || titleParts;

    renderThumbs(vehicle.galeria || []);

    specsEl.innerHTML = "";
    specDefinitions.forEach(({ label, value }) => {
      const specValue = value(vehicle);
      if (!specValue) return;
      specsEl.appendChild(createSpecItem(label, specValue));
    });

    whatsappEl.href = vehicle.cta?.whatsapp_url || "#";
    whatsappEl.textContent = vehicle.cta?.whatsapp_texto || "Consultar por WhatsApp";

    const hasNote = Boolean(vehicle.cta?.nota);
    setHidden(noteEl, !hasNote);
    noteEl.textContent = hasNote ? vehicle.cta.nota : "";

    renderDescription(vehicle);

    backLinkEl.href = vehicle.cta?.volver_url || "../index.html";
    backLinkEl.textContent = vehicle.cta?.volver_texto || "← Volver al catálogo";

    updateSeoMeta(vehicle, titleParts);
  }

  let vehicle = null;

  try {
    if (vehiclesApi?.getVehicleBySlug) {
      vehicle = await vehiclesApi.getVehicleBySlug(slug);
    }
  } catch (_error) {
    vehicle = null;
  }

  if (!vehicle) {
    setHidden(content, true);
    setHidden(layout, true);
    setHidden(descriptionSection, true);
    setHidden(backWrapperEl, true);
    setHidden(notFound, false);
    document.title = "Vehículo no encontrado | UnoMotors";
    return;
  }

  setHidden(content, false);
  setHidden(layout, false);
  setHidden(descriptionSection, false);
  setHidden(backWrapperEl, false);
  setHidden(notFound, true);
  renderVehicle(vehicle);
  window.initVehicleLightbox?.();
})();
