'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Plane,
  Shield,
  Compass,
  Zap,
  ArrowRight,
  Globe,
  BarChart3,
  Sparkles,
  MapPin,
  Clock,
  ChevronDown,
  Users,
  Star,
  Navigation,
  Layers,
  CheckCircle,
  Hotel,
  IndianRupee,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SatelliteMap, MapPoint } from '@/components/SatelliteMap';

const features = [
  {
    icon: <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    title: 'Trip Dependency Graph',
    description:
      'Your trip modelled as an intelligent directed acyclic graph — flights, luxury villas, transfers, and activities linked by temporal and logistical constraints.',
  },
  {
    icon: <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    title: 'Self-Healing Engine',
    description:
      'Flight delayed by 4 hours? TravelOS propagates ripple effects through your graph and generates ranked, Pareto-optimal recovery plans in seconds.',
  },
  {
    icon: <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    title: 'Slack-Time Discovery',
    description:
      'Unlocks hidden 3-hour gaps in your schedule by auto-recommending curated local culinary trails, heritage walks, and sunset points matching your taste profile.',
  },
  {
    icon: <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    title: 'Google Satellite Radar',
    description:
      'High-resolution satellite view tracking GPS locations of all itinerary stops, airport connections, and multi-tour operator fleets with live telemetry.',
  },
  {
    icon: <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    title: 'Adaptive Re-Discovery',
    description:
      'Turn disruptions into unforgettable moments — if rough seas cancel scuba diving, the system instantly swaps in an exclusive spice plantation lunch.',
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    title: 'Operator Command Center',
    description:
      'Tour operators manage dozens of concurrent traveler itineraries with Green / Amber / Red status beacons, automated refund handling, and live radar.',
  },
];

const previewMapPoints: MapPoint[] = [
  {
    id: 'pt-1',
    title: 'Taj Exotica Resort & Spa',
    description: '5-Star Beachfront Luxury Villa in South Goa',
    lat: 15.2635,
    lng: 73.9312,
    type: 'hotel',
    cost: 32000,
    provider: 'Taj Hotels',
    icon: 'hotel',
    status: 'confirmed',
    riskLevel: 'low',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'pt-2',
    title: 'Dabolim International Airport (GOI)',
    description: 'Flight IndiGo 6E-2341 Arrival Terminal',
    lat: 15.3808,
    lng: 73.8313,
    type: 'flight',
    cost: 5500,
    provider: 'IndiGo Airlines',
    icon: 'plane',
    status: 'confirmed',
    riskLevel: 'low',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'pt-3',
    title: 'Grande Island Scuba Base',
    description: 'Ocean Diving & Coral Reef Exploration',
    lat: 15.3385,
    lng: 73.8603,
    type: 'activity',
    cost: 4500,
    provider: 'Dive Goa',
    icon: 'waves',
    status: 'confirmed',
    riskLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'pt-4',
    title: 'Mandovi Luxury Sunset Cruise',
    description: 'Private Catamaran with Live Goan Jazz',
    lat: 15.4989,
    lng: 73.8278,
    type: 'activity',
    cost: 2200,
    provider: 'Goa Tourism',
    icon: 'ship',
    status: 'confirmed',
    riskLevel: 'low',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'pt-5',
    title: 'Sahakari Organic Spice Farm',
    description: 'Traditional Ponda Spice Plantation & Feast',
    lat: 15.4026,
    lng: 74.0080,
    type: 'activity',
    cost: 800,
    provider: 'Sahakari Farm',
    icon: 'trees',
    status: 'confirmed',
    riskLevel: 'low',
    image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=600&auto=format&fit=crop',
  },
];

const destinationsShowcase = [
  {
    name: 'Taj Exotica Resort & Spa',
    area: 'Benaulim, South Goa',
    tag: '5-Star Luxury',
    cost: '₹32,000 / night',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Grande Island Coral Dives',
    area: 'Vasco Coast',
    tag: 'Marine Adventure',
    cost: '₹4,500 / person',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Fontainhas Latin Quarter',
    area: 'Panjim Heritage',
    tag: 'Cultural Heritage',
    cost: '₹1,200 / person',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Thalassa Sunset Lounge',
    area: 'Siolim Cliff',
    tag: 'Fine Dining & Sunset',
    cost: '₹3,500 / dinner',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
  },
];

export default function LandingPage() {
  const [selectedPointId, setSelectedPointId] = useState<string | null>('pt-1');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [simulationStage, setSimulationStage] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Professional self-healing live ticker cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationStage((prev) => (prev + 1) % 3);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />
      <div
        className="fixed w-[650px] h-[650px] rounded-full opacity-15 blur-[140px] pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          left: mousePos.x - 325,
          top: mousePos.y - 325,
        }}
      />

      {/* Top Header / Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 sm:px-10 py-4 glass-card border-b border-[var(--border)] rounded-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center shadow-md">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)] tracking-tight">
              Travel<span className="gradient-text">OS</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Enterprise 2026
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Graph Engine
          </a>
          <a href="#satellite-radar" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Satellite Radar
          </a>
          <a href="#destinations" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Goa Curations
          </a>
          <Link href="/discover" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Discover
          </Link>
          <Link href="/operator" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Operator View
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all duration-300 shadow-sm"
          >
            Launch Experience →
          </Link>
        </div>
      </nav>

      {/* Hero Section with Generous Vertical Padding */}
      <section className="relative z-10 container-custom pt-24 sm:pt-32 pb-28 sm:pb-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-secondary)] mb-8 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous Self-Healing Travel Architecture · Live Satellite Telemetry</span>
          </motion.div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-[family-name:var(--font-display)] leading-[1.1] mb-8 text-[var(--foreground)]">
            Your Itinerary is a <br />
            <span className="gradient-text">Living Graph</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Move beyond static PDFs and disjointed booking emails. TravelOS transforms travel into an intelligent network that{' '}
            <span className="text-[var(--foreground)] font-semibold">discovers hidden local gaps</span>,{' '}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">tracks stops on high-res satellite radar</span>, and{' '}
            <span className="text-[var(--foreground)] font-semibold">heals itself autonomously</span> when delays strike.
          </p>

          {/* CTAs - Clean solid colors, no funky rainbows */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-base transition-all duration-300 shadow-md hover:scale-[1.02] w-full sm:w-auto"
            >
              Launch Traveler Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/operator"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-semibold text-base hover:bg-[var(--surface-2)] transition-all duration-300 shadow-xs w-full sm:w-auto"
            >
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Operator Command Center
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-semibold text-base hover:bg-[var(--surface-2)] transition-all duration-300 shadow-xs w-full sm:w-auto"
            >
              <Compass className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Explore Goa Curations
            </Link>
          </div>
        </motion.div>

        {/* Hero Interactive Visual Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="relative glass-card p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
            {/* Top Bar simulating luxury TravelOS browser HUD */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-xs font-mono text-[var(--text-tertiary)] ml-2">
                  travelos://live.telemetry.goa/flight-del-goi
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Satellite Telemetry Active (15.4989°N, 73.8278°E)
              </div>
            </div>

            {/* Three Showcase Floating Panels with Micro-Animations */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Card 1: Airline Boarding Pass with Animated Radar Path */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-gradient-to-b dark:from-slate-800/80 dark:to-slate-900/80 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Flight Component
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold border border-slate-200 dark:border-slate-700">
                    6E-2341
                  </span>
                </div>
                <div className="flex items-center justify-between my-2">
                  <div>
                    <div className="text-xl font-bold font-mono">DEL</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">New Delhi T3</div>
                  </div>
                  <div className="flex flex-col items-center relative w-24">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">2h 30m</span>
                    {/* Animated Flight Path Line with Traveling Beacon */}
                    <div className="relative w-full flex items-center justify-center my-1 h-4">
                      <div className="w-full h-[1px] border-b border-dashed border-blue-400/60 dark:border-blue-500/60" />
                      <motion.div
                        animate={{ x: [-28, 28] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute"
                      >
                        <Plane className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 rotate-90" />
                      </motion.div>
                    </div>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      On Radar
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono">GOI</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">Goa Dabolim</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--border)] flex justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Seat: 4A (Priority)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gate 14 Confirmed</span>
                </div>
              </motion.div>

              {/* Card 2: Luxury Taj Resort with Gentle Floating Elevation */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-gradient-to-b dark:from-slate-800/80 dark:to-slate-900/80 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Luxury Accommodation
                  </span>
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" /> 5★ Verified
                  </span>
                </div>
                <div className="flex items-center gap-3 my-2">
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300&auto=format&fit=crop"
                    alt="Taj Exotica"
                    className="w-12 h-12 rounded-xl object-cover shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=300&auto=format&fit=crop';
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-sm">Taj Exotica Resort</h4>
                    <p className="text-xs text-[var(--text-tertiary)]">Benaulim Beachfront Villa</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--border)] flex justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Check-in: 14:00</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Butler Assigned</span>
                </div>
              </motion.div>

              {/* Card 3: Autonomous Self-Healing with Live Animated Simulation Ticker */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-gradient-to-b dark:from-slate-800/80 dark:to-slate-900/80 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              >
                {/* Glowing status bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Self-Healing Engine
                  </span>
                  <AnimatePresence mode="wait">
                    {simulationStage === 0 && (
                      <motion.span
                        key="badge-0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/30"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        Delay Alert
                      </motion.span>
                    )}
                    {simulationStage === 1 && (
                      <motion.span
                        key="badge-1"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30"
                      >
                        <Zap className="w-2.5 h-2.5 animate-spin" />
                        Graph Rerouting
                      </motion.span>
                    )}
                    {simulationStage === 2 && (
                      <motion.span
                        key="badge-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30"
                      >
                        <CheckCircle className="w-2.5 h-2.5" />
                        Auto-Resolved
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={simulationStage}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="my-1.5 min-h-[50px]"
                  >
                    {simulationStage === 0 && (
                      <>
                        <div className="text-xs font-bold text-red-600 dark:text-red-400">
                          IndiGo Delay +4h Detected
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                          Downstream taxi transfer and fine-dining reservation invalidated by ripple delay.
                        </p>
                      </>
                    )}
                    {simulationStage === 1 && (
                      <>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          Evaluating Optimal Pareto Path
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                          Searching temporal slack windows. Rebooking transport with zero penalty fees.
                        </p>
                      </>
                    )}
                    {simulationStage === 2 && (
                      <>
                        <div className="text-xs font-bold text-[var(--foreground)]">
                          Schedule Rebalanced Seamlessly
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                          Taxi rescheduled. Sunset dinner shifted to 20:30. Full itinerary restored.
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="pt-3 border-t border-[var(--border)] flex justify-between text-[11px] text-[var(--text-secondary)]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {simulationStage === 2 ? 'Saved: ₹3,500' : simulationStage === 1 ? 'Confidence: 98%' : 'Risk: High'}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                    Autonomous Engine
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SATELLITE RADAR INTERACTIVE DEMO ON HOME PAGE */}
      <section id="satellite-radar" className="relative z-10 container-custom py-28 sm:py-36 border-t border-[var(--border)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 mb-4 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">12 ORBITERS LOCKED</span>
            <span className="text-slate-400">·</span>
            <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>High-Resolution Google Satellite & Aerial Radar</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-display)] mb-4 text-[var(--foreground)]">
            Real-Time <span className="gradient-text">Geographic Telemetry</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Interact with the Goa satellite radar below. Switch map layers, pan across coastal coordinates, and click stops to inspect telemetry.
          </p>
        </motion.div>

        {/* Live Satellite Map on Landing Page with Elevated Frame */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-3 sm:p-4 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 max-w-5xl mx-auto"
        >
          <SatelliteMap
            points={previewMapPoints}
            selectedPointId={selectedPointId}
            onPointSelect={(p) => setSelectedPointId(p ? p.id : null)}
            height="520px"
            title="Goa Luxury Travel Corridor — Live Satellite & Aerial Navigation"
          />
        </motion.div>
      </section>

      {/* CURATED LUXURY DESTINATIONS SHOWCASE */}
      <section id="destinations" className="relative z-10 container-custom py-28 sm:py-36 border-t border-[var(--border)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Handpicked Goa Destinations
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--foreground)]">
              Curated by <span className="gradient-text">Cultural Insiders</span>
            </h2>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:gap-3 transition-all"
          >
            Explore all 12 Goa experiences <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinationsShowcase.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="glass-card rounded-2xl overflow-hidden group shadow-md hover:shadow-2xl border border-slate-200/80 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 cursor-pointer"
            >
              <div className="h-44 relative overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                  {item.tag}
                </span>
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white drop-shadow-sm">
                  {item.cost}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-sm line-clamp-1 text-[var(--foreground)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {item.area}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* THREE SUPERPOWERS FEATURE GRID - With Clear Spacing & Staggered Reveal */}
      <section id="features" className="relative z-10 container-custom py-28 sm:py-36 border-t border-[var(--border)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-display)] mb-4 text-[var(--foreground)]">
            One Core Graph. <span className="gradient-text">Complete Autonomous Control.</span>
          </h2>
          <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Every booking, constraint, and provider contract is linked. We plan it, monitor it from orbit, and heal it when life happens.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="glass-card p-7 sm:p-8 rounded-2xl group transition-all duration-300 border border-slate-200/80 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-400/50 shadow-md hover:shadow-xl cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 border border-blue-200/80 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold mb-2 text-[var(--foreground)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA - Generous breathing room & solid enterprise styling */}
      <section className="relative z-10 container-custom py-28 sm:py-36 my-16 border-t border-[var(--border)] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 sm:p-16 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:to-slate-950/95 max-w-4xl mx-auto relative overflow-hidden"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-5 shadow-xs">
            Ready for Demo
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-display)] mb-4 text-[var(--foreground)]">
            Experience the Future of Travel Operations
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
            Pre-loaded with a full Goa luxury itinerary. Test flight delays, watch self-healing recovery, explore satellite telemetry, and discover local gems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-base shadow-md hover:scale-[1.02] transition-all"
            >
              Launch Traveler Concierge →
            </Link>
            <Link
              href="/operator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
            >
              Open Operator Command Center
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8 px-8 glass-card rounded-none">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-[var(--foreground)]">TravelOS</span>
            <span>— Autonomous Travel Operating System</span>
          </div>
          <div>Built with Next.js 15, Turbopack, Framer Motion & Google Satellite Aerial Telemetry</div>
        </div>
      </footer>
    </div>
  );
}
