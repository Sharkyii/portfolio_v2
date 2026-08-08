"""Live GitHub stats, replacing the empty tools/opensource/main.py stub.

Uses the GitHub REST + GraphQL APIs directly rather than a package like
PyGithub, to keep the dependency footprint (and Vercel bundle size) small.
"""
import time
from dataclasses import dataclass, field

import httpx

from app.config import get_settings

_CACHE_TTL_SECONDS = 15 * 60
_cache: dict[str, tuple[float, "OpenSourceStats"]] = {}

_CONTRIBUTIONS_QUERY = """
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
"""


@dataclass
class MergedPR:
    title: str
    repo: str
    url: str
    merged_at: str | None


@dataclass
class OpenSourceStats:
    username: str
    merged_pr_count: int
    recent_prs: list[MergedPR]
    total_stars: int
    top_languages: list[tuple[str, int]] = field(default_factory=list)
    # None means the contribution calendar wasn't fetched (no GITHUB_TOKEN configured),
    # not that there were zero contributions.
    contribution_calendar: list[dict] | None = None


class OpenSourceFetchError(RuntimeError):
    pass


def _github_headers() -> dict[str, str]:
    headers = {"Accept": "application/vnd.github+json"}
    token = get_settings().github_token
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _fetch_merged_prs(username: str, headers: dict[str, str], limit: int) -> tuple[int, list[MergedPR]]:
    query = f"author:{username} type:pr is:merged"
    response = httpx.get(
        "https://api.github.com/search/issues",
        params={"q": query, "sort": "updated", "order": "desc", "per_page": limit},
        headers=headers,
        timeout=10.0,
    )
    response.raise_for_status()
    data = response.json()
    recent_prs = [
        MergedPR(
            title=item["title"],
            repo=item["repository_url"].split("/repos/")[-1],
            url=item["html_url"],
            merged_at=item.get("closed_at"),
        )
        for item in data.get("items", [])
    ]
    return data.get("total_count", 0), recent_prs


def _fetch_repo_stats(username: str, headers: dict[str, str]) -> tuple[int, list[tuple[str, int]]]:
    response = httpx.get(
        f"https://api.github.com/users/{username}/repos",
        params={"per_page": 100, "type": "owner", "sort": "pushed"},
        headers=headers,
        timeout=10.0,
    )
    response.raise_for_status()
    repos = response.json()

    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    lang_counts: dict[str, int] = {}
    for r in repos:
        lang = r.get("language")
        if lang:
            lang_counts[lang] = lang_counts.get(lang, 0) + 1
    top_languages = sorted(lang_counts.items(), key=lambda kv: kv[1], reverse=True)[:6]
    return total_stars, top_languages


def _fetch_contribution_calendar(username: str, token: str) -> list[dict] | None:
    response = httpx.post(
        "https://api.github.com/graphql",
        json={"query": _CONTRIBUTIONS_QUERY, "variables": {"username": username}},
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )
    if response.status_code != 200:
        return None

    calendar = (
        response.json()
        .get("data", {})
        .get("user", {})
        .get("contributionsCollection", {})
        .get("contributionCalendar")
    )
    if not calendar:
        return None

    return [
        {"date": day["date"], "count": day["contributionCount"]}
        for week in calendar["weeks"]
        for day in week["contributionDays"]
    ]


def get_github_stats(username: str | None = None, pr_limit: int = 10) -> OpenSourceStats:
    settings = get_settings()
    username = username or settings.github_username

    cached = _cache.get(username)
    if cached and (time.monotonic() - cached[0]) < _CACHE_TTL_SECONDS:
        return cached[1]

    headers = _github_headers()
    try:
        merged_pr_count, recent_prs = _fetch_merged_prs(username, headers, pr_limit)
        total_stars, top_languages = _fetch_repo_stats(username, headers)
    except httpx.HTTPError as exc:
        raise OpenSourceFetchError(f"GitHub API request failed: {exc}") from exc

    contribution_calendar = (
        _fetch_contribution_calendar(username, settings.github_token) if settings.github_token else None
    )

    stats = OpenSourceStats(
        username=username,
        merged_pr_count=merged_pr_count,
        recent_prs=recent_prs,
        total_stars=total_stars,
        top_languages=top_languages,
        contribution_calendar=contribution_calendar,
    )
    _cache[username] = (time.monotonic(), stats)
    return stats
