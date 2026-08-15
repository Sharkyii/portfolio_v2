"""Retrieval-augmented Q&A over the project READMEs.

Corpus is ~10 short documents, so this hand-rolls a small TF-IDF ranker in
pure Python instead of pulling in a vector DB or an embeddings API — right
sized for the data, and keeps the Vercel function bundle small.
"""
import json
import math
import os
import re
from collections.abc import Iterator
from dataclasses import asdict, dataclass
from functools import lru_cache

from app.config import get_settings
from app.services.bio import MODEL, BioGenerationError, _client
from app.services.moderation import is_spam_or_abusive
from app.services.projects import get_project_readme_text, list_projects

RESUME_SOURCE_ID = "resume"
RESUME_SOURCE_TITLE = "Sneh Kansagara — Resume"

_STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are",
    "it", "this", "that", "with", "as", "by", "at", "be", "from", "into",
    "was", "were", "will", "can", "not", "no", "do", "does", "did", "has",
    "have", "had", "its", "their", "our", "your", "you", "i", "we", "they",
    "what", "how", "why", "which", "who",
}
_TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9']+")

# Below this, a retrieval match is noise (incidental word overlap) rather than
# a real answer — found via a real off-topic query ("are you free to work,
# can we book a meeting") pulling back three unrelated projects as "sources"
# because the old cutoff was just score > 0.
_MIN_RELEVANCE_SCORE = 0.1

_SCHEDULING_KEYWORDS_RE = re.compile(
    # No "call" here — it's far too common in this domain (API call, tool call,
    # function call) and would false-positive on real technical questions.
    r"\b(meet|meeting|schedule|scheduling|available|availability|book|booking|calendar)\b",
    re.IGNORECASE,
)

_ANSWER_SYSTEM_PROMPT = """You answer questions about {owner}'s software projects using only the \
excerpts below — don't use outside knowledge about these projects. If the excerpts don't answer \
the question, say so plainly instead of guessing. Keep the answer to a few sentences and mention \
which project(s) it's drawn from.

EXCERPTS:
{context}
"""


class QAError(RuntimeError):
    pass


@dataclass
class Chunk:
    project_id: str
    project_title: str
    github_url: str | None
    text: str


@dataclass
class Source:
    project_id: str
    title: str
    github_url: str | None


def _tokenize(text: str) -> list[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text) if len(t) > 1 and t.lower() not in _STOPWORDS]


_CODE_FENCE_RE = re.compile(r"```.*?```", re.DOTALL)


def _chunk_readme(text: str) -> list[str]:
    text = _CODE_FENCE_RE.sub("", text)
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks = []
    for p in paragraphs:
        if p.startswith("http"):
            continue
        clean = re.sub(r"\s+", " ", p)
        if len(clean) < 40:
            continue
        chunks.append(clean[:1200])
    return chunks[:20]


def _load_resume_text() -> str | None:
    settings = get_settings()
    resume_dir = os.path.dirname(os.path.normpath(settings.resume_path))
    txt_path = os.path.join(resume_dir, "resume.txt")
    if not os.path.isfile(txt_path):
        return None
    with open(txt_path, encoding="utf-8") as f:
        return f.read()


def _load_chunks() -> list[Chunk]:
    chunks: list[Chunk] = []
    for project in list_projects():
        text = get_project_readme_text(project.id)
        if not text:
            continue
        for paragraph in _chunk_readme(text):
            chunks.append(Chunk(project.id, project.title, project.github_url, paragraph))

    resume_text = _load_resume_text()
    if resume_text:
        for paragraph in _chunk_readme(resume_text):
            chunks.append(Chunk(RESUME_SOURCE_ID, RESUME_SOURCE_TITLE, None, paragraph))

    return chunks


@lru_cache
def _index() -> tuple[list[Chunk], list[dict[str, float]], dict[str, float]]:
    """Precomputes an L2-normalized TF-IDF vector per chunk, so a short chunk
    with one matching term doesn't outscore a long, genuinely relevant one —
    a raw tf/doc-length ranker had exactly that bias in testing."""
    chunks = _load_chunks()
    doc_tokens = [_tokenize(c.text) for c in chunks]

    doc_freq: dict[str, int] = {}
    for tokens in doc_tokens:
        for term in set(tokens):
            doc_freq[term] = doc_freq.get(term, 0) + 1

    n_docs = max(len(chunks), 1)
    idf = {term: math.log((n_docs + 1) / (df + 1)) + 1 for term, df in doc_freq.items()}

    doc_vectors: list[dict[str, float]] = []
    for tokens in doc_tokens:
        tf: dict[str, int] = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1
        weights = {term: (count / len(tokens)) * idf[term] for term, count in tf.items()} if tokens else {}
        norm = math.sqrt(sum(w * w for w in weights.values())) or 1.0
        doc_vectors.append({term: w / norm for term, w in weights.items()})

    return chunks, doc_vectors, idf


def retrieve(query: str, k: int = 5) -> list[Chunk]:
    chunks, doc_vectors, idf = _index()
    query_terms = _tokenize(query)
    if not chunks or not query_terms:
        return []

    query_tf: dict[str, int] = {}
    for t in query_terms:
        query_tf[t] = query_tf.get(t, 0) + 1
    query_weights = {term: count * idf.get(term, 0.0) for term, count in query_tf.items()}
    query_norm = math.sqrt(sum(w * w for w in query_weights.values())) or 1.0

    scores = [
        sum(weight * doc_vec.get(term, 0.0) for term, weight in query_weights.items()) / query_norm
        for doc_vec in doc_vectors
    ]

    ranked = sorted(range(len(chunks)), key=lambda i: scores[i], reverse=True)
    return [chunks[i] for i in ranked[:k] if scores[i] > _MIN_RELEVANCE_SCORE]


_SCHEDULING_REDIRECT_TEXT = (
    "I can't check calendars myself from here, but you can book time directly — "
    'hit the "Book a meeting" button (or head to /meet) to pick a slot, or just '
    "type when works for you there and it'll figure out the rest."
)
_NO_MATCH_TEXT = "I couldn't find anything in the project notes relevant to that question."


@dataclass
class PreparedAnswer:
    """Everything resolved *before* streaming starts. Config errors (no
    ANTHROPIC_API_KEY) have to surface as a real 503 — once a StreamingResponse
    begins, the status is already committed as 200, so the client lookup and
    any error it can raise has to happen here, synchronously, not inside the
    generator that does the actual token streaming."""

    sources: list[Source]
    blocked: bool
    image_url: str | None
    canned_text: str | None  # set → no LLM call needed, this is the full answer
    system_prompt: str | None  # set when canned_text isn't — streaming path
    question: str


def prepare_answer(question: str) -> PreparedAnswer:
    if is_spam_or_abusive(question):
        return PreparedAnswer([], True, "/api/meme", "Nice try.", None, question)

    if _SCHEDULING_KEYWORDS_RE.search(question):
        return PreparedAnswer([], False, None, _SCHEDULING_REDIRECT_TEXT, None, question)

    chunks = retrieve(question)
    if not chunks:
        return PreparedAnswer([], False, None, _NO_MATCH_TEXT, None, question)

    context = "\n\n".join(f"[{c.project_title}]\n{c.text}" for c in chunks)
    system_prompt = _ANSWER_SYSTEM_PROMPT.format(owner=get_settings().github_username, context=context)

    try:
        _client()  # eager config check — raises before any response has started
    except BioGenerationError as exc:
        raise QAError(str(exc)) from exc

    seen: set[str] = set()
    sources: list[Source] = []
    for c in chunks:
        if c.project_id not in seen:
            seen.add(c.project_id)
            sources.append(Source(c.project_id, c.project_title, c.github_url))

    return PreparedAnswer(sources, False, None, None, system_prompt, question)


def _ndjson(payload: dict) -> str:
    return json.dumps(payload) + "\n"


def stream_answer(prepared: PreparedAnswer) -> Iterator[str]:
    """NDJSON lines: one `meta` (sources/blocked/image_url, known up front
    since retrieval already ran), then one or more `delta` (text chunks —
    a single chunk for canned/short-circuit answers, token-by-token for a
    real LLM generation), then `done`."""
    yield _ndjson(
        {
            "type": "meta",
            "sources": [asdict(s) for s in prepared.sources],
            "blocked": prepared.blocked,
            "image_url": prepared.image_url,
        }
    )

    if prepared.canned_text is not None:
        yield _ndjson({"type": "delta", "text": prepared.canned_text})
    else:
        client = _client()
        with client.messages.stream(
            model=MODEL,
            max_tokens=600,
            system=prepared.system_prompt,
            messages=[{"role": "user", "content": prepared.question}],
        ) as stream:
            for text in stream.text_stream:
                yield _ndjson({"type": "delta", "text": text})

    yield _ndjson({"type": "done"})
