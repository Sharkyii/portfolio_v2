"""Generates a short sonnet-style bio grounded in the parsed project data.

Replaces the original main.py, which had four separate bugs: `system` passed
as a message role instead of the `system=` kwarg, `max_tokens_to_sample`
(not a valid Messages API argument), reading the response as
`messages['completion']` (that's the old Completions API shape), and a
hardcoded placeholder instead of real project context.
"""
from functools import lru_cache

import anthropic

from app.config import get_settings
from app.services.projects import project_context_for_prompt

MODEL = "claude-sonnet-4-5"

SYSTEM_PROMPT_TEMPLATE = """You are a helpful assistant that writes a short sonnet introducing a software \
engineer's portfolio, grounded in their real projects below. Keep it to 14 lines, \
confident but not boastful, and reference at most two or three of the projects concretely.

PROJECTS:
{projects}
"""


class BioGenerationError(RuntimeError):
    pass


@lru_cache
def _client() -> anthropic.Anthropic:
    settings = get_settings()
    if not settings.anthropic_api_key:
        raise BioGenerationError("ANTHROPIC_API_KEY is not configured")
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def generate_sonnet(user_input: str) -> str:
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(projects=project_context_for_prompt())
    message = _client().messages.create(
        model=MODEL,
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_input}],
    )
    return message.content[0].text
