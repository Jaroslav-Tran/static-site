const nav = document.querySelector(".site-nav");
const toggle = document.querySelector(".nav-toggle");
const searchToggle = document.querySelector(".search-toggle");
const searchPanel = document.querySelector(".search-panel");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

for (const dropdown of document.querySelectorAll(".nav-dropdown")) {
  const button = dropdown.querySelector(".nav-dropdown-toggle");
  if (!button) continue;
  button.addEventListener("click", () => {
    const open = dropdown.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });
}

if (searchToggle && searchPanel) {
  searchToggle.addEventListener("click", () => {
    const willShow = searchPanel.hasAttribute("hidden");
    searchPanel.toggleAttribute("hidden", !willShow);
    searchToggle.setAttribute("aria-expanded", String(willShow));
    if (willShow) searchPanel.querySelector("input")?.focus();
  });
}

function notConfigured(form) {
  window.alert("Add your Formspree ID to src/site.json, then rebuild.");
}

for (const form of document.querySelectorAll("form[data-form]")) {
  if (form.getAttribute("action")) continue;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    notConfigured(form);
  });
}

const themeToggle = document.querySelector(".theme-toggle");
const root = document.documentElement;

function currentTheme() {
  return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (!themeToggle) return;
  const dark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}

if (themeToggle) {
  applyTheme(currentTheme());
  themeToggle.addEventListener("click", () => {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });
}
