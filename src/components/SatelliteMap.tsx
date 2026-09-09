'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

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

export interface SatelliteMapProps {
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

// Dynamically load real-world Leaflet map without SSR to prevent window errors
const DynamicRealWorldMap = dynamic(() => import('@/components/RealWorldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-white/70 gap-3 border border-white/10">
      <div className="relative">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">🛰️</span>
      </div>
      <div className="text-center">
        <div className="text-xs font-bold text-white tracking-wide">Acquiring Real World Satellite Tiles...</div>
        <div className="text-[10px] text-white/40 font-mono mt-0.5">Google Satellite & Aerial Telemetry</div>
      </div>
    </div>
  ),
});

export function SatelliteMap(props: SatelliteMapProps) {
  return <DynamicRealWorldMap {...props} />;
}
