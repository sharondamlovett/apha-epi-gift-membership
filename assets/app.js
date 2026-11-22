
/* ==========================================================
   APHA GIFT MEMBERSHIP DATABASE
   ========================================================== */


/* ==========================================================
   APHA SECTIONS
   "Other" is intentionally excluded.
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
   FILTER OPTIONS
   ========================================================== */

const CAREER_STAGES = [
  'Student',
  'Early Career Professional'
];

const PROFILE_STATUSES = [
  'Available',
  'Archived'
];


/* ==========================================================
   SECTION COLORS
   ========================================================== */

const SECTION_PALETTE = [
  '#287e8b',
  '#76518e',
  '#9b455c',
  '#8a6b25',
  '#805b38',
  '#357f8a',
  '#426f9d',
  '#a05a35',
  '#537b51',
  '#6e5d9c',
  '#a14e70',
  '#527c83',
  '#5274a3',
  '#9a654e',
  '#6d8650',
  '#87618a'
];

const SPECIAL_SECTION_COLORS = {
  'Epidemiology (EPI)': '#2875b8',
  'Environment (ENV)': '#398451',
  'Maternal and Child Health (MCH)': '#d66b91'
};


/* ==========================================================
   DOM ELEMENTS
   ========================================================== */

const memberGrid = document.getElementById('member-grid');
const directoryStatus = document.getElementById('directory-status');
const resultCount = document.getElementById('result-count');
const emptyState = document.getElementById('empty-state');

const searchInput = document.getElementById('search');

const sectionFilters = document.getElementById('section-filters');
const careerStageFilters = document.getElementById('career-stage-filters');
const statusFilters = document.getElementById('status-filters');

const sectionToggle = document.getElementById('toggle-section-filters');
const sectionToggleIcon = document.getElementById('section-toggle-icon');

const clearSearchButton = document.getElementById('clear-search');
const clearFiltersButton = document.getElementById('clear-filters');


/* ==========================================================
   APPLICATION STATE
   ========================================================== */

let profiles = [];

const selectedSections = new Set();
const selectedCareerStages = new Set();
const selectedStatuses = new Set();


/* ==========================================================
   SECTION HELPERS
   ========================================================== */

function normalizeValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}


function isOtherSection(section) {
  return normalizeValue(section) === 'other';
}


function getValidProfileSections(profile) {
  return [
    profile.section1,
    profile.section2
  ].filter(section => {
    return section && !isOtherSection(section);
  });
}


/* ==========================================================
   SECTION COLOR HELPERS
   ========================================================== */

function getSectionColor(section) {
  if (SPECIAL_SECTION_COLORS[section]) {
    return SPECIAL_SECTION_COLORS[section];
  }

  let hash = 0;

  for (let i = 0; i < section.length; i++) {
    hash = ((hash << 5) - hash) + section.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % SECTION_PALETTE.length;

  return SECTION_PALETTE[index];
}


function getTransparentColor(hex) {
  return `${hex}80`;
}


/* ==========================================================
   PROFILE STATUS AND CAREER STAGE
   ========================================================== */

function getProfileStatus(profile) {
  const status = normalizeValue(profile.status);

  if (
    status === 'archived' ||
    status === 'inactive' ||
    profile.archived === true
  ) {
    return 'Archived';
  }

  return 'Available';
}


function getCareerStage(profile) {
  return String(
    profile.career_stage ||
    profile.careerStage ||
    ''
  ).trim();
}


/* ==========================================================
   CREATE CHECKBOX FILTER
   ========================================================== */

function makeCheckboxFilter(container, value, group, color = null) {
  const label = document.createElement('label');
  label.className = 'filter-option';

  const checkbox = document.createElement('input');

  checkbox.type = 'checkbox';
  checkbox.value = value;

  const text = document.createElement('span');
  text.textContent = value;

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      group.add(value);
    } else {
      group.delete(value);
    }

    renderProfiles();
  });

  label.appendChild(checkbox);

  if (color) {
    const swatch = document.createElement('span');
    swatch.className = 'filter-swatch';
    swatch.style.backgroundColor = color;
    label.appendChild(swatch);
  }

  label.appendChild(text);
  container.appendChild(label);
}


/* ==========================================================
   RESPONSIVE SECTION FILTER LAYOUT
   Alphabetical order, top-to-bottom in each column
   ========================================================== */

function getSectionColumnCount() {
  if (window.matchMedia('(max-width: 600pt)').matches) {
    return 1;
  }

  if (window.matchMedia('(max-width: 800pt)').matches) {
    return 2;
  }

  return 3;
}


function updateSectionFilterLayout() {
  const sortedSections = [...SECTIONS].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  const columns = getSectionColumnCount();
  const rowsPerColumn = Math.ceil(sortedSections.length / columns);

  sectionFilters.style.gridTemplateRows =
    `repeat(${rowsPerColumn}, auto)`;
}


/* ==========================================================
   CREATE APHA SECTION FILTERS
   ========================================================== */

function makeSectionFilters() {
  sectionFilters.innerHTML = '';

  const sortedSections = [...SECTIONS]
    .filter(section => !isOtherSection(section))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

  sortedSections.forEach(section => {
    makeCheckboxFilter(
      sectionFilters,
      section,
      selectedSections,
      getSectionColor(section)
    );
  });

  updateSectionFilterLayout();
}


/* ==========================================================
   CREATE CAREER STAGE FILTERS
   ========================================================== */

function makeCareerStageFilters() {
  careerStageFilters.innerHTML = '';

  CAREER_STAGES.forEach(stage => {
    makeCheckboxFilter(
      careerStageFilters,
      stage,
      selectedCareerStages
    );
  });
}


/* ==========================================================
   CREATE STATUS FILTERS
   ========================================================== */

function makeStatusFilters() {
  statusFilters.innerHTML = '';

  PROFILE_STATUSES.forEach(status => {
    makeCheckboxFilter(
      statusFilters,
      status,
      selectedStatuses
    );
  });
}


/* ==========================================================
   SHOW / HIDE APHA SECTION FILTER LIST
   Hidden by default.
   ========================================================== */

function toggleSectionFilterList() {
  const isExpanded =
    sectionToggle.getAttribute('aria-expanded') === 'true';

  const shouldExpand = !isExpanded;

  sectionToggle.setAttribute(
    'aria-expanded',
    String(shouldExpand)
  );

  sectionFilters.hidden = !shouldExpand;

  sectionToggleIcon.textContent = shouldExpand ? '−' : '+';
}


/* ==========================================================
   UPDATE FILTER CHECKBOXES
   ========================================================== */

function renderFilters() {
  document.querySelectorAll(
    '#section-filters input[type="checkbox"]'
  ).forEach(checkbox => {
    checkbox.checked = selectedSections.has(checkbox.value);
  });

  document.querySelectorAll(
    '#career-stage-filters input[type="checkbox"]'
  ).forEach(checkbox => {
    checkbox.checked = selectedCareerStages.has(checkbox.value);
  });

  document.querySelectorAll(
    '#status-filters input[type="checkbox"]'
  ).forEach(checkbox => {
    checkbox.checked = selectedStatuses.has(checkbox.value);
  });
}


/* ==========================================================
   CLEAR FILTERS
   ========================================================== */

function clearAllFilters() {
  selectedSections.clear();
  selectedCareerStages.clear();
  selectedStatuses.clear();

  searchInput.value = '';

  renderFilters();
  renderProfiles();
}


/* ==========================================================
   EMAIL DISPLAY
   Preserve periods; replace @ with [at]
   ========================================================== */

function formatEmail(email) {
  if (!email) {
    return '';
  }

  return String(email).replace(/\s*@\s*/g, ' [at] ');
}


/* ==========================================================
   SEARCH MATCHING
   Searches names, keywords, emails, bios, and APHA Sections.
   ========================================================== */

function matchesSearch(profile, query) {
  if (!query) {
    return true;
  }

  const searchableText = [
    profile.full_name,
    profile.email,
    profile.bio,
    ...getValidProfileSections(profile),
    getCareerStage(profile),
    getProfileStatus(profile)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableText.includes(query.toLowerCase());
}


/* ==========================================================
   SECTION FILTER MATCHING
   OR logic within APHA Sections
   ========================================================== */

function matchesSections(profile) {
  if (selectedSections.size === 0) {
    return true;
  }

  const profileSections = getValidProfileSections(profile);

  return profileSections.some(section =>
    selectedSections.has(section)
  );
}


/* ==========================================================
   CAREER STAGE FILTER MATCHING
   OR logic within Career Stage
   ========================================================== */

function matchesCareerStage(profile) {
  if (selectedCareerStages.size === 0) {
    return true;
  }

  const careerStage = getCareerStage(profile);

  return selectedCareerStages.has(careerStage);
}


/* ==========================================================
   STATUS FILTER MATCHING
   OR logic within Status
   ========================================================== */

function matchesStatus(profile) {
  if (selectedStatuses.size === 0) {
    return true;
  }

  return selectedStatuses.has(getProfileStatus(profile));
}


/* ==========================================================
   CREATE SECTION TAG
   Full section name, including abbreviation
   ========================================================== */

function makeTag(section) {
  const tag = document.createElement('span');
  tag.className = 'tag';

  const color = getSectionColor(section);

  tag.textContent = section;
  tag.title = section;

  tag.style.color = color;
  tag.style.borderColor = color;
  tag.style.backgroundColor = getTransparentColor(color);

  return tag;
}


/* ==========================================================
   CREATE PROFILE CARD
   Order:
   1. Name
   2. Career stage
   3. Email
   4. Bio
   5. APHA Section tags
   6. Status
   ========================================================== */

function makeProfileCard(profile) {
  const card = document.createElement('article');
  card.className = 'profile-card';

  const profileSections = getValidProfileSections(profile);

  const firstSectionColor = profileSections.length > 0
    ? getSectionColor(profileSections[0])
    : '#2875b8';

  card.style.borderLeftColor = firstSectionColor;


  /* Full name */

  const name = document.createElement('h2');
  name.className = 'profile-name';
  name.textContent = profile.full_name || 'Name unavailable';

  card.appendChild(name);


  /* Career stage */

  const careerStage = getCareerStage(profile);

  if (careerStage) {
    const stage = document.createElement('p');
    stage.className = 'career-stage';
    stage.textContent = careerStage;

    card.appendChild(stage);
  }


  /* Email */

  if (profile.email) {
    const email = document.createElement('p');
    email.className = 'email';
    email.textContent = formatEmail(profile.email);

    card.appendChild(email);
  }


  /* Bio */

  if (profile.bio) {
    const bio = document.createElement('p');
    bio.className = 'bio';
    bio.textContent = profile.bio;

    card.appendChild(bio);
  }


  /* APHA Section tags
     "Other" is excluded from profile cards too. */

  if (profileSections.length > 0) {
    const tags = document.createElement('div');
    tags.className = 'profile-tags';

    profileSections.forEach(section => {
      tags.appendChild(makeTag(section));
    });

    card.appendChild(tags);
  }


  /* Status */

  const statusText = getProfileStatus(profile);
  const status = document.createElement('span');

  status.className = `status ${statusText.toLowerCase()}`;
  status.textContent = statusText;

  card.appendChild(status);

  return card;
}


/* ==========================================================
   RENDER PROFILES AND RESULTS COUNT
   ========================================================== */

function renderProfiles() {
  const query = searchInput.value.trim();

  const filteredProfiles = profiles.filter(profile => {
    return (
      matchesSearch(profile, query) &&
      matchesSections(profile) &&
      matchesCareerStage(profile) &&
      matchesStatus(profile)
    );
  });

  memberGrid.innerHTML = '';

  filteredProfiles.forEach(profile => {
    memberGrid.appendChild(makeProfileCard(profile));
  });

  const matchingCount = filteredProfiles.length;
  const totalCount = profiles.length;

  resultCount.textContent =
    `${matchingCount} out of ${totalCount} profiles`;

  emptyState.hidden = matchingCount !== 0;

  directoryStatus.hidden = true;
}


/* ==========================================================
   LOAD PROFILE DATA
   ========================================================== */

async function loadProfiles() {
  try {
    directoryStatus.hidden = false;
    directoryStatus.textContent = 'Loading approved profiles…';

    const response = await fetch('assets/profiles.json', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(
        `Unable to load profiles (${response.status}).`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(
        'The profiles file must contain a JSON array.'
      );
    }

    profiles = data.filter(profile => {
      return (
        profile &&
        profile.full_name &&
        profile.section1 &&
        profile.section2
      );
    });

    makeSectionFilters();
    makeCareerStageFilters();
    makeStatusFilters();

    renderFilters();
    renderProfiles();

    if (profiles.length === 0) {
      directoryStatus.hidden = false;
      directoryStatus.textContent =
        'No approved profiles are currently available.';
    }

  } catch (error) {
    console.error('Profile loading error:', error);

    directoryStatus.hidden = false;
    directoryStatus.textContent =
      'Unable to load profiles. Please refresh the page or try again later.';

    resultCount.textContent = 'Profiles unavailable';
  }
}


/* ==========================================================
   EVENT LISTENERS
   ========================================================== */

searchInput.addEventListener('input', renderProfiles);

clearSearchButton.addEventListener('click', () => {
  searchInput.value = '';
  renderProfiles();
  searchInput.focus();
});

clearFiltersButton.addEventListener(
  'click',
  clearAllFilters
);

sectionToggle.addEventListener(
  'click',
  toggleSectionFilterList
);

window.addEventListener(
  'resize',
  updateSectionFilterLayout
);


/* ==========================================================
   INITIALIZE APPLICATION
   ========================================================== */

loadProfiles();
