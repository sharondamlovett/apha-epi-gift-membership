const SECTIONS = [
  'Aging and Public Health (APH)',
  'Alcohol, Tobacco, and Other Drugs (ATOD)',
  'Applied Public Health Statistics (APHS)',
  'Chiropractic Health Care (CHC)',
  'Community Health Planning and Policy Development (CHPPD)',
  'Community Health Workers (CHW)',
  'Disability (DIS)',
  'Environment (ENV)',
  'Epidemiology (EPI)',
  'Ethics (ETHICS)',
  'Food and Nutrition (FN)',
  'Health Administration (HA)',
  'Health Informatics Information Technology (HIIT)',
  'HIV/AIDS (HIV AIDS)',
  'Injury Control and Emergency Health Services (ICEHS)',
  'Integrative, Complementary and Traditional Health Practices (ICTHP)',
  'International Health (IH)',
  'Law (LAW)',
  'Maternal and Child Health (MCH)',
  'Medical Care (MC)',
  'Mental Health (MH)',
  'Occupational Health and Safety (OHS)',
  'One Health (1HLTH)',
  'Oral Health (OH)',
  'Other',
  'Pharmacy (PHARM)',
  'Physical Health (PA)',
  'Podiatric Health/Foot and Ankle Health (POD/FAH)',
  'Public Health Education and Health Promotion (PHEHP)',
  'Public Health Nursing (PHN)',
  'Public Health Social Work',
  'School Health Education and Services (SHES)',
  'Sexual and Reproductive Health (SRH)',
  'Vision Care (VC)'
];
const PALETTE = ["#287e8b", "#76518e", "#9b455c", "#8a6b25", "#805b38", "#357f8a", "#426f9d", "#a05a35", "#537b51", "#6e5d9c", "#a14e70", "#527c83"];
const grid = document.getElementById("member-grid");
const statusEl = document.getElementById("directory-status");
const countEl = document.getElementById("result-count");
const emptyEl = document.getElementById("empty-state");
const searchEl = document.getElementById("search");
const selectedSections = new Set();

function colorFor(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
function sectionColor(section) { return colorFor(section || "Other"); }
function buildFilter(label, container, compact = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "section-chip";
  button.dataset.section = label;
  button.textContent = compact ? label.replace(/\s*\([^)]*\)$/, "") : label;
  button.style.backgroundColor = sectionColor(label);
  button.setAttribute("aria-pressed", selectedSections.has(label) ? "true" : "false");
  button.addEventListener("click", () => {
    if (selectedSections.has(label)) selectedSections.delete(label); else selectedSections.add(label);
    updateFilterButtons();
    renderProfiles();
  });
  container.append(button);
}
function updateFilterButtons() {
  document.querySelectorAll(".section-chip").forEach(button => {
    const label = button.dataset.section;
    if (label) button.setAttribute("aria-pressed", selectedSections.has(label) ? "true" : "false");
  });
}
function makeFilters() {
  const all = document.getElementById("all-section-filters");
  SECTIONS.forEach(section => {
    const label = document.createElement("label"); label.className = "filter-option";
    const input = document.createElement("input"); input.type = "checkbox"; input.value = section;
    input.addEventListener("change", () => toggleSection(section));
    const swatch = document.createElement("span"); swatch.className = "filter-swatch";
    swatch.style.backgroundColor = sectionColor(section);
    label.append(input, swatch, document.createTextNode(section)); all.append(label);
  });
}
function makePopularFilters() {
  const top = document.getElementById("section-filters");
  top.replaceChildren();
  const counts = new Map();
  profiles.forEach(person => {
    // Count each section once per profile, even if the same value appears in both fields.
    [...new Set([person.section1, person.section2].filter(Boolean))].forEach(section => {
      counts.set(section, (counts.get(section) || 0) + 1);
    });
  });
  const popular = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (!popular.length) {
    const note = document.createElement("span");
    note.className = "filter-empty-note";
    note.textContent = "Section filters will appear as profiles are added";
    top.append(note);
    return;
  }
  popular.forEach(([section]) => buildFilter(section, top, true));
}
function toggleSection(section) {
  if (selectedSections.has(section)) selectedSections.delete(section); else selectedSections.add(section);
  document.querySelectorAll(".filter-option input").forEach(input => input.checked = selectedSections.has(input.value));
  document.querySelectorAll(".section-chip").forEach(button => button.setAttribute("aria-pressed", selectedSections.has(button.dataset.section) ? "true" : "false"));
  renderProfiles();
}
function makeTag(text, isStatus = false) {
  const tag = document.createElement("span");
  tag.className = isStatus ? "status-tag" : "tag";
  if (!isStatus) tag.style.backgroundColor = sectionColor(text);
  tag.textContent = text;
  return tag;
}
function renderProfiles() {
  const query = searchEl.value.trim().toLowerCase();
  const filtered = profiles.filter(person => {
    const sections = [person.section1, person.section2].filter(Boolean);
    const text = [person.full_name, person.email, person.bio, ...sections].join(" ").toLowerCase();
    const textMatch = text.includes(query);
    const sectionMatch = selectedSections.size === 0 || sections.some(section => selectedSections.has(section));
    return textMatch && sectionMatch;
  });
  grid.replaceChildren();
  countEl.textContent = `${filtered.length} ${filtered.length === 1 ? "profile" : "profiles"}`;
  emptyEl.hidden = filtered.length !== 0;
  filtered.forEach(person => {
    const firstSection = person.section1 || "Other";
    const card = document.createElement("article");
    card.className = "member-card";
    card.style.setProperty("--accent", sectionColor(firstSection));
    const name = document.createElement("h2"); name.textContent = person.full_name;
    const tags = document.createElement("div"); tags.className = "tags";
    tags.append(makeTag(firstSection), makeTag(person.section2 || "Other"));
    const email = document.createElement("a"); email.className = "member-email";
    email.href = `mailto:${person.email}`; email.textContent = person.email;
    const bio = document.createElement("p"); bio.className = "member-bio"; bio.textContent = person.bio;
    const status = makeTag(person.status === "Archived" ? "Archived" : "Available", true);
    if (person.status === "Archived") status.classList.add("archived");
    card.append(name, tags, email, bio, status); grid.append(card);
  });
}
let profiles = [];
async function loadProfiles() {
  try {
    const response = await fetch("assets/profiles.json", {cache:"no-store"});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    profiles = Array.isArray(data) ? data.filter(person => person && typeof person.full_name === "string" && typeof person.email === "string" && typeof person.bio === "string" && typeof person.section1 === "string" && typeof person.section2 === "string") : [];
    statusEl.hidden = true;
    makePopularFilters();
    renderProfiles();
  } catch (error) {
    console.error("Could not load profiles:", error);
    statusEl.textContent = "Profiles could not be loaded. Please try again later.";
    countEl.textContent = "Unavailable";
  }
}
makeFilters();
searchEl.addEventListener("input", renderProfiles);
document.getElementById("clear-search").addEventListener("click", () => {searchEl.value = ""; renderProfiles(); searchEl.focus();});
document.getElementById("clear-filters").addEventListener("click", () => {selectedSections.clear(); document.querySelectorAll(".filter-option input").forEach(input => input.checked = false); updateFilterButtons(); renderProfiles();});
document.getElementById("browse-filters").addEventListener("click", event => {const panel=document.getElementById("more-filters");panel.hidden=!panel.hidden;event.currentTarget.setAttribute("aria-expanded",String(!panel.hidden));event.currentTarget.textContent=panel.hidden?"Browse APHA Sections":"Hide APHA Sections";});
loadProfiles();
