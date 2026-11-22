const grid = document.getElementById("member-grid");
const statusEl = document.getElementById("directory-status");
const countEl = document.getElementById("result-count");
const emptyEl = document.getElementById("empty-state");
const searchEl = document.getElementById("search");
const clearEl = document.getElementById("clear-search");

let profiles = [];

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
}

function renderProfiles() {
  const query = searchEl.value.trim().toLowerCase();
  const filtered = profiles.filter(person =>
    `${person.full_name} ${person.bio}`.toLowerCase().includes(query)
  );
  grid.replaceChildren();
  countEl.textContent = `${filtered.length} ${filtered.length === 1 ? "profile" : "profiles"}`;
  emptyEl.hidden = filtered.length !== 0;
  filtered.forEach(person => {
    const card = document.createElement("article");
    card.className = "member-card";
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initials(person.full_name);
    const name = document.createElement("h3");
    name.textContent = person.full_name;
    const email = document.createElement("a");
    email.className = "member-email";
    email.href = `mailto:${person.email}`;
    email.textContent = person.email;
    const bio = document.createElement("p");
    bio.className = "member-bio";
    bio.textContent = person.bio;
    card.append(avatar, name, email, bio);
    grid.append(card);
  });
}

async function loadProfiles() {
  try {
    const response = await fetch("assets/profiles.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    profiles = Array.isArray(data) ? data.filter(person =>
      person && typeof person.full_name === "string" &&
      typeof person.email === "string" && typeof person.bio === "string"
    ) : [];
    statusEl.hidden = true;
    renderProfiles();
  } catch (error) {
    console.error("Could not load the public profile list:", error);
    statusEl.textContent = "We couldn't load member profiles right now. Please try again later.";
    countEl.textContent = "Unavailable";
  }
}

searchEl.addEventListener("input", renderProfiles);
clearEl.addEventListener("click", () => {
  searchEl.value = "";
  renderProfiles();
  searchEl.focus();
});

loadProfiles();
