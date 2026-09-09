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
    icon: <Zap className="w-6 h-6 text-indigo-500" />,
    title: 'Trip Dependency Graph',
    description:
      'Your trip modelled as an intelligent directed acyclic graph — flights, luxury villas, transfers, and activities linked by temporal and logistical constraints.',
    color: 'from-indigo-500 to-purple-500',
    glow: 'rgba(99, 102, 241, 0.25)',
  },
  {
    icon: <Shield className="w-6 h-6 text-red-500" />,
    title: 'Self-Healing Engine',
    description:
      'Flight delayed by 4 hours? TravelOS propagates ripple effects through your graph and generates ranked, Pareto-optimal recovery plans in seconds.',
    color: 'from-red-500 to-orange-500',
    glow: 'rgba(239, 68, 68, 0.25)',
  },
  {
    icon: <Compass className="w-6 h-6 text-emerald-500" />,
    title: 'Slack-Time Discovery',
    description:
      'Unlocks hidden 3-hour gaps in your schedule by auto-recommending curated local culinary trails, heritage walks, and sunset points matching your taste profile.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(6, 214, 160, 0.25)',
  },
  {
    icon: <Navigation className="w-6 h-6 text-cyan-500" />,
    title: 'Google Satellite Radar',
    description:
      'High-resolution satellite view tracking GPS locations of all itinerary stops, airport connections, and multi-tour operator fleets with live telemetry.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6, 182, 212, 0.25)',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-pink-500" />,
    title: 'Adaptive Re-Discovery',
    description:
      'Turn disruptions into unforgettable moments — if rough seas cancel scuba diving, the system instantly swaps in an exclusive spice plantation lunch.',
    color: 'from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.25)',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
    title: 'Operator Command Center',
    description:
      'Tour operators manage dozens of concurrent traveler itineraries with Green / Amber / Red status beacons, automated refund handling, and live radar.',
    color: 'from-amber-500 to-yellow-500',
    glow: 'rgba(245, 158, 11, 0.25)',
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
    icon: '🏨',
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
    icon: '✈️',
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
    icon: '🤿',
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
    icon: '⛵',
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
    icon: '🌿',
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)] tracking-tight">
              Travel<span className="gradient-text">OS</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Enterprise 2026
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-[var(--primary)] transition-colors">
            Graph Engine
          </a>
          <a href="#satellite-radar" className="hover:text-[var(--primary)] transition-colors">
            Satellite Radar
          </a>
          <a href="#destinations" className="hover:text-[var(--primary)] transition-colors">
            Goa Curations
          </a>
          <Link href="/discover" className="hover:text-pink-500 transition-colors">
            Discover
          </Link>
          <Link href="/operator" className="hover:text-cyan-500 transition-colors">
            Operator View
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 text-white text-xs sm:text-sm font-bold hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105"
          >
            Launch Experience →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container-custom pt-16 sm:pt-24 pb-20 sm:pb-28">
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-secondary)] mb-6 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous Self-Healing Travel Architecture · Live Satellite Telemetry</span>
          </motion.div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-[family-name:var(--font-display)] leading-[1.1] mb-6">
            Your Itinerary is a <br />
            <span className="gradient-text">Living Graph</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Move beyond static PDFs and disjointed booking emails. TravelOS transforms travel into an intelligent network that{' '}
            <span className="text-[var(--foreground)] font-semibold">discovers hidden local gaps</span>,{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">tracks stops on high-res satellite radar</span>, and{' '}
            <span className="text-red-500 font-semibold">heals itself autonomously</span> when delays strike.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 text-white font-bold text-base hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Launch Traveler Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/operator"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-semibold text-base hover:border-indigo-500 hover:bg-[var(--surface-2)] transition-all duration-300 shadow-xs w-full sm:w-auto"
            >
              <BarChart3 className="w-5 h-5 text-cyan-500" />
              Operator Command Center
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-pink-500/30 bg-pink-500/5 text-pink-600 dark:text-pink-400 font-semibold text-base hover:bg-pink-500/10 transition-all duration-300 w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              Explore Goa Curations
            </Link>
          </div>
        </motion.div>

        {/* Hero Interactive Visual Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          <div className="relative glass-card p-4 sm:p-6 rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden bg-slate-950/40">
            {/* Top Bar simulating luxury TravelOS browser HUD */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-[var(--text-tertiary)] ml-2">
                  travelos://live.telemetry.goa/flight-del-goi
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Satellite Telemetry Active (15.4989°N, 73.8278°E)
              </div>
            </div>

            {/* Three Showcase Floating Panels */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Card 1: Airline Boarding Pass */}
              <div className="glass-card p-4 rounded-2xl border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Flight Component
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-bold">
                    6E-2341
                  </span>
                </div>
                <div className="flex items-center justify-between my-2">
                  <div>
                    <div className="text-xl font-bold font-mono">DEL</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">New Delhi T3</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[var(--text-tertiary)]">2h 30m</span>
                    <Plane className="w-4 h-4 text-blue-500" />
                    <span className="text-[9px] text-emerald-500 font-bold">On Radar</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono">GOI</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">Goa Dabolim</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Seat: 4A (Priority)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gate 14 Confirmed</span>
                </div>
              </div>

              {/* Card 2: Luxury Taj Resort */}
              <div className="glass-card p-4 rounded-2xl border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Luxury Accommodation
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                    5★ Verified
                  </span>
                </div>
                <div className="flex items-center gap-3 my-2">
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300&auto=format&fit=crop"
                    alt="Taj Exotica"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm">Taj Exotica Resort</h4>
                    <p className="text-xs text-[var(--text-tertiary)]">Benaulim Beachfront Villa</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Check-in: 14:00</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Butler Assigned</span>
                </div>
              </div>

              {/* Card 3: Autonomous Self-Healing */}
              <div className="glass-card p-4 rounded-2xl border-red-500/30 bg-gradient-to-br from-red-500/10 to-amber-500/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Graph Self-Healing
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-bold">
                    ⚡ Auto-Resolved
                  </span>
                </div>
                <div className="my-1.5">
                  <div className="text-xs font-bold text-[var(--foreground)]">IndiGo Delay +4h Mitigated</div>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                    Taxi automatically rescheduled. Dinner reservation shifted to 20:30. ₹0 penalty incurred.
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[11px] text-[var(--text-secondary)]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Saved: ₹3,500</span>
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)]">Confidence: 94%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SATELLITE RADAR INTERACTIVE DEMO ON HOME PAGE */}
      <section id="satellite-radar" className="relative z-10 container-custom py-20 border-t border-[var(--border)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-3">
            <Navigation className="w-3.5 h-3.5" /> High-Resolution Google Satellite & Aerial Radar
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-display)] mb-3">
            Real-Time <span className="gradient-text">Geographic Telemetry</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
            Interact with the Goa satellite radar below. Switch map layers, pan across coastal coordinates, and click stops to inspect telemetry.
          </p>
        </motion.div>

        {/* Live Satellite Map on Landing Page */}
        <div className="glass-card p-3 sm:p-4 rounded-3xl overflow-hidden shadow-2xl border-indigo-500/20 max-w-5xl mx-auto">
          <SatelliteMap
            points={previewMapPoints}
            selectedPointId={selectedPointId}
            onPointSelect={(p) => setSelectedPointId(p ? p.id : null)}
            height="500px"
            title="Goa Luxury Travel Corridor — Live Satellite & Aerial Navigation"
          />
        </div>
      </section>

      {/* CURATED LUXURY DESTINATIONS SHOWCASE */}
      <section id="destinations" className="relative z-10 container-custom py-20 border-t border-[var(--border)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Goa Destinations
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
              Curated by <span className="gradient-text-warm">Cultural Insiders</span>
            </h2>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-pink-600 dark:text-pink-400 hover:underline"
          >
            Explore all 12 Goa experiences <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinationsShowcase.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="h-44 relative overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-md">
                  {item.tag}
                </span>
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white drop-shadow-sm">
                  {item.cost}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-500" />
                  {item.area}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* THREE SUPERPOWERS FEATURE GRID */}
      <section id="features" className="relative z-10 container-custom py-24 border-t border-[var(--border)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-display)] mb-4">
            One Core Graph. <span className="gradient-text">Complete Autonomous Control.</span>
          </h2>
          <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto">
            Every booking, constraint, and provider contract is linked. We plan it, monitor it from orbit, and heal it when life happens.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6 rounded-2xl group hover:border-indigo-500/30 transition-all duration-300 shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 container-custom py-20 border-t border-[var(--border)] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-10 sm:p-14 rounded-3xl border border-indigo-500/30 shadow-2xl bg-gradient-to-b from-indigo-500/5 to-purple-500/5 max-w-4xl mx-auto"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-4">
            Ready for Demo
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-display)] mb-4">
            Experience the Future of Travel Operations
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
            Pre-loaded with a full Goa luxury itinerary. Test flight delays, watch self-healing recovery, explore satellite telemetry, and discover local gems.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:scale-105 transition-all"
            >
              Launch Traveler Concierge →
            </Link>
            <Link
              href="/operator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-semibold text-base hover:bg-[var(--surface-2)] transition-all"
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
