"""ai_news — Alex Prompts weekly signal collector.

collect.py  — pull + score the week's frontier-tech stories (pure + network fns).
digest.py   — thin CLI that renders the collected signal for the Claude routine.

The Saturday Claude routine (ai_news/routine/) writes the draft from this signal;
Gemini was removed. See scripts/CLAUDE.md and memory: alex-prompts-education-pivot.
"""
