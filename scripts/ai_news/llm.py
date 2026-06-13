"""
llm.py — shared Gemini call helper for the ai_news pipeline.

One grounded generate() with retry and an optional second-model fallback. Used by
digest.py (newsletter) and shorts.py (short-form scripts) so the call logic lives
in one place.
"""

from __future__ import annotations

import logging
import os
import sys
import time

log = logging.getLogger(__name__)


def generate(system: str, contents: str, model: str, *,
             grounded: bool = True, fallback_model: str | None = None,
             max_retries: int = 3) -> str:
    """Call Gemini once (optionally with Google Search grounding); return the text.

    Retries each model up to max_retries with exponential backoff, then falls back
    to fallback_model if given. Exits the process if everything fails.
    """
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        log.error("google-genai not installed. Run: pip install google-genai")
        sys.exit(1)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        log.error("GEMINI_API_KEY not set in .env.local")
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    cfg_kwargs = {"system_instruction": system, "temperature": 0.7}
    if grounded:
        cfg_kwargs["tools"] = [types.Tool(google_search=types.GoogleSearch())]

    models_to_try = [model] + ([fallback_model] if fallback_model else [])
    last_exc: Exception | None = None
    for m in models_to_try:
        log.info("Gemini call (%s)%s ...", m, " + grounding" if grounded else "")
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=m, contents=contents,
                    config=types.GenerateContentConfig(**cfg_kwargs),
                )
                text = response.text
                if not text or len(text.strip()) < 200:
                    raise ValueError(f"suspiciously short output ({len(text or '')} chars)")
                return text.strip()
            except Exception as exc:
                last_exc = exc
                if attempt < max_retries - 1:
                    wait = 2 ** attempt
                    log.warning("%s attempt %d/%d failed: %s — retrying in %ds",
                                m, attempt + 1, max_retries, exc, wait)
                    time.sleep(wait)
                else:
                    log.warning("%s exhausted retries: %s", m, exc)
        if fallback_model and m != fallback_model:
            log.warning("Falling back to %s ...", fallback_model)

    log.error("Gemini failed on all models: %s", last_exc)
    sys.exit(1)
