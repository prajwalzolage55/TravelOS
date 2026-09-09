'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTripStore } from '@/lib/store/trip-store';
import {
  Globe,
  BarChart3,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Shield,
  Eye,
  ChevronRight,
  ArrowLeft,
  Plane,
  Hotel,
  IndianRupee,
  Zap,
  RefreshCcw,
  Search,
  Filter,
  Bell,
  Settings,
  Navigation,
  Layers,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SatelliteMap, MapPoint } from '@/components/SatelliteMap';

const statusConfig = {
  'on-track': {
    label: 'On Track',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  'at-risk': {
    label: 'At Risk',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-700 dark:text-amber-400',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  disrupted: {
    label: 'Disrupted',
    color: 'bg-red-500',
    bgColor: 'bg-red-50 dark:bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-700 dark:text-red-400',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
};

// Defined real GPS coordinates for distinct tours across Goa
const tourLocations: Record<string, { name: string; lat: number; lng: number }> = {
  'tour-goa-001': { name: 'Taj Exotica Beach Resort, Benaulim', lat: 15.2635, lng: 73.9312 },
  'tour-goa-002': { name: 'Calangute Ocean Deck, North Goa', lat: 15.5434, lng: 73.7611 },
  'tour-goa-003': { name: 'Grande Island Ocean Base, Vasco', lat: 15.3385, lng: 73.8603 },
  'tour-goa-004': { name: 'Mandovi River Promenade, Panjim', lat: 15.4989, lng: 73.8278 },
};

export default function OperatorPage() {
  const { operatorTours, currentTrip, activeDisruption, recoveryOptions, applyRecovery } = useTripStore();
  const [selectedTourId, setSelectedTourId] = useState<string | null>('tour-goa-001');
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'grid'>('split');

  // Build operator tours list including current trip status
  const allTours = operatorTours.map((tour) => {
    if (tour.tripId === currentTrip.id) {
      return {
        ...tour,
        trip: currentTrip,
        overallStatus: activeDisruption
          ? ('disrupted' as const)
          : tour.overallStatus,
        activeDisruptions: activeDisruption ? [activeDisruption] : tour.activeDisruptions,
        pendingRecoveries: recoveryOptions.length > 0 ? recoveryOptions : tour.pendingRecoveries,
      };
    }
    return tour;
  });

  const filteredTours =
    filter === 'all'
      ? allTours
      : allTours.filter((t) => t.overallStatus === filter);

  const stats = {
    total: allTours.length,
    onTrack: allTours.filter((t) => t.overallStatus === 'on-track').length,
    atRisk: allTours.filter((t) => t.overallStatus === 'at-risk').length,
    disrupted: allTours.filter((t) => t.overallStatus === 'disrupted').length,
  };

  const selectedTour = allTours.find((t) => t.id === selectedTourId) || allTours[0];

  // Map points for all active tours
  const tourMapPoints: MapPoint[] = useMemo(() => {
    return allTours.map((tour) => {
      const loc = tourLocations[tour.id] || { name: tour.trip.destination, lat: 15.4989, lng: 73.8278 };
      return {
        id: tour.id,
        title: `${tour.trip.name}`,
        description: `Lead: ${tour.trip.travelerName} • ${loc.name} • ₹${tour.trip.totalCost.toLocaleString()}`,
        lat: loc.lat,
        lng: loc.lng,
        type: 'activity' as const,
        cost: tour.trip.totalCost,
        provider: tour.trip.travelerName,
        status: tour.overallStatus === 'disrupted' ? 'disrupted' : 'confirmed',
        riskLevel: tour.overallStatus === 'disrupted' ? 'high' : tour.overallStatus === 'at-risk' ? 'medium' : 'low',
        icon: tour.overallStatus === 'disrupted' ? '🚨' : tour.overallStatus === 'at-risk' ? '⚠️' : '📍',
        isImpacted: tour.overallStatus === 'disrupted',
      };
    });
  }, [allTours]);

  const handlePointSelect = (point: MapPoint | null) => {
    if (point) {
      setSelectedTourId(point.id);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] bg-grid">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-[var(--border)] rounded-none px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-[family-name:var(--font-display)] tracking-tight">
              Travel<span className="gradient-text">OS</span>
            </span>
          </Link>
          <span className="text-[var(--text-tertiary)] text-sm hidden sm:inline">|</span>
          <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1.5 truncate">
            <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            <span className="hidden sm:inline">Operator Mission Command Center</span>
            <span className="sm:hidden">Command Center</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Traveler Live Concierge</span>
            <span className="sm:hidden">Traveler</span>
          </Link>
          <ThemeToggle />
          <button className="relative w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
            <Bell className="w-4 h-4" />
            {stats.disrupted > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {stats.disrupted}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="container-custom py-5 sm:py-6">
        {/* Header with Responsive View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
              Fleet Operations & Live Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Live multi-tour monitoring, autonomous disruption healing, and real-world satellite telemetry.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)] shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                viewMode === 'split'
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Split Mission View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                viewMode === 'map'
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-500" />
              Full Satellite Radar
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                viewMode === 'grid'
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Grid Only
            </button>
          </div>
        </div>

        {/* Stats Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6"
        >
          <button
            onClick={() => setFilter('all')}
            className={`glass-card p-3.5 sm:p-4 hover:border-indigo-500/30 transition-all cursor-pointer text-left ${
              filter === 'all' ? 'border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/30' : ''
            }`}
          >
            <div className="text-[10px] sm:text-xs text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-semibold">
              Total Active Tours
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono">{stats.total}</div>
          </button>
          <button
            onClick={() => setFilter('on-track')}
            className={`glass-card p-3.5 sm:p-4 hover:border-emerald-500/30 transition-all cursor-pointer text-left ${
              filter === 'on-track' ? 'border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30' : ''
            }`}
          >
            <div className="text-[10px] sm:text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              On Track
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats.onTrack}
            </div>
          </button>
          <button
            onClick={() => setFilter('at-risk')}
            className={`glass-card p-3.5 sm:p-4 hover:border-amber-500/30 transition-all cursor-pointer text-left ${
              filter === 'at-risk' ? 'border-amber-500/50 shadow-sm ring-1 ring-amber-500/30' : ''
            }`}
          >
            <div className="text-[10px] sm:text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              At Risk
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {stats.atRisk}
            </div>
          </button>
          <button
            onClick={() => setFilter('disrupted')}
            className={`glass-card p-3.5 sm:p-4 hover:border-red-500/30 transition-all cursor-pointer text-left ${
              filter === 'disrupted' ? 'border-red-500/50 shadow-sm ring-1 ring-red-500/30' : ''
            }`}
          >
            <div className="text-[10px] sm:text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Disrupted
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-red-600 dark:text-red-400">
              {stats.disrupted}
            </div>
          </button>
        </motion.div>

        {/* 1. FULL SATELLITE FLEET RADAR VIEW (100% Width) */}
        {viewMode === 'map' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 mb-8"
          >
            <div className="glass-card p-3 rounded-2xl overflow-hidden shadow-2xl border-indigo-500/30">
              <SatelliteMap
                points={tourMapPoints}
                selectedPointId={selectedTourId}
                onPointSelect={handlePointSelect}
                height="680px"
                title="Goa Tour Operator Fleet Radar — Real Google Satellite & Aerial Navigation"
              />
            </div>

            {/* Quick Tour Selection Scroller */}
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2.5">
                Active Tours on Map (Click to Inspect Telemetry)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredTours.map((tour) => {
                  const status = statusConfig[tour.overallStatus];
                  const isSelected = selectedTourId === tour.id;
                  return (
                    <button
                      key={tour.id}
                      onClick={() => setSelectedTourId(tour.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold truncate">{tour.trip.name}</span>
                        <span className={`w-2 h-2 rounded-full ${status.color}`} />
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{tour.trip.travelerName}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. SPLIT MISSION VIEW: 2-Column Responsive Layout */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
            {/* Left Column: Tour Queue & Selected Telemetry (col-span-5) */}
            <div className="lg:col-span-5 space-y-5 order-2 lg:order-1">
              {/* Operations Queue List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Live Operations Queue ({filteredTours.length})
                  </h2>
                </div>

                <div className="space-y-3">
                  {filteredTours.map((tour, i) => {
                    const status = statusConfig[tour.overallStatus];
                    const isSelected = selectedTourId === tour.id;
                    const loc = tourLocations[tour.id] || { name: 'Goa', lat: 15.5, lng: 73.8 };

                    return (
                      <motion.button
                        key={tour.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedTourId(tour.id)}
                        className={`w-full glass-card p-4 text-left transition-all rounded-2xl cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md'
                            : 'hover:border-indigo-500/30 shadow-xs'
                        }`}
                      >
                        {/* Status indicator */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${status.bgColor} ${status.textColor}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                          <span className="text-[11px] text-[var(--text-tertiary)] font-mono" suppressHydrationWarning>
                            {format(new Date(tour.lastUpdated), 'h:mm a')}
                          </span>
                        </div>

                        {/* Tour info */}
                        <h3 className="font-bold text-sm mb-1">{tour.trip.name}</h3>
                        <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-purple-500" />
                            <span className="font-medium">{tour.trip.travelerName}</span>
                            <span className="text-[var(--text-tertiary)]">({tour.trip.groupType})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span>{loc.name}</span>
                          </div>
                        </div>

                        {/* Mini graph status bar */}
                        <div className="flex gap-1 mt-3">
                          {tour.trip.nodes.slice(0, 8).map((node) => (
                            <div
                              key={node.id}
                              className={`flex-1 h-1.5 rounded-full ${
                                node.status === 'cancelled'
                                  ? 'bg-red-500'
                                  : node.status === 'rebooked'
                                  ? 'bg-amber-500'
                                  : node.riskLevel === 'high'
                                  ? 'bg-red-500'
                                  : node.riskLevel === 'medium'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              title={node.title}
                            />
                          ))}
                        </div>

                        {/* Disruption alert */}
                        {tour.activeDisruptions.length > 0 && (
                          <div className="mt-2.5 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                            <span>⚠️</span>
                            <span className="truncate">{tour.activeDisruptions[0].title}</span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Tour Telemetry Card */}
              {selectedTour && (
                <div className="glass-card p-5 rounded-2xl shadow-lg border-indigo-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Tour Telemetry & Recovery
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      ID: {selectedTour.id}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-base">{selectedTour.trip.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Lead: {selectedTour.trip.travelerName} • {selectedTour.trip.groupType}
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-xl ${
                        statusConfig[selectedTour.overallStatus].bgColor
                      } ${statusConfig[selectedTour.overallStatus].borderColor} border flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        {statusConfig[selectedTour.overallStatus].icon}
                        <span
                          className={`text-xs font-bold ${
                            statusConfig[selectedTour.overallStatus].textColor
                          }`}
                        >
                          {statusConfig[selectedTour.overallStatus].label.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                        Graph Telemetry OK
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--surface-2)] flex items-center justify-between">
                      <span className="text-xs text-[var(--text-tertiary)] font-medium">Trip Total Investment</span>
                      <span className="font-bold text-sm flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {selectedTour.trip.totalCost.toLocaleString()}
                      </span>
                    </div>

                    {/* Pending Recovery Plans */}
                    {selectedTour.pendingRecoveries && selectedTour.pendingRecoveries.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          Autonomous Recovery Resolution
                        </div>
                        {selectedTour.pendingRecoveries.slice(0, 2).map((option) => (
                          <div
                            key={option.id}
                            className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 mb-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold">{option.title}</span>
                              {option.recommended && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                                  REC
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] mb-2">
                              {option.description}
                            </p>
                            <button
                              onClick={() => applyRecovery()}
                              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
                            >
                              Approve Resolution
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                      <Link
                        href="/dashboard"
                        className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] text-center text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors"
                      >
                        View Traveler Graph
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Expansive Real World Satellite Map (col-span-7) */}
            <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-20 order-1 lg:order-2">
              <div className="glass-card p-3 rounded-2xl overflow-hidden shadow-2xl border-indigo-500/30">
                <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5" />
                    Live Fleet Satellite Telemetry Radar
                  </span>
                  <button
                    onClick={() => setViewMode('map')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" /> Full Screen Map
                  </button>
                </div>
                <SatelliteMap
                  points={tourMapPoints}
                  selectedPointId={selectedTourId}
                  onPointSelect={handlePointSelect}
                  height="580px"
                  title="Goa Tour Fleet Real World Satellite Radar"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. GRID ONLY VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filteredTours.map((tour, i) => {
              const status = statusConfig[tour.overallStatus];
              const loc = tourLocations[tour.id] || { name: 'Goa', lat: 15.5, lng: 73.8 };
              return (
                <div key={tour.id} className="glass-card p-5 rounded-2xl shadow-sm border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${status.bgColor} ${status.textColor}`}>
                      {status.icon}
                      {status.label}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-tertiary)]" suppressHydrationWarning>
                      {format(new Date(tour.lastUpdated), 'h:mm a')}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mb-1">{tour.trip.name}</h3>
                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4">
                    <div>Lead: <span className="font-semibold text-[var(--foreground)]">{tour.trip.travelerName}</span> ({tour.trip.groupType})</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {loc.name}
                    </div>
                    <div>Value: <span className="font-bold text-emerald-600">₹{tour.trip.totalCost.toLocaleString()}</span></div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTourId(tour.id);
                      setViewMode('split');
                    }}
                    className="w-full py-2 rounded-xl bg-[var(--surface-2)] hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-[var(--border)] transition-colors flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open on Satellite Radar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
