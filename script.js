// ORBIT — JavaScript
// Search, theme toggle, modal interactions, and custom website shortcuts.

const $ = (id) => document.getElementById(id);

const toast = (message) => {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(window.orbitToastTimer);
  window.orbitToastTimer = setTimeout(() => element.classList.remove("show"), 2400);
};

$("year").textContent = new Date().getFullYear();

// Search: URLs open directly; other text opens Google results.
$("searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = $("searchInput").value.trim();
  if (!query) return;

  let target;
  if (/^https?:\/\//i.test(query)) {
    target = query;
  } else if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(query) && !query.includes(" ")) {
    target = "https://" + query;
  } else {
    target = "https://www.google.com/search?q=" + encodeURIComponent(query);
  }

  window.open(target, "_blank", "noopener,noreferrer");
  toast("Launching your search ✨");
});

// Switch between dark and light themes.
$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  $("themeBtn").textContent = isLight ? "☾" : "☼";
  $("themeBtn").title = isLight ? "Switch to dark mode" : "Switch to light mode";
  toast(isLight ? "Light mode enabled ☀" : "Dark mode enabled 🌙");
});

let modalMode = "add";

function openModal(mode = "add") {
  modalMode = mode;
  const isAbout = mode === "about";

  $("modalTitle").textContent = isAbout ? "About Orbit" : "Add a shortcut";
  $("modalText").textContent = isAbout
    ? "Orbit is a stylish browser homepage concept. It is a multi-file website you can edit in Visual Studio Code."
    : "Give your favorite website a name and a URL.";
  $("shortcutFields").hidden = isAbout;
  $("saveShortcut").textContent = isAbout ? "Got it ✦" : "Add shortcut ✦";
  $("modalBackdrop").classList.add("show");

  if (!isAbout) $("siteName").focus();
}

function closeModal() {
  $("modalBackdrop").classList.remove("show");
}

$("aboutBtn").addEventListener("click", () => openModal("about"));
$("addBtn").addEventListener("click", () => openModal("add"));
$("manageBtn").addEventListener("click", () => openModal("add"));
$("cancelModal").addEventListener("click", closeModal);

$("modalBackdrop").addEventListener("click", (event) => {
  if (event.target === $("modalBackdrop")) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();

  // Press / to focus the search box when not typing in a field.
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $("searchInput").focus();
  }
});

// Add a custom shortcut safely using DOM methods (no raw HTML injection).
$("saveShortcut").addEventListener("click", () => {
  if (modalMode === "about") {
    closeModal();
    toast("Thanks for exploring Orbit ✦");
    return;
  }

  const name = $("siteName").value.trim();
  let url = $("siteUrl").value.trim();

  if (!name || !url) {
    toast("Please fill in both fields");
    return;
  }

  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    toast("Please enter a valid website URL");
    return;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    toast("Please enter an HTTP or HTTPS website");
    return;
  }

  const card = document.createElement("a");
  card.className = "shortcut";
  card.href = parsedUrl.href;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const icon = document.createElement("div");
  icon.className = "site-icon";
  icon.textContent = "✨";

  const title = document.createElement("strong");
  title.textContent = name;

  const host = document.createElement("span");
  host.textContent = parsedUrl.hostname;

  card.append(icon, title, host);
  $("shortcuts").appendChild(card);

  closeModal();
  $("siteName").value = "";
  $("siteUrl").value = "";
  toast(name + " added to your launchpad! ✦");
});
