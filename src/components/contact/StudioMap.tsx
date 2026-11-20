import { useEffect, useRef, useState } from 'react'
import { studio } from '../../data/site'

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const OSM_URL = `https://www.openstreetmap.org/?mlat=${studio.coordinates.lat}&mlon=${studio.coordinates.lng}#map=16/${studio.coordinates.lat}/${studio.coordinates.lng}`

/**
 * Soften Liberty into ARHA warm paper — terracotta water edges, brass roads.
 */
function applyThemePaints(map: import('maplibre-gl').Map) {
  const style = map.getStyle()
  if (!style?.layers) return

  for (const layer of style.layers) {
    const id = layer.id
    try {
      if (layer.type === 'background') {
        map.setPaintProperty(id, 'background-color', '#f3eee6')
        continue
      }

      if (layer.type === 'fill') {
        if (id.includes('water')) map.setPaintProperty(id, 'fill-color', '#d9cfc3')
        else if (id.includes('building')) {
          map.setPaintProperty(id, 'fill-color', '#e4d9cb')
          map.setPaintProperty(id, 'fill-opacity', 0.85)
        } else if (id.includes('park') || id.includes('landcover') || id.includes('landuse')) {
          map.setPaintProperty(id, 'fill-color', '#e8e0d2')
          map.setPaintProperty(id, 'fill-opacity', 0.7)
        }
      }

      if (layer.type === 'line') {
        if (id.includes('water')) {
          map.setPaintProperty(id, 'line-color', '#c9b8a6')
        } else if (id.includes('boundary')) {
          map.setPaintProperty(id, 'line-color', 'rgba(147, 66, 54, 0.35)')
        } else if (id.includes('highway') || id.includes('road') || id.includes('bridge') || id.includes('tunnel')) {
          if (id.includes('casing')) {
            map.setPaintProperty(id, 'line-color', 'rgba(96, 74, 59, 0.35)')
          } else {
            map.setPaintProperty(id, 'line-color', '#9a7d58')
            map.setPaintProperty(id, 'line-opacity', 0.9)
          }
        }
      }

      if (layer.type === 'symbol') {
        map.setPaintProperty(id, 'text-color', '#2a221e')
        map.setPaintProperty(id, 'text-halo-color', '#faf7f2')
        map.setPaintProperty(id, 'text-halo-width', 1.15)
        map.setPaintProperty(id, 'text-opacity', 0.85)
      }
    } catch {
      /* some layers omit optional paint props */
    }
  }
}

/**
 * OpenFreeMap Liberty vector tiles via MapLibre — free, no API key.
 * https://openfreemap.org/
 */
export function StudioMap() {
  const container = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = container.current
    if (!el) return

    let cancelled = false
    let map: import('maplibre-gl').Map | null = null
    let marker: import('maplibre-gl').Marker | null = null
    let ro: ResizeObserver | null = null

    ;(async () => {
      try {
        const maplibregl = await import('maplibre-gl')
        const workerUrl = (await import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url')).default
        maplibregl.setWorkerUrl(workerUrl)
        await import('maplibre-gl/dist/maplibre-gl.css')
        if (cancelled || !container.current) return

        const { lat, lng } = studio.coordinates
        map = new maplibregl.Map({
          container: container.current,
          style: STYLE,
          center: [lng, lat],
          zoom: 14,
          attributionControl: { compact: true },
          scrollZoom: false,
        })

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

        const restyle = () => {
          if (!map) return
          applyThemePaints(map)
          map.resize()
        }

        map.on('load', restyle)
        map.on('idle', () => map?.resize())
        map.on('error', (e) => console.error('StudioMap error', e.error))

        marker = new maplibregl.Marker({ color: '#934236' })
          .setLngLat([lng, lat])
          .setPopup(
            new maplibregl.Popup({ offset: 18, className: 'studio-map-popup' }).setHTML(
              `<strong>${studio.legalName}</strong><br/><span style="opacity:.75">${studio.location}</span>`,
            ),
          )
          .addTo(map)

        ro = new ResizeObserver(() => map?.resize())
        ro.observe(container.current)
      } catch (err) {
        console.error('StudioMap failed to load', err)
        if (!cancelled) setFailed(true)
      }
    })()

    return () => {
      cancelled = true
      ro?.disconnect()
      marker?.remove()
      map?.remove()
    }
  }, [])

  return (
    <figure className="overflow-hidden border border-line">
      {failed ? (
        <a
          href={OSM_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-56 items-center justify-center bg-espresso px-4 text-center text-sm text-cream/70 transition-colors duration-500 hover:text-cream sm:h-64"
        >
          View studio on OpenStreetMap
        </a>
      ) : (
        <div
          ref={container}
          className="studio-map h-56 w-full bg-espresso sm:h-64"
          role="img"
          aria-label={`Map showing ${studio.legalName} at ${studio.location}`}
        />
      )}
      <figcaption className="flex items-center justify-between gap-4 border-t border-line px-3 py-2.5">
        <p className="text-[0.62rem] leading-relaxed text-cream/45">OpenFreeMap</p>
        <a
          href={OSM_URL}
          target="_blank"
          rel="noreferrer"
          className="text-[0.62rem] tracking-[0.04em] text-gold/80 transition-colors duration-500 hover:text-gold"
        >
          Open in Maps
        </a>
      </figcaption>
    </figure>
  )
}
