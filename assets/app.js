/*
 * Configure these two values in Supabase before publishing.
 * The anon/public key is intended for browser use; NEVER put a service-role key here.
 */
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const grid = document.getElementById("member-grid");
const statusEl = document.getElementById("directory-status");
const countEl = document.getElementById("result-count");
const emptyEl = document.getElementById("empty-state");
const searchEl = document.getElementById("search");
const clearEl = document.getElementById("clear-search");
const form = document.getElementById("member-form");
const formStatus = document.getElementById("form-status");

let profiles = [];
let supabase = null;

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
  if (!window.supabase || SUPABASE_URL.startsWith("YOUR_") || SUPABASE_PUBLISHABLE_KEY.startsWith("YOUR_")) {
    statusEl.textContent = "The directory is in setup mode. Add your Supabase project URL and public anon key in assets/app.js to connect member profiles.";
    countEl.textContent = "Setup required";
    return;
  }
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await supabase.from("public_member_directory")
    .select("id, full_name, email, bio")
    .order("created_at", { ascending: false });
  if (error) {
    statusEl.textContent = "We couldn't load profiles right now. Please try again later.";
    console.error(error);
    countEl.textContent = "Unavailable";
    return;
  }
  profiles = data || [];
  statusEl.hidden = true;
  renderProfiles();
}

searchEl.addEventListener("input", renderProfiles);
clearEl.addEventListener("click", () => { searchEl.value = ""; renderProfiles(); searchEl.focus(); });

form.addEventListener("submit", async event => {
  event.preventDefault();
  formStatus.textContent = "";
  if (!supabase) {
    formStatus.textContent = "The form is not connected yet. Please try again after the site administrator completes setup.";
    return;
  }
  const values = Object.fromEntries(new FormData(form).entries());
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Submitting…";
  const { error } = await supabase.from("member_submissions").insert({
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    mailing_address: values.mailing_address.trim(),
    phone: values.phone.trim(),
    bio: values.bio.trim(),
    publication_consent: values.publication_consent === "on"
  });
  submitButton.disabled = false;
  submitButton.innerHTML = 'Submit for review <span aria-hidden="true">→</span>';
  if (error) {
    console.error(error);
    formStatus.textContent = "Your submission could not be sent. Please try again or contact the directory administrator.";
    return;
  }
  form.reset();
  formStatus.textContent = "Thank you! Your profile has been submitted for review. It will appear after it is approved.";
});

loadProfiles();
