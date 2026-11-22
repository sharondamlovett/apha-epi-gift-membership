# APHA Gift Membership Directory

A searchable static directory hosted on GitHub Pages. The public directory displays only profiles that the administrator manually adds to `assets/profiles.json` after reviewing the Google Form response and confirming consent.

## Links
- Submission form: https://forms.gle/DpoUy8tkKuhgpYQf6
- APHA Gift Membership Program: https://www.apha.org/membership/gift-membership

## Add or update a profile
Edit `assets/profiles.json` and add one object per approved member. Each profile needs two APHA section labels and a status of `Available` or `Archived`.

```json
[
  {
    "full_name": "Example Member",
    "email": "member@example.org",
    "bio": "A short public bio.",
    "section1": "Epidemiology (EPI)",
    "section2": "Environment (ENV)",
    "status": "Available"
  }
]
```

Use section labels exactly as listed in the website's section filter. The left card accent automatically uses the same color as the first section tag. Section colors are assigned consistently from a color palette. Set `status` to `Archived` when the profile should be marked archived; otherwise use `Available`.

Do not add unapproved submissions, private notes, or any additional personal information. Email addresses are publicly displayed, so publish only after explicit consent. Keep the Google Forms response spreadsheet private.

## Publish
Upload the contents of this folder to the root of the existing GitHub repository and commit the changes. Keep GitHub Pages configured to deploy from `main` and `/ (root)`.
