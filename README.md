# APHA Membership Sponsorship Directory

A responsive, searchable GitHub Pages directory for APHA members seeking a sponsor for a one-year membership waiver. The site is inspired by the linked ISEE resource menu and uses Google Forms for private submissions—no Supabase or separate database account is required.

## How it works

- Members submit their **full name, email address, and bio** through this Google Form: https://forms.gle/XqcmtGsKiCVCed3A6
- Google Forms stores responses in the form owner's account. You can link the form to a private Google Sheet from its **Responses** tab.
- The website displays only profiles that the administrator manually adds to `assets/profiles.json` after reviewing the submission and confirming consent.
- The public directory supports searching by name and bio.

## Important privacy distinction

The Google Form and its response spreadsheet are private to the form owner according to the sharing settings you choose. The public directory is a separate static file. **Do not put unapproved submissions, private notes, or any additional personal information in `assets/profiles.json`.** Only include the three fields intended for public display: full name, email address, and bio. Since email addresses are public in this directory, make sure the form clearly obtains explicit consent for public display before you publish a profile.

Google Forms does not automatically feed approved submissions into this static directory. The manual review-and-publish step is intentional and avoids making every submission public automatically.

## Add an approved profile

Edit `assets/profiles.json` in your GitHub repository and add an object for each approved member. Example:

```json
[
  {
    "full_name": "Jordan Example",
    "email": "jordan@example.org",
    "bio": "Public health professional interested in community health and policy."
  }
]
```

Use valid JSON: double quotes around keys and text, commas between objects, and no trailing comma after the final object. Commit the change. GitHub Pages will update the public directory after deployment. To remove a profile, delete its object from this file and commit the change.

## Update the submission form link

The website currently links to the Google Form responder URL above. If you replace the form, update the `href` in the `#request` section of `index.html`.

## Publish with GitHub Pages

1. Create a GitHub repository (for example, `apha-membership-sponsorship-directory`).
2. Upload the contents of this project to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site. The URL will appear in Pages settings.

## Before inviting members

- In Google Forms, verify the form asks only for full name, email address, and bio, and includes a required consent item authorizing public display of all three fields.
- Link the form to a Google Sheet using **Responses → Link to Sheets**. Keep the response spreadsheet restricted to trusted administrators; do not publish it to the web.
- Test a submission and confirm it appears in the private response sheet, not automatically in the public directory.
- Confirm APHA name/logo usage and whether APHA or a relevant group must approve this initiative. Unless formally endorsed, describe it as an independent community connection tool.
- Add a contact address for privacy questions and requests to remove a published profile.
- Establish a process for removing profiles when members withdraw consent.
