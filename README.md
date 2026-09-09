# GenAI Leader Exam Practice (Static Site)

A single, dependency-free HTML/CSS/JS site containing all the questions from this
repo's exam-prep data:

- **Practice Quiz** — 130 multiple-choice questions with explanations, filterable by
  section/difficulty, with shuffle and score tracking.
- **Study Q&A** — 77 study questions/answers organized by section and topic.
- **Glossary** — 55 key terms and definitions.

No build tools, frameworks, or server required — just static files.

## Files
- `index.html` — page structure and tabs
- `styles.css` — styling
- `app.js` — all interactivity (quiz logic, search, filters)
- `data.js` — exam data as a plain JS global



## Run locally
Just open `index.html` in a browser, or serve the folder:

```powershell
cd GAIL_Exam_Practice
python -m http.server 8000
```

Then visit http://localhost:8000

## Host for free on GitHub Pages
1. Push this repo to GitHub — it's already connected to
   `https://github.com/abhishek-nanda_spglobal/GAIL_Exam_Practice`:
   ```powershell
   git push origin main
   ```
2. In GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)` (all site files already live at the repo root,
   so no subfolder selection is needed).you can access at
   `https://abhishek-nanda-spglobal.github.io/GAIL_Exam_Practice/`.

Since it's plain HTML/CSS/JS with no build step, GitHub Pages will serve it as-is.
