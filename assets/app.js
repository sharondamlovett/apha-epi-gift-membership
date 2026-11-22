
/* ==========================================================
   APHA GIFT MEMBERSHIP DATABASE
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
const allSectionFilters = document.getElementById('all-section-filters');

const browseButton = document.getElementById('browse-filters');
const moreFilters = document.getElementById('more-filters');

const clearSearchButton = document.getElementById('clear-search');
const clearFiltersButton = document.getElementById('clear-filters');


/* ==========================================================
   APPLICATION STATE
   ========================================================== */

let profiles = [];
let selectedSections = new Set();


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


function getSectionAbbreviation(section) {
  const match = section.match(/\(([^)]+)\)$/);

  if (match) {
    return match[1];
  }

  return section;
}


/* ==========================================================
   SECTION FILTER HELPERS
   ========================================================== */

function getSectionsInUse() {
  const usedSections = new Set();

  profiles.forEach(profile => {
    if (profile.section1) {
      usedSections.add(profile.section1);
    }

    if (profile.section2) {
      usedSections.add(profile.section2);
    }
  });

  return [...usedSections].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
}


function getSectionCounts() {
  const counts = {};

  profiles.forEach(profile => {
    const uniqueSections = new Set([
      profile.section1,
      profile.section2
    ].filter(Boolean));

    uniqueSections.forEach(section => {
      counts[section] = (counts[section] || 0) + 1;
    });
  });

  return counts;
}


/* ==========================================================
   CREATE QUICK SECTION FILTERS
   ========================================================== */

function makeQuickFilters() {
  sectionFilters.innerHTML = '';

  const counts = getSectionCounts();

  const popularSections = Object.keys(counts)
    .sort((a, b) => {
      if (counts[b] !== counts[a]) {
        return counts[b] - counts[a];
      }

      return a.localeCompare(b);
    })
    .slice(0, 6);

  popularSections.forEach(section => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'section-chip';
    button.textContent = getSectionAbbreviation(section);
    button.title = section;
    button.dataset.section = section;
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', () => {
      toggleSection(section);
    });

    sectionFilters.appendChild(button);
  });
}


/* ==========================================================
   CREATE COMPLETE ALPHABETICAL SECTION BROWSER
   ========================================================== */

function makeAllSectionFilters() {
  allSectionFilters.innerHTML = '';

  const sections = [...SECTIONS].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  sections.forEach(section => {
    const label = document.createElement('label');
    label.className = 'filter-option';

    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';
    checkbox.value = section;
    checkbox.checked = selectedSections.has(section);

    const swatch = document.createElement('span');
    swatch.className = 'filter-swatch';

    const color = getSectionColor(section);

    swatch.style.backgroundColor = color;

    const text = document.createElement('span');
    text.textContent = section;

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedSections.add(section);
      } else {
        selectedSections.delete(section);
      }

      renderFilters();
      renderProfiles();
    });

    label.appendChild(checkbox);
    label.appendChild(swatch);
    label.appendChild(text);

    allSectionFilters.appendChild(label);
  });
}


/* ==========================================================
   UPDATE FILTER APPEARANCE
   ========================================================== */

function renderFilters() {
  document.querySelectorAll('.section-chip').forEach(button => {
    const selected = selectedSections.has(button.dataset.section);

    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });

  allSectionFilters
    .querySelectorAll('input[type="checkbox"]')
    .forEach(checkbox => {
      checkbox.checked = selectedSections.has(checkbox.value);
    });
}


/* ==========================================================
   SECTION SELECTION
   ========================================================== */

function toggleSection(section) {
  if (selectedSections.has(section)) {
    selectedSections.delete(section);
  } else {
    selectedSections.add(section);
  }

  renderFilters();
  renderProfiles();
}


function clearAllFilters() {
  selectedSections.clear();
  searchInput.value = '';

  renderFilters();
  renderProfiles();
}


/* ==========================================================
   PROFILE SEARCH
   ========================================================== */

function matchesSearch(profile, query) {
  if (!query) {
    return true;
  }

  const searchableText = [
    profile.full_name,
    profile.email,
    profile.bio,
    profile.section1,
    profile.section2
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableText.includes(query.toLowerCase());
}


function matchesSections(profile) {
  if (selectedSections.size === 0) {
    return true;
  }

  const profileSections = [
    profile.section1,
    profile.section2
  ].filter(Boolean);

  return profileSections.some(section =>
    selectedSections.has(section)
  );
}


/* ==========================================================
   EMAIL DISPLAY
   ========================================================== */

function formatEmail(email) {
  if (!email) {
    return '';
  }

  return String(email)
    .replace(/\s*\[at\]\s*/gi, '@')
    .replace(/\s*@\s*/g, ' [at] ')
    .replace(/\s*\[dot\]\s*/gi, '.')
    .replace(/\s*\.\s*/g, ' dot ');
}


/* ==========================================================
   CREATE SECTION TAG
   ========================================================== */

function makeTag(section) {
  const tag = document.createElement('span');
  tag.className = 'tag';

  const color = getSectionColor(section);

  tag.textContent = getSectionAbbreviation(section);
  tag.title = section;

  tag.style.color = color;
  tag.style.borderColor = color;
  tag.style.backgroundColor = getTransparentColor(color);

  return tag;
}


/* ==========================================================
   PROFILE STATUS
   ========================================================== */

function getProfileStatus(profile) {
  const statusValue = String(
    profile.status || ''
  ).toLowerCase();

  if (
    statusValue === 'archived' ||
    statusValue === 'inactive' ||
    profile.archived === true
  ) {
    return 'Archived';
  }

  return 'Available';
}


/* ==========================================================
   CREATE PROFILE CARD
   ========================================================== */

function makeProfileCard(profile) {
  const card = document.createElement('article');
  card.className = 'profile-card';

  const firstSectionColor = getSectionColor(
    profile.section1 || 'Other'
  );

  card.style.borderLeftColor = firstSectionColor;

  /* Name */

  const name = document.createElement('h2');
  name.className = 'profile-name';
  name.textContent = profile.full_name || 'Name unavailable';

  card.appendChild(name);

  /* Section tags */

  const tags = document.createElement('div');
  tags.className = 'profile-tags';

  if (profile.section1) {
    tags.appendChild(makeTag(profile.section1));
  }

  if (profile.section2) {
    tags.appendChild(makeTag(profile.section2));
  }

  card.appendChild(tags);

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

  /* Availability status */

  const statusText = getProfileStatus(profile);

  const status = document.createElement('span');

  status.className = `status ${
    statusText.toLowerCase()
  }`;

  status.textContent = statusText;

  card.appendChild(status);

  return card;
}


/* ==========================================================
   RENDER PROFILES
   ========================================================== */

function renderProfiles() {
  const query = searchInput.value.trim();

  const filteredProfiles = profiles.filter(profile => {
    return (
      matchesSearch(profile, query) &&
      matchesSections(profile)
    );
  });

  memberGrid.innerHTML = '';

  filteredProfiles.forEach(profile => {
    memberGrid.appendChild(makeProfileCard(profile));
  });

  const total = filteredProfiles.length;

  resultCount.textContent =
    `${total} ${total === 1 ? 'profile' : 'profiles'} found`;

  emptyState.hidden = total !== 0;

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
        profile.email &&
        profile.bio &&
        profile.section1 &&
        profile.section2
      );
    });

    makeQuickFilters();
    makeAllSectionFilters();
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

clearFiltersButton.addEventListener('click', clearAllFilters);

browseButton.addEventListener('click', () => {
  const isExpanded = browseButton.getAttribute(
    'aria-expanded'
  ) === 'true';

  const nextExpanded = !isExpanded;

  browseButton.setAttribute(
    'aria-expanded',
    String(nextExpanded)
  );

  moreFilters.hidden = !nextExpanded;

  browseButton.textContent = nextExpanded
    ? 'Hide APHA Sections'
    : 'Browse APHA Sections';
});


/* ==========================================================
   INITIALIZE APPLICATION
   ========================================================== */

loadProfiles();
