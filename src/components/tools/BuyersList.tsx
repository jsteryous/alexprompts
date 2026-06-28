"use client";

import { useMemo, useState } from "react";

/**
 * Greenville County commercial buyer's list. Reads a committed JSON dataset
 * (src/data/commercialSales.json, produced by scripts/greenville/commercial.py
 * from the county's public ArcGIS service) passed in from the server page, and
 * lets a visitor search, filter by price, and sort. Pure client-side, no API,
 * no cost. The buyer names are mostly LLCs, which is the point: each is a piece
 * of active commercial capital you could call about a listing.
 */

export interface Sale {
  pin: string;
  buyer: string;
  seller: string;
  price: number;
  saleDate: string | null;
  street: string;
  propType: string;
  landUse: string;
  deedBook: number | null;
  deedPage: number | null;
  lotSize: number | null;
  sqft: number | null;
  lat: number | null;
  lng: number | null;
}

export interface BuyersListData {
  generated_at: string;
  source: string;
  min_price: number;
  months: number;
  count: number;
  sales: Sale[];
}

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Format an ISO date without timezone drift (the value is a plain date). */
function prettyDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

const PRICE_FLOORS = [
  { label: "$250k+", value: 250000 },
  { label: "$500k+", value: 500000 },
  { label: "$1M+", value: 1000000 },
  { label: "$2M+", value: 2000000 },
  { label: "$5M+", value: 5000000 },
];

type SortKey = "date" | "price";

function mapsUrl(s: Sale): string | null {
  if (s.lat == null || s.lng == null) return null;
  return `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
}

export function BuyersList({ data }: { data: BuyersListData }) {
  const [query, setQuery] = useState("");
  const [floor, setFloor] = useState(data.min_price >= 1000000 ? 1000000 : 250000);
  const [sort, setSort] = useState<SortKey>("date");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = data.sales.filter((s) => {
      if (s.price < floor) return false;
      if (!q) return true;
      return (
        s.buyer.toLowerCase().includes(q) ||
        s.seller.toLowerCase().includes(q) ||
        s.street.toLowerCase().includes(q)
      );
    });
    const sorted = [...filtered].sort((a, b) =>
      sort === "price"
        ? b.price - a.price
        : (b.saleDate || "").localeCompare(a.saleDate || ""),
    );
    return sorted;
  }, [data.sales, query, floor, sort]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end mb-6">
        <label className="block flex-1">
          <span className="theme-text-secondary text-sm font-medium">Search a buyer, seller, or street</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. LLC, Pelham, Novant"
            className="theme-field w-full py-2.5 px-3 text-sm mt-1.5"
          />
        </label>
        <label className="block">
          <span className="theme-text-secondary text-sm font-medium">Min price</span>
          <select
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
            className="theme-field w-full sm:w-auto py-2.5 px-3 text-sm mt-1.5"
          >
            {PRICE_FLOORS.filter((p) => p.value >= data.min_price).map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="theme-text-secondary text-sm font-medium">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="theme-field w-full sm:w-auto py-2.5 px-3 text-sm mt-1.5"
          >
            <option value="date">Most recent</option>
            <option value="price">Highest price</option>
          </select>
        </label>
      </div>

      <div className="theme-text-muted text-sm mb-4 tabular-nums">
        Showing <span className="theme-text-primary font-semibold">{rows.length}</span> of {data.count} commercial
        sales (last {data.months} months). Updated {data.generated_at}.
      </div>

      {/* Rows */}
      <ul className="grid gap-3">
        {rows.map((s, i) => {
          const url = mapsUrl(s);
          return (
            <li
              key={`${s.pin}-${s.saleDate}-${i}`}
              className="theme-card-strong border theme-border rounded-xl p-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2"
            >
              <div className="min-w-0 flex-1">
                <div className="theme-text-primary font-semibold leading-snug break-words">{s.buyer}</div>
                <div className="theme-text-muted text-sm mt-0.5">
                  {s.street || "Greenville County"}
                  {s.seller && (
                    <>
                      {" · "}
                      <span className="theme-text-muted">from {s.seller}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theme-link text-xs font-medium inline-flex items-center gap-1"
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <circle cx="12" cy="11" r="2.5" />
                      </svg>
                      Map
                    </a>
                  )}
                  <span className="theme-badge text-xs font-medium px-2 py-0.5 rounded">
                    Parcel {s.pin}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="theme-text-primary text-lg font-bold tabular-nums">{usd(s.price)}</div>
                <div className="theme-text-muted text-sm tabular-nums mt-0.5">{prettyDate(s.saleDate)}</div>
              </div>
            </li>
          );
        })}
      </ul>

      {rows.length === 0 && (
        <div className="theme-card-muted border theme-border rounded-xl p-8 text-center theme-text-muted text-sm">
          No sales match that search. Try a different name, street, or a lower price floor.
        </div>
      )}
    </div>
  );
}
