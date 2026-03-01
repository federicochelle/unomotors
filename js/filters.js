const filters = document.getElementById("filtersBox");

function handleFilters() {
  if (window.innerWidth >= 1024) {
    filters.setAttribute("open", true);
  } else {
    filters.removeAttribute("open");
  }
}

handleFilters();
window.addEventListener("resize", handleFilters);
