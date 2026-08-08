"""Cheap pre-check for obvious spam/abuse on public LLM-input endpoints, run
before spending an API call. Deliberately a light heuristic, not a full
moderation model — it's meant to catch keyboard-mash spam and hostile
one-liners, not to be an airtight content filter.
"""
import re

_REPEATED_CHAR_RE = re.compile(r"(.)\1{7,}")
_ALNUM_RE = re.compile(r"[a-zA-Z0-9]")

_ABUSE_PHRASES = (
    "fuck you",
    "f*ck you",
    "kill yourself",
    "kys",
    "you're an idiot",
    "you are an idiot",
    "stupid bot",
    "dumb bot",
    "shut up bot",
    "you suck",
    "screw you",
)


def is_spam_or_abusive(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return False

    lowered = stripped.lower()
    if any(phrase in lowered for phrase in _ABUSE_PHRASES):
        return True

    if _REPEATED_CHAR_RE.search(stripped):
        return True

    alnum_count = len(_ALNUM_RE.findall(stripped))
    if len(stripped) >= 20 and alnum_count / len(stripped) < 0.3:
        return True

    return False
