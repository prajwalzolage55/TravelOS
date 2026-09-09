'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTripStore } from '@/lib/store/trip-store';
import {
  Globe,
  MapPin,
  Clock,
  Star,
  IndianRupee,
  Users,
  ArrowLeft,
  Plus,
  Edit,
  Eye,
  BarChart3,
  TrendingUp,
  Calendar,
  Tag,
  CheckCircle,
  Pause,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ProviderPage() {
  const { allExperiences } = useTripStore();
  const [selectedExp, setSelectedExp] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Mock provider stats
  const stats = {
    totalListings: allExperiences.length,
    activeListings: allExperiences.length - 2,
    totalBookings: 847,
    revenue: 284500,
    avgRating: 4.6,
  };

  const categoryEmoji: Record<string, string> = {
    'food-walk': '🍛',
    adventure: '🏄',
    cultural: '🎭',
    nature: '🌿',
    nightlife: '🌙',
    shopping: '🛍️',
    wellness: '🧘',
    workshop: '🎨',
    photography: '📸',
    'water-sports': '🏊',
    heritage: '🏛️',
    'local-cuisine': '🍳',
  };

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
            <MapPin className="w-4 h-4 text-emerald-400" />
            Provider Portal
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
        </div>
      </nav>

      <div className="container-custom py-6">
        {/* Provider Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
        >
          <div className="glass-card p-4">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Total Listings</div>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Active</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activeListings}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Bookings</div>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Revenue</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <IndianRupee className="w-4 h-4" />
              {(stats.revenue / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Avg Rating</div>
            <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" />
              {stats.avgRating}
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-[family-name:var(--font-display)]">
            My Experience Listings
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add Listing
          </button>
        </div>

        {/* New Listing Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card p-6 mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">Create New Experience</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Experience Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sunset Kayaking Tour"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">Category</label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                  <option>Adventure</option>
                  <option>Food Walk</option>
                  <option>Cultural</option>
                  <option>Heritage</option>
                  <option>Wellness</option>
                  <option>Workshop</option>
                  <option>Nature</option>
                  <option>Water Sports</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  placeholder="120"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">Price (₹)</label>
                <input
                  type="number"
                  placeholder="1500"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Description
                </label>
                <textarea
                  placeholder="Describe your experience..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Slack Compatibility Section */}
              <div className="md:col-span-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Slack-Time Compatibility (Auto-Matching)
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mb-3">
                  Define when your experience works best — our AI will auto-match travelers who have
                  free time that fits your availability.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-[var(--text-tertiary)] mb-1 block">
                      Ideal Duration Range (min)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="90"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-xs text-[var(--text-tertiary)]">to</span>
                      <input
                        type="number"
                        placeholder="150"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-tertiary)] mb-1 block">
                      Group Types
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Solo', 'Couple', 'Family', 'Friends'].map((type) => (
                        <button
                          key={type}
                          className="px-2.5 py-1 rounded-full text-[10px] border border-[var(--border)] hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-tertiary)] mb-1 block">
                      Budget Tier
                    </label>
                    <div className="flex gap-1.5">
                      {['Budget', 'Mid', 'Premium'].map((tier) => (
                        <button
                          key={tier}
                          className="px-2.5 py-1 rounded-full text-[10px] border border-[var(--border)] hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
                Publish Listing
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Listings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allExperiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card glass-card-hover overflow-hidden cursor-pointer group"
              onClick={() => setSelectedExp(selectedExp === exp.id ? null : exp.id)}
            >
              {/* Color header based on category */}
              <div className="h-24 bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-3)] flex items-center justify-center text-4xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="transform group-hover:scale-125 transition-transform">
                  {categoryEmoji[exp.category] || '🎯'}
                </span>
                {exp.isHidden && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                    💎 Hidden Gem
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm line-clamp-1">{exp.title}</h3>
                  <span className="flex items-center gap-0.5 text-xs text-amber-500 flex-shrink-0">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {exp.rating}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
                  {exp.description}
                </p>

                <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exp.durationMinutes} min
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {exp.cost}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {exp.location.area}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {exp.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--surface-2)] text-[var(--text-tertiary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Expanded detail */}
                {selectedExp === exp.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-[var(--border)]"
                  >
                    <div className="text-xs text-[var(--text-tertiary)] mb-2">HIGHLIGHTS</div>
                    <div className="space-y-1">
                      {exp.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
                          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                          {h}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-[var(--text-tertiary)]">
                      <span className="font-medium">Slack Compatibility:</span>{' '}
                      {exp.availability[0]?.minDurationMinutes}–
                      {exp.availability[0]?.maxDurationMinutes} min window, max{' '}
                      {exp.availability[0]?.maxGroupSize} people
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs">
                      <span className="text-[var(--text-tertiary)]">Suitable for:</span>
                      {exp.groupTypes.map((g) => (
                        <span
                          key={g}
                          className="px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px]"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
