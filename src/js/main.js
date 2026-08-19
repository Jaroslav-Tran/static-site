const nav = document.querySelector(".site-nav");
const toggle = document.querySelector(".nav-toggle");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function notConfigured(form) {
  const kind = form.dataset.form;
  const message =
    kind === "newsletter"
      ? "Add your ConvertKit form ID to src/site.json, then rebuild."
      : "Add your Formspree ID to src/site.json, then rebuild.";
  window.alert(message);
}

for (const form of document.querySelectorAll("form[data-form]")) {
  if (form.getAttribute("action")) continue;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    notConfigured(form);
  });
}
