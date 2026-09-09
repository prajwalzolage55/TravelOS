// ============================================
// TravelOS — Core Type Definitions
// ============================================

// ---------- Trip Graph Types ----------

export type NodeType = 'flight' | 'hotel' | 'transfer' | 'activity' | 'restaurant' | 'event';
export type RiskLevel = 'low' | 'medium' | 'high';
export type TripStatus = 'planning' | 'booked' | 'active' | 'completed' | 'disrupted';
export type DependencyType = 'hard' | 'soft' | 'temporal';

export interface TripNode {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  cost: number;
  currency: string;
  provider: string;
  // Cancellation & refund
  cancellationPolicy: 'free' | 'partial' | 'non-refundable';
  refundPercentage: number;
  refundWindowHours: number;
  // Risk
  riskLevel: RiskLevel;
  riskScore: number; // 0–100
  riskFactors: string[];
  // Status
  status: 'confirmed' | 'at-risk' | 'disrupted' | 'cancelled' | 'rebooked';
  // Metadata
  icon: string;
  image?: string;
  details: Record<string, string>; // e.g. flightNumber, hotelName, etc.
}

export interface TripEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  dependencyType: DependencyType;
  timeBufferMinutes: number; // buffer between source.end and target.start
  riskPropagation: number;  // 0–1, how much risk propagates (1 = full impact)
  label?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  travelerName: string;
  travelerAvatar?: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  totalCost: number;
  status: TripStatus;
  groupType: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  preferences: TravelerPreferences;
  nodes: TripNode[];
  edges: TripEdge[];
}

// ---------- Disruption Types ----------

export interface Disruption {
  id: string;
  nodeId: string;
  type: 'delay' | 'cancellation' | 'weather' | 'strike' | 'overbooking';
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  delayMinutes?: number;
  timestamp: string;
}

export interface ImpactedNode {
  nodeId: string;
  node: TripNode;
  impactType: 'delayed' | 'at-risk' | 'needs-rebooking' | 'cancelled';
  delayMinutes: number;
  costImpact: number;
  propagationDepth: number; // how many hops from the disrupted node
  explanation: string;
}

export interface RecoveryOption {
  id: string;
  title: string;
  description: string;
  changes: RecoveryChange[];
  totalCostDelta: number;      // positive = more expensive
  totalTimeDelta: number;       // positive = more time used
  refundAmount: number;
  confidenceScore: number;      // 0–100
  rationale: string;            // LLM-generated explanation
  pros: string[];
  cons: string[];
  rank: number;
  recommended: boolean;
}

export interface RecoveryChange {
  originalNodeId: string;
  action: 'keep' | 'reschedule' | 'replace' | 'cancel';
  newDetails?: Partial<TripNode>;
  costDelta: number;
  explanation: string;
}

// ---------- Discovery / Experience Types ----------

export interface Experience {
  id: string;
  title: string;
  description: string;
  category: ExperienceCategory;
  location: {
    name: string;
    lat: number;
    lng: number;
    area: string;
  };
  durationMinutes: number;
  cost: number;
  currency: string;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
  groupTypes: ('solo' | 'couple' | 'family' | 'friends' | 'business')[];
  availability: AvailabilityWindow[];
  provider: {
    name: string;
    verified: boolean;
    rating: number;
  };
  highlights: string[];
  isHidden: boolean; // hidden gem flag
}

export type ExperienceCategory =
  | 'food-walk'
  | 'adventure'
  | 'cultural'
  | 'nature'
  | 'nightlife'
  | 'shopping'
  | 'wellness'
  | 'workshop'
  | 'photography'
  | 'water-sports'
  | 'heritage'
  | 'local-cuisine';

export interface AvailabilityWindow {
  dayOfWeek: number[]; // 0=Sun, 6=Sat
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  minDurationMinutes: number;
  maxDurationMinutes: number;
  maxGroupSize: number;
  priceRange: { min: number; max: number };
}

export interface SlackWindow {
  startTime: string; // ISO
  endTime: string;   // ISO
  durationMinutes: number;
  location: { name: string; lat: number; lng: number };
  afterNodeId: string;
  beforeNodeId: string;
  budget: number; // remaining
}

export interface DiscoverySuggestion {
  slackWindow: SlackWindow;
  experiences: Experience[];
  reason: string; // why this was suggested
  isDisruptionTriggered: boolean; // adaptive re-discovery
}

// ---------- User / Preference Types ----------

export interface TravelerPreferences {
  interests: ExperienceCategory[];
  budgetTier: 'budget' | 'mid-range' | 'premium';
  pacePreference: 'relaxed' | 'moderate' | 'packed';
  dietaryRestrictions?: string[];
  mobilityConstraints?: boolean;
  preferredLanguages: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'traveler' | 'operator' | 'provider';
  avatar?: string;
}

// ---------- Operator Types ----------

export interface OperatorTour {
  id: string;
  tripId: string;
  trip: Trip;
  operatorNotes?: string;
  overallStatus: 'on-track' | 'at-risk' | 'disrupted';
  activeDisruptions: Disruption[];
  pendingRecoveries: RecoveryOption[];
  lastUpdated: string;
}

// ---------- Provider Types ----------

export interface ProviderListing {
  id: string;
  providerId: string;
  experience: Experience;
  status: 'active' | 'paused' | 'draft';
  bookingCount: number;
  revenue: number;
  slackCompatibility: {
    idealDurationRange: { min: number; max: number };
    idealGroupTypes: string[];
    idealBudgetTier: string;
  };
}

// ---------- Weather / Risk Types ----------

export interface WeatherData {
  location: string;
  date: string;
  condition: string;
  temperature: number;
  rainProbability: number;
  windSpeed: number;
  icon: string;
  riskContribution: number; // 0–100
}

// ---------- Chat Types ----------

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relatedNodeIds?: string[];
}
