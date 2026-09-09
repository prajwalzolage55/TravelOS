'use client';

import { useState } from 'react';
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
  Activity,
  IndianRupee,
  Zap,
  RefreshCcw,
  Search,
  Filter,
  Bell,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';
import { ThemeToggle } from '@/components/ThemeToggle';

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

export default function OperatorPage() {
  const { operatorTours, currentTrip, activeDisruption } = useTripStore();
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Build operator tours list including current trip status
  const allTours = operatorTours.map((tour) => {
    if (tour.tripId === currentTrip.id) {
      return {
        ...tour,
        trip: currentTrip,
        overallStatus: activeDisruption
          ? ('disrupted' as const)
          : tour.overallStatus,
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

  const selectedTour = allTours.find((t) => t.id === selectedTourId);

  return (
    <div className="min-h-screen bg-[var(--background)] bg-grid">
      {/* Navigation */}
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
          <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Operator Command Center
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Traveler View
          </Link>
          <ThemeToggle />
          <button className="relative w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
            <Bell className="w-4 h-4" />
            {stats.disrupted > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {stats.disrupted}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="container-custom py-6">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <button
            onClick={() => setFilter('all')}
            className={`glass-card p-4 hover:border-[var(--primary)]/30 transition-all cursor-pointer ${
              filter === 'all' ? 'border-[var(--primary)]/50' : ''
            }`}
          >
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Total Tours</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </button>
          <button
            onClick={() => setFilter('on-track')}
            className={`glass-card p-4 hover:border-emerald-500/30 transition-all cursor-pointer ${
              filter === 'on-track' ? 'border-emerald-500/50' : ''
            }`}
          >
            <div className="text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              On Track
            </div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.onTrack}</div>
          </button>
          <button
            onClick={() => setFilter('at-risk')}
            className={`glass-card p-4 hover:border-amber-500/30 transition-all cursor-pointer ${
              filter === 'at-risk' ? 'border-amber-500/50' : ''
            }`}
          >
            <div className="text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              At Risk
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.atRisk}</div>
          </button>
          <button
            onClick={() => setFilter('disrupted')}
            className={`glass-card p-4 hover:border-red-500/30 transition-all cursor-pointer ${
              filter === 'disrupted' ? 'border-red-500/50' : ''
            }`}
          >
            <div className="text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Disrupted
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.disrupted}</div>
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tour Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-display)]">
                Active Tours
              </h2>
              <span className="text-xs text-[var(--text-tertiary)]">
                {filteredTours.length} tours
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredTours.map((tour, i) => {
                const status = statusConfig[tour.overallStatus];
                return (
                  <motion.button
                    key={tour.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedTourId(tour.id)}
                    className={`glass-card p-5 text-left transition-all hover:scale-[1.02] ${
                      selectedTourId === tour.id
                        ? `${status.borderColor} glow-${
                            tour.overallStatus === 'on-track'
                              ? 'accent'
                              : tour.overallStatus === 'disrupted'
                              ? 'danger'
                              : 'primary'
                          }`
                        : 'hover:border-[var(--primary)]/20'
                    }`}
                  >
                    {/* Status indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {format(new Date(tour.lastUpdated), 'h:mm a')}
                      </span>
                    </div>

                    {/* Tour info */}
                    <h3 className="font-semibold text-sm mb-1">{tour.trip.name}</h3>
                    <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        {tour.trip.travelerName}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        {tour.trip.destination}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {format(new Date(tour.trip.startDate), 'MMM d')} —{' '}
                        {format(new Date(tour.trip.endDate), 'MMM d')}
                      </div>
                    </div>

                    {/* Mini graph status bar */}
                    <div className="flex gap-1 mt-3">
                      {tour.trip.nodes.slice(0, 10).map((node) => (
                        <div
                          key={node.id}
                          className={`flex-1 h-2 rounded-full ${
                            node.status === 'cancelled'
                              ? 'bg-red-500'
                              : node.status === 'rebooked'
                              ? 'bg-amber-500'
                              : node.riskLevel === 'high'
                              ? 'bg-red-500/60'
                              : node.riskLevel === 'medium'
                              ? 'bg-amber-500/60'
                              : 'bg-emerald-500/60'
                          }`}
                          title={node.title}
                        />
                      ))}
                    </div>

                    {/* Disruption alert */}
                    {tour.activeDisruptions.length > 0 && (
                      <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                        ⚠️ {tour.activeDisruptions[0].title}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Tour Detail */}
          <div>
            <AnimatePresence mode="wait">
              {selectedTour ? (
                <motion.div
                  key={selectedTour.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card p-5 sticky top-20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Tour Details</h3>
                    <button
                      onClick={() => setSelectedTourId(null)}
                      className="text-xs text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Tour header */}
                    <div>
                      <h4 className="font-bold">{selectedTour.trip.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {selectedTour.trip.travelerName} • {selectedTour.trip.groupType}
                      </p>
                    </div>

                    {/* Status */}
                    <div
                      className={`p-3 rounded-xl ${
                        statusConfig[selectedTour.overallStatus].bgColor
                      } ${statusConfig[selectedTour.overallStatus].borderColor} border`}
                    >
                      <div className="flex items-center gap-2">
                        {statusConfig[selectedTour.overallStatus].icon}
                        <span
                          className={`text-sm font-medium ${
                            statusConfig[selectedTour.overallStatus].textColor
                          }`}
                        >
                          {statusConfig[selectedTour.overallStatus].label}
                        </span>
                      </div>
                    </div>

                    {/* Node list */}
                    <div>
                      <div className="text-xs font-medium text-[var(--text-tertiary)] mb-2">
                        ITINERARY ({selectedTour.trip.nodes.length} items)
                      </div>
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {selectedTour.trip.nodes
                          .sort(
                            (a, b) =>
                              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                          )
                          .map((node) => (
                            <div
                              key={node.id}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                            >
                              <span className="text-sm">{node.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs truncate">{node.title}</div>
                                <div className="text-[10px] text-[var(--text-tertiary)]">
                                  {format(new Date(node.startTime), 'h:mm a')}
                                </div>
                              </div>
                              <div
                                className={`w-2 h-2 rounded-full ${
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
                              />
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="p-3 rounded-xl bg-[var(--surface-2)]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-tertiary)]">Total Cost</span>
                        <span className="font-bold flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {selectedTour.trip.totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Pending recovery */}
                    {selectedTour.pendingRecoveries.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-[var(--text-tertiary)] mb-2">
                          PENDING RECOVERY PLANS
                        </div>
                        {selectedTour.pendingRecoveries.map((option) => (
                          <div
                            key={option.id}
                            className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 mb-2"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">{option.title}</span>
                              {option.recommended && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium">
                                  REC
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)]">
                              {option.description}
                            </p>
                            <button className="mt-2 w-full py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors">
                              Approve
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href="/dashboard"
                        className="flex-1 py-2 rounded-xl bg-[var(--surface-2)] text-center text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-3)] transition-colors"
                      >
                        View Full Trip
                      </Link>
                      <button className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-center text-xs text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                        Contact Traveler
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-8 text-center"
                >
                  <Eye className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
                  <h3 className="text-sm font-medium mb-1">Select a Tour</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Click on any tour card to view details and manage recovery plans.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
