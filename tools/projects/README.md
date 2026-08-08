Each subdirectory with a `README.md` is auto-detected as a project by
`GET /api/projects` (see `app/services/projects.py`).

To add a project image, drop an image file next to that project's `README.md`:

```
tools/projects/cascade/README.md
tools/projects/cascade/cover.png   <- picked up automatically
```

Preferred filenames (checked in this order): `cover`, `banner`, `thumbnail`
with any of `.png .jpg .jpeg .webp .gif .svg`. If none of those exist, the first
image file found in the directory is used. No image → the API returns
`image: null` and the frontend should fall back to a placeholder.

## summary / github_url / live_url

- `summary` is the first real prose paragraph found anywhere in the README —
  not necessarily the one right after the title. Headings, images, tables,
  bare URLs, and short bold taglines are skipped in favor of actual content.
- `github_url` is the first `github.com/owner/repo` URL found anywhere in
  the file (a `git clone` line works fine) — it doesn't have to be on its
  own line. If a project has no GitHub link anywhere in its README, this is
  `null`; add one rather than relying on convention alone.
- `live_url` is detected from any line containing "live", "demo",
  "deployed", "hosted", or "website" followed by a URL (or a bare domain
  like `example.com`) on that same line, e.g. `deployed - https://foo.app`
  or `main website - example.com`. `localhost` URLs and GitHub links on that
  line are ignored so local dev instructions don't get mistaken for a live
  site. No matching line → `null`.
