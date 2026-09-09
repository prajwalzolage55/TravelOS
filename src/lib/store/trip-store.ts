// ============================================
// TravelOS — Zustand Store (State Management)
// ============================================

import { create } from 'zustand';
import {
  Trip,
  TripNode,
  Disruption,
  ImpactedNode,
  RecoveryOption,
  SlackWindow,
  DiscoverySuggestion,
  Experience,
  ChatMessage,
  User,
  OperatorTour,
} from '@/lib/utils/types';
import { TripGraph } from '@/lib/graph/TripGraph';
import { sampleGoaTrip, sampleDisruptions, operatorTrips } from '@/lib/data/sample-trips';
import { goaExperiences, matchExperiencesToSlackWindow } from '@/lib/data/experiences';

interface TripStore {
  // User
  currentUser: User | null;
  setUser: (user: User) => void;

  // Trip State
  currentTrip: Trip;
  graph: TripGraph;
  setTrip: (trip: Trip) => void;

  // Disruption State
  activeDisruption: Disruption | null;
  impactedNodes: ImpactedNode[];
  recoveryOptions: RecoveryOption[];
  selectedRecovery: RecoveryOption | null;
  isDisruptionAnimating: boolean;

  // Discovery State
  slackWindows: SlackWindow[];
  discoverySuggestions: DiscoverySuggestion[];
  allExperiences: Experience[];

  // Operator State
  operatorTours: OperatorTour[];

  // Chat State
  chatMessages: ChatMessage[];
  isChatOpen: boolean;

  // UI State
  activeView: 'traveler' | 'operator' | 'provider';
  currentPage: string;

  // Actions
  triggerDisruption: (disruption: Disruption) => void;
  selectRecovery: (option: RecoveryOption) => void;
  applyRecovery: () => void;
  resetDisruption: () => void;
  detectSlackWindows: () => void;
  generateDiscoverySuggestions: () => void;
  addChatMessage: (message: ChatMessage) => void;
  toggleChat: () => void;
  setActiveView: (view: 'traveler' | 'operator' | 'provider') => void;
  setCurrentPage: (page: string) => void;
  updateNodeRisk: (nodeId: string, riskScore: number, riskLevel: 'low' | 'medium' | 'high', factors: string[]) => void;
}

export const useTripStore = create<TripStore>((set, get) => {
  const initialGraph = new TripGraph(sampleGoaTrip);

  return {
    // Initial State
    currentUser: null,
    currentTrip: sampleGoaTrip,
    graph: initialGraph,
    activeDisruption: null,
    impactedNodes: [],
    recoveryOptions: [],
    selectedRecovery: null,
    isDisruptionAnimating: false,
    slackWindows: [],
    discoverySuggestions: [],
    allExperiences: goaExperiences,
    operatorTours: operatorTrips.map((trip, i) => ({
      id: `tour-${i}`,
      tripId: trip.id,
      trip,
      overallStatus: i === 0 ? 'on-track' : i === 1 ? 'at-risk' : 'on-track',
      activeDisruptions: i === 1 ? [sampleDisruptions[2]] : [],
      pendingRecoveries: [],
      lastUpdated: new Date().toISOString(),
    })) as OperatorTour[],
    chatMessages: [],
    isChatOpen: false,
    activeView: 'traveler',
    currentPage: 'dashboard',

    // Actions
    setUser: (user) => set({ currentUser: user }),

    setTrip: (trip) => {
      const graph = new TripGraph(trip);
      set({ currentTrip: trip, graph });
    },

    triggerDisruption: (disruption) => {
      const { graph, currentTrip, operatorTours } = get();

      // Propagate impact through graph
      const impacted = graph.propagateDisruption(disruption);

      // Generate recovery options
      const options = graph.generateRecoveryOptions(disruption, impacted);

      // Update operator tour status
      const updatedTours = operatorTours.map((tour) => {
        if (tour.tripId === currentTrip.id) {
          return {
            ...tour,
            overallStatus: 'disrupted' as const,
            activeDisruptions: [disruption],
            pendingRecoveries: options,
            lastUpdated: new Date().toISOString(),
          };
        }
        return tour;
      });

      set({
        activeDisruption: disruption,
        impactedNodes: impacted,
        recoveryOptions: options,
        isDisruptionAnimating: true,
        operatorTours: updatedTours,
      });

      // Stop animation after 3 seconds
      setTimeout(() => {
        set({ isDisruptionAnimating: false });
      }, 3000);
    },

    selectRecovery: (option) => set({ selectedRecovery: option }),

    applyRecovery: () => {
      const { selectedRecovery, currentTrip, operatorTours } = get();
      if (!selectedRecovery) return;

      // Apply recovery changes to trip nodes
      const updatedNodes = [...currentTrip.nodes];
      for (const change of selectedRecovery.changes) {
        const idx = updatedNodes.findIndex((n) => n.id === change.originalNodeId);
        if (idx === -1) continue;

        switch (change.action) {
          case 'cancel':
            updatedNodes[idx] = { ...updatedNodes[idx], status: 'cancelled' };
            break;
          case 'reschedule':
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              ...change.newDetails,
              status: 'rebooked',
            };
            break;
          case 'replace':
            updatedNodes[idx] = {
              ...updatedNodes[idx],
              ...change.newDetails,
              status: 'rebooked',
              cost: updatedNodes[idx].cost + change.costDelta,
            };
            break;
          case 'keep':
            // No change needed
            break;
        }
      }

      const updatedTrip: Trip = {
        ...currentTrip,
        nodes: updatedNodes,
        status: 'active',
        totalCost: updatedNodes.reduce((sum, n) => (n.status !== 'cancelled' ? sum + n.cost : sum), 0),
      };

      const newGraph = new TripGraph(updatedTrip);

      // Update operator tours
      const updatedTours = operatorTours.map((tour) => {
        if (tour.tripId === currentTrip.id) {
          return {
            ...tour,
            overallStatus: 'at-risk' as const, // amber after recovery applied
            activeDisruptions: [],
            pendingRecoveries: [],
            lastUpdated: new Date().toISOString(),
          };
        }
        return tour;
      });

      set({
        currentTrip: updatedTrip,
        graph: newGraph,
        activeDisruption: null,
        impactedNodes: [],
        recoveryOptions: [],
        selectedRecovery: null,
        operatorTours: updatedTours,
      });

      // After recovery, detect new slack windows and suggest experiences
      setTimeout(() => {
        get().detectSlackWindows();
        get().generateDiscoverySuggestions();
      }, 500);
    },

    resetDisruption: () => {
      const newGraph = new TripGraph(sampleGoaTrip);
      set({
        currentTrip: sampleGoaTrip,
        graph: newGraph,
        activeDisruption: null,
        impactedNodes: [],
        recoveryOptions: [],
        selectedRecovery: null,
        isDisruptionAnimating: false,
        slackWindows: [],
        discoverySuggestions: [],
      });
    },

    detectSlackWindows: () => {
      const { graph } = get();
      const windows = graph.detectSlackWindows(60); // min 60 min gaps
      set({ slackWindows: windows });
    },

    generateDiscoverySuggestions: () => {
      const { slackWindows, allExperiences, currentTrip, activeDisruption } = get();
      const suggestions: DiscoverySuggestion[] = [];

      for (const window of slackWindows) {
        const matched = matchExperiencesToSlackWindow(
          allExperiences,
          window.durationMinutes,
          window.location.lat,
          window.location.lng,
          window.budget,
          currentTrip.groupType
        );

        if (matched.length > 0) {
          suggestions.push({
            slackWindow: window,
            experiences: matched,
            reason:
              activeDisruption
                ? `Your ${activeDisruption.title.toLowerCase()} created a ${Math.round(window.durationMinutes / 60)}-hour free window. Here are experiences that fit perfectly!`
                : `You have a ${Math.round(window.durationMinutes / 60)}-hour free window between activities. How about trying something local?`,
            isDisruptionTriggered: !!activeDisruption,
          });
        }
      }

      set({ discoverySuggestions: suggestions });
    },

    addChatMessage: (message) => {
      set((state) => ({
        chatMessages: [...state.chatMessages, message],
      }));
    },

    toggleChat: () => {
      set((state) => ({ isChatOpen: !state.isChatOpen }));
    },

    setActiveView: (view) => set({ activeView: view }),
    setCurrentPage: (page) => set({ currentPage: page }),

    updateNodeRisk: (nodeId, riskScore, riskLevel, factors) => {
      const { currentTrip } = get();
      const updatedNodes = currentTrip.nodes.map((n) =>
        n.id === nodeId ? { ...n, riskScore, riskLevel, riskFactors: factors } : n
      );
      set({
        currentTrip: { ...currentTrip, nodes: updatedNodes },
      });
    },
  };
});
