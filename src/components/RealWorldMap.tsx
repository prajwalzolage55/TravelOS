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
  Globe,
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

function getMarkerSvg(typeOrIcon: string = 'pin'): string {
  const k = (typeOrIcon || '').toLowerCase();
  if (k.includes('plane') || k.includes('flight')) {
    return `<svg class="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;
  }
  if (k.includes('hotel') || k.includes('resort') || k.includes('villa')) {
    return `<svg class="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><path d="M8 7h.01"/><path d="M16 7h.01"/><path d="M12 7h.01"/><path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M8 11h.01"/><path d="M10 22v-6.5m4 0V22"/></svg>`;
  }
  if (k.includes('car') || k.includes('transfer') || k.includes('taxi')) {
    return `<svg class="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
  }
  if (k.includes('utensils') || k.includes('food') || k.includes('restaurant') || k.includes('lunch') || k.includes('dinner')) {
    return `<svg class="w-3 h-3 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V2"/><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/></svg>`;
  }
  if (k.includes('ship') || k.includes('cruise') || k.includes('boat')) {
    return `<svg class="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10V2"/></svg>`;
  }
  if (k.includes('wave') || k.includes('scuba') || k.includes('dive')) {
    return `<svg class="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;
  }
  if (k.includes('tree') || k.includes('spice') || k.includes('nature')) {
    return `<svg class="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-6"/><path d="m10 10-2 2-2-2 2-2 2 2z"/><path d="m14 14-2 2-2-2 2-2 2 2z"/><path d="m18 10-2 2-2-2 2-2 2 2z"/></svg>`;
  }
  if (k.includes('landmark') || k.includes('heritage')) {
    return `<svg class="w-3 h-3 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`;
  }
  return `<svg class="w-3 h-3 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
}

    // Add markers with custom HTML
    localPoints.forEach((point) => {
      const isSelected = selectedPointId === point.id;
      const isDisrupted = point.isImpacted || point.status === 'disrupted';
      const iconSvg = getMarkerSvg(point.icon || point.type);

      // Pin HTML with high-contrast badge and SVG icon (Zero emojis)
      const iconHtml = `
        <div class="map-marker-container ${isSelected ? 'marker-selected' : ''}">
          <div class="map-marker-pill ${
            isDisrupted
              ? 'border-red-500 bg-red-950 text-red-200'
              : isSelected
              ? 'border-blue-400 bg-slate-900 text-white'
              : 'border-slate-700 bg-slate-900 text-white'
          }">
            <span class="marker-icon">${iconSvg}</span>
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
              ? 'bg-blue-400 shadow-blue-400'
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
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3 text-slate-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                ${point.lat.toFixed(4)}°N, ${point.lng.toFixed(4)}°E
              </span>
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
          <div className="glass-card px-3 py-1.5 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white shadow-lg pointer-events-auto rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold tracking-tight">
              {title || 'Real World Satellite & Aerial Radar'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline font-bold">
              LIVE TILES
            </span>
          </div>

          {/* Map Layer Mode Switcher - Clean Icons, No Emojis, No Funky Colors */}
          <div className="flex items-center gap-1 glass-card p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-lg pointer-events-auto rounded-xl">
            <button
              onClick={() => setMapMode('hybrid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'hybrid'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Google Satellite with Roads & Labels"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hybrid</span>
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'satellite'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Google Pure Satellite Imagery"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setMapMode('street')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'street'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Google Streets Roadmap"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Streets</span>
            </button>
            <button
              onClick={() => setMapMode('terrain')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'terrain'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Google Topographic Terrain"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Terrain</span>
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
