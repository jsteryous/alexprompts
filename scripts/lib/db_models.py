"""
db_models.py — Pydantic models for Supabase row validation.

Used by push_to_supabase() in gvl_monitor.py and save_enriched_lead() in enrich.py.
Validates field types and rejects unknown columns before any DB write so that
column renames fail loudly instead of silently writing NULL.
"""

from typing import Optional
from pydantic import BaseModel, ConfigDict


class MarketSignalRow(BaseModel):
    """Mirrors the market_signals table schema. Extra fields raise an error."""
    model_config = ConfigDict(extra="forbid")

    timestamp:   str
    event_type:  str
    location:    str
    entity_name: str
    details:     str
    score:       int
    tag:         str
    source:      str
    valuation:   Optional[float] = None
    source_url:  Optional[str]   = None
    status:      Optional[str]   = None
    source_key:  Optional[str]   = None
    signal_type: Optional[str]   = None


class EnrichedLeadRow(BaseModel):
    """Mirrors the enriched_leads table schema. Extra fields raise an error."""
    model_config = ConfigDict(extra="forbid")

    signal_id:          str
    enrichment_status:  str
    event_type:         Optional[str]   = None
    location:           Optional[str]   = None
    valuation:          Optional[float] = None
    score:              Optional[int]   = None
    tag:                Optional[str]   = None
    transfer_type:      Optional[str]   = None
    principal_name:     Optional[str]   = None
    principal_role:     Optional[str]   = None
    contact_email:      Optional[str]   = None
    contact_phone:      Optional[str]   = None
    linkedin_url:       Optional[str]   = None
    search_evidence:    Optional[str]   = None
    notes:              Optional[str]   = None
    client_id:          Optional[str]   = None
    trade_tag:          Optional[str]   = None
