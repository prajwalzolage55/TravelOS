'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTripStore } from '@/lib/store/trip-store';
import {
  Globe,
  Plane,
  Hotel,
  MapPin,
  Clock,
  IndianRupee,
  AlertTriangle,
  Shield,
  Compass,
  Zap,
  ChevronRight,
  BarChart3,
  Users,
  Star,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Navigation,
  Car,
  UtensilsCrossed,
  Music,
  Waves,
  TreePine,
  Info,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  RefreshCcw,
  Layers,
  Map as MapIcon,
  Maximize2,
  Ticket,
  AlertCircle,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SatelliteMap, MapPoint } from '@/components/SatelliteMap';
import { NodeIcon } from '@/components/NodeIcon';

// ---------- Node icon mapping ----------
const nodeIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="w-4 h-4" />,
  hotel: <Hotel className="w-4 h-4" />,
  transfer: <Car className="w-4 h-4" />,
  activity: <Compass className="w-4 h-4" />,
  restaurant: <UtensilsCrossed className="w-4 h-4" />,
  event: <Music className="w-4 h-4" />,
};

const riskColors: Record<string, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
};

const riskBgColors: Record<string, string> = {
  low: 'status-green',
  medium: 'status-amber',
  high: 'status-red',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmed', color: 'status-green' },
  'at-risk': { label: 'At Risk', color: 'status-amber' },
  disrupted: { label: 'Disrupted', color: 'status-red' },
  cancelled: { label: 'Cancelled', color: 'status-red' },
  rebooked: { label: 'Rebooked', color: 'status-amber' },
};

export default function DashboardPage() {
  const {
    currentTrip,
    activeDisruption,
    impactedNodes,
    recoveryOptions,
    selectedRecovery,
    isDisruptionAnimating,
    slackWindows,
    discoverySuggestions,
    allExperiences,
    triggerDisruption,
    selectRecovery,
    applyRecovery,
    resetDisruption,
    detectSlackWindows,
    generateDiscoverySuggestions,
  } = useTripStore();

  const [showDisruptionPanel, setShowDisruptionPanel] = useState(false);
  const [showRecoveryPanel, setShowRecoveryPanel] = useState(false);
  const [showDiscoveryPanel, setShowDiscoveryPanel] = useState(false);
  const [animatingNodeId, setAnimatingNodeId] = useState<string | null>(null);
  const [selectedDisruptionIdx, setSelectedDisruptionIdx] = useState(0);

  // View switch state: 'timeline' | 'split' | 'map'
  const [viewMode, setViewMode] = useState<'timeline' | 'split' | 'map'>('split');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Convert currentTrip nodes to MapPoint[] for SatelliteMap
  const mapPoints: MapPoint[] = useMemo(() => {
    return currentTrip.nodes.map((node) => ({
      id: node.id,
      title: node.title,
      description: node.description,
      lat: node.location.lat,
      lng: node.location.lng,
      type: (node.type as any) || 'activity',
      cost: node.cost,
      provider: node.provider,
      status: node.status,
      riskLevel: node.riskLevel,
      icon: node.icon,
      image: (node as any).image,
      startTime: node.startTime,
      endTime: node.endTime,
      isImpacted: impactedNodes.some((n) => n.nodeId === node.id),
    }));
  }, [currentTrip.nodes, impactedNodes]);

  // Detect slack windows on mount
  useEffect(() => {
    detectSlackWindows();
    generateDiscoverySuggestions();
  }, [detectSlackWindows, generateDiscoverySuggestions]);

  // Animate impact propagation
  useEffect(() => {
    if (impactedNodes.length > 0 && isDisruptionAnimating) {
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < impactedNodes.length) {
          setAnimatingNodeId(impactedNodes[idx].nodeId);
          idx++;
        } else {
          clearInterval(interval);
          setAnimatingNodeId(null);
          setShowRecoveryPanel(true);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [impactedNodes, isDisruptionAnimating]);

  // After recovery is applied, show discovery
  useEffect(() => {
    if (!activeDisruption && discoverySuggestions.length > 0) {
      setShowDiscoveryPanel(true);
    }
  }, [activeDisruption, discoverySuggestions]);

  const disruptions = [
    {
      id: 'disruption-flight-delay',
      nodeId: 'flight-del-goi',
      type: 'delay' as const,
      title: 'Flight Delayed — 4 Hours',
      description: 'IndiGo 6E-2341 DEL→GOI delayed by 4 hours due to heavy fog.',
      severity: 'severe' as const,
      delayMinutes: 240,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'disruption-scuba-weather',
      nodeId: 'scuba-diving',
      type: 'weather' as const,
      title: 'Scuba Cancelled — Rough Seas',
      description: 'Grande Island scuba diving cancelled due to monsoon swell and high waves.',
      severity: 'moderate' as const,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'disruption-transfer-traffic',
      nodeId: 'transfer-airport-hotel',
      type: 'delay' as const,
      title: 'Transfer Roadblock — Zuari Bridge',
      description: 'Severe highway congestion adding 60 minutes to airport transfer.',
      severity: 'moderate' as const,
      delayMinutes: 60,
      timestamp: new Date().toISOString(),
    },
  ];

  const sortedNodes = [...currentTrip.nodes].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Group nodes by day
  const nodesByDay = sortedNodes.reduce((acc, node) => {
    const day = format(new Date(node.startTime), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(node);
    return acc;
  }, {} as Record<string, typeof sortedNodes>);

  const isNodeImpacted = (nodeId: string) =>
    impactedNodes.find((n) => n.nodeId === nodeId);

  const handlePointSelect = (point: MapPoint | null) => {
    setSelectedPointId(point ? point.id : null);
    if (point) {
      const element = document.getElementById(`node-card-${point.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] bg-grid">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-[var(--border)] rounded-none px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-[family-name:var(--font-display)] text-base tracking-tight">
              Travel<span className="gradient-text">OS</span>
            </span>
          </Link>
          <span className="text-[var(--text-tertiary)] text-sm">|</span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">Traveler Live Concierge</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/discover"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-pink-600 hover:bg-pink-500/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            Discover Goa
          </Link>
          <Link
            href="/operator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Operator Radar
          </Link>
          <Link
            href="/provider"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            Provider Portal
          </Link>
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-indigo-500/20">
            PZ
          </div>
        </div>
      </nav>

      <div className="container-custom py-6">
        {/* Trip Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                  Luxury Itinerary
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)]">
                  {currentTrip.name}
                </h1>
                {activeDisruption && (
                  <span className="status-red px-2.5 py-0.5 rounded-full text-xs font-semibold impact-wave inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> DISRUPTED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-[var(--text-secondary)] flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {currentTrip.destination}
                </span>
                <span className="flex items-center gap-1" suppressHydrationWarning>
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {format(new Date(currentTrip.startDate), 'MMM d')} —{' '}
                  {format(new Date(currentTrip.endDate), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                  {currentTrip.groupType} (2 Guests)
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Live Satellite Monitored
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Budget Display */}
              <div className="text-left sm:text-right px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">Total Investment</div>
                <div className="text-lg sm:text-xl font-bold flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {currentTrip.totalCost.toLocaleString()}
                  <span className="text-xs text-[var(--text-tertiary)] font-normal">
                    / ₹{currentTrip.budget.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)] shadow-xs overflow-x-auto max-w-full">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'timeline'
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                  }`}
                  title="Timeline View"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'split'
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                  }`}
                  title="Split View: Timeline + Satellite"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Split View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'map'
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                  }`}
                  title="Full Satellite Radar View"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                  Satellite Map
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!activeDisruption ? (
                  <button
                    onClick={() => setShowDisruptionPanel(!showDisruptionPanel)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Simulate Disruption
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      resetDisruption();
                      setShowRecoveryPanel(false);
                      setShowDiscoveryPanel(false);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm font-semibold hover:bg-[var(--surface-3)] transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disruption Trigger Panel */}
        <AnimatePresence>
          {showDisruptionPanel && !activeDisruption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-5 mb-6 border-red-500/30 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h3 className="font-semibold text-sm">Select Disruption Scenario</h3>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    (Watch Graph Healing & Satellite Ripple Tracking)
                  </span>
                </div>
                <button
                  onClick={() => setShowDisruptionPanel(false)}
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
                >
                  ✕ Close
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {disruptions.map((d, i) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDisruptionIdx(i);
                      triggerDisruption(d);
                      setShowDisruptionPanel(false);
                    }}
                    className="p-3.5 rounded-xl border border-[var(--border)] hover:border-red-500/50 bg-[var(--surface)] hover:bg-red-500/5 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold group-hover:text-red-500 transition-colors">
                        {d.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 font-bold">
                        {d.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] line-clamp-2">
                      {d.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Disruption Banner */}
        <AnimatePresence>
          {activeDisruption && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-4 mb-6 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-500/30 glow-danger"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white flex-shrink-0 impact-wave">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-red-600 dark:text-red-400">
                      Disruption Detected: {activeDisruption.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {activeDisruption.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRecoveryPanel(true)}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                  >
                    View {recoveryOptions.length} Recovery Plans
                  </button>
                  <button
                    onClick={() => {
                      resetDisruption();
                      setShowRecoveryPanel(false);
                      setShowDiscoveryPanel(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Impact summary pills */}
              <div className="mt-3 pt-3 border-t border-red-500/20 flex flex-wrap items-center gap-3 text-xs text-red-600 dark:text-red-400 font-medium">
                <span>🔴 Graph Impact: {impactedNodes.length} bookings affected</span>
                <span>•</span>
                <span>
                  Estimated Impact: ₹
                  {Math.abs(impactedNodes.reduce((s, n) => s + n.costImpact, 0)).toLocaleString()}
                </span>
                <span>•</span>
                <span>Autonomous Re-Routing Available</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FULL MAP VIEW */}
        {viewMode === 'map' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 mb-8"
          >
            <div className="glass-card p-3 rounded-2xl overflow-hidden shadow-xl border-indigo-500/20">
              <SatelliteMap
                points={mapPoints}
                selectedPointId={selectedPointId}
                onPointSelect={handlePointSelect}
                height="620px"
                title="Goa Luxury Travel Network — High-Resolution Satellite & Aerial Radar"
              />
            </div>

            {/* Quick Horizontal Node Scroller */}
            <div className="glass-card p-4">
              <div className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                Click itinerary stop to focus on satellite radar
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {sortedNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedPointId(node.id)}
                    className={`flex-shrink-0 flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      selectedPointId === node.id
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/30'
                    }`}
                  >
                    <span className="text-lg">{node.icon}</span>
                    <div>
                      <div className="text-xs font-semibold line-clamp-1">{node.title}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">{node.location.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SPLIT VIEW (TIMELINE + SATELLITE MAP) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
            {/* Left Column: Timeline */}
            <div className="lg:col-span-7 space-y-6">
              {renderTimeline(nodesByDay, isNodeImpacted, animatingNodeId, selectedPointId, setSelectedPointId)}
            </div>

            {/* Right Column: Sticky Satellite Map */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
              <div className="glass-card p-3 rounded-2xl overflow-hidden shadow-lg border-indigo-500/20">
                <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Navigation className="w-3.5 h-3.5" />
                    Live Real World Satellite Radar
                  </span>
                  <button
                    onClick={() => setViewMode('map')}
                    className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--foreground)] flex items-center gap-1 font-medium"
                  >
                    <Maximize2 className="w-3 h-3" />
                    Expand
                  </button>
                </div>
                <SatelliteMap
                  points={mapPoints}
                  selectedPointId={selectedPointId}
                  onPointSelect={handlePointSelect}
                  height="520px"
                />
              </div>

              {/* Recovery Options Drawer in Split View */}
              {renderRecoveryDrawer(showRecoveryPanel, recoveryOptions, selectedRecovery, selectRecovery, applyRecovery, setShowRecoveryPanel)}

              {/* Dependency Graph Widget */}
              {renderGraphWidget(sortedNodes, isNodeImpacted, currentTrip)}
            </div>
          </div>
        )}

        {/* TIMELINE ONLY VIEW */}
        {viewMode === 'timeline' && (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Main Itinerary Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {renderTimeline(nodesByDay, isNodeImpacted, animatingNodeId, selectedPointId, setSelectedPointId)}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Mini Satellite Map Preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-3 rounded-2xl overflow-hidden border-indigo-500/20 shadow-sm"
              >
                <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Navigation className="w-3.5 h-3.5" />
                    Satellite Radar
                  </div>
                  <button
                    onClick={() => setViewMode('split')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    Open Map <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <SatelliteMap
                  points={mapPoints}
                  selectedPointId={selectedPointId}
                  onPointSelect={handlePointSelect}
                  height="260px"
                  showControls={false}
                />
              </motion.div>

              {/* Recovery Options Panel */}
              {renderRecoveryDrawer(showRecoveryPanel, recoveryOptions, selectedRecovery, selectRecovery, applyRecovery, setShowRecoveryPanel)}

              {/* Dependency Graph Widget */}
              {renderGraphWidget(sortedNodes, isNodeImpacted, currentTrip)}

              {/* Risk Weather Radar */}
              {renderRiskRadar(sortedNodes, currentTrip)}

              {/* Quick Trip Summary */}
              {renderTripSummary(currentTrip, slackWindows)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ---------- SUB-RENDER FUNCTIONS ----------

  function renderTimeline(
    days: Record<string, typeof sortedNodes>,
    isImpacted: (id: string) => any,
    animatingId: string | null,
    selectedId: string | null,
    onSelectId: (id: string) => void
  ) {
    return (
      <div className="space-y-6">
        {Object.entries(days).map(([day, nodes], dayIdx) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIdx * 0.08 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs tracking-wider uppercase">
                Day {dayIdx + 1}
              </div>
              <div className="text-xs font-semibold text-[var(--text-secondary)]" suppressHydrationWarning>
                {format(new Date(day), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <div className="space-y-3.5 relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-[var(--border)] to-transparent" />

              {nodes.map((node) => {
                const impact = isImpacted(node.id);
                const isAnimating = animatingId === node.id;
                const isSelected = selectedId === node.id;

                return (
                  <motion.div
                    id={`node-card-${node.id}`}
                    key={node.id}
                    animate={
                      isAnimating
                        ? {
                            x: [0, -5, 5, -5, 5, 0],
                            transition: { duration: 0.5 },
                          }
                        : {}
                    }
                    className={`relative glass-card p-4 ml-12 transition-all duration-300 rounded-2xl ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                        : ''
                    } ${
                      node.status === 'cancelled'
                        ? 'opacity-60 border-red-500/30'
                        : node.status === 'rebooked'
                        ? 'border-amber-500/30'
                        : impact
                        ? impact.impactType === 'needs-rebooking'
                          ? 'border-red-500/50 glow-danger'
                          : impact.impactType === 'at-risk'
                          ? 'border-amber-500/50'
                          : 'border-amber-500/25'
                        : 'hover:border-indigo-500/30'
                    }`}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[2.15rem] top-6 w-3.5 h-3.5 rounded-full border-2 border-[var(--background)] z-10 shadow-xs ${
                        node.status === 'cancelled'
                          ? 'bg-red-500'
                          : node.status === 'rebooked'
                          ? 'bg-amber-500'
                          : impact
                          ? 'bg-red-500 impact-wave'
                          : riskColors[node.riskLevel]
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* High-res Image Thumbnail */}
                      {(node as any).image && (
                        <div className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)] shadow-xs group/img">
                          <img
                            src={(node as any).image}
                            alt={node.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs uppercase tracking-wider">
                            {node.type}
                          </span>
                          <span className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white">
                            <NodeIcon typeOrIcon={(node as any).icon || node.type} className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      )}

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4
                                className={`font-bold text-base ${
                                  node.status === 'cancelled' ? 'line-through text-red-500' : ''
                                }`}
                              >
                                {node.title}
                              </h4>

                              {/* Status Badge */}
                              {node.status !== 'confirmed' && (
                                <span
                                  className={`${statusLabels[node.status]?.color} px-2 py-0.5 rounded-full text-xs font-semibold`}
                                >
                                  {statusLabels[node.status]?.label}
                                </span>
                              )}

                              {/* Risk Badge */}
                              {node.riskLevel !== 'low' && node.status === 'confirmed' && (
                                <span
                                  className={`${riskBgColors[node.riskLevel]} px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1`}
                                >
                                  {node.riskLevel === 'medium' ? (
                                    <>
                                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                                      <span>At Risk</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-3 h-3 text-red-500" />
                                      <span>High Risk</span>
                                    </>
                                  )}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              {node.description}
                            </p>
                          </div>

                          {/* Cost */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-base font-bold flex items-center justify-end gap-0.5 text-[var(--foreground)]">
                              <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              {node.cost.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-[var(--text-tertiary)] font-medium">
                              {node.provider}
                            </div>
                          </div>
                        </div>

                        {/* Luxury Airline Boarding Pass Details */}
                        {node.type === 'flight' && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                            <div className="flex items-center justify-between font-mono font-semibold text-slate-800 dark:text-slate-200">
                              <span className="flex items-center gap-1.5">
                                <Plane className="w-3.5 h-3.5 text-blue-500" /> DEL → GOI (IndiGo 6E-2341)
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                PNR: TK8829
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-1.5 text-[11px] text-[var(--text-secondary)]">
                              <div><span className="text-[var(--text-tertiary)]">Terminal:</span> T3 Gate 14</div>
                              <div><span className="text-[var(--text-tertiary)]">Seat:</span> 4A (Priority)</div>
                              <div><span className="text-[var(--text-tertiary)]">Baggage:</span> 25kg Incl.</div>
                            </div>
                          </div>
                        )}

                        {/* Luxury Resort Villa Details */}
                        {node.type === 'hotel' && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                            <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                              <span className="flex items-center gap-1.5">
                                <Hotel className="w-3.5 h-3.5 text-emerald-600" /> 5-Star Luxury Sea View Villa
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                                Booking #TH-88219
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] text-[var(--text-secondary)]">
                              <div><span className="text-[var(--text-tertiary)]">Check-in:</span> 14:00 • Private Butler</div>
                              <div><span className="text-[var(--text-tertiary)]">Perk:</span> Benaulim Beachfront Breakfast</div>
                            </div>
                          </div>
                        )}

                        {/* Time & GPS Meta Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-medium" suppressHydrationWarning>
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              {format(new Date(node.startTime), 'h:mm a')} —{' '}
                              {format(new Date(node.endTime), 'h:mm a')}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-red-500" />
                              {node.location.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                              {node.location.lat.toFixed(4)}°N, {node.location.lng.toFixed(4)}°E
                            </span>
                            <button
                              onClick={() => onSelectId(node.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--surface-2)] hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-[var(--border)] transition-colors"
                            >
                              <Navigation className="w-3 h-3" />
                              Satellite
                            </button>
                          </div>
                        </div>

                        {/* Disruption Impact Alert Box */}
                        {impact && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                          >
                            <p className="text-xs text-red-700 dark:text-red-300 font-semibold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                              <span>{impact.explanation}</span>
                            </p>
                            {impact.delayMinutes > 0 && impact.delayMinutes < 9999 && (
                              <span className="inline-block mt-1 text-xs text-red-600 dark:text-red-400 font-bold">
                                Cascade Delay: +{impact.delayMinutes} min
                              </span>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Slack Window Auto-Suggestions */}
              {discoverySuggestions
                .filter((s) => {
                  const afterNode = nodes.find((n) => n.id === s.slackWindow.afterNodeId);
                  return afterNode !== undefined;
                })
                .map((suggestion, sIdx) => (
                  <motion.div
                    key={`slack-${sIdx}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative ml-12 p-4 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-500/5 shadow-xs"
                  >
                    <div className="absolute -left-[2.15rem] top-6 w-3.5 h-3.5 rounded-full border-2 border-[var(--background)] bg-emerald-500 z-10" />

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {suggestion.isDisruptionTriggered ? 'Adaptive Re-Discovery' : 'Slack-Time Opportunity'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        {Math.round(suggestion.slackWindow.durationMinutes / 60)}h Free Window
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mb-3 font-medium">
                      {suggestion.reason}
                    </p>

                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {suggestion.experiences.slice(0, 3).map((exp) => (
                        <div
                          key={exp.id}
                          className="flex-shrink-0 w-64 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/40 transition-all cursor-pointer group shadow-xs"
                        >
                          {exp.images && exp.images.length > 0 && (
                            <div className="w-full h-24 rounded-lg overflow-hidden mb-2 relative">
                              <img
                                src={exp.images[0]}
                                alt={exp.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop';
                                }}
                              />
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] bg-black/70 text-white font-bold">
                                ₹{exp.cost}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mb-1">
                            <h5 className="text-xs font-bold line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {exp.title}
                            </h5>
                          </div>
                          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exp.durationMinutes} min
                            </span>
                            <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {exp.rating}
                            </span>
                          </div>
                          {exp.isHidden && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                              <Sparkles className="w-2.5 h-2.5 text-blue-500" /> Hidden Gem
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  function renderRecoveryDrawer(
    show: boolean,
    options: typeof recoveryOptions,
    selected: typeof selectedRecovery,
    onSelect: (opt: any) => void,
    onApply: () => void,
    setShow: (b: boolean) => void
  ) {
    return (
      <AnimatePresence>
        {show && options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-5 border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Shield className="w-4 h-4 text-blue-600" />
                Autonomous Self-Healing Plans
              </h3>
              <button
                onClick={() => setShow(false)}
                className="text-xs p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelect(option)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selected?.id === option.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-[var(--border)] hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {option.recommended && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                          RECOMMENDED
                        </span>
                      )}
                      <span className="text-sm font-bold">{option.title}</span>
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)] font-bold">
                      #{option.rank}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-2">
                    {option.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span
                      className={
                        option.totalCostDelta > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }
                    >
                      {option.totalCostDelta > 0 ? '+' : ''}₹
                      {Math.abs(option.totalCostDelta).toLocaleString()}
                    </span>
                    {option.refundAmount > 0 && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        ↩ ₹{option.refundAmount.toLocaleString()} refund
                      </span>
                    )}
                    <span className="text-[var(--text-tertiary)] font-normal">
                      {option.confidenceScore}% confidence
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {selected && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  onApply();
                  setShow(false);
                }}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
              >
                Apply &quot;{selected.title}&quot; Recovery
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  function renderGraphWidget(
    nodes: typeof sortedNodes,
    isImpacted: (id: string) => any,
    trip: typeof currentTrip
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 shadow-sm"
      >
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-500" />
          Live Dependency Graph
        </h3>
        <div className="space-y-2">
          {nodes.slice(0, 8).map((node) => {
            const impact = isImpacted(node.id);
            return (
              <div key={node.id} className="flex items-center gap-2 text-xs">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${
                    node.status === 'cancelled'
                      ? 'bg-red-100 text-red-600'
                      : impact
                      ? 'bg-red-100 text-red-600 impact-wave'
                      : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                  }`}
                >
                  {node.icon}
                </div>
                <div className="flex-1 truncate font-medium">{node.title}</div>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    node.status === 'cancelled'
                      ? 'bg-red-500'
                      : impact
                      ? 'bg-red-500'
                      : riskColors[node.riskLevel]
                  }`}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
          <span>{trip.nodes.length} nodes connected</span>
          <span>{trip.edges.length} graph dependencies</span>
        </div>
      </motion.div>
    );
  }

  function renderRiskRadar(nodes: typeof sortedNodes, trip: typeof currentTrip) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 shadow-sm"
      >
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Predictive Risk Radar
        </h3>
        <div className="space-y-2.5">
          {nodes
            .filter((n) => n.status !== 'cancelled')
            .slice(0, 6)
            .map((node) => (
              <div key={node.id} className="flex items-center gap-3">
                <span className="text-sm">{node.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate font-medium">{node.title}</div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--surface-2)] mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        node.riskScore > 70
                          ? 'bg-red-500'
                          : node.riskScore > 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${node.riskScore}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-[var(--text-tertiary)] w-8 text-right">
                  {node.riskScore}
                </span>
              </div>
            ))}
        </div>
      </motion.div>
    );
  }

  function renderTripSummary(trip: typeof currentTrip, slacks: typeof slackWindows) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 shadow-sm"
      >
        <h3 className="text-sm font-bold mb-3">Live Telemetry Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[var(--surface-2)]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Active Stops</div>
            <div className="text-lg font-bold">{trip.nodes.filter((n) => n.status !== 'cancelled').length}</div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-2)]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Slack Gaps</div>
            <div className="text-lg font-bold text-indigo-500">{slacks.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-2)]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Budget Left</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ₹{(trip.budget - trip.totalCost).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-2)]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Risk Index</div>
            <div className="text-lg font-bold text-amber-500">
              {Math.round(
                trip.nodes.reduce((s, n) => s + n.riskScore, 0) / trip.nodes.length
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
}
