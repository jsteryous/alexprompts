'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ────────────────────────────────────────────────────────────────────

type Tag = 'HOT' | 'WARM' | 'COLD'

type Signal = {
  id: string
  timestamp: string
  event_type: string
  location: string
  entity_name: string
  valuation: number | null
  details: string
  score: number
  tag: Tag
  source: string
}

// ── Fallback mock data (shown when Supabase isn't configured yet) ────────────

const MOCK_SIGNALS: Signal[] = [
  {
    id: 'mock-1',
    timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
    event_type: 'PROPERTY TRANSFER',
    location: '7842 Augusta Rd, Greenville',
    entity_name: 'Verdmont Properties LLC',
    valuation: 720_000,
    details: '4,200 sqft commercial · New owner · No service contract on file',
    score: 96,
    tag: 'HOT',
    source: 'demo',
  },
  {
    id: 'mock-2',
    timestamp: new Date(Date.now() - 18 * 60_000).toISOString(),
    event_type: 'NEW BUSINESS FILING',
    location: 'Greenville Logistics LLC',
    entity_name: 'Greenville Logistics LLC',
    valuation: null,
    details: 'Industrial warehouse operator · HVAC & electrical contracts likely',
    score: 88,
    tag: 'HOT',
    source: 'demo',
  },
  {
    id: 'mock-3',
    timestamp: new Date(Date.now() - 36 * 60_000).toISOString(),
    event_type: 'INDUSTRIAL PERMIT',
    location: '1204 Laurens Rd, Simpsonville',
    entity_name: 'City of Greenville',
    valuation: 280_000,
    details: 'Phase 2 renovation permit · $280K project scope',
    score: 78,
    tag: 'WARM',
    source: 'demo',
  },
  {
    id: 'mock-4',
    timestamp: new Date(Date.now() - 54 * 60_000).toISOString(),
    event_type: 'PROPERTY TRANSFER',
    location: '3310 Wade Hampton Blvd, Taylors',
    entity_name: 'Upstate Realty Group LLC',
    valuation: 450_000,
    details: 'Strip mall acquisition · 6 units · New management company',
    score: 74,
    tag: 'WARM',
    source: 'demo',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const TAG_STYLES: Record<Tag, string> = {
  HOT:  'text-green-400 bg-green-400/10',
  WARM: 'text-yellow-400 bg-yellow-400/10',
  COLD: 'text-gray-400 bg-gray-400/10',
}

const DOT_STYLES: Record<Tag, string> = {
  HOT:  'bg-green-500',
  WARM: 'bg-yellow-500',
  COLD: 'bg-gray-500',
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatValuation(val: number | null): string {
  if (!val) return ''
  return val >= 1_000_000
    ? `$${(val / 1_000_000).toFixed(1)}M`
    : `$${(val / 1_000).toFixed(0)}K`
}

// ── Component ────────────────────────────────────────────────────────────────

export default function LiveSignalFeed() {
  const [signals, setSignals] = useState<Signal[]>(MOCK_SIGNALS)
  const [isLive, setIsLive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [newSignalId, setNewSignalId] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(23)
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!supabase) return  // no env vars — keep mock data

    const client = supabase
    let channel: ReturnType<typeof client.channel> | null = null

    const init = async () => {
      // Fetch latest 10 signals
      const { data, error } = await client
        .from('market_signals')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(6)

      if (!error && data && data.length > 0) {
        setSignals(data as Signal[])
      }

      // Fetch total count
      const { count } = await client
        .from('market_signals')
        .select('*', { count: 'exact', head: true })

      if (count !== null) setTotalCount(count)

      setIsLive(true)

      // Subscribe to new inserts for real-time updates
      channel = client
        .channel('market_signals_feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'market_signals' },
          (payload) => {
            const incoming = payload.new as Signal

            // Flash the scanning state
            if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
            setScanning(true)
            setNewSignalId(incoming.id)
            scanTimeoutRef.current = setTimeout(() => {
              setScanning(false)
              setNewSignalId(null)
            }, 3000)

            setSignals((prev) => [incoming, ...prev].slice(0, 6))
            setTotalCount((n) => n + 1)
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) client.removeChannel(channel)
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
    }
  }, [])

  return (
    <div
      className={`bg-gray-950 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
        scanning ? 'ring-1 ring-green-500/40' : ''
      }`}
    >
      {/* ── Terminal bar ──────────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 px-5 py-3 border-b transition-colors duration-500 ${
          scanning ? 'border-green-500/30' : 'border-white/10'
        }`}
      >
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="ml-3 text-xs text-gray-500 font-mono">
          upstate-multiplier · {isLive ? 'live' : 'demo'}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {scanning ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span className="text-xs text-green-400 font-mono font-bold tracking-wider">
                NEW SIGNAL
              </span>
            </>
          ) : (
            <>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500/60'}`} />
              <span className={`text-xs font-mono ${isLive ? 'text-green-500' : 'text-yellow-600'}`}>
                {isLive ? 'SYNC ACTIVE' : 'DEMO MODE'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Signal rows ───────────────────────────────────────────────── */}
      <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto scrollbar-none">
        {signals.map((signal) => {
          const isNew = signal.id === newSignalId
          const tag = (signal.tag as Tag) ?? 'WARM'
          return (
            <div
              key={signal.id}
              className={`px-5 py-4 transition-all duration-700 ${
                isNew ? 'bg-green-500/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5 ${DOT_STYLES[tag]}`}
                  />
                  <span className="text-xs font-semibold text-green-500 font-mono tracking-wide">
                    {signal.event_type}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {signal.valuation && (
                    <span className="text-xs text-gray-600 font-mono">
                      {formatValuation(signal.valuation)}
                    </span>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${TAG_STYLES[tag]}`}>
                    {tag}
                  </span>
                  <span className="text-xs text-gray-600 font-mono">
                    {formatTime(signal.timestamp)}
                  </span>
                </div>
              </div>
              <div className="text-sm font-semibold text-white ml-3.5 mb-0.5">
                {signal.location}
              </div>
              <div className="text-xs text-gray-500 ml-3.5 leading-relaxed">
                {signal.details}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-gray-600 font-mono">
          {totalCount} signal{totalCount !== 1 ? 's' : ''} processed
        </span>
        {isLive ? (
          <span className="text-xs text-green-600 font-mono">● Realtime connected</span>
        ) : (
          <span className="text-xs text-gray-700 font-mono">Connect Supabase for live data</span>
        )}
      </div>
    </div>
  )
}
