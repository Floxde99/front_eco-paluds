import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function MapAutoUpdater({ center, zoom, markers }) {
  const map = useMap()

  useEffect(() => {
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((marker) => marker.position))
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 })
      }
    } else if (markers.length === 1) {
      const [lat, lng] = markers[0].position
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        map.setView([lat, lng], 16, { animate: true })
      }
    } else if (Array.isArray(center) && center.length === 2) {
      const [lat, lng] = center
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        map.setView([lat, lng], zoom, { animate: true })
      }
    }
  }, [center, zoom, markers, map])

  return null
}

export function InteractiveMap({
  center = [43.2901, 5.4768], // Marseille par défaut
  zoom = 10,
  markers = [],
  className = 'h-64 w-full rounded-lg',
}) {
  const validMarkers = useMemo(
    () =>
      markers.filter((marker) => Array.isArray(marker?.position) && marker.position.length === 2),
    [markers]
  )

  return (
    <MapContainer center={center} zoom={zoom} className={className}>
      <MapAutoUpdater center={center} zoom={zoom} markers={validMarkers} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validMarkers.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default InteractiveMap