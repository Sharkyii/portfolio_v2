- `resume.tex` — LaTeX source, ATS-optimized. Compile with `pdflatex resume.tex` (or paste into Overleaf) and drop the output here as `resume.pdf` for the polished version.
- `resume.txt` — plain-text version stripped of LaTeX markup, kept in sync with `resume.tex` by hand. Machine-readable: served as a fallback by `/api/resume` when no `resume.pdf` is present, and indexed into `/api/ask`'s retrieval so it can answer questions about Sneh directly, not just about the projects.

Served at `GET /api/resume` — PDF if present, otherwise the plain text.
