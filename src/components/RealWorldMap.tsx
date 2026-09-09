'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  IndianRupee,
  AlertTriangle,
} from 'lucide-react';
import { MapPoint } from '@/components/SatelliteMap';

interface RealWorldMapProps {
  points: MapPoint[];
  selectedPointId?: string | null;
  onPointSelect?: (point: MapPoint | null) => void;
  className?: string;
  centerLat?: number;
  centerLng?: number;
  initialZoom?: number;
  height?: string;
  showControls?: boolean;
  title?: string;
}

// Tile layers configurations using real-world imagery services
const TILE_LAYERS = {
  satellite: {
    name: 'Google Satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Satellite Imagery',
  },
  hybrid: {
    name: 'Satellite + Roads',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Satellite & Roads',
  },
  street: {
    name: 'Google Streets',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps',
  },
  terrain: {
    name: 'Google Terrain',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Terrain',
  },
  esri: {
    name: 'Esri Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server'],
    maxZoom: 19,
    attribution: '&copy; Esri &mdash; NASA, USGS, Maxar',
  },
};

export default function RealWorldMap({
  points,
  selectedPointId,
  onPointSelect,
  className = '',
  centerLat = 15.38,
  centerLng = 73.85,
  initialZoom = 11,
  height = '480px',
  showControls = true,
  title,
}: RealWorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  const [mapMode, setMapMode] = useState<'hybrid' | 'satellite' | 'street' | 'terrain'>('hybrid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCenter, setActiveCenter] = useState({ lat: centerLat, lng: centerLng });
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [activePoint, setActivePoint] = useState<MapPoint | null>(null);

  // Filter valid points in the destination region (e.g. Goa lat < 20)
  const localPoints = useMemo(() => {
    return points.filter((p) => p.lat > 10 && p.lat < 22 && p.lng > 70 && p.lng < 80);
  }, [points]);

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    // Calculate initial center: if points exist, average them, else use defaults
    let initLat = centerLat;
    let initLng = centerLng;
    if (localPoints.length > 0) {
      const avgLat = localPoints.reduce((s, p) => s + p.lat, 0) / localPoints.length;
      const avgLng = localPoints.reduce((s, p) => s + p.lng, 0) / localPoints.length;
      initLat = avgLat;
      initLng = avgLng;
    }

    const map = L.map(containerRef.current, {
      center: [initLat, initLng],
      zoom: initialZoom,
      zoomControl: false, // Custom controls
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add Tile Layer
    const tileConfig = TILE_LAYERS[mapMode];
    const tileLayer = L.tileLayer(tileConfig.url, {
      subdomains: tileConfig.subdomains,
      maxZoom: tileConfig.maxZoom,
      attribution: tileConfig.attribution,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Map move/zoom listeners for HUD
    map.on('moveend', () => {
      const c = map.getCenter();
      setActiveCenter({ lat: c.lat, lng: c.lng });
      setCurrentZoom(map.getZoom());
    });

    // Invalidate size on load to guarantee proper tile filling
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Change Tile Layer when mapMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileConfig = TILE_LAYERS[mapMode];
    const newLayer = L.tileLayer(tileConfig.url, {
      subdomains: tileConfig.subdomains,
      maxZoom: tileConfig.maxZoom,
      attribution: tileConfig.attribution,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapMode]);

  // 3. Render Custom Markers and Polyline Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (localPoints.length === 0) return;

    // Add Polyline connecting chronological stops
    const routeCoords: [number, number][] = localPoints.map((p) => [p.lat, p.lng]);
    if (routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#6366f1',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.85,
      }).addTo(map);
      polylineRef.current = polyline;
    }

    // Add markers with custom HTML
    localPoints.forEach((point) => {
      const isSelected = selectedPointId === point.id;
      const isDisrupted = point.isImpacted || point.status === 'disrupted';

      // Pin HTML with price, icon, and status badge
      const iconHtml = `
        <div class="map-marker-container ${isSelected ? 'marker-selected' : ''}">
          <div class="map-marker-pill ${
            isDisrupted
              ? 'border-red-500 bg-red-950/90 text-red-200 ring-2 ring-red-500/40'
              : isSelected
              ? 'border-indigo-400 bg-indigo-950/95 text-white ring-2 ring-indigo-400 shadow-xl'
              : 'border-white/20 bg-slate-900/90 text-white'
          }">
            <span class="marker-icon">${point.icon || '📍'}</span>
            <span class="marker-title">${point.title}</span>
            ${
              point.cost !== undefined
                ? `<span class="marker-price">₹${point.cost.toLocaleString()}</span>`
                : ''
            }
          </div>
          <div class="marker-pointer ${
            isDisrupted
              ? 'bg-red-500 shadow-red-500'
              : isSelected
              ? 'bg-indigo-400 shadow-indigo-400'
              : 'bg-emerald-400 shadow-emerald-400'
          } ${isDisrupted ? 'marker-pulse' : ''}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [160, 48],
        iconAnchor: [80, 48],
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div class="map-popup-card">
          ${
            point.image
              ? `<div class="map-popup-img"><img src="${point.image}" alt="${point.title}" /></div>`
              : ''
          }
          <div class="map-popup-body">
            <div class="map-popup-header">
              <span class="map-popup-type">${point.type.toUpperCase()}</span>
              ${
                point.cost
                  ? `<span class="map-popup-cost">₹${point.cost.toLocaleString()}</span>`
                  : ''
              }
            </div>
            <h4 class="map-popup-title">${point.title}</h4>
            <p class="map-popup-desc">${point.description || ''}</p>
            <div class="map-popup-meta">
              <span>📍 ${point.lat.toFixed(4)}°N, ${point.lng.toFixed(4)}°E</span>
              <span class="map-popup-status ${isDisrupted ? 'status-disrupted' : 'status-ok'}">
                ${isDisrupted ? 'DISRUPTED' : 'CONFIRMED'}
              </span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-leaflet-popup',
        maxWidth: 280,
        offset: [0, -40],
      });

      marker.on('click', () => {
        setActivePoint(point);
        onPointSelect?.(point);
      });

      markersRef.current[point.id] = marker;
    });
  }, [localPoints, selectedPointId, onPointSelect]);

  // 4. Focus selected point
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPointId) return;

    const targetPoint = localPoints.find((p) => p.id === selectedPointId);
    if (targetPoint) {
      map.flyTo([targetPoint.lat, targetPoint.lng], Math.max(map.getZoom(), 13), {
        duration: 0.8,
      });

      const marker = markersRef.current[selectedPointId];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedPointId, localPoints]);

  // 5. Invalidate size on resize or fullscreen
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(t);
  }, [isFullscreen, height]);

  // Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || localPoints.length === 0) return;
    const bounds = L.latLngBounds(localPoints.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-xl select-none ${
        isFullscreen ? 'fixed inset-4 z-[9999] h-auto!' : ''
      } ${className}`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
    >
      {/* Actual Real-World Leaflet Map Canvas */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Top Map HUD & Layer Switcher */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Title & Live Status */}
          <div className="glass-card px-3 py-1.5 flex items-center gap-2 bg-black/75 backdrop-blur-md border-white/20 text-white shadow-lg pointer-events-auto rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold tracking-tight">
              {title || 'Real World Satellite & Aerial Radar'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline font-bold">
              LIVE TILES
            </span>
          </div>

          {/* Map Layer Mode Switcher */}
          <div className="flex items-center gap-1 glass-card p-1 bg-black/80 backdrop-blur-md border-white/20 shadow-lg pointer-events-auto rounded-xl">
            <button
              onClick={() => setMapMode('hybrid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'hybrid'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Google Satellite with Roads & Labels"
            >
              🛰️ Hybrid
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'satellite'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Google Pure Satellite Imagery"
            >
              🛰️ Pure Satellite
            </button>
            <button
              onClick={() => setMapMode('street')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'street'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Google Streets Roadmap"
            >
              🗺️ Streets
            </button>
            <button
              onClick={() => setMapMode('terrain')}
              className={`hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'terrain'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Google Topographic Terrain"
            >
              ⛰️ Terrain
            </button>
          </div>
        </div>
      )}

      {/* Floating Zoom & Tool Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-black/75 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-lg hover:scale-105"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-black/75 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-lg hover:scale-105"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitAll}
          className="w-9 h-9 rounded-xl bg-black/75 hover:bg-black/90 text-emerald-400 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-lg hover:scale-105"
          title="Fit All Tour Stops"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="w-9 h-9 rounded-xl bg-black/75 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-lg hover:scale-105"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Coordinates HUD */}
      <div className="absolute bottom-4 left-4 z-[400] pointer-events-none hidden sm:flex items-center gap-2">
        <div className="glass-card px-3 py-1.5 bg-black/70 backdrop-blur-md border-white/15 text-white/90 text-[10px] font-mono rounded-xl shadow-md">
          <span>COORDINATES: </span>
          <span className="text-emerald-400 font-bold">
            {activeCenter.lat.toFixed(4)}°N, {activeCenter.lng.toFixed(4)}°E
          </span>
          <span className="mx-1 text-white/40">|</span>
          <span>ZOOM: {currentZoom}x</span>
          <span className="mx-1 text-white/40">|</span>
          <span>STOPS: {localPoints.length}</span>
        </div>
      </div>
    </div>
  );
}
