"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'

import { feature } from 'topojson-client'
import { visitedPlaces, visitedCountries } from '../../data/travel'

// We'll fetch a world TopoJSON at runtime (jsDelivr) to avoid mismatches with
// the local `world-atlas` package and to allow trying alternate map sources.

export default function TravelMap() {
  const router = useRouter()
  const [zoom, setZoom] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [features, setFeatures] = useState<any[] | null>(null)
  const [worldFeaturesFiltered, setWorldFeaturesFiltered] = useState<any[] | null>(null)

  useEffect(() => {
    // Fetch world TopoJSON from jsDelivr and convert to GeoJSON features
    let mounted = true
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then((r) => r.json())
      .then((topo) => {
        try {
          const f = feature(topo as any, (topo as any).objects.countries).features
          if (mounted) {
            setFeatures(f)
            // Keep the full set of world features (including India). We'll overlay
            // the legally-correct India geometry on top to hide internal state seams
            // but still draw international borders from the world features.
            setWorldFeaturesFiltered(f)
          }
        } catch (e) {
          // ignore
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    // Ensure we only render the heavy/map parts after client mount to avoid
    // tiny floating-point differences between server and client rendering
    // that cause React hydration warnings.
    setMounted(true)
  }, [])

  // (No India overlay) — keep the world features only and render markers.

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button className="px-2 py-1 rounded bg-slate-200" onClick={() => setZoom((z) => Math.min(8, z * 1.5))}>+</button>
        <button className="px-2 py-1 rounded bg-slate-200" onClick={() => setZoom((z) => Math.max(1, z / 1.5))}>−</button>
        <button className="px-2 py-1 rounded bg-slate-200" onClick={() => setZoom(1)}>Reset</button>
      </div>

      <ComposableMap projectionConfig={{ scale: 150 }} width={980} height={500} style={{ overflow: 'hidden', display: 'block' }}>
        <ZoomableGroup zoom={zoom}>
          {/* Base world fill (no strokes) — we'll draw international borders on top */}
          {mounted && worldFeaturesFiltered ? (
            <Geographies geography={{ type: 'FeatureCollection', features: worldFeaturesFiltered }}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = (geo.properties && (geo.properties.name || geo.properties.NAME || geo.properties.admin)) as string
                  const visited = name ? visitedCountries.includes(name) : false
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={visited ? '#ffd966' : '#e6edf3'}
                      stroke="none"
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none', opacity: 0.9 },
                        pressed: { outline: 'none' }
                      }}
                    />
                  )
                })
              }
            </Geographies>
          ) : (
            <></>
          )}

          {/* No India overlay — render the world features directly. */}

          {mounted && visitedPlaces.map((p) => {
            const baseRadius = 1 // further reduced base radius
            const radius = Math.max(0.3, baseRadius / Math.max(1, zoom))
            const strokeW = Math.max(0.15, 0.5 / Math.max(1, zoom))
            return (
              <Marker key={p.slug} coordinates={p.coordinates}>
                  <g onClick={() => router.push(`/photos/${p.slug}`)} style={{ cursor: 'pointer' }}>
                    <title>{p.name}</title>
                    <circle r={radius} fill="#ff5a5f" stroke="#fff" strokeWidth={strokeW} />
                  </g>
                </Marker>
            )
          })}

          {/* Draw international borders on top so India's exterior border is visible */}
          {mounted && worldFeaturesFiltered && (
            <Geographies geography={{ type: 'FeatureCollection', features: worldFeaturesFiltered }}>
              {({ geographies }) => {
                const outlineWidth = Math.max(0.2, (1 / 3) / Math.max(1, zoom))
                return geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey + '-outline'}
                    geography={geo}
                    fill="none"
                    stroke="#c0c6cc"
                    strokeWidth={outlineWidth}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none' } }}
                  />
                ))
              }}
            </Geographies>
          )}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
