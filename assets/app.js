
const CAREER_STAGES = [
  'Student',
  'Early Career Professional'
];

const PROFILE_STATUSES = [
  'Available',
  'Archived'
];

const SECTION_PALETTE = [
  '#287e8b', '#76518e', '#9b455c', '#8a6b25',
  '#805b38', '#357f8a', '#426f9d', '#a05a35',
  '#537b51', '#6e5d9c', '#a14e70', '#527c83',
  '#5274a3', '#9a654e', '#6d8650', '#87618a'
];

const SPECIAL_SECTION_COLORS = {
  'Epidemiology (EPI)': '#2875b8',
  'Environment (ENV)': '#398451',
  'Maternal and Child Health (MCH)': '#d66b91'
};

// Page elements
const memberGrid = document.getElementById('member-grid');
const directoryStatus = document.getElementById('directory-status');
const resultCount = document.getElementById('result-count');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search');

const careerStageFilters = document.getElementById('career-stage-filters');
const statusFilters = document.getElementById('status-filters');

const clearSearchButton = document.getElementById('clear-search');
const clearFiltersButton = document.getElementById('clear-filters');

let profiles = [];

const selectedCareerStages = new Set();
const selectedStatuses = new Set();

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getValidProfileSections(profile) {
  return [profile.section1, profile.section2].filter(section =>
    section && normalizeValue(section) !== 'other'
  );
}

function getSectionColor(section) {
  if (SPECIAL_SECTION_COLORS[section]) {
    return SPECIAL_SECTION_COLORS[section];
  }

  let hash = 0;

  for (let i = 0; i < section.length; i++) {
    hash = ((hash << 5) - hash) + section.charCodeAt(i);
    hash |= 0;
  }

  return SECTION_PALETTE[
    Math.abs(hash) % SECTION_PALETTE.length
  ];
}

function getTransparentColor(hex) {
  return `${hex}80`;
}

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
    profile.career_stage || profile.careerStage || ''
  ).trim();
}

function makeCheckboxFilter(container, value, group) {
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
  label.appendChild(text);
  container.appendChild(label);
}

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

function renderFilters() {
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

function clearAllFilters() {
  selectedCareerStages.clear();
  selectedStatuses.clear();

  searchInput.value = '';

  renderFilters();
  renderProfiles();
}

function formatEmail(email) {
  if (!email) return '';

  return String(email).replace(/\s*@\s*/g, ' [at] ');
}

function matchesSearch(profile, query) {
  if (!query) return true;

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

function matchesCareerStage(profile) {
  if (selectedCareerStages.size === 0) return true;

  return selectedCareerStages.has(getCareerStage(profile));
}

function matchesStatus(profile) {
  if (selectedStatuses.size === 0) return true;

  return selectedStatuses.has(getProfileStatus(profile));
}

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

function makeProfileCard(profile) {
  const card = document.createElement('article');

  card.className = 'profile-card';

  const profileSections = getValidProfileSections(profile);

  const firstSectionColor = profileSections.length > 0
    ? getSectionColor(profileSections[0])
    : '#2875b8';

  card.style.borderLeftColor = firstSectionColor;

  const name = document.createElement('h2');

  name.className = 'profile-name';
  name.textContent = profile.full_name || 'Name unavailable';

  card.appendChild(name);

  const careerStage = getCareerStage(profile);

  if (careerStage) {
    const stage = document.createElement('p');

    stage.className = 'career-stage';
    stage.textContent = careerStage;

    card.appendChild(stage);
  }

  if (profile.email) {
    const email = document.createElement('p');

    email.className = 'email';
    email.textContent = formatEmail(profile.email);

    card.appendChild(email);
  }

  if (profile.bio) {
    const bio = document.createElement('p');

    bio.className = 'bio';
    bio.textContent = profile.bio;

    card.appendChild(bio);
  }

  if (profileSections.length > 0) {
    const tags = document.createElement('div');

    tags.className = 'profile-tags';

    profileSections.forEach(section => {
      tags.appendChild(makeTag(section));
    });

    card.appendChild(tags);
  }

  const statusText = getProfileStatus(profile);

  const status = document.createElement('span');

  status.className = `status ${statusText.toLowerCase()}`;
  status.textContent = statusText;

  card.appendChild(status);

  return card;
}

function sortProfilesAlphabetically(profileList) {
  return profileList.sort((a, b) => {
    const nameA = String(a.full_name || '').trim();
    const nameB = String(b.full_name || '').trim();

    const isSharondaA =
      nameA.toLowerCase() === 'sharonda lovett';

    const isSharondaB =
      nameB.toLowerCase() === 'sharonda lovett';

    if (isSharondaA && isSharondaB) return 0;
    if (isSharondaA) return -1;
    if (isSharondaB) return 1;

    return nameA.localeCompare(
      nameB,
      undefined,
      { sensitivity: 'base' }
    );
  });
}

function renderProfiles() {
  const query = searchInput.value.trim();

  const filteredProfiles = profiles.filter(profile =>
    matchesSearch(profile, query) &&
    matchesCareerStage(profile) &&
    matchesStatus(profile)
  );

  sortProfilesAlphabetically(filteredProfiles);

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

function handleProfilesResponse(data) {
  if (!Array.isArray(data)) {
    throw new Error(
      'The profiles.json file does not contain a valid profile list.'
    );
  }

  profiles = data.filter(profile =>
    profile &&
    profile.full_name &&
    String(profile.full_name).trim() !== ''
  );

  makeCareerStageFilters();
  makeStatusFilters();

  renderFilters();
  renderProfiles();

  if (profiles.length === 0) {
    directoryStatus.hidden = false;
    directoryStatus.textContent =
      'No approved profiles are currently available.';
  }
}

async function loadProfiles() {
  try {
    directoryStatus.hidden = false;
    directoryStatus.textContent =
      'Loading approved profiles…';

    resultCount.textContent = 'Loading profiles…';

    const response = await fetch('assets/profiles.json', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(
        `Unable to load profiles.json (HTTP ${response.status}).`
      );
    }

    const data = await response.json();

    handleProfilesResponse(data);

  } catch (error) {
    console.error('Profile loading error:', error);

    directoryStatus.hidden = false;
    directoryStatus.textContent =
      'Unable to load approved profiles. Please refresh the page or contact the database administrator.';

    resultCount.textContent = 'Profiles unavailable';
    memberGrid.innerHTML = '';
    emptyState.hidden = true;
  }
}

// Search and filter event listeners
searchInput.addEventListener('input', renderProfiles);

clearSearchButton.addEventListener('click', () => {
  searchInput.value = '';

  renderProfiles();
  searchInput.focus();
});

clearFiltersButton.addEventListener('click', clearAllFilters);

// Load profiles from assets/profiles.json
loadProfiles();
