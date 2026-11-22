# APHA Membership Sponsorship Directory

A responsive, searchable directory for APHA members seeking a sponsor for a one-year membership waiver. The visual direction is inspired by the linked ISEE resource menu: a welcoming introduction, searchable listings, clear sections, and a simple submission path.

## What this starter includes

- Public directory cards with **full name, email address, and bio only**
- Search across member names and bios
- Submission form collecting full name, email, mailing address, phone, and bio
- Required, explicit consent before a profile can be considered for publication
- Supabase database schema with a pending-review workflow
- GitHub Pages-ready static frontend

## Privacy and security model

GitHub Pages hosts static files; it is not a secure database or private form processor. This project uses Supabase for submissions and directory data.

- Mailing address and phone are stored only in `member_submissions`.
- The browser is granted permission to insert submissions, but not to read the private table.
- The public directory reads from `public_member_directory`, a view containing only `full_name`, `email`, and `bio` only.
- New submissions default to `pending`; they do not appear publicly until an administrator approves them.
- The public email address is personal information. Keep the required publication-consent checkbox and make the privacy notice clear.
- Never place a Supabase `service_role` key in this repository or browser code.

For a production launch, configure Supabase spam protection/rate limits (and CAPTCHA if appropriate), establish a retention/deletion process, and publish an appropriate privacy notice. Do not collect more personal information than you need.

## Setup

### 1. Create a Supabase project

Create a project at [Supabase](https://supabase.com/). In the SQL Editor, run `supabase/schema.sql`.

### 2. Configure the frontend

In `assets/app.js`, replace:

```js
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";
```

with the project URL and **publishable** key from Supabase project settings. The publishable key is designed for browser use; never use a secret or service-role key.

### 3. Review submissions

In Supabase Table Editor, open `member_submissions`. Review each pending entry and its consent. To publish a profile, set:

- `status` = `approved`
- `approved_at` = current timestamp

To decline it, set `status` = `rejected`. Only approved, consented profiles appear in the public view.

Restrict Supabase dashboard access to trusted administrators. Do not share admin credentials with directory users.

### 4. Publish with GitHub Pages

1. Create a new GitHub repository (for example, `apha-membership-sponsorship-directory`).
2. Upload the contents of this project to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site. The URL will be shown in the Pages settings.

You can also use GitHub Desktop or git:

```bash
git init
git add .
git commit -m "Initial APHA sponsorship directory"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/apha-membership-sponsorship-directory.git
git push -u origin main
```

## Before inviting members

- Confirm APHA name/logo usage and whether APHA or a relevant group must approve this initiative.
- Clarify that the directory is an independent connection tool unless formally endorsed by APHA.
- Confirm what “sponsor” means operationally and that a sponsor's contribution actually qualifies for the one-year waiver.
- Add a contact address for questions and privacy requests.
- Test the public directory with a test profile; verify that address and phone never appear in page source, network responses for the public view, or directory cards.
- Consider using a dedicated organizational email for administration.

## Customization

Edit the page title, introduction, footer, and explanatory copy in `index.html`. Adjust colors and typography in `assets/styles.css`.
