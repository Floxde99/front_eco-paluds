import { useEffect } from 'react'

let leafletCSSLoaded = false

/**
 * Component that dynamically loads Leaflet CSS when a map is about to be rendered.
 * This improves initial page load performance by deferring non-critical CSS.
 */
export default function LeafletCSS() {
    useEffect(() => {
        if (leafletCSSLoaded) return

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)

        leafletCSSLoaded = true

        return () => {
            // Don't remove - CSS should persist once loaded
        }
    }, [])

    return null
}

/**
 * Hook to load Leaflet CSS imperatively
 */
export function useLeafletCSS() {
    useEffect(() => {
        if (leafletCSSLoaded) return

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)

        leafletCSSLoaded = true
    }, [])
}
