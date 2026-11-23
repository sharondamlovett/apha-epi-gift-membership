# APHA Gift Membership Database

Created and managed by Dr. Sharonda Lovett at sharonda.lovett.apha [at] gmail.com

Searchable database of current APHA members seeking financial support for a 1-year APHA membership waiver. Prospective donors can review the profiles of prospective recipients, identify which recipient(s) they wish to gift to, and contact APHA staff directly at 1-877-396-APHA (2742) weekdays between 9am–5pm Eastern Time to coordinate payment. All donors and recipients will receive an email confirmation of the transaction recipient/processing of the APHA membership from APHA staff. Please do not attempt to exchange payment without APHA staff. Learn more: https://www.apha.org/membership/gift-membership

## Notes
Updates? Commit changes and keep GitHub Pages to deploy from `main` and `/ (root)`.
Upon review, profiles are added: `assets/profiles.json`. 
All have consented to displayed information.
Left accents automatically align with the color of the first tag. 


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
