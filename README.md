# Faiq Faiqoh Yasmin — Creative Portfolio

The redesigned static portfolio starts at `index.html`. Its styles and interactions live in `styles.css`; browser interactions live in `script.js`; local images and fonts are in `assets/`.

To preview locally, run `python -m http.server 8000` from this directory and open `http://localhost:8000/`.

## Prepare and publish

Run `python package_public_site.py` to create `.publish/`. The script replaces that generated directory and includes only `index.html`, `styles.css`, `script.js`, `assets/`, and `.nojekyll`. It rejects symlinks and refuses to replace an output path that resolves outside this repo.

For a Vercel preview, log in with `vercel login` if needed, then run `vercel` from inside `.publish/`. Review the preview URL. Publish to the production domain only after approval by running `vercel --prod` from the same directory. If you change the site, package it again and select the existing Vercel project when deploying.

Upload or deploy only the contents of `.publish/`; do not upload the full repository. `deploy ayi.html` remains the preserved original source and is intentionally excluded from the public snapshot.
