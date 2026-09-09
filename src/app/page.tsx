'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Trip Dependency Graph',
    description:
      'Your trip as a living network — every flight, hotel, and activity connected by smart dependencies.',
    color: 'from-indigo-500 to-purple-500',
    glow: 'rgba(99, 102, 241, 0.3)',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Self-Healing Itinerary',
    description:
      'Flight delayed? The system detects ripple effects and generates ranked recovery plans in seconds.',
    color: 'from-red-500 to-orange-500',
    glow: 'rgba(239, 68, 68, 0.3)',
  },
  {
    icon: <Compass className="w-6 h-6" />,
    title: 'Slack-Time Discovery',
    description:
      'Found a 3-hour gap? We auto-suggest local hidden gems that fit your time, budget, and interests.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(6, 214, 160, 0.3)',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Risk Weather Radar',
    description:
      'See live risk scores on every booking — weather, delays, provider reliability — before anything breaks.',
    color: 'from-amber-500 to-yellow-500',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Adaptive Re-Discovery',
    description:
      'Disruptions create opportunities — cancelled scuba? We suggest a waterfall trek that fits the new gap.',
    color: 'from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.3)',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Operator Command Center',
    description:
      'Tour operators manage 50 tours at once. One live dashboard. Green, Amber, Red. No more email chaos.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6, 182, 212, 0.3)',
  },
];

const lifecycleStages = [
  'Discover',
  'Personalize',
  'Plan',
  'Price',
  'Book',
  'Prepare',
  'Operate',
  'Assist',
  'Adapt',
  'Complete',
  'Review',
];

export default function LandingPage() {
  const [activeStage, setActiveStage] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % lifecycleStages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid opacity-50" />
      <div
        className="fixed w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-[family-name:var(--font-display)]">
            Travel<span className="gradient-text">OS</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a>
          <a href="#lifecycle" className="hover:text-[var(--primary)] transition-colors">Lifecycle</a>
          <a href="#demo" className="hover:text-[var(--primary)] transition-colors">Live Demo</a>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105"
          >
            Launch App →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container-custom pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-secondary)] mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Solving PS2 + PS6 + PS7 — One Unified Platform
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-display)] leading-tight mb-6">
            Your Itinerary is a
            <br />
            <span className="gradient-text">Living Graph</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            TravelOS turns a static itinerary into a living graph — one that{' '}
            <span className="text-[var(--accent)]">discovers what you&apos;ll love</span>, and{' '}
            <span className="text-[var(--danger-light)]">heals itself when things go wrong</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
            >
              Experience Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/operator"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-[var(--border)] text-[var(--foreground)] font-semibold text-lg hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--surface-2)] transition-all duration-300"
            >
              <BarChart3 className="w-5 h-5" />
              Operator Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Animated Lifecycle Ring */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-20 flex justify-center"
          id="lifecycle"
        >
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
            {lifecycleStages.map((stage, i) => (
              <motion.div
                key={stage}
                animate={{
                  scale: i === activeStage ? 1.15 : 1,
                  opacity: i === activeStage ? 1 : 0.5,
                }}
                transition={{ duration: 0.3 }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  i === activeStage
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                }`}
                onClick={() => setActiveStage(i)}
              >
                {stage}
                {i < lifecycleStages.length - 1 && (
                  <span className="ml-2 text-[var(--text-tertiary)]">→</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex justify-center mt-16"
        >
          <a href="#features" className="flex flex-col items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors">
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 container-custom py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-4">
            One Graph. <span className="gradient-text">Three Superpowers.</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Every trip is a dependency graph. We plan it, protect it, and enrich it — all from one data structure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card glass-card-hover p-6 cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Preview Section */}
      <section id="demo" className="relative z-10 container-custom py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-4">
            See the <span className="gradient-text-warm">Magic</span> in Action
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Watch how a simple flight delay cascades through your trip — and how TravelOS heals it instantly.
          </p>
        </motion.div>

        {/* Demo Steps */}
        <div className="max-w-4xl mx-auto">
          {[
            {
              step: '1',
              icon: <Plane className="w-5 h-5" />,
              title: 'Flight Delayed 4 Hours',
              desc: 'IndiGo 6E-2341 DEL→GOI delayed due to fog',
              color: 'border-red-500/30 bg-red-500/5 dark:bg-red-500/10',
              badge: 'DISRUPTION',
              badgeColor: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
            },
            {
              step: '2',
              icon: <Zap className="w-5 h-5" />,
              title: 'Impact Propagation',
              desc: 'Flight → Taxi missed → Late check-in → Dinner at risk → Cruise impossible',
              color: 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10',
              badge: 'RIPPLE EFFECT',
              badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
            },
            {
              step: '3',
              icon: <Shield className="w-5 h-5" />,
              title: '3 Recovery Plans Generated',
              desc: 'Minimal Changes (₹+1,200) • Budget Saver (₹-3,500 refund) • Time Keeper (₹+4,200)',
              color: 'border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10',
              badge: 'RECOVERY',
              badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
            },
            {
              step: '4',
              icon: <Compass className="w-5 h-5" />,
              title: 'New Experiences Discovered',
              desc: '4-hour airport gap → Airport Lounge + Fontainhas Heritage Walk suggested',
              color: 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10',
              badge: 'RE-DISCOVERY',
              badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-start gap-6 p-6 rounded-2xl border ${item.color} mb-4`}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] font-bold">
                {item.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  {item.icon} {item.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
          >
            Try It Now — Live Demo
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-[var(--text-tertiary)] text-sm mt-4">
            No sign-up required. Pre-loaded with a Goa trip.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8 px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>TravelOS — HackCelestial 2026</span>
          </div>
          <div className="flex items-center gap-1">
            Built with <span className="text-red-500">♥</span> for PS2 + PS6 + PS7
          </div>
        </div>
      </footer>
    </div>
  );
}
