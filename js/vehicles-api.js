(function () {
  const supabaseState = window.UNOMOTORS_SUPABASE || {};
  const client = supabaseState.client || null;

  function escapeWhatsAppText(text = "") {
    return encodeURIComponent(String(text).trim());
  }

  function buildTitle(vehicle) {
    return [vehicle.marca, vehicle.modelo, vehicle.version]
      .filter(Boolean)
      .join(" ");
  }

  function normalizeArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        return [];
      }
    }
    return [];
  }

  function normalizeObject(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch (_error) {
        return {};
      }
    }

    return {};
  }

  function formatPrice(value, currency = "USD") {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "";
    return `${currency} ${amount.toLocaleString("es-UY")}`;
  }

  function formatKilometers(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "";
    return `${amount.toLocaleString("es-UY")} km`;
  }

  const financeLogoMap = {
    santander: "/assets/miauto.png",
    cash: "/assets/logo-cash.webp",
    mercado_pago: "/assets/mercado.png",
    unomotors: "/assets/logonegro.png",
  };

  function normalizeAssetPath(value = "") {
    if (!value || typeof value !== "string") return "";

    const trimmed = value.trim();

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/")
    ) {
      return trimmed;
    }

    if (trimmed.startsWith("../")) {
      return trimmed.replace(/^(\.\.\/)+/, "");
    }

    return trimmed;
  }

  function normalizeImage(value, fallbackAlt, fallbackPath = "") {
    if (value && typeof value === "object" && value.src) {
      return {
        path: value.path || fallbackPath,
        src: value.src,
        url: value.url || value.src,
        alt: value.alt || fallbackAlt,
      };
    }

    if (typeof value === "string" && value) {
      return {
        path: fallbackPath,
        src: value,
        url: value,
        alt: fallbackAlt,
      };
    }

    return {
      path: fallbackPath,
      src: "",
      url: "",
      alt: fallbackAlt,
    };
  }

  function normalizeGallery(value, fallbackAlt) {
    return normalizeArray(value)
      .map((item, index) => {
        if (item && typeof item === "object" && (item.src || item.url || item.path)) {
          const src = item.src || item.url || item.path || "";
          return {
            path: item.path || "",
            src,
            url: item.url || src,
            alt: item.alt || `${fallbackAlt} - foto ${index + 1}`,
            orden: Number.isFinite(Number(item.orden)) ? Number(item.orden) : index + 1,
          };
        }

        if (typeof item === "string" && item) {
          return {
            path: "",
            src: item,
            url: item,
            alt: `${fallbackAlt} - foto ${index + 1}`,
            orden: index + 1,
          };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.orden - b.orden);
  }

  function normalizeFinance(value) {
    const finance = normalizeObject(value);
    const logos = normalizeArray(finance.logos || finance.items || finance.images)
      .map((logo) => {
        if (logo && typeof logo === "object" && logo.src) {
          return {
            src: logo.src,
            alt: logo.alt || logo.nombre || "",
            nombre: logo.nombre || "",
          };
        }

        if (logo && typeof logo === "object") {
          const key = String(logo.key || logo.id || logo.nombre || "")
            .trim()
            .toLowerCase();
          const mappedSrc = financeLogoMap[key] || "";

          if (!mappedSrc) {
            return null;
          }

          return {
            src: mappedSrc,
            alt: logo.alt || logo.nombre || key,
            nombre: logo.nombre || key,
          };
        }

        if (typeof logo === "string" && logo) {
          const key = logo.trim().toLowerCase();
          const mappedSrc = financeLogoMap[key];

          if (mappedSrc) {
            return {
              src: mappedSrc,
              alt: key,
              nombre: key,
            };
          }

          return {
            src: logo,
            alt: "",
            nombre: "",
          };
        }

        return null;
      })
      .filter(Boolean);

    return {
      mostrar: finance.mostrar !== false && logos.length > 0,
      label: finance.label || "",
      logos,
    };
  }

  function normalizeCta(value, fallbackTitle) {
    const cta = normalizeObject(value);
    const whatsappUrl =
      cta.whatsapp_url ||
      `https://wa.me/59898137941?text=${escapeWhatsAppText(`Hola, me interesa ${fallbackTitle}`)}`;

    return {
      whatsapp_url: whatsappUrl,
      whatsapp_texto: cta.whatsapp_texto || "Consultar por WhatsApp",
      nota: cta.nota || "Respuesta en el día · Coordinamos visita",
      volver_url: cta.volver_url || "../index.html",
      volver_texto: cta.volver_texto || "← Volver al catálogo",
    };
  }

  function normalizeSeo(value, fallbackTitle) {
    const seo = normalizeObject(value);
    return {
      title: seo.title || `${fallbackTitle} | UnoMotors`,
      description: seo.description || "",
    };
  }

  function mapVehicleRow(row) {
    if (!row || typeof row !== "object") return null;

    if (
      row.specs &&
      row.imagen_principal &&
      Array.isArray(row.galeria) &&
      "src" in row.imagen_principal
    ) {
      return row;
    }

    const marca = row.marca || "";
    const modelo = row.modelo || "";
    const version = row.version || "";
    const anio = row.anio || row.year || "";
    const title = [marca, modelo, version, anio].filter(Boolean).join(" ").trim();

    const legacyImage = normalizeObject(row.imagen_principal);
    const imagenPrincipal = {
      path:
        row.imagen_principal_path ||
        legacyImage.path ||
        "",
      src:
        normalizeAssetPath(row.imagen_principal_src) ||
        normalizeAssetPath(row.imagen_principal_url) ||
        normalizeAssetPath(legacyImage.src) ||
        normalizeAssetPath(legacyImage.url) ||
        "",
      url:
        normalizeAssetPath(row.imagen_principal_src) ||
        row.imagen_principal_url ||
        normalizeAssetPath(legacyImage.url) ||
        normalizeAssetPath(legacyImage.src) ||
        "",
      alt:
        row.imagen_principal_alt ||
        legacyImage.alt ||
        `${marca} ${modelo}`.trim() ||
        "Vehículo",
    };
    console.log("IMAGE MAP DEBUG:", {
      slug: row.slug || "",
      src: imagenPrincipal.src,
      alt: imagenPrincipal.alt,
    });
    const gallery = normalizeGallery(row.galeria, title || "Vehículo");
    const finance = normalizeFinance(row.financiacion);

    return {
      id: row.id || row.slug || "",
      slug: row.slug || "",
      tipo_vehiculo: row.tipo_vehiculo || "auto",
      marca,
      modelo,
      version,
      anio,
      precio: row.precio ?? null,
      moneda: row.moneda || "USD",
      precio_texto: row.precio_texto || formatPrice(row.precio, row.moneda || "USD"),
      subtitulo: row.subtitulo || "",
      specs: {
        kilometros:
          row.specs?.kilometros ||
          row.kilometros_texto ||
          formatKilometers(row.kilometros),
        combustible: row.specs?.combustible || row.combustible || "",
        transmision: row.specs?.transmision || row.transmision || "",
        motor: row.specs?.motor || row.motor || "",
        color: row.specs?.color || row.color || "",
      },
      descripcion_parrafos:
        normalizeArray(row.descripcion_parrafos).filter((item) => typeof item === "string"),
      features: normalizeArray(row.features).filter((item) => typeof item === "string"),
      telefono: row.telefono || "",
      ubicacion: row.ubicacion || "",
      imagen_principal: imagenPrincipal,
      galeria: gallery,
      financiacion: finance,
      cta: normalizeCta(row.cta, title || "el vehículo"),
      seo: normalizeSeo(row.seo, title || "Vehículo"),
      publicado: row.publicado !== false,
      destacado: row.destacado === true,
      orden: Number.isFinite(Number(row.orden)) ? Number(row.orden) : Number.MAX_SAFE_INTEGER,
    };
  }

  async function fetchVehiclesFromSupabase() {
    if (!client) {
      throw new Error("Supabase no está configurado.");
    }

    const { data, error } = await client
      .from("vehicles")
      .select("*")
      .eq("publicado", true)
      .order("orden", { ascending: true });

    if (error) {
      console.error("[vehicles-api] Supabase query error (catalog):", error);
      throw error;
    }

    console.log("[vehicles-api] Supabase query result (catalog):", data);
    return Array.isArray(data) ? data.map(mapVehicleRow).filter(Boolean) : [];
  }

  async function fetchVehicleBySlugFromSupabase(slug) {
    if (!client) {
      throw new Error("Supabase no está configurado.");
    }

    const { data, error } = await client
      .from("vehicles")
      .select("*")
      .eq("slug", slug)
      .eq("publicado", true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[vehicles-api] Supabase query error (detail):", error);
      throw error;
    }

    console.log("[vehicles-api] Supabase query result (detail):", data);
    return data ? mapVehicleRow(data) : null;
  }

  function getMockVehicles() {
    return Array.isArray(window.UNO_MOTORS_VEHICLES)
      ? window.UNO_MOTORS_VEHICLES.map(mapVehicleRow).filter(Boolean)
      : [];
  }

  async function getVehicles() {
    try {
      const vehicles = await fetchVehiclesFromSupabase();
      console.log("[vehicles-api] Source: Supabase", vehicles);
      return vehicles;
    } catch (error) {
      const fallback = getMockVehicles();

      if (fallback.length) {
        console.warn("[vehicles-api] Source: mock fallback", error, fallback);
        return fallback;
      }

      console.error("[vehicles-api] No Supabase data and no mock fallback.", error);
      throw error;
    }
  }

  async function getVehicleBySlug(slug) {
    if (!slug) return null;

    try {
      const vehicle = await fetchVehicleBySlugFromSupabase(slug);
      console.log("[vehicles-api] Detail source: Supabase", { slug, vehicle });
      return vehicle;
    } catch (error) {
      const fallback = getMockVehicles().find(
        (vehicle) => vehicle.publicado !== false && vehicle.slug === slug,
      );

      if (fallback) {
        console.warn("[vehicles-api] Detail source: mock fallback", {
          slug,
          error,
          vehicle: fallback,
        });
        return fallback;
      }

      console.error("[vehicles-api] Detail failed with no fallback.", {
        slug,
        error,
      });
      throw error;
    }
  }

  window.UNOMOTORS_VEHICLES_API = {
    getVehicles,
    getVehicleBySlug,
    mapVehicleRow,
  };
})();
