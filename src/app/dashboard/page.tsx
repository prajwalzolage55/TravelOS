'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { ThemeToggle } from '@/components/ThemeToggle';

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
      description: 'IndiGo 6E-2341 DEL→GOI delayed by 4 hours due to fog.',
      severity: 'severe' as const,
      delayMinutes: 240,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'disruption-scuba-weather',
      nodeId: 'scuba-diving',
      type: 'weather' as const,
      title: 'Scuba Cancelled — Rough Seas',
      description: 'Scuba diving cancelled due to high waves.',
      severity: 'moderate' as const,
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

  return (
    <div className="min-h-screen bg-[var(--background)] bg-grid">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-[var(--border)] rounded-none px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-[family-name:var(--font-display)]">
              Travel<span className="gradient-text">OS</span>
            </span>
          </Link>
          <span className="text-[var(--text-tertiary)] text-sm">|</span>
          <span className="text-sm text-[var(--text-secondary)]">Traveler Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operator"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Operator View
          </Link>
          <Link
            href="/provider"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            Provider Portal
          </Link>
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            PZ
          </div>
        </div>
      </nav>

      <div className="container-custom py-6">
        {/* Trip Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
                  {currentTrip.name}
                </h1>
                {activeDisruption && (
                  <span className="status-red px-2.5 py-0.5 rounded-full text-xs font-medium impact-wave">
                    ⚠️ DISRUPTED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {currentTrip.destination}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(currentTrip.startDate), 'MMM d')} —{' '}
                  {format(new Date(currentTrip.endDate), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {currentTrip.groupType}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Budget */}
              <div className="text-right">
                <div className="text-xs text-[var(--text-tertiary)]">Total Cost</div>
                <div className="text-xl font-bold flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {currentTrip.totalCost.toLocaleString()}
                  <span className="text-xs text-[var(--text-tertiary)] font-normal">
                    / ₹{currentTrip.budget.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!activeDisruption ? (
                  <button
                    onClick={() => setShowDisruptionPanel(!showDisruptionPanel)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="w-4 h-4" />
                    Trigger Disruption
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      resetDisruption();
                      setShowRecoveryPanel(false);
                      setShowDiscoveryPanel(false);
                      setShowDisruptionPanel(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:bg-[var(--surface-2)] transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Trip
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disruption Selection Panel */}
        <AnimatePresence>
          {showDisruptionPanel && !activeDisruption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="glass-card p-6 border-red-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Simulate a Disruption
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {disruptions.map((d, i) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDisruptionIdx(i);
                        triggerDisruption(d);
                        setShowDisruptionPanel(false);
                      }}
                      className="p-4 rounded-xl border border-[var(--border)] hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                          {d.type === 'delay' ? <Clock className="w-4 h-4" /> : <Waves className="w-4 h-4" />}
                        </span>
                        <div>
                          <div className="font-medium text-sm">{d.title}</div>
                          <div className="text-xs text-[var(--text-tertiary)]">{d.severity}</div>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{d.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Disruption Alert */}
        <AnimatePresence>
          {activeDisruption && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-5 rounded-2xl border border-red-500/30 bg-red-50/80 dark:bg-red-500/5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1">{activeDisruption.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{activeDisruption.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
                    <span>{impactedNodes.length} bookings affected</span>
                    <span>•</span>
                    <span>
                      Impact cost: ₹
                      {Math.abs(impactedNodes.reduce((s, n) => s + n.costImpact, 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Itinerary Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(nodesByDay).map(([day, nodes], dayIdx) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIdx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-sm font-semibold text-[var(--primary)]">
                    Day {dayIdx + 1}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {format(new Date(day), 'EEEE, MMM d')}
                  </div>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>

                <div className="space-y-3 relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--border)]" />

                  {nodes.map((node, nodeIdx) => {
                    const impact = isNodeImpacted(node.id);
                    const isAnimating = animatingNodeId === node.id;

                    return (
                      <motion.div
                        key={node.id}
                        animate={
                          isAnimating
                            ? {
                                x: [0, -5, 5, -5, 5, 0],
                                transition: { duration: 0.5 },
                              }
                            : {}
                        }
                        className={`relative glass-card p-4 ml-12 transition-all duration-300 ${
                          node.status === 'cancelled'
                            ? 'opacity-50 border-red-500/30'
                            : node.status === 'rebooked'
                            ? 'border-amber-500/30'
                            : impact
                            ? impact.impactType === 'needs-rebooking'
                              ? 'border-red-500/40 glow-danger'
                              : impact.impactType === 'at-risk'
                              ? 'border-amber-500/40'
                              : 'border-amber-500/20'
                            : 'hover:border-[var(--primary)]/30'
                        }`}
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-[2.15rem] top-5 w-3 h-3 rounded-full border-2 border-[var(--background)] z-10 ${
                            node.status === 'cancelled'
                              ? 'bg-red-500'
                              : node.status === 'rebooked'
                              ? 'bg-amber-500'
                              : impact
                              ? 'bg-red-500 impact-wave'
                              : riskColors[node.riskLevel]
                          }`}
                        />

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                impact
                                  ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                  : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                              }`}
                            >
                              <span className="text-lg">{node.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={`font-medium text-sm ${
                                    node.status === 'cancelled' ? 'line-through' : ''
                                  }`}
                                >
                                  {node.title}
                                </h4>
                                {/* Status badge */}
                                {node.status !== 'confirmed' && (
                                  <span
                                    className={`${statusLabels[node.status]?.color} px-2 py-0.5 rounded-full text-xs font-medium`}
                                  >
                                    {statusLabels[node.status]?.label}
                                  </span>
                                )}
                                {/* Risk badge */}
                                {node.riskLevel !== 'low' && node.status === 'confirmed' && (
                                  <span className={`${riskBgColors[node.riskLevel]} px-2 py-0.5 rounded-full text-xs font-medium`}>
                                    {node.riskLevel === 'medium' ? '⚡ At Risk' : '🔴 High Risk'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-1">
                                {node.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(node.startTime), 'h:mm a')} —{' '}
                                  {format(new Date(node.endTime), 'h:mm a')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {node.location.name}
                                </span>
                              </div>
                              {/* Impact explanation */}
                              {impact && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                                >
                                  <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                                    {impact.explanation}
                                  </p>
                                  {impact.delayMinutes > 0 && impact.delayMinutes < 9999 && (
                                    <span className="inline-block mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">
                                      ⏱ +{impact.delayMinutes} min delay
                                    </span>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Cost */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-semibold flex items-center gap-0.5">
                              <IndianRupee className="w-3 h-3" />
                              {node.cost.toLocaleString()}
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)]">
                              {node.provider}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Slack Window Suggestions */}
                  {discoverySuggestions
                    .filter((s) => {
                      const afterNode = nodes.find((n) => n.id === s.slackWindow.afterNodeId);
                      return afterNode !== undefined;
                    })
                    .map((suggestion, sIdx) => (
                      <motion.div
                        key={`slack-${sIdx}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative ml-12 p-4 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-500/5"
                      >
                        <div className="absolute -left-[2.15rem] top-5 w-3 h-3 rounded-full border-2 border-[var(--background)] bg-emerald-500 z-10" />

                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {suggestion.isDisruptionTriggered ? '✨ Adaptive Re-Discovery' : '✨ Slack-Time Discovery'}
                          </span>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {Math.round(suggestion.slackWindow.durationMinutes / 60)}h free
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mb-3">
                          {suggestion.reason}
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                          {suggestion.experiences.slice(0, 3).map((exp) => (
                            <div
                              key={exp.id}
                              className="flex-shrink-0 w-56 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/30 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-sm">{exp.category === 'heritage' ? '🏛️' : exp.category === 'food-walk' ? '🍛' : exp.category === 'adventure' ? '🏄' : exp.category === 'wellness' ? '🧘' : '🎯'}</span>
                                <h5 className="text-xs font-medium line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {exp.title}
                                </h5>
                              </div>
                              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                                <span>{exp.durationMinutes} min</span>
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">₹{exp.cost}</span>
                                <span className="flex items-center gap-0.5">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  {exp.rating}
                                </span>
                              </div>
                              {exp.isHidden && (
                                <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 font-medium">
                                  💎 Hidden Gem
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

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Trip Graph Mini Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5"
            >
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[var(--primary)]" />
                Trip Dependency Graph
              </h3>
              <div className="space-y-2">
                {sortedNodes.slice(0, 8).map((node, i) => {
                  const impact = isNodeImpacted(node.id);
                  return (
                    <div key={node.id} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                          node.status === 'cancelled'
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                            : impact
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 impact-wave'
                            : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {node.icon}
                      </div>
                      <div className="flex-1 text-xs truncate">{node.title}</div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          node.status === 'cancelled'
                            ? 'bg-red-500'
                            : impact
                            ? 'bg-red-500'
                            : riskColors[node.riskLevel]
                        }`}
                      />
                      {i < sortedNodes.slice(0, 8).length - 1 && (
                        <div className="absolute right-4" />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Connection lines (simplified) */}
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                  <span>{currentTrip.nodes.length} nodes</span>
                  <span>{currentTrip.edges.length} dependencies</span>
                </div>
              </div>
            </motion.div>

            {/* Recovery Options Panel */}
            <AnimatePresence>
              {showRecoveryPanel && recoveryOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-5 border-indigo-500/20"
                >
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Recovery Plans
                  </h3>
                  <div className="space-y-3">
                    {recoveryOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => selectRecovery(option)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          selectedRecovery?.id === option.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 glow-primary'
                            : 'border-[var(--border)] hover:border-indigo-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {option.recommended && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold">
                                RECOMMENDED
                              </span>
                            )}
                            <span className="text-sm font-medium">{option.title}</span>
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)]">
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
                            <span className="text-emerald-700 dark:text-emerald-400">
                              ↩ ₹{option.refundAmount.toLocaleString()} refund
                            </span>
                          )}
                          <span className="text-[var(--text-tertiary)] font-normal">
                            {option.confidenceScore}% confidence
                          </span>
                        </div>
                        {/* Pros/Cons */}
                        {selectedRecovery?.id === option.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-[var(--border)]"
                          >
                            <div className="space-y-1">
                              {option.pros.map((pro, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {pro}
                                </div>
                              ))}
                              {option.cons.map((con, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
                                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {con}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedRecovery && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => {
                        applyRecovery();
                        setShowRecoveryPanel(false);
                      }}
                      className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                    >
                      Apply &quot;{selectedRecovery.title}&quot; Recovery
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Risk Overview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5"
            >
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Risk Weather Radar
              </h3>
              <div className="space-y-2.5">
                {sortedNodes
                  .filter((n) => n.status !== 'cancelled')
                  .slice(0, 6)
                  .map((node) => (
                    <div key={node.id} className="flex items-center gap-3">
                      <span className="text-sm">{node.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate">{node.title}</div>
                        <div className="w-full h-1.5 rounded-full bg-[var(--surface-2)] mt-1">
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
                      <span className="text-xs text-[var(--text-tertiary)] w-8 text-right">
                        {node.riskScore}
                      </span>
                    </div>
                  ))}
              </div>
              {currentTrip.nodes.some((n) => n.riskFactors.length > 0) && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="text-xs text-[var(--text-tertiary)]">
                    ⚡ Risk factors:{' '}
                    {currentTrip.nodes
                      .flatMap((n) => n.riskFactors)
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .join(', ')}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5"
            >
              <h3 className="text-sm font-semibold mb-4">Trip Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                  <div className="text-xs text-[var(--text-tertiary)]">Activities</div>
                  <div className="text-lg font-bold">{currentTrip.nodes.filter((n) => n.status !== 'cancelled').length}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                  <div className="text-xs text-[var(--text-tertiary)]">Free Gaps</div>
                  <div className="text-lg font-bold">{slackWindows.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                  <div className="text-xs text-[var(--text-tertiary)]">Budget Left</div>
                  <div className="text-lg font-bold text-emerald-400">
                    ₹{(currentTrip.budget - currentTrip.totalCost).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                  <div className="text-xs text-[var(--text-tertiary)]">Risk Score</div>
                  <div className="text-lg font-bold text-amber-400">
                    {Math.round(
                      currentTrip.nodes.reduce((s, n) => s + n.riskScore, 0) / currentTrip.nodes.length
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
