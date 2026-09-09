'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Navigation,
  MapPin,
  Clock,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Compass,
  X,
  Sparkles,
  Plane,
  Eye,
} from 'lucide-react';
import { TripNode, Experience } from '@/lib/utils/types';

export interface MapPoint {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  type: 'flight' | 'hotel' | 'transfer' | 'activity' | 'restaurant' | 'event' | 'experience';
  cost?: number;
  provider?: string;
  status?: string;
  riskLevel?: string;
  icon?: string;
  image?: string;
  startTime?: string;
  endTime?: string;
  isImpacted?: boolean;
}

interface SatelliteMapProps {
  points: MapPoint[];
  selectedPointId?: string | null;
  onPointSelect?: (point: MapPoint | null) => void;
  className?: string;
  centerLat?: number;
  centerLng?: number;
  initialZoom?: number;
  height?: string;
  showControls?: boolean;
  interactive?: boolean;
  title?: string;
}

export function SatelliteMap({
  points,
  selectedPointId,
  onPointSelect,
  className = '',
  centerLat = 15.4989,
  centerLng = 73.8278,
  initialZoom = 11,
  height = '480px',
  showControls = true,
  interactive = true,
  title,
}: SatelliteMapProps) {
  // Map View Mode: satellite | hybrid | terrain | dark
  const [mapMode, setMapMode] = useState<'satellite' | 'hybrid' | 'terrain' | 'dark'>('satellite');
  const [zoom, setZoom] = useState(initialZoom);
  const [center, setCenter] = useState({ lat: centerLat, lng: centerLng });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePoint, setActivePoint] = useState<MapPoint | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync selectedPointId with activePoint
  useEffect(() => {
    if (selectedPointId) {
      const found = points.find((p) => p.id === selectedPointId);
      if (found) {
        setActivePoint(found);
        setCenter({ lat: found.lat, lng: found.lng });
      }
    }
  }, [selectedPointId, points]);

  // Compute map bounds around Goa
  const bounds = useMemo(() => {
    if (points.length === 0) return { minLat: 15.0, maxLat: 15.8, minLng: 73.6, maxLng: 74.3 };
    const lats = points.map((p) => p.lat).filter((l) => l < 20); // filter out Delhi for Goa zoom
    const lngs = points.map((p) => p.lng).filter((l) => l < 76);
    return {
      minLat: Math.min(...lats, 15.1),
      maxLat: Math.max(...lats, 15.7),
      minLng: Math.min(...lngs, 73.7),
      maxLng: Math.max(...lngs, 74.2),
    };
  }, [points]);

  // Project lat/lng to normalized (0 to 100%) SVG/container coordinates
  const project = useCallback(
    (lat: number, lng: number) => {
      // Mercator approximation centered on current center & zoom
      const latRange = 0.8 / Math.pow(1.6, zoom - 10);
      const lngRange = 0.9 / Math.pow(1.6, zoom - 10);

      const x = 50 + ((lng - center.lng) / lngRange) * 50;
      const y = 50 - ((lat - center.lat) / latRange) * 50;

      return { x, y };
    },
    [center, zoom]
  );

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 1, 16));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 1, 8));

  const handleReset = () => {
    setCenter({ lat: centerLat, lng: centerLng });
    setZoom(initialZoom);
    setActivePoint(null);
    onPointSelect?.(null);
  };

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const scale = 0.0006 / Math.pow(1.6, zoom - 10);
    setCenter((prev) => ({
      lat: prev.lat + dy * scale,
      lng: prev.lng - dx * scale,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel to zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  // Trajectory connection line coordinates
  const pathCoordinates = useMemo(() => {
    const goaPoints = points
      .filter((p) => p.lat < 20) // exclude distant departure flights
      .map((p) => project(p.lat, p.lng));

    return goaPoints.map((pt) => `${pt.x}% ${pt.y}%`).join(', ');
  }, [points, project]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-xl select-none ${
        isFullscreen ? 'fixed inset-4 z-[9999] h-auto!' : ''
      } ${className}`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
    >
      {/* 🛰️ SATELLITE TILE BACKGROUND */}
      <div
        className="absolute inset-0 transition-opacity duration-700 bg-cover bg-center"
        style={{
          backgroundImage:
            mapMode === 'satellite' || mapMode === 'hybrid'
              ? 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=2400&auto=format&fit=crop)' // High-res tropical aerial coastal ocean satellite vista
              : mapMode === 'terrain'
              ? 'radial-gradient(ellipse at 70% 30%, #1e3a5f 0%, #0c1a2c 100%)'
              : 'linear-gradient(180deg, #0b1120 0%, #020617 100%)',
          filter:
            mapMode === 'satellite'
              ? 'contrast(1.15) brightness(0.92) saturate(1.2)'
              : mapMode === 'hybrid'
              ? 'contrast(1.2) brightness(0.85) saturate(1.3)'
              : 'none',
        }}
      />

      {/* Satellite Grid & Telemetry Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Coastal Bathymetry / Relief SVG overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#06d6a0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Animated Polyline for Trip Route */}
        {points.length > 1 && (
          <path
            d={points
              .filter((p) => p.lat < 20)
              .reduce((acc, p, i) => {
                const pt = project(p.lat, p.lng);
                return `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x}% ${pt.y}%`;
              }, '')}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3"
            strokeDasharray="6,6"
            className="flow-line"
            filter="url(#glow)"
          />
        )}
      </svg>

      {/* Top Map Header & Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="glass-card px-3 py-1.5 flex items-center gap-2 bg-black/60 backdrop-blur-md border-white/15 text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold tracking-wide">
              {title || 'Goa Satellite Radar'}
            </span>
            <span className="text-[10px] text-white/60 font-mono hidden sm:inline">
              LIVE TELEMETRY
            </span>
          </div>

          {/* Coordinate Readout */}
          <div className="hidden md:flex glass-card px-3 py-1.5 items-center gap-2 bg-black/50 backdrop-blur-md border-white/10 text-white/80 text-[11px] font-mono">
            <Compass className="w-3 h-3 text-emerald-400" />
            {center.lat.toFixed(4)}°N, {center.lng.toFixed(4)}°E
          </div>
        </div>

        {/* Mode Switcher */}
        {showControls && (
          <div className="flex items-center gap-1.5 glass-card p-1 bg-black/60 backdrop-blur-md border-white/15">
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                mapMode === 'satellite'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapMode('hybrid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                mapMode === 'hybrid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🗺️ Hybrid
            </button>
            <button
              onClick={() => setMapMode('terrain')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all hidden sm:block ${
                mapMode === 'terrain'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🏔️ Terrain
            </button>
          </div>
        )}
      </div>

      {/* Interactive Map Pins */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {points.map((point) => {
          const pos = project(point.lat, point.lng);
          const isSelected = activePoint?.id === point.id;
          const isDisrupted = point.isImpacted || point.status === 'disrupted';

          // Skip if projected outside visible range
          if (pos.x < -10 || pos.x > 110 || pos.y < -10 || pos.y > 110) return null;

          return (
            <div
              key={point.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
              onClick={() => {
                setActivePoint(point);
                onPointSelect?.(point);
              }}
            >
              {/* Ripple animation for disrupted or selected */}
              {isDisrupted && (
                <div className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping" />
              )}
              {isSelected && (
                <div className="absolute -inset-3 rounded-full bg-indigo-500/30 animate-pulse" />
              )}

              {/* Pin marker */}
              <motion.div
                whileHover={{ scale: 1.25, y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md text-xs font-semibold transition-all ${
                  isDisrupted
                    ? 'bg-red-600 text-white border-2 border-white'
                    : isSelected
                    ? 'bg-indigo-600 text-white border-2 border-white ring-4 ring-indigo-500/30'
                    : 'bg-white/95 text-slate-900 border border-slate-200 hover:bg-white hover:shadow-xl'
                }`}
              >
                <span>{point.icon || '📍'}</span>
                <span className="max-w-[120px] truncate text-[11px] font-medium hidden sm:inline">
                  {point.title.split('—')[0].replace('Flight DEL → GOI', 'DEL→GOI')}
                </span>
                {point.cost ? (
                  <span className="text-[10px] opacity-80 font-mono">₹{point.cost}</span>
                ) : null}
              </motion.div>

              {/* Pin stem pointer */}
              <div
                className={`w-1.5 h-1.5 mx-auto rotate-45 -mt-0.5 ${
                  isDisrupted ? 'bg-red-600' : isSelected ? 'bg-indigo-600' : 'bg-white'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Right Controls */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            title="Zoom in"
            className="w-9 h-9 rounded-xl glass-card bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border-white/20 transition-all shadow-lg cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom out"
            className="w-9 h-9 rounded-xl glass-card bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border-white/20 transition-all shadow-lg cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Recenter Map"
            className="w-9 h-9 rounded-xl glass-card bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border-white/20 transition-all shadow-lg cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle fullscreen"
            className="w-9 h-9 rounded-xl glass-card bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border-white/20 transition-all shadow-lg cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Selected Point Popover Card */}
      <AnimatePresence>
        {activePoint && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 left-4 z-30 max-w-sm w-[calc(100%-2rem)] sm:w-80 pointer-events-auto"
          >
            <div className="glass-card overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-white/30 dark:border-slate-800 shadow-2xl">
              {/* Photo header if available */}
              {activePoint.image && (
                <div className="relative h-28 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePoint.image}
                    alt={activePoint.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  <button
                    onClick={() => setActivePoint(null)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                    {activePoint.type.toUpperCase()}
                  </span>
                </div>
              )}

              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--foreground)] line-clamp-1">
                      {activePoint.title}
                    </h4>
                    {activePoint.provider && (
                      <p className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        {activePoint.provider}
                      </p>
                    )}
                  </div>
                  {!activePoint.image && (
                    <button
                      onClick={() => setActivePoint(null)}
                      className="text-[var(--text-tertiary)] hover:text-[var(--foreground)] p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {activePoint.description && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 my-1.5">
                    {activePoint.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)] mt-2">
                  <div className="font-bold text-[var(--foreground)] flex items-center gap-0.5">
                    {activePoint.cost ? (
                      <>
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                        {activePoint.cost.toLocaleString()}
                      </>
                    ) : (
                      'Free / Included'
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      activePoint.isImpacted || activePoint.status === 'disrupted'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : activePoint.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}
                  >
                    {activePoint.isImpacted ? '⚠️ At Risk' : activePoint.status || 'Confirmed'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Coastal Telemetry Bar */}
      <div className="absolute bottom-2 left-4 z-10 hidden sm:flex items-center gap-3 pointer-events-none text-[10px] text-white/70 font-mono drop-shadow">
        <span>Goa Sector: 15.2993°N 74.1240°E</span>
        <span>•</span>
        <span>Elevation: 12m ASL</span>
        <span>•</span>
        <span>Arabian Sea Coastline</span>
      </div>
    </div>
  );
}
