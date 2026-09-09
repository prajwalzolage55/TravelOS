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
  Layers,
  Navigation,
  Maximize2,
  Compass,
  Check,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SatelliteMap, MapPoint } from '@/components/SatelliteMap';

const categories = [
  { id: 'all', label: 'All Curations', emoji: '✨' },
  { id: 'adventure', label: 'Adventure', emoji: '🏄' },
  { id: 'food-walk', label: 'Culinary Trails', emoji: '🍛' },
  { id: 'heritage', label: 'Heritage', emoji: '🏛️' },
  { id: 'cultural', label: 'Cultural', emoji: '🎭' },
  { id: 'nature', label: 'Nature & Spice', emoji: '🌿' },
  { id: 'wellness', label: 'Wellness & Yoga', emoji: '🧘' },
  { id: 'workshop', label: 'Art & Craft', emoji: '🎨' },
  { id: 'water-sports', label: 'Ocean & Dive', emoji: '🏊' },
];

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

export default function DiscoverPage() {
  const { allExperiences } = useTripStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedExp, setSelectedExp] = useState<string | null>(null);
  const [savedExps, setSavedExps] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'split' | 'map'>('grid');
  const [addedToTrip, setAddedToTrip] = useState<string | null>(null);

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

  // Convert experiences to MapPoint[] for SatelliteMap
  const experienceMapPoints: MapPoint[] = useMemo(() => {
    return filteredExperiences.map((exp) => ({
      id: exp.id,
      title: exp.title,
      description: exp.description,
      lat: exp.location.lat,
      lng: exp.location.lng,
      type: 'experience' as const,
      cost: exp.cost,
      provider: exp.provider.name,
      status: 'confirmed',
      riskLevel: 'low',
      icon: categoryEmoji[exp.category] || '📍',
      image: exp.images?.[0],
    }));
  }, [filteredExperiences]);

  const handlePointSelect = (point: MapPoint | null) => {
    if (point) {
      setSelectedExp(point.id);
      const el = document.getElementById(`exp-card-${point.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAddToTrip = (id: string) => {
    setAddedToTrip(id);
    setTimeout(() => setAddedToTrip(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] bg-grid">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-[var(--border)] rounded-none px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-[family-name:var(--font-display)] tracking-tight">
              Travel<span className="gradient-text">OS</span>
            </span>
          </Link>
          <span className="text-[var(--text-tertiary)] text-sm">|</span>
          <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            Curated Experiences
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container-custom py-6">
        {/* Header with Title & View Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Handcrafted Local Goa Expeditions
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] mb-1">
              Discover <span className="gradient-text-warm">Authentic Goa</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Curated by local cultural insiders and marine biologists. Zero tourist traps.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)] self-start md:self-auto shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-pink-500" />
              Gallery Grid
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Split Explorer
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-500" />
              Satellite Radar
            </button>
          </div>
        </motion.div>

        {/* Search & Category Filter Bar */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search secret beaches, Portuguese architecture walks, ocean diving, feni tastings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] border border-[var(--border)]'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FULL SATELLITE MAP VIEW */}
        {viewMode === 'map' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 mb-8"
          >
            <div className="glass-card p-3 rounded-2xl overflow-hidden shadow-xl border-indigo-500/20">
              <SatelliteMap
                points={experienceMapPoints}
                selectedPointId={selectedExp}
                onPointSelect={handlePointSelect}
                height="640px"
                title="Interactive Goa Experience Radar — Satellite Aerial Navigation"
              />
            </div>
          </motion.div>
        )}

        {/* SPLIT VIEW (Cards + Satellite Map) */}
        {viewMode === 'split' && (
          <div className="grid lg:grid-cols-12 gap-6 mb-8 items-start">
            {/* Left: Cards List */}
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                Showing {filteredExperiences.length} curated destinations
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredExperiences.map((exp, i) =>
                  renderExperienceCard(exp, i, selectedExp, setSelectedExp, savedExps, setSavedExps)
                )}
              </div>
            </div>

            {/* Right: Sticky Satellite Map */}
            <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-3">
              <div className="glass-card p-3 rounded-2xl overflow-hidden shadow-xl border-indigo-500/20">
                <SatelliteMap
                  points={experienceMapPoints}
                  selectedPointId={selectedExp}
                  onPointSelect={handlePointSelect}
                  height="600px"
                />
              </div>
            </div>
          </div>
        )}

        {/* GALLERY GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredExperiences.map((exp, i) =>
              renderExperienceCard(exp, i, selectedExp, setSelectedExp, savedExps, setSavedExps)
            )}
          </div>
        )}

        {filteredExperiences.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
            <h3 className="text-sm font-medium mb-1">No experiences found</h3>
            <p className="text-xs text-[var(--text-tertiary)]">Try a different search query or filter category.</p>
          </div>
        )}
      </div>

      {/* Luxury Experience Detail Modal */}
      <AnimatePresence>
        {selectedExperience && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedExp(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border-indigo-500/30"
            >
              {/* Photo Hero Banner */}
              <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-slate-900">
                {selectedExperience.images && selectedExperience.images[0] ? (
                  <img
                    src={selectedExperience.images[0]}
                    alt={selectedExperience.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {categoryEmoji[selectedExperience.category] || '🎯'}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Close button */}
                <button
                  onClick={() => setSelectedExp(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors shadow-md"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {selectedExperience.isHidden && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600/90 text-white backdrop-blur-md shadow-sm">
                      💎 Hidden Gem
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md uppercase tracking-wider">
                    {selectedExperience.category}
                  </span>
                </div>

                {/* Bottom title overlay */}
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] drop-shadow-md">
                    {selectedExperience.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-white/80 mt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {selectedExperience.location.name}, {selectedExperience.location.area}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {selectedExperience.rating} ({selectedExperience.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Price & Summary */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                      Experience Fee
                    </span>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <IndianRupee className="w-5 h-5" />
                      {selectedExperience.cost.toLocaleString()}
                      <span className="text-xs text-[var(--text-secondary)] font-normal">/ guest</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                      GPS Satellite Coordinates
                    </span>
                    <div className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {selectedExperience.location.lat.toFixed(4)}° N, {selectedExperience.location.lng.toFixed(4)}° E
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {selectedExperience.description}
                </p>

                {/* Key Spec Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                    <div className="text-xs font-bold">{selectedExperience.durationMinutes} min</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">Duration</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                    <div className="text-xs font-bold">
                      Max {selectedExperience.availability[0]?.maxGroupSize || 8}
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">Intimate Group</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] text-center">
                    <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <div className="text-xs font-bold text-emerald-600">100% Guaranteed</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">Zero-Overbooking</div>
                  </div>
                </div>

                {/* Highlights List */}
                {selectedExperience.highlights && selectedExperience.highlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[var(--text-tertiary)] tracking-wider mb-2.5">
                      Curated Highlights
                    </h4>
                    <div className="space-y-2">
                      {selectedExperience.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] font-medium">
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Local Provider Card */}
                <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                      {selectedExperience.provider.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{selectedExperience.provider.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-[var(--foreground)]">
                          {selectedExperience.provider.rating}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Verified Local Operator
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  onClick={() => handleAddToTrip(selectedExperience.id)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                    addedToTrip === selectedExperience.id
                      ? 'bg-emerald-600 shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 hover:opacity-95 shadow-indigo-500/25'
                  }`}
                >
                  {addedToTrip === selectedExperience.id ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Your Living Graph!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Add to Itinerary & Auto-Recalculate Graph
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- HELPER CARD RENDERER ----------
function renderExperienceCard(
  exp: any,
  i: number,
  selectedExp: string | null,
  setSelectedExp: (id: string | null) => void,
  savedExps: Set<string>,
  setSavedExps: React.Dispatch<React.SetStateAction<Set<string>>>
) {
  const isSelected = selectedExp === exp.id;
  const isSaved = savedExps.has(exp.id);

  return (
    <motion.div
      id={`exp-card-${exp.id}`}
      key={exp.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className={`glass-card overflow-hidden group cursor-pointer transition-all duration-300 rounded-2xl ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
          : 'hover:border-indigo-500/30 shadow-xs'
      }`}
      onClick={() => setSelectedExp(exp.id)}
    >
      {/* High-res Photo Container */}
      <div className="h-48 bg-slate-900 relative overflow-hidden">
        {exp.images && exp.images.length > 0 ? (
          <img
            src={exp.images[0]}
            alt={exp.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {categoryEmoji[exp.category] || '🎯'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {exp.isHidden && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/90 text-white backdrop-blur-md shadow-xs">
              💎 Hidden Gem
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-md uppercase tracking-wider">
            {exp.category}
          </span>
        </div>

        {/* Save/Favorite button */}
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
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors shadow-xs"
        >
          <Heart
            className={`w-4 h-4 ${
              isSaved ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>

        {/* Bottom meta bar on image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-semibold drop-shadow-md flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-400" />
            {exp.location.area}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {exp.rating} ({exp.reviewCount})
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-bold text-base mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {exp.title}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 leading-relaxed">
          {exp.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
          <div className="text-[var(--text-tertiary)] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{exp.durationMinutes} min</span>
          </div>

          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <IndianRupee className="w-3.5 h-3.5" />
            {exp.cost.toLocaleString()}
            <span className="text-[10px] font-normal text-[var(--text-tertiary)]">/ person</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
