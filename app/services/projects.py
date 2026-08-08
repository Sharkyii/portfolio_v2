"""Parses tools/projects/**/README.md into structured project data.

Convention for images (add these next to each project's README.md):
  cover.png | cover.jpg | cover.jpeg | cover.webp | cover.svg | banner.* | thumbnail.*
  Falls back to the first image file found in the project directory.
  A project with no image gets image=None; the frontend should show a placeholder.
"""
import os
import re
from dataclasses import dataclass, field
from functools import lru_cache

from app.config import get_settings

IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")
PREFERRED_IMAGE_NAMES = ("cover", "banner", "thumbnail")

_URL_RE = re.compile(r"^https?://\S+$")
_HEADING_RE = re.compile(r"^#{1,6}\s+(.*)$")
_STACK_HEADING_RE = re.compile(r"^#{1,3}\s*(tech stack|stack)\s*$", re.IGNORECASE)
_CODE_FENCE_RE = re.compile(r"```.*?```", re.DOTALL)
_BOLD_WRAP_RE = re.compile(r"^\*{1,3}[^*]+\*{1,3}$")

_GITHUB_URL_RE = re.compile(r"https?://github\.com/[\w.-]+/[\w.-]+")
_LIVE_KEYWORD_RE = re.compile(r"\b(live|demo|deployed|hosted|website)\b", re.IGNORECASE)
_ANY_URL_RE = re.compile(r"https?://[^\s)\]]+")
_BARE_DOMAIN_RE = re.compile(r"\b([a-z0-9-]+\.[a-z]{2,}(?:/[^\s)\]]*)?)\b", re.IGNORECASE)


@dataclass
class Project:
    id: str
    title: str
    summary: str
    github_url: str | None
    live_url: str | None
    category: str | None
    stack: list[str] = field(default_factory=list)
    image: str | None = None


def _find_readme(filenames: list[str]) -> str | None:
    for name in filenames:
        if name.lower() == "readme.md":
            return name
    return None


def _find_image(project_dir: str, project_id: str) -> str | None:
    try:
        entries = os.listdir(project_dir)
    except OSError:
        return None

    images = {e: e for e in entries if e.lower().endswith(IMAGE_EXTENSIONS)}
    if not images:
        return None

    for preferred in PREFERRED_IMAGE_NAMES:
        for name in images:
            if os.path.splitext(name)[0].lower() == preferred:
                return f"/api/projects/{project_id}/image/{name}"

    first = sorted(images)[0]
    return f"/api/projects/{project_id}/image/{first}"


def _extract_github_url(text: str) -> str | None:
    match = _GITHUB_URL_RE.search(text)
    if not match:
        return None
    return re.sub(r"\.git$", "", match.group(0))


def _extract_live_url(text: str) -> str | None:
    for line in text.splitlines():
        if not _LIVE_KEYWORD_RE.search(line):
            continue
        url_match = _ANY_URL_RE.search(line)
        if url_match:
            url = url_match.group(0).rstrip(".,")
            if "localhost" in url or "127.0.0.1" in url or "github.com" in url:
                continue
            return url
        domain_match = _BARE_DOMAIN_RE.search(line)
        if domain_match:
            return f"https://{domain_match.group(1)}"
    return None


_LEADING_HEADINGS_RE = re.compile(r"^(?:[ \t]*#{1,6}[^\n]*\n)+", re.MULTILINE)


def _is_skippable_paragraph(clean: str) -> bool:
    if not clean:
        return True
    if clean.startswith(("![", "|", "#")):
        return True
    if _URL_RE.match(clean):
        return True
    if _BOLD_WRAP_RE.match(clean) and "." not in clean:
        return True
    return False


def _extract_summary(text: str, title: str, strip_title_prefix: bool) -> str:
    """First real prose paragraph in the doc — not necessarily right after the
    title (READMEs often run a heading straight into its own prose with no
    blank line between them, which merges them into one paragraph; a bare
    heading-then-body glue like that gets its heading line(s) peeled off
    rather than the whole paragraph discarded), not an image/table/bare URL,
    and not just a short bold tagline standing in for real content."""
    body = _CODE_FENCE_RE.sub("", text)
    raw_paragraphs = [p for p in re.split(r"\n\s*\n", body) if p.strip()]
    for raw in raw_paragraphs:
        raw = _LEADING_HEADINGS_RE.sub("", raw)
        clean = re.sub(r"\s+", " ", raw).strip()
        if strip_title_prefix and title and clean.startswith(title):
            clean = clean[len(title) :].strip(" -—:")
        if clean == title or _is_skippable_paragraph(clean):
            continue
        return clean[:400].rsplit(" ", 1)[0] if len(clean) > 400 else clean
    return ""


def _parse_readme(text: str) -> tuple[str, str, str | None, str | None, list[str]]:
    lines = text.splitlines()
    title = ""
    stack: list[str] = []

    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    # A bare URL as the very first line is just a repo pointer, not the title.
    if i < len(lines) and _URL_RE.match(lines[i].strip()):
        i += 1

    # Title: first markdown heading, if the README has one.
    title_from_heading = False
    for line in lines[i:]:
        m = _HEADING_RE.match(line.strip())
        if m:
            title = m.group(1).strip().strip("*").strip()
            title_from_heading = True
            break

    if not title:
        # No markdown heading anywhere — fall back to the first substantial line.
        # Real headings already separate title from body via markup, so only
        # this ambiguous fallback case needs the summary step to peel a
        # duplicated title back off the front of the next paragraph.
        for line in lines[i:]:
            stripped = line.strip()
            if not stripped or _URL_RE.match(stripped):
                continue
            title = stripped.strip("*_# ").strip()
            break

    github_url = _extract_github_url(text)
    live_url = _extract_live_url(text)
    summary = _extract_summary("\n".join(lines[i:]), title, strip_title_prefix=not title_from_heading)

    # Best-effort stack extraction from a "## Stack" / "## Tech Stack" section.
    # Bulleted items may wrap across multiple source lines; continuation lines
    # (no leading "-"/"*" and not blank) get appended to the current item.
    in_stack = False
    for line in lines:
        if _STACK_HEADING_RE.match(line.strip()):
            in_stack = True
            continue
        if not in_stack:
            continue
        stripped = line.strip()
        if stripped.startswith("#"):
            break
        if not stripped:
            continue
        if stripped.startswith(("-", "*")):
            item = re.sub(r"\|", " ", stripped.lstrip("-*").strip()).strip()
            if item and not item.startswith("Component") and not set(item) <= {"-", " ", "|"}:
                stack.append(item)
        elif stack:
            stack[-1] = f"{stack[-1]} {stripped}"

    return title, summary, github_url, live_url, stack[:12]


def _load_projects() -> list[Project]:
    settings = get_settings()
    root = os.path.normpath(settings.projects_dir)
    projects: list[Project] = []

    if not os.path.isdir(root):
        return projects

    for dirpath, _dirnames, filenames in os.walk(root):
        rel = os.path.relpath(dirpath, root)
        readme_name = _find_readme(filenames)
        if not readme_name or rel == ".":
            continue

        project_id = rel.replace(os.sep, "-").lower()
        category = None
        parts = rel.split(os.sep)
        if len(parts) > 1:
            category = parts[0]

        with open(os.path.join(dirpath, readme_name), encoding="utf-8-sig") as f:
            text = f.read()

        title, summary, github_url, live_url, stack = _parse_readme(text)
        if not title:
            title = parts[-1]

        projects.append(
            Project(
                id=project_id,
                title=title,
                summary=summary,
                github_url=github_url,
                live_url=live_url,
                category=category,
                stack=stack,
                image=_find_image(dirpath, project_id),
            )
        )

    projects.sort(key=lambda p: p.title.lower())
    return projects


@lru_cache
def list_projects() -> list[Project]:
    return _load_projects()


@lru_cache
def _project_dir_index() -> dict[str, str]:
    settings = get_settings()
    root = os.path.normpath(settings.projects_dir)
    index: dict[str, str] = {}
    for dirpath, _dirnames, filenames in os.walk(root):
        rel = os.path.relpath(dirpath, root)
        if not _find_readme(filenames) or rel == ".":
            continue
        index[rel.replace(os.sep, "-").lower()] = dirpath
    return index


def get_project_image_path(project_id: str, filename: str) -> str | None:
    settings = get_settings()
    root = os.path.normpath(settings.projects_dir)
    dirpath = _project_dir_index().get(project_id)
    if not dirpath or filename not in os.listdir(dirpath):
        return None
    full_path = os.path.join(dirpath, filename)
    # Guard against path traversal via a crafted filename.
    if os.path.commonpath([os.path.abspath(full_path), root]) != root:
        return None
    return full_path


def get_project_readme_text(project_id: str) -> str | None:
    dirpath = _project_dir_index().get(project_id)
    if not dirpath:
        return None
    readme_name = _find_readme(os.listdir(dirpath))
    if not readme_name:
        return None
    with open(os.path.join(dirpath, readme_name), encoding="utf-8-sig") as f:
        return f.read()


def project_context_for_prompt() -> str:
    """Renders the current project list as text for the bio/sonnet system prompt."""
    lines = []
    for p in list_projects():
        stack = f" ({', '.join(p.stack)})" if p.stack else ""
        lines.append(f"- {p.title}{stack}: {p.summary}")
    return "\n".join(lines)
