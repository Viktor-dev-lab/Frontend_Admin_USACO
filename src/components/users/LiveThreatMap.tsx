import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LiveThreatMap.module.css';

// Vietnam focus coordinates
const VN_CENTER: [number, number] = [16.0346, 108.2022]; // Center on Da Nang for balance
const DEFAULT_ZOOM = 6;

const LOCATIONS = [
  { id: 1, name: 'Ho Chi Minh, VN', coords: [10.762622, 106.660172], status: 'normal', user: 'khang.le123', action: 'Submit (Accepted)', ip: '14.241.12.89' },
  { id: 2, name: 'Da Nang, VN', coords: [16.054407, 108.202164], status: 'normal', user: 'bao.pham09', action: 'Login', ip: '118.69.248.51' },
  { id: 3, name: 'Ha Noi, VN', coords: [21.028511, 105.804817], status: 'normal', user: 'minh.hoang', action: 'Login', ip: '113.161.44.20' },
  { id: 4, name: 'San Jose, CA', coords: [37.3382082, -121.8863286], status: 'high', user: 'admin@usaco.org', action: 'Brute Force', ip: '104.28.32.11' },
  { id: 5, name: 'New York, US', coords: [40.7127753, -74.0059728], status: 'normal', user: 'coder_x', action: 'Submit (Error)', ip: '72.14.201.55' },
  { id: 6, name: 'London, UK', coords: [51.5072178, -0.1275862], status: 'normal', user: 'uk_student', action: 'View Problem', ip: '5.10.64.12' },
  { id: 7, name: 'Moscow, RU', coords: [55.755826, 37.6172999], status: 'high', user: 'unknown_host', action: 'API Scanner', ip: '45.132.88.1' },
];

/**
 * Creates a custom Leaflet divIcon that renders the radar pulse animation
 */
const createRadarIcon = (status: string) => {
  const isHigh = status === 'high';
  const color = isHigh ? '#ef4444' : '#3b82f6';
  
  return L.divIcon({
    className: styles.customMarker,
    html: `
      <div class="${styles.radarPulseWrapper}">
        <div class="${styles.radarPulse}" style="background-color: ${color}; border: 2px solid ${color}"></div>
        <div class="${styles.radarDot}" style="background-color: ${color}"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  
  const handleReset = () => {
    map.setView(center, zoom);
  };

  return (
    <div className={styles.mapController}>
      <button onClick={handleReset} className={styles.controllerBtn}>
        Reset to Vietnam
      </button>
      <div className={styles.zoomControls}>
        <button onClick={() => map.zoomIn()} className={styles.zoomBtn}>+</button>
        <button onClick={() => map.zoomOut()} className={styles.zoomBtn}>-</button>
      </div>
    </div>
  );
};

const LiveThreatMap = () => {
  const [tooltip, setTooltip] = useState<any>(null);

  return (
    <div className={styles.mapContainer}>
      <MapContainer 
        center={VN_CENTER} 
        zoom={DEFAULT_ZOOM} 
        scrollWheelZoom={true}
        className={styles.leafletContainer}
        zoomControl={false} // Custom zoom controls
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController center={VN_CENTER} zoom={DEFAULT_ZOOM} />

        {LOCATIONS.map(loc => (
          <Marker 
            key={loc.id} 
            position={loc.coords as [number, number]}
            icon={createRadarIcon(loc.status)}
            eventHandlers={{
              mouseover: () => setTooltip(loc),
              mouseout: () => setTooltip(null),
            }}
          >
            <Popup className={styles.leafletPopup}>
              <div className={styles.popupContent}>
                <div className={styles.popupHeader}>{loc.name}</div>
                <div className={styles.popupRow}>User: <span>{loc.user}</span></div>
                <div className={styles.popupRow}>Action: <span>{loc.action}</span></div>
                <div className={styles.popupRow}>IP: <span>{loc.ip}</span></div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className={styles.mapOverlay}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: '#3b82f6' }}></div> Active Sessions
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: '#ef4444' }}></div> Anomaly Detected
        </div>
        <div className={styles.legendItem} style={{ marginLeft: '12px', fontSize: '0.65rem' }}>
          * Detailed View: Vietnam Focused
        </div>
      </div>
    </div>
  );
};

export default LiveThreatMap;

