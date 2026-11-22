
/* ==========================================================
   APHA GIFT MEMBERSHIP DATABASE
   APPLICATION JAVASCRIPT
   ========================================================== */


/* ==========================================================
   1. APHA SECTIONS
   ========================================================== */

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


/* ==========================================================
   2. SECTION COLOR PALETTE
   ========================================================== */

const PALETTE = [
  "#287e8b",
  "#76518e",
  "#9b455c",
  "#8a6b25",
  "#805b38",
  "#357f8a",
  "#426f9d",
  "#a05a35",
  "#537b51",
  "#6e5d9c",
  "#a14e70",
  "#527c83"
];


/* ==========================================================
   3. PAGE ELEMENTS
   ========================================================== */

const grid = document.getElementById("member-grid");
const statusEl = document.getElementById("directory-status");
const countEl = document.getElementById("result-count");
const emptyEl = document.getElementById("empty-state");
const searchEl = document.getElementById("search");

const popularFiltersEl = document.getElementById("section-filters");
const allFiltersEl = document.getElementById("all-section-filters");

const browseButton = document.getElementById("browse-filters");
const moreFilters = document.getElementById("more-filters");

const selectedSections = new Set();

let profiles = [];


/* ==========================================================
   4. SECTION COLORS
   ========================================================== */

function colorFor(text) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  return PALETTE[hash % PALETTE.length];
}

function sectionColor(section) {
  return colorFor(section || "Other");
}


// Convert a HEX color into a 50%-transparent HEX color.
// The alpha value "80" represents approximately 50% opacity.

function transparentColor(hex) {
  return `${hex}80`;
}


/* ==========================================================
   5. POPULAR SECTION FILTER BUTTONS
   ========================================================== */

function buildFilter(section, container, compact = false) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "section-chip";
  button.dataset.section = section;

  button.textContent = compact
    ? section.replace(/\s*\([^)]*\)$/, "")
    : section;

  button.setAttribute(
    "aria-pressed",
    selectedSections.has(section) ? "true" : "false"
  );

  button.addEventListener("click", () => {
    toggleSection(section);
  });

  container.append(button);
}


function updateFilterButtons() {
  document.querySelectorAll(".section-chip").forEach(button => {
    const section = button.dataset.section;
    const selected = selectedSections.has(section);

    button.setAttribute(
      "aria-pressed",
      selected ? "true" : "false"
    );

    button.classList.toggle("active", selected);
  });
}


/* ==========================================================
   6. COMPLETE SECTION FILTER LIST
   ========================================================== */

function makeFilters() {
  allFiltersEl.replaceChildren();

  SECTIONS.forEach(section => {
    const label = document.createElement("label");
    label.className = "filter-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = section;

    input.addEventListener("change", () => {
      toggleSection(section);
    });

    const swatch = document.createElement("span");
    swatch.className = "filter-swatch";
    swatch.style.backgroundColor = sectionColor(section);

    label.append(
      input,
      swatch,
      document.createTextNode(section)
    );

    allFiltersEl.append(label);
  });
}


/* ==========================================================
   7. POPULAR SECTIONS
   ========================================================== */

// Rank sections by the number of profiles associated with them.
// Each section is counted once per profile.
// Ties are sorted alphabetically.

function makePopularFilters() {
  popularFiltersEl.replaceChildren();

  const counts = new Map();

  profiles.forEach(person => {
    const sections = [
      person.section1,
      person.section2
    ].filter(Boolean);

    [...new Set(sections)].forEach(section => {
      counts.set(
        section,
        (counts.get(section) || 0) + 1
      );
    });
  });

  const popular = [...counts.entries()].sort((a, b) => {
    return b[1] - a[1] || a[0].localeCompare(b[0]);
  });

  if (!popular.length) {
    const note = document.createElement("span");
    note.className = "filter-empty-note";
    note.textContent =
      "Section filters will appear as profiles are added";

    popularFiltersEl.append(note);
    return;
  }

  popular.forEach(([section]) => {
    buildFilter(section, popularFiltersEl, true);
  });
}


/* ==========================================================
   8. SECTION FILTER SELECTION
   ========================================================== */

function toggleSection(section) {
  if (selectedSections.has(section)) {
    selectedSections.delete(section);
  } else {
    selectedSections.add(section);
  }

  document.querySelectorAll(".filter-option input").forEach(input => {
    input.checked = selectedSections.has(input.value);
  });

  updateFilterButtons();
  renderProfiles();
}


/* ==========================================================
   9. PROFILE SECTION TAGS
   ========================================================== */

function makeTag(text) {
  const tag = document.createElement("span");

  tag.className = "tag";

  const color = sectionColor(text);

  // Section-colored text and outline.
  tag.style.color = color;
  tag.style.borderColor = color;

  // Same section color with approximately 50% transparency.
  tag.style.backgroundColor = transparentColor(color);

  tag.textContent = text;

  return tag;
}


/* ==========================================================
   10. PROFILE STATUS
   ========================================================== */

function makeStatus(statusValue) {
  const status = document.createElement("span");

  const archived = statusValue === "Archived";

  status.className = archived
    ? "status archived"
    : "status available";

  status.textContent = archived
    ? "Archived"
    : "Available";

  return status;
}


/* ==========================================================
   11. PROFILE CARD GENERATION
   ========================================================== */

function createProfileCard(person) {
  const firstSection = person.section1 || "Other";

  const card = document.createElement("article");

  card.className = "profile-card";

  // Left card accent matches the first APHA Section.

  card.style.borderLeftColor = sectionColor(firstSection);


  // Full name.

  const name = document.createElement("h3");
  name.className = "profile-name";
  name.textContent = person.full_name;


  // Two APHA Section tags.

  const tags = document.createElement("div");
  tags.className = "profile-tags";

  tags.append(
    makeTag(firstSection),
    makeTag(person.section2 || "Other")
  );


  // Email displayed as text, not a mailto link.

  const email = document.createElement("span");
  email.className = "email";
  email.textContent = person.email;


  // Profile biography.

  const bio = document.createElement("p");
  bio.className = "bio";
  bio.textContent = person.bio;


  // Available / Archived status.

  const status = makeStatus(person.status);


  // Assemble profile card.

  card.append(
    name,
    tags,
    email,
    bio,
    status
  );

  return card;
}


/* ==========================================================
   12. DISPLAY AND FILTER PROFILES
   ========================================================== */

function renderProfiles() {
  const query = searchEl.value.trim().toLowerCase();

  const filtered = profiles.filter(person => {
    const sections = [
      person.section1,
      person.section2
    ].filter(Boolean);

    const searchableText = [
      person.full_name,
      person.email,
      person.bio,
      ...sections
    ].join(" ").toLowerCase();

    const textMatch = searchableText.includes(query);

    // Multiple selected sections use OR logic.

    const sectionMatch =
      selectedSections.size === 0 ||
      sections.some(section => selectedSections.has(section));

    return textMatch && sectionMatch;
  });


  // Remove previously displayed cards.

  grid.replaceChildren();


  // Update profile count.

  countEl.textContent =
    `${filtered.length} ${filtered.length === 1 ? "profile" : "profiles"}`;


  // Display empty state when no profiles match.

  emptyEl.hidden = filtered.length !== 0;


  // Generate profile cards.

  filtered.forEach(person => {
    grid.append(createProfileCard(person));
  });
}


/* ==========================================================
   13. LOAD PROFILE DATABASE
   ========================================================== */

async function loadProfiles() {
  try {
    const response = await fetch(
      "assets/profiles.json",
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    profiles = Array.isArray(data)
      ? data.filter(person =>
          person &&
          typeof person.full_name === "string" &&
          typeof person.email === "string" &&
          typeof person.bio === "string" &&
          typeof person.section1 === "string" &&
          typeof person.section2 === "string"
        )
      : [];

    statusEl.hidden = true;

    makePopularFilters();
    renderProfiles();

  } catch (error) {
    console.error("Could not load profiles:", error);

    statusEl.hidden = false;

    statusEl.textContent =
      "Profiles could not be loaded. Please try again later.";

    countEl.textContent = "Unavailable";
  }
}


/* ==========================================================
   14. SEARCH CONTROLS
   ========================================================== */

searchEl.addEventListener("input", renderProfiles);

document.getElementById("clear-search").addEventListener("click", () => {
  searchEl.value = "";
  renderProfiles();
  searchEl.focus();
});


/* ==========================================================
   15. CLEAR SECTION FILTERS
   ========================================================== */

document.getElementById("clear-filters").addEventListener("click", () => {
  selectedSections.clear();

  document.querySelectorAll(".filter-option input").forEach(input => {
    input.checked = false;
  });

  updateFilterButtons();
  renderProfiles();
});


/* ==========================================================
   16. SHOW / HIDE COMPLETE SECTION LIST
   ========================================================== */

browseButton.addEventListener("click", () => {
  moreFilters.hidden = !moreFilters.hidden;

  browseButton.setAttribute(
    "aria-expanded",
    String(!moreFilters.hidden)
  );

  browseButton.textContent = moreFilters.hidden
    ? "Browse APHA Sections"
    : "Hide APHA Sections";
});


/* ==========================================================
   17. INITIALIZE DATABASE
   ========================================================== */

makeFilters();
loadProfiles();
