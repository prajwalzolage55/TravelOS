'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  Filter,
  Sparkles,
  Heart,
  ExternalLink,
  CheckCircle,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const categories = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'adventure', label: 'Adventure', emoji: '🏄' },
  { id: 'food-walk', label: 'Food Walk', emoji: '🍛' },
  { id: 'heritage', label: 'Heritage', emoji: '🏛️' },
  { id: 'cultural', label: 'Cultural', emoji: '🎭' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'workshop', label: 'Workshop', emoji: '🎨' },
  { id: 'local-cuisine', label: 'Local Cuisine', emoji: '🍳' },
  { id: 'water-sports', label: 'Water Sports', emoji: '🏊' },
];

export default function DiscoverPage() {
  const { allExperiences } = useTripStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedExp, setSelectedExp] = useState<string | null>(null);
  const [savedExps, setSavedExps] = useState<Set<string>>(new Set());

  const filteredExperiences = useMemo(() => {
    return allExperiences.filter((exp) => {
      const matchesCategory = activeCategory === 'all' || exp.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allExperiences, activeCategory, searchQuery]);

  const selectedExperience = allExperiences.find((e) => e.id === selectedExp);

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
            <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            Discover Experiences
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container-custom py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-2">
            Discover <span className="gradient-text-warm">Hidden Gems</span> in Goa
          </h1>
          <p className="text-[var(--text-secondary)]">
            Curated local experiences matched to your travel style. Skip the tourist traps.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search experiences, tags, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExperiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden group cursor-pointer hover:border-[var(--primary)]/30 transition-all"
              onClick={() => setSelectedExp(exp.id)}
            >
              {/* Image/Visual area */}
              <div className="h-36 bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-3)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="text-5xl transform group-hover:scale-110 transition-transform">
                  {categoryEmoji[exp.category] || '🎯'}
                </span>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {exp.isHidden && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/80 text-white backdrop-blur-sm">
                      💎 Hidden Gem
                    </span>
                  )}
                </div>

                {/* Save button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSavedExps((prev) => {
                      const next = new Set(prev);
                      if (next.has(exp.id)) next.delete(exp.id);
                      else next.add(exp.id);
                      return next;
                    });
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      savedExps.has(exp.id) ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>

                {/* Bottom info on image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/40 text-white backdrop-blur-sm">
                    {exp.location.area}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-black/40 text-white backdrop-blur-sm">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {exp.rating} ({exp.reviewCount})
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1 group-hover:text-[var(--primary)] transition-colors">
                  {exp.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
                  {exp.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exp.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {exp.groupTypes.length} types
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {exp.cost}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredExperiences.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
            <h3 className="text-sm font-medium mb-1">No experiences found</h3>
            <p className="text-xs text-[var(--text-tertiary)]">Try a different search or category</p>
          </div>
        )}
      </div>

      {/* Experience Detail Modal */}
      <AnimatePresence>
        {selectedExperience && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedExp(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-lg w-full max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="h-44 bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-3)] flex items-center justify-center relative">
                <span className="text-6xl">
                  {categoryEmoji[selectedExperience.category] || '🎯'}
                </span>
                <button
                  onClick={() => setSelectedExp(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60"
                >
                  <X className="w-4 h-4" />
                </button>
                {selectedExperience.isHidden && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/80 text-white">
                    💎 Hidden Gem
                  </span>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedExperience.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedExperience.location.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {selectedExperience.rating} ({selectedExperience.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                      <IndianRupee className="w-5 h-5" />
                      {selectedExperience.cost}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">per person</div>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  {selectedExperience.description}
                </p>

                {/* Info grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-[var(--text-tertiary)]" />
                    <div className="text-xs font-medium">
                      {selectedExperience.durationMinutes} min
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">Duration</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-[var(--text-tertiary)]" />
                    <div className="text-xs font-medium">
                      {selectedExperience.availability[0]?.maxGroupSize || '—'}
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">Max Group</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] text-center">
                    <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Verified</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">Provider</div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-[var(--text-tertiary)] mb-2">
                    HIGHLIGHTS
                  </h4>
                  <div className="space-y-1.5">
                    {selectedExperience.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Provider */}
                <div className="p-3 rounded-xl bg-[var(--surface-2)] mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                    {selectedExperience.provider.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{selectedExperience.provider.name}</div>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {selectedExperience.provider.rating}
                      {selectedExperience.provider.verified && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium ml-1">✓ Verified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selectedExperience.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs bg-[var(--surface-2)] text-[var(--text-secondary)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
                  Add to Trip ✨
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
