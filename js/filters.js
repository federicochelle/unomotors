const filters = document.getElementById("filtersBox");

function handleFilters() {
  if (!filters) {
    return;
  }

  if (window.innerWidth >= 1024) {
    filters.setAttribute("open", true);
  } else {
    filters.removeAttribute("open");
  }
}

if (!filters) {
  console.warn("[filters] No filters container found, skipping init");
} else {
  handleFilters();
  window.addEventListener("resize", handleFilters);
}
